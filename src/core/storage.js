"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCkDir = getCkDir;
exports.isInitialized = isInitialized;
exports.initContextKeeper = initContextKeeper;
exports.getActiveFeature = getActiveFeature;
exports.setActiveFeature = setActiveFeature;
exports.listFeatures = listFeatures;
exports.createFeature = createFeature;
exports.saveContext = saveContext;
exports.loadFeatureContext = loadFeatureContext;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const git_1 = require("./git");
const DIR_NAME = ".contextkeeper";
async function getCkDir() {
    const root = await (0, git_1.getRepoRoot)();
    return path_1.default.join(root, DIR_NAME);
}
async function isInitialized() {
    const dir = await getCkDir();
    return fs_1.default.existsSync(dir);
}
async function initContextKeeper() {
    const dir = await getCkDir();
    if (fs_1.default.existsSync(dir))
        return;
    fs_1.default.mkdirSync(dir, { recursive: true });
    fs_1.default.mkdirSync(path_1.default.join(dir, "features"), { recursive: true });
    fs_1.default.mkdirSync(path_1.default.join(dir, "sessions"), { recursive: true });
    const repoName = await (0, git_1.getRepoName)();
    const config = {
        version: "1.0.0",
        repo: repoName,
        createdAt: new Date().toISOString(),
    };
    fs_1.default.writeFileSync(path_1.default.join(dir, "config.json"), JSON.stringify(config, null, 2));
    // Create a default feature
    createFeature("default", "Default active feature");
    setActiveFeature("default");
}
async function getActiveFeature() {
    const dir = await getCkDir();
    const activeFile = path_1.default.join(dir, "active_feature.txt");
    if (fs_1.default.existsSync(activeFile)) {
        return fs_1.default.readFileSync(activeFile, "utf-8").trim();
    }
    return "default";
}
async function setActiveFeature(featureId) {
    const dir = await getCkDir();
    fs_1.default.writeFileSync(path_1.default.join(dir, "active_feature.txt"), featureId.trim());
}
async function listFeatures() {
    const dir = await getCkDir();
    const featuresDir = path_1.default.join(dir, "features");
    if (!fs_1.default.existsSync(featuresDir))
        return [];
    const files = fs_1.default.readdirSync(featuresDir).filter((f) => f.endsWith(".json"));
    const features = [];
    for (const file of files) {
        try {
            const content = JSON.parse(fs_1.default.readFileSync(path_1.default.join(featuresDir, file), "utf-8"));
            // Hacky feature metadata extraction since we're just reading the context array file
            if (content.length > 0) {
                features.push({
                    id: file.replace(".json", ""),
                    createdAt: content[0].timestamp,
                    updatedAt: content[content.length - 1].timestamp,
                    isActive: false, // will be set by caller
                });
            }
        }
        catch { }
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
async function createFeature(id, description) {
    const dir = await getCkDir();
    const branchFile = path_1.default.join(dir, "features", `${id}.json`);
    if (!fs_1.default.existsSync(branchFile)) {
        fs_1.default.writeFileSync(branchFile, JSON.stringify([], null, 2));
    }
}
async function saveContext(entry) {
    const dir = await getCkDir();
    const sessionsDir = path_1.default.join(dir, "sessions");
    const featuresDir = path_1.default.join(dir, "features");
    fs_1.default.mkdirSync(sessionsDir, { recursive: true });
    fs_1.default.mkdirSync(featuresDir, { recursive: true });
    // Save session instance
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 16);
    const sessionFile = path_1.default.join(sessionsDir, `${timestamp}.json`);
    fs_1.default.writeFileSync(sessionFile, JSON.stringify(entry, null, 2));
    // Update feature context (append to array)
    const featureFile = path_1.default.join(featuresDir, `${entry.featureId}.json`);
    let entries = [];
    if (fs_1.default.existsSync(featureFile)) {
        entries = JSON.parse(fs_1.default.readFileSync(featureFile, "utf-8"));
    }
    entries.push(entry);
    fs_1.default.writeFileSync(featureFile, JSON.stringify(entries, null, 2));
    return sessionFile;
}
async function loadFeatureContext(featureId) {
    const dir = await getCkDir();
    const featureFile = path_1.default.join(dir, "features", `${featureId}.json`);
    if (!fs_1.default.existsSync(featureFile))
        return [];
    return JSON.parse(fs_1.default.readFileSync(featureFile, "utf-8"));
}
//# sourceMappingURL=storage.js.map