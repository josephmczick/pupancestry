export interface BreedPrediction {
  name: string;
  percentage: number;
}

export interface AnalysisResult {
  isDog: boolean;
  breeds: BreedPrediction[];
  reasoning: string;
  mixedBreed: boolean;
  characteristics: string[];
}

export interface UploadedImage {
  id: string;
  file: File;
  url: string;
}

export interface DogMetadata {
  weight: string;
  length: string;
  age: string;
}