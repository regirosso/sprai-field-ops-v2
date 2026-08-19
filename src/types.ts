export type ValidationStatus = 'Pending' | 'Error' | 'Reviewed' | 'Completed';

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  status: ValidationStatus; // Usamos el type de arriba para ser consistentes
  observations: string;
  photos: string[];
  requiresPhoto: boolean;
  requiresAIValidation: boolean;
  aiFeedback?: string;       // ¡Importante! Para guardar lo que dice la IA
  checked?: boolean; 
  
  // --- ESTADO DE EJECUCIÓN ---
  taskStatus?: 'complete' | 'incomplete'; 
  incompleteReason?: string;             
}

export interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface AppState {
  sections: ChecklistSection[];
  signature?: string;
  technicianName: string;
  clientName: string;
  sprAiNumber: string;
  date: string;
  dateInicio: string;
  dateFin: string;
  signerName: string;
  signerCompany: string;
  signerRole: string;
  materialesFaltantes?: string;
  dobleTanqueConfig?: 'SI' | 'NO' | null;
  starlinkConfig?: 'SI' | 'NO' | null;
  compresorConfig?: 'SI' | 'NO' | null;   
  farosExtraConfig?: 'SI' | 'NO' | null;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  date: string;          
  clientName: string;    
  sprAiNumber: string;   
  filename: string;      
  data: AppState;
  driveUrl?: string;
  driveFileId?: string;
}
