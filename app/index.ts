import { buildRoadmapAgent } from "./agents/roadmapGraph";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const agent = buildRoadmapAgent();

const run = async () => {
    try {
        // Initialize the agent with a topic
        const initialState = await agent.initialize('AI Agent Development');
        
        console.log('🚀 Initialized roadmap:');
        console.log(`📌 Topic: ${initialState.topic}`);
        console.log(`📊 Total Steps: ${initialState.totalSteps}`);
        
        // Display first module
        console.log('\n🧠 Current Module:');
        console.log(initialState.currentModule);
        
        // Show progress
        const progress = agent.getProgress(initialState);
        console.log(`\n📈 Progress: ${progress.current}/${progress.total} (${progress.percentage}%)`);
        
        // Example: Move to next module
        const nextState = agent.next(initialState);
        if (!nextState.isComplete) {
            console.log('\n➡️ Next Module:');
            console.log(nextState.currentModule);
            
            const newProgress = agent.getProgress(nextState);
            console.log(`\n📈 New Progress: ${newProgress.current}/${newProgress.total} (${newProgress.percentage}%)`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

run();