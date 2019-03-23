module.exports = {
  extends: ["standard", "plugin:prettier/recommended"],
  plugins: ["prettier", "mocha"],
  globals: {
    it: true,
    artifacts: true,
    contract: true,
    describe: true,
    before: true,
    beforeEach: true,
    web3: true,
    assert: true
  },
  rules: {
    "prettier/prettier": "error",
    "mocha/no-exclusive-tests": "error",
    "eol-last": ["error"]
  }
}
