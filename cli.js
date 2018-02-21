#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const argv = require('yargs').argv

const {compute} = require('./main')
const {init, reducers, end} = require(path.join(process.cwd(), argv.r))

let journal = fs.readFileSync(argv.input || argv.i || argv._[0], 'utf-8')

let state = compute({
  journal,
  init,
  reducers,
  end
})

let out = JSON.stringify(state)
if (argv.output || argv.o) {
  fs.writeFileSync(argv.output || argv.o, out, {encoding: 'utf-8'})
} else {
  process.stdout.write(out)
}
