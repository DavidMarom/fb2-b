import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getTestPrisma, cleanupTestUsers } from "../db";
import bcrypt from "bcryptjs";

// Mock Next.js and NextAuth framework pieces — we test DB logic, not framework plumbing
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/auth", () => ({
  signIn: vi.fn().mockResolvedValue(undefined),
  auth: vi.fn().mockResolvedValue(null),
}));

// Import after mocks
const { signUp } = await import("@/app/actions/auth");

const TEST_EMAILS = ["test-signup-1@example.com", "test-signup-2@example.com"];

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return fd;
}

describe("signUp", () => {
  beforeEach(async () => {
    await cleanupTestUsers(TEST_EMAILS);
  });

  afterEach(async () => {
    await cleanupTestUsers(TEST_EMAILS);
  });

  it("creates a user with a bcrypt-hashed password", async () => {
    const fd = makeFormData({
      name: "Test User",
      email: TEST_EMAILS[0],
      password: "secret123",
    });

    await signUp(fd);

    const prisma = getTestPrisma();
    const user = await prisma.user.findUnique({ where: { email: TEST_EMAILS[0] } });
    expect(user).not.toBeNull();
    expect(user!.name).toBe("Test User");
    const passwordMatches = await bcrypt.compare("secret123", user!.password);
    expect(passwordMatches).toBe(true);
  });

  it("returns error for duplicate email", async () => {
    const fd1 = makeFormData({ name: "User One", email: TEST_EMAILS[1], password: "pw1" });
    await signUp(fd1);

    const fd2 = makeFormData({ name: "User Two", email: TEST_EMAILS[1], password: "pw2" });
    const result = await signUp(fd2);
    expect(result).toEqual({ error: "Email already in use." });
  });

  it("returns error for missing fields", async () => {
    const cases = [
      makeFormData({ email: TEST_EMAILS[0], password: "pw" }), // no name
      makeFormData({ name: "X", password: "pw" }),              // no email
      makeFormData({ name: "X", email: TEST_EMAILS[0] }),       // no password
    ];

    for (const fd of cases) {
      const result = await signUp(fd);
      expect(result).toEqual({ error: "All fields are required." });
    }
  });
});
