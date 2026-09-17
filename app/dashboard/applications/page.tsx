import type { Metadata } from 'next';
import { ApplicationTracker } from '@/components/applications/ApplicationTracker';

export const metadata: Metadata = { title: 'Application tracker', robots: { index: false, follow: false } };
export default function ApplicationsPage() { return <ApplicationTracker />; }
