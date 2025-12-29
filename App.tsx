import React, { useState, useEffect } from 'react';
import { Upload, Sparkles, Shirt } from 'lucide-react';
import UploadZone from './components/UploadZone';
import OutfitCard from './components/OutfitCard';
import ImageEditor from './components/ImageEditor';
import { OutfitOption, AppState } from './types';
import { analyzeClothingItem, generateOutfitImage } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('upload');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [itemDescription, setItemDescription] = useState<string>('');
  
  // State for the generated outfits
  const [outfits, setOutfits] = useState<OutfitOption[]>([
    { id: '1', style: 'Casual', description: '', imageUrl: null, isLoading: false },
    { id: '2', style: 'Business', description: '', imageUrl: null, isLoading: false },
    { id: '3', style: 'Night Out', description: '', imageUrl: null, isLoading: false },
    { id: '4', style: 'Athleisure', description: '', imageUrl: null, isLoading: false },
    { id: '5', style: 'Formal', description: '', imageUrl: null, isLoading: false },
    { id: '6', style: 'Bohemian', description: '', imageUrl: null, isLoading: false },
  ]);

  const [selectedOutfit, setSelectedOutfit] = useState<OutfitOption | null>(null);

  const handleImageUpload = async (base64: string) => {
    setSourceImage(base64);
    setAppState('analyzing');

    try {
      // 1. Analyze Image
      const analysis = await analyzeClothingItem(base64);
      setItemDescription(analysis.description);
      
      const newOutfits: OutfitOption[] = [
        { 
            id: '1', 
            style: 'Casual', 
            description: analysis.suggestions.Casual, 
            imageUrl: null, 
            isLoading: true 
        },
        { 
            id: '2', 
            style: 'Business', 
            description: analysis.suggestions.Business, 
            imageUrl: null, 
            isLoading: true 
        },
        { 
            id: '3', 
            style: 'Night Out', 
            description: analysis.suggestions.NightOut, 
            imageUrl: null, 
            isLoading: true 
        },
        { 
            id: '4', 
            style: 'Athleisure', 
            description: analysis.suggestions.Athleisure, 
            imageUrl: null, 
            isLoading: true 
        },
        { 
            id: '5', 
            style: 'Formal', 
            description: analysis.suggestions.Formal, 
            imageUrl: null, 
            isLoading: true 
        },
        { 
            id: '6', 
            style: 'Bohemian', 
            description: analysis.suggestions.Bohemian, 
            imageUrl: null, 
            isLoading: true 
        },
      ];
      setOutfits(newOutfits);
      setAppState('results');

      // 2. Trigger Image Generation for all styles (Parallel)
      newOutfits.forEach(outfit => {
        generateOutfitImage(base64, outfit.style, outfit.description)
          .then(url => {
            setOutfits(current => 
              current.map(o => o.id === outfit.id ? { ...o, imageUrl: url, isLoading: false } : o)
            );
          })
          .catch(() => {
            setOutfits(current => 
              current.map(o => o.id === outfit.id ? { ...o, isLoading: false } : o)
            );
          });
      });

    } catch (error) {
      console.error(error);
      alert("Something went wrong analyzing the image.");
      setAppState('upload');
    }
  };

  const handleOutfitSelect = (outfit: OutfitOption) => {
    setSelectedOutfit(outfit);
    setAppState('editing');
  };

  const handleEditorClose = () => {
    setSelectedOutfit(null);
    setAppState('results');
  };

  const handleEditorUpdate = (newUrl: string) => {
    if (selectedOutfit) {
        setOutfits(current => 
            current.map(o => o.id === selectedOutfit.id ? { ...o, imageUrl: newUrl } : o)
        );
        setSelectedOutfit(prev => prev ? {...prev, imageUrl: newUrl} : null);
    }
  };

  const handleStartOver = () => {
    setAppState('upload');
    setSourceImage(null);
    setSelectedOutfit(null);
    setItemDescription('');
    // Reset outfits to initial state
    setOutfits([
      { id: '1', style: 'Casual', description: '', imageUrl: null, isLoading: false },
      { id: '2', style: 'Business', description: '', imageUrl: null, isLoading: false },
      { id: '3', style: 'Night Out', description: '', imageUrl: null, isLoading: false },
      { id: '4', style: 'Athleisure', description: '', imageUrl: null, isLoading: false },
      { id: '5', style: 'Formal', description: '', imageUrl: null, isLoading: false },
      { id: '6', style: 'Bohemian', description: '', imageUrl: null, isLoading: false },
    ]);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white/30">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleStartOver}>
            <div className="bg-white text-black p-1.5 rounded-lg">
                <Shirt className="w-5 h-5" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-white">Style Forge</span>
          </div>
          {appState !== 'upload' && (
            <button 
                onClick={handleStartOver}
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
                Start Over
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Upload State */}
        {appState === 'upload' && (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center mb-12 max-w-2xl">
                    <h1 className="text-5xl font-serif font-bold text-white mb-6 leading-tight">
                        Solve the <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 italic">"I don't know what to wear"</span> problem.
                    </h1>
                    <p className="text-lg text-zinc-400">
                        Upload a photo of any item. Our AI Stylist will build 6 complete outfits around it and visualize them instantly.
                    </p>
                </div>
                <UploadZone onImageSelected={handleImageUpload} isProcessing={false} />
            </div>
        )}

        {/* Analyzing State */}
        {appState === 'analyzing' && (
             <div className="flex flex-col items-center justify-center py-32 space-y-8 animate-in fade-in duration-500">
                <div className="relative">
                    {sourceImage && (
                        <img 
                            src={`data:image/jpeg;base64,${sourceImage}`} 
                            alt="Analyzing" 
                            className="w-32 h-32 object-cover rounded-2xl shadow-xl opacity-50 blur-sm border border-white/10"
                        />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-white animate-pulse" />
                    </div>
                </div>
                <h2 className="text-2xl font-serif text-white">Analyzing your wardrobe...</h2>
             </div>
        )}

        {/* Results State (Also visible in background during editing) */}
        {(appState === 'results' || appState === 'editing') && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Source & Description Header */}
                <div className="flex flex-col md:flex-row items-center gap-8 bg-zinc-900/50 p-6 rounded-2xl shadow-sm border border-white/10">
                    <div className="w-24 h-24 flex-shrink-0">
                         {sourceImage && (
                            <img 
                                src={`data:image/jpeg;base64,${sourceImage}`} 
                                alt="Source" 
                                className="w-full h-full object-cover rounded-xl shadow-inner border border-white/10"
                            />
                        )}
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1">Identified Item</h2>
                        <p className="text-lg text-zinc-200 font-medium leading-relaxed">
                            {itemDescription || "Analyzing pattern and style..."}
                        </p>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {outfits.map((outfit) => (
                        <div key={outfit.id} className="h-[600px]">
                            <OutfitCard 
                                outfit={outfit} 
                                onSelect={handleOutfitSelect} 
                            />
                        </div>
                    ))}
                </div>
            </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20 py-8 bg-black">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-zinc-600">
            <p>&copy; {new Date().getFullYear()} Style Forge. AI-Generated Fashion.</p>
        </div>
      </footer>

      {/* Editor Modal */}
      {selectedOutfit && (
        <ImageEditor 
            outfit={selectedOutfit} 
            onClose={handleEditorClose} 
            onUpdate={handleEditorUpdate}
        />
      )}
    </div>
  );
};

export default App;