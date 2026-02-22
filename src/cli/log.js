"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logCommand = logCommand;
const chalk_1 = __importDefault(require("chalk"));
const storage_1 = require("../core/storage");
async function logCommand(options) {
    if (!(await (0, storage_1.isInitialized)())) {
        console.log(chalk_1.default.red("✗ ContextKeeper not initialized. Run `ck init` first."));
        return;
    }
    try {
        const activeFeature = await (0, storage_1.getActiveFeature)();
        const featureId = options?.feature || activeFeature;
        const entries = await (0, storage_1.loadFeatureContext)(featureId);
        if (entries.length === 0) {
            console.log(chalk_1.default.yellow(`⚠ No context history found for feature: ${featureId}`));
            return;
        }
        const count = options?.count ? parseInt(options.count) : 10;
        const toShow = entries.slice(-count).reverse();
        console.log(chalk_1.default.bold(`\n📝 Context History for Feature: ${chalk_1.default.cyan(featureId)}\n`));
        toShow.forEach((entry) => {
            const date = new Date(entry.timestamp).toLocaleString();
            console.log(chalk_1.default.gray(`[${date}]`) + chalk_1.default.magenta(` ${entry.author}`) + ` (${entry.id.split("-")[0]})`);
            console.log(chalk_1.default.bold(`Task:   `) + entry.task);
            console.log(chalk_1.default.bold(`State:  `) + entry.currentState);
            if (entry.decisions.length > 0) {
                console.log(chalk_1.default.gray(`        + ${entry.decisions.length} decisions`));
            }
            console.log(chalk_1.default.gray("─".repeat(50)));
        });
        if (entries.length > toShow.length) {
            console.log(chalk_1.default.gray(`...and ${entries.length - toShow.length} older entries`));
        }
        console.log("");
    }
    catch (err) {
        console.log(chalk_1.default.red(`✗ Error: ${err.message}`));
    }
}
//# sourceMappingURL=log.js.map