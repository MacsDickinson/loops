import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Code2,
  ShieldCheck,
  LineChart,
  GitPullRequest,
  Users,
  Lightbulb,
  Terminal,
} from "lucide-react";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Loops" width={32} height={32} className="h-8 w-8" />
            <span className="text-xl font-bold tracking-tight">Loops</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a
              href="#platform"
              className="transition-colors hover:text-foreground"
            >
              Platform
            </a>
            <a
              href="#discovery"
              className="transition-colors hover:text-foreground"
            >
              Discovery Coach
            </a>
            <a
              href="#pricing"
              className="transition-colors hover:text-foreground"
            >
              Pricing
            </a>
            <a
              href="#philosophy"
              className="transition-colors hover:text-foreground"
            >
              Philosophy
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <SignInButton mode="modal">
              <button className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex">
                Log in
              </button>
            </SignInButton>
            <SignInButton mode="modal">
              <button className="inline-flex items-center justify-center rounded-lg bg-loop-discovery px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-loop-discovery/90">
                Get Started Free
              </button>
            </SignInButton>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden py-24 lg:py-32">
          <div className="mx-auto flex max-w-7xl flex-col items-center px-6 text-center">
            <span className="mb-6 inline-flex items-center rounded-full border-transparent bg-loop-discovery px-3 py-1 text-sm font-semibold text-primary">
              Introducing Discovery Loop Coach
            </span>
            <h1 className="mb-6 max-w-4xl text-balance text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Software delivery, redesigned for the age of AI
            </h1>
            <p className="mb-10 max-w-2xl text-balance text-xl text-muted-foreground">
              Loops is an AI-powered platform that tightens the feedback loops
              that matter most: Discovery, Build, Operationalise, and Grow.
            </p>
            <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
              <SignInButton mode="modal">
                <button className="inline-flex h-12 items-center justify-center rounded-lg bg-loop-discovery px-8 text-base font-medium text-primary transition-colors hover:bg-loop-discovery/90">
                  Start with Discovery{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </SignInButton>
              <Link
                href="/docs"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-background px-8 text-base font-medium transition-colors hover:bg-muted"
              >
                Learn more
              </Link>
            </div>

            {/* Abstract Loops Visual */}
            <div className="relative mt-20 flex aspect-video w-full max-w-3xl items-center justify-center opacity-90">
              <div className="absolute h-40 w-40 -translate-x-1/4 -translate-y-1/4 rounded-full border-[16px] border-loop-discovery/80 blur-[2px] mix-blend-multiply dark:mix-blend-screen md:h-64 md:w-64" />
              <div className="absolute h-40 w-40 translate-x-1/4 -translate-y-1/4 rounded-full border-[16px] border-loop-build/80 blur-[2px] mix-blend-multiply dark:mix-blend-screen md:h-64 md:w-64" />
              <div className="absolute h-40 w-40 -translate-x-1/4 translate-y-1/4 rounded-full border-[16px] border-loop-operationalise/80 blur-[2px] mix-blend-multiply dark:mix-blend-screen md:h-64 md:w-64" />
              <div className="absolute h-40 w-40 translate-x-1/4 translate-y-1/4 rounded-full border-[16px] border-loop-grow/80 blur-[2px] mix-blend-multiply dark:mix-blend-screen md:h-64 md:w-64" />
            </div>
          </div>
        </section>

        {/* The Problem */}
        <section className="bg-muted/50 py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">
                  AI builds fast. But are you building the right thing?
                </h2>
                <div className="space-y-4 text-lg text-muted-foreground">
                  <p>
                    AI coding tools have made build dramatically faster. But
                    unclear requirements don&apos;t produce wrong code
                    slowly&mdash;they produce wrong code quickly.
                  </p>
                  <p>
                    The faster you can build, the more expensive ambiguity
                    becomes. The bottleneck has shifted. From build to discovery.
                    From deployment to operationalisation. From shipping to
                    learning.
                  </p>
                </div>
              </div>
              <div>
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8">
                  <div className="mb-6 flex items-center gap-4 text-destructive">
                    <Terminal className="h-8 w-8" />
                    <span className="font-mono font-semibold">
                      Build speed: 10x
                    </span>
                  </div>
                  <div className="space-y-3 font-mono text-sm">
                    <div className="rounded border bg-background p-3 text-muted-foreground line-through">
                      &gt; Implementing vague feature...
                    </div>
                    <div className="rounded border bg-background p-3 text-muted-foreground line-through">
                      &gt; Realising edge cases missing...
                    </div>
                    <div className="rounded border bg-background p-3 font-medium text-destructive">
                      &gt; Error: Rework required. Time lost.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Four Loops */}
        <section id="platform" className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                The Four Loops
              </h2>
              <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                A complete framework for software delivery in the AI era.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Discovery */}
              <div className="relative overflow-hidden rounded-xl border border-loop-discovery/50 bg-card ring-1 ring-foreground/10 transition-colors hover:border-loop-discovery">
                <div className="absolute left-0 top-0 h-1 w-full bg-loop-discovery" />
                <div className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-loop-discovery/20 text-primary">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold">Discovery</h3>
                  <span className="mt-2 inline-flex items-center rounded-full bg-loop-discovery px-2.5 py-0.5 text-xs font-semibold text-primary">
                    Available Now
                  </span>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Turn rough ideas into precise, testable specifications
                    through AI-guided dialogue.
                  </p>
                </div>
              </div>

              {/* Build */}
              <div className="relative overflow-hidden rounded-xl border border-loop-build/30 bg-card opacity-80 ring-1 ring-foreground/10">
                <div className="absolute left-0 top-0 h-1 w-full bg-loop-build" />
                <div className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-loop-build/20 text-primary">
                    <Code2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold">Build</h3>
                  <span className="mt-2 inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                    Coming Soon
                  </span>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Build against spec-driven acceptance tests. AI handles
                    implementation; you handle architecture.
                  </p>
                </div>
              </div>

              {/* Operationalise */}
              <div className="relative overflow-hidden rounded-xl border border-loop-operationalise/30 bg-card opacity-80 ring-1 ring-foreground/10">
                <div className="absolute left-0 top-0 h-1 w-full bg-loop-operationalise" />
                <div className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-loop-operationalise/20 text-primary">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold">Operationalise</h3>
                  <span className="mt-2 inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                    Coming Soon
                  </span>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Graduate validated software to production quality with
                    continuous compliance.
                  </p>
                </div>
              </div>

              {/* Grow */}
              <div className="relative overflow-hidden rounded-xl border border-loop-grow/30 bg-card opacity-80 ring-1 ring-foreground/10">
                <div className="absolute left-0 top-0 h-1 w-full bg-loop-grow" />
                <div className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-loop-grow/20 text-primary">
                    <LineChart className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold">Grow</h3>
                  <span className="mt-2 inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                    Coming Soon
                  </span>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Measure what matters, learn from production, and feed
                    evidence into the next cycle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Discovery Loop Coach */}
        <section
          id="discovery"
          className="py-24"
          style={{ backgroundColor: "var(--loop-discovery-subtle)" }}
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
                Meet the Discovery Loop Coach
              </h2>
              <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                Your AI spec assistant that turns ideas into precise
                specifications with built-in acceptance tests.
              </p>
            </div>

            <div className="grid items-start gap-8 lg:grid-cols-3">
              {/* Feature List */}
              <div className="space-y-8 lg:col-span-1">
                {[
                  {
                    step: 1,
                    title: "Describe your feature",
                    desc: '"Add SSO login with Google and Microsoft"',
                  },
                  {
                    step: 2,
                    title: "AI probes for clarity",
                    desc: '"What happens if the SSO provider is down? Should there be a fallback?"',
                  },
                  {
                    step: 3,
                    title: "Multiple perspectives",
                    desc: "Security, UX, and domain experts join the conversation to find edge cases.",
                  },
                  {
                    step: 4,
                    title: "Spec + tests emerge",
                    desc: "Structured requirements with Gherkin acceptance tests are generated automatically.",
                  },
                  {
                    step: 5,
                    title: "Export anywhere",
                    desc: "Sync directly to a GitHub PR, Linear issue, or Markdown file.",
                  },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex gap-4">
                    <div className="mt-1 flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-loop-discovery font-bold text-primary">
                        {step}
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
                      <p className="text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mockup Interface */}
              <div className="overflow-hidden rounded-xl border bg-background shadow-2xl lg:col-span-2">
                <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
                  <div className="h-3 w-3 rounded-full bg-destructive/50" />
                  <div className="h-3 w-3 rounded-full bg-loop-grow/50" />
                  <div className="h-3 w-3 rounded-full bg-loop-operationalise/50" />
                  <div className="ml-4 font-mono text-xs text-muted-foreground">
                    discovery-session.md
                  </div>
                </div>
                <div className="grid h-[500px] md:grid-cols-2">
                  {/* Chat Panel */}
                  <div className="flex flex-col gap-4 overflow-y-auto border-r bg-muted/10 p-4">
                    <div className="w-[85%] rounded-lg rounded-tl-none bg-primary p-3 text-sm text-primary-foreground">
                      I want a login flow with social auth.
                    </div>
                    <div className="w-[85%] self-end rounded-lg rounded-tr-none bg-loop-discovery/20 p-3 text-sm">
                      <p className="mb-1 text-xs font-semibold text-primary">
                        UX Analyst Persona
                      </p>
                      Great. Which social providers do you want to start with?
                      And should we still offer email/password as a fallback?
                    </div>
                    <div className="w-[85%] rounded-lg rounded-tl-none bg-primary p-3 text-sm text-primary-foreground">
                      Google and Microsoft. Yes, keep email fallback.
                    </div>
                    <div className="w-[85%] self-end rounded-lg rounded-tr-none bg-loop-operationalise/20 p-3 text-sm">
                      <p className="mb-1 text-xs font-semibold text-primary">
                        Security Persona
                      </p>
                      Noted. If an existing user with an email logs in via Google
                      for the first time, should we automatically link the
                      accounts if the emails match?
                    </div>
                  </div>
                  {/* Spec Panel */}
                  <div className="overflow-y-auto bg-background p-4 font-mono text-sm">
                    <h4 className="mb-4 font-sans text-lg font-bold">
                      Feature: Social Authentication
                    </h4>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        As a user, I want to log in using my Google or Microsoft
                        account so that I don&apos;t have to remember another
                        password.
                      </p>

                      <div className="rounded border bg-muted p-3">
                        <span className="font-bold text-loop-discovery">
                          Scenario:
                        </span>{" "}
                        Successful Google Login
                        <br />
                        <span className="font-bold text-loop-build">
                          Given
                        </span>{" "}
                        the user is on the login page
                        <br />
                        <span className="font-bold text-loop-build">
                          When
                        </span>{" "}
                        they click &quot;Continue with Google&quot;
                        <br />
                        <span className="font-bold text-loop-build">
                          And
                        </span>{" "}
                        they successfully authenticate with Google
                        <br />
                        <span className="font-bold text-loop-operationalise">
                          Then
                        </span>{" "}
                        they should be logged into the application
                        <br />
                        <span className="font-bold text-loop-operationalise">
                          And
                        </span>{" "}
                        redirected to the dashboard
                      </div>

                      <div className="rounded border bg-muted p-3">
                        <span className="font-bold text-loop-discovery">
                          Scenario:
                        </span>{" "}
                        Account Linking
                        <br />
                        <span className="font-bold text-loop-build">
                          Given
                        </span>{" "}
                        a user exists with email &quot;user@example.com&quot;
                        <br />
                        <span className="font-bold text-loop-build">
                          When
                        </span>{" "}
                        they log in via Google with &quot;user@example.com&quot;
                        <br />
                        <span className="font-bold text-loop-operationalise">
                          Then
                        </span>{" "}
                        the Google identity should be linked to the existing
                        account
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Who It's For */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                Built for teams shipping with AI
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: Lightbulb,
                  title: "Product Managers",
                  desc: "Create specs your engineers actually use. No more 2-hour PRDs that still leave questions unanswered. Turn ideas into testable criteria in minutes.",
                },
                {
                  icon: Users,
                  title: "Engineering Leads",
                  desc: "Get acceptance criteria upfront. Your team builds the right thing first time. Stop answering the same edge-case questions in Slack.",
                },
                {
                  icon: GitPullRequest,
                  title: "Technical Founders",
                  desc: "Wear both hats. Structure your requirements before handing off to AI coding tools like Cursor or Copilot to ensure they build exactly what you need.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{title}</h3>
                  <p className="text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How We Compare */}
        <section className="bg-muted/30 py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                How we compare
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b">
                    <th className="w-1/4 p-4 font-medium text-muted-foreground" />
                    <th className="w-1/4 p-4 text-lg font-semibold">
                      Jira / Linear / Notion
                    </th>
                    <th className="w-1/4 p-4 text-lg font-semibold">
                      ChatGPT / Claude
                    </th>
                    <th className="w-1/4 p-4 text-lg font-semibold text-primary">
                      Discovery Loop Coach
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    {
                      feature: "AI-guided requirements",
                      col1: "No",
                      col2: "Unstructured",
                      col3: "Structured dialogue with personas",
                    },
                    {
                      feature: "Acceptance tests",
                      col1: "No",
                      col2: "Manual",
                      col3: "Auto-generated BDD/Gherkin",
                    },
                    {
                      feature: "Version controlled",
                      col1: "No",
                      col2: "No",
                      col3: "Markdown in your repo",
                    },
                    {
                      feature: "Multi-perspective review",
                      col1: "No",
                      col2: "Manual prompting",
                      col3: "Security, UX, Domain personas",
                    },
                  ].map(({ feature, col1, col2, col3 }) => (
                    <tr key={feature}>
                      <td className="p-4 font-medium">{feature}</td>
                      <td className="p-4 text-muted-foreground">{col1}</td>
                      <td className="p-4 text-muted-foreground">{col2}</td>
                      <td className="p-4">
                        <span className="flex items-center gap-2 font-medium text-primary">
                          <CheckCircle2 className="h-5 w-5 text-loop-discovery" />
                          {col3}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <span className="mb-6 inline-flex items-center rounded-full bg-loop-discovery px-3 py-1 text-sm font-semibold text-primary">
              Beta
            </span>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Free while we&apos;re in beta
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              We&apos;re building Loops in the open. During our beta phase, the
              Discovery Loop Coach is completely free &mdash; no limits, no
              credit card, no catch.
            </p>
            <div className="mb-8 rounded-xl border border-loop-discovery/50 p-8" style={{ backgroundColor: "var(--loop-discovery-subtle)" }}>
              <div className="space-y-4">
                <div className="text-5xl font-bold">$0</div>
                <div className="font-medium text-muted-foreground">
                  Everything included. For now, it&apos;s on us.
                </div>
                <ul className="mx-auto max-w-xs space-y-3 pt-4 text-left text-sm">
                  {[
                    "Unlimited specs",
                    "All AI personas",
                    "GitHub, Linear & Jira integrations",
                    "Markdown export",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-loop-discovery" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="pt-4">
                  <SignInButton mode="modal">
                    <button className="inline-flex h-12 items-center justify-center rounded-lg bg-loop-discovery px-8 text-base font-medium text-primary transition-colors hover:bg-loop-discovery/90">
                      Get Started Free
                    </button>
                  </SignInButton>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Pricing plans will be introduced when we leave beta. Early users
              will be rewarded.
            </p>
          </div>
        </section>

        {/* Philosophy */}
        <section id="philosophy" className="bg-muted/50 py-24">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">
              Built on what works
            </h2>
            <p className="mb-8 text-balance text-lg text-muted-foreground">
              Loops builds on Agile, DevOps, Lean, and XP&mdash;it doesn&apos;t
              replace them. Every improvement in software delivery has been about
              tightening feedback loops. AI is the next evolution of this
              principle.
            </p>
            <Link
              href="/docs/loops-intro"
              className="inline-flex items-center text-base font-medium text-primary underline-offset-4 hover:underline"
            >
              Read the full framework introduction{" "}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="relative overflow-hidden py-24">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "var(--loop-discovery-subtle)" }}
          />
          <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
            <h2 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl">
              Start your first discovery session
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground">
              Join the teams shipping better software, faster.
            </p>
            <div className="flex flex-col items-center gap-4">
              <SignInButton mode="modal">
                <button className="inline-flex h-14 items-center justify-center rounded-lg bg-loop-discovery px-10 text-lg font-medium text-primary transition-colors hover:bg-loop-discovery/90">
                  Get Started Free
                </button>
              </SignInButton>
              <p className="text-sm text-muted-foreground">
                No credit card required. 10 free specs/month.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Loops" width={24} height={24} className="h-6 w-6" />
            <span className="text-lg font-bold tracking-tight">Loops</span>
          </div>

          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link
              href="/docs"
              className="transition-colors hover:text-foreground"
            >
              Docs
            </Link>
            <a
              href="#pricing"
              className="transition-colors hover:text-foreground"
            >
              Pricing
            </a>
            <a
              href="https://github.com/MacsDickinson/loops"
              className="transition-colors hover:text-foreground"
            >
              GitHub
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Blog
            </a>
          </div>

          <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground md:items-end">
            <span>
              Built in the UK by{" "}
              <a
                href="https://macs.dev"
                className="font-medium text-foreground hover:underline"
              >
                macs.dev
              </a>
            </span>
            <span>&copy; 2026 Loops. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
