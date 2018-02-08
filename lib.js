module.exports.StateError = StateError

function StateError (message) {
  let e = new Error(message)
  e.stateError = true
  return e
}
