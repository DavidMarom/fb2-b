# Ralph Fix Plan

## High Priority

- [x] Set up test infrastructure: install Vitest (or Jest), configure a test database connection using `DATABASE_URL` from `.env`, add a test script to `package.json`
- [x] Tests — `signUp` Server Action: creates a User with a bcrypt-hashed password; returns error for duplicate email; returns error for missing fields
- [ ] Tests — `login` Server Action: succeeds with correct credentials; returns error for wrong password; returns error for unregistered email
- [ ] Tests — `createPost` Server Action: persists a Post attributed to the authenticated User; returns error for empty content; returns error when called without a session

## Medium Priority

- [ ] Tests — Feed page: all Posts returned newest-first; empty state when no Posts exist
- [ ] Tests — Profile page: only the specified User's Posts are returned newest-first; 404 for unknown User id; empty state when User has no Posts; Post from User A does not appear on User B's Profile

## Low Priority

- [ ] Verify Vercel deployment: app accessible at public URL, sign up / log in / create Post work in production

## Completed

- [x] Scaffold Next.js app with Tailwind + shadcn/ui
- [x] Set up Prisma with PostgreSQL schema (User, Post)
- [x] Configure NextAuth.js v5 with credentials provider
- [x] Build sign up and log in pages
- [x] Build post creation Server Action
- [x] Build Feed page
- [x] Build Profile pages
- [x] Build Navbar with auth state
- [x] Project enabled for Ralph

## Notes

- Use a real test database, never mocks — divergence between mocked and real DB has caused bugs before
- The Prisma client requires the PrismaPg adapter (Prisma 7) — follow `src/lib/prisma.ts` exactly
- Next.js 16 uses `src/proxy.ts` not `src/middleware.ts`
