/**
 * https://www.smooth-code.com/open-source/svgr/docs/cli/#use-a-specific-template
 * Template must return a Babel AST, the template function take three arguments:
 * @param {*} api: API methods provided by Babel
 * @param {*} opts: SVGR options
 * @param {*} values: Pre-computed values to use (or not) in your templates
 */
function svgTemplate(
  { template },
  opts,
  { imports, componentName, props, jsx, exports }
) {
  return template.ast`
    ${imports}
    import PropTypes from 'prop-types'
    const ${componentName} = ${props} => ${jsx}

    ${componentName}.propTypes = {
      title: PropTypes.string
    }

    ${componentName}.defaultProps = {
      title: ''
    }

    ${exports}
  `
}

module.exports = svgTemplate
