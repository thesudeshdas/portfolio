import { StoriesContainer } from '@/components/index';
import { getAllBlogs } from '@/lib/stories';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blogs | Dash',
  description: 'Technical blogs by Dash'
};

export const revalidate = 300; // Revalidate every 5 minutes

export default async function Blogs() {
  const publishedPosts = await getAllBlogs();

  if (!publishedPosts || publishedPosts.length === 0) {
    return (
      <main className='mx-auto px-4 py-8'>
        <h2 className='text-4xl font-semibold'>Blogs</h2>
        <div className='text-muted-foreground mt-8 text-center'>
          <p>No blogs available yet.</p>
        </div>
      </main>
    );
  }

  return (
    <StoriesContainer
      publishedPosts={publishedPosts}
      basePath='/blogs'
      firstPostFeatured
      featuredHeader='Latest thoughts'
    />
  );
}
