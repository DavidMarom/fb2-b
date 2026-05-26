import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getTestPrisma, cleanupTestUsers } from "../db";
import bcrypt from "bcryptjs";

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

const TEST_EMAIL = "test-createpost@example.com";
let testUserId: string;

async function seedUser() {
  const prisma = getTestPrisma();
  const user = await prisma.user.create({
    data: {
      name: "Post Test User",
      email: TEST_EMAIL,
      password: await bcrypt.hash("pw", 10),
    },
  });
  testUserId = user.id;
}

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return fd;
}

describe("createPost", () => {
  beforeEach(async () => {
    await cleanupTestUsers([TEST_EMAIL]);
    await seedUser();
  });

  afterEach(async () => {
    await cleanupTestUsers([TEST_EMAIL]);
  });

  it("persists a Post attributed to the authenticated User", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValue({ user: { id: testUserId } } as never);

    const { createPost } = await import("@/app/actions/posts");
    await createPost(makeFormData({ content: "Hello world!" }));

    const prisma = getTestPrisma();
    const post = await prisma.post.findFirst({ where: { authorId: testUserId } });
    expect(post).not.toBeNull();
    expect(post!.content).toBe("Hello world!");
    expect(post!.authorId).toBe(testUserId);
  });

  it("returns error for empty content", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValue({ user: { id: testUserId } } as never);

    const { createPost } = await import("@/app/actions/posts");
    const result = await createPost(makeFormData({ content: "   " }));
    expect(result).toEqual({ error: "Post cannot be empty." });

    const prisma = getTestPrisma();
    const posts = await prisma.post.findMany({ where: { authorId: testUserId } });
    expect(posts).toHaveLength(0);
  });

  it("returns error when called without an authenticated session", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValue(null as never);

    const { createPost } = await import("@/app/actions/posts");
    const result = await createPost(makeFormData({ content: "Should not be saved" }));
    expect(result).toEqual({ error: "Not authenticated." });

    const prisma = getTestPrisma();
    const posts = await prisma.post.findMany({ where: { authorId: testUserId } });
    expect(posts).toHaveLength(0);
  });
});
