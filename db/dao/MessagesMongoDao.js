import ContainerMongo from "../ContainerMongo.js"
import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config({
    path: "./keys.env"
})

class MessagesMongoDao extends ContainerMongo {
    constructor() {
        super(process.env.MONGO_DB)
        this.model = this.createModel()
    }

    createModel() {
        let schemaStructure = {
            author: {
                email: { type: String, required: true },
                nombre: { type: String, required: true },
                apellido: { type: String, required: true },
                edad: { type: Number, required: true },
                alias: { type: String, required: true },
                avatar: { type: String, required: true }
            },
            text: { type: String, required: true },
            identifier: { type: Number, required: true }
        }
        let schema = new mongoose.Schema(schemaStructure)
        return mongoose.model("messageList", schema)
    }
}



export default MessagesMongoDao