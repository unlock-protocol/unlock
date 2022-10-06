/**
 * https://www.smooth-code.com/open-source/svgr/docs/cli/#use-a-specific-template
 * Template must return a Babel AST, the template function take three arguments:
 * @param {*} api: API methods provided by Babel
 * @param {*} opts: SVGR options
 * @param {*} values: Pre-computed values to use (or not) in your templates
 */

function svgTemplate(
  { imports, interfaces, componentName, props, jsx, exports },
  { tpl }
) {
  return tpl`
    ${imports}
    ${interfaces}

    const ${componentName} = ${props} => ${jsx}

    export type { SVGRProps }
    ${exports}
  `
}

module.exports = svgTemplate
