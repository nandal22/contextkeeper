interface SaveOptions {
    feature?: string;
    approaches?: string;
    decisions?: string;
    state?: string;
    nextSteps?: string;
    blockers?: string;
    auto?: boolean;
}
export declare function saveCommand(message?: string, options?: SaveOptions): Promise<void>;
export {};
//# sourceMappingURL=save.d.ts.map