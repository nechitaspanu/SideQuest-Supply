const express= require("express");
const path= require("path");
const fs= require("fs"); 
const sass= require("sass");
const { text } = require("stream/consumers");
const sharp= require("sharp");

app= express();
app.set("view engine", "ejs");

// obiect global
obGlobal = {
    obErori:null,
    obImagini:null,
    folderScss: path.join(__dirname, "scss"),
    folderCss: path.join(__dirname, "resurse/style"),
    folderBackup: path.join(__dirname, "backup"),
}

console.log("Folder index.js", __dirname); 
console.log("Folder curent (de lucru)", process.cwd());
console.log("Cale fisier", __filename); // calea completa spre fisierul index.js (inclusiv numele fisierului)

let vect_foldere=[ "temp", "logs", "backup", "fisiere_uploadate" ]
for (let folder of vect_foldere){
    let caleFolder=path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(path.join(caleFolder), {recursive:true});   
    }
}
 
// trimit o cerere catre un folder static (resurse)
app.use("/resurse", express.static(path.join(__dirname, "resurse"))); 

app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname,"resurse/ico/favicon.ico"))
});

app.use("/dist", express.static(path.join(__dirname, "/node_modules/bootstrap/dist")));

// bonus: etapa 4

function verificareJSON() {
    const caleJSON = path.join(__dirname, "resurse/json/erori.json"); 

    // a. verificare existență fisier JSON
    if (!fs.existsSync(caleJSON)) { // verificam daca fisierul exista fizic
        console.error(`[A] EROARE CRITICA: Fisierul ${caleJSON} lipseste!`);
        process.exit(1); 
    }

    const continutString = fs.readFileSync(caleJSON, 'utf8'); // citim continutul fisierului ca string
    let date;

    try {
        date = JSON.parse(continutString); 
    } catch (e) {
        console.error("[EROARE] JSON-ul are erori de sintaxa și nu poate fi parsat!");
        return;
    }

    // b. verificare proprietati obligatorii
    const propObligatorii = ["info_erori", "cale_baza", "eroare_default"]; // verificam daca exista cele 3 proprietati
    propObligatorii.forEach(prop => {
        if (date[prop] === undefined) {
            console.warn(`[B] REMEDIERI: Lipseste proprietatea de bază: "${prop}"`);
        } 
    });

    // c. verificare proprietati in eroare_default
    if (date.eroare_default) {
        ["titlu", "text", "imagine"].forEach(sp => { // verificam daca in eroare_default exista proprietatile titlu, text, imagine
            if (!date.eroare_default[sp]) {
                console.warn(`[C] REMEDIERI: erore_default are proprietatea "${sp}" lipsa sau undefined.`);
            }
        });
    }

    // d. verificare existență folder cale_baza
    if (date.cale_baza) {
        const caleFolder = path.join(__dirname, date.cale_baza); // verificam daca folderul din cale_baza exista fizic (unde tinem pozele pentru erori)
        if (!fs.existsSync(caleFolder)) {
            console.warn(`[D] REMEDIERI: Folderul din cale_baza nu există: ${caleFolder}`);
        }
    }

    // e & g. verificare proprietăți în info_erori și identificatori duplicați
    if (date.info_erori && Array.isArray(date.info_erori)) {
        const identificatori = date.info_erori.map(e => e.identificator); // array cu toti identificatorii din info_erori

        date.info_erori.forEach((eroare, index) => {
            // e. verificare existenta fisiere imagine pe disc
            if (eroare.imagine) {
                const caleImagine = path.join(__dirname, date.cale_baza || "", eroare.imagine); // construim calea completa catre imaginea pentru aceasta eroare, folosind cale_baza ca folder de baza
                if (!fs.existsSync(caleImagine)) { // verificam daca imaginea pentru aceasta eroare exista fizic pe disc
                    console.warn(`[E] REMEDIERI: Imaginea "${eroare.imagine}" (ID: ${eroare.identificator}) nu există la calea: ${caleImagine}`);
                }
            }

            // g. verificare identificatori duplicati
            const restulVectorului = identificatori.slice(index + 1); // taiem vectorul incepand de la pozitia urmatoare pentru a verifica daca mai apare acelasi identificator
            if (restulVectorului.includes(eroare.identificator)) { // verificam daca am definit 2 erori cu acelasi identificator
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
            const prop = match[1]; // numele proprietatii extrasa din regex
            if (proprietatiGasite.includes(prop)) { // daca am mai gasit aceasta proprietate in acelasi bloc, inseamna ca e duplicata
                console.warn(`[F] REMEDIERI: Proprietatea "${prop}" apare de mai multe ori în același obiect (blocul ${i + 1} din fișier).`);
            } else { 
                proprietatiGasite.push(prop);
            }
        }
    });

    console.log("Verificare JSON finalizata");
}

module.exports = verificareJSON;


// app.get("/:a/:b", function(req, res){
    // res.sendFile(path.join(__dirname, "index.html"));
// });

app.get(["/", "/index", "/home"], function(req, res){
   const datele = fs.readFileSync(path.join(__dirname, "resurse/json/galerie.json"), "utf8");
   const imagini = JSON.parse(datele).imagini;
   res.render("pagini/index", {
    ip: req.ip, 
    imagini: imagini,
    cale: "/resurse/imagini/galerie/",
   });
});

// pentru ca pagina sa fie accesibila din mai multe cai, FACEM VECTOR
/*app.get(["/", "/index", "/home"], function(req, res){
   // res.render("pagini/index", {
}); */

//app.get("/despre", function(req, res){
  // res.render("pagini/despre");
//});

// functie de citire pentru erori
function initErori(){
    // functie sincrona, pana nu s-a citit fisierul nu trec mai departe
    let continut = fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
    let erori=obGlobal.obErori=JSON.parse(continut) // transforma string urile in obiect; returneaza obiectul
    let err_default=erori.eroare_default
    err_default.imagine=path.join(erori.cale_baza, err_default.imagine) // concatenare cale baza cu nume imagine pentru eroarea default
    for (let eroare of erori.info_erori){
        eroare.imagine=path.join(erori.cale_baza, eroare.imagine) // concatenare cale baza cu nume imagine pentru fiecare eroare din vectorul info_erori
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
    if(eroare?.status) // verifica daca eroarea exista si are proprietatea status true
        res.status(eroare.identificator) // trimite codul
    res.render("pagini/eroare",{
        imagine: imagine || eroare?.imagine || errDefault.imagine, // verifica daca imaginea a fost setata ca parametru, 
                                                                  // daca nu, verifica daca eroarea gasita are o imagine, 
                                                                 // daca nu, foloseste imaginea default
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

// etapa 5 - compilarea scss in css

//punctele b) si c)
function compileazaScss(caleScss, caleCss){
    console.log(">>> Încerc să compilez:", caleScss);
    if(!caleCss){
        let numeFisExt = path.basename(caleScss); 
        let cuvinteNume = numeFisExt.split(".");
        
        cuvinteNume.pop(); // scoate extensia .scss
        
        let numeFis = cuvinteNume.join("."); 
        caleCss = numeFis + ".css";
    }
    
    // transformam in cale absoluta daca nu e deja (daca e relativa)
    if (!path.isAbsolute(caleScss))
        caleScss = path.join(obGlobal.folderScss, caleScss);
    if (!path.isAbsolute(caleCss))
        caleCss = path.join(obGlobal.folderCss, caleCss);

    // cream folderul de output daca nu exista
    if (!fs.existsSync(obGlobal.folderCss))
        fs.mkdirSync(obGlobal.folderCss, {recursive: true}); 
    
    // pregatim folderul de backup (daca nu exista, il cream)
    let caleBackup = path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup, {recursive:true});
    }
    
    let numeFisCss = path.basename(caleCss);
    if (fs.existsSync(caleCss)){
        // facem copia de siguranta 
        fs.copyFileSync(caleCss, path.join(caleBackup, numeFisCss));
    }

    // try catch pentru a nu crapa
    try {
        let rez = sass.compile(caleScss, {"sourceMap":true}); 
        fs.writeFileSync(caleCss, rez.css);
        console.log("S-a compilat SCSS -> CSS.");
    } catch (err) {
        console.error("Eroare la compilarea SCSS (probabil ai o greseala de sintaxa în fisier):", err.message);
    }
}

// d. compilare initiala 
if (fs.existsSync(obGlobal.folderScss)) {
    const fisiere = fs.readdirSync(obGlobal.folderScss);
    for (let fisier of fisiere) {
        if (fisier.endsWith(".scss")) {
            compileazaScss(fisier);
        }
    }
}

// e. compilare pe parcurs
if (fs.existsSync(obGlobal.folderScss)) {
    fs.watch(obGlobal.folderScss, (eventType, fisier) => {
        if (fisier && fisier.endsWith(".scss") && (eventType === "change" || eventType === "rename")) {
            const caleCompleta = path.join(obGlobal.folderScss, fisier);
            if (fs.existsSync(caleCompleta)) {
                console.log(`[WATCH] Se recompileaza: ${fisier}`);
                compileazaScss(fisier);
            }
        }
    });
}

// etapa 4
app.get("/*pagina", function(req, res){ // orice cerere
    console.log("Cale pagina", req.url); // afiseaza calea ceruta in consola
    if (req.url.startsWith("/resurse") && path.extname(req.url)==""){ // daca cererea e pentru resurse si nu are extensie, e posibil sa fie o incercare de a accesa un folder
        afisareEroare(res,403);
        return;
    }
    if (path.extname(req.url)==".ejs"){
        afisareEroare(res,400); // daca cererea e pentru un fisier ejs, nu vrem sa-l trimitem clientului, deci afisam eroare 400 
        return;
    }
    try{
        res.render("pagini"+req.url, function(err, rezRandare){ // incearca sa randeze orice pagina ceruta, daca nu exista, va aparea o eroare pe care o prindem in callback
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
        if (err.message.includes("Cannot find module")){ // prinde erorile de tipul "Cannot find module '...'", care apar cand nu gaseste pagina ceruta, si afisez eroare 404
            afisareEroare(res,404)
        }
        else{
            afisareEroare(res);
        }
    }
});

app.listen(8080, function() {
    console.log("Serverul a pornit pe portul 8080!");
    
    verificareJSON(); 
});