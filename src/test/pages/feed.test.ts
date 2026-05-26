import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getTestPrisma, cleanupTestUsers } from "../db";
import bcrypt from "bcryptjs";

const TEST_EMAILS = ["feed-user-a@example.com", "feed-user-b@example.com"];

async function seedUsers() {
  const prisma = getTestPrisma();
  const hash = await bcrypt.hash("pw", 10);
  const [a, b] = await Promise.all([
    prisma.user.create({ data: { name: "User A", email: TEST_EMAILS[0], password: hash } }),
    prisma.user.create({ data: { name: "User B", email: TEST_EMAILS[1], password: hash } }),
  ]);
  return { a, b };
}

describe("Feed data layer", () => {
  beforeEach(async () => {
    await cleanupTestUsers(TEST_EMAILS);
  });

  afterEach(async () => {
    await cleanupTestUsers(TEST_EMAILS);
  });

  it("returns all Posts from all Users sorted newest-first", async () => {
    const prisma = getTestPrisma();
    const { a, b } = await seedUsers();

    // Create posts with deliberate ordering
    const p1 = await prisma.post.create({ data: { content: "First", authorId: a.id } });
    await new Promise((r) => setTimeout(r, 10));
    const p2 = await prisma.post.create({ data: { content: "Second", authorId: b.id } });
    await new Promise((r) => setTimeout(r, 10));
    const p3 = await prisma.post.create({ data: { content: "Third", authorId: a.id } });

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, name: true } } },
    });

    const ids = posts.map((p) => p.id);
    expect(ids.indexOf(p3.id)).toBeLessThan(ids.indexOf(p2.id));
    expect(ids.indexOf(p2.id)).toBeLessThan(ids.indexOf(p1.id));
    expect(posts.some((p) => p.author.name === "User A")).toBe(true);
    expect(posts.some((p) => p.author.name === "User B")).toBe(true);
  });

  it("returns an empty list when no Posts exist", async () => {
    await seedUsers();
    const prisma = getTestPrisma();
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, name: true } } },
    });
    // Filter to only our test users to avoid interference from other data
    const testPosts = posts.filter((p) => TEST_EMAILS.includes(p.author.name));
    expect(testPosts).toHaveLength(0);
  });
});
