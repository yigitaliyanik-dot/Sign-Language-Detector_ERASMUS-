import { LandmarkSample, SignDataset, DatasetStats } from "./types";

const STORAGE_KEY = "sign_vision_dataset_v1";

const DEFAULT_DATASET: SignDataset = {
  version: "1.0.0",
  name: "SignVision Custom Dataset",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  samples: [],
};

class DatasetStorageManager {
  private dataset: SignDataset;

  constructor() {
    this.dataset = this.loadFromStorage();
  }

  private loadFromStorage(): SignDataset {
    if (typeof window === "undefined") {
      return DEFAULT_DATASET;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to load dataset from localStorage:", e);
    }
    return { ...DEFAULT_DATASET, createdAt: Date.now(), updatedAt: Date.now() };
  }

  private saveToStorage(): void {
    if (typeof window === "undefined") return;
    try {
      this.dataset.updatedAt = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.dataset));
    } catch (e) {
      console.error("Failed to save dataset to localStorage:", e);
    }
  }

  public getDataset(): SignDataset {
    return this.dataset;
  }

  public getStats(): DatasetStats {
    const classCounts: Record<string, number> = {};
    for (const sample of this.dataset.samples) {
      classCounts[sample.label] = (classCounts[sample.label] || 0) + 1;
    }
    return {
      totalSamples: this.dataset.samples.length,
      classes: Object.keys(classCounts).sort(),
      classCounts,
    };
  }

  public addSample(sample: LandmarkSample): void {
    this.dataset.samples.push(sample);
    this.saveToStorage();
  }

  public addSamples(samples: LandmarkSample[]): void {
    this.dataset.samples.push(...samples);
    this.saveToStorage();
  }

  public deleteClass(label: string): void {
    this.dataset.samples = this.dataset.samples.filter((s) => s.label !== label);
    this.saveToStorage();
  }

  public clear(): void {
    this.dataset.samples = [];
    this.saveToStorage();
  }

  /**
   * Export dataset as a formatted JSON file and trigger browser download
   */
  public exportJSON(): void {
    const jsonString = JSON.stringify(this.dataset, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sign_dataset_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export dataset as CSV file (label, x0, y0, z0, ..., x20, y20, z20)
   */
  public exportCSV(): void {
    const headers = ["label", "handedness"];
    for (let i = 0; i < 21; i++) {
      headers.push(`x${i}`, `y${i}`, `z${i}`);
    }

    const rows = [headers.join(",")];

    for (const s of this.dataset.samples) {
      const row = [
        `"${s.label.replace(/"/g, '""')}"`,
        s.handedness || "Unknown",
        ...s.features.map((v) => v.toFixed(6)),
      ];
      rows.push(row.join(","));
    }

    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sign_dataset_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Import dataset from a JSON string or file
   */
  public importJSON(jsonContent: string): boolean {
    try {
      const parsed = JSON.parse(jsonContent);
      if (Array.isArray(parsed.samples)) {
        this.dataset = {
          ...DEFAULT_DATASET,
          ...parsed,
          updatedAt: Date.now(),
        };
        this.saveToStorage();
        return true;
      }
    } catch (e) {
      console.error("Failed to parse imported JSON dataset:", e);
    }
    return false;
  }
}

export const datasetStorage = new DatasetStorageManager();
