import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center gap-4 px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-ui-primary/60">
        Governance App
      </p>
      <h1 className="text-4xl font-semibold text-brand-ui-primary">
        Page not found
      </h1>
      <p className="max-w-xl text-base text-brand-ui-primary/70">
        The route exists in the governance app shell, but this specific page has
        not been implemented.
      </p>
      <Link
        className="rounded-full bg-brand-ui-primary px-4 py-2 text-sm font-medium text-white"
        href="/"
      >
        Back to home
      </Link>
    </main>
  )
}
