# Dash - Personal Portfolio

A modern, responsive personal portfolio website built with Next.js 15, TypeScript, and Tailwind CSS. Features a clean design, dark/light theme support, and comprehensive content management.

## ✨ Features

- **Modern Design**: Clean, responsive layout with beautiful typography and spacing
- **Theme Support**: Dark/light mode with system preference detection
- **Dynamic Content**: Static content management with markdown support
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
- **Content Management**: Static content with markdown support
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
│   ├── icon.ico           # Favicon
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Homepage
├── components/             # Reusable UI components
│   ├── ui/                # Base UI components (buttons, badges, etc.)
│   ├── ActiveLink/        # Navigation link component
│   ├── AppNav/            # Main navigation
│   ├── DevProjectCard/    # Project showcase cards
│   ├── DevProjectFilter/  # Project filtering
│   ├── Footer/            # Site footer
│   ├── ModeToggle/        # Theme toggle
│   ├── NavLink/           # Navigation link wrapper
│   ├── SectionHeader/     # Section titles
│   ├── SocialLinks/       # Social media links
│   ├── StoryCard/         # Blog/story cards
│   ├── theme-provider.tsx # Theme context provider
│   └── index.ts           # Component exports
├── data/                  # Static data and configuration
│   ├── icons/             # Icon definitions
│   └── social/            # Social media configuration
├── lib/                   # Utility functions and integrations
│   ├── dateMe.ts          # Date utilities
│   ├── stories.ts         # Story management
│   └── utils.ts           # General utilities
├── types/                 # TypeScript type definitions
│   ├── dev/               # Development project types
│   ├── faq/               # FAQ types
│   ├── icons/             # Icon types
│   ├── journey/           # Journey types
│   ├── navs/              # Navigation types
│   ├── skillBank/         # Skills types
│   └── story/             # Story types
├── assets/                # Additional assets
│   ├── images/            # Company logos and images
│   └── stories/           # Markdown story files
├── public/                # Static assets and images
│   ├── dev/               # Development project images
│   ├── DP.svg             # Profile picture
│   └── gojo-compressed.png # Hero image
├── .husky/                # Git hooks configuration
├── components.json         # shadcn/ui configuration
├── .eslintrc.json         # ESLint configuration
├── .prettierrc.json       # Prettier configuration
├── postcss.config.js      # PostCSS configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── next.config.ts         # Next.js configuration
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

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
   No environment variables required for basic setup.

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

- Blog posts and stories are managed as static markdown files
- Static content is stored in `data/` directory
- Images and assets are in `public/` directory

## 🔧 Configuration

### Next.js Config

- ESLint configuration for code quality
- Image optimization with remote patterns
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

No environment variables are required for production deployment.

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
