var githubTools = require('./githubTools');

function *deleteWebhook(account) {
    if (account.webhookId) {
        var github = githubTools.createGithubClient(account.config);
        yield github.repos.deleteHook({
            user: account.config.user,
            repo: account.config.repo,
            id: account.webhookId
        });
    }
}

function *createWebhook(account, generalSettings) {
    var github = githubTools.createGithubClient(account.config);
    var result = yield github.repos.createHook({
        user: account.config.user,
        repo: account.config.repo,
        name: "web",
        active: true,
        events: ["push", "create", "delete", "pull_request"],
        config: {
            url: generalSettings.url + '/webhook?token=' + account.toolToken,
            content_type: "json"
        }
    });
    account.webhookId = result.id;
    return account;
}
module.exports = function ({generalSettings}) {
    return {
        *onCreate(account){
            return yield createWebhook(account, generalSettings);
        },

        *onUpdate(account, oldAccount){
            console.log(oldAccount.config);
            yield deleteWebhook(oldAccount);
            return yield createWebhook(account, generalSettings);
        },

        *onDelete(account){
            yield deleteWebhook(account);
        }
    }
};

