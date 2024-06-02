window.onresize = handleResize;
function handleResize() {
  handleMenuResize();
  handleCarouselResize();
  if (!document.URL.includes("index.html")) {
    updateMainMarginBottom();
  }
  if (document.URL.includes("products")) {
    updateScrollPaddingTop();
  }
}