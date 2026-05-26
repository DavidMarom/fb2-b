"use client";

import { useState } from "react";
import { createPost } from "@/app/actions/posts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export default function PostForm() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await createPost(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <form action={handleSubmit} className="space-y-3">
          <Textarea
            name="content"
            placeholder="What's on your mind?"
            rows={3}
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit">Post</Button>
        </form>
      </CardContent>
    </Card>
  );
}
