import Link from 'next/link'

export default function DelegatePage() {
  return (
    <section className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-ui-primary/55">
        Personal Delegation
      </p>
      <h2 className="mt-4 text-4xl font-semibold text-brand-ui-primary">
        Wallet-specific delegation comes next
      </h2>
      <p className="mt-4 max-w-3xl text-base leading-7 text-brand-ui-primary/72">
        This slice adds the public delegation leaderboard first. The next
        transaction-focused slice will wire connected-wallet delegation status,
        self-delegation messaging, and `UPToken.delegate()` writes.
      </p>
      <div className="mt-8">
        <Link
          className="rounded-full bg-brand-ui-primary px-5 py-3 text-sm font-semibold text-white"
          href="/delegates"
        >
          View delegate leaderboard
        </Link>
      </div>
    </section>
  )
}
