import { Guild } from "discord.js";
import { MongoClient } from "mongodb";
import Config from "./config";

class DataBase {
    static readonly client = new MongoClient(Config.mongoURL);

    static async init() {
        await DataBase.client.connect();
    }
    static questionsCollection = DataBase.client.db("iAskBot").collection("Questions");
    static detailsManagementCollection = DataBase.client.db("iAskBot").collection("DetailsManagement");
    static memberManagementCollection = DataBase.client.db("iAskBot").collection("MemberManagement");
}

export default DataBase;