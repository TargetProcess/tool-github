'use strict';
const _ = require('lodash');
var Github = require('github');
var wrapper = require('co-github');
const tool = require('buildboard-tool-bootstrap');
var url = require('url');

function createGithubClient(config) {
    var github = wrapper(new Github({
        version: '3.0.0',
        debug: true,
        protocol: 'https',
        host: 'api.github.com',
        timeout: 5000
    }));

    github.authenticate({type: 'oauth', token: config.authentication});
    return github;
}

module.exports = {
    createGithubClient,
    *makeCall(ctx, caller, mapper){
        var fullUrl = tool.getUrl(ctx);
        let config = ctx.passport.user.config;
        var github = createGithubClient(config);

        const per_page = (parseInt(ctx.request.query.per_page) || 100);
        const page = parseInt(ctx.request.query.page) || 1;
        var repoConfig = {
            user: config.user,
            repo: config.repo,
            page,
            per_page: per_page + 1
        };

        let items = yield caller(github)(repoConfig);
        ctx.body = {
            items: _.map(items, item=>mapper(item, repoConfig)).slice(0, per_page)
        };
        if (items.length > per_page) {
            fullUrl.query.page = page + 1;
            fullUrl.search = undefined;
            ctx.body.next = url.format(fullUrl);
        }
    }
}
;