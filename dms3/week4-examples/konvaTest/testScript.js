/* find text to update */
let widthReport = document.getElementById("reportWidthText");

/* change html text */
widthReport.innerHTML = window = innerWidth;

function updateReport() {
  alert("this button isn't working yet");
}

/* find button */
let updateButton = document.getElementById("updateReportButton");

/* run updateReport function when button clicked */
updateButton.addEventListener("click", updateReport);
