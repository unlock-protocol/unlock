type ProposalErrorStateProps = {
  description: string
  title?: string
}

export function ProposalErrorState({
  description,
  title = 'Unable to load governance data',
}: ProposalErrorStateProps) {
  return (
    <section className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-rose-900">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">
        RPC Error
      </p>
      <h2 className="mt-3 text-2xl font-semibold">{title}</h2>
      <p className="mt-3 max-w-2xl text-base leading-7 text-rose-800/90">
        {description}
      </p>
    </section>
  )
}
