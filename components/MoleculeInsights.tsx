import React, { useEffect, useState } from 'react';
import { getMoleculeInsights } from '../services/geminiService';
import { MoleculeInsights as InsightsType } from '../types';
import { Sparkles } from 'lucide-react';

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
        <div className="p-6 space-y-3 bg-slate-50/50">
             <div className="h-3 bg-slate-200 rounded w-1/4 animate-pulse mb-4"></div>
             <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse"></div>
             <div className="h-3 bg-slate-200 rounded w-3/4 animate-pulse"></div>
        </div>
     )
  }

  if (!insights || (!insights.commonName && !insights.iupacName)) return null;

  return (
    <div className="bg-slate-50/50 p-6 animate-in fade-in duration-700">
        <div className="flex items-center gap-2 mb-3 text-indigo-500 opacity-80">
          <Sparkles className="w-3 h-3" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest">AI Insights</h3>
        </div>
        
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-medium text-slate-900">
                    {insights.commonName || insights.iupacName || "Molecule"}
                </h2>
                {insights.commonName && insights.iupacName && (
                    <p className="text-xs text-slate-500 mt-1 font-mono break-all opacity-80">{insights.iupacName}</p>
                )}
            </div>

            <div className="flex gap-8 py-2">
                <div className="flex flex-col">
                    <span className="text-[9px] uppercase text-slate-400 font-bold tracking-wider mb-0.5">Formula</span>
                    <span className="text-sm font-semibold text-slate-700">
                        {insights.formula ? (
                             <span>{insights.formula.split(/(\d+)/).map((part, i) => 
                                isNaN(Number(part)) ? part : <sub key={i} className="text-[10px]">{part}</sub>
                             )}</span>
                        ) : '—'}
                    </span>
                </div>
                 <div className="flex flex-col">
                    <span className="text-[9px] uppercase text-slate-400 font-bold tracking-wider mb-0.5">Mol. Weight</span>
                    <span className="text-sm font-semibold text-slate-700">{insights.molecularWeight || '—'}</span>
                </div>
            </div>

            {insights.description && (
                <div className="pt-2 border-t border-slate-200/60">
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                        {insights.description}
                    </p>
                </div>
            )}
        </div>
    </div>
  );
};

export default MoleculeInsights;
