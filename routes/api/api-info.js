import express from "express"
const { Router } = express
import { requireAuthentication } from "../auth/require-auth.js"
import {MODE} from "../../args.js"
import os from "os"

const routerInfo = new Router()

routerInfo.get("/", requireAuthentication, (req, res) => {

    const args = process.argv.slice(2).join(" ")
    const platform = process.platform
    const version = process.version
    const memory = process.memoryUsage()
    const path = process.execPath
    const id = process.pid
    const projectFolder = process.cwd()
    const numProcessors = MODE == "FORK" ? 1 : os.cpus().length

    res.render("info", { layout: "info", args, platform, version, memory, path, id, projectFolder, numProcessors })
})

export { routerInfo }