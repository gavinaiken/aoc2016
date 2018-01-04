const {promisify} = require('util')
const fs = require('fs')
const path = require('path')
const readdirAsync = promisify(fs.readdir)
const mkdirAsync = promisify(fs.mkdir)
const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)
const tough = require('tough-cookie')
const request = require('request-promise')

const debug = new require('debug')('aoc')

const cookieFile = 'session.cookie'
const inputCacheDirName = 'inputcache'
const parentDir = path.join(__dirname, '..')
const inputCacheDir = path.join(parentDir, inputCacheDirName)

function inputCacheFile(day) {
    return path.join(inputCacheDir, day)
}

async function mkCacheDir() {
    let parentDirContents = await readdirAsync(parentDir)
    if (!parentDirContents.includes(inputCacheDirName)) {
        await mkdirAsync(inputCacheDir)
    }
    if (!parentDirContents.includes(cookieFile)) {
        console.error(`Please set up the cookie file "${cookieFile}" before running any solutions`)
        process.exit(1)
    }
}

async function getInput(day, year = 2016) {
    await mkCacheDir()

    try {
        let input = await readFileAsync(inputCacheFile(day), 'utf8')
        debug('returning cached input')
        debug('input is:\n', input)
        return input
    } catch (e) {
        // do nothing
    }

    let sessionCookie = await readFileAsync(cookieFile)

    let cookie = new tough.Cookie({
        key: 'session',
        value: sessionCookie.toString().replace(/\s/g, ''),
        domain: 'adventofcode.com',
        httpOnly: true,
        maxAge: 31536000
    })

    let cookiejar = request.jar()
    cookiejar.setCookie(cookie, 'http://adventofcode.com')

    let options = {
        uri: `http://adventofcode.com/${year}/day/${day.replace(/^0/, '')}/input`,
        jar: cookiejar
    }

    let input = await request(options)
    debug(`returning input fetched from ${options.uri}`)
    input = input.replace(/\s$/g, '')
    await writeFileAsync(inputCacheFile(day), input)
    debug('input is:\n', input)
    return input
}

module.exports = { getInput }
