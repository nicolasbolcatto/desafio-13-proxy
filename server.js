//Imports
import express from "express"
import session from 'express-session'
import MongoStore from "connect-mongo"
import { engine } from "express-handlebars"
import { Server as HttpServer } from "http"
import { Server as IOServer } from "socket.io"
import { mongoContainerMessages } from "./routes/api/api-productos-test.js"
import AuthMongoDao from "./db/dao/AuthMongoDao.js"
import { faker } from '@faker-js/faker'
import cookieParser from "cookie-parser"
faker.locale = 'es'
import passport from "passport"
import { Strategy as LocalStrategy } from "passport-local"
import bcrypt from "bcrypt"
import { routerLogin, routerFailLogin } from "./routes/auth/login.js"
import { routerFailRegister, routerRegister } from "./routes/auth/register.js"
import { routerProductsMessages } from "./routes/api/api-productos-test.js"
import { routerInfo } from "./routes/api/api-info.js"
import { routerRandom } from "./routes/api/api-randoms.js"
import {PORT,MODE} from "./args.js"
import dotenv from "dotenv"
import cluster from "cluster"
import os from "os"

//Get enviroment variables
dotenv.config({
    path: "./keys.env"
})

//Start express app
const app = express()

//Start io websocket
const httpServer = HttpServer(app)
const io = new IOServer(httpServer)

//Indicate static files in public folder
app.use(express.static("./public"))

//Configure app
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

//Create session
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true }
app.use(session({
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_SESSION,
        mongoOptions: advancedOptions,
        ttl: 60,
        autoRemove: "native"
    }),
    secret: process.env.SESSION_PASSWORD,
    resave: false,
    saveUninitialized: false
}))

//Create template engine
app.engine("handlebars", engine())

app.set("views", "./public/views")
app.set("view engine", "handlebars")

//Create users database DAO
const mongoContainerUsers = new AuthMongoDao()

//-------------------------------------------------------------------------
//AUTH STRATEGIES
app.use(passport.initialize())
app.use(passport.session())

async function getData() {
    return await mongoContainerUsers.getAll()
}

passport.use("register", new LocalStrategy({
    passReqToCallback: true,
    usernameField: 'emailId',
    passwordField: 'password'
}, (req, email, password, done) => {
    getData().then((users) => {
        const currentUser = users.find(user => user.email == email)

        if (currentUser) {
            return done(null, false)
        }

        //Encrypt password
        const saltRounds = 10;

        bcrypt.hash(password, saltRounds, function(err, hash) {
            const newUser = {
                email,
                hash
            }
            mongoContainerUsers.insertItems(newUser)
            done(null, newUser)
        });
    })



}))

passport.use("login", new LocalStrategy({
    usernameField: 'emailId',
    passwordField: 'password'
}, (email, password, done) => {
    getData().then((users) => {

        const currentUser = users.find(user => user.email == email)
        if (!currentUser) {
            return done(null, false)
        }

        bcrypt.compare(password, currentUser.hash, function(err, result) {
            if (result) {
                return done(null, currentUser)
            } else {
                return done(null, false)
            }
        });

    })
}))


passport.serializeUser((err, user, done) => {
    //console.log(err)
    done(null, user.email)
})

passport.deserializeUser((err, email, done) => {
    //console.log(err)
    getData().then((users) => {
        const currentUser = users.find(user => user.email == email)
        done(null, currentUser)
    })
})

//-------------------------------------------------------------------------
//ROUTES

app.get("/", (req, res) => {
    res.redirect("/login")
})

app.use("/login", routerLogin)

app.use("/fail-login", routerFailLogin)

app.use("/register", routerRegister)

app.use("/fail-register", routerFailRegister)

app.get("/bye", (req, res) => {
    try {
        setTimeout(() => {
            res.redirect("/login")
        }, 2000)
    } catch (error) {

    }
})

app.use("/api/productos-test", routerProductsMessages)

app.use("/api/info", routerInfo)

app.use("/api/randoms", routerRandom)

//-------------------------------------------------------------------------

//Start websocket connection for messages and items

const messages = await mongoContainerMessages.getAll()

const items = []
for (let i = 0; i < 5; i++) {
    items.push({
        nombre: faker.commerce.product(),
        precio: faker.commerce.price(100, 200, 0, '$'),
        foto: faker.image.image()
    })
}

io.on("connection", socket => {
    console.log("New client connected")

    socket.emit("items", items)
    socket.emit("messages", messages)

    socket.on("new-item", data => {
        items.push(data)
        io.sockets.emit("items", items)
    })

    socket.on("new-message", data => {
        data.author.avatar = faker.image.avatar()
        messages.push(data)
        io.sockets.emit("messages", messages)
    })
})

//-------------------------------------------------------------------------

//Select mode FORK or CLUSTER

if (MODE == "FORK" || undefined) {
    //Start listening to server in FORK mode
    httpServer.listen(PORT, () => {
        console.log(`Server listening in port ${PORT} in mode ${MODE}`)
    })

    //Indicate error if server fails
    httpServer.on("error", error => console.log(`Error on server: ${error}`))

    } else if (MODE == "CLUSTER") {
    
        const numCPUs = os.cpus().length
        if (cluster.isPrimary){
        
            for (let i = 0 ; i < numCPUs; i++){
                cluster.fork()
            }
        
            cluster.on("exit", worker => {
                console.log(`Worker ${worker.process.pid} died: ${new Date().toLocaleString()}`)
                cluster.fork
                })
        } else {
            
            //Start listening to server in CLUSTER mode
            httpServer.listen(PORT, () => {
                console.log(`Server listening in port ${PORT} in mode ${MODE}`)
            })

            //Indicate error if server fails
            httpServer.on("error", error => console.log(`Error on server: ${error}`))
        }
    }

