import fs from "fs";
import path from "path";
import { ContextEntry, CkConfig, Feature } from "./types";
import { getRepoRoot, getRepoName } from "./git";

const DIR_NAME = ".contextkeeper";

export async function getCkDir(): Promise<string> {
    const root = await getRepoRoot();
    return path.join(root, DIR_NAME);
}

export async function isInitialized(): Promise<boolean> {
    const dir = await getCkDir();
    return fs.existsSync(dir);
}

export async function initContextKeeper(): Promise<void> {
    const dir = await getCkDir();
    if (fs.existsSync(dir)) return;

    fs.mkdirSync(dir, { recursive: true });
    fs.mkdirSync(path.join(dir, "features"), { recursive: true });
    fs.mkdirSync(path.join(dir, "sessions"), { recursive: true });

    const repoName = await getRepoName();
    const config: CkConfig = {
        version: "1.0.0",
        repo: repoName,
        createdAt: new Date().toISOString(),
    };

    fs.writeFileSync(path.join(dir, "config.json"), JSON.stringify(config, null, 2));

    // Create a default feature
    createFeature("default", "Default active feature");
    setActiveFeature("default");
}

export async function getActiveFeature(): Promise<string> {
    const dir = await getCkDir();
    const activeFile = path.join(dir, "active_feature.txt");
    if (fs.existsSync(activeFile)) {
        return fs.readFileSync(activeFile, "utf-8").trim();
    }
    return "default";
}

export async function setActiveFeature(featureId: string): Promise<void> {
    const dir = await getCkDir();
    fs.writeFileSync(path.join(dir, "active_feature.txt"), featureId.trim());
}

export async function listFeatures(): Promise<Feature[]> {
    const dir = await getCkDir();
    const featuresDir = path.join(dir, "features");
    if (!fs.existsSync(featuresDir)) return [];

    const files = fs.readdirSync(featuresDir).filter((f) => f.endsWith(".json"));
    const features: Feature[] = [];

    for (const file of files) {
        try {
            const content = JSON.parse(fs.readFileSync(path.join(featuresDir, file), "utf-8"));
            // Hacky feature metadata extraction since we're just reading the context array file
            if (content.length > 0) {
                features.push({
                    id: file.replace(".json", ""),
                    createdAt: content[0].timestamp,
                    updatedAt: content[content.length - 1].timestamp,
                    isActive: false, // will be set by caller
                });
            }
        } catch { }
    }

    // Always include the default feature if it doesn't have entries
    if (!features.find(f => f.id === "default")) {
        features.push({
            id: "default",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: false
        });
    }

    return features;
}

export async function createFeature(id: string, description?: string): Promise<void> {
    const dir = await getCkDir();
    const branchFile = path.join(dir, "features", `${id}.json`);
    if (!fs.existsSync(branchFile)) {
        fs.writeFileSync(branchFile, JSON.stringify([], null, 2));
    }
}


export async function saveContext(entry: ContextEntry): Promise<string> {
    const dir = await getCkDir();
    const sessionsDir = path.join(dir, "sessions");
    const featuresDir = path.join(dir, "features");

    fs.mkdirSync(sessionsDir, { recursive: true });
    fs.mkdirSync(featuresDir, { recursive: true });

    // Save session instance
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 16);
    const sessionFile = path.join(sessionsDir, `${timestamp}.json`);
    fs.writeFileSync(sessionFile, JSON.stringify(entry, null, 2));

    // Update feature context (append to array)
    const featureFile = path.join(featuresDir, `${entry.featureId}.json`);
    let entries: ContextEntry[] = [];

    if (fs.existsSync(featureFile)) {
        entries = JSON.parse(fs.readFileSync(featureFile, "utf-8"));
    }
    entries.push(entry);
    fs.writeFileSync(featureFile, JSON.stringify(entries, null, 2));

    return sessionFile;
}

export async function loadFeatureContext(featureId: string): Promise<ContextEntry[]> {
    const dir = await getCkDir();
    const featureFile = path.join(dir, "features", `${featureId}.json`);

    if (!fs.existsSync(featureFile)) return [];
    return JSON.parse(fs.readFileSync(featureFile, "utf-8"));
}
