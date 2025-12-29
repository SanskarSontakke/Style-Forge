import React, { useRef, useState } from 'react';
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react';

interface UploadZoneProps {
  onImageSelected: (base64: string) => void;
  isProcessing: boolean;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onImageSelected, isProcessing }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Extract base64 part
      const base64 = result.split(',')[1];
      onImageSelected(base64);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
          ${isDragging 
            ? 'border-white bg-zinc-900 scale-[1.02]' 
            : 'border-zinc-800 hover:border-zinc-600 bg-black'
          }
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => !isProcessing && inputRef.current?.click()}
      >
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          disabled={isProcessing}
        />

        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800 text-white">
            {isProcessing ? (
              <Loader2 className="w-10 h-10 animate-spin text-white" />
            ) : (
              <Upload className="w-10 h-10" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-serif font-semibold text-white">
              {isProcessing ? 'Analyzing your piece...' : 'Upload your item'}
            </h3>
            <p className="text-sm text-zinc-400 max-w-xs mx-auto">
              Drag & drop a photo of the clothing item you want to style, or click to browse.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        {[
            { label: 'Color Analysis', icon: '🎨' },
            { label: 'Style Matching', icon: '✨' },
            { label: '3 Outfit Ideas', icon: '👔' }
        ].map((feat, i) => (
            <div key={i} className="bg-zinc-900/50 p-4 rounded-lg shadow-sm border border-zinc-800 text-zinc-200">
                <div className="text-2xl mb-2">{feat.icon}</div>
                <div className="text-sm font-medium text-zinc-400">{feat.label}</div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default UploadZone;