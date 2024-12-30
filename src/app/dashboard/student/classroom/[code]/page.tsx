import ClassroomPageClient from './client';

interface PageProps {
  params: {
    code: string;
  };
}

export default function ClassroomPage({ params }: PageProps) {
  return <ClassroomPageClient code={params.code} />;
}
