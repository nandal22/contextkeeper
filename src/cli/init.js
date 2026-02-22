"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCommand = initCommand;
const chalk_1 = __importDefault(require("chalk"));
const storage_1 = require("../core/storage");
async function initCommand() {
    const initialized = await (0, storage_1.isInitialized)();
    if (initialized) {
        const dir = await (0, storage_1.getCkDir)();
        console.log(chalk_1.default.yellow(`⚠ ContextKeeper is already initialized at ${dir}`));
        return;
    }
    try {
        await (0, storage_1.initContextKeeper)();
        const dir = await (0, storage_1.getCkDir)();
        console.log(chalk_1.default.green(`✓ Initialized ContextKeeper in ${dir}`));
        console.log(chalk_1.default.gray(`  Tracking context under the 'default' feature.`));
        console.log(chalk_1.default.gray(`  Run \`ck feature --help\` to create new features.`));
    }
    catch (err) {
        console.log(chalk_1.default.red(`✗ Initialization failed: ${err.message}`));
    }
}
//# sourceMappingURL=init.js.map