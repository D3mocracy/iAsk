import { Client, Guild, GuildMember, MessageActionRow, MessageButton, MessageSelectMenu, MessageSelectOptionData, User } from "discord.js";
import Config from "../config";
import LanguageHandler from "../handlers/language";
import RankHandler, { Rank } from "../handlers/rank";
import { Note } from "../types";
import Utils from "../utils";

namespace Components {

    export async function chooseGuildMenuOpenQuestion(bot: Client, user: User, lang: string) {
        const chooseGuildMenu = new MessageSelectMenu().setCustomId('choose-guild-open-question').setPlaceholder(LanguageHandler.getMessageByLang("chooseGuildEmbedMessagePlaceHolder", lang));

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

    export async function chooseGuildMenuManageMember(lang: string, bot: Client, ...user: User[]) {
        const chooseGuildMenu = new MessageSelectMenu().setCustomId('choose-guild-manage-member').setPlaceholder(LanguageHandler.getMessageByLang("chooseGuildEmbedMessagePlaceHolder", lang));

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
        { label: "Support Catagory", description: "Change the support catagory ID", value: "support-catagory" },
        { label: "Tools Log", description: "Change the tools log channel ID", value: "tool-log-channel-id" },
        { label: "Question Log", description: "Change the question log channel ID", value: "question-log-channel-id" },
        { label: "Max Questions", description: "Change the max question per member on your guild", value: "max-questions-per-member" },
        { label: "Notification Role", description: "Change the notification role ID", value: "notification-role-id" },
        { label: "Member Role", description: "Change the member role ID", value: "member-role-id" },
        { label: "Trusted Role", description: "Change the trusted role ID", value: "trusted-role-id" },
        { label: "Supervisor Role", description: "Change the supervisor role ID", value: "supervisor-role-id" },
        { label: "Manager Role", description: "Change the manager role ID", value: "manager-role-id" },
        { label: "Slow Mode", description: "Set seconds to slowdown a question channel once made", value: "slow-mode" },
        { label: "Language", description: "Change guild language", value: "guild-language" },
    ];
    export function setupMenu() {
        const setupMenu = new MessageSelectMenu().setCustomId('setup').setPlaceholder("Choose one of the options below");
        setupMenu.addOptions(setupOptionList);
        return new MessageActionRow().addComponents(setupMenu);
    }

    function channelOptions(lang: string) {
        const option = LanguageHandler.getMessageByLang('channelOptions', lang);

        const channelOptionList: (MessageSelectOptionData & { rank: Rank[] })[] = [
            { rank: [Rank.MEMBER, Rank.TRUSTED, Rank.SUPERVISOR, Rank.MANAGER], label: option.anonMsg.label, description: option.anonMsg.description, value: "question-anon-msg", emoji: '🕵️‍♂️' },
            { rank: [Rank.MEMBER, Rank.TRUSTED, Rank.SUPERVISOR, Rank.MANAGER], label: option.delete.label, description: option.delete.description, value: "question-del", emoji: '❌' },
            { rank: [Rank.TRUSTED, Rank.SUPERVISOR, Rank.MANAGER], label: option.lock.label, description: option.lock.description, value: "question-lock", emoji: '🔒' },
            { rank: [Rank.TRUSTED, Rank.SUPERVISOR, Rank.MANAGER], label: option.unlock.label, description: option.unlock.description, value: "question-unlock", emoji: '🔓' },
            { rank: [Rank.MANAGER], label: option.reveal.label, description: option.reveal.description, value: "question-reveal", emoji: '👁️' },
            { rank: [Rank.SUPERVISOR, Rank.MANAGER], label: option.log.label, description: option.log.description, value: "question-log", emoji: '📁' },
            { rank: [Rank.SUPERVISOR, Rank.MANAGER], label: option.changeDetails.label, description: option.changeDetails.description, value: "question-details-change", emoji: '✍️' },
        ];
        return channelOptionList;
    }

    export async function manageQuestionMenu(lang: string, member: GuildMember) {
        const manageQuestionMenu = new MessageSelectMenu().setCustomId('channel-mng').setPlaceholder(LanguageHandler.getMessageByLang('chooseOption', lang));
        const rankHandler = await RankHandler.createHandler(member);
        const memberRanks = rankHandler.getBotRanks();
        manageQuestionMenu.addOptions(channelOptions(lang).filter(option => option.rank.some(rank => memberRanks.includes(rank))));
        return new MessageActionRow().addComponents(manageQuestionMenu);
    }

    export async function supportTicket(lang: string) {
        const close = new MessageButton().setCustomId('close-ticket').setLabel(LanguageHandler.getMessageByLang('closeTicketButton', lang)).setStyle('DANGER').setEmoji('🔐');
        return new MessageActionRow().addComponents(close);
    }

    export function chooseToBeAnonymousButtons(lang: string) {
        const yesButton = new MessageButton().setCustomId("anon-yes").setLabel(`${LanguageHandler.getMessageByLang('yesButton', lang)}`).setStyle("SUCCESS").setEmoji('✔️');
        const noButton = new MessageButton().setCustomId("anon-no").setLabel(`${LanguageHandler.getMessageByLang('noButton', lang)}`).setStyle("DANGER").setEmoji('❌');
        return new MessageActionRow().addComponents(yesButton, noButton);
    }

    export function chooseSureMessage(lang: string) {
        const yesButton = new MessageButton().setCustomId("sure-yes").setLabel(`${LanguageHandler.getMessageByLang('yesButton', lang)}`).setStyle("SUCCESS").setEmoji('✔️');
        const noButton = new MessageButton().setCustomId("sure-no").setLabel(`${LanguageHandler.getMessageByLang('noButton', lang)}`).setStyle("DANGER").setEmoji('❌');
        return new MessageActionRow().addComponents(yesButton, noButton);
    }

    export function editButtons(lang: string) {
        const t = new MessageButton().setCustomId("edit-title").setLabel(`${LanguageHandler.getMessageByLang('editTitleButton', lang)}`).setStyle("PRIMARY").setEmoji('✍️');
        const d = new MessageButton().setCustomId("edit-description").setLabel(`${LanguageHandler.getMessageByLang('editDescriptionButton', lang)}`).setStyle("PRIMARY").setEmoji('✍️');
        const c = new MessageButton().setCustomId("cancel").setLabel(`${LanguageHandler.getMessageByLang('cancelQuestionButton', lang)}`).setStyle("DANGER").setEmoji('🛑');
        return new MessageActionRow().addComponents(c, t, d);
    }

    export function chooseSureManagementMessage(lang: string) {
        const yesButton = new MessageButton().setCustomId("mng-msg-yes").setLabel(`${LanguageHandler.getMessageByLang('yesButton', lang)}`).setStyle("SUCCESS").setEmoji('✔️');
        const noButton = new MessageButton().setCustomId("mng-msg-no").setLabel(`${LanguageHandler.getMessageByLang('noButton', lang)}`).setStyle("DANGER").setEmoji('❌');
        return new MessageActionRow().addComponents(yesButton, noButton);
    }

    export function helperButtons() {
        const catagoryButton = new MessageButton().setCustomId('hlp-catagory').setLabel('Catagory Helper').setStyle('PRIMARY');
        const channelButton = new MessageButton().setCustomId('hlp-channel').setLabel('Channel Helper').setStyle('SUCCESS');
        const roleButton = new MessageButton().setCustomId('hlp-role').setLabel('Role Helper').setStyle('SECONDARY');
        return new MessageActionRow().addComponents(catagoryButton, channelButton, roleButton);
    }
    function detailOption(lang: string) {
        const option = LanguageHandler.getMessageByLang('changeDetailsOption', lang);
        const detailsOptionList: (MessageSelectOptionData)[] = [
            { label: option.title.label, description: option.title.description, value: "change-title", emoji: '✍️' },
            { label: option.description.label, description: option.description.description, value: "change-description", emoji: '✍️' },
        ];
        return detailsOptionList;
    }

    export function sureDeleteButtons(lang: string) {
        const sureDeleteComp = LanguageHandler.getMessageByLang('sureDeleteButton', lang);
        const sureButton = new MessageButton().setCustomId('del-sure').setLabel(`${sureDeleteComp.sure}`).setStyle('SUCCESS');
        const cancelButton = new MessageButton().setCustomId('del-cancel').setLabel(`${sureDeleteComp.cancel}`).setStyle('DANGER');
        return new MessageActionRow().addComponents(cancelButton, sureButton);
    };

    export function sureChangeDetailButtons(lang: string) {
        const sureChangeDetail = LanguageHandler.getMessageByLang('sureDeleteButton', lang);
        const sureButton = new MessageButton().setCustomId('cng-dtl-sure').setLabel(`${sureChangeDetail.sure}`).setStyle('SUCCESS');
        const cancelButton = new MessageButton().setCustomId('cng-dtl-cancel').setLabel(`${sureChangeDetail.cancel}`).setStyle('DANGER');
        return new MessageActionRow().addComponents(cancelButton, sureButton);
    }

    export function supportOpenTicketButton(lang: string) {
        const btn = new MessageButton().setCustomId('open-ticket-support').setLabel(LanguageHandler.getMessageByLang('supportOpenTicketButton', lang)).setStyle('PRIMARY').setEmoji('✉️');
        return new MessageActionRow().addComponents(btn);
    }


    export function changeDetails(lang: string) {
        const changeDetailsMenu = new MessageSelectMenu().setCustomId('change-dtl').setPlaceholder(LanguageHandler.getMessageByLang('chooseOption', lang));
        changeDetailsMenu.addOptions(detailOption(lang))
        return new MessageActionRow().addComponents(changeDetailsMenu);
    }

    function memberOptions(lang: string) {
        const option = LanguageHandler.getMessageByLang('memberManageOptions', lang);
        const memberOptionList: (MessageSelectOptionData & { rank: Rank[] })[] = [
            // { rank: [Rank.SUPERVISOR, Rank.MANAGER], label: option.kick.label, description: option.kick.description, value: "mbr-kick", emoji: '🦵' },
            // { rank: [Rank.MANAGER], label: option.ban.label, description: option.ban.description, value: "mbr-ban", emoji: '🛑' },
            // { rank: [Rank.SUPERVISOR, Rank.MANAGER], label: option.block.label, description: option.block.description, value: "mbr-block", emoji: '🚫' },
            { rank: [Rank.MANAGER], label: option.note.label, description: option.note.description, value: "mbr-note", emoji: '🗒️' },
            { rank: [Rank.MANAGER], label: option.managementMessage.label, description: option.managementMessage.description, value: "mbr-management-msg", emoji: '🤵' },
        ];
        return memberOptionList;
    }


    export async function memberManagementMenu(lang: string, member: GuildMember) {
        const memberManagementMenu = new MessageSelectMenu().setCustomId('mbr-mng').setPlaceholder(LanguageHandler.getMessageByLang('chooseOption', lang));
        const rankHandler = await RankHandler.createHandler(member);
        memberManagementMenu.addOptions(memberOptions(lang).filter(o => rankHandler.getBotRanks().some(rank => o.rank.includes(rank))));
        return new MessageActionRow().addComponents(memberManagementMenu);
    }

    function memberBlockOptions(lang: string) {
        const option = LanguageHandler.getMessageByLang('blockOptions', lang);
        const memberBlockOptionList: (MessageSelectOptionData & { rank: Rank[] })[] = [
            { rank: [Rank.SUPERVISOR, Rank.MANAGER], label: option.th.label, description: option.th.description, value: "block-3h", emoji: '🕐' },
            { rank: [Rank.SUPERVISOR, Rank.MANAGER], label: option.od.label, description: option.od.description, value: "block-1d", emoji: '🕦' },
            { rank: [Rank.SUPERVISOR, Rank.MANAGER], label: option.td.label, description: option.td.description, value: "block-3d", emoji: '🕗' },
            { rank: [Rank.SUPERVISOR, Rank.MANAGER], label: option.ow.label, description: option.ow.description, value: "block-1w", emoji: '🕤' },
            { rank: [Rank.MANAGER], label: option.om.label, description: option.om.description, value: "block-1m", emoji: '📅' },
            { rank: [Rank.SUPERVISOR, Rank.MANAGER], label: option.unblock.label, description: option.unblock.description, value: "block-unblock", emoji: '🔄' },
        ];
        return memberBlockOptionList;
    }


    export async function memberBlockMenu(lang: string, member: GuildMember) {
        const memberBlockMenu = new MessageSelectMenu().setCustomId('block-mbr').setPlaceholder(LanguageHandler.getMessageByLang('chooseOption', lang));
        const rankHandler = await RankHandler.createHandler(member);
        memberBlockMenu.addOptions(memberBlockOptions(lang).filter(o => rankHandler.getBotRanks().some(rank => o.rank.includes(rank))));
        return new MessageActionRow().addComponents(memberBlockMenu);
    };

    function memberNoteOptions(lang: string) {
        const option = LanguageHandler.getMessageByLang('noteOptions', lang);
        const memberNoteOptionList: (MessageSelectOptionData & { rank: string })[] = [
            { rank: "Manager", label: option.add.label, description: option.add.description, value: "note-add", emoji: '📝' },
            { rank: "Manager", label: option.rem.label, description: option.rem.description, value: "note-remove", emoji: '🧽' },
            { rank: "Manager", label: option.show.label, description: option.show.description, value: "note-show", emoji: '🗄️' },
            { rank: "Manager", label: option.reset.label, description: option.reset.description, value: "note-reset", emoji: '🗑️' },
        ];
        return memberNoteOptionList;
    }


    export function memberNoteMenu(lang: string) {
        const memberNoteMenu = new MessageSelectMenu().setCustomId('note-mbr').setPlaceholder(LanguageHandler.getMessageByLang('chooseOption', lang));
        memberNoteMenu.addOptions(memberNoteOptions(lang).filter(o => o.rank === "Manager"));
        return new MessageActionRow().addComponents(memberNoteMenu);
    }

    export function removeNoteMenu(lang: string, notes: Note[]) {
        const memberNotesMenu = new MessageSelectMenu().setCustomId('remove-notes').setPlaceholder(LanguageHandler.getMessageByLang('chooseOption', lang));
        notes.map((n, i) => {
            if (!n.content || !n._id) return;
            memberNotesMenu.addOptions({ label: `${LanguageHandler.getMessageByLang('note', lang)} #${(i + 1).toString()}`, description: n.content.toString(), value: n._id.toString() })
        });
        return new MessageActionRow().addComponents(memberNotesMenu);
    }
}

export default Components;