const path = require('path')
const utils = require('./utils')

const debug = new require('debug')('aoc')

var checkSums = {}

function checkSum(state) {
    return Object.keys(state)
        .sort()
        .reduce((acc, curr) => {
            acc += `${curr}${state[curr].sort().join('')}`
            return acc
        }, '')
}

function foundSolution(states) {
    for (let state of states) {
        let found = true
        for (let i = 1; i < 4; i++) {
            if (state[i.toString()].length !== 0) {
                found = false
                break
            }
        }
        if (found) { return found }
    }
    return false
}

/*
In other words, if a chip is ever left in the same area as another RTG,
and it's not connected to its own RTG, the chip will be fried.
Therefore, it is assumed that you will follow procedure and keep chips
connected to their corresponding RTG when they're in the same room,
and away from other RTGs otherwise.
 */
function impossibleState(state, changedFloors) {
    for (let floor of changedFloors) {
        let thingsOnFloor = state[floor]
        let rtgs = thingsOnFloor.filter(t => t.indexOf('G') === 1)
        if (rtgs.length === 0) { continue }
        let chips = thingsOnFloor.filter(t => t.indexOf('M') === 1)
        for (let chip of chips) {
            let chipType = chip.slice(0, 1)
            let hasRtg = rtgs.some(rtg => rtg.slice(0, 1) === chipType)
            if (!hasRtg) { return true }
        }
    }
    return false
}

function seenState(state) {
    let sum = checkSum(state)
    let seenBefore = checkSums[sum]
    if (seenBefore) { return true }
    checkSums[sum] = true
    return false
}

function getElevatorFloor(input) {
    for (let floor in input) {
        if (input[floor].indexOf('E') !== -1) {
            return parseInt(floor)
        }
    }
    throw new Error('No elevator found')
}

function getMoves(input, floorOffset, elevatorFloor) {
    let newStates = []

    // make new base state with E moved
    let newBaseState = Object.assign({}, input)
    newBaseState[elevatorFloor] = input[elevatorFloor].slice(0).filter(i => i !== 'E')
    newBaseState[elevatorFloor + floorOffset] = input[elevatorFloor + floorOffset].slice(0)
    newBaseState[elevatorFloor + floorOffset].push('E')

    let thingsOnFloor = newBaseState[elevatorFloor]

    if (thingsOnFloor.length === 0) {
        // just move E
        if (!seenState(newBaseState) && !impossibleState(newBaseState, [elevatorFloor, elevatorFloor + floorOffset])) {
            newStates.push(newBaseState)
        }
    }

    if (thingsOnFloor.length > 0) {
        // move E and 1 other thing
        for (let i = 0; i < thingsOnFloor.length; i++) {
            let newState = Object.assign({}, newBaseState)
            newState[elevatorFloor] = newBaseState[elevatorFloor].slice(0)
            newState[elevatorFloor + floorOffset] = newBaseState[elevatorFloor + floorOffset].slice(0)

            let moveItem = newState[elevatorFloor].splice(i, 1)[0]
            newState[elevatorFloor + floorOffset].push(moveItem)
            if (!seenState(newState) && !impossibleState(newState, [elevatorFloor, elevatorFloor + floorOffset])) {
                newStates.push(newState)
            }
        }
    }

    if (thingsOnFloor.length > 1) {
        // move E and 2 other things
        for (let i = 0; i < thingsOnFloor.length - 1; i++) {
            for (let j = i + 1; j < thingsOnFloor.length; j++) {
                let newState = Object.assign({}, newBaseState)
                newState[elevatorFloor] = newBaseState[elevatorFloor].slice(0)
                newState[elevatorFloor + floorOffset] = newBaseState[elevatorFloor + floorOffset].slice(0)

                let moveItem1 = newState[elevatorFloor].splice(j, 1)[0]
                let moveItem2 = newState[elevatorFloor].splice(i, 1)[0]
                newState[elevatorFloor + floorOffset].push(moveItem1, moveItem2)
                if (!seenState(newState) && !impossibleState(newState, [elevatorFloor, elevatorFloor + floorOffset])) {
                    newStates.push(newState)
                }
            }
        }
    }

    return newStates
}

function possibleMoves(states) {
    let nextStates = []
    for (let input of states) {
        let elevatorFloor = getElevatorFloor(input)
        if (elevatorFloor > 1) {
            // move E and 1 or 2 things down
            nextStates.push(...getMoves(input, -1, elevatorFloor))
        }
        if (elevatorFloor < 4) {
            // move E and 1 or 2 things up
            nextStates.push(...getMoves(input, 1, elevatorFloor))
        }
    }
    return nextStates
}

function numSteps(input) {
    checkSums[checkSum(input)] = true
    let currentStates = [input]
    let numMoves = 0
    while (!foundSolution(currentStates)) {
        currentStates = possibleMoves(currentStates)
        numMoves++
        debug(`After ${numMoves} we have ${currentStates.length} states`)
    }
    // debug(JSON.stringify(currentStates, null, 2))
    return numMoves
}

function numSteps2(input) {
    let inputChars = input.split('')
    let sum = 0
    for (let i = 0; i < inputChars.length; i++) {
        let j = (i + inputChars.length / 2) % inputChars.length
        if (inputChars[i] === inputChars[j]) {
            sum += parseInt(inputChars[i])
        }
    }
    return sum
}

/*
The first floor contains a strontium generator, a strontium-compatible microchip, a plutonium generator, and a plutonium-compatible microchip.
The second floor contains a thulium generator, a ruthenium generator, a ruthenium-compatible microchip, a curium generator, and a curium-compatible microchip.
The third floor contains a thulium-compatible microchip.
The fourth floor contains nothing relevant.

Upon entering the isolated containment area, however, you notice some extra parts on the first floor that weren't listed on the record outside:

An elerium generator.
An elerium-compatible microchip.
A dilithium generator.
A dilithium-compatible microchip.
*/

function parseInput(inputStr) {
    let input = {}
    inputStr.split(/[\r\n]/).forEach(sentence => {
        let floor
        switch (sentence.split(' ')[1]) {
            case 'first':
                floor = 1
                break
            case 'second':
                floor = 2
                break
            case 'third':
                floor = 3
                break
            case 'fourth':
                floor = 4
                break
            default:
                throw new Error(`Can't parse floor`)
        }

        input[floor] = []
        if (floor === 1) {
            input[floor].push('E')
        }
        let rtgs = sentence.match(/(\w+) generator/g)
        if (rtgs) {
            input[floor].push(...rtgs.map(rtg => rtg.slice(0, 1).toUpperCase() + 'G'))
        }

        let chips = sentence.match(/(\w+) microchip/g)
        if (chips) {
            input[floor].push(...chips.map(chip => chip.slice(0, 1).toUpperCase() + 'M'))
        }
    })

    return input
}

async function run() {
    var input = await utils.getInput(path.basename(__filename, '.js'))
    input = parseInput(input)
    debug('parsed input', input)

    let clonedInput = JSON.parse(JSON.stringify(input))
    clonedInput[1].push('EG', 'EM', 'DG', 'DM')

    console.log('solution to part 1 is', numSteps(input))
    console.log('solution to part 2 is', numSteps(clonedInput))
}

module.exports = {
    run,
    foundSolution,
    getElevatorFloor,
    numSteps,
    numSteps2
}
