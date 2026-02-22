import chalk from "chalk";
import { isInitialized, loadFeatureContext, getActiveFeature } from "../core/storage";
import { generatePrompt } from "../core/prompt";
import clipboard from "clipboardy";

export async function resumeCommand(options?: { feature?: string; stdout?: boolean }) {
    if (!(await isInitialized())) {
        console.log(chalk.red("✗ ContextKeeper not initialized. Run `ck init` first."));
        return;
    }

    try {
        const activeFeature = await getActiveFeature();
        const featureId = options?.feature || activeFeature;
        const entries = await loadFeatureContext(featureId);

        if (entries.length === 0) {
            console.log(chalk.yellow(`⚠ No context found for feature: ${featureId}`));
            console.log(chalk.gray("  Run `ck save` to capture context first."));
            return;
        }

        const prompt = generatePrompt(entries, featureId);

        if (options?.stdout) {
            console.log(prompt);
        } else {
            let copied = false;
            try {
                await clipboard.write(prompt);
                copied = true;
            } catch (e) {
                copied = false;
            }

            if (copied) {
                console.log(chalk.green("📋 Context copied to clipboard!"));
                console.log(chalk.gray(`  Feature: ${featureId} | ${entries.length} sessions | Paste into any AI tool`));
            } else {
                console.log(prompt);
            }
        }
    } catch (err: any) {
        console.log(chalk.red(`✗ Error: ${err.message}`));
    }
}
