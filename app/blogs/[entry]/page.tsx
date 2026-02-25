import ReactMarkdown from 'react-markdown';
import { getBlogBySlug } from '@/lib/stories';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import styles from '@/app/stories/[entry]/Entry.module.css';
import Image from 'next/image';
import { NavLink } from '@/components/index';

type Props = {
  params: Promise<{ entry: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const revalidate = 300; // Revalidate every 5 minutes

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { entry } = await params;

  const post = await getBlogBySlug(entry);

  if (!post) {
    return {
      title: 'Blog Not Found'
    };
  }

  return {
    title: post.metadata.title
  };
}

export default async function BlogEntry({
  params
}: {
  params: Promise<{ entry: string }>;
}) {
  const { entry } = await params;

  const post = await getBlogBySlug(entry);

  if (!post) {
    notFound();
  }

  const { title, description, cover } = post.metadata;

  return (
    <main>
      <NavLink
        href={'/blogs'}
        text='All blogs'
        direction='backward'
        className='mt-12 mb-6 sm:mt-20'
      />

      <div className='flex flex-col'>
        <h1 className='text-4xl font-bold'>{title}</h1>

        <p className='text-muted-foreground'>{description}</p>
      </div>

      {cover && (
        <div className='relative my-8 aspect-video'>
          <Image
            src={cover}
            alt={title}
            fill
            className='rounded-lg border-2 object-cover'
          />
        </div>
      )}

      <section className={styles['entry-main']}>
        <ReactMarkdown>{post.markdown}</ReactMarkdown>
      </section>
    </main>
  );
}
