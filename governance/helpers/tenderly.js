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

  const { data } = res.json()
  const forkId = data.simulation_fork.id
  const rpcUrl = `https://rpc.tenderly.co/fork/${forkId}`
  return {
    rpcUrl,
    data,
  }
}

module.exports = { deleteFork, createFork }
