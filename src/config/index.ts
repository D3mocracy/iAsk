import { ColorResolvable, Message, MessageEmbed, Util } from "discord.js";
import { config } from "shtrudel";
import DotenvDataSrouce from "./envHandler";

const configurable = config([DotenvDataSrouce]);

class Config {
    @configurable()
    static readonly TOKEN: string;

    @configurable()
    static readonly mongoURL: string = "mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";

    @configurable()
    static readonly iHaveAQuestionMessage: string = "i have a question";

    @configurable()
    static readonly maxQuestionsPerGuild: number = 2;

    @configurable()
    static readonly reachLimitQuestionsError: string = "You have reached the limit.";

    @configurable()
    static readonly error404: string = "Error 404: Could not find common guilds between us!";

    @configurable()
    static readonly pleaseChooseGuildBeforeContinue: string = "Please choose a guild from the options before we continue.";

    @configurable()
    static readonly chooseGuildEmbedMessagePlaceHolder: string = "Choose a guild";

    @configurable()
    static readonly chooseGuildEmbedMessageEmoji: string = "🔳";

    @configurable()
    static readonly chooseGuildEmbedMessageTitle: string = "Please choose the guild from the one of the options below";

    @configurable()
    static readonly chooseGuildEmbedMessageColor: ColorResolvable = "DARK_VIVID_PINK";

    @configurable()
    static readonly chooseTitleMessage: string = "Please write a title";

    @configurable()
    static readonly chooseDescriptionMessage: string = "Please write a description";

    @configurable()
    static readonly chooseAnonymousMessage: string = "Would you like to be anonymous?";

    @configurable()
    static readonly askSureMessage: string = "Would you like to send this question?";

    @configurable()
    static readonly sureMessageEmbedColor: ColorResolvable = "GOLD";

    @configurable()
    static readonly sureMessageEmbed: MessageEmbed = new MessageEmbed({
        color: Util.resolveColor(Config.sureMessageEmbedColor)
    })

    @configurable()
    static readonly yesAnonButton: string = "Yes";

    @configurable()
    static readonly noAnonButton: string = "No";

    @configurable()
    static readonly yesSureButton: string = "Yes";

    @configurable()
    static readonly noSureButton: string = "No";

    @configurable()
    static readonly succsesMsg: string = "Great! I have sent the question, let's wait for answers.";

    @configurable()
    static readonly managePrefix: string = "!manage";

    @configurable()
    static readonly manageQuestion: string = "question";

    @configurable()
    static readonly manageMember: string = "member";
}

export default Config;