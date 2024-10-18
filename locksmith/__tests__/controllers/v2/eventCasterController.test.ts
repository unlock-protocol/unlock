import request from 'supertest'
import { vi, describe, expect } from 'vitest'
import app from '../../app'

const mockWalletService = {
  connect: vi.fn(),
  createLock: async () => {
    return '0xce332211f030567bd301507443AD9240e0b13644'
  },
}

vi.mock('@unlock-protocol/unlock-js', () => ({
  // Web3Service: function Web3Service() {},
  WalletService: function WalletService() {
    return mockWalletService
  },
}))

// https://events.xyz/api/v1/event?event_id=195ede7f
const eventCasterEvent = {
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
    pinned_cast_hash: '0x7b51a2953f0135c8dbf819f297299357e5b98768',
    created_at: 1687284741,
    parent_url:
      'chain://eip155:1/erc721:0xdf9b7d26c8fc806b1ae6273684556761ff02d422',
    moderator_fids: [4167, 861203, 13870],
    lead: {
      object: 'user',
      fid: 4167,
      custody_address: '0xbb54a63ad8241710eba3a98af224080b611ff8e9',
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
      verifications: ['0xceed9585854f12f81a0103861b83b995a64ad915'],
      verified_addresses: {
        eth_addresses: ['0xceed9585854f12f81a0103861b83b995a64ad915'],
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
      custody_address: '0x8fb18d6eadac23568c83dff23179b99d43b46450',
      username: '0xsatori',
      display_name: 'Satori',
      pfp_url:
        'https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/8385e4cd-4752-4bf3-d95a-e0b2cca24900/original',
      profile: { bio: { text: '' } },
      follower_count: 4928,
      following_count: 998,
      verifications: [
        '0xdcf37d8aa17142f053aaa7dc56025ab00d897a19',
        '0x05e189e1bbaf77f1654f0983872fd938ae592edd',
        '0x70abdcd7a5a8ff9cdef1cca9ea15a5d315780986',
      ],
      verified_addresses: {
        eth_addresses: [
          '0xdcf37d8aa17142f053aaa7dc56025ab00d897a19',
          '0x05e189e1bbaf77f1654f0983872fd938ae592edd',
          '0x70abdcd7a5a8ff9cdef1cca9ea15a5d315780986',
        ],
        sol_addresses: ['DU3LVi19cTAqjv7czqVPTns3Rgv155DwiHtdzVpmCmMi'],
      },
      active_status: 'inactive',
      power_badge: true,
    },
    {
      object: 'user',
      fid: 4167,
      custody_address: '0xbb54a63ad8241710eba3a98af224080b611ff8e9',
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
      verifications: ['0xceed9585854f12f81a0103861b83b995a64ad915'],
      verified_addresses: {
        eth_addresses: ['0xceed9585854f12f81a0103861b83b995a64ad915'],
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
      address: '0xe8af882f2f5c79580230710ac0e2344070099432',
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

describe('eventcaster endpoints', () => {
  describe('create-event endpoint', () => {
    it('creates the contract and returns its address', async () => {
      const response = await request(app)
        .post(`/v2/eventcaster/create-event`)
        .set('Accept', 'json')
        .send(eventCasterEvent)

      expect(response.status).toBe(201)
    })
  })
  describe('rsvp-for-event endpoint', () => {
    it('mints the token and returns its id', async () => {
      const response = await request(app)
        .post(`/v2/eventcaster/create-event`)
        .set('Accept', 'json')
        .send(eventCasterEvent)

      expect(response.status).toBe(201)
    })
  })
})
