document.addEventListener("DOMContentLoaded", function() {
    const btn = document.getElementById("btn-tema");
    const icon = document.getElementById("icon-tema");

    if (localStorage.getItem("tema") === "dark") {
        icon.classList.remove("bi-sun-fill");
        icon.classList.add("bi-moon-fill");
    }

    btn.addEventListener("click", function() {
        const isDark = document.documentElement.classList.toggle("tema-blue-pink"); // toggle adauga clasa daca nu exista
                                                                                    // sau o elimina daca exista
        
        if (isDark) {
            localStorage.setItem("tema", "dark"); 
            icon.classList.remove("bi-sun-fill");
            icon.classList.add("bi-moon-fill");
        } else {
            localStorage.setItem("tema", "light");
            icon.classList.remove("bi-moon-fill");
            icon.classList.add("bi-sun-fill");
        }
    });
});