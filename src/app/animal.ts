// src/app/animal.ts
export interface Animal {
    id: number;
    name: string;
    photoUrl: string; // Si la API devuelve una imagen
    description: string; // Si la API tiene una descripción
  }
  