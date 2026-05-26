import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getTestPrisma, cleanupTestUsers } from "../db";
import bcrypt from "bcryptjs";

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/auth", () => ({
  signIn: vi.fn().mockResolvedValue(undefined),
  auth: vi.fn().mockResolvedValue(null),
}));

const { login } = await import("@/app/actions/auth");

const TEST_EMAIL = "test-login@example.com";
const TEST_PASSWORD = "correcthorsebatterystaple";

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return fd;
}

describe("login", () => {
  beforeEach(async () => {
    await cleanupTestUsers([TEST_EMAIL]);
    const prisma = getTestPrisma();
    await prisma.user.create({
      data: {
        name: "Login Test User",
        email: TEST_EMAIL,
        password: await bcrypt.hash(TEST_PASSWORD, 10),
      },
    });
  });

  afterEach(async () => {
    await cleanupTestUsers([TEST_EMAIL]);
  });

  it("succeeds with correct credentials (calls signIn without error)", async () => {
    const { signIn } = await import("@/auth");
    const fd = makeFormData({ email: TEST_EMAIL, password: TEST_PASSWORD });
    const result = await login(fd);
    expect(result).toBeUndefined();
    expect(signIn).toHaveBeenCalledWith(
      "credentials",
      expect.objectContaining({ email: TEST_EMAIL, password: TEST_PASSWORD })
    );
  });

  it("returns error for wrong password", async () => {
    const { signIn } = await import("@/auth");
    const { AuthError } = await import("next-auth");
    vi.mocked(signIn).mockRejectedValueOnce(new AuthError("CredentialsSignin"));

    const fd = makeFormData({ email: TEST_EMAIL, password: "wrongpassword" });
    const result = await login(fd);
    expect(result).toEqual({ error: "Invalid email or password." });
  });

  it("returns error for unregistered email", async () => {
    const { signIn } = await import("@/auth");
    const { AuthError } = await import("next-auth");
    vi.mocked(signIn).mockRejectedValueOnce(new AuthError("CredentialsSignin"));

    const fd = makeFormData({ email: "nobody@example.com", password: "any" });
    const result = await login(fd);
    expect(result).toEqual({ error: "Invalid email or password." });
  });
});
