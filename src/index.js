'use strict';

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
            },
            ''
        },
        account: require('./account')
    },
    ({router})=> {
        router.post('/webhook', function *() {
            console.log(this.request.body);
        })
    }
)
;


let githubTools = require('./githubTools');

function *branches() {
    var config = this.passport.user.config;
    var github = githubTools.createGithubClient(config);

    var repo = {user: config.user, repo: config.repo};
    let branches = yield githubTools.getAll(repo, github.repos.getBranches);
    let pullRequests = yield githubTools.getAll(repo, github.pullRequests.getAll);
    var result = githubTools.mergeBranchesAndPullRequests(pullRequests, branches);
    this.body = {
        items: result
    };

}