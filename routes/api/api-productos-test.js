import express from "express"
const { Router } = express
import { normalize, schema } from "normalizr"
import MessagesMongoDao from "../../db/dao/MessagesMongoDao.js"
import { requireAuthentication } from "../auth/require-auth.js"
import { faker } from '@faker-js/faker'
faker.locale = 'es'

const routerProductsMessages = new Router()

const mongoContainerMessages = new MessagesMongoDao()

routerProductsMessages.get("/", requireAuthentication, (req, res) => {
    try {
        req.session.name = req.session.passport.user
        const loginName = req.session.name

        async function getMessages() {
            return await mongoContainerMessages.getAll()
        }
        getMessages().then(database => {

            const dataset = { id: "messages", messages: [] }
            for (let item of database) {
                dataset["messages"].push({ author: item.author, text: item.text, identifier: item.identifier })
            }

            //normalize

            const authorSchema = new schema.Entity("author", { text: String }, { idAttribute: "email" })
            const messageSchema = new schema.Entity("post", { author: authorSchema }, { idAttribute: "identifier" })
            const messageList = new schema.Entity("posts", { messages: [messageSchema] }, { idAttribute: "id" })

            const normalizedDataset = normalize(dataset, messageList)
            const compressionRatio = Math.round((JSON.stringify(normalizedDataset).length / JSON.stringify(dataset).length) * 100)
            res.render("body", { loginName, compressionRatio })
        })


    } catch (error) {
        console.log(`Error: ${error}`)
    }

})

routerProductsMessages.post("/", (req, res) => {
    async function postMessages() {
        try {
            const loginName = req.session.name
            const database = await mongoContainerMessages.getAll()
            const dataset = { id: "messages", messages: [] }
            for (let item of database) {
                dataset["messages"].push({ author: item.author, text: item.text, identifier: item.identifier })
            }
            const count = dataset["messages"].length
            
            const data = req.body
            const msg = {
                author: {
                    email: data.email,
                    nombre: data.name,
                    apellido: data.surname,
                    edad: data.age,
                    alias: data.alias,
                    avatar: faker.image.avatar()
                },
                text: data.text,
                identifier: count + 1
            }

            dataset["messages"].push(msg)

            //normalize

            const authorSchema = new schema.Entity("author", { text: String }, { idAttribute: "email" })
            const messageSchema = new schema.Entity("post", { author: authorSchema }, { idAttribute: "identifier" })
            const messageList = new schema.Entity("posts", { messages: [messageSchema] }, { idAttribute: "id" })

            const normalizedDataset = normalize(dataset, messageList)

            const compressionRatio = Math.round((JSON.stringify(normalizedDataset).length / JSON.stringify(dataset).length) * 100)
    
            mongoContainerMessages.insertItems(msg)

            res.render("body", { loginName: loginName, messages: dataset["messages"], compressionRatio: compressionRatio })
        } catch (error) {
            console.log(`Error: ${error}`)
        }
    }

    postMessages()
})

export { routerProductsMessages, mongoContainerMessages }