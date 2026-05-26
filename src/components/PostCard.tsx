import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";

type Post = {
  id: string;
  content: string;
  createdAt: Date;
  author: { id: string; name: string };
};

export default function PostCard({ post }: { post: Post }) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <Link
          href={`/users/${post.author.id}`}
          className="font-semibold hover:underline"
        >
          {post.author.name}
        </Link>
        <p className="text-xs text-muted-foreground">
          {new Date(post.createdAt).toLocaleString()}
        </p>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{post.content}</p>
      </CardContent>
    </Card>
  );
}
