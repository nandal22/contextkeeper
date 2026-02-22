import chalk from "chalk";
import { isInitialized, getActiveFeature, listFeatures, createFeature, setActiveFeature } from "../core/storage";

export async function featureCommand(action?: string, name?: string) {
    if (!(await isInitialized())) {
        console.log(chalk.red("✗ ContextKeeper not initialized. Run `ck init` first."));
        return;
    }

    const active = await getActiveFeature();

    if (!action && !name) {
        console.log(chalk.blue(`Current active feature: `) + chalk.bold(active));
        return;
    }

    if (action === "ls" || action === "list") {
        const features = await listFeatures();
        console.log(chalk.bold("\nFeatures:"));
        features.forEach((f) => {
            const isAct = f.id === active ? chalk.green("* ") : "  ";
            console.log(`${isAct}${chalk.bold(f.id)} ` + chalk.gray(`(Updated: ${new Date(f.updatedAt).toLocaleDateString()})`));
        });
        console.log("");
        return;
    }

    if (action === "switch" || action === "checkout") {
        if (!name) {
            console.log(chalk.red("✗ Please provide a feature name to switch to."));
            return;
        }

        // We implicitly create if it doesn't exist to make switching easy
        await createFeature(name);
        await setActiveFeature(name);
        console.log(chalk.green(`✓ Switched to feature: ${chalk.bold(name)}`));
        return;
    }

    if (action === "create" || action === "new") {
        if (!name) {
            console.log(chalk.red("✗ Please provide a feature name to create."));
            return;
        }
        await createFeature(name);
        await setActiveFeature(name);
        console.log(chalk.green(`✓ Created and switched to feature: ${chalk.bold(name)}`));
        return;
    }

    console.log(chalk.yellow(`⚠ Unknown action: ${action}. Use 'ls', 'switch <name>', or 'create <name>'`));
}
