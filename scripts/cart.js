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
  if (window.innerWidth >= desktopSmallWidth) {
    return;
  }
  const main = document.getElementsByClassName("main--shopping-cart")[0];
  const totalSection = document.getElementsByClassName("total")[0];
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
  } else {
    // The coupon is turned on
    applyCouponButton.setAttribute("disabled", "");
    applyCouponButton.innerHTML = "Coupon applied!";
    secondaryCouponButton.classList.remove("hidden");

    originalSubtotalLabel.innerHTML = "Subtotal before discount";
    originalSubtotalPriceP.classList.add("prices__original-price");
    discountedSubtotalGroup.classList.remove("hidden");
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