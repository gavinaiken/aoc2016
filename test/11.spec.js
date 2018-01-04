const path = require('path')
const expect = require('chai').expect

const testfilename = path.basename(__filename, '.spec.js')
const solution = require(path.join('..', 'src', testfilename))

/*
F4 .  .  .  .  .
F3 .  .  .  LG .
F2 .  HG .  .  .
F1 E  .  HM .  LM
*/

describe(`Day ${testfilename}`, () => {
    describe('rtg 1', () => {
        it('foundSolution is false for initial state', () => {
            expect(solution.foundSolution([{1: ['E', 'HM', 'LM'], 2: ['HG'],  3: ['LG'],  4: []}])).to.be.false
        })
        it('foundSolution is true for final state', () => {
            expect(solution.foundSolution([{1: [], 2: [],  3: [],  4: ['E', 'HM', 'LM', 'LG', 'HG']}])).to.be.true
        })
        it('getElevatorFloor is 1 for initial state', () => {
            expect(solution.getElevatorFloor({1: ['E', 'HM', 'LM'], 2: ['HG'],  3: ['LG'],  4: []})).to.be.equal(1)
        })
        it('matches the first example', () => {
            expect(solution.numSteps({1: ['E', 'HM', 'LM'], 2: ['HG'],  3: ['LG'],  4: []})).to.be.equal(11)
        })
    })
})
