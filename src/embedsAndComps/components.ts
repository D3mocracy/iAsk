import { Client, Guild, GuildMember, MessageActionRow, MessageButton, MessageSelectMenu, MessageSelectOptionData, User } from "discord.js";
import Config from "../config";
import OpenQuestionHandler from "../handlers/openQuestion";
import { Note } from "../types";
import Utils from "../utils";

namespace Components {

    export function chooseGuildMenuOpenQuestion(bot: Client, user: User) {
        const chooseGuildMenu = new MessageSelectMenu().setCustomId('choose-guild-open-question').setPlaceholder(Config.chooseGuildEmbedMessagePlaceHolder);

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

    export function chooseGuildMenuManageMember(bot: Client, ...user: User[]) {
        const chooseGuildMenu = new MessageSelectMenu().setCustomId('choose-guild-manage-member').setPlaceholder(Config.chooseGuildEmbedMessagePlaceHolder);

        Utils.commonGuildCheck(bot, ...user).forEach(g => {
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

    const memberBlockOptionList: (MessageSelectOptionData & { rank: string })[] = [
        { rank: "Manager", label: "3 Hours", description: "Block the member for 3 hours", value: "block-3h" },
        { rank: "Manager", label: "1 Day", description: "Block the member for 1 day", value: "block-1d" },
        { rank: "Manager", label: "3 Days", description: "Block the member for 3 days", value: "block-3d" },
        { rank: "Manager", label: "1 Week", description: "Block the member for 1 week", value: "block-1w" },
        { rank: "Manager", label: "1 Month", description: "Block the member for 1 month", value: "block-1m" },
        { rank: "Manager", label: "Unblock", description: "Unblock the member", value: "block-unblock" },
    ];

    export function memberBlockMenu() {
        const memberBlockMenu = new MessageSelectMenu().setCustomId('block-mbr').setPlaceholder("For how long?");
        memberBlockMenu.addOptions(memberBlockOptionList.filter(o => o.rank === "Manager"));
        return new MessageActionRow().addComponents(memberBlockMenu);
    };

    const memberNoteOptionList: (MessageSelectOptionData & { rank: string })[] = [
        { rank: "Manager", label: "Add Note", description: "Add note to member.", value: "note-add" },
        { rank: "Manager", label: "Remove Note", description: "Remove note from member.", value: "note-remove" },
        { rank: "Manager", label: "Show Notes", description: "Show all member notes.", value: "note-show" },
        { rank: "Manager", label: "Reset All Notes", description: "Delete all member notes.", value: "note-reset" },
    ];

    export function memberNoteMenu() {
        const memberNoteMenu = new MessageSelectMenu().setCustomId('note-mbr').setPlaceholder("Choose action");
        memberNoteMenu.addOptions(memberNoteOptionList.filter(o => o.rank === "Manager"));
        return new MessageActionRow().addComponents(memberNoteMenu);
    }

    export function removeNoteMenu(notes: Note[]) {
        const memberNotesMenu = new MessageSelectMenu().setCustomId('remove-notes').setPlaceholder('Choose a note to remove');
        notes.map((n, i) => {
            if (!n.content || !n._id) return;
            memberNotesMenu.addOptions({ label: `Note #${(i + 1).toString()}`, description: n.content.toString(), value: n._id.toString() })
        });
        return new MessageActionRow().addComponents(memberNotesMenu);
    }
}

export default Components;