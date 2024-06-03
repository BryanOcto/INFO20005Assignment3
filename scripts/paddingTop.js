
// One once when loaded
updateScrollPaddingTop();
function updateScrollPaddingTop() {
  const header = document.getElementsByTagName("header")[0];
  const breadcrumbs = document.querySelector("[aria-label=\"Page navigation\"]");
  let offset;
  if (window.innerWidth >= desktopSmallWidth) {
    offset = `${header.offsetHeight + breadcrumbs.offsetHeight}px`;
  } else {
    offset = `${breadcrumbs.offsetHeight}px`;
  }
  console.log(offset);
  document.getElementsByTagName("html")[0].style.scrollPaddingTop = offset;
}