import ReactMarkdown from 'react-markdown';
import { getSinglePost } from '@/lib/notion';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

import styles from './Entry.module.css';

type Props = {
  params: Promise<{ entry: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const revalidate = 300; // Revalidate every 5 minutes

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

  // const contentToBeShown = findAndStyleTime(post.markdown.parent);
  const contentToBeShown = post.markdown.parent;

  if (!post) {
    notFound();
  }

  return (
    <section className={styles['entry-main']}>
      <ReactMarkdown>{contentToBeShown}</ReactMarkdown>
    </section>
  );
}
