const filtersContainer = document.getElementsByClassName("products__filters")[0];
const productsCarousel = document.querySelector(".products .carousel");
const productsCarouselContainer = document.querySelector(".products .carousel .carousel__card-container");

filtersContainer.addEventListener("input", handleFilterInput);
function handleFilterInput() {
  if (!inputsAreEmpty()) {
    filterElements();
  } else {
    unfilterElements();
  }
}

// help from https://stackoverflow.com/questions/254302/how-can-i-determine-the-type-of-an-html-element-in-javascript and https://stackoverflow.com/questions/3510867/finding-the-type-of-an-input-element
function inputsAreEmpty() {
  for (fieldset of filtersContainer.children) {
    if (fieldset.nodeName != "FIELDSET") {
      continue;
    }
    for (label of fieldset.children) {
      if (label.nodeName != "LABEL") {
        continue;
      }
      const input = label.children[0];
      if (input.type == "number" && input.value != "" ||
          input.type == "checkbox" && input.checked
      ) {
        return false;
      }
    }
  }
  return true;
}

function clearFilters() {
  for (fieldset of filtersContainer.children) {
    if (fieldset.nodeName != "FIELDSET") {
      continue;
    }
    for (label of fieldset.children) {
      if (label.nodeName != "LABEL") {
        continue;
      }
      const input = label.children[0];
      if (input.type == "number") {
        input.value = "";
      } else if (input.type == "checkbox") {
        input.checked = false;
      }
    }
  }
  handleFilterInput();
}

function filterElements() {
  for (card of productsCarouselContainer.children) {
    if (card.dataset.filtered == "true") {
      card.classList.add("hidden");
    }
  }
  handleOverflow(productsCarousel, productsCarousel.children[0], productsCarousel.children[1]);
}

function unfilterElements() {
  for (card of productsCarouselContainer.children) {
    if (card.dataset.filtered == "true" && card.classList.contains("hidden")) {
      card.classList.remove("hidden");
    }
  }
  handleShortflow(productsCarousel, productsCarousel.children[0], productsCarousel.children[1]);
}