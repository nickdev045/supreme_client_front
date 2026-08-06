# Supreme Client Front

Client portal for Supreme Food Service. Same stack as `supreme_system_front`.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- next-auth, next-intl, zod
- Vitest

## Getting Started

```bash
cp .env.example .env
# Fill NEXTAUTH_SECRET (openssl rand -base64 32)

npm install
npm run dev
```

Open [http://localhost:3002](http://localhost:3002).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server on port 3002 |
| `npm run build` | Production build |
| `npm run start` | Production server on port 3002 |
| `npm run lint` | ESLint |
| `npm test` | Vitest |
