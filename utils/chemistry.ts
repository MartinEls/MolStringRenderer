import { MoleculeFormat } from '../types';

export const detectFormat = (input: string): MoleculeFormat => {
  const trimmed = input.trim();
  if (!trimmed) return 'Unknown';
  
  // InChI always starts with "InChI="
  if (trimmed.startsWith('InChI=')) {
    return 'InChI';
  }
  
  // Basic heuristic for SMILES: 
  // SMILES usually contains alphanumeric chars and specific symbols like ()[]=#-
  // It shouldn't contain whitespace usually, but we are lenient.
  // If it's not InChI, we assume SMILES for the purpose of this renderer, 
  // as the resolver API handles format detection reasonably well too, 
  // but we want explicit UI feedback.
  return 'SMILES';
};

export const getResolverUrl = (input: string): string => {
  // Using NIH CACTUS service for robust rendering
  const encoded = encodeURIComponent(input.trim());
  return `https://cactus.nci.nih.gov/chemical/structure/${encoded}/image?format=png&width=500&height=500&bgcolor=transparent`;
};