"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createOrGetUserToken(authApi, profile, source) {
    return authApi.lookupUser(source, profile.id).then(maybe => maybe.caseOf({
        just: user => Promise.resolve(userToUserToken(user)),
        nothing: () => authApi
            .createUser(profileToUser(profile, source))
            .then(userToUserToken)
    }));
}
exports.default = createOrGetUserToken;
function profileToUser(profile, source) {
    if (!profile.emails || profile.emails.length === 0) {
        throw new Error("User with no email address");
    }
    return {
        displayName: profile.displayName,
        email: profile.emails[0].value,
        photoURL: profile.photos && profile.photos.length > 0
            ? profile.photos[0].value
            : undefined,
        source: source,
        sourceId: profile.id,
        isAdmin: false
    };
}
function userToUserToken(user) {
    return {
        id: user.id
    };
}
//# sourceMappingURL=createOrGetUserToken.js.map