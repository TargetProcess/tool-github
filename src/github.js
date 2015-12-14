const _ = require('lodash');

module.exports = {
    mergeBranchesAndPullRequests(pullRequests, branches){
        "use strict";

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

    }
};