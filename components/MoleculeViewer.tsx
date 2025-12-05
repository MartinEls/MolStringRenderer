import React, { useState, useEffect, useRef } from 'react';
import { Download, Copy, RefreshCw, AlertCircle } from 'lucide-react';
import { RenderingState } from '../types';
import { getResolverUrl } from '../utils/chemistry';

interface MoleculeViewerProps {
  input: string;
}

const MoleculeViewer: React.FC<MoleculeViewerProps> = ({ input }) => {
  const [renderState, setRenderState] = useState<RenderingState>({
    status: 'idle',
    imageUrl: null,
  });
  const [isHovered, setIsHovered] = useState(false);
  const imageBlobRef = useRef<Blob | null>(null);

  useEffect(() => {
    let active = true;
    
    const fetchImage = async () => {
      if (!input) return;

      setRenderState({ status: 'loading', imageUrl: null });
      imageBlobRef.current = null;

      try {
        const url = getResolverUrl(input);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to render structure');
        }

        const blob = await response.blob();
        // Check if the blob is actually an image (NIH returns HTML text on some errors)
        if (blob.type === 'text/html') {
             throw new Error('Invalid structure string');
        }

        if (active) {
          imageBlobRef.current = blob;
          const objectUrl = URL.createObjectURL(blob);
          setRenderState({ status: 'success', imageUrl: objectUrl });
        }
      } catch (error) {
        if (active) {
          setRenderState({ 
            status: 'error', 
            imageUrl: null, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }
    };

    fetchImage();

    return () => {
      active = false;
      if (renderState.imageUrl) {
        URL.revokeObjectURL(renderState.imageUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const handleCopy = async () => {
    if (imageBlobRef.current) {
      try {
        // Clipboard API requires standard PNG/JPG
        const item = new ClipboardItem({ 'image/png': imageBlobRef.current });
        await navigator.clipboard.write([item]);
        alert('Copied to clipboard!');
      } catch (err) {
        console.error('Copy failed', err);
        alert('Failed to copy. Try downloading.');
      }
    }
  };

  const handleDownload = () => {
    if (renderState.imageUrl) {
      const a = document.createElement('a');
      a.href = renderState.imageUrl;
      a.download = 'molecule.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  if (renderState.status === 'idle') return null;

  if (renderState.status === 'error') {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-100 rounded-lg border border-slate-200 mt-8">
        <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm font-medium">Could not render molecule</p>
        <p className="text-xs mt-1">Please check your InChI or SMILES string.</p>
      </div>
    );
  }

  if (renderState.status === 'loading') {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-lg border border-slate-100 mt-8 animate-pulse">
        <RefreshCw className="w-6 h-6 animate-spin mb-2 opacity-30" />
        <span className="text-xs tracking-wider uppercase">Rendering</span>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full max-w-md mx-auto mt-8 group rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-8 flex items-center justify-center min-h-[300px] bg-white">
        {renderState.imageUrl && (
          <img 
            src={renderState.imageUrl} 
            alt="Molecular Structure" 
            className="max-w-full max-h-[300px] object-contain transition-transform duration-500 group-hover:scale-[1.02]"
          />
        )}
      </div>

      {/* Overlay Actions */}
      <div 
        className={`absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] flex items-center justify-center gap-4 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <button
          onClick={handleCopy}
          className="flex flex-col items-center justify-center w-16 h-16 bg-white rounded-lg shadow-lg text-slate-700 hover:text-slate-900 hover:scale-110 transition-all duration-200"
          title="Copy to Clipboard"
        >
          <Copy className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium uppercase tracking-wide">Copy</span>
        </button>
        
        <button
          onClick={handleDownload}
          className="flex flex-col items-center justify-center w-16 h-16 bg-white rounded-lg shadow-lg text-slate-700 hover:text-slate-900 hover:scale-110 transition-all duration-200"
          title="Download PNG"
        >
          <Download className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium uppercase tracking-wide">Save</span>
        </button>
      </div>
    </div>
  );
};

export default MoleculeViewer;