"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractFromEditorSessions = extractFromEditorSessions;
const claude_1 = require("./claude");
const antigravity_1 = require("./antigravity");
const cline_1 = require("./cline");
async function extractFromEditorSessions(repoPath) {
    const extractors = [
        cline_1.extractFromCline,
        claude_1.extractFromClaudeCode,
        antigravity_1.extractFromAntigravity
    ];
    for (const extractor of extractors) {
        try {
            const result = await extractor(repoPath);
            if (result && result.task)
                return result;
        }
        catch {
            // Silently continue to next
        }
    }
    return null;
}
//# sourceMappingURL=index.js.map