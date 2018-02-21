const test = require('tape')
const {compute, StateError} = require('./')

test('is working', t => {
  t.plan(1)

  let state = compute({
    init () {
      return {
        fruits: {},
        nutrientsEaten: {},
        fruitCount: 0
      }
    },

    reducers: {
      buy (state, line) {
        let [name, quantity = 1] = line.args
        let nutrients = line.kwargs

        var fruit = state.fruits[name] || {
          name,
          nutrients,
          quantity: 0
        }

        fruit.quantity += quantity
        state.fruits[name] = fruit
      },

      sell (state, line) {
        let [name, quantity = 1] = line.args

        var fruit = state.fruits[name]
        if (!fruit) {
          throw StateError(`${name} does not exist!`)
        }

        if (fruit.quantity < quantity) {
          throw StateError(`${name} quantity ${fruit.quantity} is less than the amount you're trying to sell!`)
        }

        fruit.quantity -= quantity
        state.fruits[name] = fruit
      },

      eat (state, line) {
        let [name, quantity = 1] = line.args

        var fruit = state.fruits[name]
        if (!fruit) {
          throw StateError(`${name} does not exist!`)
        }

        if (fruit.quantity < quantity) {
          throw StateError(`${name} quantity ${fruit.quantity} is less than the amount you're trying to eat!`)
        }

        fruit.quantity -= quantity
        state.fruits[name] = fruit

        for (let n in fruit.nutrients) {
          var neat = state.nutrientsEaten[n] || 0
          neat += fruit.nutrients[n] * quantity
          state.nutrientsEaten[n] = neat
        }
      }
    },

    end (state) {
      state.fruitCount = Object.keys(state.fruits)
        .map(f => state.fruits[f].quantity)
        .reduce((a, b) => a + b, 0)
    },

    journal: `
2016-01-01
buy: passionfruit, 2, vitamin=12, protein=7
buy: melon, 3, vitamin=5, zinc=8

2016-02-15
sell: passionfruit, 1
eat: passionfruit, 1

2016-03-01
eat: melon, 2
buy: melon
buy: banana, 7, vitamin=4, protein=3

2016-04-15
eat: banana, 5
sell: melon: 1
    `
  })

  t.deepEqual(state, {
    fruits: {
      banana: {
        name: 'banana',
        nutrients: {
          vitamin: 4,
          protein: 3
        },
        quantity: 2
      },
      melon: {
        name: 'melon',
        nutrients: {
          vitamin: 5,
          zinc: 8
        },
        quantity: 1
      },
      passionfruit: {
        name: 'passionfruit',
        nutrients: {
          vitamin: 12,
          protein: 7
        },
        quantity: 0
      }
    },
    nutrientsEaten: {
      vitamin: 12 + (2 * 5) + (5 * 4),
      protein: 7 + (5 * 3),
      zinc: (2 * 8)
    },
    fruitCount: 3
  })
})
