# Discord Article Archive

A Next.js application that automatically archives Discord messages into a polished, article-style website format. Perfect for communities that want to preserve discussions, announcements, or content created in Discord channels.

## 🌟 Overview

This project bridges Discord conversations and web publishing by:
- Monitoring specific Discord channels via a bot
- Extracting message content and metadata
- Converting Discord messages into formatted articles
- Publishing them to a searchable, public-facing website
---
## ✨ Key Features

### Discord Integration
- **Bot-Powered Archiving**: Automatically captures messages from designated Discord channels
- **Rich Content Support**: Preserves text, formatting, and associated metadata
- **Author Attribution**: Links articles to Discord users with proper attribution

### Article Management
- **User Dashboard**: Authors can view and manage their published articles
- **Admin Panel**: Comprehensive article management across all users
- **Bulk Operations**: Select and delete multiple articles at once
- **Real-time Editing**: Edit article content, metadata, and settings post-publication

### Article Features
- **Markdown Support**: Full markdown rendering with syntax highlighting
- **Search & Filter**: Find articles by title, slug, or author
- **Sorting Options**: Sort by title, publish date, or author
- **Pagination**: Efficient browsing with customizable items per page
- **Author Profiles**: Display author information with Discord integration

### Authentication & Authorization
- **NextAuth.js**: Secure authentication system
- **Role-Based Access**: User and admin role separation
- **Session Management**: Persistent login sessions

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- Discord Bot Token
- Discord Application with OAuth2 setup
---
## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/dotboxes/news_archiver.git
cd discord-article-archive
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/articles_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Discord OAuth
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"

# Discord Bot
DISCORD_BOT_TOKEN="your-discord-bot-token"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed the database
npx prisma db seed
```

### 5. Configure Admin Users

Edit `lib/admins.ts` to add admin user IDs:

**Note:** This is not your discord ID, this is the ID the site generates. To get ID, run:

```npm run quick-user-id "user@email.com"```

```typescript
export const ADMIN_USER_IDS = [
  'discord-user-id-1',
  'discord-user-id-2',
];
```

### 6. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
├── app/
│   ├── api/           # API routes
│   ├── admin/         # Admin dashboard
│   ├── article/       # Article pages
│   └── settings/      # User settings
├── components/
│   ├── ArticlesManager.tsx    # Reusable article management
│   ├── AdminDashboard.tsx     # Admin interface
│   ├── EditArticleModal.tsx   # Article editor
│   └── ...
├── lib/
│   ├── admins.ts      # Admin user configuration
│   ├── database.ts    # Database utilities
│   ├── parseAuthor.ts # Author parsing logic
│   └── prisma.ts      # Prisma client
├── prisma/
│   └── schema.prisma  # Database schema
└── public/            # Static assets
```
---
## 🎮 Discord Bot Setup

### 1. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Navigate to "Bot" section and create a bot
4. Copy the bot token to your `.env` file

### 2. Configure Bot Permissions

Required permissions:
- Read Messages/View Channels
- Read Message History
- Send Messages (for confirmation/errors)

### 3. Invite Bot to Server

Generate an invitation URL with the necessary permissions and add it to your Discord server.


Great — here is a **fully formatted, badge-enhanced "Scripts" section** you can paste *directly into your README*.
It includes your summary table, color-coded category badges, and a clean layout.

---

# 📜 Scripts

The following table lists all available scripts for development, database management, utilities, and dummy data generation.

| Category | Script                            | Description                      |
| -------- | --------------------------------- | -------------------------------- |
| ![Seed](https://img.shields.io/badge/SEED-Database%20Seed-cyan?style=flat-square\&logo=seedling)       | `npm run seed`                     | Run main seed script (`prisma/seed.ts`) |
| ![Danger](https://img.shields.io/badge/DANGER-Flush%20Articles-critical?style=flat-square\&logo=trash) | `tsx prisma/flushArticles.ts`      | **Delete all articles from DB**         |
| ![Users](https://img.shields.io/badge/USERS-Dummy%20Users-orange?style=flat-square) | `tsx prisma/seedDummy.ts users:create`   | Create dummy users               |
| ![Users](https://img.shields.io/badge/USERS-Dummy%20Users-orange?style=flat-square) | `tsx prisma/seedDummy.ts users:delete`   | Delete dummy users               |
| ![Articles](https://img.shields.io/badge/ARTICLES-Dummy%20Articles-red?style=flat-square) | `tsx prisma/seedDummy.ts article:create` | Create dummy article             |
| ![Articles](https://img.shields.io/badge/ARTICLES-Dummy%20Articles-red?style=flat-square) | `tsx prisma/seedDummy.ts article:delete` | Delete dummy articles            |
| ![Utils](https://img.shields.io/badge/UTILS-Utilities-lightgrey?style=flat-square&logo=cog) | `npm run quick-user-id`           | Get user ID for admin assignment |

---


## 👥 User Roles

### Regular Users
- View their own published articles
- Edit and delete their articles
- Search and filter their content

### Admins
- Access to admin dashboard
- View all users and their data
- Manage all articles across the platform
- Bulk delete operations
- User ID lookup for admin promotion
---
## 🔧 Key Components

### ArticlesManager
Reusable component for article management with:
- Search and filtering
- Sortable columns
- Pagination
- Bulk selection and deletion
- Edit modal integration
- Optional author column for admin view

### Admin Dashboard
Two-tab interface:
- **Users & Debug**: User management and session debugging
- **Articles Management**: System-wide article oversight

---
## 📊 Database Schema

### Users
- Discord OAuth integration
- Role management (currently not functional)
- Session handling

### Articles
- Rich content storage
- Metadata (title, slug, dates)
- Author attribution (JSON)
- Category and image support

---
## 📝 License

[Your License Here]

---

## 🐛 Troubleshooting

### Articles Not Appearing
- Check Discord bot permissions
- Verify channel ID in environment variables
- Ensure database connection is active

### Authentication Issues
- Verify Discord OAuth credentials
- Check NEXTAUTH_URL matches your domain
- Regenerate NEXTAUTH_SECRET if needed

### Admin Access Not Working
- Confirm user ID is in `ADMIN_USER_IDS` array
- Check that the ID matches the sites generated ID, not your discord ID.

  ```npm run quick-user-id "user@email.com"```

- Restart server after modifying admin list

## 📧 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and Discord API

![Windows](https://img.shields.io/badge/Platform-Windows-0078D6?style=flat&logo=windows)
![Linux](https://img.shields.io/badge/Platform-Linux-grey?style=flat&logo=linux)
![Python](https://img.shields.io/badge/Python-3.12-blue?style=flat-square&logo=python)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2025-yellow?style=flat-square&logo=javascript)

