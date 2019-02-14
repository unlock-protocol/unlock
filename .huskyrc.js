const tasks = tasks => {
  return tasks
    .map(task => {
      return `cd ${__dirname}/${task.path} && ${task.command}`
    })
    .join(`&& cd ${__dirname} && `)
}

// If svg files are changed, generate the SVG Components
const svg2Components = {
  command:
    'if [[ $(git diff --cached --name-only | grep -c "unlock-app/src/static/images/svg/.*.svg$") > 0 ]] ; then npm run svg-2-components && git add src/components/interface/svg/*.js; fi',
  path: "unlock-app"
}

// lintStaged actually just runs formatting rules on staged files
const lintStaged = path => {
  return {command: 'lint-staged', path: path} 
}

// Run eslint on everything (used pre-push)
const eslint = path => {
  return { command: 'eslint --fix .', path: path }
}

// tasks are given a path
module.exports = {
  hooks: {
    "pre-push": tasks([eslint('unlock-app'),
                       eslint('locksmith'),
                       eslint('paywall')]),
    "pre-commit": tasks([svg2Components, 
                         lintStaged('unlock-app'),
                         lintStaged('locksmith'),
                         lintStaged('paywall')])
  }
}
