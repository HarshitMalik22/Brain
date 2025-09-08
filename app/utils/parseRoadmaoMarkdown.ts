export function parseRoadmapMarkdown(markdown: string) {
    const lines = markdown.split('\n');
    const modules = [];

    let current = null;

    for (const line of lines) {
        if (line.startsWith('##')){
            if (current) modules.push(current);
            current = { level: line.replace(/##\\s*/, ''), context: []};
        }
        else if (current && line.trim()){
            current.content.push(line.trim());
        }
        }

        if (current) modules.push(current);
        return modules;
    }