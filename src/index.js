#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const init_1 = require("./cli/init");
const save_1 = require("./cli/save");
const resume_1 = require("./cli/resume");
const log_1 = require("./cli/log");
const diff_1 = require("./cli/diff");
const feature_1 = require("./cli/feature");
const index_1 = require("./server/index"); // We will build this next
const program = new commander_1.Command();
program
    .name("ck")
    .description("ContextKeeper: Persistent AI coding context by feature")
    .version("1.0.0");
program.command("init").description("Initialize ContextKeeper in the current repo").action(init_1.initCommand);
program
    .command("feature [action] [name]")
    .alias("f")
    .description("Manage features (actions: ls, switch, create)")
    .action(feature_1.featureCommand);
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
    .action(save_1.saveCommand);
program
    .command("resume")
    .description("Generate context prompt for AI tools")
    .option("-f, --feature <feature>", "Resume context from a specific feature")
    .option("--stdout", "Output to stdout instead of clipboard")
    .action(resume_1.resumeCommand);
program
    .command("log")
    .description("View context history")
    .option("-f, --feature <feature>", "Show log for a specific feature")
    .option("-n, --count <n>", "Number of entries to show", "10")
    .action(log_1.logCommand);
program
    .command("diff")
    .description("Show what changed since the last context save")
    .option("-f, --feature <feature>", "Diff against a specific feature")
    .action(diff_1.diffCommand);
program
    .command("serve")
    .description("Start the local HTTP server for cross-platform access")
    .option("-p, --port <port>", "Port to run the server on", "4040")
    .action(index_1.serveCommand);
program.parse();
//# sourceMappingURL=index.js.map