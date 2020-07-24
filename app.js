const payload = require('./providers/payload.json');
const writeJsonFile = require('write-json-file');


function sort_by_key(array, key)
{
    return array.sort(function(a, b) {
    var x = a[key]; var y = b[key];
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

(async () => {
    await writeJsonFile('providers/sorted-by-pvpa-payload.json', sort_by_key(payload, 'P/VPA'));
})();
