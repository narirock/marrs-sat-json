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

      try {
        var headersOpt = {
          "content-type": "application/json",
          api_token: "uZpjdpNCIBVK1JcwC6WMvNPgoNEjnfa6",
        };
        request({
          method: "post",
          url: process.env.MARRS_API + "/sat",
          form: json,
          headers: headersOpt,
          json: true,
        })
          .on("response", function (response) {
            console.log(response.statusCode);
          })
          .on("error", function (err) {
            console.log("Erro ao carregar" + err);
          });
      } catch (e) {
        console.log(e);
      }
    });
  } else {
    //console.log("no xml");
  }
});

app.get("/", (req, res) => {
  const json = [];
  if (req.query.date) {
    let date = req.query.date.split("-").join("/");

    fs.readdir(directoryPath + "/" + date, function (err, files) {
      if (err) {
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
            var sat = {
              file: file,
              nserieSAT: result.CFe.infCFe[0].ide[0].nserieSAT[0],
              CNPJ: result.CFe.infCFe[0].emit[0].CNPJ[0],
              nCFe: result.CFe.infCFe[0].ide[0].nCFe[0],
              dEmi: result.CFe.infCFe[0].ide[0].dEmi[0],
              total: result.CFe.infCFe[0].total[0].vCFe[0],
            };

            if (req.query.number) {
              console.log("validar numero " + req.query.number);
              console.log(result.CFe.infCFe[0].ide[0].nCFe[0]);
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
});

app.listen(port, () => {
  console.log(`Server rodando em http://localhost:${port}`);
});
