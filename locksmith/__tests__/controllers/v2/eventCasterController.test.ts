import request from 'supertest'
import { vi, describe, expect, beforeAll, beforeEach } from 'vitest'
import app from '../../app'
import { Application } from '../../../src/models/application'
import { EVENT_CASTER_ADDRESS } from '../../../src/utils/constants'
import { ethers } from 'ethers'
import { addJob } from '../../../src/worker/worker'

const lockAddress = '0xce332211f030567bd301507443AD9240e0b13644'
const tokenId = 1337
const owner = '0xCEEd9585854F12F81A0103861b83b995A64AD915'

const mockWalletService = {
  connect: vi.fn(),
  grantKey: async () => {
    return { id: tokenId, owner }
  },
}

const mockWeb3Service = {
  getKeyByLockForOwner: vi.fn((lockAddress, owner, network) => {
    if (owner === '0xCEEd9585854F12F81A0103861b83b995A64AD915') {
      return Promise.resolve({
        tokenId: 1337,
      })
    }
    return Promise.resolve({
      tokenId: 0,
    })
  }),
}

vi.mock('@unlock-protocol/unlock-js', () => ({
  WalletService: function WalletService() {
    return mockWalletService
  },
  Web3Service: function Web3Service() {
    return mockWeb3Service
  },
}))

vi.mock('../../../src/operations/eventCasterOperations', () => ({
  deployLockForEventCaster: async () => {
    return { address: lockAddress, network: 84532 }
  },
  getEventFormEventCaster: async () => {
    return { contract: { network: 84532, address: lockAddress } }
  },
  mintNFTForRsvp: async () => {
    return { id: tokenId, owner, network: 84532, address: lockAddress }
  },
}))

vi.mock('../../../src/worker/worker', () => ({
  addJob: vi.fn().mockResolvedValue(Promise.resolve(true)),
}))

// mock pdfmake
vi.mock('pdfmake/build/pdfmake', () => ({
  default: {
    vfs: {},
    createPdf: vi.fn(),
  },
}))

vi.mock('pdfmake/build/vfs_fonts', () => ({
  default: {
    pdfMake: {
      vfs: {},
    },
  },
}))

// https://events.xyz/api/v1/event?event_id=195ede7f
const eventCasterEvent = {
  contract: {
    network: 84532,
    address: lockAddress,
  },
  id: '195ede7f-3795-4403-8f8a-6a73b8f20937',
  title: 'BuilderDAO bimonthly meeting Oct 17',
  image_url:
    'https://i.seadn.io/gae/emh3ta_T35Zqa9taIH4FW-xoIjLOVz_HfJfCyXWlwc2714nRn0UfJxaV9lQBVpSXj-rOnba_arbMYufP0tT8triR8FgwzALfnmBrRA?w=500&auto=format',
  description:
    'Bimonthly meeting for BuilderDAO members, proposers or members of DAOs built on Nouns Builder.',
  start_date: '2024-10-17',
  start_time: '17:00',
  end_date: '2024-10-17',
  end_time: '17:00',
  time_zone: 'America/New_York',
  recurrence_rules: [],
  sessions: [],
  link_to_join: null,
  place: { city: null },
  link_abbr: 'discord.gg',
  place_abbr: null,
  channel: {
    object: 'channel',
    id: 'builder',
    url: 'chain://eip155:1/erc721:0xdf9b7d26c8fc806b1ae6273684556761ff02d422',
    name: 'BuilderDAO',
    image_url:
      'https://i.seadn.io/gae/emh3ta_T35Zqa9taIH4FW-xoIjLOVz_HfJfCyXWlwc2714nRn0UfJxaV9lQBVpSXj-rOnba_arbMYufP0tT8triR8FgwzALfnmBrRA?w=500&auto=format',
    header_image_url:
      'https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/5d85309d-dbbe-4ced-3db0-4c0d32dc5b00/original',
    external_link: { title: 'Nouns.Build', url: 'nouns.build' },
    description:
      'BuilderDAO is dedicated to the creation and development of free and accessible DAO infrastructure as a public good. This channel is for discussion about BuilderDAO, Nouns Builder and DAOs built on Nouns.Build.  discord: https://discord.gg/DGZWbWbE6r',
    follower_count: 3850,
    member_count: 35,
    pinned_cast_hash: '0x7b51a2953f0135C8dBF819F297299357E5b98768',
    created_at: 1687284741,
    parent_url:
      'chain://eip155:1/erc721:0xdf9b7d26c8fc806b1ae6273684556761ff02d422',
    moderator_fids: [4167, 861203, 13870],
    lead: {
      object: 'user',
      fid: 4167,
      custody_address: '0xBb54a63aD8241710ebA3A98af224080B611FF8e9',
      username: 'nounishprof',
      display_name: 'Nounish Prof ⌐◧-◧🎩',
      pfp_url: 'https://i.imgur.com/fXhGSf4.jpg',
      profile: {
        bio: {
          text: 'building /gmfarcaster network |\nblockchain ENT prof |  ⌐◧-◧ Nouncillor, Nouner, BuilderDAO community resident /builder |\n\nhttps://www.gmfarcaster.com/ ',
        },
      },
      follower_count: 66380,
      following_count: 2730,
      verifications: ['0xCEEd9585854F12F81A0103861b83b995A64AD915'],
      verified_addresses: {
        eth_addresses: ['0xCEEd9585854F12F81A0103861b83b995A64AD915'],
        sol_addresses: [],
      },
      active_status: 'inactive',
      power_badge: true,
    },
  },
  hosts: [
    {
      object: 'user',
      fid: 13870,
      custody_address: '0x8fb18d6EADAc23568c83DFF23179b99D43b46450',
      username: '0xsatori',
      display_name: 'Satori',
      pfp_url:
        'https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/8385e4cd-4752-4bf3-d95a-e0b2cca24900/original',
      profile: { bio: { text: '' } },
      follower_count: 4928,
      following_count: 998,
      verifications: [
        '0xdcf37d8Aa17142f053AAA7dc56025aB00D897a19',
        '0x05e189E1BbaF77f1654F0983872fd938AE592eDD',
        '0x70abdCd7A5A8Ff9cDef1ccA9eA15a5d315780986',
      ],
      verified_addresses: {
        eth_addresses: [
          '0xdcf37d8Aa17142f053AAA7dc56025aB00D897a19',
          '0x05e189E1BbaF77f1654F0983872fd938AE592eDD',
          '0x70abdCd7A5A8Ff9cDef1ccA9eA15a5d315780986',
        ],
        sol_addresses: ['DU3LVi19cTAqjv7czqVPTns3Rgv155DwiHtdzVpmCmMi'],
      },
      active_status: 'inactive',
      power_badge: true,
    },
    {
      object: 'user',
      fid: 4167,
      custody_address: '0xBb54a63aD8241710ebA3A98af224080B611FF8e9',
      username: 'nounishprof',
      display_name: 'Nounish Prof ⌐◧-◧🎩',
      pfp_url: 'https://i.imgur.com/fXhGSf4.jpg',
      profile: {
        bio: {
          text: 'building /gmfarcaster network |\nblockchain ENT prof |  ⌐◧-◧ Nouncillor, Nouner, BuilderDAO community resident /builder |\n\nhttps://www.gmfarcaster.com/ ',
        },
      },
      follower_count: 66380,
      following_count: 2730,
      verifications: ['0xCEEd9585854F12F81A0103861b83b995A64AD915'],
      verified_addresses: {
        eth_addresses: ['0xCEEd9585854F12F81A0103861b83b995A64AD915'],
        sol_addresses: [],
      },
      active_status: 'inactive',
      power_badge: true,
    },
  ],
  waitlist: 'off',
  guest_limit: 0,
  approved_nfts: [
    {
      name: 'Builder',
      image_url:
        'https://lh3.googleusercontent.com/w3pcimLpCLH6zzNRiFriid57argDTpYUyk7eBgTh2OUqc4Ohi95oL-QoSPiZuxXDzJem2ROxv_FWoiVYs-JU-voryPR7yhabew',
      address: '0xe8aF882f2f5C79580230710Ac0E2344070099432',
      chain: 'base',
    },
  ],
  bg_color: '#000000',
  text_color: '#dfffff',
  text_theme: 'classic',
  going_count: 15,
  is_host: false,
  is_admin: false,
}

const eventCasterRsvp = {
  user: {
    object: 'user',
    fid: 287173,
    custody_address: '0xC5D8D60040C755214580D806209B8797A4aD5527',
    username: 'nameddoki',
    display_name: 'Doki 🎩🔵',
    pfp_url:
      'https://ipfs.decentralized-content.com/ipfs/QmQ9sQo3ghumyqHFpWoXuzQCdPeHe7WbEc2ar8io4gqmjH',
    profile: {
      bio: {
        text: ' || Town Planner 🌉🌆🌁 || WEB 3.0 🌐|| DeFi🫂Over CEX🏦 ||\nDigital Asset Researcher 🔍|| Reply guy',
      },
    },
    follower_count: 797,
    following_count: 2294,
    verifications: ['0xA66fD186bB39c15ec8830948c9CaD52b83d8f84c'],
    verified_addresses: {
      eth_addresses: ['0xA66fD186bB39c15ec8830948c9CaD52b83d8f84c'],
      sol_addresses: ['9bRHMKMyeApGePJWX937HjSbSFNUHRgg1f4SGsEcmwak'],
    },
    verified_accounts: [
      {
        platform: 'x',
        username: 'jeromedok',
      },
    ],
    active_status: 'inactive',
    power_badge: false,
    viewer_context: {
      following: false,
      followed_by: false,
      blocking: false,
      blocked_by: false,
    },
  },
  timestamp: 1729197029821,
}

const eventCasterApplication = new Application()
eventCasterApplication.name = 'EventCaster'
eventCasterApplication.walletAddress = EVENT_CASTER_ADDRESS
eventCasterApplication.key = Buffer.from(crypto.randomUUID()).toString('base64')

describe('eventcaster endpoints', () => {
  beforeAll(async () => {
    await eventCasterApplication.save()
  })

  beforeEach(() => {
    fetchMock.resetMocks()
  })

  describe('create-event endpoint', () => {
    it('fails without authentication', async () => {
      const response = await request(app)
        .post(`/v2/eventcaster/create-event`)
        .set('Accept', 'json')
        .send(eventCasterEvent)

      expect(response.status).toBe(401)
    })

    it('fails with the wrong authentication', async () => {
      const badApplication = new Application()
      badApplication.name = 'Fake EventCaster'
      badApplication.walletAddress = ethers.Wallet.createRandom().address
      badApplication.key = Buffer.from(crypto.randomUUID()).toString('base64')
      await badApplication.save()

      const response = await request(app)
        .post(`/v2/eventcaster/create-event`)
        .set('Accept', 'json')
        .set('Authorization', `Api-key ${badApplication.key}`)
        .send(eventCasterEvent)

      expect(response.status).toBe(403)
    })

    it('creates a job to deploy the contract', async () => {
      const response = await request(app)
        .post(`/v2/eventcaster/create-event`)
        .set('Accept', 'json')
        .set('Authorization', `Api-key ${eventCasterApplication.key}`)
        .send(eventCasterEvent)
      expect(response.status).toBe(204)
      expect(addJob).toHaveBeenCalledWith('createEventCasterEvent', {
        description: eventCasterEvent.description,
        eventId: eventCasterEvent.id,
        imageUrl: eventCasterEvent.image_url,
        title: eventCasterEvent.title,
        hosts: [
          {
            verified_addresses: {
              eth_addresses: [
                '0xdcf37d8Aa17142f053AAA7dc56025aB00D897a19',
                '0x05e189E1BbaF77f1654F0983872fd938AE592eDD',
                '0x70abdCd7A5A8Ff9cDef1ccA9eA15a5d315780986',
              ],
            },
          },
          {
            verified_addresses: {
              eth_addresses: ['0xCEEd9585854F12F81A0103861b83b995A64AD915'],
            },
          },
        ],
      })
    })
  })
  describe('rsvp-for-event endpoint', () => {
    it('triggers the job to mint the NFT', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({ success: true, event: eventCasterEvent })
      )
      const response = await request(app)
        .post(`/v2/eventcaster/${eventCasterEvent.id}/rsvp`)
        .set('Accept', 'json')
        .set('Authorization', `Api-key ${eventCasterApplication.key}`)
        .send(eventCasterRsvp)

      expect(response.status).toBe(204)
      expect(addJob).toHaveBeenCalledWith('rsvpForEventCasterEvent', {
        contract: {
          address: lockAddress,
          network: 84532,
        },
        eventId: eventCasterEvent.id,
        farcasterId: eventCasterRsvp.user.fid,
        ownerAddress: eventCasterRsvp.user.verified_addresses.eth_addresses[0],
      })
    })
  })
  describe('delete-event endpoint', () => {
    it('should be able to delete an event', async () => {
      const response = await request(app)
        .post(`/v2/eventcaster/delete-event`)
        .set('Accept', 'json')
        .set('Authorization', `Api-key ${eventCasterApplication.key}`)
        .send({ id: eventCasterEvent.id })

      expect(response.status).toBe(200)
    })
  })
  describe('unrsvp-for-event endpoint', () => {
    it('burns the token', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({ success: true, event: eventCasterEvent })
      )

      const response = await request(app)
        .post(`/v2/eventcaster/${eventCasterEvent.id}/unrsvp`)
        .set('Accept', 'json')
        .set('Authorization', `Api-key ${eventCasterApplication.key}`)
        .send(eventCasterRsvp)

      expect(response.status).toBe(200)
    })
  })
})
