module.exports = {
  extends: "standard",
  plugins: ["mocha"],
  globals: {
      "it": true,
      "artifacts": true,
      "contract": true,
      "describe": true,
      "before": true,
      "beforeEach": true,
      "web3": true,
      "assert": true
  },
  rules: {
    "mocha/no-exclusive-tests": "error"
  }
};