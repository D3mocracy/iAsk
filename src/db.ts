import { MongoClient } from "mongodb";
import Config from "./config";

class DataBase {
    static client: MongoClient = {} as any;

    static async init() {
        DataBase.client = new MongoClient(Config.mongoURL);

        await DataBase.client.connect();

        DataBase.questionsCollection = DataBase.client.db("iAskBot").collection("Questions");
        DataBase.detailsManagementCollection = DataBase.client.db("iAskBot").collection("DetailsManagement");
        DataBase.memberManagementCollection = DataBase.client.db("iAskBot").collection("MemberManagement");
        DataBase.noteCollection = DataBase.client.db("iAskBot").collection("Notes");
        DataBase.managementMessageCollection = DataBase.client.db("iAskBot").collection("ManagementMessage");
        DataBase.guildsCollection = DataBase.client.db("iAskBot").collection("Guilds");
        DataBase.configCollection = DataBase.client.db("iAskBot").collection("Config");
    }

    static questionsCollection = {} as any;
    static detailsManagementCollection = {} as any;
    static memberManagementCollection = {} as any;
    static noteCollection = {} as any;
    static managementMessageCollection = {} as any;
    static guildsCollection = {} as any;
    static configCollection = {} as any;
}

export default DataBase;