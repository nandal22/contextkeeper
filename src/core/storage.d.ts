import { ContextEntry, Feature } from "./types";
export declare function getCkDir(): Promise<string>;
export declare function isInitialized(): Promise<boolean>;
export declare function initContextKeeper(): Promise<void>;
export declare function getActiveFeature(): Promise<string>;
export declare function setActiveFeature(featureId: string): Promise<void>;
export declare function listFeatures(): Promise<Feature[]>;
export declare function createFeature(id: string, description?: string): Promise<void>;
export declare function saveContext(entry: ContextEntry): Promise<string>;
export declare function loadFeatureContext(featureId: string): Promise<ContextEntry[]>;
//# sourceMappingURL=storage.d.ts.map