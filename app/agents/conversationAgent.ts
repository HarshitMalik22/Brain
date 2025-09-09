import { ChatGroq } from "@langchain/groq";
import { HumanMessage } from "@langchain/core/messages";

const STEPS =[
    "What do you want to learn?",
    "What's your current skill level? (Beginner, Intermediate, Advanced)",
    "How much time do you have to prepare?",
    "What's your end goal? (eg. job, competition, hobby)",
    "Should I include resource links?(yes/no)"
];

export interface ChatContext {
    step: number;
    topic?: string;
    level?: string;
    duration?: string;
    goal?: string;
    withResources?: boolean;
}

export class ConversationAgent {
    private context: ChatContext;
    private llm: ChatGroq;

    constructor() {
        this.context = {
            step: 0
        };
        this.llm = new ChatGroq({
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            apiKey: process.env.GROQ_API_KEY
        });
    }

    private isComplete(): boolean{
        return this.context.step >= STEPS.length;
    }

    private getNextQuestion(): string | null {
        return this.context.step < STEPS.length ? STEPS[this.context.step] : null;
    }

    private buildPrompt(): string {
        const { topic, level, duration, goal, withResources } = this.context;
        
        return `
        Create a personalized learning roadmap for the following:
        Topic: ${topic}
        Skill Level: ${level}
        Duration: ${duration}
        Goal: ${goal}
        Include Resources: ${withResources ? "Yes": "No"}
        
        Respond with a clear step-by-step plan broken down into modules. Include context and suggested duration for each module.
    `.trim();
    }
    private updateContext(input: string): void {
        switch (this.context.step) {
            case 0:
               this.context.topic = input.trim();
               break;
            case 1:
               this.context.level = input.trim();
               break;
            case 2:
               this.context.duration = input.trim();
               break;
            case 3:
               this.context.goal = input.trim();
               break;
            case 4:
               this.context.withResources = input.trim().toLowerCase() === "yes";
               break;
        }
        this.context.step += 1;
    }

    public async process(input: string): Promise<string> {
        this.updateContext(input);
    
        if (this.isComplete()) {
          const prompt = this.buildPrompt();
          const res = await this.llm.invoke([new HumanMessage(prompt)]);
          return res.content;
        }
    
        return this.getNextQuestion()!;
      }
    }