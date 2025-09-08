import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

export const createRoadmapPlanner = () => {
    const prompt = ChatPromptTemplate.fromMessages([
        ["system", "You are a helpful AI curriculum assistant"],
        ["user", "{input}"],
    ]);

    const model = new ChatOpenAI({
        modelName: "gpt-3.5",
        temperature: 0.7,
    });

    const chain: RunnableSequence<any, any> = prompt.pipe(model);
    return chain;
};