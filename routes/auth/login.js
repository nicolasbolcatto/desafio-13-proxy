import express from "express"
const { Router } = express
import passport from "passport"

const routerLogin = new Router()
const routerFailLogin = new Router()

routerLogin.get("/", (req, res) => {
    try {
        res.render("login", { layout: "login" })
    } catch (error) {
        console.log(`Error: ${error}`)
    }
})

routerLogin.post("/", passport.authenticate("login", { failureRedirect: "/fail-login", successRedirect: "/api/productos-test" }))

routerFailLogin.get("/", (req, res) => {
    try {
        res.render("login-error", { layout: "login-error" })
    } catch (error) {
        console.log(`Error: ${error}`)
    }
})

export { routerLogin, routerFailLogin }