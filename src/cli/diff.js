"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.diffCommand = diffCommand;
const chalk_1 = __importDefault(require("chalk"));
const storage_1 = require("../core/storage");
const git_1 = require("../core/git");
async function diffCommand(options) {
    if (!(await (0, storage_1.isInitialized)())) {
        console.log(chalk_1.default.red("✗ ContextKeeper not initialized."));
        return;
    }
    try {
        const activeFeature = await (0, storage_1.getActiveFeature)();
        const featureId = options?.feature || activeFeature;
        const entries = await (0, storage_1.loadFeatureContext)(featureId);
        const [changed, staged] = await Promise.all([(0, git_1.getChangedFiles)(), (0, git_1.getStagedFiles)()]);
        console.log(chalk_1.default.bold(`\nChanges since last save (Feature: ${chalk_1.default.cyan(featureId)})\n`));
        if (entries.length > 0) {
            const latest = entries[entries.length - 1];
            const timeStr = new Date(latest.timestamp).toLocaleString();
            console.log(chalk_1.default.gray(`Last saved: ${timeStr}`));
            console.log(chalk_1.default.gray(`Last state: ${latest.currentState}\n`));
        }
        if (staged.length > 0) {
            console.log(chalk_1.default.green("Staged Files:"));
            staged.forEach((f) => console.log(`  + ${f}`));
            console.log("");
        }
        if (changed.length > 0) {
            const unstaged = changed.filter((f) => !staged.includes(f));
            if (unstaged.length > 0) {
                console.log(chalk_1.default.yellow("Unstaged Files:"));
                unstaged.forEach((f) => console.log(`  ~ ${f}`));
                console.log("");
            }
        }
        if (changed.length === 0 && staged.length === 0) {
            console.log(chalk_1.default.gray("No local changes."));
        }
    }
    catch (err) {
        console.log(chalk_1.default.red(`✗ Error: ${err.message}`));
    }
}
//# sourceMappingURL=diff.js.map