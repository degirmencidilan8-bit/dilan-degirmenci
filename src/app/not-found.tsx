import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-5 text-center">
      <span className="label text-paper-dim">404</span>
      <h1 className="display text-4xl uppercase md:text-6xl">
        Page not found
      </h1>
      <Link href="/" className="label border-b border-paper pb-1">
        Back to home
      </Link>
    </main>
  );
}
