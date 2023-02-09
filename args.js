import parseArgs from "yargs/yargs"

const yargs = parseArgs(process.argv.slice(2))

const {PORT, MODE, _ } = yargs
    .alias({
        p: "PORT",
        m: "MODE"
    })
    .default({
        PORT: 8080,
        MODE: "FORK"
    }).argv


export {PORT, MODE}