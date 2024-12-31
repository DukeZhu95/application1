import { use } from 'react';
import ClassroomPageClient from './client';

export default function ClassroomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  return <ClassroomPageClient code={code} />;
}
