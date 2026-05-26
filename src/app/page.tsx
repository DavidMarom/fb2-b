import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import PostForm from "@/components/PostForm";
import PostCard from "@/components/PostCard";

export default async function HomePage() {
  const session = await auth();

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { id: true, name: true } } },
  });

  return (
    <main className="mx-auto max-w-xl px-4 py-8 space-y-6">
      {session?.user && <PostForm />}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {posts.length === 0 && (
          <p className="text-center text-muted-foreground">No posts yet.</p>
        )}
      </div>
    </main>
  );
}
