import type { Metadata } from 'next';
import { DocumentEditor } from '@/components/documents/DocumentEditor';

export const metadata: Metadata = { title: 'Review application documents', robots: { index: false, follow: false } };
export default function DocumentPage({ params }: { params: { id: string } }) {
  return <DocumentEditor id={params.id} />;
}
