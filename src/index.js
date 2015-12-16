'use strict';

var Github = require('github');
var wrapper = require('co-github');
var _ = require('lodash');

var bootstrap = require('buildboard-tool-bootstrap').bootstrap;

bootstrap(
    {
        id: 'github',
        settings: {
            user: {
                caption: 'Github user',
                type: 'string'
            },
            repo: {
                caption: 'Github repo',
                type: 'string'
            },
            authentication: {
                caption: 'Github token',
                description: 'Generated via https://github.com/settings/tokens',
                type: 'string'
            }
        },
        methods: {
            '/branches': {
                'get': {
                    action: branches
                }
            }
        }
    }
);


function *getAll(obj, call) {
    let config = _.clone(obj);
    config.page = 0;
    config.per_page = 100;
    let result = [];
    while (config) {
        let page = yield call(config);
        let meta = page.meta;
        if (meta && meta.link && meta.link.indexOf('rel="next"') >= 0) {
            config.page++;
        }
        else {
            config = null;
        }
        result = result.concat(page);
    }
    return result;
}
var mergeBranchesWithPullRequests = require('./github').mergeBranchesAndPullRequests;


function *branches() {

    var github = wrapper(new Github({
        version: "3.0.0",
        debug: true,
        protocol: "https",
        host: "api.github.com",
        timeout: 5000
    }));

    var config = this.passport.user.config;
    github.authenticate({type: 'oauth', token: config.authentication});

    var repo = {user: config.user, repo: config.repo};
    let branches = yield getAll(repo, github.repos.getBranches);
    let pullRequests = yield getAll(repo, github.pullRequests.getAll);
    var result = mergeBranchesWithPullRequests(pullRequests, branches);
    this.body = {
        branches: result
    };

}