const format = require('string-format');
const _ = require('lodash');

module.exports = (regex, projection)=> {
    var r = new RegExp(regex, 'i');
    console.log(r, projection);
    return (str, config)=> {
        var result = r.exec(str) || [str, str];
        console.log(result);
        var sources = _.indexBy(result, (r, i)=>'$' + i);
        var data = _.extend(_.clone(config) || {}, sources);
        return format(projection, data);
    };
};
