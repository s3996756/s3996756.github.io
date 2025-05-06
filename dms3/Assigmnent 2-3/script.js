window.addEventListener("DOMContentLoaded", () => {
  //create stage + layer
  const stage = new Konva.Stage({
    container: "canvas-container",
    width: 600,
    height: 600,
  });
  const layer = new Konva.Layer();
  stage.add(layer);

  //background rectangle
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

  // function to handle the download
  function downloadURI(uri, name) {
    const link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // add event listener to the download button
  const downloadButton = document.getElementById("downloadCanvas");
  if (downloadButton) {
    downloadButton.addEventListener("click", function () {
      const dataURL = stage.toDataURL({ pixelRatio: 2 });
      downloadURI(dataURL, "scrapbook-design.png");
    });
  }

  //shared transformer
  const tr = new Konva.Transformer({
    rotateEnabled: true,
    enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
  });
  layer.add(tr);
  layer.draw();

  // reset button
  document.getElementById("resetCanvas").addEventListener("click", () => {
    // clear background
    bgRect.fill("#fff");
    bgRect.fillPatternImage(null);

    // destroy all stickers
    layer.find(".sticker").forEach((node) => node.destroy());

    // clear transformer
    tr.nodes([]);
    layer.draw();

    //clear file input so same file can be re-selected
    document.getElementById("bgUpload").value = "";
  });

  // background upload
  document.getElementById("bgUpload").addEventListener("change", function (e) {
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
    const pos = stage.getPointerPosition();
    const img = new Image();
    img.onload = () => {
      const s = new Konva.Image({
        image: img,
        x: pos.x - 50,
        y: pos.y - 50,
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
  });
});
