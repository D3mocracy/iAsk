import { Client, Guild, GuildMember, MessageActionRow, MessageButton, MessageSelectMenu, MessageSelectOptionData, User } from "discord.js";
import Config from "../config";
import RankHandler, { Rank } from "../handlers/rank";
import { Note } from "../types";
import Utils from "../utils";

namespace Components {

    export async function chooseGuildMenuOpenQuestion(bot: Client, user: User) {
        const chooseGuildMenu = new MessageSelectMenu().setCustomId('choose-guild-open-question').setPlaceholder(Config.chooseGuildEmbedMessagePlaceHolder);

        (await Utils.commonGuildCheck(bot, user)).forEach(g => {
            chooseGuildMenu.addOptions([{
                label: g.name,
                description: g.description || g.name,
                value: g.id,
                emoji: Config.chooseGuildEmbedMessageEmoji
            }]);
        });
        return new MessageActionRow().addComponents(chooseGuildMenu);
    }

    export async function chooseGuildMenuManageMember(bot: Client, ...user: User[]) {
        const chooseGuildMenu = new MessageSelectMenu().setCustomId('choose-guild-manage-member').setPlaceholder(Config.chooseGuildEmbedMessagePlaceHolder);

        (await Utils.commonGuildCheck(bot, ...user)).forEach(g => {
            chooseGuildMenu.addOptions([{
                label: g.name,
                description: g.description || g.name,
                value: g.id,
                emoji: Config.chooseGuildEmbedMessageEmoji
            }]);
        });
        return new MessageActionRow().addComponents(chooseGuildMenu);
    }

    const setupOptionList: MessageSelectOptionData[] = [
        { label: "Question Catagory", description: "Change the question catagory ID", value: "question-catagory" },
        { label: "Tools Log", description: "Change the tools log channel ID", value: "tool-log-channel-id" },
        { label: "Question Log", description: "Change the question log channel ID", value: "question-log-channel-id" },
        { label: "Max Questions", description: "Change the max question per member on your guild", value: "max-questions-per-member" },
        { label: "Notification Role", description: "Change the notification role ID", value: "notification-role-id" },
        { label: "Member Role", description: "Change the member role ID", value: "member-role-id" },
        { label: "Trusted Role", description: "Change the trusted role ID", value: "trusted-role-id" },
        { label: "Supervisor Role", description: "Change the supervisor role ID", value: "supervisor-role-id" },
        { label: "Manager Role", description: "Change the manager role ID", value: "manager-role-id" },
    ];
    export function setupMenu() {
        const setupMenu = new MessageSelectMenu().setCustomId('setup').setPlaceholder("Choose one of the options below");
        setupMenu.addOptions(setupOptionList);
        return new MessageActionRow().addComponents(setupMenu);
    }


    const channelOptionList: (MessageSelectOptionData & { rank: Rank[] })[] = [
        { rank: [Rank.MEMBER, Rank.TRUSTED, Rank.SUPERVISOR, Rank.MANAGER], label: "Delete", description: "Delete the question", value: "question-del", emoji: '❌' },
        { rank: [Rank.TRUSTED, Rank.SUPERVISOR, Rank.MANAGER], label: "Lock", description: "Lock the question", value: "question-lock", emoji: '🔒' },
        { rank: [Rank.TRUSTED, Rank.SUPERVISOR, Rank.MANAGER], label: "Unlock", description: "Unlock the question", value: "question-unlock", emoji: '🔓' },
        { rank: [Rank.MANAGER], label: "👁️ Reveal", description: "Reveal the user tag", value: "question-reveal", emoji: '' },
        { rank: [Rank.SUPERVISOR, Rank.MANAGER], label: "Log", description: "Log question channel", value: "question-log", emoji: '📁' },
        { rank: [Rank.SUPERVISOR, Rank.MANAGER], label: "Change Details", description: "Change details of the question", value: "question-details-change", emoji: '✍️' },
    ];
    export async function manageQuestionMenu(member: GuildMember) {
        const manageQuestionMenu = new MessageSelectMenu().setCustomId('channel-mng').setPlaceholder('Choose an option');
        const rankHandler = await RankHandler.createHandler(member);
        const memberRanks = rankHandler.getManageRanks();
        manageQuestionMenu.addOptions(channelOptionList.filter(option => option.rank.some(rank => memberRanks.includes(rank))));
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

    export function chooseSureManagementMessage() {
        const yesButton = new MessageButton().setCustomId("mng-msg-yes").setLabel(Config.yesSureButton).setStyle("SUCCESS");
        const noButton = new MessageButton().setCustomId("mng-msg-no").setLabel(Config.noSureButton).setStyle("DANGER");
        return new MessageActionRow().addComponents(yesButton, noButton);
    }

    export function helperButtons() {
        const catagoryButton = new MessageButton().setCustomId('hlp-catagory').setLabel('Catagory Helper').setStyle('PRIMARY');
        const channelButton = new MessageButton().setCustomId('hlp-channel').setLabel('Channel Helper').setStyle('SUCCESS');
        const roleButton = new MessageButton().setCustomId('hlp-role').setLabel('Role Helper').setStyle('SECONDARY');
        return new MessageActionRow().addComponents(catagoryButton, channelButton, roleButton);
    }

    const detailsOptionList: (MessageSelectOptionData)[] = [
        { label: "Title", description: "Delete the question", value: "change-title", emoji: '✍️' },
        { label: "Description", description: "Lock the question", value: "change-description", emoji: '✍️' },
    ];

    export function changeDetails() {
        const changeDetailsMenu = new MessageSelectMenu().setCustomId('change-dtl').setPlaceholder('✍️ Choose An Option');
        changeDetailsMenu.addOptions(detailsOptionList)
        return new MessageActionRow().addComponents(changeDetailsMenu);
    }

    const memberOptionList: (MessageSelectOptionData & { rank: Rank[] })[] = [
        { rank: [Rank.SUPERVISOR, Rank.MANAGER], label: "Kick", description: "Kicks member out of the server", value: "mbr-kick", emoji: '🦵' },
        { rank: [Rank.MANAGER], label: "Ban", description: "Bans member out of the server", value: "mbr-ban", emoji: '🛑' },
        { rank: [Rank.SUPERVISOR, Rank.MANAGER], label: "Block", description: "Opens block system", value: "mbr-block", emoji: '🚫' },
        { rank: [Rank.MANAGER], label: "Notes", description: "Opens note system", value: "mbr-note", emoji: '🗒️' },
        { rank: [Rank.MANAGER], label: "Management Message", description: "Send management message to member", value: "mbr-management-msg", emoji: '🤵' },
    ];

    export async function memberManagementMenu(member: GuildMember) {
        const memberManagementMenu = new MessageSelectMenu().setCustomId('mbr-mng').setPlaceholder('💻 Choose An Option');
        const rankHandler = await RankHandler.createHandler(member);
        memberManagementMenu.addOptions(memberOptionList.filter(o => rankHandler.getManageRanks().every(rank => o.rank.includes(rank))));
        return new MessageActionRow().addComponents(memberManagementMenu);
    }

    const memberBlockOptionList: (MessageSelectOptionData & { rank: Rank[] })[] = [
        { rank: [Rank.SUPERVISOR, Rank.MANAGER], label: "3 Hours", description: "Block the member for 3 hours", value: "block-3h", emoji: '🕐' },
        { rank: [Rank.SUPERVISOR, Rank.MANAGER], label: "1 Day", description: "Block the member for 1 day", value: "block-1d", emoji: '🕦' },
        { rank: [Rank.SUPERVISOR, Rank.MANAGER], label: "3 Days", description: "Block the member for 3 days", value: "block-3d", emoji: '🕗' },
        { rank: [Rank.SUPERVISOR, Rank.MANAGER], label: "1 Week", description: "Block the member for 1 week", value: "block-1w", emoji: '🕤' },
        { rank: [Rank.MANAGER], label: "1 Month", description: "Block the member for 1 month", value: "block-1m", emoji: '📅' },
        { rank: [Rank.SUPERVISOR, Rank.MANAGER], label: "Unblock", description: "Unblock the member", value: "block-unblock", emoji: '🔄' },
    ];

    export async function memberBlockMenu(member: GuildMember) {
        const memberBlockMenu = new MessageSelectMenu().setCustomId('block-mbr').setPlaceholder("⏳ For how long?");
        const rankHandler = await RankHandler.createHandler(member);
        memberBlockMenu.addOptions(memberBlockOptionList.filter(o => rankHandler.getManageRanks().every(rank => o.rank.includes(rank))));
        return new MessageActionRow().addComponents(memberBlockMenu);
    };

    const memberNoteOptionList: (MessageSelectOptionData & { rank: string })[] = [
        { rank: "Manager", label: "Add Note", description: "Add note to member.", value: "note-add", emoji: '📝' },
        { rank: "Manager", label: "Remove Note", description: "Remove note from member.", value: "note-remove", emoji: '🧽' },
        { rank: "Manager", label: "Show Notes", description: "Show all member notes.", value: "note-show", emoji: '🗄️' },
        { rank: "Manager", label: "Reset All Notes", description: "Delete all member notes.", value: "note-reset", emoji: '🗑️' },
    ];

    export function memberNoteMenu() {
        const memberNoteMenu = new MessageSelectMenu().setCustomId('note-mbr').setPlaceholder("🗒️ Choose Note Action");
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