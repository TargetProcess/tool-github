'use strict';

var _ = require('lodash');
var url = require('url');
const tool = require('buildboard-tool-bootstrap');
tool.bootstrap(
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
            branches: {
                get: {
                    action: branches
                }
            },
            'pullRequests': {
                'get': {
                    action: pullRequests
                }
            }
        },
        account: require('./account')
    },
    ({router})=> {
        router.post('/webhook', function *() {
            console.log(this.request.body);
        });
    }
)
;

let githubTools = require('./githubTools');

function *branches() {

    yield githubTools.makeCall(this, g=>g.repos.getBranches, (b, repoConfig)=>({
        id: b.name,
        name: b.name,
        url: `https://github.com/${repoConfig.user}/${repoConfig.repo}/tree/${b.name}`,
        sha: b.commit.sha
    }));
}

function *pullRequests() {
    yield githubTools.makeCall(this, g=>g.pullRequests.getAll, pr=> {
        console.log(pr);
        return ({
            id: pr.number,
            name: pr.title,
            url: pr.html_url,
            status: pr.state,
            sha: pr.merge_commit_sha,
            branch: pr.head.ref,
            base: pr.base.ref
        })
    });
}