# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### Environment Variables

This app requires the following environment variables for production:

```bash
TURSO_DATABASE_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here
NODE_ENV=production
```

### Render Deployment

1. Create a Turso database at [turso.tech](https://turso.tech)
2. Get your database URL and auth token
3. Deploy to Render using the included `render.yaml` configuration
4. Set your environment variables in the Render dashboard
5. The database will be automatically initialized on first startup

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Database

This app uses [Turso](https://turso.tech) as the database backend. The database schema is automatically initialized when the app starts in production mode.

For local development, you can:
1. Use a local SQLite file by setting `TURSO_DATABASE_URL=file:./gamedata.db`
2. Set `INIT_DB_ON_BOOT=true` in your `.env.local` file to initialize data on startup

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
