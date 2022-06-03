import { Guild, GuildMember, Role } from "discord.js";
import SetupHanlder from "./setup";

class RankHandler {
    private memberRole: Role = {} as Role;
    private notificationRole: Role = {} as Role;
    private trustedRole: Role = {} as Role;
    private supervisorRole: Role = {} as Role;
    private managerRole: Role = {} as Role;
    private guild: Guild = {} as Guild;

    private constructor(private member: GuildMember) { }

    private converter: { [key in Rank]: Role } = {} as any;
    private ranks = [Rank.MEMBER, Rank.NOTIFICATION, Rank.TRUSTED, Rank.SUPERVISOR, Rank.MANAGER];

    static async createHandler(member: GuildMember) {
        const handler = new RankHandler(member);
        await handler.load();
        return handler;
    }

    async load() {
        this.memberRole = this.member.guild.roles.cache.get((await SetupHanlder.getConfigObject(this.member.guild.id)).memberRoleID) as any;
        this.notificationRole = this.member.guild.roles.cache.get((await SetupHanlder.getConfigObject(this.member.guild.id)).notificationRoleID) as any;
        this.trustedRole = this.member.guild.roles.cache.get((await SetupHanlder.getConfigObject(this.member.guild.id)).trustedRoleID) as any;
        this.supervisorRole = this.member.guild.roles.cache.get((await SetupHanlder.getConfigObject(this.member.guild.id)).supervisorRoleID) as any;
        this.managerRole = this.member.guild.roles.cache.get((await SetupHanlder.getConfigObject(this.member.guild.id)).managerRoleID) as any;
        this.guild = this.member.guild;
        this.converter = {
            [Rank.MEMBER]: this.memberRole,
            [Rank.TRUSTED]: this.trustedRole,
            [Rank.NOTIFICATION]: this.notificationRole,
            [Rank.SUPERVISOR]: this.supervisorRole,
            [Rank.MANAGER]: this.managerRole,
        };
    }

    hasRank(rank: Rank) {
        return !!this.member.roles.cache.find(r => r.id === this.converter[rank].id);
    }

    async setRanks(...ranks: Rank[]) {
        await this.member.roles.set(ranks.map(r => this.converter[r]));
    }

    getManageRoles() {
        const roles = this.member.roles.cache.filter(r => {
            return !!this.ranks.map(rank => this.converter[rank].id === r.id)
        });
        roles.delete(this.member.guild.roles.everyone.id);
        return roles;
    }

    getManageRanks() {
        const ranks = [Rank.MEMBER, Rank.NOTIFICATION, Rank.TRUSTED, Rank.SUPERVISOR, Rank.MANAGER];
        return ranks.filter(rank => !!this.getManageRoles().find(role => this.converter[rank].id === role.id));
    }

    getRank(rank: Rank) {
        return this.converter[rank];
    }

    async removeRank(rank: Rank) {
        const rankID = this.converter[rank].id;
        if (this.hasRank(rank))
            await this.member.roles.remove(rankID);
    }

    async addRank(rank: Rank) {
        await this.member.roles.add(this.converter[rank]);
    }
}

export enum Rank {
    MEMBER, NOTIFICATION, TRUSTED, SUPERVISOR, MANAGER
}

export default RankHandler;