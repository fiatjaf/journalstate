#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const argv = require('yargs').argv

const {StateError} = require('./')
const {parse} = require('./parser')
const {init, reducers, end} = require(path.join(process.cwd(), argv.r))

let inputFile = argv.input || argv.i || argv._[0]

var state = init ? init() : {}

var prevLine = {date: new Date(0)}
for (let line of parse(fs.readFileSync(inputFile, 'utf-8'))) {
  if (line.kind) {
    try {
      if (line.date < prevLine.date) {
        throw StateError(`Line on date ${line.date} appears after ${prevLine.date}.`)
      }

      reducers[line.kind](state, line)
    } catch (e) {
      if (e.stateError) {
        console.error('')
        console.error('ERROR: ' + e.message)
        console.error(`on line ${line.n}: '${line.raw}'`)
        console.error('')
        console.error(
          e.stack.split('\n')
            .filter(s => s.indexOf(process.cwd()) !== -1)
            .join('\n')
        )
        process.exitCode = 1
        process.exit()
        break
      } else {
        console.error(`line ${line.n}: '${line.raw}'`)
        throw e
      }
    }
  }
}

end ? end(state) : null

let out = JSON.stringify(state)
if (argv.output || argv.o) {
  fs.writeFileSync(argv.output || argv.o, out, {encoding: 'utf-8'})
} else {
  process.stdout.write(out)
}
