import { ChatOpenAI } from "@langchain/openai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    model: "gpt-3.5-turbo",
    temperature: 0.7,
});

import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const messages = [
    new SystemMessage("Give one word answers"),
    new HumanMessage("what is the most asked dsa topic in interviews"),
]

const response = await model.invoke(messages);  
console.log('Response:', response.content);