var assert = require('chai').assert;
var mapping = require('../src/mapping');

describe('tool-github', ()=> {
    describe('mappings', ()=> {
        it('should map branches', ()=>{
            var map = mapping('feature/(?:us|bug)#?(\\d+)(?:$|_)','test:{$1}');
            assert.equal(map('feature/us45789'),'test:45789');
            assert.equal(map('develop'),'test:develop')
        });

        it('should map branches with config', ()=>{
            var map = mapping('feature/(?:us|bug)#?(\\d+)(?:$|_)','{sha}:{$1}');
            assert.equal(map('feature/us45789',{sha:'test'}),'test:45789');
            assert.equal(map('develop'),':develop')
        })
    });
});