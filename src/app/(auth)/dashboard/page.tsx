import { currentUser } from "@clerk/nextjs/server"
import Link from "next/link"

export default async function DashboardPage() {
  const user = await currentUser()

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.firstName || "there"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Turn your product ideas into precise, testable specifications.
        </p>
      </div>

      <Link
        href="/ideas/new"
        className="flex items-center gap-3 rounded-xl border-2 border-dashed border-loop-discovery-border bg-loop-discovery-subtle p-6 transition-colors hover:border-loop-discovery hover:bg-loop-discovery-subtle/80"
      >
        <div className="flex size-10 items-center justify-center rounded-lg bg-loop-discovery text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
        </div>
        <div>
          <p className="font-semibold">New Idea</p>
          <p className="text-sm text-muted-foreground">
            Start a discovery session to explore and refine your idea
          </p>
        </div>
      </Link>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-muted">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
              </svg>
            </div>
            <h3 className="font-semibold">Inbox</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Ideas waiting to be explored or assigned to a product.
          </p>
          <Link
            href="/inbox"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            View Inbox
          </Link>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-muted">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16.5 9.4 7.55 4.24" />
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" x2="12" y1="22.08" y2="12" />
              </svg>
            </div>
            <h3 className="font-semibold">Products</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Your products and their features across lifecycle stages.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            View Products
          </Link>
        </div>
      </div>
    </div>
  )
}
