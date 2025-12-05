export type MoleculeFormat = 'SMILES' | 'InChI' | 'Unknown';

export interface MoleculeData {
  input: string;
  format: MoleculeFormat;
}

export interface MoleculeInsights {
  commonName?: string;
  iupacName?: string;
  formula?: string;
  molecularWeight?: string;
  description?: string;
}

export interface RenderingState {
  status: 'idle' | 'loading' | 'success' | 'error';
  imageUrl: string | null;
  error?: string;
}