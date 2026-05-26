import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getTestPrisma, cleanupTestUsers } from "../db";
import bcrypt from "bcryptjs";

const TEST_EMAILS = ["profile-user-a@example.com", "profile-user-b@example.com"];

async function seedUsers() {
  const prisma = getTestPrisma();
  const hash = await bcrypt.hash("pw", 10);
  const [a, b] = await Promise.all([
    prisma.user.create({ data: { name: "Profile A", email: TEST_EMAILS[0], password: hash } }),
    prisma.user.create({ data: { name: "Profile B", email: TEST_EMAILS[1], password: hash } }),
  ]);
  return { a, b };
}

async function getProfile(userId: string) {
  const prisma = getTestPrisma();
  return prisma.user.findUnique({
    where: { id: userId },
    include: { posts: { orderBy: { createdAt: "desc" } } },
  });
}

describe("Profile data layer", () => {
  beforeEach(async () => {
    await cleanupTestUsers(TEST_EMAILS);
  });

  afterEach(async () => {
    await cleanupTestUsers(TEST_EMAILS);
  });

  it("returns only the specified User's Posts sorted newest-first", async () => {
    const prisma = getTestPrisma();
    const { a, b } = await seedUsers();

    const p1 = await prisma.post.create({ data: { content: "A first", authorId: a.id } });
    await new Promise((r) => setTimeout(r, 10));
    await prisma.post.create({ data: { content: "B post", authorId: b.id } });
    await new Promise((r) => setTimeout(r, 10));
    const p2 = await prisma.post.create({ data: { content: "A second", authorId: a.id } });

    const profile = await getProfile(a.id);
    expect(profile).not.toBeNull();
    const postIds = profile!.posts.map((p) => p.id);
    expect(postIds).toContain(p1.id);
    expect(postIds).toContain(p2.id);
    expect(postIds.indexOf(p2.id)).toBeLessThan(postIds.indexOf(p1.id));
  });

  it("returns null for an unknown User id (maps to 404 in the page)", async () => {
    const profile = await getProfile("nonexistent-id-xyz");
    expect(profile).toBeNull();
  });

  it("returns an empty posts list when the User has no Posts", async () => {
    const { a } = await seedUsers();
    const profile = await getProfile(a.id);
    expect(profile).not.toBeNull();
    expect(profile!.posts).toHaveLength(0);
  });

  it("does not include Posts from another User", async () => {
    const prisma = getTestPrisma();
    const { a, b } = await seedUsers();
    await prisma.post.create({ data: { content: "B only", authorId: b.id } });

    const profile = await getProfile(a.id);
    expect(profile!.posts).toHaveLength(0);
  });
});
