const express = require('express')
const app = express()
const port = 3001

/* libs para leitura de diretorios e arquivos */

const fs = require('fs')
const path = require('path')
const directory = '/home/narirock/Downloads/SAT' //informar a pasta onde estão os arquivos
const directoryPath = path.join(directory);
const xml2js = require('xml2js');
const json = [];

app.get('/', (req, res) => {
    fs.readdir(directoryPath, function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        files.forEach(function (file) {
            const xml = fs.readFileSync(directory + '/' + file, 'utf8');
            xml2js.parseString(xml, (err, result) => {
                if(err) {
                    throw err;
                }
                //console.log(result.CFe.infCFe[0].ide[0].dEmi)
                json.push({'file':file, 'cNF':result.CFe.infCFe[0].ide[0].cNF[0],'nCFe':result.CFe.infCFe[0].ide[0].nCFe[0], 'dEmi':result.CFe.infCFe[0].ide[0].dEmi[0], 'total':result.CFe.infCFe[0].total[0].vCFe[0]});
                
            });
        });
        res.send(JSON.stringify(json));
    });
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
    
})