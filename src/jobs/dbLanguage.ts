import DataBase from "../db";

export let languageFromDB: any = {};

export async function languageInit() {
    await reloadLanguage();
    setInterval(reloadLanguage, 1000 * 60);
}

async function reloadLanguage() {
    languageFromDB = Object.fromEntries((await DataBase.languageCollection.find({}).toArray()).map(doc => [doc.key, Object.fromEntries(Object.entries(doc).filter(u => u[0] !== "key" && u[0] !== "_id"))]));

}