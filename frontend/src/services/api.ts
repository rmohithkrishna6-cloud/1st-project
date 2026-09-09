import { LanguageConfig, ExecutionResult, Snippet, User, FeedbackItem, DeveloperProfileStats } from '../types';

const API_BASE = `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/v1`;

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('codeticz_token') || localStorage.getItem('nexora_token');
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchLanguages(): Promise<LanguageConfig[]> {
  const res = await fetch(`${API_BASE}/languages`);
  if (!res.ok) throw new Error('Failed to fetch languages');
  const data = await res.json();
  return data.languages;
}

export async function executeCode(
  language: string,
  code: string,
  stdin: string = '',
  snippetId?: string,
  userId?: string
): Promise<ExecutionResult> {
  const res = await fetch(`${API_BASE}/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ language, code, stdin, snippetId, userId }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Execution request failed');
  }

  return res.json();
}

export async function fetchSnippets(): Promise<Snippet[]> {
  const res = await fetch(`${API_BASE}/snippets`);
  if (!res.ok) throw new Error('Failed to fetch snippets');
  const data = await res.json();
  return data.snippets;
}

export async function fetchSnippetById(id: string): Promise<Snippet> {
  const res = await fetch(`${API_BASE}/snippets/${id}`);
  if (!res.ok) throw new Error('Snippet not found');
  return res.json();
}

export async function saveSnippet(snippet: {
  title: string;
  language: string;
  code: string;
  stdin?: string;
  visibility?: string;
  userId?: string;
}): Promise<Snippet> {
  const res = await fetch(`${API_BASE}/snippets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(snippet),
  });
  if (!res.ok) throw new Error('Failed to save snippet');
  return res.json();
}

export async function fetchEmbedCode(id: string): Promise<{ snippetId: string; embedHtml: string; directUrl: string }> {
  const res = await fetch(`${API_BASE}/snippets/${id}/embed`);
  if (!res.ok) throw new Error('Failed to fetch embed code');
  return res.json();
}

export async function fetchExecutionHistory(): Promise<ExecutionResult[]> {
  const res = await fetch(`${API_BASE}/history`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch execution history');
  const data = await res.json();
  return data.history;
}

export async function deleteExecutionHistoryItem(id: string): Promise<{ success: boolean; id: string }> {
  const res = await fetch(`${API_BASE}/history/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete execution history log');
  return res.json();
}

export async function clearAllExecutionHistory(): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/history`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to clear execution history');
  return res.json();
}

export async function fetchUserUsage(): Promise<{
  plan: string;
  dailyLimit: number;
  usedToday: number;
  remainingToday: number;
  totalExecutions: number;
}> {
  const res = await fetch(`${API_BASE}/user/usage`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch usage metrics');
  return res.json();
}

export async function forkSnippet(id: string): Promise<Snippet> {
  const res = await fetch(`${API_BASE}/snippets/${id}/fork`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fork snippet');
  return res.json();
}

export async function starSnippet(id: string): Promise<Snippet> {
  const res = await fetch(`${API_BASE}/snippets/${id}/star`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to star snippet');
  return res.json();
}

export async function loginUser(email: string, password?: string): Promise<{ user: User; token: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Authentication failed');
  }
  return res.json();
}

export async function registerUser(
  email: string,
  password?: string,
  confirmPassword?: string,
  displayName?: string
): Promise<{ user: User; token: string; message?: string }> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, confirmPassword, displayName }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Registration failed');
  }
  return res.json();
}

export async function requestForgotPassword(email: string): Promise<{ success: boolean; email: string; message: string }> {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Password recovery request failed');
  }
  return res.json();
}

export async function resetPassword(
  email: string,
  newPassword?: string,
  confirmPassword?: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, newPassword, confirmPassword }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to reset password');
  }
  return res.json();
}

export async function transpileCode(
  sourceLanguage: string,
  targetLanguage: string,
  code: string
): Promise<{ sourceLanguage: string; targetLanguage: string; transpiledCode: string; notes: string }> {
  const res = await fetch(`${API_BASE}/languages/transpile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceLanguage, targetLanguage, code }),
  });
  if (!res.ok) throw new Error('Transpilation failed');
  return res.json();
}

export async function fetchFeedbacks(): Promise<FeedbackItem[]> {
  const res = await fetch(`${API_BASE}/feedback`);
  if (!res.ok) throw new Error('Failed to fetch feedback list');
  const data = await res.json();
  return data.feedbacks;
}

export async function submitFeedback(data: {
  category: 'bug' | 'feature' | 'general' | 'performance';
  title: string;
  message: string;
  userName?: string;
  userEmail?: string;
}): Promise<{ feedback: FeedbackItem; message: string }> {
  const res = await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to submit feedback');
  }
  return res.json();
}

export async function upvoteFeedback(id: string): Promise<{ feedback: FeedbackItem }> {
  const res = await fetch(`${API_BASE}/feedback/${id}/upvote`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to upvote feedback');
  return res.json();
}

export async function fetchDeveloperProfile(userId?: string, email?: string): Promise<DeveloperProfileStats> {
  const query = new URLSearchParams();
  if (userId) query.set('userId', userId);
  if (email) query.set('email', email);

  const qs = query.toString();
  const url = `${API_BASE}/user/developer-profile${qs ? `?${qs}` : ''}`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch developer profile metrics');
  return res.json();
}

export async function pingDailyStreak(userId?: string, email?: string): Promise<{ success: boolean; streak: DeveloperProfileStats['streak'] }> {
  const res = await fetch(`${API_BASE}/user/streak/ping`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ userId, email }),
  });
  if (!res.ok) throw new Error('Failed to ping daily streak');
  return res.json();
}

