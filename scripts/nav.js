const nav = document.getElementsByTagName("nav")[0];
const list = document.getElementsByClassName("nav__link-list")[0];
const openButton = document.getElementById("openButton");
var isOpen = false;

// Help from https://stackoverflow.com/questions/11741070/how-to-get-the-element-clicked-on
function addHidden(event) {
  event.target.classList.add("hidden");
  event.target.removeEventListener("transitionend", addHidden);
}
function addNavHidden(event) {
  event.target.classList.add("nav--hidden");
  event.target.removeEventListener("transitionend", addNavHidden);
}

function toggleMenu() {
  // Approach to animate hidden elements from https://cloudfour.com/thinks/transitioning-hidden-elements/
  if (!isOpen) {
    // Directly remove the hidden class to enable transitions
    list.classList.remove("hidden");
    nav.classList.remove("nav--hidden");
    // Update to make browser realize it isn't hidden again
    list.offsetHeight;
  } else {
    // Wait for the transition to finish, then add back the hidden class.
    list.addEventListener("transitionend", addHidden);
    nav.addEventListener("transitionend", addNavHidden);
  }
  isOpen = !isOpen;

  nav.classList.toggle("nav--active");
  list.classList.toggle("nav__link-list--active");
  openButton.classList.toggle("nav__open-button--active");
}

// Thanks https://www.youtube.com/watch?v=w-SpaTBf-j0 and https://stackoverflow.com/questions/23744605/javascript-get-x-and-y-coordinates-on-mouse-click
document.addEventListener("click", handleClickOutside);
function handleClickOutside(event) {
  // If the menu is open there is nothing to potentially close.
  if (!isOpen) {
    return;
  }

  // Now that the menu opens, if the user clicks outside of the menu then close the menu.
  let y = event.clientY;
  let topOfMenu = window.innerHeight - nav.offsetHeight - list.offsetHeight;
  if (y < topOfMenu) {
    toggleMenu();
  }
}

