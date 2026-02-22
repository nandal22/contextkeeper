import chalk from "chalk";
import { isInitialized, initContextKeeper, getCkDir } from "../core/storage";

export async function initCommand() {
    const initialized = await isInitialized();
    if (initialized) {
        const dir = await getCkDir();
        console.log(chalk.yellow(`⚠ ContextKeeper is already initialized at ${dir}`));
        return;
    }

    try {
        await initContextKeeper();
        const dir = await getCkDir();
        console.log(chalk.green(`✓ Initialized ContextKeeper in ${dir}`));
        console.log(chalk.gray(`  Tracking context under the 'default' feature.`));
        console.log(chalk.gray(`  Run \`ck feature --help\` to create new features.`));
    } catch (err: any) {
        console.log(chalk.red(`✗ Initialization failed: ${err.message}`));
    }
}
