import React, { useState } from 'react';
import { detectFormat } from './utils/chemistry';
import MoleculeViewer from './components/MoleculeViewer';
import MoleculeInsights from './components/MoleculeInsights';
import { Hexagon } from 'lucide-react';

const App: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [submittedValue, setSubmittedValue] = useState('');
  
  const handleDraw = () => {
    if (!inputValue.trim()) return;
    setSubmittedValue(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleDraw();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-20 px-4 sm:px-6 lg:px-8 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Header */}
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 mb-2">
          <Hexagon className="w-6 h-6 text-slate-800" strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-light tracking-tight text-slate-900">
          MolString<span className="font-semibold">Renderer</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-xs mx-auto">
          Visualize InChI and SMILES strings with scientific precision.
        </p>
      </div>

      {/* Main Interaction Area */}
      <div className="w-full max-w-lg space-y-8">
        
        {/* Input Section */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-2 relative z-10">
           <div className="relative">
             <label htmlFor="mol-input" className="sr-only">InChI / SMILES</label>
             <input
                id="mol-input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Paste InChI or SMILES string here..."
                className="w-full px-4 py-4 bg-transparent text-slate-900 placeholder-slate-300 focus:outline-none text-base font-mono"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                 {inputValue && (
                     <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider transition-all duration-300 ${
                         detectFormat(inputValue) === 'InChI' ? 'bg-indigo-50 text-indigo-600' : 
                         detectFormat(inputValue) === 'SMILES' ? 'bg-emerald-50 text-emerald-600' : 'opacity-0'
                     }`}>
                         {detectFormat(inputValue)}
                     </span>
                 )}
              </div>
           </div>
           
           <button
             onClick={handleDraw}
             className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors duration-200 shadow-sm active:scale-[0.99] active:shadow-none"
           >
             Draw Structure
           </button>
        </div>

        {/* Unified Display Card */}
        {submittedValue && (
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                <MoleculeViewer input={submittedValue} />
                <MoleculeInsights input={submittedValue} />
            </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto pt-20 text-center">
        <p className="text-xs text-slate-300">
          Powered by SmilesDrawer & Gemini API
        </p>
      </footer>
    </div>
  );
};

export default App;
