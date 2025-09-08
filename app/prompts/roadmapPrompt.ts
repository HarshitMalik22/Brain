export const getRoadmapPrompt = (topic: string): string => `
You are an expert curriculum planner.
Create a detailed learning roadmap for the topic: "${topic},
include:
- levels: Beginner, Intermediate, Advanced
- 3-5 modules per level
- Each module should have a title, description, and 1-2 free learning resources
- End with a Markdown format.
`;