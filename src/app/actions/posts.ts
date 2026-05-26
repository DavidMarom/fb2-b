"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const content = (formData.get("content") as string)?.trim();
  if (!content) return { error: "Post cannot be empty." };

  await prisma.post.create({
    data: { content, authorId: session.user.id },
  });

  revalidatePath("/");
}
