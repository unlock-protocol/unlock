module.exports = {
  extends: "standard",
  plugins: ["mocha"],
  globals: {
      "it": true,
      "artifacts": true,
      "contract": true,
      "describe": true
  },
  rules: {
    "mocha/no-exclusive-tests": "error"
  }
};