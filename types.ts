export type OutfitStyle = 'Casual' | 'Business' | 'Night Out' | 'Athleisure' | 'Formal' | 'Bohemian';

export interface OutfitOption {
  id: string;
  style: OutfitStyle;
  description: string;
  imageUrl: string | null;
  isLoading: boolean;
}

export interface AnalysisResult {
  itemDescription: string;
  suggestions: {
    Casual: string;
    Business: string;
    NightOut: string;
    Athleisure: string;
    Formal: string;
    Bohemian: string;
  };
}

export type AppState = 'upload' | 'analyzing' | 'results' | 'editing';