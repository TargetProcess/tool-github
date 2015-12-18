'use strict';
const _ = require('lodash');
var Github = require('github');
var wrapper = require('co-github');


module.exports = {
    mergeBranchesAndPullRequests(pullRequests, branches){
        var pullRequestMap = _.groupBy(pullRequests, pr=>pr.head.ref);

        return _.map(branches, b=> {
            let pullRequestsForBranch = pullRequestMap[b.name] || [];

            return {
                id: b.name,
                name: b.name,
                sha: b.commit.sha,
                pullRequests: _.map(pullRequestsForBranch, pr=> {
                    return {
                        id: pr.number,
                        status: pr.state,
                        sha: pr.merge_commit_sha
                    };
                })
            }
        });

    },
    createGithubClient(config) {
        var github = wrapper(new Github({
            version: "3.0.0",
            debug: true,
            protocol: "https",
            host: "api.github.com",
            timeout: 5000
        }));

        github.authenticate({type: 'oauth', token: config.authentication});
        return github;
    },
    *getAll(obj, call) {
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
};