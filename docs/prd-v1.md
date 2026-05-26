# PRD: fb2 — Social Posting App (v1)

## Problem Statement

People want a simple place to share short text thoughts with others and see what other people are posting, without the complexity and noise of large social platforms.

## Solution

A small, focused social app where Users can sign up, log in, write Posts, and read a global Feed of all Posts from all Users. Each User also has a Profile page showing their own Posts. Anonymous visitors can read the Feed and Profiles without an account.

## User Stories

1. As an anonymous visitor, I want to see the Feed of all Posts, so that I can browse content before deciding to sign up.
2. As an anonymous visitor, I want to view a User's Profile, so that I can see what a specific person has posted.
3. As an anonymous visitor, I want to navigate to the Sign up page, so that I can create an account.
4. As an anonymous visitor, I want to navigate to the Log in page, so that I can access my existing account.
5. As an anonymous visitor, I want to see Posts in reverse-chronological order in the Feed, so that I always see the newest content first.
6. As an anonymous visitor, I want to click on a User's name in the Feed, so that I can visit their Profile.
7. As a new visitor, I want to sign up with my name, email, and password, so that I can create an account and start posting.
8. As a new visitor, I want to see a clear error if my email is already taken during sign up, so that I understand why registration failed.
9. As a new visitor, I want to be automatically logged in after signing up, so that I don't have to log in again immediately.
10. As a User, I want to log in with my email and password, so that I can access my account.
11. As a User, I want to see a clear error if my credentials are wrong during log in, so that I know to correct my input.
12. As a User, I want to be redirected to the Feed after logging in, so that I can immediately see what's new.
13. As a User, I want to write and publish a text Post from the Feed page, so that I can share what's on my mind.
14. As a User, I want to see my new Post appear at the top of the Feed immediately after publishing, so that I get instant feedback.
15. As a User, I want to see an error if I try to submit an empty Post, so that I know the Post wasn't created.
16. As a User, I want to log out, so that I can end my session.
17. As a User, I want to be redirected to the Feed after logging out, so that I can still browse content.
18. As a User, I want to see my name in the navbar with a link to my Profile, so that I can quickly navigate to my own page.
19. As a User, I want to visit another User's Profile by clicking their name in the Feed, so that I can see all their Posts.
20. As a User, I want to see a User's name and email on their Profile page, so that I can identify who they are.
21. As a User, I want to see a message when a Profile has no Posts yet, so that I know the page loaded correctly.
22. As a User, I want to see a message when the Feed is empty, so that I know there are no Posts yet rather than a broken page.

## Implementation Decisions

- **Full-stack Next.js App Router**: All pages and API logic live in a single Next.js 16 project using the App Router. Data mutations use Server Actions rather than separate API endpoints.

- **PostgreSQL on Neon + Prisma 7**: The database is hosted on Neon (serverless Postgres). Prisma 7 is used as the ORM with the `@prisma/adapter-pg` driver adapter, which is required by Prisma 7's client engine model.

- **Schema — two models only (v1)**:
  - `User`: id (cuid), name, email (unique), password (hashed), createdAt
  - `Post`: id (cuid), content, createdAt, authorId (FK → User)

- **Authentication via NextAuth v5 (credentials provider)**: Sessions are JWT-based. The `auth()` helper is used server-side in Server Components and Server Actions to read the current session. Passwords are hashed with bcryptjs (cost factor 10).

- **Route protection via Next.js proxy**: All routes are covered by a proxy function (`src/proxy.ts`) that runs NextAuth's auth check on every request.

- **Feed ordering**: Posts are fetched with `orderBy: { createdAt: "desc" }`. No pagination in v1.

- **Post form visibility**: The Post form is only rendered on the Feed page when the User is logged in. It is not shown to anonymous visitors.

- **Styling**: shadcn/ui components (Card, Button, Input, Label, Textarea) on top of Tailwind CSS. No custom design system in v1.

- **Deployment target**: Vercel, connected to the Neon database.

## Testing Decisions

A good test verifies observable behavior — what a User sees and what data changes in the database — not internal implementation details like which Prisma method was called.

**Modules to test:**

- **Server Actions (`actions/auth.ts`, `actions/posts.ts`)**: The most critical behavior to cover. Tests should assert: sign-up creates a User with a hashed password; sign-up rejects duplicate emails; login rejects wrong passwords; createPost persists a Post for the authenticated User; createPost rejects empty content; createPost rejects unauthenticated callers.

- **Feed page**: Integration test asserting that Posts from multiple Users are returned in reverse-chronological order.

- **Profile page**: Integration test asserting that only Posts from the specified User are shown, and that a 404 is returned for an unknown User id.

No prior test art exists in the codebase yet (v1 greenfield). Tests should use a real test database (not mocks) to avoid divergence between test and production behaviour.

## Out of Scope

- Image or media attachments on Posts
- Likes, comments, or reactions
- Follow/unfollow and personalised Feed
- Notifications
- Password reset or email verification
- OAuth (Google, GitHub, etc.) login
- Pagination or infinite scroll on the Feed
- Post deletion or editing
- User bio or avatar
- Search

## Further Notes

- The domain glossary is maintained in `CONTEXT.md` at the repo root. Key terms: **User**, **Post**, **Feed**, **Profile**, **Log in**, **Sign up**.
- Prisma 7 is a significant departure from Prisma 5/6 — the datasource URL is no longer set in `schema.prisma` but via `prisma.config.ts` and the `PrismaPg` adapter constructor. This is captured in the implementation decisions above but will surprise engineers familiar with earlier Prisma versions.
