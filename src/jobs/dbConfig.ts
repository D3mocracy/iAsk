import DataBase from "../db";

export let configFromDB: any = {};

export function init() {
    setInterval(async () => {
        configFromDB = Object.fromEntries((await DataBase.configCollection.find({}).toArray()).map((c: any) => [c.key, c.value])) || {};
    }, 1000 * 60);
}