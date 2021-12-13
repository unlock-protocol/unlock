import fetch from 'cross-fetch'

interface listManagersProps {
  lockAddress: string
  subgraphURI: string
}

// fetch all managers from the GRAPH
export default async function listManagers({
  lockAddress,
  subgraphURI,
}: listManagersProps) {
  const query = `
    {
      locks(where:{
        address: "${lockAddress}"
      }) {
        LockManagers {
          address
        }
      }
    }
  `

  const q = await fetch(subgraphURI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
    }),
  })

  const { data, errors } = await q.json()
  if (errors) {
    // eslint-disable-next-line no-console
    console.log('LOCK > Error while fetching the graph', errors)
    return []
  }

  const {
    locks: [{ LockManagers }],
  } = data
  const managers = LockManagers.map((m: any) => m.address)
  return managers
}
