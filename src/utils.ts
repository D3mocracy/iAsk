import { Client, Guild, GuildMember, User } from "discord.js";

namespace Utils {
    export function commonGuildss(bot: Client, user: User) {
        return bot.guilds.cache.filter((g: Guild) => !!g.members.cache.find((m: GuildMember) => m.id === user.id));
    }

    export function commonGuildCheck(bot: Client, ...users: User[]) {
        return bot.guilds.cache.filter((g: Guild) => !!g.members.cache.filter(m => users.includes(m.user)));
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