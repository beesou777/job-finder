import type { Metadata } from 'next';
import { DocumentLibrary } from '@/components/documents/DocumentLibrary';

export const metadata: Metadata = { title: 'Application documents', robots: { index: false, follow: false } };
export default function DocumentsPage({ searchParams }: { searchParams: { jobRef?: string | string[] } }) {
  return <DocumentLibrary jobRef={typeof searchParams.jobRef === 'string' ? searchParams.jobRef : undefined} />;
}
