const {parse} = require('./parser')

module.exports.compute = compute
module.exports.StateError = StateError

function compute ({
  init = () => ({}),
  reducers = () => {},
  end = () => {},
  journal = '',
  include = path => {
    throw new Error(`cannot include ${path}. no include() function defined.`)
  }
}) {
  var state = init()

  var prevLine = {date: new Date(0)}
  for (let line of parse(journal, include)) {
    if (line.kind) {
      try {
        if (line.date < prevLine.date) {
          throw StateError(`Line on date ${line.date} appears after ${prevLine.date}.`)
        }

        if (typeof reducers[line.kind] !== 'function') {
          throw new StateError(`Directive '${line.kind}' doesn't exists.`)
        }

        reducers[line.kind](state, line)
      } catch (e) {
        if (e.stateError) {
          var errorMessage = `
ERROR: ${e.message}
on line ${line.n}: '${line.raw}'
`
          if (process.exit) {
            console.error(errorMessage)
            console.error(
              e.stack.split('\n')
                .filter(s => s.indexOf(process.cwd()) !== -1)
                .join('\n')
            )
            process.exitCode = 1
            process.exit()
          } else {
            let err = new Error(errorMessage)
            err.stack = e.stack
          }
          break
        } else {
          console.error(`line ${line.n}: '${line.raw}'`)
          throw e
        }
      }
    }

    prevLine = line
  }

  end(state)
  return state
}

function StateError (message) {
  let e = new Error(message)
  e.stateError = true
  return e
}
