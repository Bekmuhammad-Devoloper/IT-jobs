# IT Jobs - Telegram Bot + Web App + Admin Panel

IT sohasida vakansiya, resume, kurs, shogird/ustoz qidiruv platformasi.

## Tech Stack

- **Backend**: NestJS 11 + Prisma + PostgreSQL + Redis
- **Bot**: grammY (TypeScript)
- **WebApp**: Next.js 15 + React 19 + Tailwind CSS
- **Admin**: Next.js 15 + React 19 + Tailwind CSS
- **Infrastructure**: Docker + Nginx

## Quick Start

```bash
# 1. Start DB & Redis
docker-compose -f docker-compose.dev.yml up -d

# 2. Backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev

# 3. Bot
cd bot
cp .env.example .env
npm install
npm run dev

# 4. WebApp
cd webapp
npm install
npm run dev

# 5. Admin
cd admin
npm install
npm run dev
```

## Project Structure

```
it-jobs/
├── backend/    # NestJS API
├── bot/        # Telegram Bot (grammY)
├── webapp/     # Telegram Web App (Next.js)
├── admin/      # Admin Panel (Next.js)
├── nginx/      # Nginx config
└── docker-compose.yml
```
