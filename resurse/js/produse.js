document.addEventListener("DOMContentLoaded", function() {

    // bonus 7 - inlocuieste diacriticele cu litere simple
    function faraDiacritice(text) { // ia un text si returneaza acelasi text fara diacritice
        return text
            .replace(/ă/g, "a").replace(/Ă/g, "A") 
            .replace(/â/g, "a").replace(/Â/g, "A")
            .replace(/î/g, "i").replace(/Î/g, "I")
            .replace(/ș/g, "s").replace(/Ș/g, "S")
            .replace(/ț/g, "t").replace(/Ț/g, "T");
}

    // range slider - afiseaza valoarea selectata
    const inpPret = document.getElementById("inp-pret");
    const infoRange = document.getElementById("infoRange");

    inpPret.addEventListener("input", function() {
        infoRange.textContent = "(" + inpPret.value + ")"; // actualizeaza textul de langa slider
    });

    // FUNCTIE VALIDARE
    function valideaza() {
    let valid = true;

    // validare input text - nu accepta cifre
    const nume = document.getElementById("inp-nume").value.trim(); // am preluat valoarea si am eliminat spatiile de la inceput si sfarsit
    const inpNume = document.getElementById("inp-nume");
    if (nume && /\d/.test(nume)) { // daca numele nu e gol si contine cifre
        inpNume.style.border = "2px solid red";
        alert("Numele nu poate conține cifre!");
        valid = false;
    } else {
        inpNume.style.border = "";
    }

    // validare textarea - daca e completat, sa nu fie doar spatii
        const descriere = document.getElementById("inp-descriere").value;
        const inpDescriere = document.getElementById("inp-descriere");
        if (descriere && descriere.trim().length === 0) {
            inpDescriere.classList.add("is-invalid");
            valid = false;
        } else {
            inpDescriere.classList.remove("is-invalid");
        }

    // validare scor metacritic - sa fie intre 0 si 100
    const scor = document.getElementById("inp-scor").value;
    const inpScor = document.getElementById("inp-scor");
    if (scor && (parseInt(scor) < 0 || parseInt(scor) > 100)) {
        inpScor.style.border = "2px solid red";
        alert("Scorul Metacritic trebuie să fie între 0 și 100!");
        valid = false;
    } else {
        inpScor.style.border = "";
    }

    // validare checkboxuri limbi - cel putin una bifata
    const limbiChecked = document.querySelectorAll(".chk-limba:checked");
    if (limbiChecked.length === 0) {
        alert("Trebuie să selectezi cel puțin o limbă!");
        valid = false;
    }

    // validare select multiplu PEGI - cel putin una selectata
    const pegiSelectate = document.getElementById("inp-pegi").selectedOptions; 
    if (pegiSelectate.length === 0) {
        alert("Trebuie să selectezi cel puțin o categorie PEGI!");
        valid = false;
    }

    return valid;
}

    document.getElementById("inp-descriere").addEventListener("input", function () {
        if (this.value.trim().length > 0 || this.value.length === 0) {
            this.classList.remove("is-invalid");
        }
    });

    // FILTRARE
    document.getElementById("filtrare").addEventListener("click", function() {
        if (!valideaza()) return;

        const nume = faraDiacritice(document.getElementById("inp-nume").value.toLowerCase().trim()); //preluam valoarea, eliminam spatiile de la inceput si sfarsit, o transformam in litere mici si inlocuim diacriticele
        const descriere = faraDiacritice(document.getElementById("inp-descriere").value.toLowerCase().trim());
        const pretMin = parseFloat(inpPret.value);
        const platforma = document.getElementById("inp-platforma").value;
        const scor = document.getElementById("inp-scor").value;

        // radio multiplayer
        const multiSelectat = document.querySelector("input[name='gr_multi']:checked").value;

        // checkboxuri limbi
        const limbiChecked = Array.from(document.querySelectorAll(".chk-limba:checked"))
                                  .map(cb => cb.value.toLowerCase());

        // select multiplu PEGI
        const pegiMultiplu = Array.from(document.getElementById("inp-pegi").selectedOptions) 
                                  .map(o => o.value);  

        document.querySelectorAll(".produs").forEach(function(articol) {
            if (articol.dataset.pinned === "true") return; // ignora articolele pinned la filtrare

            const numeArt = faraDiacritice(articol.querySelector(".val-nume").textContent.toLowerCase());
            const descriereArt = faraDiacritice(articol.querySelector(".descriere").textContent.toLowerCase());
            const pretArt = parseFloat(articol.querySelector(".val-pret").textContent);
            const platformaArt = articol.querySelector(".val-platforma").textContent.trim();
            const multiArt = articol.querySelector(".val-multiplayer").textContent.trim();
            const limbiArt = articol.querySelector(".val-limbi").textContent.toLowerCase();
            const pegiArt = articol.querySelector(".val-varsta").textContent.replace("+","").trim();
            const scorArt = parseInt(articol.querySelector(".val-scor") ? 
                            articol.querySelector(".val-scor").textContent : "0");

            let vizibil = true;

            // 1. filtru nume
            if (nume && !numeArt.includes(nume)) vizibil = false;

            // 2. filtru pret maxim
            if (pretArt > pretMin) vizibil = false;

            // 3. filtru platforma (select simplu)
            if (platforma !== "toate" && platformaArt !== platforma) vizibil = false;

            // 4. filtru descriere (textarea - cuvinte cheie separate prin virgula)
            if (descriere) {
                const cuvinte = descriere.split(",").map(c => c.trim()).filter(c => c.length > 0);
                const gasit = cuvinte.some(cuv => descriereArt.includes(cuv));
                if (!gasit) vizibil = false;
            }

            // 5. filtru scor metacritic (datalist)
            if (scor && scorArt < parseInt(scor)) vizibil = false;

            // 6. filtru multiplayer (radio)
            if (multiSelectat === "da" && multiArt !== "Da") vizibil = false;
            if (multiSelectat === "nu" && multiArt !== "Nu") vizibil = false;

            // 7. filtru limbi (checkboxuri - minim una bifata)
            if (limbiChecked.length > 0) {
                const areLimba = limbiChecked.some(limba => limbiArt.includes(limba));
                if (!areLimba) vizibil = false;
            }

            // 8. filtru PEGI (select multiplu)
            if (pegiMultiplu.length > 0) {
                if (!pegiMultiplu.includes(pegiArt)) vizibil = false; 
                                                                      
            }

            articol.style.display = vizibil ? "" : "none"; // unde se ascund/afiseaza elementele de filtrare
                                                           // vizibil = true => display normal
                                                           // vizibil = false => display none
        });
    });

    // SORTARE
    function numarLimbi(articol) {
        const limbi = articol.querySelector(".val-limbi").textContent; // 
        return limbi.split(",").length; // taie virgula; length e numarul de limbi
    }

    function getPret(articol) {
        return parseFloat(articol.querySelector(".val-pret").textContent); // preia pretul ca numar
    }

    function sorteaza(crescator) {
        const grid = document.querySelector(".grid-produse"); //containerul care tine produsele
        const articole = Array.from(grid.querySelectorAll(".produs")); // punem produsele intr un array ca sa le putem sorta

        articole.sort(function(a, b) { // returneaza < 0 daca a inainte de b, > 0 daca b inainte de a, 0 daca egal
            const pretA = getPret(a);
            const pretB = getPret(b);

            if (pretA !== pretB) {
                return crescator ? pretA - pretB : pretB - pretA;
            }

            const limbiA = numarLimbi(a);
            const limbiB = numarLimbi(b);
            return crescator ? limbiA - limbiB : limbiB - limbiA;
        });

        articole.forEach(art => grid.appendChild(art)); 
                                                        
    }

    document.getElementById("sortCrescPret").addEventListener("click", function() {
        if (!valideaza()) return;
        sorteaza(true);
    });

    document.getElementById("sortDescrescPret").addEventListener("click", function() {
        if (!valideaza()) return;
        sorteaza(false);
    });

    // CALCULARE - suma preturilor produselor vizibile 
    function calculeazaSuma() {
        const articoleVizibile = Array.from(document.querySelectorAll(".produs"))
            .filter(a => a.style.display !== "none");

        const suma = articoleVizibile.reduce(function (acc, art) { 
            return acc + parseFloat(art.querySelector(".val-pret").textContent); // acc tine suma 
        }, 0);

        const div = document.createElement("div"); 
        div.textContent = "Suma prețurilor: " + suma.toFixed(2) + " lei"; // toFixed(2) limiteaza la 2 zecimale
        div.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background-color: #4a0080;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        font-size: 18px;
        font-weight: bold;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    `;
        document.body.appendChild(div);

        setTimeout(function () {
            document.body.removeChild(div);
        }, 2000);
    }

    document.addEventListener("keydown", function (e) {
        if (e.altKey && e.key === "c") {
            calculeazaSuma();
        }
    });

    // click pe butonul CALCULEAZA
    document.getElementById("calculeaza").addEventListener("click", function () {
        calculeazaSuma();
    });


    // RESETARE
    document.getElementById("resetare").addEventListener("click", function() {

    const confirmat = confirm("Ești sigur că vrei să resetezi toate filtrele?");
    
    if (!confirmat) return;

    document.getElementById("inp-nume").value = ""; 
    inpPret.value = 350;
    infoRange.textContent = "(350)";
    document.getElementById("inp-platforma").value = "toate";
    document.getElementById("inp-descriere").value = "";
    document.getElementById("inp-scor").value = "";

    // reset radio multiplayer
    document.querySelector("input[name='gr_multi'][value='toate']").checked = true;

    // reset checkboxuri limbi - toate bifate
    document.querySelectorAll(".chk-limba").forEach(cb => cb.checked = true);

    // reset select multiplu PEGI - toate selectate
    Array.from(document.getElementById("inp-pegi").options)
         .forEach(o => o.selected = true);

    const grid = document.querySelector(".grid-produse"); 
    const articole = Array.from(grid.querySelectorAll(".produs")); 
    
    articole.sort(function(a, b) {
        const idA = parseInt(a.id.replace("ent", ""));
        const idB = parseInt(b.id.replace("ent", ""));
        return idA - idB; 
    });

    articole.forEach(function(art) { 
        art.style.display = ""; 
        grid.appendChild(art); 
    });
});

// BONUS 6: BUTOANE PER PRODUS
// la incarcare pagina - aplica sessionStorage
document.querySelectorAll(".produs").forEach(function(articol) {
    const id = articol.id; 
    if (sessionStorage.getItem("sters-" + id) === "true") {
        articol.remove(); // scos complet din DOM
    }
});
// sessionSTorage tine date doar in tabul curent, daca inchizi tabul, datele se pierd. Daca vrei sa pastrezi datele chiar si dupa inchiderea browserului, folosesti localStorage in loc de sessionStorage
// butoane pin, ascunde, sterge
document.querySelectorAll(".produs").forEach(function(articol) { // iei toate produsele
    // querySelector cauta elementul cu clasa btn-pin in articolul curent
    const btnPin = articol.querySelector(".btn-pin");
    const btnAscunde = articol.querySelector(".btn-ascunde");
    const btnSterge = articol.querySelector(".btn-sterge-sesiune");
    const id = articol.id; // id-ul produsului

    // BUTON 1: PIN
    btnPin.addEventListener("click", function() {
        const estePin = articol.classList.toggle("pinned");
        btnPin.classList.toggle("activ", estePin); // retinem rezultatul
        // daca e pinned, adaugam atribut ca sa il ignoram la filtrare
        articol.dataset.pinned = estePin ? "true" : "false"; // nu ascunde produsul la filtrae
    });

    // BUTON 2: ASCUNDE TEMPORAR 
    btnAscunde.addEventListener("click", function() {
        articol.style.display = "none";
        // va reaparea la urmatoarea filtrare/resetare daca se potriveste
    });

    // BUTON 3: STERGE DIN SESIUNE
    btnSterge.addEventListener("click", function() {
        const confirmat = confirm("Ești sigur că vrei să ascunzi acest produs pentru toată sesiunea?");
        if (confirmat) {
            sessionStorage.setItem("sters-" + id, "true"); // salveaza id-ul in memoria tabului
            articol.remove();
        }
    });
});

});
