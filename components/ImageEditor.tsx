import React, { useState } from 'react';
import { OutfitOption } from '../types';
import { X, Wand2, Loader2, Download, ArrowRight, Undo2, Redo2 } from 'lucide-react';
import { editOutfitImage } from '../services/geminiService';

interface ImageEditorProps {
  outfit: OutfitOption;
  onClose: () => void;
  onUpdate: (updatedUrl: string) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ outfit, onClose, onUpdate }) => {
  const [prompt, setPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Undo/Redo Stack State
  // We initialize history with the image passed in props.
  const [history, setHistory] = useState<string[]>(outfit.imageUrl ? [outfit.imageUrl] : []);
  // Pointer to the current state in history
  const [currentIndex, setCurrentIndex] = useState(0);

  // Derived state for the currently displayed image
  const currentImage = history[currentIndex];

  const handleEdit = async () => {
    if (!prompt.trim() || !currentImage) return;

    setIsEditing(true);
    try {
      const newImageUrl = await editOutfitImage(currentImage, prompt);
      
      // When a new edit is made, we discard any "redo" history beyond the current index
      const newHistory = history.slice(0, currentIndex + 1);
      newHistory.push(newImageUrl);
      
      setHistory(newHistory);
      // Move pointer to the new latest state
      setCurrentIndex(newHistory.length - 1);
      
      // Propagate change to parent
      onUpdate(newImageUrl);
      setPrompt('');
    } catch (e) {
      alert("Failed to edit image. Please try again.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDownload = () => {
    if (!currentImage) return;
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = `style-forge-${outfit.style.toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUndo = () => {
      if (currentIndex > 0) {
          const newIndex = currentIndex - 1;
          setCurrentIndex(newIndex);
          onUpdate(history[newIndex]);
      }
  }

  const handleRedo = () => {
      if (currentIndex < history.length - 1) {
          const newIndex = currentIndex + 1;
          setCurrentIndex(newIndex);
          onUpdate(history[newIndex]);
      }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-900 w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] border border-zinc-800">
        
        {/* Image Canvas */}
        <div className="w-full md:w-2/3 bg-black relative flex items-center justify-center p-8">
           {currentImage && (
             <img 
               src={currentImage} 
               alt="Editing" 
               className="max-h-full max-w-full object-contain shadow-2xl rounded-sm border border-zinc-800"
             />
           )}
           
           <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-white/10 border border-white/10 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md shadow-sm">
                    {outfit.style} Mode
                </span>
           </div>

           <div className="absolute top-4 right-4 flex items-center gap-3">
             <div className="flex items-center bg-black/60 border border-white/10 rounded-full backdrop-blur-md shadow-lg">
                 <button 
                    onClick={handleUndo}
                    disabled={currentIndex === 0}
                    className="p-2.5 hover:bg-white/20 rounded-l-full text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    title="Undo"
                 >
                     <Undo2 className="w-5 h-5" />
                 </button>
                 <div className="w-px h-4 bg-white/20"></div>
                 <button 
                    onClick={handleRedo}
                    disabled={currentIndex === history.length - 1}
                    className="p-2.5 hover:bg-white/20 rounded-r-full text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    title="Redo"
                 >
                     <Redo2 className="w-5 h-5" />
                 </button>
             </div>

             <button 
                onClick={handleDownload}
                className="p-2.5 bg-black/60 border border-white/10 rounded-full hover:bg-white hover:text-black text-white transition-all backdrop-blur-md shadow-lg"
                title="Download"
             >
               <Download className="w-5 h-5" />
             </button>
           </div>
        </div>

        {/* Controls */}
        <div className="w-full md:w-1/3 flex flex-col bg-zinc-900 border-l border-zinc-800">
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-serif font-bold text-white">Magic Edit</h2>
                <p className="text-xs text-zinc-500 mt-1">Powered by Gemini 2.5 Flash Image</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
              <X className="w-6 h-6 text-zinc-500 hover:text-white" />
            </button>
          </div>

          <div className="p-6 flex-grow overflow-y-auto space-y-6">
            <div className="space-y-4">
                <p className="text-sm text-zinc-400">
                    Use natural language to refine this look. Try adding accessories, changing the background, or adjusting the lighting.
                </p>

                <div className="flex flex-wrap gap-2">
                    {['Add a gold necklace', 'Change background to marble', 'Make it brighter', 'Add a leather jacket'].map(suggestion => (
                        <button 
                            key={suggestion}
                            onClick={() => setPrompt(suggestion)}
                            className="text-xs border border-zinc-700 px-3 py-1.5 rounded-full hover:bg-white hover:text-black transition-colors text-zinc-300"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="pt-4 border-t border-zinc-800">
                <h3 className="text-sm font-semibold text-white mb-2">Original Style Notes</h3>
                <p className="text-sm text-zinc-500 italic">
                    "{outfit.description}"
                </p>
            </div>
          </div>

          <div className="p-6 border-t border-zinc-800 bg-black/20">
             <div className="relative">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isEditing && handleEdit()}
                  placeholder="E.g., Swap the shoes for sneakers..."
                  className="w-full pl-4 pr-12 py-3 rounded-xl bg-black border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white transition-all shadow-inner"
                  disabled={isEditing}
                />
                <button 
                  onClick={handleEdit}
                  disabled={!prompt.trim() || isEditing}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white text-black rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isEditing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;