import DataBase from "../db";

export let configFromDB: any = {};

export function init() {
    setInterval(async () => {
        configFromDB = Object.entries((await DataBase.configCollection.find({}).toArray()).map(c => [c.key, c.value])) || {};
    }, 1000 * 60);
}