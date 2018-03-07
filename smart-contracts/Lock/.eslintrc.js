module.exports = {
  extends: "standard",
  plugins: ["mocha"],
  globals: {
      "it": true,
      "artifacts": true,
      "contract": true,
      "describe": true,
      "before": true,
      "web3": true
  },
  rules: {
    "mocha/no-exclusive-tests": "error"
  }
};