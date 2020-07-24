const payload = require('./providers/payload.json');
const writeJsonFile = require('write-json-file');

const $payload = []

payload.map((data) => {

    data['Div.Brut/Pat.'] = parseFloat( data['Div.Brut/Pat.'].replace(',', '.') );
    
    if (data['P/VPA'] >= 0 && data['P/VPA'] <= 1 && data['Div.Brut/Pat.'] < 3) {
        $payload.push(data);
        return data;
    }

    return []
});

function sort_by_key(array, key)
{
    return array.sort(function(a, b) {
    var x = a[key]; var y = b[key];
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}
(async () => {
    await writeJsonFile('providers/analyzed-payload.json', sort_by_key($payload, 'P/VPA'));
})();
