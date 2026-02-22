"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveCommand = saveCommand;
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const uuid_1 = require("uuid");
const storage_1 = require("../core/storage");
const git_1 = require("../core/git");
async function saveCommand(message, options) {
    if (!(await (0, storage_1.isInitialized)())) {
        console.log(chalk_1.default.red("✗ ContextKeeper not initialized. Run `ck init` first."));
        return;
    }
    try {
        const activeFeature = await (0, storage_1.getActiveFeature)();
        const featureId = options?.feature || activeFeature;
        const [filesChanged, recentCommits, author] = await Promise.all([
            (0, git_1.getChangedFiles)(),
            (0, git_1.getRecentCommits)(),
            (0, git_1.getAuthor)(),
        ]);
        let task = message || "";
        let approaches = [];
        let decisions = [];
        let currentState = "";
        let nextSteps = [];
        let blockers = [];
        const hasStructuredInput = options?.approaches || options?.decisions || options?.state || options?.nextSteps;
        if (options?.auto) {
            console.log(chalk_1.default.gray("  Scanning editor sessions for context (To be implemented)..."));
            // TODO: Connect Extractors here
            task = message || "Session (auto-extract pending implementation)";
            currentState = message || "";
        }
        else if (hasStructuredInput && message) {
            task = message;
            approaches = options.approaches ? options.approaches.split(";;").map((s) => s.trim()).filter(Boolean) : [];
            decisions = options.decisions ? options.decisions.split(";;").map((s) => s.trim()).filter(Boolean) : [];
            currentState = options.state || message;
            nextSteps = options.nextSteps ? options.nextSteps.split(";;").map((s) => s.trim()).filter(Boolean) : [];
            blockers = options.blockers ? options.blockers.split(";;").map((s) => s.trim()).filter(Boolean) : [];
        }
        else if (!message) {
            const answers = await inquirer_1.default.prompt([
                {
                    type: "input",
                    name: "task",
                    message: "What were you working on?",
                    validate: (input) => input.length > 0 || "Task description is required",
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
                    validate: (input) => input.length > 0 || "Current state is required",
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
            approaches = answers.approaches ? answers.approaches.split(",").map((s) => s.trim()).filter(Boolean) : [];
            decisions = answers.decisions ? answers.decisions.split(",").map((s) => s.trim()).filter(Boolean) : [];
            currentState = answers.currentState;
            nextSteps = answers.nextSteps ? answers.nextSteps.split(",").map((s) => s.trim()).filter(Boolean) : [];
            blockers = answers.blockers ? answers.blockers.split(",").map((s) => s.trim()).filter(Boolean) : [];
        }
        else {
            currentState = message;
        }
        const entry = {
            id: (0, uuid_1.v4)(),
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
        await (0, storage_1.saveContext)(entry);
        console.log(chalk_1.default.green(`✓ Context saved for feature: ${chalk_1.default.bold(featureId)}`));
    }
    catch (err) {
        console.log(chalk_1.default.red(`✗ Error: ${err.message}`));
    }
}
//# sourceMappingURL=save.js.map