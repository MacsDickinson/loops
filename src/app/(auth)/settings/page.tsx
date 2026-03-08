import { currentUser } from "@clerk/nextjs/server"

export default async function SettingsPage() {
  const user = await currentUser()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and workspace settings.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold">Profile</h2>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{user?.emailAddresses[0]?.emailAddress}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Name</span>
            <span>{user?.firstName} {user?.lastName}</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold">Workspace</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Workspace management will be available here.
        </p>
      </div>
    </div>
  )
}
