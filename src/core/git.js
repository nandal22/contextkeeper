"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRepoRoot = getRepoRoot;
exports.getRepoName = getRepoName;
exports.getChangedFiles = getChangedFiles;
exports.getStagedFiles = getStagedFiles;
exports.getRecentCommits = getRecentCommits;
exports.getAuthor = getAuthor;
const simple_git_1 = __importDefault(require("simple-git"));
const path_1 = __importDefault(require("path"));
const git = (0, simple_git_1.default)();
async function getRepoRoot() {
    try {
        const root = await git.revparse(["--show-toplevel"]);
        return root.trim();
    }
    catch (err) {
        // Fallback if not in a git repo
        return process.cwd();
    }
}
async function getRepoName() {
    try {
        const remote = await git.remote(["get-url", "origin"]);
        if (remote) {
            return remote.trim().split("/").pop()?.replace(".git", "") || "unknown";
        }
    }
    catch { }
    const root = await getRepoRoot();
    return path_1.default.basename(root);
}
async function getChangedFiles() {
    try {
        const status = await git.status();
        return [...status.modified, ...status.created, ...status.not_added];
    }
    catch {
        return [];
    }
}
async function getStagedFiles() {
    try {
        const status = await git.status();
        return status.staged;
    }
    catch {
        return [];
    }
}
async function getRecentCommits(count = 5) {
    try {
        const log = await git.log({ maxCount: count });
        return log.all.map((c) => `${c.hash.slice(0, 7)} ${c.message}`);
    }
    catch {
        return [];
    }
}
async function getAuthor() {
    try {
        const name = await git.raw(["config", "user.name"]);
        return name.trim();
    }
    catch {
        return "unknown";
    }
}
//# sourceMappingURL=git.js.map