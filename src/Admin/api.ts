import type { AdminSession, StageRecording } from './types';

const STORAGE_KEY = 'agora-admin-pwd';

export function getStoredPassword(): string | null {
  return sessionStorage.getItem(STORAGE_KEY);
}

export function storePassword(p: string): void {
  sessionStorage.setItem(STORAGE_KEY, p);
}

export function clearStoredPassword(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export async function adminLogin(password: string): Promise<boolean> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (res.ok) {
    storePassword(password);
    return true;
  }
  return false;
}

export async function fetchSessions(password: string): Promise<AdminSession[]> {
  const res = await fetch(`/api/admin/sessions?p=${encodeURIComponent(password)}`);
  if (!res.ok) throw new Error(`status ${res.status}`);
  return res.json();
}

export async function fetchStageRecordings(password: string): Promise<StageRecording[]> {
  const res = await fetch(`/api/admin/stage-recordings?p=${encodeURIComponent(password)}`);
  if (!res.ok) throw new Error(`status ${res.status}`);
  return res.json();
}

export async function deleteSession(id: number, password: string): Promise<void> {
  const res = await fetch(`/api/results/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error(`delete failed: ${res.status}`);
}

export function recordingUrl(sessionId: number, filename: string, password: string): string {
  return `/api/admin/recordings/${sessionId}/${filename}?p=${encodeURIComponent(password)}`;
}

export function stageRecordingUrl(filename: string, password: string): string {
  return `/api/admin/recordings/stage/${filename}?p=${encodeURIComponent(password)}`;
}
