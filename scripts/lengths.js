const smallOneRem = 16; // 16px
const largeOneRem = 20; // 20px
// desktopSmallWidth = 50em = 50 * 1rem = 50 * 16px
// desktopWidth = 85em = 85 * 1rem = 85 * 20px;
const desktopSmallWidth = 50 * smallOneRem;
const desktopWidth = 85 * smallOneRem;

function currOneRem() {
  if (window.innerWidth < desktopWidth) {
    return smallOneRem;
  } else {
    return largeOneRem;
  }
}