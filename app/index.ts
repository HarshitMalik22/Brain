import { ConversationAgent } from "./agents/conversationAgent";
import readline from "readline";

// Setup CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (question: string): Promise<string> =>
  new Promise(resolve => rl.question(question, resolve));

// Run the chatbot loop
const run = async () => {
  const agent = new ConversationAgent();
  console.log("🤖 Welcome! I’ll guide you through a custom learning path.");

  while (true) {
    const userInput = await ask("👤 You: ");
    const response = await agent.process(userInput);
    console.log(`🤖 ${response}`);
  }
};

run();
