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
            },
            taskMappingRegex: {
                caption: 'Mapping regexp',
                description: 'How to get a task id part from branch',
                type: 'regex',
                defaultValue: '^feature/(?:us|bug)(\\d+).*$'
            },
            taskMapping: {
                caption: 'Mapping result',
                description: 'Final task id projection',
                type: 'string',
                defaultValue: '{$1}'
            }
        },
        methods: {
            branches: {
                get: {
                    action: branches
                }
            },
            pullRequests: {
                get: {
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

const githubTools = require('./githubTools');
const mappingFactory = require('./mapping');

function *branches() {
    var config = this.passport.user.config;
    var mapping = mappingFactory(config.taskMappingRegex || '.*', config.taskMapping || '{$0}');

    yield githubTools.makeCall(this, g=>g.repos.getBranches, (b, config)=> {
        var branch = {
            id: b.name,
            name: b.name,
            url: `https://github.com/${config.user}/${config.repo}/tree/${b.name}`,

            sha: b.commit.sha
        };
        branch.wid = mapping(branch.id, branch);
        return branch;
    });
}

function *pullRequests() {
    yield githubTools.makeCall(this, g=>g.pullRequests.getAll, pr=> {
        return ({
            id: pr.number,
            name: pr.title,
            url: pr.html_url,

            branch: pr.head.ref,
            status: pr.state,
            sha: pr.merge_commit_sha,
            base: pr.base.ref,
            mergeable: pr.mergeable
        });
    });
}