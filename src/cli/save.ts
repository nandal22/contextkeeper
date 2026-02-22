import chalk from "chalk";
import inquirer from "inquirer";
import { v4 as uuid } from "uuid";
import { isInitialized, saveContext, getActiveFeature } from "../core/storage";
import { getChangedFiles, getRecentCommits, getAuthor } from "../core/git";
import { ContextEntry } from "../core/types";

interface SaveOptions {
    feature?: string;
    approaches?: string;
    decisions?: string;
    state?: string;
    nextSteps?: string;
    blockers?: string;
    auto?: boolean;
}

export async function saveCommand(message?: string, options?: SaveOptions) {
    if (!(await isInitialized())) {
        console.log(chalk.red("✗ ContextKeeper not initialized. Run `ck init` first."));
        return;
    }

    try {
        const activeFeature = await getActiveFeature();
        const featureId = options?.feature || activeFeature;

        const [filesChanged, recentCommits, author] = await Promise.all([
            getChangedFiles(),
            getRecentCommits(),
            getAuthor(),
        ]);

        let task = message || "";
        let approaches: string[] = [];
        let decisions: string[] = [];
        let currentState = "";
        let nextSteps: string[] = [];
        let blockers: string[] = [];

        const hasStructuredInput =
            options?.approaches || options?.decisions || options?.state || options?.nextSteps;

        if (options?.auto) {
            console.log(chalk.gray("  Scanning editor sessions for context (To be implemented)..."));
            // TODO: Connect Extractors here
            task = message || "Session (auto-extract pending implementation)";
            currentState = message || "";
        } else if (hasStructuredInput && message) {
            task = message;
            approaches = options.approaches ? options.approaches.split(";;").map((s) => s.trim()).filter(Boolean) : [];
            decisions = options.decisions ? options.decisions.split(";;").map((s) => s.trim()).filter(Boolean) : [];
            currentState = options.state || message;
            nextSteps = options.nextSteps ? options.nextSteps.split(";;").map((s) => s.trim()).filter(Boolean) : [];
            blockers = options.blockers ? options.blockers.split(";;").map((s) => s.trim()).filter(Boolean) : [];
        } else if (!message) {
            const answers = await inquirer.prompt([
                {
                    type: "input",
                    name: "task",
                    message: "What were you working on?",
                    validate: (input: string) => input.length > 0 || "Task description is required",
                },
                {
                    type: "input",
                    name: "approaches",
                    message: "What approaches did you try? (comma-separated, or skip)",
                    default: "",
                },
                {
                    type: "input",
                    name: "decisions",
                    message: "Key decisions made? (comma-separated, or skip)",
                    default: "",
                },
                {
                    type: "input",
                    name: "currentState",
                    message: "Where did you leave off?",
                    validate: (input: string) => input.length > 0 || "Current state is required",
                },
                {
                    type: "input",
                    name: "nextSteps",
                    message: "What comes next? (comma-separated, or skip)",
                    default: "",
                },
                {
                    type: "input",
                    name: "blockers",
                    message: "Any blockers? (comma-separated, or skip)",
                    default: "",
                },
            ]);

            task = answers.task;
            approaches = answers.approaches ? answers.approaches.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
            decisions = answers.decisions ? answers.decisions.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
            currentState = answers.currentState;
            nextSteps = answers.nextSteps ? answers.nextSteps.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
            blockers = answers.blockers ? answers.blockers.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
        } else {
            currentState = message;
        }

        const entry: ContextEntry = {
            id: uuid(),
            timestamp: new Date().toISOString(),
            featureId,
            author,
            task,
            approaches,
            decisions,
            currentState,
            nextSteps,
            blockers,
            filesChanged,
            recentCommits,
        };

        await saveContext(entry);
        console.log(chalk.green(`✓ Context saved for feature: ${chalk.bold(featureId)}`));
    } catch (err: any) {
        console.log(chalk.red(`✗ Error: ${err.message}`));
    }
}
