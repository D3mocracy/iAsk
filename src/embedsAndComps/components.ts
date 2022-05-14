import { Client, Guild, GuildMember, MessageActionRow, MessageButton, MessageSelectMenu, MessageSelectOptionData, User } from "discord.js";
import Config from "../config";
import OpenQuestionHandler from "../handlers/openQuestion";
import Utils from "../utils";

namespace Components {

    export function chooseGuildMenu(bot: Client, user: User) {
        const chooseGuildMenu = new MessageSelectMenu().setCustomId('choose-guild').setPlaceholder(Config.chooseGuildEmbedMessagePlaceHolder);

        Utils.commonGuildCheck(bot, user).forEach(g => {
            chooseGuildMenu.addOptions([{
                label: g.name,
                description: g.description || g.name,
                value: g.id,
                emoji: Config.chooseGuildEmbedMessageEmoji
            }]);
        });
        return new MessageActionRow().addComponents(chooseGuildMenu);
    }

    const channelOptionList: (MessageSelectOptionData & { rank: string })[] = [
        { rank: "Manager", label: "Delete", description: "Delete the question", value: "question-del" },
        { rank: "Manager", label: "Lock", description: "Lock the question", value: "question-lock" },
        { rank: "Manager", label: "Unlock", description: "Unlock the question", value: "question-unlock" },
        { rank: "Manager", label: "Reveal", description: "Reveal the user tag", value: "question-reveal" },
        { rank: "Manager", label: "Log", description: "Log question channel", value: "question-log" },
        { rank: "Manager", label: "Change Details", description: "Change details of the question", value: "question-details-change" },
    ];
    export function manageQuestionMenu() {
        const manageQuestionMenu = new MessageSelectMenu().setCustomId('channel-mng').setPlaceholder('Choose an option');
        manageQuestionMenu.addOptions(channelOptionList.filter(o => o.rank === "Manager"));
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

    const memberOptionList: (MessageSelectOptionData & { rank: string })[] = [
        { rank: "Manager", label: "Kick", description: "Kicks member out of the server", value: "mbr-kick" },
        { rank: "Manager", label: "Ban", description: "Bans member out of the server", value: "mbr-ban" },
        { rank: "Manager", label: "Block", description: "Opens block system", value: "mbr-block" },
        { rank: "Manager", label: "Notes", description: "Opens note system", value: "mbr-note" },
        { rank: "Manager", label: "Management Message", description: "Send management message to member", value: "mbr-management-msg" },
        { rank: "Manager", label: "Rank System", description: "Opens rank system", value: "mbr-rank" },
    ];

    export function memberManagementMenu() {
        const memberManagementMenu = new MessageSelectMenu().setCustomId('mbr-mng').setPlaceholder('Choose an option');
        memberManagementMenu.addOptions(memberOptionList.filter(o => o.rank === "Manager"));
        return new MessageActionRow().addComponents(memberManagementMenu);
    }
}

export default Components;