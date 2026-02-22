"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.featureCommand = featureCommand;
const chalk_1 = __importDefault(require("chalk"));
const storage_1 = require("../core/storage");
async function featureCommand(action, name) {
    if (!(await (0, storage_1.isInitialized)())) {
        console.log(chalk_1.default.red("✗ ContextKeeper not initialized. Run `ck init` first."));
        return;
    }
    const active = await (0, storage_1.getActiveFeature)();
    if (!action && !name) {
        console.log(chalk_1.default.blue(`Current active feature: `) + chalk_1.default.bold(active));
        return;
    }
    if (action === "ls" || action === "list") {
        const features = await (0, storage_1.listFeatures)();
        console.log(chalk_1.default.bold("\nFeatures:"));
        features.forEach((f) => {
            const isAct = f.id === active ? chalk_1.default.green("* ") : "  ";
            console.log(`${isAct}${chalk_1.default.bold(f.id)} ` + chalk_1.default.gray(`(Updated: ${new Date(f.updatedAt).toLocaleDateString()})`));
        });
        console.log("");
        return;
    }
    if (action === "switch" || action === "checkout") {
        if (!name) {
            console.log(chalk_1.default.red("✗ Please provide a feature name to switch to."));
            return;
        }
        // We implicitly create if it doesn't exist to make switching easy
        await (0, storage_1.createFeature)(name);
        await (0, storage_1.setActiveFeature)(name);
        console.log(chalk_1.default.green(`✓ Switched to feature: ${chalk_1.default.bold(name)}`));
        return;
    }
    if (action === "create" || action === "new") {
        if (!name) {
            console.log(chalk_1.default.red("✗ Please provide a feature name to create."));
            return;
        }
        await (0, storage_1.createFeature)(name);
        await (0, storage_1.setActiveFeature)(name);
        console.log(chalk_1.default.green(`✓ Created and switched to feature: ${chalk_1.default.bold(name)}`));
        return;
    }
    console.log(chalk_1.default.yellow(`⚠ Unknown action: ${action}. Use 'ls', 'switch <name>', or 'create <name>'`));
}
//# sourceMappingURL=feature.js.map