// O ZI in milisecunde
const O_ZI = 24 * 60 * 60 * 1000;

// citeste starea din localStorage
function getStareComparare() {
    const raw = localStorage.getItem("comparare"); // citeste starea din localStorage
    try {
        return JSON.parse(raw); // transforma stringul inapoi in obiect
    } catch {
        return null;
    }
}

// salveaza starea in localStorage
function setStareComparare(stare) {
    localStorage.setItem("comparare", JSON.stringify(stare)); // salveaza starea
    //JSOn.stringyfy transforma obiectul in string
}

// sterge complet starea
// starea e un obiect care contine un array de produse si un timestamp (data ultimei modificari)
function stergeStareComparare() {
    localStorage.removeItem("comparare"); // sterge starea
}

// 4. verifica daca starea a expirat (mai mult de o zi de la ultimul click)
function stareExpirata(stare) {
    if (!stare || !stare.timestamp) return true;
    return (Date.now() - stare.timestamp) > O_ZI; // din momentul actual scadem timetstamp-ul salvat
}

//  creare / actualizare container de comparare
function actualizeazaContainer() {
    let stare = getStareComparare();

    // daca a expirat, stergem
    if (stare && stareExpirata(stare)) {
        stergeStareComparare(); 
        stare = null;
    }

    // sterge containerul existent (il recream)
    const vechi = document.getElementById("container-comparare");
    if (vechi) vechi.remove();

    // daca nu sunt produse, nu afisam nimic, doar actualizam butoanele
    if (!stare || !stare.produse || stare.produse.length === 0) {
        actualizeazaButoane();
        return;
    }

    // cream containerul
    const container = document.createElement("div");
    container.id = "container-comparare";
    container.className = "container-comparare-stil";  // ← adauga clasa
    container.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    padding: 15px 20px;
    border-radius: 10px;
    z-index: 9999;
    box-shadow: 0 4px 15px rgba(0,0,0,0.4);
    max-width: 350px;
`;

    let html = "<strong>Comparare produse:</strong><br>";

    stare.produse.forEach(function(prod) { // pentru fiecare produs din stare, adaugam numele si butonul de stergere
        html += `
            <div style="margin:5px 0; display:flex; justify-content:space-between; align-items:center; gap:10px;">
                <span>${prod.nume}</span>
                <button class="btn-sterge-comparare" data-id="${prod.id}" 
                        style="background:#fff; color:#7972c8; border:none; border-radius:4px; padding:2px 8px; cursor:pointer;">
                    ✕
                </button>
            </div>
        `;
    });

    // daca sunt 2 produse, butonul "afiseaza"
    if (stare.produse.length === 2) {
        html += `
            <button id="btn-afiseaza-comparare" 
                    style="margin-top:8px; width:100%; background:#fff; color:#7972c8; border:none; border-radius:6px; padding:6px; cursor:pointer; font-weight:bold;">
                afișează
            </button>
        `;
    }

    container.innerHTML = html; // punem html-ul in container
    document.body.appendChild(container); // punem containerul in pagina

    // listener pentru butoanele de stergere
    container.querySelectorAll(".btn-sterge-comparare").forEach(function(btn) { // pentru fiecare X
        btn.addEventListener("click", function() {
            const id = this.dataset.id;
            stergeProdusDinComparare(id);
        });
    });

    // listener pentru butonul afiseaza
    const btnAfiseaza = document.getElementById("btn-afiseaza-comparare");
    if (btnAfiseaza) {
        btnAfiseaza.addEventListener("click", afiseazaComparare);
    }

    actualizeazaButoane();
}

//  adaugare produs la comparare
function adaugaProdusLaComparare(id, nume) {
    let stare = getStareComparare();

    if (!stare || stareExpirata(stare)) {
        stare = { produse: [], timestamp: Date.now() }; //cream una noua daca nu exista sau a expirat
    }

    // verificam daca exista deja
    if (stare.produse.some(p => p.id == id)) return;

    // maxim 2 produse
    if (stare.produse.length >= 2) return;

    stare.produse.push({ id: id, nume: nume }); // adaugam profusul la stare
    stare.timestamp = Date.now(); // reseteaza timer-ul de o zi

    setStareComparare(stare);
    actualizeazaContainer();
}

//  stergere produs din comparare
function stergeProdusDinComparare(id) {
    let stare = getStareComparare();
    if (!stare) return;

    stare.produse = stare.produse.filter(p => p.id != id); // pastreaza doar produsele care nu au id-ul dat

    // daca nu mai avem produse, stergem complet starea, altfel o actualizam
    if (stare.produse.length === 0) {
        stergeStareComparare();
    } else {
        setStareComparare(stare);
    }

    actualizeazaContainer();
}

//  activare / dezactivare butoane "compara"
function actualizeazaButoane() {
    const stare = getStareComparare();
    const numarProduse = (stare && stare.produse) ? stare.produse.length : 0;

    document.querySelectorAll(".btn-compara").forEach(function(btn) {
        if (numarProduse >= 2) {
            // dezactivam toate butoanele
            btn.disabled = true;
            btn.title = "ștergeți un produs din lista de comparare"; // mesaj la hover
        } else {
            btn.disabled = false; // le reactivam
            btn.title = "compară acest produs";
        }
    });
}

function afiseazaComparare() {
    const stare = getStareComparare();
    if (!stare || stare.produse.length !== 2) return;

    const id1 = stare.produse[0].id;
    const id2 = stare.produse[1].id;

    // cerem datele complete de la server
    Promise.all([ // asteapta sa vina ambele raspunsuri
        fetch("/api/produs/" + id1).then(r => r.json()),
        fetch("/api/produs/" + id2).then(r => r.json())
    ]).then(function([p1, p2]) { // p1, p2 sunt datele produselor 

        const fereastra = window.open("", "_blank", "width=700,height=600"); // deschide o fereastra noua

        const caracteristici = [
            ["Nume", "nume"],
            ["Preț", "pret"],
            ["Gen", "gen"],
            ["Platformă", "platforma"],
            ["Scor Metacritic", "scor_metacritic"],
            ["PEGI", "varsta_minima"],
            ["Limbi disponibile", "limbi_disponibile"],
            ["Multiplayer online", "multiplayer_online"],
            ["Descriere", "descriere"]
        ];

        let randuri = ""; 
        caracteristici.forEach(function(c) {
            let val1 = p1[c[1]];
            let val2 = p2[c[1]];
            if (c[1] === "multiplayer_online") { // pentru boolean, afisam Da/Nu in loc de true/false
                val1 = val1 ? "Da" : "Nu";
                val2 = val2 ? "Da" : "Nu";
            }
            randuri += ` 
                <tr>
                    <th style="text-align:left; padding:8px; border:1px solid #ccc; background:#f0f0f0;">${c[0]}</th>
                    <td style="padding:8px; border:1px solid #ccc;">${val1}</td>
                    <td style="padding:8px; border:1px solid #ccc;">${val2}</td>
                </tr>
            `;
        }); // genereaza randurile pentru tabel

        fereastra.document.write(`
            <html>
            <head>
                <title>Comparare produse</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    table { border-collapse: collapse; width: 100%; }
                    h1 { text-align: center; }
                </style>
            </head>
            <body>
                <h1>Comparare produse</h1>
                <table>
                    <tr>
                        <th style="padding:8px; border:1px solid #ccc; background:#7972c8; color:white;">Caracteristică</th>
                        <th style="padding:8px; border:1px solid #ccc; background:#7972c8; color:white;">${p1.nume}</th>
                        <th style="padding:8px; border:1px solid #ccc; background:#7972c8; color:white;">${p2.nume}</th>
                    </tr>
                    ${randuri}
                </table>
            </body>
            </html>
        `);
        fereastra.document.close();
    });
}

//  atasare listeneri pe butoanele "compara"
document.addEventListener("DOMContentLoaded", function() {

    document.querySelectorAll(".btn-compara").forEach(function(btn) {
        btn.addEventListener("click", function() { // atasezi click pe fiecare buton compara
            const id = this.dataset.id;
            const nume = this.dataset.nume;
            adaugaProdusLaComparare(id, nume); // adauga produsul la comparare
        });
    });

    // afisam containerul daca exista stare salvata
    actualizeazaContainer();
});