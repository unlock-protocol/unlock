var fs = require('fs')
var svgConverter = require('svgexport')

/**
 * Pull in the conversion map
 */
var convertMap = require('./output.js')

/**
 * Set up the svgexport options object
 */
var options = []

/**
 * Update the convertMap to the format requested by svgexport
 */
convertMap.forEach(function (inputEl, i) {
  inputEl.output.forEach(function (outputEl, i) {
    var item = {
      "input": [],
      "output": [],
    }

    // Add the input file
    item.input.push(__dirname + '/src/' + inputEl.input)

    // Build the output options
    item.output.push(
      [ __dirname + '/build/' + outputEl.name, outputEl.quality || '', outputEl.size || '', 'pad', outputEl.css || '' ].join(' ')
    )

    // Add to the output options
    options.push(item)
  })
})

/**
 * Run each build option separately (to work
 * around a caching issue)
 */
options.forEach(function (el, i) {
  svgConverter.render(el);
})
