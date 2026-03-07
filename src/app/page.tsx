import { auth } from "@clerk/nextjs/server";
import { SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Check } from "lucide-react";

export default async function Home() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  const loops = [
    {
      name: "Discovery",
      color: "loop-discovery",
      description:
        "Turn rough ideas into precise, testable specifications through AI-guided dialogue.",
      status: "Available now",
    },
    {
      name: "Build",
      color: "loop-build",
      description:
        "Build against spec-driven acceptance tests. AI handles implementation; you handle architecture.",
      status: "Coming soon",
    },
    {
      name: "Operationalise",
      color: "loop-operationalise",
      description:
        "Graduate validated software to production quality with continuous compliance.",
      status: "Coming soon",
    },
    {
      name: "Grow",
      color: "loop-grow",
      description:
        "Measure what matters, learn from production, and feed evidence into the next cycle.",
      status: "Coming soon",
    },
  ];

  const personas = [
    {
      title: "Product Managers",
      description:
        "Create specs your engineers actually use. No more 2-hour PRDs that still leave questions unanswered.",
    },
    {
      title: "Engineering Leads",
      description:
        "Get acceptance criteria upfront. Your team builds the right thing first time.",
    },
    {
      title: "Technical Founders",
      description:
        "Wear both hats. Structure your requirements before handing off to AI coding tools.",
    },
  ];

  const pricing = [
    {
      name: "Free",
      price: "$0",
      features: [
        "10 specs/month",
        "Basic personas",
        "Markdown export",
        "Community support",
      ],
    },
    {
      name: "Pro",
      price: "$29",
      period: "/PM/month",
      features: [
        "Unlimited specs",
        "All personas",
        "GitHub, Linear, Jira integrations",
        "Priority support",
      ],
      highlighted: true,
    },
    {
      name: "Team",
      price: "$199",
      period: "/month for 10 seats",
      features: [
        "Everything in Pro",
        "Shared spec library",
        "Custom personas",
        "Analytics & insights",
        "Dedicated support",
      ],
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold">Loops</h1>
          <nav className="flex items-center gap-6">
            <Link
              href="#pricing"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Docs
            </Link>
            {isSignedIn ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <UserButton />
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                  Sign In
                </button>
              </SignInButton>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 py-24 md:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-5xl font-bold tracking-tight md:text-6xl">
                Software delivery, redesigned for the age of AI
              </h2>
              <p className="mt-6 text-xl leading-8 text-muted-foreground">
                Loops is an AI-powered platform that tightens the feedback loops
                that matter most: Discovery, Build, Operationalise, and Grow.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                {isSignedIn ? (
                  <Link
                    href="/dashboard"
                    className="rounded-full px-8 py-3 text-base font-semibold transition-colors"
                    style={{
                      backgroundColor: "var(--accent-brand)",
                      color: "white",
                    }}
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <SignInButton mode="modal">
                    <button
                      className="rounded-full px-8 py-3 text-base font-semibold transition-colors hover:opacity-90"
                      style={{
                        backgroundColor: "var(--accent-brand)",
                        color: "white",
                      }}
                    >
                      Start with Discovery
                    </button>
                  </SignInButton>
                )}
                <Link
                  href="/docs"
                  className="rounded-full border border-border px-8 py-3 text-base font-semibold transition-colors hover:bg-accent"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Visual representation of loops */}
            <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {loops.map((loop, index) => (
                <div
                  key={loop.name}
                  className="relative rounded-2xl border p-6 transition-all hover:shadow-lg"
                  style={{
                    borderColor: `var(--${loop.color}-border)`,
                    backgroundColor: `var(--${loop.color}-subtle)`,
                  }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full text-2xl font-bold" style={{
                    backgroundColor: `var(--${loop.color})`,
                    color: "white",
                  }}>
                    {index + 1}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{loop.name}</h3>
                  <p className="mt-1 text-xs font-medium" style={{
                    color: `var(--${loop.color})`,
                  }}>
                    {loop.status}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="border-t border-border px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-4xl font-bold tracking-tight">
                AI builds fast. But are you building the right thing?
              </h2>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                AI coding tools have made build dramatically faster. But unclear
                requirements don&apos;t produce wrong code slowly — they produce wrong
                code quickly. The faster you can build, the more expensive
                ambiguity becomes.
              </p>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                The bottleneck has shifted. From build to discovery. From
                deployment to operationalisation. From shipping to learning.
              </p>
            </div>
          </div>
        </section>

        {/* The Four Loops Section */}
        <section className="border-t border-border bg-muted/50 px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-4xl font-bold tracking-tight">
                The Four Loops
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Every improvement in software delivery has been about making
                feedback loops faster. AI is the next evolution of this principle.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2">
              {loops.map((loop) => (
                <div
                  key={loop.name}
                  className="rounded-2xl border bg-card p-8 shadow-sm transition-all hover:shadow-md"
                  style={{
                    borderColor: `var(--${loop.color}-border)`,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-semibold">{loop.name}</h3>
                      <span
                        className="mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: `var(--${loop.color}-subtle)`,
                          color: `var(--${loop.color})`,
                        }}
                      >
                        {loop.status}
                      </span>
                    </div>
                  </div>
                  <p className="mt-4 text-muted-foreground">{loop.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Discovery Loop Coach Section */}
        <section className="border-t border-border px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-4xl font-bold tracking-tight">
                Meet the Discovery Loop Coach
              </h2>
              <p className="mt-4 text-xl text-muted-foreground">
                Your AI spec assistant that turns ideas into precise
                specifications with built-in acceptance tests.
              </p>
            </div>

            <div className="mt-16 rounded-2xl border border-border bg-card p-8 md:p-12">
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: "var(--loop-discovery)" }}
                  >
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      Describe your feature
                    </h3>
                    <p className="mt-1 text-muted-foreground">
                      &quot;Add SSO login with Google and Microsoft&quot;
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: "var(--loop-discovery)" }}
                  >
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">AI probes for clarity</h3>
                    <p className="mt-1 text-muted-foreground">
                      &quot;What happens if the SSO provider is down? Should there be a
                      fallback?&quot;
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: "var(--loop-discovery)" }}
                  >
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      Multiple perspectives
                    </h3>
                    <p className="mt-1 text-muted-foreground">
                      Security, UX, and domain experts join the conversation
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: "var(--loop-discovery)" }}
                  >
                    4
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Spec + tests emerge</h3>
                    <p className="mt-1 text-muted-foreground">
                      Structured requirements with Gherkin acceptance tests
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: "var(--loop-discovery)" }}
                  >
                    5
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Export anywhere</h3>
                    <p className="mt-1 text-muted-foreground">
                      GitHub PR, Linear issue, or Markdown file
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Who It's For Section */}
        <section className="border-t border-border bg-muted/50 px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-4xl font-bold tracking-tight">
                Built for teams shipping with AI

              </h2>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {personas.map((persona) => (
                <div
                  key={persona.title}
                  className="rounded-2xl border border-border bg-card p-8 shadow-sm"
                >
                  <h3 className="text-xl font-semibold">{persona.title}</h3>
                  <p className="mt-4 text-muted-foreground">
                    {persona.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="border-t border-border px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-4xl font-bold tracking-tight">
                Simple, transparent pricing
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Start free, upgrade when you need more
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {pricing.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-2xl p-8 ${
                    plan.highlighted
                      ? "shadow-lg border-2"
                      : "border border-border bg-card shadow-sm"
                  }`}
                  style={
                    plan.highlighted
                      ? {
                          borderColor: "var(--loop-discovery-border)",
                          backgroundColor: "var(--card)",
                        }
                      : undefined
                  }
                >
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground">{plan.period}</span>
                    )}
                  </div>
                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 shrink-0 text-green-600" />
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    {isSignedIn ? (
                      <Link
                        href="/dashboard"
                        className={`block w-full rounded-full px-6 py-3 text-center text-sm font-semibold transition-colors ${
                          plan.highlighted
                            ? "text-white"
                            : "border border-border bg-secondary text-secondary-foreground hover:bg-accent"
                        }`}
                        style={
                          plan.highlighted
                            ? { backgroundColor: "var(--accent-brand)" }
                            : undefined
                        }
                      >
                        Go to Dashboard
                      </Link>
                    ) : (
                      <SignInButton mode="modal">
                        <button
                          className={`w-full rounded-full px-6 py-3 text-sm font-semibold transition-colors ${
                            plan.highlighted
                              ? "text-white hover:opacity-90"
                              : "border border-border bg-secondary text-secondary-foreground hover:bg-accent"
                          }`}
                          style={
                            plan.highlighted
                              ? { backgroundColor: "var(--accent-brand)" }
                              : undefined
                          }
                        >
                          Get Started Free
                        </button>
                      </SignInButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="border-t border-border bg-muted/50 px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-4xl font-bold tracking-tight">
                Built on what works
              </h2>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Loops builds on Agile, DevOps, Lean, and XP — it doesn&apos;t replace
                them. Every improvement in software delivery has been about
                tightening feedback loops. AI is the next evolution of this
                principle.
              </p>
              <div className="mt-8">
                <Link
                  href="/docs/loops-intro"
                  className="inline-flex items-center text-base font-semibold transition-colors hover:opacity-80"
                  style={{ color: "var(--accent-brand)" }}
                >
                  Read the full framework introduction →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="border-t border-border px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-4xl font-bold tracking-tight">
                Start your first discovery session
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                No credit card required. 10 free specs/month.
              </p>
              <div className="mt-8">
                {isSignedIn ? (
                  <Link
                    href="/dashboard"
                    className="inline-block rounded-full px-8 py-3 text-base font-semibold text-white transition-colors hover:opacity-90"
                    style={{ backgroundColor: "var(--accent-brand)" }}
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <SignInButton mode="modal">
                    <button
                      className="rounded-full px-8 py-3 text-base font-semibold text-white transition-colors hover:opacity-90"
                      style={{ backgroundColor: "var(--accent-brand)" }}
                    >
                      Get Started Free
                    </button>
                  </SignInButton>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                Built by{" "}
                <a
                  href="https://macs.dev"
                  className="font-medium hover:text-foreground"
                >
                  macs.dev
                </a>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                &copy; 2026 Loops. All rights reserved.
              </p>
            </div>
            <nav className="flex gap-6">
              <Link
                href="/docs"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Docs
              </Link>
              <Link
                href="#pricing"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Pricing
              </Link>
              <a
                href="https://github.com/MacsDickinson/loops"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                GitHub
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
