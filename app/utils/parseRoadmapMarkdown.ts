export interface Module {
  level: string;
  content: string[];
  context?: string[];
}

export function parseRoadmapMarkdown(markdown: string): Module[] {
    const lines = markdown.split('\n');
    const modules: Module[] = [];
    let current: Module | null = null;
    let inList = false;
    let currentListItems: string[] = [];

    const finalizeCurrentModule = () => {
        if (current) {
            // Add any pending list items
            if (currentListItems.length > 0) {
                current.content = current.content.concat(currentListItems);
                currentListItems = [];
            }
            // Only add if we have content or context
            if (current.content.length > 0 || (current.context && current.context.length > 0)) {
                modules.push(current);
            }
        }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Check for module headers (###)
        if (line.match(/^#{2,3}\s+.+/)) {
            if (current) {
                finalizeCurrentModule();
            }
            current = {
                level: line.replace(/^#{2,3}\s*/, '').trim(),
                content: [],
                context: []
            };
            inList = false;
        } 
        // Check for numbered items (1., 2., etc.)
        else if (line.match(/^\d+\.\s+/)) {
            if (!current) continue;
            const listItem = line.replace(/^\d+\.\s+/, '').trim();
            currentListItems.push(`• ${listItem}`);
            inList = true;
        }
        // Check for list items with * or -
        else if (line.match(/^[\*\-]\s+/)) {
            if (!current) continue;
            const listItem = line.replace(/^[\*\-]\s+/, '').trim();
            currentListItems.push(`• ${listItem}`);
            inList = true;
        }
        // Check for indented content (nested lists)
        else if (line.match(/^\s{2,}\S/)) {
            if (!current || !inList) continue;
            // Add as a sub-item of the last list item
            if (currentListItems.length > 0) {
                const lastItem = currentListItems[currentListItems.length - 1];
                currentListItems[currentListItems.length - 1] = lastItem + '\n  • ' + line.trim();
            }
        }
        // Regular content line
        else if (current) {
            // If we were in a list and now we're not, add the list to content
            if (inList && currentListItems.length > 0) {
                current.content = current.content.concat(currentListItems);
                currentListItems = [];
                inList = false;
            }
            // Add non-empty lines as content
            if (line && !line.match(/^\s*$/)) {
                current.content.push(line);
            }
        }
    }

    finalizeCurrentModule();
    
    // If we didn't find any modules with the expected format, create one with all content
    if (modules.length === 0) {
        const content = markdown.split('\n').filter(line => line.trim().length > 0);
        if (content.length > 0) {
            return [{
                level: 'Complete Roadmap',
                content: content,
                context: []
            }];
        }
    }
    
    return modules;
}