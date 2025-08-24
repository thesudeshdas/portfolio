# Dash - Personal Portfolio

A modern, responsive personal portfolio website built with Next.js 15, TypeScript, and Tailwind CSS. Features a clean design, dark/light theme support, and integration with Notion for dynamic content management.

## ✨ Features

- **Modern Design**: Clean, responsive layout with beautiful typography and spacing
- **Theme Support**: Dark/light mode with system preference detection
- **Dynamic Content**: Notion integration for blog posts and stories
- **Performance**: Built with Next.js 15 for optimal performance and SEO
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Responsive**: Mobile-first design that works on all devices
- **Accessibility**: Built with accessibility best practices using Radix UI components

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.2
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Radix UI primitives
- **State Management**: React 19 with built-in state
- **Content Management**: Notion API integration
- **Icons**: React Icons
- **Code Quality**: ESLint, Prettier, Husky
- **Package Manager**: pnpm

## 📁 Project Structure

```
portfolio/
├── app/                    # Next.js app directory
│   ├── blogs/             # Blog pages
│   ├── code/              # Development projects showcase
│   ├── me/                # About, journey, skills, FAQ sections
│   ├── stories/           # Story/blog entries
│   ├── work/              # Work experience
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Homepage
├── components/             # Reusable UI components
│   ├── ui/                # Base UI components (buttons, badges, etc.)
│   ├── ActiveLink/        # Navigation link component
│   ├── AppNav/            # Main navigation
│   ├── DevProjectCard/    # Project showcase cards
│   ├── Footer/            # Site footer
│   ├── ModeToggle/        # Theme toggle
│   ├── SectionHeader/     # Section titles
│   ├── SocialLinks/       # Social media links
│   └── StoryCard/         # Blog/story cards
├── data/                  # Static data and configuration
├── lib/                   # Utility functions and integrations
├── types/                 # TypeScript type definitions
├── public/                # Static assets and images
└── assets/                # Additional assets
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Notion account and API access (for content management)

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd portfolio
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:

   ```env
   NOTION_DATABASE_ID=your_notion_database_id
   NOTION_TOKEN=your_notion_integration_token
   ```

4. **Run the development server**

   ```bash
   pnpm dev
   ```

   The application will be available at [http://localhost:3003](http://localhost:3003)

### Available Scripts

- `pnpm dev` - Start development server on port 3003
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm prepare` - Install Husky git hooks

## 🎨 Customization

### Theme Configuration

The app uses `next-themes` for theme management. Themes can be customized in `components/theme-provider.tsx`.

### Styling

- Global styles are in `app/globals.css`
- Component-specific styles use CSS modules or Tailwind classes
- Design system components are in `components/ui/`

### Content Management

- Blog posts and stories are managed through Notion
- Static content is stored in `data/` directory
- Images and assets are in `public/` directory

## 🔧 Configuration

### Next.js Config

- ESLint configuration for code quality
- Image optimization with remote patterns for Notion
- Environment variable handling

### TypeScript

- Strict mode enabled
- Path aliases configured (`@/*` points to root)
- Next.js types included

### Tailwind CSS

- Custom color scheme and animations
- Responsive breakpoints
- Component variants using `class-variance-authority`

## 📱 Pages & Sections

- **Home**: Introduction, latest content, featured stories
- **About**: Personal information and background
- **Journey**: Career and life timeline
- **Skills**: Technical skills and expertise
- **Work**: Professional experience and projects
- **Code**: Development projects showcase
- **Blogs**: Written content and thoughts
- **Stories**: Personal stories and experiences

## 🚀 Deployment

### Build for Production

```bash
pnpm build
pnpm start
```

### Environment Variables

Ensure all required environment variables are set in your production environment:

- `NOTION_DATABASE_ID`
- `NOTION_TOKEN`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary. All rights reserved.

## 👤 Author

**Sudesh Das (Dash)**

- Software Engineer
- Amateur Storyteller
- Motorcycle enthusiast
- Filmmaking hobbyist

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
