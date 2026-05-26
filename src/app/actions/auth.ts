"use server";

import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

export async function signUp(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "All fields are required." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Email already in use." };

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { name, email, password: hashed } });

  await signIn("credentials", { email, password, redirectTo: "/" });
}

export async function login(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
  } catch (err) {
    if (err instanceof AuthError) return { error: "Invalid email or password." };
    throw err;
  }
}
