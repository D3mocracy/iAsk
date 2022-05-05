import { config } from "shtrudel";
import DotenvDataSrouce from "./envHandler";

const configurable = config([DotenvDataSrouce]);

class Config {
    @configurable()
    static readonly iHaveAQuestionMessage: string = "i have a question";

    @configurable()
    static readonly chooseTitleMessage: string = "Please write a title";

}

export default Config;