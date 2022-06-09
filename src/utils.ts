import { Client, DMChannel, Guild, GuildMember, Intents, Message, User } from "discord.js";
import DataBase from "./db";

namespace Utils {
    export function commonGuildss(bot: Client, user: User) {
        return bot.guilds.cache.filter((g: Guild) => !!g.members.cache.find((m: GuildMember) => m.id === user.id));
    }

    export async function commonGuildCheck(bot: Client, ...users: User[]) {
        const doneGuildsID = await DataBase.guildsCollection.find({ done: true }).toArray();
        const guildList: Guild[] = bot.guilds.cache.map(g => g);

        const newlist: Guild[] = guildList.filter(g =>
            users.every(u => g.members.cache.find(m => u.id === m.id))
        ).filter(g => !!doneGuildsID.find(d => d.guildId === g.id));
        return newlist;
    }

    export async function getLastBotMessage(channel: DMChannel): Promise<Message> {
        return new Promise(async resolve => {
            await channel.messages.fetch({ limit: 5 }).then(messages => {
                if (!messages.first()?.author.bot) return;
                let lastMessage = messages.first();

                return resolve(lastMessage as Message);
            }).catch(console.error)
        })

    }

    export function convertIDToGuild(bot: Client, guildId: string) {
        return bot.guilds.cache.get(guildId);
    }

    export function convertIDtoUser(bot: Client, userId: string) {
        return bot.users.cache.get(userId);
    }

    export function convertIDtoMemberFromGuild(bot: Client, memberId: string, guildId: string): GuildMember {
        const guild = bot.guilds.cache.get(guildId);
        if (!guild) return {} as any;
        return guild.members.cache.get(memberId) as GuildMember;
    }

    export function getRemainTime(member: GuildMember): string | undefined {
        const now = new Date();
        if (!member.communicationDisabledUntil) return undefined;
        const millisecond = member.communicationDisabledUntil.getTime() - now.getTime();
        const seconds = Math.floor((millisecond / 1000) % 60),
            minutes = Math.floor((millisecond / (1000 * 60)) % 60),
            hours = Math.floor((millisecond / (1000 * 60 * 60)) % 24)
        return `${hours}h ${minutes}m ${seconds}s`;
    };

}

export default Utils;