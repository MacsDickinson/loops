import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getDefaultWorkspace } from "@/shared/auth/workspace-context"
import { SupabaseIdeaRepository } from "@/contexts/product-management/infrastructure/supabase-idea-repository"
import { InboxList } from "@/components/inbox/inbox-list"

const PAGE_SIZE = 25

export default async function InboxPage() {
  const user = await currentUser()
  if (!user) redirect("/sign-in")

  const workspace = await getDefaultWorkspace(user.id)
  if (!workspace) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">No workspace found</h1>
          <p className="text-sm text-muted-foreground">
            Your account is authenticated, but no workspace has been set up yet. Please contact an administrator or complete the onboarding process.
          </p>
        </div>
      </div>
    )
  }

  const ideaRepo = new SupabaseIdeaRepository()
  const { items, total } = await ideaRepo.findInboxPaginated(workspace.workspaceId, {
    limit: PAGE_SIZE,
    offset: 0,
  })

  const serializedIdeas = items.map((idea) => ({
    id: idea.id,
    name: idea.name,
    description: idea.description,
    createdAt: idea.createdAt.toISOString(),
    graduatedFeatureId: idea.graduatedFeatureId,
  }))

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
          <p className="text-sm text-muted-foreground">
            Unassigned ideas waiting to be explored or assigned to a product.
          </p>
        </div>
        <Link
          href="/ideas/new"
          className="inline-flex items-center gap-2 rounded-lg bg-loop-discovery px-4 py-2 text-sm font-medium text-white hover:bg-loop-discovery/90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          New Idea
        </Link>
      </div>

      <InboxList
        initialIdeas={serializedIdeas}
        total={total}
        workspaceId={workspace.workspaceId}
      />
    </div>
  )
}
