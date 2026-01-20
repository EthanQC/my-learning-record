import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ category: string }>;
}

export default async function InterviewQuestionsCategoryAliasPage({ params }: Props) {
  const { category } = await params;
  redirect(`/interview-questions/${category}`);
}
