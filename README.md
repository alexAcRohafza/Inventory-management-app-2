# Inventory Management App

A modern stock management application built with Next.js 14, TypeScript, Tailwind CSS, and Prisma (MongoDB).

## 🚀 Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Prisma** with MongoDB for database management
- **ESLint & Prettier** for code quality
- **Middleware** ready for authentication and request handling
- **Responsive Design** with modern UI components

## 📦 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Prisma ORM
- **Development**: ESLint, Prettier
- **Deployment**: Ready for Vercel/Netlify

## 🛠 Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB instance running (local or cloud)
- Git

### Installation

1. **Clone the repository** (if not already cloned):
   ```bash
   git clone <your-repo-url>
   cd inventory-management-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   The `.env` file has been created with the following variables:
   ```env
   DATABASE_URL="mongodb://localhost:27017/inventory"
   NEXTAUTH_SECRET="changeme"
   NEXTAUTH_URL="http://localhost:3000"
   ```
   
   **Important**: Update these values for production use!

4. **Set up the database**:
   ```bash
   npm run db:generate  # Generate Prisma client
   npm run db:push      # Push schema to database
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push database schema
- `npm run db:studio` - Open Prisma Studio

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Homepage component
├── lib/                   # Utility libraries
│   └── prisma.ts          # Prisma client setup
├── prisma/                # Database schema and migrations
│   └── schema.prisma      # Prisma schema file
├── middleware.ts          # Next.js middleware
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── .eslintrc.json         # ESLint configuration
├── .prettierrc            # Prettier configuration
└── package.json           # Dependencies and scripts
```

## 🗄️ Database Setup

The project is configured for MongoDB. To set up your database schema:

1. **Update the Prisma schema** in `prisma/schema.prisma`
2. **Add your models** (examples provided in comments)
3. **Generate the client**: `npm run db:generate`
4. **Push to database**: `npm run db:push`

Example model for inventory items:
```prisma
model Item {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  description String?
  quantity    Int
  price       Float
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 🎨 Styling

The project uses Tailwind CSS with a modern design system:

- **Responsive design** with mobile-first approach
- **Custom color variables** for light/dark theme support
- **Component-based styling** with Tailwind utilities
- **Inter font** from Google Fonts

## 🔧 Development

### Code Quality

- **ESLint** with Next.js recommended rules
- **Prettier** for consistent code formatting
- **TypeScript** for type safety
- **Pre-configured** with best practices

### Middleware

The `middleware.ts` file is ready for:
- Authentication checks
- Request logging
- Route protection
- API rate limiting

## 🚢 Deployment

This project is ready for deployment on:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **Any Node.js hosting platform**

Make sure to:
1. Set up your MongoDB connection string
2. Update environment variables
3. Configure your hosting platform

## 📄 License

This project is ready for your own license.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Ready to build something amazing! 🚀** 