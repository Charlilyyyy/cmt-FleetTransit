import Link from 'next/link';
import { MapPinned, Radio, ShieldCheck, BellRing } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-background to-slate-50">
      <header className="container mx-auto flex items-center justify-between px-4 py-6">
        <p className="font-display text-lg font-semibold tracking-tight text-primary">
          CMT Fleet Transit
        </p>
        <nav className="flex gap-3 text-sm">
          <Link
            href="/auth/login"
            className="rounded-md px-3 py-2 text-muted-foreground transition hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/api/health"
            className="rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground transition hover:opacity-90"
          >
            Health
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 pb-20 pt-10 md:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Fleet control for passenger transit
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Plan routes, track vehicles live, verify boarding, and notify guardians — with
            organization-level isolation built in.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/login"
              className="inline-flex min-w-[10rem] items-center justify-center rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex min-w-[10rem] items-center justify-center rounded-md border border-border bg-card px-6 py-3 font-semibold text-foreground transition hover:bg-accent"
            >
              Dashboard
            </Link>
          </div>
        </div>

        <ul className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-2">
          <Capability
            icon={<MapPinned className="h-6 w-6" />}
            title="Route planning"
            body="Capacity-aware stops and optimized pickup order."
          />
          <Capability
            icon={<Radio className="h-6 w-6" />}
            title="Live tracking"
            body="Realtime GPS on operator and guardian views."
          />
          <Capability
            icon={<ShieldCheck className="h-6 w-6" />}
            title="Verified check-in"
            body="OTP and optional photo proof tied to location."
          />
          <Capability
            icon={<BellRing className="h-6 w-6" />}
            title="Multi-channel alerts"
            body="FCM, LINE, and Telegram for pickup and delay events."
          />
        </ul>

        <p className="mt-16 text-center text-sm text-muted-foreground">
          Roles: SuperAdmin · Admin · Staff · Driver · Parent
        </p>
      </main>
    </div>
  );
}

function Capability({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="rounded-lg border border-border/80 bg-card/80 p-5 text-left shadow-sm backdrop-blur">
      <div className="mb-3 text-primary">{icon}</div>
      <h2 className="font-display text-base font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </li>
  );
}
