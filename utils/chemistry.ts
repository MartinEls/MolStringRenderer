import { MoleculeFormat } from '../types';

export const detectFormat = (input: string): MoleculeFormat => {
  const trimmed = input.trim();
  if (!trimmed) return 'Unknown';
  
  // InChI always starts with "InChI="
  if (trimmed.startsWith('InChI=')) {
    return 'InChI';
  }
  
  // Basic heuristic for SMILES
  return 'SMILES';
};
