import ReactMarkdown from 'react-markdown';
import { getSinglePost } from '@/lib/notion';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { findAndStyleTime } from '@/lib/dateMe';

type Props = {
  params: Promise<{ entry: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { entry } = await params;

  const post = await getSinglePost(entry);

  return {
    title: post.metadata.title
  };
}

export default async function DiaryEntry({
  params
}: {
  params: Promise<{ entry: string }>;
}) {
  const { entry } = await params;

  const post = await getSinglePost(entry);

  if (!post) {
    notFound();
  }

  return (
    <section>
      <ReactMarkdown>{findAndStyleTime(post.markdown.parent)}</ReactMarkdown>
    </section>
  );
}
