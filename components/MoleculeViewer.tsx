import React, { useState, useEffect, useRef } from 'react';
import { Download, Copy, RefreshCw, AlertCircle } from 'lucide-react';
import { RenderingState } from '../types';
import { detectFormat } from '../utils/chemistry';
import { convertInchiToSmiles } from '../services/geminiService';
// @ts-ignore
import SmiDrawer from 'smiles-drawer';

interface MoleculeViewerProps {
  input: string;
}

const MoleculeViewer: React.FC<MoleculeViewerProps> = ({ input }) => {
  const [renderState, setRenderState] = useState<RenderingState>({
    status: 'idle',
    imageUrl: null,
  });
  const [isHovered, setIsHovered] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasId = "molecule-canvas-render";

  useEffect(() => {
    let active = true;

    const renderMolecule = async () => {
      if (!input) return;

      setRenderState({ status: 'loading', imageUrl: null });

      // Safety timeout
      const timeoutId = setTimeout(() => {
        if (active) {
            setRenderState(prev => 
                prev.status === 'loading' 
                ? { status: 'error', imageUrl: null, error: 'Rendering timed out.' }
                : prev
            );
        }
      }, 10000);

      try {
        // 1. Prepare SMILES string
        let smilesString = input.trim();
        const format = detectFormat(smilesString);

        if (format === 'InChI') {
          try {
             const converted = await convertInchiToSmiles(smilesString);
             if (converted) {
               smilesString = converted;
             } else {
               throw new Error("Conversion returned empty");
             }
          } catch (conversionError) {
             console.error("InChI Conversion failed", conversionError);
             if(active) {
                setRenderState({ status: 'error', imageUrl: null, error: 'Could not convert InChI to SMILES format.' });
             }
             return;
          }
        }

        if (!active) return;

        // 2. Initialize SmilesDrawer
        // Handle potential default export wrapping from ESM CDN
        const SD = (SmiDrawer as any).default || SmiDrawer;

        if (!SD || !SD.Drawer) {
            console.error("SmilesDrawer library not loaded correctly", SD);
            throw new Error("SmilesDrawer library failed to load");
        }

        // Configuration for 1.x
        const logicalWidth = 800;
        const logicalHeight = 800;

        const options = {
          width: logicalWidth,
          height: logicalHeight,
          bondThickness: 1.0, // Thicker for better visibility
          bondLength: 18,
          shortBondLength: 0.85,
          bondSpacing: 0.18 * 18,
          atomVisualization: 'default',
          isomeric: true,
          debug: false,
          terminalCarbons: true,
          explicitHydrogens: false,
          overlapSensitivity: 0.42,
          overlapResolutionIterations: 1,
          compactDrawing: true,
          fontSizeLarge: 7,
          fontSizeSmall: 4,
          padding: 20,
          themes: {
            light: {
              C: '#0f172a',
              O: '#ef4444',
              N: '#3b82f6',
              F: '#10b981',
              CL: '#10b981',
              BR: '#8b5cf6',
              I: '#8b5cf6',
              P: '#f59e0b',
              S: '#f59e0b',
              B: '#f59e0b',
              SI: '#f59e0b',
              H: '#94a3b8',
              BACKGROUND: '#ffffff'
            }
          }
        };

        const drawer = new SD.Drawer(options);
        
        // 3. Parse and Draw (1.0.10 Style)
        SD.parse(smilesString, (tree: any) => {
          if (!active) return;
          
          const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
          if (!canvas) {
             console.error("Canvas element not found by ID");
             return;
          }

          // Handle High DPI manually
          // SmilesDrawer 1.x doesn't handle Retina automatically, so we scale the context
          // but we tell the drawer the logical size (options.width/height).
          const dpr = window.devicePixelRatio || 1;
          
          // Set actual pixel size
          canvas.width = logicalWidth * dpr;
          canvas.height = logicalHeight * dpr;
          
          // Set display size
          canvas.style.width = `${logicalWidth / 2}px`; // CSS pixel size (400px)
          canvas.style.height = `${logicalHeight / 2}px`;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset
            ctx.scale(dpr, dpr); // Scale for retina
          }
          
          // Pass the ID string as per documentation
          drawer.draw(tree, canvasId, 'light', false);
          
          setRenderState({ status: 'success', imageUrl: 'rendered' });
          clearTimeout(timeoutId);

        }, (err: any) => {
          console.error("SmilesDrawer Parse Error:", err);
          if (active) {
            setRenderState({ status: 'error', imageUrl: null, error: 'Invalid molecule structure.' });
            clearTimeout(timeoutId);
          }
        });

      } catch (error) {
        console.error("General Render Error:", error);
        if (active) {
           setRenderState({ 
            status: 'error', 
            imageUrl: null, 
            error: 'Rendering failed.' 
          });
          clearTimeout(timeoutId);
        }
      }
    };

    renderMolecule();

    return () => {
      active = false;
    };
  }, [input]);

  const handleCopy = async () => {
    if (canvasRef.current) {
      try {
        canvasRef.current.toBlob(async (blob) => {
          if (!blob) throw new Error('Failed to create image blob');
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
        });
      } catch (err) {
        console.error('Copy failed', err);
      }
    }
  };

  const handleDownload = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `molecule-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div 
      className="relative w-full bg-white group border-b border-slate-100 transition-colors duration-300 min-h-[400px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Loading Overlay */}
      {(renderState.status === 'loading' || renderState.status === 'idle') && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white">
          <RefreshCw className="w-8 h-8 animate-spin mb-4 text-indigo-500 opacity-60" />
          <span className="text-xs tracking-widest uppercase font-medium text-slate-400">
             {renderState.status === 'idle' ? 'Ready...' : 'Processing Structure'}
          </span>
        </div>
      )}

      {/* Error Overlay */}
      {renderState.status === 'error' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-50 px-4">
          <AlertCircle className="w-10 h-10 mb-3 opacity-40 text-rose-400" />
          <p className="text-sm font-medium text-slate-500">Rendering Failed</p>
          <p className="text-xs mt-1 text-slate-400 px-4 text-center leading-relaxed max-w-xs">{renderState.error}</p>
        </div>
      )}

      {/* Canvas Container */}
      <div className={`flex items-center justify-center p-6 w-full h-full transition-opacity duration-700 ${renderState.status === 'success' ? 'opacity-100' : 'opacity-0'}`}>
        <canvas 
          id={canvasId}
          ref={canvasRef}
          // Initial dimensions; will be managed by JS for high-DPI
          width={800}
          height={800}
          className="w-full h-auto object-contain max-h-[400px] max-w-[400px] transition-transform duration-500 ease-out group-hover:scale-[1.02]"
        />
      </div>

      {/* Overlay Actions */}
      <div 
        className={`absolute inset-0 z-10 pointer-events-none flex items-center justify-center bg-white/0 transition-all duration-300 ${isHovered && renderState.status === 'success' ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className={`flex gap-4 pointer-events-auto transition-transform duration-300 ${isHovered ? 'translate-y-0' : 'translate-y-4'}`}>
            <button
            onClick={handleCopy}
            className="flex flex-col items-center justify-center w-16 h-16 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:-translate-y-1 transition-all duration-200"
            title="Copy Image"
            >
            <Copy className="w-5 h-5 mb-1.5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Copy</span>
            </button>
            
            <button
            onClick={handleDownload}
            className="flex flex-col items-center justify-center w-16 h-16 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 hover:-translate-y-1 transition-all duration-200"
            title="Download PNG"
            >
            <Download className="w-5 h-5 mb-1.5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Save</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default MoleculeViewer;