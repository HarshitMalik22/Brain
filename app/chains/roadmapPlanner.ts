import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const createRoadmapPlanner = () => {
    const prompt = ChatPromptTemplate.fromMessages([
        ["system", "You are a helpful AI curriculum assistant"],
        ["user", "{input}"],
    ]);

    const model = new ChatGroq({
        model: "llama-3.1-8b-instant",  // Using a production model
        temperature: 0.7,
        apiKey: process.env.GROQ_API_KEY
    });
    
    const chain: RunnableSequence<any, any> = prompt.pipe(model);
    return chain;
};

const testChain = async () => {
    const chain = createRoadmapPlanner();
    const response = await chain.invoke({
        input: "Create a learning path for React.js"
    });
    console.log(response.content);
}
testChain().catch(console.error);