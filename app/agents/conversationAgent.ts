import { ChatGroq } from "@langchain/groq";
import { HumanMessage } from "@langchain/core/messages";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { ChatOpenAI } from "@langchain/openai";
// Get the directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
// Step-by-step interactive onboarding like Leeco
const STEPS = [
  "Hi! I can help you master any topic by building a personalized learning path. What do you want to learn?",
  "Great. What's your current skill level? (Beginner, Intermediate, Advanced)",
  "How much time can you dedicate to learning each week?",
  "What’s your preferred learning style? (Videos, Text, Projects, Quizzes, Mixed)",
  "Would you prefer a daily or weekly learning cadence?",
  "What’s your end goal? (e.g., job, certification, personal growth)",
  "Should I include resource links? (yes/no)"
];

type AgentPhase = "collecting" | "roadmap_ready" | "follow_up";

// This keeps track of all user answers and current phase
export interface ChatContext {
  step: number;
  topic?: string;
  level?: string;
  duration?: string;
  learningStyle?: string;
  cadence?: string;
  goal?: string;
  withResources?: boolean;
}

// The main AI agent class
export class ConversationAgent {
  private context: ChatContext;
  private phase: AgentPhase = "collecting";
  private roadmap: string = "";
  private llm: ChatGroq;

  constructor() {
    this.context = { step: 0 };
    this.llm = new ChatGroq({
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      apiKey: process.env.GROQ_API_KEY
    });
  }

  // Check if all intake questions are answered
  private isComplete(): boolean {
    return this.context.step >= STEPS.length;
  }

  // Get the next onboarding question
  private getNextQuestion(): string | null {
    return this.context.step < STEPS.length ? STEPS[this.context.step] : null;
  }

  // Generate a full roadmap prompt using all user inputs
  private buildPrompt(): string {
    const { topic, level, duration, learningStyle, cadence, goal, withResources } = this.context;

    return `
You are an AI coach. Design a milestone-based, personalized learning roadmap for:

- Topic: ${topic}
- Level: ${level}
- Time: ${duration}/week
- Style: ${learningStyle}
- Cadence: ${cadence}
- Goal: ${goal}
- Include links: ${withResources ? "Yes" : "No"}

Each module should include:
- Title
- Learning objective
- 2–3 top resource links
- Estimated effort
- Quiz or project idea

End with a motivational message and say: “Type 'start over' to generate a new path.”
`.trim();
  }

  // Capture user input based on which step we're on
  private updateContext(input: string): void {
    const val = input.trim();
    switch (this.context.step) {
      case 0: this.context.topic = val; break;
      case 1: this.context.level = val; break;
      case 2: this.context.duration = val; break;
      case 3: this.context.learningStyle = val; break;
      case 4: this.context.cadence = val; break;
      case 5: this.context.goal = val; break;
      case 6: this.context.withResources = val.toLowerCase().includes("yes"); break;
    }
    this.context.step += 1;
  }

  // Main handler for each user message
  public async process(input: string): Promise<string> {
    // Restart the assistant from scratch
    if (input.toLowerCase().includes("start over")) {
      this.context = { step: 0 };
      this.phase = "collecting";
      return this.getNextQuestion()!;
    }

    // First phase: Ask onboarding questions
    if (this.phase === "collecting") {
      this.updateContext(input);
      if (this.isComplete()) {
        const prompt = this.buildPrompt();
        const res = await this.llm.invoke([new HumanMessage(prompt)]);
        this.roadmap = res.content;
        this.phase = "follow_up";
        return res.content + "\n\n💡 You can now ask me questions about this plan.";
      }
      return this.getNextQuestion()!;
    }

    // Follow-up phase after roadmap is created
    if (this.phase === "follow_up") {
      const followupPrompt = `
You are an AI tutor. Based on the user's roadmap:

${this.roadmap}

Answer this question: "${input}"

If unclear, ask for clarification.
`.trim();

      const res = await this.llm.invoke([new HumanMessage(followupPrompt)]);
      return res.content;
    }

    return "🤖 Unexpected state.";
  }
}
