
require("dotenv").config();
const express = require('express')
const app = express()
var request = require('request');
const port = 3001

/* libs para leitura de diretorios e arquivos */
var watch = require('node-watch');
const fs = require('fs')
const path = require('path')
const directory = process.env.DIRECTORY//informar a pasta onde estão os arquivos
const directoryPath = path.join(directory);
const xml2js = require('xml2js');


watch(directory, { recursive: true }, function (evt, name) {
    //console.log(evt);
    //return null;
    console.log('%s changed.', name);
    if (name.includes('.xml') && evt != "remove") {
        const xml = fs.readFileSync(name, 'utf8');
        xml2js.parseString(xml, (err, result) => {
            if (err) {
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
                    method: 'post',
                    url: process.env.MARRS_API + '/sat',
                    form: json,
                    headers: headersOpt,
                    json: true,
                }, function (error, response, body) {
                    //Print the Response
                    console.log(body);
                });
        });
    } else {
        console.log('no xml');
    }
});

app.get('/', (req, res) => {
    const json = [];
    if (req.query.date) {
        let date = req.query.date.split("-").join("/");

        fs.readdir(directoryPath + "/" + date, function (err, files) {
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            } 
            files.forEach(function (file) {
                const xml = fs.readFileSync(directory + '/' + file, 'utf8');
                xml2js.parseString(xml, (err, result) => {
                    if(err) {
                        throw err;
                    }
                    if (file.includes('.xml')) {
                        var sat = {
                            'file': file,
                            'cNF': result.CFe.infCFe[0].ide[0].cNF[0],
                            "CNPJ": result.CFe.infCFe[0].ide[0].CNPJ[0],
                            'nCFe': result.CFe.infCFe[0].ide[0].nCFe[0],
                            'dEmi': result.CFe.infCFe[0].ide[0].dEmi[0],
                            'total': result.CFe.infCFe[0].total[0].vCFe[0]
                        };

                        if (req.query.number) {
                            //console.log('validar numero ' + req.query.number);
                            //console.log(result.CFe.infCFe[0].ide[0].nCFe[0]);
                            if (req.query.number === result.CFe.infCFe[0].ide[0].nCFe[0]) {
                                //console.log('achou');
                                json.push(sat);
                            }
                        } else {
                            json.push(sat);
                        }
                    }
                    
                });
            });
            res.send(JSON.stringify(json));
        });

        //console.log(date);

    } else {
        res.send(JSON.stringify(json));
    }
})

app.listen(port, () => {
    console.log(`Server rodando em http://localhost:${port}`)
})