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

// Run lint on staged files
const lintStaged = {
  command: "npx lint-staged",
  path: "unlock-app"
}

// tasks are given a path
module.exports = {
  hooks: {
    "pre-commit": tasks([svg2Components, lintStaged])
  }
}
