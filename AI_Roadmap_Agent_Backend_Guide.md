# 🧠 AI Roadmap Generator Agent (LangChain.js + LangGraph.js + TypeScript)

This project is a **backend-only AI agent**, built with **LangChain.js**, **LangGraph.js**, and **TypeScript**, inspired by Leeco's learning roadmap tool.

It takes a user input like `"AI Agent Development"` and returns a structured, multi-level learning roadmap with modules, resources, and progress tracking. This is built entirely in TypeScript and can be connected to any frontend or used as a service.

---

## ✅ Core Features

- AI roadmap generator based on user goal/topic
- Built with LangChain.js & LangGraph.js (TypeScript)
- Structured learning path: Beginner → Intermediate → Advanced
- Modular design for future integrations (RAG, n8n, frontend)
- Optional support for user progress tracking

---

## 🛠 Tech Stack

| Layer      | Tech                         |
|-----------|------------------------------|
| Language   | TypeScript                   |
| AI Models  | OpenAI / Groq (via API)      |
| Agent Flow | LangGraph.js                 |
| LLM Logic  | LangChain.js                 |
| Storage    | JSON / Supabase (optional)   |
| Retrieval  | ChromaDB (optional RAG)      |

---

## 📁 Folder Structure

```
leeco-ai-agent/
├── agents/
│   └── roadmapGraph.ts         # LangGraph agent
├── chains/
│   └── roadmapPlanner.ts       # LangChain prompt → LLM chain
├── rag/
│   └── vectorRetriever.ts      # RAG setup (optional)
├── db/
│   └── store.ts                # User progress (optional)
├── prompts/
│   └── roadmapPrompt.ts        # Prompt templates
├── types/
│   └── roadmap.ts              # Type declarations
├── index.ts                    # Entry point for testing
├── .env                        # API keys
└── package.json
```

---

## 🚀 Step-by-Step Setup

### 1. Install Dependencies

```bash
npm init -y
npm install dotenv langchain @langchain/community @langchain/core @langchain/langgraph
```

---

### 2. Create `.env`

```
OPENAI_API_KEY=sk-xxxxxx
# or
GROQ_API_KEY=your-key-here
```

---

### 3. Prompt Template (`prompts/roadmapPrompt.ts`)

```ts
export const getRoadmapPrompt = (topic: string) => `
You are an expert curriculum planner.

Create a detailed learning roadmap for the topic: "${topic}".

Include:
- Levels: Beginner, Intermediate, Advanced
- 3-5 modules per level
- Each module: title, description, 1-2 free resources
- Final capstone project suggestion

Output in Markdown.
`;
```

---

### 4. LangChain Chain (`chains/roadmapPlanner.ts`)

```ts
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export const createRoadmapPlanner = () => {
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful learning planner assistant."],
    ["user", "{input}"],
  ]);

  const model = new ChatOpenAI({
    modelName: "gpt-4",
    temperature: 0.7,
  });

  return prompt.pipe(model);
};
```

---

### 5. LangGraph Agent (`agents/roadmapGraph.ts`)

```ts
import { createLangGraph } from "@langchain/langgraph";
import { createRoadmapPlanner } from "../chains/roadmapPlanner";

export const buildRoadmapAgent = () => {
  const planner = createRoadmapPlanner();

  const graph = createLangGraph({
    entry: "plan",
    nodes: {
      plan: async (state) => {
        const input = `Create a roadmap for: ${state.topic}`;
        const res = await planner.invoke({ input });
        return {
          ...state,
          roadmap: res.content,
          currentStep: 0,
        };
      },
      nextModule: async (state) => {
        const steps = parseRoadmapMarkdown(state.roadmap);
        const next = steps[state.currentStep];
        return { ...state, currentModule: next };
      },
      progress: async (state) => {
        return { ...state, currentStep: state.currentStep + 1 };
      },
    },
    edges: {
      plan: "nextModule",
      nextModule: "progress",
      progress: "nextModule",
    },
  });

  return graph;
};
```

> ⚠️ You’ll need to implement `parseRoadmapMarkdown()` to convert markdown into usable JSON.

---

### 6. Run & Test (`index.ts`)

```ts
import "dotenv/config";
import { buildRoadmapAgent } from "./agents/roadmapGraph";

const graph = buildRoadmapAgent();

const result = await graph.invoke({
  topic: "AI Agent Development",
});

console.log(result.currentModule);
```

---

## 🧠 Optional Enhancements

- ✅ Add RAG (via `ChromaDB`) for question answering
- ✅ Add user state persistence (Supabase / SQLite)
- ✅ Add LangChain tools or n8n workflows
- ✅ Add frontend using Next.js
- ✅ Turn it into an AI Chatbot with React front

---

## 🧠 Documentation to Learn More

| Area | Resource |
|------|----------|
| LangChain.js Overview | https://js.langchain.com/docs/ |
| LangGraph.js Tutorial | https://js.langchain.com/docs/langgraph/tutorials/agent/ |
| Prompt Templates | https://js.langchain.com/docs/modules/model_io/prompts/ |
| Chains | https://js.langchain.com/docs/expression_language/chains/ |
| LangGraph Concepts | https://js.langchain.com/docs/langgraph/core_concepts/ |
| RAG (Retrievers) | https://js.langchain.com/docs/modules/data_connection/retrievers/ |
| Vector Stores | https://js.langchain.com/docs/modules/data_connection/vectorstores/ |

---

## ✅ What’s Left to Build

- [ ] `parseRoadmapMarkdown()` function
- [ ] Save and update user progress
- [ ] Add endpoint or API (REST/GraphQL)
- [ ] Add frontend (Next.js UI)
- [ ] Build optional integrations (n8n, Discord, Notion)

---

## 🧠 Final Thoughts

You now have a fully modular backend AI agent to:
- Generate learning roadmaps dynamically
- Extend into a multi-step planner or tutor system
- Track and personalize user progress

> Next step: plug it into your UI, and start guiding users interactively 🚀