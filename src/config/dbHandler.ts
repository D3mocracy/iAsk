import { DataSource } from "shtrudel";
import { configFromDB } from "../jobs/dbConfig";

const DBHandler: DataSource = (key: string) => {
    console.log("config: ", configFromDB);

    return configFromDB && configFromDB[key];
}
export default DBHandler;