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

/**
 * Safely executes fetch and converts connection drops into clean Error objects
 */
async function safeFetch(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (err: any) {
    throw new Error(
      `Unable to reach Codeticz server (${err?.message || 'Network connection failed'}). ` +
      `Please check your internet connection or verify the backend service is active.`
    );
  }
}

/**
 * Safely parses JSON from a Response without crashing on empty bodies,
 * reverse proxy 502/503/504 pages, or unexpected HTML outputs.
 */
async function safeParseJsonResponse<T = any>(res: Response, defaultError = 'Request failed'): Promise<T> {
  const rawText = await res.text().catch(() => '');
  let data: any = null;

  if (rawText && rawText.trim().length > 0) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    // 1. Structured JSON error from backend
    if (data && (data.error || data.message)) {
      throw new Error(data.error || data.message);
    }

    // 2. Cloud reverse proxy / cold start (Render free tier / Vercel gateway timeout)
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      throw new Error(
        `Backend compiler engine is currently starting up (HTTP ${res.status}). ` +
        `Free-tier cloud instances sleep after inactivity and need ~20-30 seconds to wake up. ` +
        `Please wait a moment and click "Run Code" again.`
      );
    }

    // 3. Rate limited
    if (res.status === 429) {
      throw new Error(
        'Rate limit reached: Anonymous code runs are limited to 5/minute. Please sign in or wait 60 seconds.'
      );
    }

    // 4. Concise text error
    if (rawText && rawText.length < 250 && !rawText.includes('<html') && !rawText.includes('<!DOCTYPE')) {
      throw new Error(`Server error (${res.status}): ${rawText.trim()}`);
    }

    // 5. Generic HTTP status error
    throw new Error(`${defaultError} (HTTP ${res.status}: ${res.statusText || 'Server Error'})`);
  }

  if (data === null) {
    if (rawText.trim().length === 0) {
      return {} as T;
    }
    throw new Error('Server returned an unexpected non-JSON response format.');
  }

  return data as T;
}

export async function fetchLanguages(): Promise<LanguageConfig[]> {
  const res = await safeFetch(`${API_BASE}/languages`);
  const data = await safeParseJsonResponse<{ languages: LanguageConfig[] }>(res, 'Failed to fetch languages');
  return data.languages || [];
}

export async function executeCode(
  language: string,
  code: string,
  stdin: string = '',
  snippetId?: string,
  userId?: string
): Promise<ExecutionResult> {
  const res = await safeFetch(`${API_BASE}/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ language, code, stdin, snippetId, userId }),
  });

  return await safeParseJsonResponse<ExecutionResult>(res, 'Execution request failed');
}

export async function fetchSnippets(): Promise<Snippet[]> {
  const res = await safeFetch(`${API_BASE}/snippets`);
  const data = await safeParseJsonResponse<{ snippets: Snippet[] }>(res, 'Failed to fetch snippets');
  return data.snippets || [];
}

export async function fetchSnippetById(id: string): Promise<Snippet> {
  const res = await safeFetch(`${API_BASE}/snippets/${id}`);
  return await safeParseJsonResponse<Snippet>(res, 'Snippet not found');
}

export async function saveSnippet(snippet: {
  title: string;
  language: string;
  code: string;
  stdin?: string;
  visibility?: string;
  userId?: string;
}): Promise<Snippet> {
  const res = await safeFetch(`${API_BASE}/snippets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(snippet),
  });
  return await safeParseJsonResponse<Snippet>(res, 'Failed to save snippet');
}

export async function deleteSnippet(id: string): Promise<{ message: string; id: string }> {
  const res = await safeFetch(`${API_BASE}/snippets/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return await safeParseJsonResponse<{ message: string; id: string }>(res, 'Failed to delete snippet');
}

export async function fetchEmbedCode(id: string): Promise<{ snippetId: string; embedHtml: string; directUrl: string }> {
  const res = await safeFetch(`${API_BASE}/snippets/${id}/embed`);
  return await safeParseJsonResponse<{ snippetId: string; embedHtml: string; directUrl: string }>(res, 'Failed to fetch embed code');
}

export async function fetchExecutionHistory(): Promise<ExecutionResult[]> {
  const res = await safeFetch(`${API_BASE}/history`, {
    headers: getAuthHeaders(),
  });
  const data = await safeParseJsonResponse<{ history: ExecutionResult[] }>(res, 'Failed to fetch execution history');
  return data.history || [];
}

export async function deleteExecutionHistoryItem(id: string): Promise<{ success: boolean; id: string }> {
  const res = await safeFetch(`${API_BASE}/history/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return await safeParseJsonResponse<{ success: boolean; id: string }>(res, 'Failed to delete execution history log');
}

export async function clearAllExecutionHistory(): Promise<{ success: boolean }> {
  const res = await safeFetch(`${API_BASE}/history`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return await safeParseJsonResponse<{ success: boolean }>(res, 'Failed to clear execution history');
}

export async function fetchUserUsage(): Promise<{
  plan: string;
  dailyLimit: number;
  usedToday: number;
  remainingToday: number;
  totalExecutions: number;
}> {
  const res = await safeFetch(`${API_BASE}/user/usage`, {
    headers: getAuthHeaders(),
  });
  return await safeParseJsonResponse(res, 'Failed to fetch usage metrics');
}

export async function forkSnippet(id: string): Promise<Snippet> {
  const res = await safeFetch(`${API_BASE}/snippets/${id}/fork`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return await safeParseJsonResponse<Snippet>(res, 'Failed to fork snippet');
}

export async function starSnippet(id: string): Promise<Snippet> {
  const res = await safeFetch(`${API_BASE}/snippets/${id}/star`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return await safeParseJsonResponse<Snippet>(res, 'Failed to star snippet');
}

export async function loginUser(email: string, password?: string): Promise<{ user: User; token: string }> {
  const res = await safeFetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return await safeParseJsonResponse<{ user: User; token: string }>(res, 'Authentication failed');
}

export async function registerUser(
  email: string,
  password?: string,
  confirmPassword?: string,
  displayName?: string
): Promise<{ user: User; token: string; message?: string }> {
  const res = await safeFetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, confirmPassword, displayName }),
  });
  return await safeParseJsonResponse<{ user: User; token: string; message?: string }>(res, 'Registration failed');
}

export async function requestForgotPassword(email: string): Promise<{ success: boolean; email: string; message: string }> {
  const res = await safeFetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return await safeParseJsonResponse<{ success: boolean; email: string; message: string }>(res, 'Password recovery request failed');
}

export async function resetPassword(
  email: string,
  newPassword?: string,
  confirmPassword?: string
): Promise<{ success: boolean; message: string }> {
  const res = await safeFetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, newPassword, confirmPassword }),
  });
  return await safeParseJsonResponse<{ success: boolean; message: string }>(res, 'Failed to reset password');
}

export async function transpileCode(
  sourceLanguage: string,
  targetLanguage: string,
  code: string
): Promise<{ sourceLanguage: string; targetLanguage: string; transpiledCode: string; notes: string }> {
  const res = await safeFetch(`${API_BASE}/languages/transpile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceLanguage, targetLanguage, code }),
  });
  return await safeParseJsonResponse<{ sourceLanguage: string; targetLanguage: string; transpiledCode: string; notes: string }>(res, 'Transpilation failed');
}

export async function fetchFeedbacks(): Promise<FeedbackItem[]> {
  const res = await safeFetch(`${API_BASE}/feedback`);
  const data = await safeParseJsonResponse<{ feedbacks: FeedbackItem[] }>(res, 'Failed to fetch feedback list');
  return data.feedbacks || [];
}

export async function submitFeedback(data: {
  category: 'bug' | 'feature' | 'general' | 'performance';
  title: string;
  message: string;
  userName?: string;
  userEmail?: string;
}): Promise<{ feedback: FeedbackItem; message: string }> {
  const res = await safeFetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await safeParseJsonResponse<{ feedback: FeedbackItem; message: string }>(res, 'Failed to submit feedback');
}

export async function upvoteFeedback(id: string): Promise<{ feedback: FeedbackItem }> {
  const res = await safeFetch(`${API_BASE}/feedback/${id}/upvote`, {
    method: 'POST',
  });
  return await safeParseJsonResponse<{ feedback: FeedbackItem }>(res, 'Failed to upvote feedback');
}

export async function fetchDeveloperProfile(userId?: string, email?: string): Promise<DeveloperProfileStats> {
  const query = new URLSearchParams();
  if (userId) query.set('userId', userId);
  if (email) query.set('email', email);

  const qs = query.toString();
  const url = `${API_BASE}/user/developer-profile${qs ? `?${qs}` : ''}`;
  const res = await safeFetch(url, {
    headers: getAuthHeaders(),
  });
  return await safeParseJsonResponse<DeveloperProfileStats>(res, 'Failed to fetch developer profile metrics');
}

export async function pingDailyStreak(userId?: string, email?: string): Promise<{ success: boolean; streak: DeveloperProfileStats['streak'] }> {
  const res = await safeFetch(`${API_BASE}/user/streak/ping`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ userId, email }),
  });
  return await safeParseJsonResponse<{ success: boolean; streak: DeveloperProfileStats['streak'] }>(res, 'Failed to ping daily streak');
}

