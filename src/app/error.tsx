"use client";

import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorBoundary({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[App Error Boundary]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 text-zinc-900 dark:bg-black dark:text-zinc-50">
        <main className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
            We hit an unexpected error. Your data is safe, and you can retry now.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
