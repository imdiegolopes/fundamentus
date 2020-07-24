const axios = require('axios');
const fs = require('fs');
var cheerio = require('cheerio');
const writeJsonFile = require('write-json-file');

const url = 'https://www.fundamentus.com.br/resultado.php';



const promise1 = axios.get(url)
    .then(function (response) {
        //console.log(response);
        //console.log(response.data);
        const data = [];
        
        const payload = {
            'papel': '',
            'cotacao': '',
            'P/L': '',
            'P/VP': '',
            'PSR': '',
            'DY': '',
            'P/Ativo': '',
            'P/Cap.Giro': '',
            'P/EBIT': '',
            'P/Ativ.Circ.Liq.': '',
            'EV/EBIT': '',
            'EBITDA': '',
            'Mrg.Liq.': '',
            'Liq.Corr.': '',
            'ROIC': '',
            'ROE': '',
            'Liq.2m.': '',
            'Pat.Liq': '',
            'Div.Brut/Pat.': '',
            'Cresc.5a': '',
            'P/VPA': '',
            'VPA': '',
            'LPA': ''
        };

        const $ = cheerio.load(response.data);

        (async () => {
            await $('table.resultado tr').each((i, element) => {
                const $this = $(element);
    
                const columns = $this.find('td').length;
                const keys = Object.keys(payload);
    
                if (parseInt($this.find('td').eq(16).text()) > 0) {
                    data.push({
                        'papel': $this.find('td').eq(0).text(),
                        'cotacao': $this.find('td').eq(1).text().replace(',', '.'),
                        'P/L': $this.find('td').eq(2).text(),
                        'P/VP': $this.find('td').eq(3).text(),
                        'PSR': $this.find('td').eq(4).text(),
                        'DY': $this.find('td').eq(5).text(),
                        'P/Ativo': $this.find('td').eq(6).text(),
                        'P/Cap.Giro': $this.find('td').eq(7).text(),
                        'P/EBIT': $this.find('td').eq(8).text(),
                        'P/Ativ.Circ.Liq.': $this.find('td').eq(9).text().replace(',', '.'),
                        'EV/EBIT': $this.find('td').eq(10).text(),
                        'EBITDA': $this.find('td').eq(11).text(),
                        'Mrg.Liq.': $this.find('td').eq(12).text(),
                        'Liq.Corr.': $this.find('td').eq(13).text(),
                        'ROIC': $this.find('td').eq(14).text(),
                        'ROE': $this.find('td').eq(15).text().replace(',', '.').replace('%', ''),
                        'Liq.2m.': $this.find('td').eq(16).text(),
                        'Pat.Liq': $this.find('td').eq(17).text(),
                        'Div.Brut/Pat.': $this.find('td').eq(18).text(),
                        'Cresc.5a': $this.find('td').eq(19).text(),
                        'P/VPA': '',
                        'VPA': '',
                        'LPA': '',
                        'Valor Intrínseco': '',
                        'Fórmula da Graham': ''
                    });
                }
            });
        })();

        return data;
    });

const promise2 = promise1
    .then((response) => {
        const data = [];

        (async () => {
            await response.forEach((payload) => {
                
                axios.get('https://www.fundamentus.com.br/detalhes.php?papel=' + payload.papel)
                    .then(($response) => {        
                        const $ = cheerio.load($response.data);
                        
                        payload['VPA'] = parseFloat($('.label.w2 .txt:contains("VPA")').parent().next().text().replace(',', '.'));
                        payload['LPA'] = parseFloat($('.label.w2 .txt:contains("LPA")').parent().next().text().replace(',', '.'));
                        payload['P/VPA'] = parseFloat(payload.cotacao) / payload['VPA'];

                        if (payload['VPA'] && payload['LPA'] ) {
                            payload['Valor Intrínseco'] = Math.sqrt(22.5 * payload['VPA'] * payload['LPA']);
                        }

                        if (payload['LPA']) {
                          //payload['Fórmula da Graham'] = payload['LPA'] * (5,5 + (2 * (payload['ROE'] * ))) * (4,4/F7);
                        }


                        /*
                        D7*(5,5+(2*E7))*(4,4/F7)

                        Em que:

                        D7= Lucro por ação
                        E7= Taxa de crescimento do Lucro (G)
                        F7= Selic

                        

                        Em que G = ROE médio * Payout Médio
                        */
                        // Em que G = ROE médio * Payout Médio

                        // Taxa Selic
                        // 0.06
                        // Taxa de Crescimento
                        
                        data.push(payload);
                        
                        (async () => {
                            await writeJsonFile('providers/payload.json', data);
                        })();
                    })
                    .catch((error) => console.log(error));
            })
        })();

        return data;
    })

Promise.all([promise1, promise2]).then((values) => {
    console.log(values[1]);
});