import { DataSource } from "shtrudel";
import { languageFromDB } from "../jobs/dbLanguage";

const LanguageDBHandler: DataSource = (key: string) => {
    return languageFromDB && languageFromDB[key];
}
export default LanguageDBHandler;