// src/app/animal.ts
export interface Animal {
  id: number;
  name: string;         // Nombre científico
  commonName: string;   // Nombre común
  imageUrl?: string;    // URL de la imagen
  iconic_taxon_name?: string; // Grupo taxonómico (aves, mamíferos, etc.)
  description?: string; // Descripción opcional
}