export type ColumnStatus = 'waiting' | 'ai' | 'editing' | 'done' | 'review';

export type ReferralOption = 'Nenhum' | 'Higor Neves' | 'Ferini' | 'Augusto e Geraldo' | 'Gabriel Rebouças' | 'HE' | 'Outros';

export interface Editor {
  id: string;
  name: string;
  avatarColor?: string; // Tailwind class name or gradient class
  role: string;
}

export interface VSLProject {
  id: string;
  clientName: string;
  title: string;
  description?: string;
  editor: Editor;
  status: ColumnStatus;
  startDate: string; // Format "YYYY-MM-DD" (Data de Entrada)
  dueDate: string; // Format "YYYY-MM-DD" (Prazo Final)
  priority: 'low' | 'medium' | 'high';
  duration?: string; // e.g., "12:30" or "08:15"
  category?: string; // e.g., "Saúde", "Finanças", "Marketing"
  budget?: string; // e.g., "R$ 1.500"
  requiresAI?: boolean; // AI production flag
  aiManagerName?: string; // AI manager name
  aiManagerCost?: string; // AI manager cost
  editorCost?: string; // Editor cost
  referral: ReferralOption;
  comissionPercentage?: number;
}

