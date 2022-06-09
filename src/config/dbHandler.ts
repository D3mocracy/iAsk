import { DataSource } from "shtrudel";
import { configFromDB } from "../jobs/dbConfig";

const DBHandler: DataSource = (key: string) => {
    return configFromDB && configFromDB[key];
}
export default DBHandler;