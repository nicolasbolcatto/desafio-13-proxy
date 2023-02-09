import express from "express"
const { Router } = express
import passport from "passport"

const routerRegister = new Router()
const routerFailRegister = new Router()

routerRegister.get("/", (req, res) => {
    try {
        res.render("register", { layout: "register" })
    } catch (error) {
        console.log(`Error: ${error}`)
    }
})

routerRegister.post("/", passport.authenticate("register", { failureRedirect: "/fail-register", successRedirect: "/" }))

routerFailRegister.get("/", (req, res) => {
    try {
        res.render("register-error", { layout: "register-error" })
    } catch (error) {
        console.log(`Error: ${error}`)
    }
})

export { routerRegister, routerFailRegister }