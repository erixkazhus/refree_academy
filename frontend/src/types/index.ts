export type Role = 'USER' | 'ADMIN';

export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  totalAttempts: number;
  correctAttempts: number;
}

export interface PublicOption {
  id: number;
  sortOrder: number;
  optionLabel: string;
}

export interface PublicQuestion {
  id: number;
  title: string;
  ruleReference: string;
  category: string;
  difficulty: string;
  prompt: string;
  videoUrl: string | null;
  options: PublicOption[];
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface PagedQuestionsResponse {
  items: PublicQuestion[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  seed: number;
  categories: CategoryCount[];
}

export interface AnswerEvaluation {
  questionId: number;
  selectedOptionId: number;
  correct: boolean;
  explanation: string;
  ruleReference: string;
}

export interface AdminOption {
  id?: number;
  sortOrder?: number;
  optionLabel: string;
  correct: boolean;
  explanation: string;
}

export interface AdminQuestion {
  id: number;
  title: string;
  ruleReference: string;
  category: string;
  difficulty: string;
  prompt: string;
  videoUrl: string | null;
  options: AdminOption[];
}

export interface AdminPagedQuestionsResponse {
  items: AdminQuestion[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  categories: CategoryCount[];
}

export interface ApiErrorPayload {
  status: number;
  error: string;
  message: string;
  fieldErrors?: Record<string, string>;
}

export interface RuleSubPoint {
  code: string;
  heading: string;
  body: string;
  bullets?: string[] | null;
}

export interface RuleExample {
  code: string;
  kind: 'Statement' | 'Example' | string;
  text: string;
  interpretation?: string | null;
}

export interface RuleArticle {
  id: string;
  articleNumber: string;
  title: string;
  subtitle?: string | null;
  subPoints: RuleSubPoint[];
  examples?: RuleExample[];
  signalNumbers?: number[];
}

export interface RuleSection {
  id: string;
  ruleNumber: string;
  title: string;
  articles: RuleArticle[];
}

export interface RefereeSignal {
  number: number;
  category: string;
  name: string;
  action: string;
  imagePath: string;
}

export interface RulebookBundle {
  sections: RuleSection[];
  signals: RefereeSignal[];
}
