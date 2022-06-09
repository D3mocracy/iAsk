import { ColorResolvable, MessageEmbed, Util } from "discord.js";
import { config } from "shtrudel";
import DBHandler from "./dbHandler";
import DotenvDataSrouce from "./envHandler";
import LanguageDBHandler from "./languageDBHandler";

const configurable = config([DotenvDataSrouce, DBHandler, LanguageDBHandler]);

class Config {
    @configurable()
    static readonly TOKEN: string;

    @configurable()
    static readonly mongoURL: string = "mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";

    @configurable()
    static readonly iHaveAQuestionMessage: any;

    @configurable()
    static readonly reachLimitQuestionsError: string = "You have reached the limit.";

    @configurable()
    static readonly error404: string = "Error 404: Could not find common guilds between us!";
    @configurable()
    static readonly pleaseChooseGuildBeforeContinue: string = "Please choose a guild from the options before we continue.";
    @configurable()
    static readonly chooseGuildEmbedMessagePlaceHolder: any;
    @configurable()
    static readonly chooseGuildEmbedMessageEmoji: string = "🔳";
    @configurable()
    static readonly chooseGuildEmbedMessageTitleOpenQuestion: any;
    @configurable()
    static readonly sureNoTitle: any;
    @configurable()
    static readonly sureNoDescription: any;
    @configurable()
    static readonly sureNoFooter: any;
    @configurable()
    static readonly chooseTitleMessage: any;
    @configurable()
    static readonly editTitleButton: any;
    @configurable()
    static readonly editDescriptionButton: any;
    @configurable()
    static readonly cancelQuestionButton: any;
    @configurable()
    static readonly yourChoiceIs: any;
    @configurable()
    static readonly chooseDescriptionMessage: any;
    @configurable()
    static readonly Anonymous: any;
    @configurable()
    static readonly chooseAnonymousMessage: any;
    @configurable()
    static readonly askSureMessage: any;
    @configurable()
    static readonly jumpToQuestion: any;
    @configurable()
    static readonly channelIDString: any;
    @configurable()
    static readonly creatorTag: any;

    @configurable()
    static readonly sureMessageEmbedColor: ColorResolvable = "GOLD";

    @configurable()
    static readonly sureMessageEmbed: MessageEmbed = new MessageEmbed({
        color: Util.resolveColor(Config.sureMessageEmbedColor)
    })

    @configurable()
    static readonly yesButton: any;

    @configurable()
    static readonly noButton: any;

    @configurable()
    static readonly succsesMsg: any;

    @configurable()
    static readonly managePrefix: string = "!manage";

    @configurable()
    static readonly manageChannel: string = "channel";

    @configurable()
    static readonly manageMember: string = "member";

    @configurable()
    static readonly channelIDFooter: string = "Channel ID:";

    @configurable()
    static readonly memberIDFooter: string = "Member ID:";

    @configurable()
    static readonly cantFindMessageError: string = "Error: can't find this channel.";

    @configurable()
    static readonly cantDeleteMessageError: string = "Error: can't delete this channel.";
}

export default Config;