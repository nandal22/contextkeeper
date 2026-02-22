import simpleGit from "simple-git";
import path from "path";

const git = simpleGit();

export async function getRepoRoot(): Promise<string> {
    try {
        const root = await git.revparse(["--show-toplevel"]);
        return root.trim();
    } catch (err) {
        // Fallback if not in a git repo
        return process.cwd();
    }
}

export async function getRepoName(): Promise<string> {
    try {
        const remote = await git.remote(["get-url", "origin"]);
        if (remote) {
            return remote.trim().split("/").pop()?.replace(".git", "") || "unknown";
        }
    } catch { }

    const root = await getRepoRoot();
    return path.basename(root);
}

export async function getChangedFiles(): Promise<string[]> {
    try {
        const status = await git.status();
        return [...status.modified, ...status.created, ...status.not_added];
    } catch {
        return [];
    }
}

export async function getStagedFiles(): Promise<string[]> {
    try {
        const status = await git.status();
        return status.staged;
    } catch {
        return [];
    }
}

export async function getRecentCommits(count: number = 5): Promise<string[]> {
    try {
        const log = await git.log({ maxCount: count });
        return log.all.map((c) => `${c.hash.slice(0, 7)} ${c.message}`);
    } catch {
        return [];
    }
}

export async function getAuthor(): Promise<string> {
    try {
        const name = await git.raw(["config", "user.name"]);
        return name.trim();
    } catch {
        return "unknown";
    }
}
