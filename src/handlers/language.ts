import { languageFromDB } from "../jobs/dbLanguage";

namespace LanguageHandler {

    export function messageLanaguageChecker(config: any, message: string) {
        message = message.toLowerCase();
        return Object.entries(config).find(arr => (arr[1] as string).toLowerCase() === message)?.[0];
    }

    export function getMessageByLang(key: string, lang: string) {
        return languageFromDB[key][lang]
    }
}

export default LanguageHandler;