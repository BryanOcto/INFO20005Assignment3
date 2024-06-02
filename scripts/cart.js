const discount = 1 - 0.05;
const productNames = ["TTC Bluish White", "Leobog Juggle V2"];

// return value is if it's successfull.
function decreaseCounterValue(counterValueSpan) {
  const currValue = Number(counterValueSpan.innerHTML);
  if (currValue > 1) {
    counterValueSpan.innerHTML = currValue - 1;
    return true;
  }
  return false;
}
function increaseCounterValue(counterValueSpan) {
  counterValueSpan.innerHTML = Number(counterValueSpan.innerHTML) + 1;
}

function decreaseNumInCart(counterValueSpan) {
  if (!decreaseCounterValue(counterValueSpan)) {
    return;
  }
  const productCard = getProductCard(counterValueSpan);
  updateNumInCart(productCard.dataset.productName, -1);
  updateProduct(productCard);
}
function increaseNumInCart(counterValueSpan) {
  increaseCounterValue(counterValueSpan);
  const productCard = getProductCard(counterValueSpan);
  updateNumInCart(productCard.dataset.productName, 1);
  updateProduct(productCard);
}
function getProductCard(counterValueSpan) {
  // thanks https://stackoverflow.com/questions/67414198/use-parentelement-multiple-times
  return counterValueSpan.closest(".cart-product-card");
}
function updateNumInCart(productName, numToAdd) {
  let productObject = JSON.parse(sessionStorage.getItem(productName));
  productObject.numInCart = Number(productObject.numInCart) + numToAdd;
  sessionStorage.setItem(productName, JSON.stringify(productObject));
}

// Thanks https://www.youtube.com/watch?v=AUOzvFzdIk4 and https://www.youtube.com/watch?v=RxUc6ZWwgfw for the introduction to local and session storage. I ended up choosing session storage as it makes the most sense for this front-end prototype.
function addToCart(counterValueSpan) {
  const productName = document.querySelector("span[aria-current=\"page\"]").innerHTML;
  const numToAdd = Number(counterValueSpan.innerHTML);
  if (sessionStorage.getItem(productName) == null) {
    initializeProduct(productName);
  }
  updateNumInCart(productName, numToAdd);

  // thanks https://stackoverflow.com/questions/16562577/how-can-i-make-a-button-redirect-my-page-to-another-page
  location.href = "../shopping-cart.html";
}

function initializeProduct(productName) {
  let productObject;
  // Price here is the current price, whether it's discounted or undiscounted.
  switch (productName) {
    case "TTC Bluish White":
      productObject = {
        numInCart: 0,
        price: 6.39,
        originalPrice: 7.49
      };
      break;
    case "Leobog Juggle V2":
      productObject = {
        numInCart: 0,
        price: 7.49
      };
      break;
  }
  sessionStorage.setItem(productName, JSON.stringify(productObject));
}

function handleEmptyCart() {
  for (let productName of productNames) {
    // If product is not initialized then it doesn't violate the assumption that the cart is empty so continue checking for the rest of the products.
    const productSerialized = sessionStorage.getItem(productName);
    if (productSerialized == null) {
      continue;
    }
    const product = JSON.parse(productSerialized);
    if (product.numInCart != 0) {
      return;
    }
  }
  // Now that we're here the cart must be empty, so make this visible.
  const emptyCartDiv = document.getElementsByClassName("cart__is-empty")[0];
  emptyCartDiv.classList.remove("hidden");
}

function updateProducts() {
  const cart = document.getElementsByClassName("cart")[0];
  for (let element of cart.children) {
    if (!("productName" in element.dataset)) {
      continue;
    }
    if (sessionStorage.getItem(element.dataset.productName) == null) {
      continue;
    } else {
      element.classList.remove("hidden");
    }
    updateProduct(element);
  }
}

function updateProduct(productCard) {
  const productName = productCard.dataset.productName;
  const product = JSON.parse(sessionStorage.getItem(productName));
  const productNumInCart = Number(product.numInCart);
  const productPrice = Number(product.price);

  const counterValueSpan = document.querySelector(`div[data-product-name="${productName}"] .counter__value > span`);
  const totalPriceSpan = document.querySelector(`div[data-product-name="${productName}"] .cart-product-card__total > span`);

  counterValueSpan.innerHTML = productNumInCart;
  totalPriceSpan.innerHTML = (productPrice * productNumInCart).toFixed(2);
  // thanks https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary

  updateTotals();
}

function removeProductAddEventListeners() {
  const cart = document.getElementsByClassName("cart")[0];
  for (let element of cart.children) {
    if (!("productName" in element.dataset)) {
      continue;
    }
    const productName = element.dataset.productName;
    if (sessionStorage.getItem(productName) == null) {
      continue;
    }
    const removeButton = document.querySelector(`.cart-product-card[data-product-name="${productName}"] .remove-product`);
    removeButton.addEventListener("click", () => {
      removeProduct(element, productName);
    });
  }
}
function removeProduct(productCard, productName) {
  sessionStorage.removeItem(productName);
  productCard.classList.add("hidden");
  handleEmptyCart();
  updateTotals();
}

// Button height is in pixels as seen in header.css
const buttonHeight = 70;
function updateMainMarginBottom() {
  const main = document.getElementsByTagName("main")[0];
  const totalSection = document.querySelector(".total");
  if (window.innerWidth >= desktopSmallWidth) {
    if (document.URL.includes("checkout.html")) {
      if (window.innerWidth < desktopWidth) {
        main.style.marginBottom = `${totalSection.offsetHeight}px`;
      } else {
        main.style.marginBottom = "0";
        const paymentSection = document.querySelector("#form > section:nth-child(2)");
        paymentSection.style.marginBottom = `${totalSection.offsetHeight}px`;
      }
    } else {
      main.style.marginBottom = "0";
    }
    return;
  }
  main.style.marginBottom = `${buttonHeight + totalSection.offsetHeight}px`;
}

function updateTotals() {
  let subtotal = 0;

  // Find subtotal and assign to appropriate span
  const cart = document.getElementsByClassName("cart")[0];
  for (let element of cart.children) {
    if (!("productName" in element.dataset)) {
      continue;
    }
    const productName = element.dataset.productName;
    if (sessionStorage.getItem(productName) == null) {
      continue;
    }
    const productPrice = Number(document.querySelector(`.cart-product-card[data-product-name="${productName}"] .cart-product-card__total > span`).innerHTML);
    subtotal += productPrice;
  }
  const originalPriceSpan = document.querySelector(".total :first-child :last-child span");
  originalPriceSpan.innerHTML = subtotal.toFixed(2);
  sessionStorage.setItem("subtotal", subtotal.toFixed(2));

  const checkoutButton = document.querySelector(".total button");
  if (subtotal == 0) {
    checkoutButton.setAttribute("disabled", "");
  } else {
    checkoutButton.removeAttribute("disabled");
  }

  // If discount is applied, also update that span too.
  if (sessionStorage.getItem("couponApplied") == null || sessionStorage.getItem("couponApplied") == false) {
    return;
  }
  const subtotalAfterDiscount = subtotal * discount;
  const discountedPriceSpan = document.querySelector(".total :nth-child(2) :last-child :last-child span");
  discountedPriceSpan.innerHTML = subtotalAfterDiscount.toFixed(2);
  sessionStorage.setItem("subtotalAfterDiscount", subtotalAfterDiscount.toFixed(2));
}

function updateDiscountElements() {
  const applyCouponButton = document.querySelector(".coupon-buttons :first-child");
  const secondaryCouponButton = document.querySelector(".coupon-buttons :last-child");

  const originalSubtotalGroup = document.querySelector(".total > :first-child");
  const originalSubtotalLabel = originalSubtotalGroup.children[0];
  const originalSubtotalPriceP = originalSubtotalGroup.children[1];
  const discountedSubtotalGroup = document.querySelector(".total > :nth-child(2)");

  if (sessionStorage.getItem("couponApplied") == null || sessionStorage.getItem("couponApplied") == "false") {
    // The coupon is turned off
    applyCouponButton.removeAttribute("disabled");
    applyCouponButton.innerHTML = "Apply coupon!";
    secondaryCouponButton.classList.add("hidden");

    originalSubtotalLabel.innerHTML = "Subtotal";
    originalSubtotalPriceP.classList.remove("prices__original-price");
    discountedSubtotalGroup.classList.add("hidden");
    updateTotals();
  } else {
    // The coupon is turned on
    applyCouponButton.setAttribute("disabled", "");
    applyCouponButton.innerHTML = "Coupon applied!";
    secondaryCouponButton.classList.remove("hidden");

    originalSubtotalLabel.innerHTML = "Subtotal before discount";
    originalSubtotalPriceP.classList.add("prices__original-price");
    discountedSubtotalGroup.classList.remove("hidden");
    updateTotals();
  }
}

function applyCoupon() {
  sessionStorage.setItem("couponApplied", "true");
  updateDiscountElements();
}
function removeCoupon() {
  sessionStorage.setItem("couponApplied", "false");
  updateDiscountElements();
}

function checkoutAddEventListener() {
  const checkoutButton = document.querySelector(".total button");
  checkoutButton.addEventListener("click", () => {
    location.href = "checkout.html";
  });
}

// Thanks https://stackoverflow.com/questions/16133491/detect-what-page-you-are-on-javascript
if (document.URL.includes("shopping-cart.html")) {
  handleEmptyCart();
  updateProducts();
  removeProductAddEventListeners();
  updateMainMarginBottom();
  updateDiscountElements();
  updateTotals();
  checkoutAddEventListener();
}

const shippingCost = 20;
function updateTotalsCheckout() {
  const subtotal = sessionStorage.getItem("subtotal");
  let runningTotal = Number(subtotal);
  let originalPriceSpan;
  if (document.URL.includes("summary.html")) {
    originalPriceSpan = document.querySelector("#originalSubtotal :last-child span");
  } else {
    originalPriceSpan = document.querySelector(".total > div :first-child :last-child span");
  }
  originalPriceSpan.innerHTML = subtotal;

  // If discount is applied, also update that span too.
  if (sessionStorage.getItem("couponApplied") != null && sessionStorage.getItem("couponApplied") == "true") {
    const subtotalAfterDiscount = sessionStorage.getItem("subtotalAfterDiscount");
    runningTotal = Number(subtotalAfterDiscount);
    const discountedPriceSpan = document.querySelector("#discountedSubtotal :last-child :last-child span");
    discountedPriceSpan.innerHTML = subtotalAfterDiscount;
  } else {
    document.querySelector("#discountedSubtotal").classList.add("hidden");
  }

  let shippingContainer;
  if (document.URL.includes("summary.html")) {
    shippingContainer = document.querySelector("#shipping :last-child");
  } else {
    shippingContainer = document.querySelector(".total :nth-child(3) :last-child");
  }
  const shippingLabel = shippingContainer.children[0];
  const shippingPrice = shippingContainer.children[1];
  if (sessionStorage.getItem("shippingCalculated") == "false") {
    shippingLabel.innerHTML = "TBC";
    shippingPrice.innerHTML = "";
  } else {
    runningTotal += shippingCost;
    shippingLabel.innerHTML = "AU$";
    shippingPrice.innerHTML = shippingCost;
  }
  let totalPriceSpan;
  if (document.URL.includes("summary.html")) {
    totalPriceSpan = document.querySelector("#totalPrice :last-child span");
  } else {
    totalPriceSpan = document.querySelector(".total :nth-child(4) :last-child span");
  }
  totalPriceSpan.innerHTML = runningTotal.toFixed(2);
}

// Inspired from https://stackoverflow.com/questions/57087145/check-if-all-required-fields-are-filled-in-a-specific-div
function addFormEventListeners() {
  const requiredFormElements = document.querySelectorAll("[required]");
  for (let formElement of requiredFormElements) {
    formElement.addEventListener("input", handleAllFilled);
  }

  const submitButton = document.getElementsByClassName("form-submit")[0];
  submitButton.addEventListener("click", addInvalidClasses);
  
  // Thanks https://stackoverflow.com/questions/39509415/route-to-another-page-onsubmit
  const form = document.getElementById("form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    location.href = "summary.html";
  });
}


function handleAllFilled() {
  const requiredFormElements = document.querySelectorAll("[required]");
  let allRequiredFormElementsFilled = true;
  for (let formElement of requiredFormElements) {
    if (formElement.type == "checkbox" && !formElement.checked) {
      allRequiredFormElementsFilled = false;
    } else if ((formElement.type == "text" || formElement.type == "number" || formElement.type == "email") && !formElement.value) {
      allRequiredFormElementsFilled = false;
    }
  }

  const submitButton = document.getElementsByClassName("form-submit")[0];
  if (allRequiredFormElementsFilled) {
    submitButton.removeAttribute("disabled");
    submitButton.setAttribute("value", "Place Order!");
  } else {
    submitButton.setAttribute("disabled", "");
    submitButton.setAttribute("value", "Please fill in all required details!");
  }

  const deliveryFormElements = document.querySelectorAll("#delivery-form [required]:not([type=\"email\"])");
  let allRequiredDeliveryFormElementsFilled = true;
  for (let formElement of deliveryFormElements) {
    if (formElement.type == "text" && !formElement.value) {
      allRequiredDeliveryFormElementsFilled = false;
    }
  }

  if (allRequiredDeliveryFormElementsFilled) {
    sessionStorage.setItem("shippingCalculated", "true");
  } else {
    sessionStorage.setItem("shippingCalculated", "false");
  }
  updateTotalsCheckout();
}

function addInvalidClasses() {
  const requiredFormElements = document.querySelectorAll("[required]");
  for (let formElement of requiredFormElements) {
    formElement.classList.add("form-element--required");
  }
}

if (document.URL.includes("checkout.html")) {
  sessionStorage.setItem("shippingCalculated", "false");
  updateMainMarginBottom();
  updateTotalsCheckout();
  addFormEventListeners();
}

function setDetailsAndImage() {
  if (sessionStorage.getItem(productNames[0]) != null) {
    let productObject = JSON.parse(sessionStorage.getItem(productNames[0]));

    const TTCNumItemsSpan = document.querySelector("#ttc-price .total__sum-group-wrapper :last-child span");
    const TTCTotalPriceSpan = document.querySelector("#ttc-price .prices__original-price--non-discounted span");
    TTCNumItemsSpan.innerHTML = productObject.numInCart;
    TTCTotalPriceSpan.innerHTML = (Number(productObject.numInCart) * Number(productObject.price)).toFixed(2);
  } else {
    document.querySelector("#ttc-price").classList.add("hidden");
    document.querySelector(".total__product-pictures__img:first-child").classList.add("hidden");
  }
  if (sessionStorage.getItem(productNames[1]) != null) {
    let productObject = JSON.parse(sessionStorage.getItem(productNames[0]));

    const LeobogNumItemsSpan = document.querySelector("#leobog-price .total__sum-group-wrapper :last-child span");
    const LeobogTotalPriceSpan = document.querySelector("#leobog-price .prices__original-price--non-discounted span");

    LeobogNumItemsSpan.innerHTML = productObject.numInCart;
    LeobogTotalPriceSpan.innerHTML = (Number(productObject.numInCart) * Number(productObject.price)).toFixed(2);
  } else {
    document.querySelector("#leobog-price").classList.add("hidden");
    document.querySelector(".total__product-pictures__img:last-child").classList.add("hidden");
  }
}

if (document.URL.includes("summary.html")) {
  updateTotalsCheckout();
  setDetailsAndImage();
}

