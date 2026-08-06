/* ==========================
   WELCOME CURTAIN
   (only present on index.html - guarded so other
   pages that don't have #welcome-screen don't error)
   ==========================*/
const welcomeBtn = document.querySelector("#enter-site-btn");
const welcomeScreen = document.querySelector("#welcome-screen");
const website = document.querySelector("#website");
const leftCurtain = document.querySelector(".curtain-left");
const rightCurtain = document.querySelector(".curtain-right");

if(!welcomeScreen && website) {
  website.style.opacity = "1";
  website.style.visibility = "visible";
}

if (welcomeBtn && welcomeScreen && website && leftCurtain && rightCurtain) {
  if (sessionStorage.getItem("visited")) {
    // ALREADY VISITED THIS SESSION - SKIPSTRAIGHT TO SITE
    welcomeScreen.style.display = "none";
    website.style.opacity = "1";
    website.style.visibility = "visible";
  } else {
    // FIRST VISIT THIS SESSION
    welcomeBtn.addEventListener("click", () => {
      // CLOSE CURTAINS
      leftCurtain.style.animation = "curtainCloseLeft .7s forwards";
      rightCurtain.style.animation = "curtainCloseRight .7s forwards";

      // WAIT UNTIL CURTAINS CLOSE
      setTimeout(() => {
        // SHOW WEBSITE
        website.style.opacity = "1";
        website.style.visibility = "visible";
        // OPEN CURTAINS
        leftCurtain.style.animation = "curtainOpenLeft .8s forwards";
        rightCurtain.style.animation = "curtainOpenRight .8s forwards";
      }, 800);

      setTimeout(() => {
        welcomeScreen.style.display = "none";
      }, 1600);
    });
  }
}

/* ==========================
   GREETING (home page only)
   ==========================*/
function setGreeting(){
  const greeting = document.querySelector("#greeting");
  if (!greeting) return;

  const currentHour = new Date().getHours();
  let message;

  if (currentHour < 12) {
    message = "GOOD MORNING";
  } else if (currentHour < 18) {
    message = "GOOD AFTERNOON";
  } else if (currentHour < 22) {
    message = "GOOD EVENING";
  } else {
    message = "GOOD NIGHT";
  }

  greeting.innerHTML = message;
}

setGreeting();

/* ==========================
   SCROLL-REVEAL
   ==========================*/
const revealElements = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("active");
    }
  });
}, {
  threshold: 0.15
});

revealElements.forEach(element => {
  observer.observe(element);
});

/* ==========================
   MOBILE MENU TOGGLE
   ==========================*/
const menuToggle = document.querySelector("#menu-toggle");
const menu = document.querySelector(".menu");

if (menuToggle && menu) {
  menuToggle.addEventListener("click", () => {
    menu.classList.toggle("is-open");
  });

  // close the mobile menu after a link is tapped, so navigating
  // to a new page doesn't leave it stuck open in the browser cache
  menu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => menu.classList.remove("is-open"));
  });
}

/* ==========================
   ACTIVE NAV LINK
   Highlights whichever menu item matches the current page,
   since we no longer have one scrolling page to track position on.
   ==========================*/
(() => {
  let current = location.pathname.split("/").pop();
  if (current === "") current = "index.html";

  document.querySelectorAll(".menu a").forEach(link => {
    const href = link.getAttribute("href");
    if (href === current) {
      link.classList.add("active");
    }
  });
})();
