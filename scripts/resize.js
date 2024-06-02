window.onresize = handleResize;
function handleResize() {
  handleMenuResize();
  handleCarouselResize();
  updateMainMarginBottom();
}