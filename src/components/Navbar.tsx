import { auth, signOut } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="border-b px-4 py-3 flex items-center justify-between">
      <Link href="/" className="font-bold text-lg">
        fb2
      </Link>
      <div className="flex items-center gap-3">
        {session?.user ? (
          <>
            <Link
              href={`/users/${session.user.id}`}
              className="text-sm hover:underline"
            >
              {session.user.name}
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button variant="outline" size="sm" type="submit">
                Log out
              </Button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button variant="outline" size="sm">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign up</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
