"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractFromCline = extractFromCline;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
async function extractFromCline(repoPath) {
    const home = os_1.default.homedir();
    // Cline stores history in VS Code's globalStorage
    const globalStorage = path_1.default.join(home, "Library", "Application Support", "Code", "User", "globalStorage", "saoudrizwan.claude-dev", "tasks");
    // Linux/Windows fallback paths would go here if needed, keeping simple for mac for now
    if (!fs_1.default.existsSync(globalStorage))
        return null;
    // Find all task JSON files, sort by newest
    const tasks = fs_1.default.readdirSync(globalStorage)
        .filter(f => f.endsWith(".json"))
        .map(f => {
        const p = path_1.default.join(globalStorage, f);
        return {
            path: p,
            mtime: fs_1.default.statSync(p).mtime.getTime()
        };
    })
        .sort((a, b) => b.mtime - a.mtime);
    for (const t of tasks) {
        try {
            const content = fs_1.default.readFileSync(t.path, "utf-8");
            const data = JSON.parse(content);
            // Basic sanity check to ensure it's a Cline history file
            if (!data.historyItem || !data.historyItem.task || !data.messages)
                continue;
            // In a real implementation we would match the task against the repoPath to ensure we grab the right one
            // We'll skip complex path matching for now and just grab the newest valid task
            const task = data.historyItem.task.slice(0, 300); // The original prompt
            // Extract decisions/approaches from the assistant's text blocks
            const decisions = [];
            const approaches = [];
            const nextSteps = [];
            let currentState = "";
            const assistantMessages = data.messages.filter((m) => m.role === "assistant");
            // Grab the last few assistant messages to extract intent/decisions
            const recentAssistant = assistantMessages.slice(-5);
            for (const msg of recentAssistant) {
                if (!msg.content)
                    continue;
                const textBlocks = Array.isArray(msg.content) ? msg.content.filter((c) => c.type === "text").map((c) => c.text) : [msg.content];
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
                    if (stateMatch && !currentState)
                        currentState = stateMatch[0].trim().slice(0, 300);
                }
            }
            if (!currentState && assistantMessages.length > 0) {
                // Fallback to the last string the assistant outputted
                const lastMsg = assistantMessages[assistantMessages.length - 1];
                const textBlocks = Array.isArray(lastMsg.content) ? lastMsg.content.filter((c) => c.type === "text").map((c) => c.text) : [lastMsg.content];
                currentState = textBlocks[textBlocks.length - 1]?.split("\\n").filter((l) => l.trim().length > 10).pop()?.slice(0, 300) || "Cline task complete.";
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
        }
        catch (e) {
            continue;
        }
    }
    return null;
}
//# sourceMappingURL=cline.js.map