// Initial ideas from https://youtu.be/7HPsdVQhpRw?si=t__6ji4NqTYfD_BO and other sources, though I ran out of time to implement the dragging mechanism.

// 17 rem = 17 * 16px on mobile
const productCardWidthRem = 17;
const gapEm = 0.5;
var firstCall = true;
const gradientSizeSmallRem = 3.75;
const gradientSizeLargeRem = 4.25;

var previouslyOnMobile = window.innerWidth < desktopWidth;

function getTranslateX(element) {
  // Approach from https://stackoverflow.com/questions/42267189/how-to-get-value-translatex-by-javascript
  const style = window.getComputedStyle(element);
  const matrix = new DOMMatrixReadOnly(style.transform);
  return matrix.m41;
}
function setTranslateX(element, translateXValue) {
  // Solution from https://forum.freecodecamp.org/t/set-translatex-value-in-javascript/275440
  element.style.transform = "translateX(" + translateXValue + "px)";
}

function endTransition(event, element) {
  element.setAttribute("data-is-in-transition", "false")
}

// Don't move left or right if the carousel is transitioning to avoid messing up alignments.
function moveRight(carousel, buttonLeft, buttonRight) {
  if (carousel.dataset.isInTransition === "true") {
    return;
  }
  moveByDelta(carousel, buttonLeft, buttonRight, +1);
}
function moveLeft(carousel, buttonLeft, buttonRight) {
  if (carousel.dataset.isInTransition === "true") {
    return;
  }
  moveByDelta(carousel, buttonLeft, buttonRight, -1);
}

// This is for when we remove the filter and our position is beyond the current number of visible elements.
function handleOverflow(carousel, buttonLeft, buttonRight) {
  // Only handle the overflow after the transition is complete to avoid messing up alignments.
  var intervalID = setInterval(() => {
    if (carousel.dataset.isInTransition === "false") {
      clearInterval(intervalID);
      handleOverflowAfterDelay(carousel, buttonLeft, buttonRight);
    }
  }, 10);
}
function handleOverflowAfterDelay(carousel, buttonLeft, buttonRight) {
  const cardContainer = carousel.children[2];
  const numHidden = countHidden(cardContainer);
  if (numHidden == 0) {
    return;
  }
  const maximumPosition = cardContainer.children.length - numHidden;
  const currentPosition = parseInt(carousel.dataset.currentPosition);
  if (currentPosition > maximumPosition) {
    moveByDelta(carousel, buttonLeft, buttonRight, maximumPosition - currentPosition);
  }
}
// This is when we add elements and may need to update the right arrow disabled state since there may be more elements to the right now.
function handleShortflow(carousel, buttonLeft, buttonRight) {
  const cardContainer = carousel.children[2];
  const numFiltered = countFiltered(cardContainer);
  // Nothing to do if none was filtered
  if (numFiltered == 0) {
    return;
  }
  const previousMaximumPosition = cardContainer.children.length - numFiltered;
  const currentPosition = parseInt(carousel.dataset.currentPosition);
  // The following is true when we're on the right side, so remove the disabled class that was there.
  if (currentPosition == previousMaximumPosition) {
    buttonRight.removeAttribute("disabled");
  }
}


function countHidden(cardContainer) {
  let hiddenCount = 0;
  for (card of cardContainer.children) {
    if (card.classList.contains("hidden")) {
      hiddenCount++;
    }
  }
  return hiddenCount;
}
function countFiltered(cardContainer) {
  let filteredCount = 0;
  for (card of cardContainer.children) {
    if (card.dataset.filtered == "true") {
      filteredCount++;
    }
  }
  return filteredCount;
}

function moveByDelta(carousel, buttonLeft, buttonRight, delta) {
  const cardContainer = carousel.children[2];
  const currentPosition = parseInt(carousel.dataset.currentPosition);
  const minimumPosition = 1;
  // If hidden they must be reduced from the maximum count
  const numHidden = countHidden(cardContainer);
  const maximumPosition = cardContainer.children.length - numHidden;
  handleChangePosition(carousel, minimumPosition, currentPosition, currentPosition + delta, maximumPosition, buttonLeft, buttonRight);
  
  const currTranslateValue = getTranslateX(cardContainer);
  const newTranslateValue = currTranslateValue - delta * (productCardWidthRem + gapEm) * currOneRem();
  setTranslateX(cardContainer, newTranslateValue);
  
  // Prevent button clicking when in transition to avoid bugs
  carousel.setAttribute("data-is-in-transition", "true");
  carousel.addEventListener("transitionend", (event) => {
    endTransition(event, carousel);
  }, {once: true});
}

function handleChangePosition(carousel, minimumPosition, currentPosition, nextPosition, maximumPosition, buttonLeft, buttonRight) {
  // We're on the left edge and the left button is disabled, so it must be to the right. Similar argument on the right edge.
  if (currentPosition === minimumPosition) {
    buttonLeft.removeAttribute("disabled");
  }
  if (currentPosition === maximumPosition) {
    buttonRight.removeAttribute("disabled");
  }

  // If the next position is at the left edge, then we need to add the disabled attribute. Similar argument on the right edge.
  if (nextPosition === minimumPosition) {
    buttonLeft.setAttribute("disabled", "");
  }
  if (nextPosition === maximumPosition) {
    buttonRight.setAttribute("disabled", "");
  }

  // Update the carousel with the new position
  carousel.dataset.currentPosition = nextPosition;
}

// Reset carousel position and everything
function handleCarouselResize() {
  const windowWidth = window.innerWidth;
  // CASES
  // 1. Moved from desktop to mobile
  // 2. Moved from mobile to desktop
  if (windowWidth < desktopWidth && !previouslyOnMobile) {
    resetAllCarousels(gradientSizeSmallRem * currOneRem());
    previouslyOnMobile = true;
  } else if (windowWidth >= desktopWidth && previouslyOnMobile) {
    resetAllCarousels(gradientSizeLargeRem * currOneRem());
    previouslyOnMobile = false;
  }
}

// Resets carousel to the provided offset (including attributes)
function resetAllCarousels(translateXOffset) {
  for (carousel of document.getElementsByClassName("carousel")) {
    carousel.setAttribute("data-current-position", "1");
    const buttonLeft = carousel.children[0];
    const buttonRight = carousel.children[1];
    const cardContainer = carousel.children[2];
    setTranslateX(cardContainer, translateXOffset);
    resetToggles(buttonLeft, buttonRight);
  }
}
function resetToggles(buttonLeft, buttonRight) {
  if (!buttonLeft.hasAttribute("disabled")) {
    buttonLeft.setAttribute("disabled", "");
  }
  if (buttonRight.hasAttribute("disabled")) {
    buttonRight.removeAttribute("disabled");
  }
}