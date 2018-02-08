const fecha = require('fecha')

module.exports.parse = parse
module.exports.parseLine = parseLine

function * parse (body) {
  let lines = body.split('\n')

  var lastDate = new Date(0)
  for (let i = 0; i < lines.length; i++) {
    let line = parseLine(lines[i])
    if (!line) continue

    if (line.date) {
      lastDate = line.date
    } else {
      line.date = lastDate
      line.raw = lines[i]
      line.n = i + 1
      yield line
    }
  }
}

function parseLine (line) {
  if (line.trim() === '') return null

  if (line.trim()[0] === ';') {
    return {
      comment: line.trim().slice(1)
    }
  }

  let [kind, data] = line.split(':')
  if (!data) {
    return {
      date: parseDate(line.trim()).toISOString().split('T')[0]
    }
  }

  let {args, kwargs} = parseData(data)

  return {
    kind: kind.trim().toLowerCase(),
    args,
    kwargs
  }
}

function parseDate (d) {
  try {
    return fecha.parse(d, 'YYYY-MM-DD')
  } catch (e) {
    try {
      return fecha.parse(d, 'YYYY/MM/DD')
    } catch (e) {
      return fecha.parse(d, 'D MMM YYYY')
    }
  }
}

function parseData (d) {
  var args = []
  var kwargs = {}

  d.split(',')
    .map(p => p.trim())
    .filter(p => p)
    .forEach(p => {
      let [k, v] = p.split('=')
      if (!v || v.trim() === '') {
        args.push(convert(k.trim()))
        return
      }

      kwargs[k.trim()] = convert(v.trim())
    })

  return {args, kwargs}
}

function convert (v) {
  let n = parseFloat(v)
  if (!isNaN(v)) {
    return n
  }

  if (v === 'true') return true
  if (v === 'false') return false

  return v
}