import React, { useState } from 'react';
import { UploadZone } from './components/UploadZone';
import { Results } from './components/Results';
import { MetadataInputs } from './components/MetadataInputs';
import { analyzeDogBreed } from './services/geminiService';
import { UploadedImage, AnalysisResult, DogMetadata } from './types';
import { Dog, Loader2, Sparkles, Github } from 'lucide-react';

export default function App() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // New state for optional inputs
  const [metadata, setMetadata] = useState<DogMetadata>({
    weight: '',
    length: '',
    age: ''
  });

  const handleFilesSelected = (files: File[]) => {
    const newImages: UploadedImage[] = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
    
    if (result) {
      setResult(null);
      setError(null);
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleMetadataChange = (field: keyof DogMetadata, value: string) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
  };

  const handleAnalyze = async () => {
    if (images.length === 0) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const files = images.map((img) => img.file);
      // Pass metadata to the service
      const data = await analyzeDogBreed(files, metadata);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("We couldn't analyze those images. Please check your connection or try different photos.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    images.forEach((img) => URL.revokeObjectURL(img.url));
    setImages([]);
    setMetadata({ weight: '', length: '', age: '' });
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-surface-950 text-slate-200 selection:bg-brand-500/30">
      {/* Header */}
      <header className="border-b border-surface-800 bg-surface-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-brand-500 to-indigo-600 p-2 rounded-lg shadow-lg shadow-brand-500/20">
              <Dog className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Pup Ancestry AI</h1>
              <p className="text-xs text-slate-400 font-medium">Powered by Gemini 2.5 Flash</p>
            </div>
          </div>
          <a href="#" className="text-slate-500 hover:text-white transition-colors">
            <Github className="w-6 h-6" />
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            What breed is your dog?
          </h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Upload photos of your furry friend. Our advanced AI model analyzes physical traits to estimate their lineage with high accuracy.
          </p>
        </div>

        <div className="bg-surface-900/40 border border-surface-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-sm">
          <UploadZone 
            onFilesSelected={handleFilesSelected} 
            images={images} 
            onRemoveImage={removeImage} 
            disabled={loading}
          />
          
          {/* Inject Metadata Inputs only if images exist to keep initial UI clean, or always show? 
              Always showing might encourage filling it out. Let's show it if images exist or simpler: always. 
              Actually, visually it looks better if it appears after interaction or just sits there. 
              I'll place it here. */}
          <MetadataInputs 
            metadata={metadata}
            onChange={handleMetadataChange}
            disabled={loading}
          />

          {/* Action Bar */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleAnalyze}
              disabled={images.length === 0 || loading}
              className={`
                flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300
                shadow-lg shadow-brand-500/20
                ${images.length === 0 || loading 
                  ? 'bg-surface-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white transform hover:-translate-y-1'}
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing DNA Markers...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Identify Breed
                </>
              )}
            </button>

            {(images.length > 0 || metadata.weight || metadata.length || metadata.age) && !loading && (
              <button
                onClick={handleClear}
                className="px-6 py-4 rounded-xl font-medium text-slate-400 hover:bg-surface-800 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
          
          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl text-center text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="mt-12">
          {result && <Results result={result} />}
        </div>
      </main>

      <footer className="py-12 text-center text-slate-600 text-sm border-t border-surface-900 mt-12">
        <p>
          Pup Ancestry uses Google Gemini 2.5 Flash Vision.
          <br />
          Results are for entertainment purposes. Always consult a vet.
        </p>
      </footer>
    </div>
  );
}