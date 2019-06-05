/* eslint no-console: 0 */

module.exports = function(requiredConfigVariables) {
  Object.keys(requiredConfigVariables).forEach(configVariableName => {
    if (!requiredConfigVariables[configVariableName]) {
      if (['dev', 'test'].indexOf(requiredConfigVariables.unlockEnv) > -1) {
        return console.error(
          `The configuration variable ${configVariableName} is falsy.`
        )
      }
      throw new Error(
        `The configuration variable ${configVariableName} is falsy.`
      )
    }
  })
  return requiredConfigVariables
}
