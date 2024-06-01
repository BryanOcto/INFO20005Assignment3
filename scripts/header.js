const body = document.getElementsByTagName("body")[0];
const nav = document.getElementsByTagName("nav")[0];
const list = document.getElementsByClassName("nav__link-list")[0];
const openButton = document.getElementById("openButton");
const searchSection = document.getElementsByClassName("search")[0];
// const searchGroup = document.getElementsByClassName("search__group")[0];
const searchIntro = document.getElementsByClassName("search__group__intro")[0];
const searchResults = document.getElementsByClassName("search__group__results")[0];
const searchBar = document.getElementsByClassName("search__input")[0];

// APPROACH: The search is always above the nav if open.
var searchIsVisible = false;

var menuIsOpen = false;
var menuIsInTransition = false;
var searchResultsIsShown = false;

// Help from https://stackoverflow.com/questions/11741070/how-to-get-the-element-clicked-on
function endTransition(event) {
  menuIsInTransition = false;
}
function addHidden(element) {
  element.classList.add("hidden");
  menuIsInTransition = false;
}
function addNavHidden(element) {
  element.classList.add("nav--hidden");
  menuIsInTransition = false;
}

function toggleMenu() {
  if (menuIsInTransition) {
    return;
  }

  // Approach to animate hidden elements from https://cloudfour.com/thinks/transitioning-hidden-elements/ and https://plainenglish.io/blog/passing-arguments-to-event-listeners-in-javascript-1a81bc397ecb for the anonymous/arrow functions.
  if (!menuIsOpen) {
    // Directly remove the hidden class to enable transitions
    list.classList.remove("hidden");
    nav.classList.remove("nav--hidden");
    // Update to make browser realize it isn't hidden again
    list.offsetHeight;
    // Don't change state when in transition to avoid bugs
    list.addEventListener("transitionend", endTransition, {once: true});
    nav.addEventListener("transitionend", endTransition, {once: true});
    // Remove scrolling from body when menu is open
    body.classList.add("body--overlay-open");
  } else {
    // Wait for the transition to finish, then add back the hidden class.
    list.addEventListener("transitionend", () => {addHidden(list)}, {once: true});
    nav.addEventListener("transitionend", () => {addNavHidden(nav)}, {once: true});
    // Add back scrolling to body
    body.classList.remove("body--overlay-open");
  }
  menuIsInTransition = true;
  menuIsOpen = !menuIsOpen;

  nav.classList.toggle("nav--active");
  list.classList.toggle("nav__link-list--active");
  openButton.classList.toggle("nav__open-button--active");
}

// Must close the mobile menu when desktop reached
function handleMenuResize() {
  if (window.innerWidth >= desktopSmallWidth && menuIsOpen) {
    toggleMenu();
  }
}

function openSearch() {
  // If search is already opened, then nothing to do.
  if (searchIsVisible) {
    return;
  }

  // Close the menu first before opening
  if (menuIsOpen) {
    toggleMenu();
  }

  searchSection.classList.remove("hidden");
  searchSection.offsetHeight;
  searchSection.classList.add("search--active");

  searchIsVisible = true;

  // Remove scrolling from body when search is open
  body.classList.add("body--overlay-open");
}

function closeSearch() {
  // If search is already closed, then nothing to do.
  if (!searchIsVisible) {
    return;
  }

  searchSection.classList.remove("search--active");
  // Only want to fire when the element has finished transitioning and not its children (bubbling https://stackoverflow.com/questions/26309838/transitionend-listener-firing-on-child-elements), so stop the bubbling.
  for (element of searchSection.children) {
    element.addEventListener("transitionend", (event) => {
      event.stopPropagation();
    })
  }
  searchSection.addEventListener("transitionend", () => {addHidden(searchSection)}, {once: true});

  searchIsVisible = false;

  // Add back scrolling to body
  body.classList.remove("body--overlay-open");
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
        closeSearch();
      }
    } else {
      searchEdge = searchSection.offsetHeight + Math.max(searchIntro.offsetHeight, searchResults.offsetHeight);
      if (y > searchEdge) {
        closeSearch();
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
    searchIntro.classList.add("hidden");
    searchResults.classList.remove("hidden");
    searchResultsIsShown = true;
    return;
  }

  // Search bar is empty and results is shown so go back to intro
  if (searchResultsIsShown && query === "") {
    searchResults.classList.add("hidden");
    searchResultsIsShown = false;
    searchIntro.classList.remove("hidden");
    return;
  }
}

// The following code is for expanding the e.g. categories and blog post segments in the search results page.
const searchGroupResults = document.getElementsByClassName("search__group__results")[0];

const categoriesSegment = document.getElementsByClassName("categories-blog__categories-wrapper")[0];
const categoriesToggle = document.getElementsByClassName("categories-blog__categories-wrapper__toggle")[0];
const categoriesToggleCallback = () => {
  checkTogglePosition(categoriesSegment)
}
categoriesToggle.addEventListener("click", () => {
  toggleSegment(categoriesSegment, categoriesToggle, searchGroupResults, categoriesToggleCallback);
});

const blogSegment = document.getElementsByClassName("categories-blog__blog-wrapper")[0];
const blogToggle = document.getElementsByClassName("categories-blog__blog-wrapper__toggle")[0];
const blogToggleCallback = () => {
  checkTogglePosition(blogSegment);
}
blogToggle.addEventListener("click", () => {
  toggleSegment(blogSegment, blogToggle, searchGroupResults, blogToggleCallback);
})

function checkTogglePosition(segment) {
  let border;
  if (window.innerWidth < desktopSmallWidth) {
    border = nav.getBoundingClientRect().top;
  } else {
    // The bottom of the screen is now the border if it's on desktop.
    border = window.innerHeight;
  }
  let segmentBottom = segment.getBoundingClientRect().bottom;
  // Idea from https://stackoverflow.com/questions/45199518/detecting-if-an-element-is-outside-of-its-parents-outer-bounds
  if (segmentBottom >= border) {
    segment.classList.add("segment--active--fix-close");
  } else if (segment.classList.contains("segment--active--fix-close")) {
    // Need to get rid of that class so can go back again.
    segment.classList.remove("segment--active--fix-close");
  }
}
function toggleSegment(segment, toggle, parentScroll, callback) {
  let attemptToClose = segment.classList.contains("segment--active");
  segment.classList.toggle("segment--active");
  if (segment.classList.contains("segment--active--fix-close")) {
    segment.classList.remove("segment--active--fix-close");
    attemptToClose = true;
  }
  if (attemptToClose) {
    parentScroll.removeEventListener("scroll", callback);
    return;
  }

  // While the animation plays for 300ms, rapidly check toggle position to see if you have to stick it to the bottom of the screen as it expands.
  let intervalID = setInterval(() => {
    checkTogglePosition(segment, toggle);
  }, 10);
  setTimeout(() => {
    clearInterval(intervalID);
    intervalID = null;
  }, 300);
  // Add a listener to add/remove the class as necessary
  parentScroll.addEventListener("scroll", callback);
}