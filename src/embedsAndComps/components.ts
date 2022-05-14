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
        { rank: "Manager", label: "Delete", description: "Delete the question", value: "question-del" },
        { rank: "Manager", label: "Lock", description: "Lock the question", value: "question-lock" },
        { rank: "Manager", label: "Unlock", description: "Unlock the question", value: "question-unlock" },
        { rank: "Manager", label: "Reveal", description: "Reveal the user tag", value: "question-reveal" },
        { rank: "Manager", label: "Log", description: "Log question channel", value: "question-log" },
        { rank: "Manager", label: "Change Details", description: "Change details of the question", value: "question-details-change" },
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

    const detailsOptionList: (MessageSelectOptionData)[] = [
        { label: "Title", description: "Delete the question", value: "change-title" },
        { label: "Description", description: "Lock the question", value: "change-description" },
        // { label: "Anonymous", description: "Unlock the question", value: "change-anonymous" },
    ];

    export function changeDetails() {
        const changeDetailsMenu = new MessageSelectMenu().setCustomId('change-dtl').setPlaceholder('Choose an option');
        changeDetailsMenu.addOptions(detailsOptionList)
        return new MessageActionRow().addComponents(changeDetailsMenu);
    }
}

export default Components;