import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="w-full border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-xl font-semibold text-black hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-300"
          >
            Discovery Loop Coach
          </Link>
          <div className="flex items-center gap-4">
            <UserButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
            Welcome back, {user?.firstName || "there"}!
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Start your discovery session or continue where you left off.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
              New Discovery Session
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Start a new AI-guided discovery session to refine your product
              ideas.
            </p>
            <Link href="/chat-demo">
              <button className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                Start Session
              </button>
            </Link>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
              Recent Sessions
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              View and continue your recent discovery sessions.
            </p>
            <button className="mt-4 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-black hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800">
              View Sessions
            </button>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
              Specifications
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Browse your generated specifications and BDD scenarios.
            </p>
            <button className="mt-4 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-black hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800">
              View Specs
            </button>
          </div>
        </div>

        <div className="mt-12 rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-2xl font-bold text-black dark:text-zinc-50">
            Your Profile
          </h2>
          <div className="mt-4 space-y-2 text-zinc-700 dark:text-zinc-300">
            <p>
              <span className="font-medium">Email:</span>{" "}
              {user?.emailAddresses[0]?.emailAddress}
            </p>
            <p>
              <span className="font-medium">Name:</span> {user?.firstName}{" "}
              {user?.lastName}
            </p>
            <p>
              <span className="font-medium">User ID:</span> {user?.id}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
