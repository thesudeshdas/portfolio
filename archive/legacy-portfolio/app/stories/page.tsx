import { StoriesContainer } from '@/components/index';
import { getAllStories } from '@/lib/stories';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stories | Dash',
  description: 'Stories of Dash'
};

export const revalidate = 300; // Revalidate every 5 minutes

export default async function Stories() {
  const publishedPosts = await getAllStories();

  if (!publishedPosts || publishedPosts.length === 0) {
    return (
      <main className='mx-auto px-4 py-8'>
        <h2 className='text-4xl font-semibold'>Stories</h2>
        <div className='text-muted-foreground mt-8 text-center'>
          <p>No stories available yet.</p>
        </div>
      </main>
    );
  }

  return (
    <StoriesContainer
      publishedPosts={publishedPosts}
      firstPostFeatured
    />
  );
}
