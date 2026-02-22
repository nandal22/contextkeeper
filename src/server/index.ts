import express from "express";
import cors from "cors";
import chalk from "chalk";
import { isInitialized, listFeatures, loadFeatureContext, getActiveFeature } from "../core/storage";

export async function serveCommand(options?: { port?: string }) {
    if (!(await isInitialized())) {
        console.log(chalk.red("✗ ContextKeeper not initialized. Run `ck init` first."));
        return;
    }

    const port = options?.port ? parseInt(options.port) : 4040;
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.get("/api/features", async (req, res) => {
        try {
            const features = await listFeatures();
            const active = await getActiveFeature();
            res.json(features.map(f => ({ ...f, isActive: f.id === active })));
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    app.get("/api/features/:id", async (req, res) => {
        try {
            const entries = await loadFeatureContext(req.params.id);
            res.json(entries);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    app.listen(port, () => {
        console.log(chalk.green(`✓ ContextKeeper server running on port ${port}`));
        console.log(chalk.cyan(`  http://localhost:${port}/api/features`));
    });
}
