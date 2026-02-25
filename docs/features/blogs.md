# Writing Content — Stories & Blogs

This site has two content sections, both powered by the same markdown system.

|                  | Stories                                  | Blogs                                |
| ---------------- | ---------------------------------------- | ------------------------------------ |
| **What**         | Personal — travel, thoughts, experiences | Technical — dev, tools, tutorials    |
| **Route**        | `/stories` and `/stories/<slug>`         | `/blogs` and `/blogs/<slug>`         |
| **Markdown dir** | `assets/stories/`                        | `assets/blogs/`                      |
| **Image dir**    | `public/images/stories/`                 | `public/images/blogs/`               |
| **Homepage**     | Shows latest 3 under "Latest rants"      | Shows latest 3 under a blogs section |

Both sections use the same frontmatter schema, the same parsing logic, the same rendering, and the same image conventions. The only difference is the content directory, image directory, and route.

## Quick Start

### Writing a Story

```bash
touch assets/stories/my-weekend-trip.md
mkdir -p public/images/stories/my-weekend-trip
```

### Writing a Blog

```bash
touch assets/blogs/setting-up-neovim.md
mkdir -p public/images/blogs/setting-up-neovim
```

Then:

1. Add images to the matching image folder
2. Add frontmatter at the top of the `.md` file (see template below)
3. Write content in markdown, referencing images as `/images/stories/<slug>/photo.jpg` or `/images/blogs/<slug>/photo.jpg`
4. Preview locally with `pnpm dev`
5. Commit and deploy

## File Locations

```
assets/
  stories/                          <-- personal/travel content
    the-first-real-solo.md
    my-weekend-trip.md
  blogs/                            <-- technical content
    setting-up-neovim.md
    react-server-components.md

public/
  images/
    stories/                        <-- images for stories
      the-first-real-solo/
        cover.jpg
        br-hills.jpg
      my-weekend-trip/
        cover.jpg
        campsite.jpg
    blogs/                          <-- images for blogs
      setting-up-neovim/
        cover.jpg
        screenshot.png
      react-server-components/
        cover.jpg
        diagram.png
```

The image folder name matches the markdown filename (which is also the slug).

## Frontmatter

Both stories and blogs use the same frontmatter schema.

### Template

```markdown
---
title: 'Your Post Title'
date: 2026-02-24
tags: ['tag1', 'tag2']
description: 'A short one-liner that appears in the card and below the title'
cover: '/images/stories/your-post-slug/cover.jpg'
---

Your content starts here...
```

Adjust the `cover` path based on the section — `/images/stories/...` or `/images/blogs/...`.

### Field Reference

| Field         | Required | Type                            | Description                                                                                                     |
| ------------- | -------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `title`       | No\*     | string (single-quoted)          | Post title. \*Falls back to first `# heading`, then filename                                                    |
| `date`        | No\*     | `YYYY-MM-DD`                    | Publication date. \*Falls back to current date. Used for sorting (newest first)                                 |
| `description` | No\*     | string (single-quoted)          | Short excerpt for cards/SEO. \*Falls back to first paragraph (max 150 chars)                                    |
| `cover`       | No       | path/URL string (single-quoted) | Cover image. Use local path `/images/{stories,blogs}/<slug>/cover.jpg`. Shown as hero on post page and in cards |
| `tags`        | No       | JSON array                      | Categorisation tags, e.g. `['travel', 'tech']`                                                                  |
| `icon`        | No       | string                          | Icon identifier (not currently rendered anywhere)                                                               |

**Recommendation**: Always provide `title`, `date`, `description`, and `tags` explicitly. The fallback logic exists but explicit values give you control over how the post appears.

### Frontmatter Gotchas

- **Strings must be single-quoted**: `title: 'My Post'` (not `title: My Post`)
- **Tags must be valid JSON**: `tags: ['a', 'b']` (not `tags: [a, b]`)
- **Date is bare** (no quotes): `date: 2026-02-24`
- **Apostrophes in strings**: The parser reads until the last `'` on the value side, so `description: 'Daisy's first crash'` works fine
- **Colons in values**: The parser splits on the first `:` only and joins the rest, so URLs work

## URL / Slug

The slug is derived from the filename:

```
assets/stories/my-weekend-trip.md   -->  /stories/my-weekend-trip
assets/blogs/setting-up-neovim.md   -->  /blogs/setting-up-neovim
```

Rules:

- Use **kebab-case** for filenames (lowercase, words separated by hyphens)
- No spaces, no special characters
- The slug is permanent once published (changing the filename changes the URL, breaking existing links)

## Writing Content

Standard markdown is supported. Here's what renders well with the current CSS:

### Headings

Use `##` and `###` for section headings. Don't use `#` (h1) — the post title already renders as h1.

```markdown
## Section Heading (renders at 1.5rem)

### Sub-section Heading (renders at 1.25rem)
```

### Text Formatting

```markdown
**bold text**
_italic text_
~~strikethrough~~
`inline code`
[link text](https://example.com)
```

### Images

```markdown
![alt text](/images/stories/your-post-slug/photo.jpg)
![alt text](/images/blogs/your-post-slug/screenshot.png)
```

See the [Images](#images) section for full details.

### Lists

```markdown
- Bullet point
- Another point
  - Nested point

1. Numbered item
2. Another item
```

### Blockquotes

```markdown
> This is a blockquote
```

### Code Blocks

````markdown
```javascript
const hello = 'world';
```
````

**Note**: There is no syntax highlighting configured. Code blocks render as plain preformatted text.

### Horizontal Rules

```markdown
---
```

**Warning**: Don't put `---` at the very beginning of your content (after frontmatter). The parser uses `---` to delimit frontmatter. Within the body after some content, it's fine.

## Images

All images are stored locally in `public/images/`. No external hosting, no CDN, no expiring URLs.

### Directory Convention

Create a folder per post, named the same as the post slug, under the matching section:

```
public/images/
  stories/
    my-weekend-trip/
      cover.jpg
      campsite.jpg
  blogs/
    setting-up-neovim/
      cover.jpg
      screenshot.png
```

### Referencing Images

```markdown
<!-- Cover image (in frontmatter) -->

cover: '/images/stories/my-weekend-trip/cover.jpg'

<!-- Inline image (in markdown body) -->

![Campsite at dawn](/images/stories/my-weekend-trip/campsite.jpg)
```

### Cover Images

The `cover` field renders as a full-width hero (aspect-video, `object-cover`) using Next.js `Image` component.

- Local paths (starting with `/`) work out of the box — no `next.config.ts` changes needed
- If you ever use an external URL, the hostname must be whitelisted in `next.config.ts` under `images.remotePatterns`

### Inline Images (in markdown body)

Rendered by `react-markdown` as plain `<img>` tags. Styled by CSS module:

- Centered horizontally
- Max width of `40rem`
- `32px` vertical margin
- Rounded corners

### Image Tips

- **Resize before committing.** Rarely needs to be wider than 1400px
- **Use descriptive filenames.** `campsite-dawn.jpg` over `IMG_4392.jpg`
- **Prefer `.jpg` for photos, `.png` for screenshots/diagrams**
- **Keep cover images landscape** (hero renders as 16:9)

## Publishing Workflow

### Write Locally

```bash
# Story
touch assets/stories/my-new-story.md
mkdir -p public/images/stories/my-new-story

# Blog
touch assets/blogs/my-new-blog.md
mkdir -p public/images/blogs/my-new-blog

# Preview
pnpm dev
# Visit http://localhost:3003/stories/my-new-story
# Visit http://localhost:3003/blogs/my-new-blog
```

### Deploy

Commit and push. Once deployed, the post is live.

```bash
# Story
git add assets/stories/my-new-story.md public/images/stories/my-new-story/
git commit -m "feat: add story - my new story"

# Blog
git add assets/blogs/my-new-blog.md public/images/blogs/my-new-blog/
git commit -m "feat: add blog - my new blog"

git push
```

There is no draft/publish toggle. If the file exists in `assets/stories/` or `assets/blogs/`, it's published.

### Updating a Post

Edit the `.md` file, commit, and deploy. ISR revalidates every 5 minutes.

### Unpublishing / Deleting a Post

Delete the `.md` file (or move it out of the content directory), commit, and deploy. The URL will return a 404.

## Where Posts Appear

### Stories

1. **Homepage** (`/`): Latest 3 stories under "Latest rants"
2. **Stories page** (`/stories`): All stories. First story displayed as featured hero
3. **Individual story** (`/stories/<slug>`): Full content with cover, title, description, and markdown

### Blogs

1. **Homepage** (`/`): Latest 3 blogs under a blogs section
2. **Blogs page** (`/blogs`): All blogs. First blog displayed as featured hero
3. **Individual blog** (`/blogs/<slug>`): Full content with cover, title, description, and markdown

## Architecture Reference

### Key Files

| File                                   | Purpose                                                  |
| -------------------------------------- | -------------------------------------------------------- |
| `assets/stories/*.md`                  | Story content (personal)                                 |
| `assets/blogs/*.md`                    | Blog content (technical)                                 |
| `lib/stories.ts`                       | Server-only module that reads & parses markdown files    |
| `types/story/story.types.ts`           | `IStory` type definition (shared by both sections)       |
| `app/stories/page.tsx`                 | Stories listing page                                     |
| `app/stories/[entry]/page.tsx`         | Individual story page                                    |
| `app/blogs/page.tsx`                   | Blogs listing page                                       |
| `app/blogs/[entry]/page.tsx`           | Individual blog page                                     |
| `app/stories/[entry]/Entry.module.css` | Markdown content styles (shared)                         |
| `components/StoryCard/`                | `StoriesContainer` and `StoryCard` components (shared)   |
| `public/images/stories/<slug>/`        | Images for stories                                       |
| `public/images/blogs/<slug>/`          | Images for blogs                                         |
| `next.config.ts`                       | Image hostname whitelist (only needed for external URLs) |

### Shared Infrastructure

Stories and blogs share:

- **Parsing logic** — `lib/stories.ts` (or a generalised version) reads markdown + frontmatter from a given directory
- **Type** — `IStory` (or a renamed shared type like `IPost`) is used by both
- **Components** — `StoriesContainer` and `StoryCard` render both stories and blogs
- **Markdown rendering** — same `react-markdown` setup and CSS styles
- **ISR config** — both use `revalidate = 300`

The only things that differ per section are the content directory path, image directory path, route, and page-level labels/headers.

### Data Flow

```
assets/stories/my-story.md                assets/blogs/my-blog.md
        |                                          |
        v                                          v
lib/stories.ts (reads from given dir, parses frontmatter)
        |                                          |
        v                                          v
  IStory object + raw markdown             IStory object + raw markdown
        |                                          |
        +--> /stories listing                      +--> /blogs listing
        +--> /stories/<slug>                       +--> /blogs/<slug>
        +--> homepage (latest 3)                   +--> homepage (latest 3)
```

## Current Limitations

- **No syntax highlighting** in code blocks
- **No draft mode** — every file in the content directory is published
- **No table of contents** generation
- **No reading time** estimate
- **No MDX support** — pure markdown only, no React components inside posts
- **No image optimisation pipeline** — images are served as-is from `public/`. Resize before committing
- **Custom frontmatter parser** — not using `gray-matter` or similar library, so edge cases in YAML may not be handled

## Examples

### Story

File: `assets/stories/the-first-real-solo.md`

Images: `public/images/stories/the-first-real-solo/cover.jpg`, `br-hills.jpg`

```markdown
---
title: 'The first real solo'
date: 2025-08-27
tags: ['travel', 'motorcycle', 'story']
description: 'Daisy first crash, check-in buddy, Google map betrayal and a whole lot of fun'
cover: '/images/stories/the-first-real-solo/cover.jpg'
---

## The plan

It had been almost a month of me riding...

![BR Hills](/images/stories/the-first-real-solo/br-hills.jpg)

## The ride

Having planned to leave at 0600 hours...
```

### Blog

File: `assets/blogs/setting-up-neovim.md`

Images: `public/images/blogs/setting-up-neovim/cover.jpg`, `setup.jpg`

````markdown
---
title: 'Setting Up Neovim from Scratch'
date: 2026-02-24
tags: ['tooling', 'neovim', 'dev']
description: 'A no-nonsense guide to setting up Neovim with LSP, Telescope, and Treesitter.'
cover: '/images/blogs/setting-up-neovim/cover.jpg'
---

## Why Neovim

After years of VS Code, I wanted something faster...

![my setup](/images/blogs/setting-up-neovim/setup.jpg)

## Installation

```bash
brew install neovim
```
````

## Plugin Manager

The first thing you need is lazy.nvim...

```

```
