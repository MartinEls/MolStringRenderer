import React, { useEffect, useState } from 'react';
import { getMoleculeInsights } from '../services/geminiService';
import { MoleculeInsights as InsightsType } from '../types';
import { Sparkles, Beaker } from 'lucide-react';

interface MoleculeInsightsProps {
  input: string;
}

const MoleculeInsights: React.FC<MoleculeInsightsProps> = ({ input }) => {
  const [insights, setInsights] = useState<InsightsType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!input) return;

    const fetchInsights = async () => {
      setLoading(true);
      const data = await getMoleculeInsights(input);
      setInsights(data);
      setLoading(false);
    };

    fetchInsights();
  }, [input]);

  if (loading) {
     return (
        <div className="mt-6 w-full max-w-md mx-auto space-y-3">
             <div className="h-4 bg-slate-100 rounded w-1/3 animate-pulse"></div>
             <div className="h-4 bg-slate-100 rounded w-2/3 animate-pulse"></div>
        </div>
     )
  }

  if (!insights || (!insights.commonName && !insights.iupacName)) return null;

  return (
    <div className="mt-8 w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-indigo-500">
          <Sparkles className="w-4 h-4" />
          <h3 className="text-xs font-semibold uppercase tracking-wider">AI Insights</h3>
        </div>
        
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-light text-slate-900">
                    {insights.commonName || insights.iupacName || "Molecule"}
                </h2>
                {insights.commonName && insights.iupacName && (
                    <p className="text-xs text-slate-400 mt-1 font-mono">{insights.iupacName}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-slate-400 font-medium">Formula</span>
                    <span className="text-sm font-medium text-slate-700">
                        {insights.formula ? (
                             <span>{insights.formula.split(/(\d+)/).map((part, i) => 
                                isNaN(Number(part)) ? part : <sub key={i}>{part}</sub>
                             )}</span>
                        ) : 'N/A'}
                    </span>
                </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-slate-400 font-medium">Mol. Weight</span>
                    <span className="text-sm font-medium text-slate-700">{insights.molecularWeight || 'N/A'}</span>
                </div>
            </div>

            {insights.description && (
                <div className="pt-2">
                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100/50">
                        {insights.description}
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MoleculeInsights;