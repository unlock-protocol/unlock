import request from 'supertest'
const app = require('../src/app')

const lockAddress = '0x26Aea296Fe3cC424d1830847D91c8Ad03d8139b6'
const walletAddress = '0x26Aea296Fe3cC424d1830847D91c8Ad03d8139b6'

async function main() {
  const metadata = {
    public: {
      username: 'example',
    },
    protected: {
      email: 'test@example.com',
    },
  }
  const userMetadataResponse = await request(app)
    .post(`/v2/api/metadata/100/locks/${lockAddress}/users/${walletAddress}`)
    .send({ metadata })
  console.log(userMetadataResponse.body)
}

main()
