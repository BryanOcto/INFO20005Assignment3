const productName = document.querySelector("span[aria-current=\"page\"]").innerHTML;

function decreaseCounterValue(counterValueSpan) {
  const currValue = Number(counterValueSpan.innerHTML);
  if (currValue > 1) {
    counterValueSpan.innerHTML = currValue - 1;
  }
}
function increaseCounterValue(counterValueSpan) {
  counterValueSpan.innerHTML = Number(counterValueSpan.innerHTML) + 1;
}

function addToCart(counterValueSpan) {


  // thanks https://stackoverflow.com/questions/16562577/how-can-i-make-a-button-redirect-my-page-to-another-page
  location.href = "../shopping-cart.html";
}