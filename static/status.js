// Service status pill. Reads the BetterStack status page aggregate state via a
// same-origin reverse proxy (see README/server config) to avoid CORS, then
// renders a colored dot + label in the bottom-right corner.
(function () {
  "use strict";

  var STATUS_PAGE = "https://status.harivan.sh";
  // Same-origin path that proxies STATUS_PAGE + "/badge" (server-side, no CORS).
  var ENDPOINT = "/status-badge";
  var POLL_MS = 60000;

  // BetterStack aggregate colors -> dot class + human label.
  var STATES = {
    green: { cls: "ok", text: "All systems operational" },
    yellow: { cls: "warn", text: "Some systems degraded" },
    orange: { cls: "warn", text: "Partial outage" },
    red: { cls: "down", text: "Major outage" },
    blue: { cls: "maint", text: "Under maintenance" },
    grey: { cls: "maint", text: "Under maintenance" },
    gray: { cls: "maint", text: "Under maintenance" }
  };
  var UNKNOWN = { cls: "unknown", text: "Status" };

  function build() {
    var pill = document.createElement("a");
    pill.className = "status-pill unknown";
    pill.href = STATUS_PAGE;
    pill.target = "_blank";
    pill.rel = "noopener noreferrer";
    pill.setAttribute("aria-label", "Service status");

    var dot = document.createElement("span");
    dot.className = "status-dot";

    var label = document.createElement("span");
    label.className = "status-text";
    label.textContent = "Checking status";

    pill.appendChild(dot);
    pill.appendChild(label);
    document.body.appendChild(pill);

    function apply(state) {
      pill.className = "status-pill " + state.cls;
      label.textContent = state.text;
    }

    function refresh() {
      fetch(ENDPOINT, { cache: "no-store" })
        .then(function (r) {
          if (!r.ok) throw new Error("bad status " + r.status);
          return r.text();
        })
        .then(function (html) {
          var m = html.match(/statuspage-([a-z]+)/i);
          var key = m ? m[1].toLowerCase() : null;
          apply((key && STATES[key]) || UNKNOWN);
        })
        .catch(function () {
          apply(UNKNOWN);
        });
    }

    refresh();
    setInterval(refresh, POLL_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
