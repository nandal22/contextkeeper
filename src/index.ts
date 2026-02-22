#!/usr/bin/env node
import { Command } from "commander";
import { initCommand } from "./cli/init";
import { saveCommand } from "./cli/save";
import { resumeCommand } from "./cli/resume";
import { logCommand } from "./cli/log";
import { diffCommand } from "./cli/diff";
import { featureCommand } from "./cli/feature";
import { serveCommand } from "./server/index"; // We will build this next

const program = new Command();

program
    .name("ck")
    .description("ContextKeeper: Persistent AI coding context by feature")
    .version("1.0.0");

program.command("init").description("Initialize ContextKeeper in the current repo").action(initCommand);

program
    .command("feature [action] [name]")
    .alias("f")
    .description("Manage features (actions: ls, switch, create)")
    .action(featureCommand);

program
    .command("save [message]")
    .description("Save current coding context")
    .option("-f, --feature <feature>", "Feature to save context against")
    .option("-a, --auto", "Auto-extract context from editor sessions (Cline, Claude Code, Antigravity)")
    .option("--approaches <approaches>", "Approaches tried (;; separated)")
    .option("--decisions <decisions>", "Key decisions made (;; separated)")
    .option("--state <state>", "Current state / where you left off")
    .option("--next-steps <nextSteps>", "Next steps (;; separated)")
    .option("--blockers <blockers>", "Blockers (;; separated)")
    .action(saveCommand);

program
    .command("resume")
    .description("Generate context prompt for AI tools")
    .option("-f, --feature <feature>", "Resume context from a specific feature")
    .option("--stdout", "Output to stdout instead of clipboard")
    .action(resumeCommand);

program
    .command("log")
    .description("View context history")
    .option("-f, --feature <feature>", "Show log for a specific feature")
    .option("-n, --count <n>", "Number of entries to show", "10")
    .action(logCommand);

program
    .command("diff")
    .description("Show what changed since the last context save")
    .option("-f, --feature <feature>", "Diff against a specific feature")
    .action(diffCommand);

program
    .command("serve")
    .description("Start the local HTTP server for cross-platform access")
    .option("-p, --port <port>", "Port to run the server on", "4040")
    .action(serveCommand);

program.parse();
