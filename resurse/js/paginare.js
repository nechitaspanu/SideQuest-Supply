document.addEventListener("DOMContentLoaded", function() { // asteptam pana se incarca tot continutul html

    const K = 6; // cate produse pe pagina

    const containerPaginare = document.getElementById("paginare"); // gasim paginare in html

    // functie care afiseaza doar produsele de pe pagina P
    function afiseazaPagina(P) {
        // luam doar produsele vizibile si le punem intr un array
        const toate = Array.from(document.querySelectorAll(".produs"));

        const start = (P - 1) * K;  // primul indice de afisat
        const sfarsit = P * K - 1;  // ultimul indice de afisat

        toate.forEach(function(produs, index) {
            if (index >= start && index <= sfarsit) {
                produs.style.display = "";  // afiseaza
            } else {
                produs.style.display = "none";  // ascunde
            }
        });

        // marcheaza linkul activ
        document.querySelectorAll("#paginare button").forEach(function(btn) {
            btn.classList.remove("pagina-activa"); // elimina clasa de pe toate butoanele
        });
        const btnActiv = document.querySelector(`#paginare button[data-pagina='${P}']`);
        if (btnActiv) btnActiv.classList.add("pagina-activa"); // o punem pe butonul clasei curente
    }

    // functie care genereaza linkurile de paginare
    function genereazaLinkuri() {
        const toate = document.querySelectorAll(".produs");
        const N = toate.length;       // total produse
        const NRL = Math.ceil(N / K); // numar de linkuri

        containerPaginare.innerHTML = ""; // golim containerul

        // daca avem o singura pagina sau mai putin, nu afisam paginare
        if (NRL <= 1) return;

        for (let i = 1; i <= NRL; i++) {
            const btn = document.createElement("button");
            btn.textContent = i; // ii punem numarul paginii ca text
            btn.dataset.pagina = i;
            btn.className = "btn-paginare"; // adaugam o clasa pentru stilizare
            btn.addEventListener("click", function() { // cand dam cick, afisam pagina corespunzatoare
                afiseazaPagina(i);
            });
            containerPaginare.appendChild(btn); // adaugam butonul in container
        }
    }

    // la incarcare: genereaza linkuri si afiseaza prima pagina
    genereazaLinkuri();
    afiseazaPagina(1);

});