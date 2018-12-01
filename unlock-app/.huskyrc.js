const tasks = t => t.join(' && ')

// If svg files are changed, generate the SVG Components
const svg2Components =
  'if [[ $(git diff --cached --name-only | grep -c "static/images/svg/.*.svg$") > 0 ]] ; then npm run svg-2-components && git add src/components/interface/svg/*.js; fi'

module.exports = {
  hooks: {
    'pre-commit': tasks([svg2Components, 'lint-staged']),
  },
}
