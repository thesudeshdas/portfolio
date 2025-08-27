import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import { IStory } from '@/types/story/story.types';

const storiesDirectory = path.join(process.cwd(), 'assets/stories');

// Helper function to extract frontmatter from markdown content
const extractFrontmatter = (content: string) => {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return null;

  const frontmatter = frontmatterMatch[1];
  const metadata: Record<string, any> = {};

  frontmatter.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim();

      // Handle different value types
      if (value.startsWith("'") && value.endsWith("'")) {
        metadata[key.trim()] = value.slice(1, -1);
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Parse array values
        try {
          metadata[key.trim()] = JSON.parse(value);
        } catch {
          metadata[key.trim()] = value;
        }
      } else if (value === 'true' || value === 'false') {
        metadata[key.trim()] = value === 'true';
      } else if (!isNaN(Number(value))) {
        metadata[key.trim()] = Number(value);
      } else {
        metadata[key.trim()] = value;
      }
    }
  });

  return metadata;
};

export const getAllStories = async (): Promise<IStory[]> => {
  try {
    const files = await fs.readdir(storiesDirectory);
    const markdownFiles = files.filter((file) => file.endsWith('.md'));

    const stories: IStory[] = await Promise.all(
      markdownFiles.map(async (filename) => {
        const filePath = path.join(storiesDirectory, filename);
        const fileContents = await fs.readFile(filePath, 'utf8');

        // Generate slug from filename
        const slug = filename.replace(/\.md$/, '');

        // Extract frontmatter
        const frontmatter = extractFrontmatter(fileContents);

        // Use frontmatter values or fall back to content extraction
        const title =
          frontmatter?.title ||
          (() => {
            const titleMatch = fileContents.match(/^#\s+(.+)$/m);
            return titleMatch
              ? titleMatch[1].trim()
              : slug
                  .replace(/-/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase());
          })();

        const description =
          frontmatter?.summary ||
          frontmatter?.description ||
          (() => {
            const lines = fileContents.split('\n');
            for (const line of lines) {
              const trimmedLine = line.trim();
              if (
                trimmedLine &&
                !trimmedLine.startsWith('#') &&
                !trimmedLine.startsWith('![') &&
                !trimmedLine.startsWith('```') &&
                !trimmedLine.startsWith('---')
              ) {
                const desc = trimmedLine.slice(0, 150);
                return desc.length === 150 ? desc + '...' : desc;
              }
            }
            return 'No description available';
          })();

        const date =
          frontmatter?.date ||
          new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

        return {
          id: slug,
          title,
          description: description || 'No description available',
          date: typeof date === 'string' ? date : date.toISOString(),
          slug,
          icon: frontmatter?.icon || null,
          cover: frontmatter?.cover || null,
          tags: frontmatter?.tags
        };
      })
    );

    // Sort by date (newest first)
    return stories.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    return [];
  }
};

export const getStoryBySlug = async (slug: string) => {
  try {
    const filePath = path.join(storiesDirectory, `${slug}.md`);
    const fileContents = await fs.readFile(filePath, 'utf8');

    // Extract frontmatter
    const frontmatter = extractFrontmatter(fileContents);

    // Use frontmatter values or fall back to content extraction
    const title =
      frontmatter?.title ||
      (() => {
        const titleMatch = fileContents.match(/^#\s+(.+)$/m);
        return titleMatch
          ? titleMatch[1].trim()
          : slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      })();

    const description =
      frontmatter?.summary ||
      frontmatter?.description ||
      (() => {
        const lines = fileContents.split('\n');
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (
            trimmedLine &&
            !trimmedLine.startsWith('#') &&
            !trimmedLine.startsWith('![') &&
            !trimmedLine.startsWith('```') &&
            !trimmedLine.startsWith('---')
          ) {
            const desc = trimmedLine.slice(0, 150);
            return desc.length === 150 ? desc + '...' : desc;
          }
        }
        return 'No description available';
      })();

    const date =
      frontmatter?.date ||
      new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

    const metadata: IStory = {
      id: slug,
      title,
      description: description || 'No description available',
      date: typeof date === 'string' ? date : date.toISOString(),
      slug,
      icon: frontmatter?.icon || null,
      cover: frontmatter?.cover || null,
      tags: frontmatter?.tags
    };

    // Strip out frontmatter from markdown content
    const contentWithoutFrontmatter = fileContents.replace(
      /^---\n[\s\S]*?\n---\n?/,
      ''
    );

    return {
      metadata,
      markdown: contentWithoutFrontmatter
    };
  } catch (error) {
    return null;
  }
};
