export interface ContextEntry {
    id: string;
    timestamp: string;
    featureId: string;
    author: string;
    task: string;
    approaches: string[];
    decisions: string[];
    currentState: string;
    nextSteps: string[];
    blockers: string[];
    filesChanged: string[];
    recentCommits: string[];
    metadata?: Record<string, any>;
}
export interface Feature {
    id: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
}
export interface CkConfig {
    version: string;
    repo: string;
    createdAt: string;
}
//# sourceMappingURL=types.d.ts.map