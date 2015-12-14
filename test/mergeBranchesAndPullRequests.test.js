var expect = require("chai").expect;

var merge = require("../src/github").mergeBranchesAndPullRequests;
describe('codetool-github', ()=> {
    "use strict";
    it('should merge', ()=> {
        let pullRequests = [
            {
                number: 1,
                state: 'ok',
                head: {ref: 1},
                merge_commit_sha: "mc1"
            },
            {
                number: 1,
                state: 'fail',
                head: {ref: 2},
                merge_commit_sha: "mc1"
            },
            {
                number: 3,
                state: 'fail',
                head: {ref: 2},
                merge_commit_sha: "mc1"
            }

        ];

        let branches = [{
            name: 1,
            commit: {sha: 'sha1'}
        }, {
            name: 2,
            commit: {sha: 'sha2'}
        }, {
            name: 3,
            commit: {sha: 'sha3'}
        }];


        expect(merge(pullRequests, branches)).to.be.eql([
            {
                "id": 1,
                "name": 1,
                "pullRequests": [
                    {
                        "id": 1,
                        "sha": "mc1",
                        "status": "ok"
                    }
                ],
                "sha": "sha1"
            },
            {
                "id": 2,
                "name": 2,
                "pullRequests": [
                    {
                        "id": 1,
                        "sha": "mc1",
                        "status": "fail"
                    },
                    {
                        "id": 3,
                        "sha": "mc1",
                        "status": "fail"
                    }
                ],
                "sha": "sha2"
            },
            {
                "id": 3,
                "name": 3,
                "pullRequests": [],
                "sha": "sha3"
            }
        ]);
    });
});