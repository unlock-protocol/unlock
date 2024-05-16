// requires environment variables TENDERLY_ACCOUNT_SLUG, TENDERLY_PROJECT_SLUG and TENDERLY_ACCESS_KEY to be set
// https://docs.tenderly.co/account/projects/account-project-slug
// https://docs.tenderly.co/account/projects/how-to-generate-api-access-token
const { TENDERLY_ACCOUNT_SLUG, TENDERLY_PROJECT_SLUG, TENDERLY_ACCESS_KEY } =
  process.env

async function deleteFork(forkId) {
  return await fetch(
    `https://api.tenderly.co/api/v1/account/${TENDERLY_ACCOUNT_SLUG}/project/${TENDERLY_PROJECT_SLUG}/fork/${forkId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': TENDERLY_ACCESS_KEY,
      },
    }
  )
}

async function createFork(network_id) {
  if (
    !TENDERLY_ACCOUNT_SLUG ||
    !TENDERLY_PROJECT_SLUG ||
    !TENDERLY_ACCESS_KEY
  ) {
    throw new Error(`Missing tenderly credentials. Please export 
TENDERLY_ACCOUNT_SLUG, TENDERLY_PROJECT_SLUG, TENDERLY_ACCESS_KEY to your env`)
  }
  const res = await fetch(
    `https://api.tenderly.co/api/v1/account/${TENDERLY_ACCOUNT_SLUG}/project/${TENDERLY_PROJECT_SLUG}/fork`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': TENDERLY_ACCESS_KEY,
      },
      body: JSON.stringify({
        network_id,
      }),
    }
  )
  if (res.status === 201) {
    const data = await res.json()
    const forkId = data.simulation_fork.id
    console.log(`Fork for chain ${network_id} created: ${forkId}`)
    const rpcUrl = `https://rpc.tenderly.co/fork/${forkId}`
    return {
      projectURL: `https://dashboard.tenderly.co/${TENDERLY_ACCOUNT_SLUG}/${TENDERLY_PROJECT_SLUG}/fork/${forkId}`,
      rpcUrl,
      data,
    }
  }
  throw new Error(`Failed to create a Tenderly fork ${res}`)
}

module.exports = { deleteFork, createFork }
