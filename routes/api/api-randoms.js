import express from "express"
const { Router } = express
import { requireAuthentication } from "../auth/require-auth.js"
import {fork} from "child_process"
import path from "path"

const routerRandom = new Router()

routerRandom.get("/:cant?", requireAuthentication, (req, res) => {

    const cant = req.params["cant"] || 100000000
    
    const secondaryProcess = fork(path.resolve(process.cwd(), "routes/api/randomCalculation.js"))
    secondaryProcess.send(cant)
    secondaryProcess.on("message", result =>{
        if (result == "Listo"){
            secondaryProcess.send("Finalizado")
        } else {
            res.json(result)
        }
    })

})

export { routerRandom }