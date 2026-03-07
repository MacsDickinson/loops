import { auth } from "@clerk/nextjs/server";
import { SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="w-full border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
            Discovery Loop Coach
          </h1>
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white"
                >
                  Dashboard
                </Link>
                <UserButton />
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-32">
        <div className="max-w-2xl text-center">
          <h2 className="text-5xl font-bold tracking-tight text-black dark:text-zinc-50">
            Transform ideas into precise specifications
          </h2>
          <p className="mt-6 text-xl leading-8 text-zinc-600 dark:text-zinc-400">
            AI-powered software delivery coaching that turns ambiguous product
            ideas into testable specifications with BDD acceptance tests.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="rounded-full bg-black px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Go to Dashboard
              </Link>
            ) : (
              <SignInButton mode="modal">
                <button className="rounded-full bg-black px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                  Get Started
                </button>
              </SignInButton>
            )}
            <a
              href="https://github.com"
              className="rounded-full border border-zinc-300 px-8 py-3 text-base font-semibold text-black transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900"
            >
              Learn More
            </a>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-zinc-200 bg-white py-8 dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          <p>&copy; 2026 Discovery Loop Coach. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
