import { Collection, MongoClient } from "mongodb";
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
        DataBase.languageCollection = DataBase.client.db("iAskBot").collection("Language");
    }

    static questionsCollection: Collection = {} as any;
    static detailsManagementCollection: Collection = {} as any;
    static memberManagementCollection: Collection = {} as any;
    static noteCollection: Collection = {} as any;
    static managementMessageCollection: Collection = {} as any;
    static guildsCollection: Collection = {} as any;
    static configCollection: Collection = {} as any;
    static languageCollection: Collection = {} as any;
}

export default DataBase;