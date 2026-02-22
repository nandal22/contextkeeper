"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeCommand = resumeCommand;
const chalk_1 = __importDefault(require("chalk"));
const storage_1 = require("../core/storage");
const prompt_1 = require("../core/prompt");
const clipboardy_1 = __importDefault(require("clipboardy"));
async function resumeCommand(options) {
    if (!(await (0, storage_1.isInitialized)())) {
        console.log(chalk_1.default.red("✗ ContextKeeper not initialized. Run `ck init` first."));
        return;
    }
    try {
        const activeFeature = await (0, storage_1.getActiveFeature)();
        const featureId = options?.feature || activeFeature;
        const entries = await (0, storage_1.loadFeatureContext)(featureId);
        if (entries.length === 0) {
            console.log(chalk_1.default.yellow(`⚠ No context found for feature: ${featureId}`));
            console.log(chalk_1.default.gray("  Run `ck save` to capture context first."));
            return;
        }
        const prompt = (0, prompt_1.generatePrompt)(entries, featureId);
        if (options?.stdout) {
            console.log(prompt);
        }
        else {
            let copied = false;
            try {
                await clipboardy_1.default.write(prompt);
                copied = true;
            }
            catch (e) {
                copied = false;
            }
            if (copied) {
                console.log(chalk_1.default.green("📋 Context copied to clipboard!"));
                console.log(chalk_1.default.gray(`  Feature: ${featureId} | ${entries.length} sessions | Paste into any AI tool`));
            }
            else {
                console.log(prompt);
            }
        }
    }
    catch (err) {
        console.log(chalk_1.default.red(`✗ Error: ${err.message}`));
    }
}
//# sourceMappingURL=resume.js.map