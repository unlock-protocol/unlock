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
  return { command: "lint-staged", path: path }
}

// Run eslint on the files inside path for the last commit
// It will try to amend the latest commit if possible to fix.
const eslint = path => {
  return {
    command: `git diff --name-only --diff-filter=d $(git merge-base origin/master HEAD) | grep js$ | sed 's/${path}\\///' | xargs eslint --fix`,
    path: path
  }
}

// tasks are given a path
module.exports = {
  hooks: {
    "pre-push": tasks([
      eslint("unlock-app"),
      eslint("locksmith"),
      eslint("paywall")
    ]),
    "pre-commit": tasks([
      svg2Components,
      lintStaged("unlock-app"),
      lintStaged("locksmith"),
      lintStaged("paywall")
    ])
  }
}
