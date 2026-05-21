// router.js – Simple utility to parse query params
function getQueryParams() {
  return Object.fromEntries(new URLSearchParams(window.location.search).entries());
}
