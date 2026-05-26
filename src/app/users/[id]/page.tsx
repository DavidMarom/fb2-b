import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PostCard from "@/components/PostCard";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      posts: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) notFound();

  const postsWithAuthor = user.posts.map((post) => ({
    ...post,
    author: { id: user.id, name: user.name },
  }));

  return (
    <main className="mx-auto max-w-xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <p className="text-muted-foreground text-sm">{user.email}</p>
      </div>
      <div className="space-y-4">
        {postsWithAuthor.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {user.posts.length === 0 && (
          <p className="text-center text-muted-foreground">No posts yet.</p>
        )}
      </div>
    </main>
  );
}
