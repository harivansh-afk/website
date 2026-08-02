const recordPageLoad = () => {
  if (
    typeof navigator.sendBeacon === "function" &&
    navigator.sendBeacon("/counter/hit")
  ) {
    return;
  }
  fetch("/counter/hit", {
    method: "POST",
    credentials: "same-origin",
    keepalive: true,
  }).catch(() => {});
};

if (document.readyState === "complete") {
  recordPageLoad();
} else {
  addEventListener("load", recordPageLoad, { once: true });
}
