import ContainerMongo from "../ContainerMongo.js"
import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config({
    path: "./keys.env"
})

class AuthMongoDao extends ContainerMongo {
    constructor() {
        super(process.env.MONGO_DB)
        this.model = this.createModel()
    }

    createModel() {
        let schemaStructure = {
            email: { type: String, required: true },
            hash: { type: String, required: true }
        }
        let schema = new mongoose.Schema(schemaStructure)
        return mongoose.model("users", schema)
    }
}

export default AuthMongoDao