# nestjs-board-app-1

pnpm workspace layout for a NestJS board application.

## Structure

```text
.
├── client/   # frontend placeholder
└── server/   # NestJS API
```

## Setup

```bash
pnpm install
```

## Server

Run commands from the workspace root:

```bash
pnpm start:dev
pnpm build
pnpm lint
pnpm test
```

Or target the server package directly:

```bash
pnpm --filter server start:dev
pnpm --filter server build
```
