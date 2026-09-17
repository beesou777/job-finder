import { authFetch } from './auth-context';

export type TrackedApplication = { id: string; jobRef: string; jobTitle: string; company: string | null; destinationUrl: string | null; documentPackId: string | null; documentVersion: number | null; stage: 'prepared' | 'user_action_required' | 'applied_user_reported' | 'acknowledged' | 'interview' | 'rejected' | 'offer' | 'withdrawn'; evidenceType: 'user_reported' | 'receipt'; note: string | null; appliedAt: string | null; lastEventAt: string | null; createdAt: string; updatedAt: string };

async function call(path: string, init?: RequestInit) {
  const response = await authFetch(`/api/me/applications${path}`, { cache: 'no-store', ...init });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(response.status === 409 ? 'This application changed in another session. Reload and try again.' : response.status >= 500 ? 'The application tracker is unavailable. Try again shortly.' : 'Could not update the application tracker.');
  return body;
}
function object(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function isApplication(value: unknown): value is TrackedApplication {
  return object(value) && typeof value.id === 'string' && typeof value.jobRef === 'string' && typeof value.jobTitle === 'string' && ['prepared', 'user_action_required', 'applied_user_reported', 'acknowledged', 'interview', 'rejected', 'offer', 'withdrawn'].includes(String(value.stage)) && value.company !== undefined && value.destinationUrl !== undefined && value.documentPackId !== undefined && value.documentVersion !== undefined && value.evidenceType === 'user_reported' && [value.note, value.appliedAt, value.lastEventAt].every((item) => item === null || typeof item === 'string') && typeof value.updatedAt === 'string' && typeof value.createdAt === 'string';
}
export async function listApplications(): Promise<TrackedApplication[]> {
  const body = await call('');
  if (!object(body) || !Array.isArray(body.applications) || !body.applications.every(isApplication)) throw new Error('The application tracker returned an unexpected response.');
  return body.applications;
}
export async function createApplication(input: { jobRef: string; jobTitle: string; company?: string | null; destinationUrl?: string | null; documentPackId?: string | null; documentVersion?: number | null }): Promise<TrackedApplication> {
  const body = await call('', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
  if (!isApplication(body)) throw new Error('The application tracker returned an unexpected response.');
  return body;
}
export async function updateApplication(application: TrackedApplication, stage: TrackedApplication['stage'], note: string): Promise<TrackedApplication> {
  const body = await call(`/${encodeURIComponent(application.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expectedUpdatedAt: application.updatedAt, stage, note: note.trim() || null }) });
  if (!isApplication(body)) throw new Error('The application tracker returned an unexpected response.');
  return body;
}
export async function deleteApplication(application: TrackedApplication) { await call(`/${encodeURIComponent(application.id)}`, { method: 'DELETE' }); }
