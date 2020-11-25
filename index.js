
require("dotenv").config();
const express = require('express')
const app = express()
var request = require('request');
const port = 3003

/* libs para leitura de diretorios e arquivos */
var watch = require('node-watch');
const fs = require('fs')
const path = require('path')
const directory = process.env.DIRECTORY//informar a pasta onde estão os arquivos
const directoryPath = path.join(directory);
const xml2js = require('xml2js');
const json = [];

watch(directory, { recursive: true }, function(evt, name) {
    console.log('%s changed.', name);
    
    const xml = fs.readFileSync(name, 'utf8');
    xml2js.parseString(xml, (err, result) => {
        if(err) {
            throw err;
        }
        //console.log(result.CFe)
        const json = {
            "file": name,
            "cNF": result.CFe.infCFe[0].ide[0].cNF[0],
            "CNPJ": result.CFe.infCFe[0].ide[0].CNPJ[0],
            "nCFe": result.CFe.infCFe[0].ide[0].nCFe[0],
            "dEmi": result.CFe.infCFe[0].ide[0].dEmi[0],
            "total": result.CFe.infCFe[0].total[0].vCFe[0]
        };

        console.log(json); 

        var headersOpt = {  
            "content-type": "application/json",
        };
        request(
                {
                method:'post',
                url:process.env.MARRS_API + '/sat', 
                form: json, 
                headers: headersOpt,
                json: true,
            }, function (error, response, body) {  
                //Print the Response
                console.log(body);  
        }); 


              
    });
});





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