import chalk from "chalk";
import { isInitialized, loadFeatureContext, getActiveFeature } from "../core/storage";

export async function logCommand(options?: { feature?: string; count?: string }) {
    if (!(await isInitialized())) {
        console.log(chalk.red("✗ ContextKeeper not initialized. Run `ck init` first."));
        return;
    }

    try {
        const activeFeature = await getActiveFeature();
        const featureId = options?.feature || activeFeature;
        const entries = await loadFeatureContext(featureId);

        if (entries.length === 0) {
            console.log(chalk.yellow(`⚠ No context history found for feature: ${featureId}`));
            return;
        }

        const count = options?.count ? parseInt(options.count) : 10;
        const toShow = entries.slice(-count).reverse();

        console.log(chalk.bold(`\n📝 Context History for Feature: ${chalk.cyan(featureId)}\n`));

        toShow.forEach((entry) => {
            const date = new Date(entry.timestamp).toLocaleString();
            console.log(chalk.gray(`[${date}]`) + chalk.magenta(` ${entry.author}`) + ` (${entry.id.split("-")[0]})`);
            console.log(chalk.bold(`Task:   `) + entry.task);
            console.log(chalk.bold(`State:  `) + entry.currentState);

            if (entry.decisions.length > 0) {
                console.log(chalk.gray(`        + ${entry.decisions.length} decisions`));
            }
            console.log(chalk.gray("─".repeat(50)));
        });

        if (entries.length > toShow.length) {
            console.log(chalk.gray(`...and ${entries.length - toShow.length} older entries`));
        }
        console.log("");
    } catch (err: any) {
        console.log(chalk.red(`✗ Error: ${err.message}`));
    }
}
