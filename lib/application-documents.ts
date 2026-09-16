import { authFetch } from './auth-context';

export type DocumentContent = { resume: string; coverLetter: string };
export type DocumentJob = { ref: string; title: string; company: string; location: string; description: string; requirements: string; applyUrl: string | null; expiresAt: string | null; availability: 'active' | 'unknown' };
export type DocumentPack = {
  id: string; version: number; profileVersion: number; job: DocumentJob;
  content: DocumentContent;
  evidence: { matchedSkills: string[]; sourcePaths: string[]; notes: string[]; questions: string[]; language: 'en' | 'ne' };
  origin: 'template-v1' | 'user-edit'; reviewedAt: string | null; reviewedVersion: number | null;
  reviewValid: boolean; profileCurrent: boolean; jobCurrent: boolean; jobStatus: string; updatedAt: string;
};
export type PackSummary = { id: string; title: string; company: string; version: number; profileVersion: number; reviewedAt: string | null; profileCurrent: boolean; updatedAt: string };
export type DocumentContext = {
  job: DocumentJob;
  profile: { version: number; confirmed: boolean; fullName: string; aiSettings: { tailorResume: boolean; coverLetter: boolean; gapQuestions: boolean; language: 'auto' | 'en' | 'ne' } } | null;
};
export type DocumentHistory = { version: number; origin: string; createdAt: string }[];
export type DocumentRevision = { version: number; content: DocumentContent; origin: string; createdAt: string };

const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === 'string');
const integer = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
const nullableString = (value: unknown) => value === null || typeof value === 'string';
function job(value: unknown): value is DocumentJob {
  return object(value) && ['ref', 'title', 'company', 'location', 'description', 'requirements'].every((key) => typeof value[key] === 'string') && nullableString(value.applyUrl) && nullableString(value.expiresAt) && ['active', 'unknown'].includes(String(value.availability));
}
function pack(value: unknown): value is DocumentPack {
  if (!object(value) || !job(value.job) || !object(value.content) || !object(value.evidence)) return false;
  return typeof value.id === 'string' && integer(value.version) && integer(value.profileVersion) && typeof value.updatedAt === 'string' &&
    typeof value.content.resume === 'string' && typeof value.content.coverLetter === 'string' &&
    ['matchedSkills', 'sourcePaths', 'notes', 'questions'].every((key) => strings(value.evidence && (value.evidence as Record<string, unknown>)[key])) &&
    ['en', 'ne'].includes(String(value.evidence.language)) && ['template-v1', 'user-edit'].includes(String(value.origin)) &&
    ['reviewValid', 'profileCurrent', 'jobCurrent'].every((key) => typeof value[key] === 'boolean') &&
    nullableString(value.reviewedAt) && (value.reviewedVersion === null || integer(value.reviewedVersion)) && typeof value.jobStatus === 'string';
}
export class DocumentRequestError extends Error {
  constructor(message: string, readonly status: number, readonly unknownOutcome = false) { super(message); }
}
async function request(path: string, method = 'GET', body?: unknown, signal?: AbortSignal): Promise<unknown> {
  let response: Response;
  try {
    response = await authFetch(`/api/me/document-packs${path}`, { method, signal, cache: 'no-store', headers: { 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new DocumentRequestError(method === 'GET' ? 'Could not load your documents. Please retry.' : 'The result could not be confirmed. Reload the saved document before making another change.', 0, method !== 'GET');
  }
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const fallback = response.status === 401 ? 'Please sign in again to access your documents.' : response.status === 503 ? 'The document workspace is not available yet. Please try again later.' : response.status >= 500 ? 'The document service is unavailable. Please retry shortly.' : 'Could not complete this document action.';
    const message = response.status < 500 && object(data) && typeof data.message === 'string' ? data.message : fallback;
    throw new DocumentRequestError(message, response.status, method !== 'GET' && response.status >= 500);
  }
  return data;
}
function requirePack(value: unknown, mutation = false): DocumentPack {
  if (!pack(value)) throw new DocumentRequestError('The document service returned an unexpected response. Reload before continuing.', 0, mutation);
  return value;
}
export async function listDocumentPacks(signal?: AbortSignal): Promise<PackSummary[]> {
  const data = await request('', 'GET', undefined, signal);
  if (!object(data) || !Array.isArray(data.packs) || !data.packs.every((item: unknown) => object(item) && ['id', 'title', 'company', 'updatedAt'].every((key) => typeof item[key] === 'string') && integer(item.version) && integer(item.profileVersion) && nullableString(item.reviewedAt) && typeof item.profileCurrent === 'boolean')) throw new Error('Could not read your document list.');
  return data.packs as PackSummary[];
}
export async function loadDocumentContext(jobRef: string, signal?: AbortSignal): Promise<DocumentContext> {
  const data = await request(`/context?jobRef=${encodeURIComponent(jobRef)}`, 'GET', undefined, signal);
  if (!object(data) || !job(data.job)) throw new Error('Could not read this vacancy.');
  const p = data.profile;
  if (p !== null && (!object(p) || !integer(p.version) || typeof p.confirmed !== 'boolean' || typeof p.fullName !== 'string' || !object(p.aiSettings) || !['tailorResume', 'coverLetter', 'gapQuestions'].every((key) => typeof (p.aiSettings as Record<string, unknown>)[key] === 'boolean') || !['auto', 'en', 'ne'].includes(String(p.aiSettings.language)))) throw new Error('Could not read your profile settings.');
  return data as DocumentContext;
}
export async function loadDocumentPack(id: string, signal?: AbortSignal) { return requirePack(await request(`/${encodeURIComponent(id)}`, 'GET', undefined, signal)); }
export async function createDocumentPack(jobRef: string, expectedProfileVersion: number, requestId: string, signal?: AbortSignal) { return requirePack(await request('', 'POST', { jobRef, expectedProfileVersion, requestId }, signal), true); }
export async function saveDocumentPack(id: string, expectedVersion: number, content: DocumentContent, signal?: AbortSignal) { return requirePack(await request(`/${id}`, 'PUT', { expectedVersion, content }, signal), true); }
export async function reviewDocumentPack(id: string, expectedVersion: number, signal?: AbortSignal) { return requirePack(await request(`/${id}/review`, 'PUT', { expectedVersion, confirmAccurate: true }, signal), true); }
export async function deleteDocumentPack(id: string, signal?: AbortSignal) { await request(`/${id}`, 'DELETE', undefined, signal); }
export async function documentHistory(id: string, signal?: AbortSignal): Promise<DocumentHistory> {
  const data = await request(`/${id}/history`, 'GET', undefined, signal);
  if (!object(data) || !Array.isArray(data.revisions) || !data.revisions.every((item: unknown) => object(item) && integer(item.version) && typeof item.origin === 'string' && typeof item.createdAt === 'string')) throw new Error('Could not read revision history.');
  return data.revisions as DocumentHistory;
}
export async function loadDocumentRevision(id: string, version: number, signal?: AbortSignal): Promise<DocumentRevision> {
  const data = await request(`/${id}/revisions/${version}`, 'GET', undefined, signal);
  if (!object(data) || !integer(data.version) || !object(data.content) || typeof data.content.resume !== 'string' || typeof data.content.coverLetter !== 'string' || typeof data.origin !== 'string' || typeof data.createdAt !== 'string') throw new Error('Could not read this saved revision.');
  return { version: data.version, content: { resume: data.content.resume, coverLetter: data.content.coverLetter }, origin: data.origin, createdAt: data.createdAt };
}
export async function exportDocument(id: string, version: number, kind: keyof DocumentContent, format: 'txt' | 'html', signal?: AbortSignal): Promise<Blob> {
  const response = await authFetch(`/api/me/document-packs/${id}/export/${kind}?format=${format}&version=${version}`, { signal, cache: 'no-store' });
  if (!response.ok) throw new DocumentRequestError(response.status === 409 ? 'This document changed. Reload before downloading.' : 'Could not download this document. Please retry.', response.status);
  return response.blob();
}
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename; link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
