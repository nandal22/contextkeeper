import * as vscode from "vscode";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

let statusBarItem: vscode.StatusBarItem;
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel("ContextKeeper");

    statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        100
    );
    statusBarItem.command = "contextkeeper.resume";
    statusBarItem.tooltip = "Click to resume ContextKeeper";
    context.subscriptions.push(statusBarItem);

    context.subscriptions.push(
        vscode.commands.registerCommand("contextkeeper.save", saveContext),
        vscode.commands.registerCommand("contextkeeper.resume", resumeContext),
        vscode.commands.registerCommand("contextkeeper.log", showLog),
        vscode.commands.registerCommand("contextkeeper.diff", showDiff)
    );

    autoResume();
    updateStatusBar();
}

export function deactivate() {
    statusBarItem?.dispose();
    outputChannel?.dispose();
}

async function runCk(
    args: string,
    cwd?: string
): Promise<{ stdout: string; stderr: string }> {
    const workspaceFolder = cwd || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceFolder) {
        throw new Error("No workspace folder open");
    }

    // Try finding local binary first, fall back to global
    // Use ck instead of devctx
    return execAsync(`npx ck ${args}`, { cwd: workspaceFolder }).catch(() => execAsync(`ck ${args}`, { cwd: workspaceFolder }));
}

async function autoResume() {
    try {
        const { stdout } = await runCk("resume --stdout");
        if (stdout.trim() && !stdout.includes("not initialized") && !stdout.includes("No context")) {
            outputChannel.clear();
            outputChannel.appendLine("═══ ContextKeeper Auto-Resume ═══\n");
            outputChannel.appendLine(stdout);
            outputChannel.show(true);
        }
    } catch {
        // Silently fail
    }
}

async function saveContext() {
    const message = await vscode.window.showInputBox({
        prompt: "What were you working on?",
        placeHolder: "e.g., Refactoring payment service to use event sourcing",
    });

    if (!message) return;

    try {
        await runCk(`save "${message.replace(/"/g, '\\"')}"`);
        vscode.window.showInformationMessage(`ContextKeeper: Context saved ✓`);
        updateStatusBar();
    } catch (err: any) {
        vscode.window.showErrorMessage(`ContextKeeper: ${err.message}`);
    }
}

async function resumeContext() {
    try {
        const { stdout } = await runCk("resume --stdout");
        outputChannel.clear();
        outputChannel.appendLine("═══ ContextKeeper Resume ═══\n");
        outputChannel.appendLine(stdout);
        outputChannel.show();
    } catch (err: any) {
        vscode.window.showErrorMessage(`ContextKeeper: ${err.message}`);
    }
}

async function showLog() {
    try {
        const { stdout } = await runCk("log");
        outputChannel.clear();
        outputChannel.appendLine("═══ ContextKeeper Log ═══\n");
        outputChannel.appendLine(stdout);
        outputChannel.show();
    } catch (err: any) {
        vscode.window.showErrorMessage(`ContextKeeper: ${err.message}`);
    }
}

async function showDiff() {
    try {
        const { stdout } = await runCk("diff");
        outputChannel.clear();
        outputChannel.appendLine("═══ ContextKeeper Diff ═══\n");
        outputChannel.appendLine(stdout);
        outputChannel.show();
    } catch (err: any) {
        vscode.window.showErrorMessage(`ContextKeeper: ${err.message}`);
    }
}

async function updateStatusBar() {
    try {
        const { stdout } = await runCk("feature");
        if (stdout.includes("Current active feature:")) {
            const feature = stdout.split("Current active feature:")[1].trim();
            statusBarItem.text = `$(history) CK: ${feature}`;
            statusBarItem.show();
            return;
        }
        statusBarItem.text = "$(history) CK";
        statusBarItem.show();
    } catch {
        statusBarItem.text = "$(history) CK: Not tracking";
        statusBarItem.show();
    }
}
