import { Client, Guild, GuildMember, Intents, User } from "discord.js";

namespace Utils {
    export function commonGuildss(bot: Client, user: User) {
        return bot.guilds.cache.filter((g: Guild) => !!g.members.cache.find((m: GuildMember) => m.id === user.id));
    }

    export function commonGuildCheckr(bot: Client, ...users: User[]) {
        return bot.guilds.cache.filter((g: Guild) => {
            return !!g.members.cache.filter(m => {
                return users.includes(m.user)
            })
        });
    }

    export function commonGuildCheck(bot: Client, ...users: User[]): Guild[] {
        const guildList: Guild[] = bot.guilds.cache.map(g => g);
        const newlist = guildList.filter(g => {
            const members = g.members.cache.filter(m => {
                return users.includes(m.user)
            })
            return members.size === users.length;
        });
        return newlist;



        // return bot.guilds.cache.filter(async g => {
        //     return !!(await g.members.list())
        // });
    }

    export function convertIDToGuild(bot: Client, guildId: string) {
        return bot.guilds.cache.get(guildId);
    }

    export function convertIDtoUser(bot: Client, userId: string) {
        return bot.users.cache.get(userId);
    }

    export function convertIDtoMemberFromGuild(bot: Client, memberId: string, guildId: string) {
        const guild = bot.guilds.cache.get(guildId);
        if (!guild) return;
        return guild.members.cache.get(memberId);
    }

}

export default Utils;