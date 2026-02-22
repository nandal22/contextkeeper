import chalk from "chalk";
import { isInitialized, loadFeatureContext, getActiveFeature } from "../core/storage";
import { getChangedFiles, getStagedFiles } from "../core/git";

export async function diffCommand(options?: { feature?: string }) {
    if (!(await isInitialized())) {
        console.log(chalk.red("✗ ContextKeeper not initialized."));
        return;
    }

    try {
        const activeFeature = await getActiveFeature();
        const featureId = options?.feature || activeFeature;
        const entries = await loadFeatureContext(featureId);

        const [changed, staged] = await Promise.all([getChangedFiles(), getStagedFiles()]);

        console.log(chalk.bold(`\nChanges since last save (Feature: ${chalk.cyan(featureId)})\n`));

        if (entries.length > 0) {
            const latest = entries[entries.length - 1];
            const timeStr = new Date(latest.timestamp).toLocaleString();
            console.log(chalk.gray(`Last saved: ${timeStr}`));
            console.log(chalk.gray(`Last state: ${latest.currentState}\n`));
        }

        if (staged.length > 0) {
            console.log(chalk.green("Staged Files:"));
            staged.forEach((f) => console.log(`  + ${f}`));
            console.log("");
        }

        if (changed.length > 0) {
            const unstaged = changed.filter((f) => !staged.includes(f));
            if (unstaged.length > 0) {
                console.log(chalk.yellow("Unstaged Files:"));
                unstaged.forEach((f) => console.log(`  ~ ${f}`));
                console.log("");
            }
        }

        if (changed.length === 0 && staged.length === 0) {
            console.log(chalk.gray("No local changes."));
        }
    } catch (err: any) {
        console.log(chalk.red(`✗ Error: ${err.message}`));
    }
}
