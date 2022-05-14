import { Client, Guild, GuildMember, User } from "discord.js";

namespace Utils {
    export function commonGuildss(bot: Client, user: User) {
        return bot.guilds.cache.filter((g: Guild) => !!g.members.cache.find((m: GuildMember) => m.id === user.id));
    }

    export function commonGuildCheck(bot: Client, ...users: User[]) {
        return bot.guilds.cache.filter((g: Guild) => !!g.members.cache.filter(m => users.includes(m.user)))

    }

}

export default Utils;