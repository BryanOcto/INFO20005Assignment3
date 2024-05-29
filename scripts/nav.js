const nav = document.getElementsByTagName("nav")[0];
const list = document.getElementsByClassName("nav__link-list")[0];
const openButton = document.getElementById("openButton");
const searchSection = document.getElementsByClassName("search")[0];
// const searchGroup = document.getElementsByClassName("search__group")[0];
const searchIntro = document.getElementsByClassName("search__group__intro")[0];
const searchResults = document.getElementsByClassName("search__group__results")[0];
const searchBar = document.getElementsByClassName("search__input")[0];
// desktopSmallWidth = 50em = 50 * 1rem = 50 * 16px
// desktopWidth = 85em = 85 * 1rem = 85 * 20px;
const desktopSmallWidth = 50 * 16;
const desktopWidth = 85 * 20;

// APPROACH: Only one of these can be open at a time.
var navIsVisible = true;
var searchIsVisible = false;

var menuIsOpen = false;
var searchResultsIsShown = false;

// Help from https://stackoverflow.com/questions/11741070/how-to-get-the-element-clicked-on
function addHidden(event) {
  event.target.classList.add("hidden");
  event.target.removeEventListener("transitionend", addHidden);
}
function addHiddenSwitch(event) {
  event.target.classList.add("hidden");
  event.target.removeEventListener("transitionend", addHiddenSwitch);
  nav.classList.remove("hidden");
}
function addNavHidden(event) {
  event.target.classList.add("nav--hidden");
  event.target.removeEventListener("transitionend", addNavHidden);
}

function toggleMenu() {
  // Approach to animate hidden elements from https://cloudfour.com/thinks/transitioning-hidden-elements/
  if (!menuIsOpen) {
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
  menuIsOpen = !menuIsOpen;

  nav.classList.toggle("nav--active");
  list.classList.toggle("nav__link-list--active");
  openButton.classList.toggle("nav__open-button--active");
}

function navToSearch() {
  // If search is already opened, then don't do anything
  if (searchIsVisible) {
    return;
  }

  nav.classList.add("hidden");

  searchSection.classList.remove("hidden");
  searchSection.offsetHeight;
  searchSection.classList.add("search--active");
  // Show back what was hidden before to get the transition
  if (searchResultsIsShown) {
    showSearchResults();
  } else {
    showSearchIntro();
  }

  navIsVisible = false;
  searchIsVisible = true;
}

function searchToNav() {
  // If nav is already opened, then don't do anything
  if (navIsVisible) {
    return;
  }

  // Close the menu first before opening
  if (menuIsOpen) {
    toggleMenu();
  }

  // Hide what is appropriate to get the transition
  if (searchResultsIsShown) {
    hideSearchResults();
    // still want to bring up the search results after hiding away
    searchResultsIsShown = true;
  } else {
    hideSearchIntro();
  }

  searchSection.classList.remove("search--active");
  searchSection.addEventListener("transitionend", addHiddenSwitch);

  navIsVisible = true;
  searchIsVisible = false;
}


// Thanks https://www.youtube.com/watch?v=w-SpaTBf-j0 and https://stackoverflow.com/questions/23744605/javascript-get-x-and-y-coordinates-on-mouse-click
document.addEventListener("click", handleClickOutside);
function handleClickOutside(event) {
  // If the menu isn't open and if the search isn't visible there isn't anything to close.
  if (!menuIsOpen && !searchIsVisible) {
    return;
  }

  let y = event.clientY;

  // Now that the menu opens, if the user clicks outside of the menu then close the menu.
  if (menuIsOpen) {
    let topOfMenu = window.innerHeight - nav.offsetHeight - list.offsetHeight;
    if (y < topOfMenu) {
      toggleMenu();
    }
  }

  // If the search is visible, if the user clicks outside of the search then close the search.
  if (searchIsVisible) {
    let windowWidth = window.innerWidth;
    let searchEdge;
    // Mobile, else desktop, where the navigation bar is flipped to the top.
    if (windowWidth < desktopSmallWidth) {
      searchEdge = window.innerHeight - searchSection.offsetHeight - Math.max(searchIntro.offsetHeight, searchResults.offsetHeight);
      if (y < searchEdge) {
        searchToNav();
      }
    } else {
      searchEdge = searchSection.offsetHeight + Math.max(searchIntro.offsetHeight, searchResults.offsetHeight);
      console.log(y);
      console.log(searchEdge);
      if (y > searchEdge) {
        searchToNav();
      }
    }
  }
}

// Thanks https://www.youtube.com/watch?v=TlP5WIxVirU for the approach.
// Implements mock live searching
searchBar.addEventListener("input", handleInput);
function handleInput(event) {
  // If the search area is not open there's nothing to do
  if (!searchIsVisible) {
    return;
  }

  const query = event.target.value;

  // Just searched so show results
  if (!searchResultsIsShown && query !== "") {
    hideSearchIntro();
    showSearchResults();
    return;
  }

  // Search bar is empty and results is shown so go back to intro
  if (searchResultsIsShown && query === "") {
    hideSearchResults();
    showSearchIntro();
    return;
  }
}

function hideSearchIntro() {
  searchIntro.addEventListener("transitionend", addHidden);
  searchIntro.classList.remove("search__group__intro--active");
}
function hideSearchResults() {
  searchResults.addEventListener("transitionend", addHidden);
  searchResults.classList.remove("search__group__results--active");

  searchResultsIsShown = false;
}

function showSearchIntro() {
  searchIntro.classList.remove("hidden");
  searchIntro.offsetHeight;
  searchIntro.classList.add("search__group__intro--active");
}
function showSearchResults() {
  searchResults.classList.remove("hidden");
  searchResults.offsetHeight;
  searchResults.classList.add("search__group__results--active");

  searchResultsIsShown = true;
}

