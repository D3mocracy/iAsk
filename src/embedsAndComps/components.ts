import { Client, Guild, GuildMember, MessageActionRow, MessageButton, MessageSelectMenu, MessageSelectOptionData, User } from "discord.js";
import Config from "../config";
import OpenQuestionHandler from "../handlers/openQuestion";
import Utils from "../utils";

namespace Components {

    export function chooseGuildMenu(bot: Client, user: User) {
        const chooseGuildMenu = new MessageSelectMenu().setCustomId('choose-guild').setPlaceholder(Config.chooseGuildEmbedMessagePlaceHolder);

        Utils.commonGuilds(bot, user).forEach(g => {
            chooseGuildMenu.addOptions([{
                label: g.name,
                description: g.description || g.name,
                value: g.id,
                emoji: Config.chooseGuildEmbedMessageEmoji
            }]);
        });
        return new MessageActionRow().addComponents(chooseGuildMenu);
    }

    const optionList: (MessageSelectOptionData & { rank: string })[] = [
        { rank: "Manager", label: "Delete", description: "Delete the question", value: "question-del" }
    ];
    export function manageQuestionMenu() {
        const manageQuestionMenu = new MessageSelectMenu().setCustomId('channel-mng').setPlaceholder('Choose an option');
        manageQuestionMenu.addOptions(optionList.filter(o => o.rank === "Manager"));
        return new MessageActionRow().addComponents(manageQuestionMenu);
    }

    export function chooseToBeAnonymousButtons() {
        const yesButton = new MessageButton().setCustomId("anon-yes").setLabel(Config.yesAnonButton).setStyle("SUCCESS");
        const noButton = new MessageButton().setCustomId("anon-no").setLabel(Config.noAnonButton).setStyle("DANGER");
        return new MessageActionRow().addComponents(yesButton, noButton);
    }

    export function chooseSureMessage() {
        const yesButton = new MessageButton().setCustomId("sure-yes").setLabel(Config.yesSureButton).setStyle("SUCCESS");
        const noButton = new MessageButton().setCustomId("sure-no").setLabel(Config.noSureButton).setStyle("DANGER");
        return new MessageActionRow().addComponents(yesButton, noButton);
    }
}

export default Components;