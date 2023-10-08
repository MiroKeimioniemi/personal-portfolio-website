const hamburger = document.querySelector(".hamburger");
const mobileNav = document.querySelector(".mobile-nav");
const dropdownMenu = document.querySelector(".dropdown-menu");

document.onclick = (element) => {

    if (element.target.classList.contains("hamburger")) {
        mobileNav.classList.toggle("hidden");

    } else if (!mobileNav.classList.contains("hidden") && !element.target.classList.contains("mobile-nav")) {
        mobileNav.classList.toggle("hidden");
    
    } else if (element.target.classList.contains("dropdown-triangle-content")) {
        dropdownMenu.classList.toggle("hidden");

    } else if ((!dropdownMenu.classList.contains("hidden") && !element.target.classList.contains("dropdown-triangle-content")) || element.target.classList.contains("dropdown-triangle-inv-content")) {
        dropdownMenu.classList.toggle("hidden");
    };

}