// These are the locks that will be deployed for integration tests. By abstracting them to here, we can update them if the standup changes
module.exports = {
  paywallETHLockAddress: '0x45DeBF700aB8120aC0665119467EA82BDB45E00b',
  paywallERC20LockAddress: '0x80bc6d2870bB72CB3E37B648C160dA20733386F7',

  adblockETHLockAddresses: [
    '0xC11eF3E2cCE6963653C2c9F66b52e5bD2d274564',
    '0xd9B3865D630941C54B6aA263a4DD4B8e66AB3c5c',
    '0x1c7ec43575239A482a01Ac8A2A73d0c68887e151',
  ],
  adblockERC20LockAddresses: [
    '0x1c0E27f7967899578eF138384F8cFC0bf579d063',
    '0xce341cc78D9774808f0E5b654aF8B57B5126C6BA',
    '0x0AAF2059Cb2cE8Eeb1a0C60f4e0f2789214350a5',
  ],
}
