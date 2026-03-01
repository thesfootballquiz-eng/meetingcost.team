/**
 * MeetingCost.team — Embeddable Widget
 * Usage: <div id="meetingcost-widget"></div>
 *        <script src="https://meetingcost.team/embed.js" data-lang="en"></script>
 */
(function () {
  var script = document.currentScript;
  var lang = (script && script.getAttribute("data-lang")) || "en";
  var containerId = (script && script.getAttribute("data-container")) || "meetingcost-widget";
  var container = document.getElementById(containerId);

  if (!container) {
    console.warn("[MeetingCost] Container #" + containerId + " not found");
    return;
  }

  var iframe = document.createElement("iframe");
  iframe.src = "https://meetingcost.team/" + lang + "/embed/widget";
  iframe.width = "400";
  iframe.height = "320";
  iframe.frameBorder = "0";
  iframe.style.border = "none";
  iframe.style.borderRadius = "16px";
  iframe.style.maxWidth = "100%";
  iframe.title = "MeetingCost.team Widget";
  iframe.loading = "lazy";
  container.appendChild(iframe);
})();
