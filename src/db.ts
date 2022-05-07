import { Guild } from "discord.js";
import { MongoClient } from "mongodb";
import Config from "./config";

class DataBase {
    static readonly client = new MongoClient(Config.mongoURL);

    static async init() {
        await DataBase.client.connect();
    }
    get questionsCollection() {
        return DataBase.client.db("iAskBot").collection("Questions");
    }
}

export default DataBase;