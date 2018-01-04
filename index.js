function run(which) {

    if (which.length === 1) {
        which = `0${which}`
    }

    require(`./src/${which}`)
        .run()
        .catch(console.error)
}

module.exports = { run }
