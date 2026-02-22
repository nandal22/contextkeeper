import fs from "fs";
import path from "path";
import os from "os";
import { ExtractedContext } from "./types";

export async function extractFromCline(repoPath: string): Promise<ExtractedContext | null> {
    const home = os.homedir();
    // Cline stores history in VS Code's globalStorage
    const globalStorage = path.join(home, "Library", "Application Support", "Code", "User", "globalStorage", "saoudrizwan.claude-dev", "tasks");

    // Linux/Windows fallback paths would go here if needed, keeping simple for mac for now

    if (!fs.existsSync(globalStorage)) return null;

    // Find all task JSON files, sort by newest
    const tasks = fs.readdirSync(globalStorage)
        .filter(f => f.endsWith(".json"))
        .map(f => {
            const p = path.join(globalStorage, f);
            return {
                path: p,
                mtime: fs.statSync(p).mtime.getTime()
            };
        })
        .sort((a, b) => b.mtime - a.mtime);

    for (const t of tasks) {
        try {
            const content = fs.readFileSync(t.path, "utf-8");
            const data = JSON.parse(content);

            // Basic sanity check to ensure it's a Cline history file
            if (!data.historyItem || !data.historyItem.task || !data.messages) continue;

            // In a real implementation we would match the task against the repoPath to ensure we grab the right one
            // We'll skip complex path matching for now and just grab the newest valid task

            const task = data.historyItem.task.slice(0, 300); // The original prompt

            // Extract decisions/approaches from the assistant's text blocks
            const decisions: string[] = [];
            const approaches: string[] = [];
            const nextSteps: string[] = [];
            let currentState = "";

            const assistantMessages = data.messages.filter((m: any) => m.role === "assistant");

            // Grab the last few assistant messages to extract intent/decisions
            const recentAssistant = assistantMessages.slice(-5);
            for (const msg of recentAssistant) {
                if (!msg.content) continue;
                const textBlocks = Array.isArray(msg.content) ? msg.content.filter((c: any) => c.type === "text").map((c: any) => c.text) : [msg.content];

                for (const text of textBlocks) {
                    // Extract decisions
                    const sentences = text.split(/[.!?]\\s+/);
                    for (const sentence of sentences) {
                        if (sentence.match(/\\b(decid|chos|opt|select|prefer|us(?:e|ing)|going with|approach|architect|pattern|instead of)/i)) {
                            const cleaned = sentence.trim();
                            if (cleaned.length > 20 && cleaned.length < 300 && !decisions.includes(cleaned)) {
                                decisions.push(cleaned);
                            }
                        }
                    }

                    // State indicator
                    const stateMatch = text.match(/(?:currently|now|at this point|so far|status:?)\\s*(.+?)(?:\\.|\\n|$)/i);
                    if (stateMatch && !currentState) currentState = stateMatch[0].trim().slice(0, 300);
                }
            }

            if (!currentState && assistantMessages.length > 0) {
                // Fallback to the last string the assistant outputted
                const lastMsg = assistantMessages[assistantMessages.length - 1];
                const textBlocks = Array.isArray(lastMsg.content) ? lastMsg.content.filter((c: any) => c.type === "text").map((c: any) => c.text) : [lastMsg.content];
                currentState = textBlocks[textBlocks.length - 1]?.split("\\n").filter((l: string) => l.trim().length > 10).pop()?.slice(0, 300) || "Cline task complete.";
            }

            return {
                task,
                approaches,
                decisions: decisions.slice(0, 10),
                currentState: currentState || "Parsed from recent Cline session",
                nextSteps,
                blockers: [],
                source: "cline"
            };

        } catch (e) {
            continue;
        }
    }

    return null;
}
