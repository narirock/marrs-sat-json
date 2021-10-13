
require("dotenv").config();
const express = require("express");
const app = express();
var request = require("request");
const port = 3001;

/* libs para leitura de diretorios e arquivos */

var watch = require("node-watch");
const fs = require("fs");
const path = require("path");
const directory = process.env.DIRECTORY; //informar a pasta onde estão os arquivos
const directoryPath = path.join(directory);
const xml2js = require("xml2js");
/*
const fs2 = require('fs-extra')
const file = './database.db'
fs2.ensureFileSync(file)

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("./database.db");
db.serialize(function () {
  db.run("CREATE TABLE IF NOT EXISTS queue (info TEXT)");
});

var error_send = false;

watch(directory, { recursive: true }, function (evt, name) {
  //console.log(evt);
  //return null;

  if (name.includes(".xml") && evt != "remove") {
    const xml = fs.readFileSync(name, "utf8");
    xml2js.parseString(xml, (err, result) => {
      if (err) {
        throw err;
      }

      console.log("enviando %s.", name);
      //verificando se existem dados do comprador
      let customer = "";
      if ("dest" in result.CFe.infCFe[0]) {
        for (props in result.CFe.infCFe[0].dest[0]) {
          switch (props) {
            case "CPF":
              customer = result.CFe.infCFe[0].dest[0].CPF[0];
              break;
            case "CNPJ":
              customer = result.CFe.infCFe[0].dest[0].CNPJ[0];
              break;
          }
        }
      }

      //formatando dados de envio
      const json = {
        file: name,
        nserieSAT: result.CFe.infCFe[0].ide[0].nserieSAT[0],
        CNPJ: result.CFe.infCFe[0].emit[0].CNPJ[0],
        nCFe: result.CFe.infCFe[0].ide[0].nCFe[0],
        dEmi: result.CFe.infCFe[0].ide[0].dEmi[0],
        total: result.CFe.infCFe[0].total[0].vCFe[0],
        customer: customer,
      };

      send(json, name);
    });
  } else {
    //console.log("no xml");
  }
});

function resend() {
  error_send = false;
  var id = null;
  db.each("SELECT rowid AS id, info FROM queue", function (err, row) {
    console.log(row);
    let json = JSON.parse(row.info);
    id = row.id;
    send(json, "resend");
    var stmt = db.prepare("DELETE FROM queue where info LIKE ?");
    stmt.run(row.info);
    stmt.finalize();
  });
  console.log("teste resend");
}

function send(json, name) {
  try {
    var headersOpt = {
      "content-type": "application/json",
      "api-token": "uZpjdpNCIBVK1JcwC6WMvNPgoNEjnfa6"
    };
    request({
      method: "post",
      url: process.env.MARRS_API + "/sat",
      form: json,
      headers: headersOpt,
      json: true,
    }, function (error, response, body) {
      if (response.statusCode == 200 || response.statusCode == 204 || response.statusCode == 201) {
        console.log(body);
        if (error_send == true) {
          //tentar reenviar fila
          resend();
        }
      } else {
        console.log(response.statusCode);
        console.log(body);
        error_send = true;

        var stmt = db.prepare("INSERT INTO queue VALUES (?)");
        stmt.run(JSON.stringify(json));
        stmt.finalize();

        console.log("Erro ao carregar, enviado para fila");
      }
    });
  } catch (e) {
    console.log(e);
  }
}*/

app.get("/", (req, res) => {
  const json = [];
  if (req.query.date) {
    let date = req.query.date.split("-").join("/");

    fs.readdir(directoryPath + "/" + date, function (err, files) {
      if (err) {
        res.send(JSON.stringify([]));
        return console.log("Unable to scan directory: " + err);
      }

      files.forEach(function (file) {
        const xml = fs.readFileSync(
          directory + "/" + date + "/" + file,
          "utf8"
        );
        xml2js.parseString(xml, (err, result) => {
          if (err) {
            throw err;
          }
          if (file.includes(".xml")) {
            //verificando se existem dados do comprador
            let customer = "";
            if ("dest" in result.CFe.infCFe[0]) {
              for (props in result.CFe.infCFe[0].dest[0]) {
                switch (props) {
                  case "CPF":
                    customer = result.CFe.infCFe[0].dest[0].CPF[0];
                    break;
                  case "CNPJ":
                    customer = result.CFe.infCFe[0].dest[0].CNPJ[0];
                    break;
                }
              }
            }
            var sat = {
              file: file,
              nserieSAT: result.CFe.infCFe[0].ide[0].nserieSAT[0],
              CNPJ: result.CFe.infCFe[0].emit[0].CNPJ[0],
              nCFe: result.CFe.infCFe[0].ide[0].nCFe[0],
              dEmi: result.CFe.infCFe[0].ide[0].dEmi[0],
              total: result.CFe.infCFe[0].total[0].vCFe[0],
              customer: customer,
            };

            if (req.query.number) {
              console.log("validar numero " + req.query.number);
              console.log(result.CFe.infCFe[0].ide[0].nCFe[0]);
              if (req.query.number === result.CFe.infCFe[0].ide[0].nCFe[0]) {
                //console.log('achou');
                json.push(sat);
              }
            } else if (req.query.customer) {
              if (req.query.customer === customer) {
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
});

app.listen(port, () => {
  console.log(`Server rodando em http://localhost:${port}`);
});
