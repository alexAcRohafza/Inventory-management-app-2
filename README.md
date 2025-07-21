# Inventory Management App

A full-stack Next.js 14 application built with TypeScript, Tailwind CSS, and Prisma for PostgreSQL.

## Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Prisma** with PostgreSQL database
- **ESLint** and **Prettier** for code quality

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database running

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd inventory-management-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and update the `DATABASE_URL` with your PostgreSQL connection string:
   ```
   DATABASE_URL="postgresql://postgres:<PASSWORD>@<IP>:5432/inventory?schema=public"
   ```

4. Generate Prisma client:
   ```bash
   npm run db:generate
   ```

5. Push the database schema:
   ```bash
   npm run db:push
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── globals.css        # Global CSS with Tailwind
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page
├── prisma/
│   └── schema.prisma      # Database schema
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── next.config.js         # Next.js configuration
└── README.md              # Project documentation
``` 