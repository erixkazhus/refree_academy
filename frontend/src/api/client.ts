import {
  AdminPagedQuestionsResponse,
  AdminQuestion,
  AnswerEvaluation,
  ApiErrorPayload,
  PublicQuestion,
  PagedQuestionsResponse,
  RulebookBundle,
  UserProfile,
} from '../types';

export class ApiClientError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isFormData = init.body instanceof FormData;
  const headers: HeadersInit = isFormData
    ? init.headers || {}
    : { 'Content-Type': 'application/json', ...(init.headers || {}) };

  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const errPayload = data as ApiErrorPayload | null;
    throw new ApiClientError(
      response.status,
      errPayload?.message || `Request failed (${response.status})`,
      errPayload?.fieldErrors
    );
  }

  return data as T;
}

export const api = {
  getMe: () => request<UserProfile>('/api/auth/me'),

  login: (email: string, password: string) =>
    request<UserProfile>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (fullName: string, email: string, password: string) =>
    request<UserProfile>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password }),
    }),

  logout: () =>
    request<void>('/api/auth/logout', {
      method: 'POST',
    }),

  getQuestions: (category?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.set('category', category);
    if (search && search.trim()) params.set('search', search.trim());
    const qs = params.toString();
    return request<PublicQuestion[]>(`/api/questions${qs ? `?${qs}` : ''}`);
  },

  submitAnswer: (questionId: number, selectedOptionId: number) =>
    request<AnswerEvaluation>(`/api/questions/${questionId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ selectedOptionId }),
    }),

  adminListQuestions: () => request<AdminQuestion[]>('/api/admin/questions'),

  adminListPagedQuestions: (params: {
    category?: string;
    search?: string;
    page?: number;
    size?: number;
  }) => request<AdminPagedQuestionsResponse>(`/api/admin/questions/paged?${buildPagedQuery(params)}`),

  adminCreateQuestion: (payload: Omit<AdminQuestion, 'id' | 'videoUrl'>) =>
    request<AdminQuestion>('/api/admin/questions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  adminUpdateQuestion: (id: number, payload: Omit<AdminQuestion, 'id' | 'videoUrl'>) =>
    request<AdminQuestion>(`/api/admin/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  adminUploadVideo: (id: number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request<AdminQuestion>(`/api/admin/questions/${id}/video`, {
      method: 'POST',
      body: form,
    });
  },

  adminRemoveVideo: (id: number) =>
    request<AdminQuestion>(`/api/admin/questions/${id}/video`, {
      method: 'DELETE',
    }),

  getPagedQuestions: (params: {
    category?: string;
    search?: string;
    page?: number;
    size?: number;
    shuffle?: boolean;
    seed?: number;
  }) => request<PagedQuestionsResponse>(`/api/questions/paged?${buildPagedQuery(params)}`),

  getRulebook: () => request<RulebookBundle>('/api/rulebook'),

  adminDeleteQuestion: (id: number) =>
    request<void>(`/api/admin/questions/${id}`, {
      method: 'DELETE',
    }),
};

function buildPagedQuery(params: {
  category?: string;
  search?: string;
  page?: number;
  size?: number;
  shuffle?: boolean;
  seed?: number;
}): string {
  const qs = new URLSearchParams();
  if (params.category && params.category !== 'All') qs.set('category', params.category);
  if (params.search && params.search.trim()) qs.set('search', params.search.trim());
  if (typeof params.page === 'number') qs.set('page', String(params.page));
  if (typeof params.size === 'number') qs.set('size', String(params.size));
  if (params.shuffle) qs.set('shuffle', 'true');
  if (typeof params.seed === 'number') qs.set('seed', String(params.seed));
  return qs.toString();
}
