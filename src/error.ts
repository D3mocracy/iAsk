export class MissingGuildIdError extends Error {
    constructor() {
        super("Missing Guild Id");
    }
}

export class UnknownChannel extends Error {
    constructor() {
        super("Can't find channel");
    }
}