const express= require("express");
const path= require("path");
const fs= require("fs");
const sass= require("sass");
const { text } = require("stream/consumers");
const sharp= require("sharp");

app= express();
app.set("view engine", "ejs")

// bonus: etapa 4

function verificareJSON() {
    const caleJSON = path.join(__dirname, "resurse/json/erori.json");

    // a. verificare existență fisier JSON
    if (!fs.existsSync(caleJSON)) {
        console.error(`[A] EROARE CRITICA: Fisierul ${caleJSON} lipseste!`);
        process.exit(1); 
    }

    const continutString = fs.readFileSync(caleJSON, 'utf8');
    let date;

    try {
        date = JSON.parse(continutString);
    } catch (e) {
        console.error("[EROARE] JSON-ul are erori de sintaxa și nu poate fi parsat!");
        return;
    }

    // b. verificare proprietati obligatorii
    const propObligatorii = ["info_erori", "cale_baza", "eroare_default"];
    propObligatorii.forEach(prop => {
        if (date[prop] === undefined) {
            console.warn(`[B] REMEDIERI: Lipseste proprietatea de bază: "${prop}"`);
        }
    });

    // c. verificare proprietati in eroare_default
    if (date.eroare_default) {
        ["titlu", "text", "imagine"].forEach(sp => {
            if (!date.eroare_default[sp]) {
                console.warn(`[C] REMEDIERI: erore_default are proprietatea "${sp}" lipsa sau undefined.`);
            }
        });
    }

    // d. verificare existență folder cale_baza
    if (date.cale_baza) {
        const caleFolder = path.join(__dirname, date.cale_baza);
        if (!fs.existsSync(caleFolder)) {
            console.warn(`[D] REMEDIERI: Folderul din cale_baza nu există: ${caleFolder}`);
        }
    }

    // e & g. verificare proprietăți în info_erori și identificatori duplicați
    if (date.info_erori && Array.isArray(date.info_erori)) {
        const identificatori = date.info_erori.map(e => e.identificator);

        date.info_erori.forEach((eroare, index) => {
            // e. verificare existenta fisiere imagine pe disc
            if (eroare.imagine) {
                const caleImagine = path.join(__dirname, date.cale_baza || "", eroare.imagine);
                if (!fs.existsSync(caleImagine)) {
                    console.warn(`[E] REMEDIERI: Imaginea "${eroare.imagine}" (ID: ${eroare.identificator}) nu există la calea: ${caleImagine}`);
                }
            }

            // g. verificare identificatori duplicati
            const restulVectorului = identificatori.slice(index + 1);
            if (restulVectorului.includes(eroare.identificator)) {
                console.warn(`[G] REMEDIERI: Identificator duplicat: "${eroare.identificator}". Propprietati: Titlu: ${eroare.titlu}, Text: ${eroare.text}, Imagine: ${eroare.imagine}`);
            }
        });
    }

    // f. verificare proprietăți duplicate în același obiect
    const blocuri = continutString.match(/\{[^{}]*\}/g) || [];
    
    blocuri.forEach((bloc, i) => {
        const proprietatiGasite = [];
        const regexProp = /"(\w+)"\s*:/g;
        let match;
        
        while ((match = regexProp.exec(bloc)) !== null) {
            const prop = match[1];
            if (proprietatiGasite.includes(prop)) {
                console.warn(`[F] REMEDIERI: Proprietatea "${prop}" apare de mai multe ori în același obiect (blocul ${i + 1} din fișier).`);
            } else {
                proprietatiGasite.push(prop);
            }
        }
    });

    console.log("Verificare JSON finalizata");
}

module.exports = verificareJSON;

obGlobal = {
    obErori:null,
    obImagini:null,
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "backup"),
}

console.log("Folder index.js", __dirname);
console.log("Folder curent (de lucru)", process.cwd());
console.log("Cale fisier", __filename);

let vect_foldere=[ "temp", "logs", "backup", "fisiere_uploadate" ]
for (let folder of vect_foldere){
    let caleFolder=path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(path.join(caleFolder), {recursive:true});   
    }
}

app.use("/resurse", express.static(path.join(__dirname, "resurse")));

app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname,"resurse/ico/favicon.ico"))
});


// app.get("/:a/:b", function(req, res){
    // res.sendFile(path.join(__dirname, "index.html"));
// });

app.get(["/", "/index", "/home"], function(req, res){
   // res.sendFile(path.join(__dirname, "index.html"));
   res.render("pagini/index", {
    ip: req.ip,
   });
});

//app.get("/despre", function(req, res){
  // res.render("pagini/despre");
//});

function initErori(){
    let continut = fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
    let erori=obGlobal.obErori=JSON.parse(continut)
    let err_default=erori.eroare_default
    err_default.imagine=path.join(erori.cale_baza, err_default.imagine)
    for (let eroare of erori.info_erori){
        eroare.imagine=path.join(erori.cale_baza, eroare.imagine)
    }

}
initErori()

function afisareEroare(res, identificator, titlu, text, imagine){
    //TO DO cautam eroarea dupa identificator
    let eroare= obGlobal.obErori.info_erori.find((elem) => 
        elem.identificator==identificator
)
    //daca sunt setate titlu, text, imagine, le folosim, 
    //altfel folosim cele din fisierul json pentru eroarea gasita
    //daca nu o gasim, afisam eroarea default
    let errDefault=obGlobal.obErori.eroare_default;
    if(eroare?.status)
        res.status(eroare.identificator)
    res.render("pagini/eroare",{
        imagine: imagine || eroare?.imagine || errDefault.imagine,
        titlu: titlu || eroare?.titlu || errDefault.titlu,
        text: text || eroare?.text || errDefault.text,
    });

}

app.get("/eroare", function(req, res){
    afisareEroare(res, 404, "Tiltlu!!!")
});

app.get("/cale", function(req, res){
    console.log("Am primit o cerere GET pe /cale");
    res.send("Raspuns la <b style='color: blue;'>cererea</b> GET pe /cale");
});

app.get("/cale2", function(req, res){
    res.write("ceva");
    res.write("altceva");
    res.end();
});

app.get("/cale2/:a/:b", function(req, res){
    res.send(parseInt(req.params.a) + parseInt(req.params.b));
});

app.get("/*pagina", function(req, res){
    console.log("Cale pagina", req.url);
    if (req.url.startsWith("/resurse") && path.extname(req.url)==""){
        afisareEroare(res,403);
        return;
    }
    if (path.extname(req.url)==".ejs"){
        afisareEroare(res,400);
        return;
    }
    try{
        res.render("pagini"+req.url, function(err, rezRandare){
            if (err){
                if (err.message.includes("Failed to lookup view")){
                    afisareEroare(res,404)
                }
                else{
                    afisareEroare(res);
                }
            }
            else{
                res.send(rezRandare);
                console.log("Rezultat randare", rezRandare);
            }
        });
    }
    catch(err){
        if (err.message.includes("Cannot find module")){
            afisareEroare(res,404)
        }
        else{
            afisareEroare(res);
        }
    }
});

app.listen(8080, function() {
    console.log("Serverul a pornit pe portul 8080!");
    
    // APELUL FUNCȚIEI BONUS (Etapa 4)
    verificareJSON(); 
});