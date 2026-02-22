import { extractFromClaudeCode } from "./claude";
import { extractFromAntigravity } from "./antigravity";
import { extractFromCline } from "./cline";
import { ExtractedContext } from "./types";

export async function extractFromEditorSessions(repoPath: string): Promise<ExtractedContext | null> {
    const extractors = [
        extractFromCline,
        extractFromClaudeCode,
        extractFromAntigravity
    ];

    for (const extractor of extractors) {
        try {
            const result = await extractor(repoPath);
            if (result && result.task) return result;
        } catch {
            // Silently continue to next
        }
    }
    return null;
}
