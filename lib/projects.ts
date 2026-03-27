import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import { IProject, ProjectCategory } from '@/types/project/project.types';

const projectsDirectory = path.join(process.cwd(), 'assets/projects');

const extractFrontmatter = (content: string) => {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return null;

  const frontmatter = frontmatterMatch[1];
  const metadata: Record<string, any> = {};

  frontmatter.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim();

      if (value.startsWith("'") && value.endsWith("'")) {
        metadata[key.trim()] = value.slice(1, -1);
      } else if (value.startsWith('[') && value.endsWith(']')) {
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

export const getAllProjects = async (): Promise<IProject[]> => {
  try {
    const files = await fs.readdir(projectsDirectory);
    const markdownFiles = files.filter((file) => file.endsWith('.md'));

    const projects: IProject[] = await Promise.all(
      markdownFiles.map(async (filename) => {
        const filePath = path.join(projectsDirectory, filename);
        const fileContents = await fs.readFile(filePath, 'utf8');
        const slug = filename.replace(/\.md$/, '');
        const fm = extractFrontmatter(fileContents);

        return {
          slug,
          title: fm?.title || slug,
          description: fm?.description || '',
          category: fm?.category || 'personal',
          status: fm?.status || 'active',
          role: fm?.role || '',
          highlight: fm?.highlight,
          year: String(fm?.year || ''),
          organisation: fm?.organisation,
          cover: fm?.cover,
          live: fm?.live,
          sourceCode: fm?.sourceCode,
          techStack: fm?.techStack || [],
          featured: fm?.featured || false,
          order: fm?.order,
          relatedStories: fm?.relatedStories
        };
      })
    );

    return projects.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;

      const orderA = a.order ?? Infinity;
      const orderB = b.order ?? Infinity;
      if (orderA !== orderB) return orderA - orderB;

      return b.year.localeCompare(a.year);
    });
  } catch {
    return [];
  }
};

export const getProjectBySlug = async (
  slug: string
): Promise<{
  metadata: IProject;
  markdown: string;
} | null> => {
  try {
    const filePath = path.join(projectsDirectory, `${slug}.md`);
    const fileContents = await fs.readFile(filePath, 'utf8');
    const fm = extractFrontmatter(fileContents);

    const metadata: IProject = {
      slug,
      title: fm?.title || slug,
      description: fm?.description || '',
      category: fm?.category || 'personal',
      status: fm?.status || 'active',
      role: fm?.role || '',
      highlight: fm?.highlight,
      year: String(fm?.year || ''),
      organisation: fm?.organisation,
      cover: fm?.cover,
      live: fm?.live,
      sourceCode: fm?.sourceCode,
      techStack: fm?.techStack || [],
      featured: fm?.featured || false,
      order: fm?.order,
      relatedStories: fm?.relatedStories
    };

    const markdown = fileContents.replace(/^---\n[\s\S]*?\n---\n?/, '');

    return { metadata, markdown };
  } catch {
    return null;
  }
};

export const getProjectsByCategory = async (
  category: ProjectCategory
): Promise<IProject[]> => {
  const all = await getAllProjects();
  return all.filter((p) => p.category === category);
};
