window.addEventListener("DOMContentLoaded", () => {
  // stage and layer
  const stage = new Konva.Stage({
    container: "canvas-container",
    width: 600,
    height: 600,
  });
  const layer = new Konva.Layer();
  stage.add(layer);

  // background rectangle
  const bgRect = new Konva.Rect({
    x: 0,
    y: 0,
    width: stage.width(),
    height: stage.height(),
    fill: "#fff",
    fillPriority: "pattern",
    name: "background",
  });
  layer.add(bgRect);

  const tr = new Konva.Transformer({
    rotateEnabled: true,
    enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
  });
  layer.add(tr);
  layer.draw();

  //  updates the delete buttons state
  function updateDeleteButtonState() {
    const selectedNode = tr.nodes()[0];
    const deleteButton = document.getElementById("deleteSticker");
    if (deleteButton) {
      if (selectedNode) {
        deleteButton.disabled = false;
        deleteButton.style.opacity = 1;
      } else {
        deleteButton.disabled = true;
        deleteButton.style.opacity = 0.6;
      }
    }
  }

  // delete button
  const deleteButton = document.getElementById("deleteSticker");
  if (deleteButton) {
    deleteButton.addEventListener("click", () => {
      const selectedNode = tr.nodes()[0];
      if (selectedNode) {
        selectedNode.destroy();
        tr.nodes([]);
        layer.draw();
        updateDeleteButtonState();
      }
    });
  }

  // download function
  function downloadURI(uri, name) {
    const link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const downloadButton = document.getElementById("downloadCanvas");
  if (downloadButton) {
    downloadButton.addEventListener("click", function () {
      const dataURL = stage.toDataURL({ pixelRatio: 2 });
      downloadURI(dataURL, "scrapbook-design.png");
    });
  }

  // Reset button
  const resetButton = document.getElementById("resetCanvas");
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      bgRect.fill("#fff");
      bgRect.fillPatternImage(null);

      layer.find(".sticker").forEach((node) => node.destroy());

      tr.nodes([]);
      layer.draw();

      const bgUpload = document.getElementById("bgUpload");
      if (bgUpload) {
        bgUpload.value = "";
      }

      updateDeleteButtonState();
    });
  }

  // background upload
  const bgUpload = document.getElementById("bgUpload");
  if (bgUpload) {
    bgUpload.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function () {
        const img = new Image();
        img.onload = function () {
          const canvasW = stage.width();
          const canvasH = stage.height();
          const imageRatio = img.width / img.height;
          const canvasRatio = canvasW / canvasH;
          let scale, cropX, cropY, cropW, cropH;
          if (imageRatio > canvasRatio) {
            scale = canvasH / img.height;
            cropH = img.height;
            cropW = canvasW / scale;
            cropX = (img.width - cropW) / 2;
            cropY = 0;
          } else {
            scale = canvasW / img.width;
            cropW = img.width;
            cropH = canvasH / scale;
            cropX = 0;
            cropY = (img.height - cropH) / 2;
          }
          bgRect.fillPatternImage(img);
          bgRect.fillPatternScale({ x: scale, y: scale });
          bgRect.fillPatternOffset({ x: cropX, y: cropY });
          bgRect.fillPatternRepeat("no-repeat");
          layer.draw();
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // sticker drag-and-drop
  let draggedSrc = null;
  document
    .querySelectorAll(".sticker")
    .forEach((el) =>
      el.addEventListener("dragstart", (e) => (draggedSrc = e.target.src))
    );
  const container = stage.container();
  container.addEventListener("dragover", (e) => e.preventDefault());
  container.addEventListener("drop", (e) => {
    e.preventDefault();
    if (!draggedSrc) return;

    const mousePos = {
      x: e.clientX - container.getBoundingClientRect().left,
      y: e.clientY - container.getBoundingClientRect().top,
    };

    const img = new Image();
    img.onload = () => {
      const s = new Konva.Image({
        image: img,
        x: mousePos.x - 50,
        y: mousePos.y - 50,
        width: 100,
        height: 100,
        draggable: true,
        name: "sticker",
      });
      s.on("click", (evt) => {
        evt.cancelBubble = true;
        tr.nodes([s]);
        tr.moveToTop();
        layer.draw();
        updateDeleteButtonState();
      });
      layer.add(s);
      layer.draw();
    };
    img.src = draggedSrc;
  });

  // deselect sticker on background click
  bgRect.on("click", () => {
    tr.nodes([]);
    layer.draw();
    updateDeleteButtonState();
  });
});
