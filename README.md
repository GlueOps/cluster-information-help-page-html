# Cluster Information Help Page

> **Note**: This project was originally created using [Loveable](https://lovable.dev) but is now developed locally.

## Local Development

This project uses modern web technologies and can be developed locally using your preferred IDE.

### Prerequisites

You'll need one of the following package managers installed:
- [Bun](https://bun.sh/) (recommended - faster performance)
- [Node.js & npm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Getting Started

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd cluster-information-help-page-html

# Install dependencies (using Bun - recommended)
bun install

# Or using npm
npm install

# Start the development server
bun run dev
# Or using npm
npm run dev
```

The development server will start with auto-reloading and hot module replacement. Open your browser to see the application.

### Available Scripts

- `bun run dev` / `npm run dev` - Start development server
- `bun run build` / `npm run build` - Build for production
- `bun run build:dev` / `npm run build:dev` - Build for development
- `bun run lint` / `npm run lint` - Run ESLint
- `bun run preview` / `npm run preview` - Preview production build

### Docker Development

You can also run the application using Docker:

```sh
# Build and run using Docker Compose
docker-compose up --build

# Or build and run manually
docker build -t cluster-info-app .
docker run -p 80:80 cluster-info-app
```

## Technologies Used

This project is built with:

- **React** - Component-based UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern React component library
- **Radix UI** - Accessible component primitives
- **React Router** - Client-side routing
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Bun** - Fast JavaScript runtime and package manager

## Project Structure

```
src/
├── components/       # Reusable React components
│   ├── ui/          # shadcn/ui components
│   └── ClusterInfo.tsx
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
└── pages/           # Page components
```

## Deployment

### Docker Deployment

The project includes Docker configuration for containerized deployment:

1. **Build the Docker image:**
   ```sh
   docker build -t cluster-info-app .
   ```

2. **Run the container:**
   ```sh
   docker run -p 80:80 cluster-info-app
   ```

3. **Using Docker Compose:**
   ```sh
   docker-compose up --build
   ```

### Static Build Deployment

For static hosting (Netlify, Vercel, GitHub Pages, etc.):

```sh
# Build the project
bun run build

# The built files will be in the 'dist' directory
# Deploy the contents of 'dist' to your hosting provider
```
