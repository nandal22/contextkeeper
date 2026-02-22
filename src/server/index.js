"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serveCommand = serveCommand;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const chalk_1 = __importDefault(require("chalk"));
const storage_1 = require("../core/storage");
async function serveCommand(options) {
    if (!(await (0, storage_1.isInitialized)())) {
        console.log(chalk_1.default.red("✗ ContextKeeper not initialized. Run `ck init` first."));
        return;
    }
    const port = options?.port ? parseInt(options.port) : 4040;
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.get("/api/features", async (req, res) => {
        try {
            const features = await (0, storage_1.listFeatures)();
            const active = await (0, storage_1.getActiveFeature)();
            res.json(features.map(f => ({ ...f, isActive: f.id === active })));
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    app.get("/api/features/:id", async (req, res) => {
        try {
            const entries = await (0, storage_1.loadFeatureContext)(req.params.id);
            res.json(entries);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    app.listen(port, () => {
        console.log(chalk_1.default.green(`✓ ContextKeeper server running on port ${port}`));
        console.log(chalk_1.default.cyan(`  http://localhost:${port}/api/features`));
    });
}
//# sourceMappingURL=index.js.map