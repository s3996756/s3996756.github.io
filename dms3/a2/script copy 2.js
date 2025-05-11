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
    ignoreStroke: true,
    boundBoxFunc: function (oldBox, newBox) {
      // Enforce minimum width and height of 20
      if (newBox.width < 20 || newBox.height < 20) {
        return oldBox;
      }
      return newBox;
    },
    anchorSize: 10, // Make anchor handles more visible
  });

  layer.add(tr);
  layer.draw();

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

  // pencil tool setup
  let drawMode = false;
  let isDrawing = false;
  let currentLine;
  let strokeColor = document.getElementById("color-picker").value;

  document.getElementById("color-picker").addEventListener("input", (e) => {
    strokeColor = e.target.value;
  });

  const pencilBtn = document.getElementById("pencil-button");
  pencilBtn.addEventListener("click", () => {
    drawMode = !drawMode;
    tr.nodes([]);
    stage.container().style.cursor = drawMode ? "crosshair" : "default";

    // toggle button style
    pencilBtn.style.backgroundColor = drawMode ? "#6c1172" : "#f7dcff";
    pencilBtn.style.color = drawMode ? "#f7dcff" : "#6c1172";
  });
  // let drawMode = false;
  // let isDrawing = false;
  // let currentLine;
  // let strokeColor = document.getElementById("color-picker").value;

  // document.getElementById("color-picker").addEventListener("input", (e) => {
  //   strokeColor = e.target.value;
  // });

  // const pencilBtn = document.getElementById("pencil-button");
  // pencilBtn.addEventListener("click", () => {
  //   drawMode = !drawMode;
  //   tr.nodes([]);
  //   stage.container().style.cursor = drawMode ? "crosshair" : "default";

  //   //style
  //   pencilBtn.style.backgroundColor = drawMode ? "#6c1172" : "#f7dcff";
  //   pencilBtn.style.color = drawMode ? "#f7dcff" : "#6c1172";
  // });

  stage.on("mousedown touchstart", (e) => {
    if (!drawMode) return;

    isDrawing = true;
    const pos = stage.getPointerPosition();
    currentLine = new Konva.Line({
      stroke: strokeColor,
      strokeWidth: 5,
      globalCompositeOperation: "source-over",
      points: [pos.x, pos.y],
      draggable: true,
      lineCap: "round",
      lineJoin: "round",
      name: "sticker",
    });
    layer.add(currentLine);
  });

  stage.on("mousemove touchmove", () => {
    if (!isDrawing || !drawMode) return;

    const pos = stage.getPointerPosition();
    const newPoints = currentLine.points().concat([pos.x, pos.y]);
    currentLine.points(newPoints);
    layer.batchDraw();

    function finishDrawing() {
      isDrawing = false;

      if (!currentLine) return;

      // Get bounding box with padding
      const box = currentLine.getClientRect({ relativeTo: layer });
      const padding = 10;

      const hitRect = new Konva.Rect({
        x: box.x - padding,
        y: box.y - padding,
        width: box.width + padding * 2,
        height: box.height + padding * 2,
        fill: "rgba(0,0,0,0)", // invisible but clickable
      });

      const group = new Konva.Group({
        draggable: true,
        name: "sticker",
      });

      group.add(hitRect);
      group.add(currentLine);
      layer.add(group);
      layer.draw();

      group.on("click", (e) => {
        e.cancelBubble = true;
        tr.nodes([group]);
        tr.moveToTop();
        layer.draw();
        updateDeleteButtonState();
      });

      currentLine = null;
    }
  });

  stage.on("mouseup touchend", () => {
    if (!isDrawing || !drawMode) return;
    finishDrawing();

    isDrawing = false;
    makeDrawableSelectable(currentLine);
  });

  function finishDrawing() {
    isDrawing = false;

    if (!currentLine) return;

    const box = currentLine.getClientRect({ relativeTo: layer });
    const padding = 10;

    const hitRect = new Konva.Rect({
      x: box.x - padding,
      y: box.y - padding,
      width: box.width + padding * 2,
      height: box.height + padding * 2,
      fill: "rgba(0,0,0,0)", // invisible but clickable
    });

    const group = new Konva.Group({
      draggable: true,
      name: "sticker",
    });

    group.add(hitRect);
    group.add(currentLine);
    layer.add(group);
    layer.draw();

    group.on("click", (e) => {
      e.cancelBubble = true;
      tr.nodes([group]);
      tr.moveToTop();
      layer.draw();
      updateDeleteButtonState();
    });

    currentLine = null;
  }

  function makeDrawableSelectable(line) {
    line.on("click", (evt) => {
      evt.cancelBubble = true;
      tr.nodes([line]);
      tr.moveToTop();
      layer.draw();
      updateDeleteButtonState();
    });
  }

  // custom sticker upload
  document
    .getElementById("customStickerUpload")
    .addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (event) {
        const imageObj = new Image();
        imageObj.src = event.target.result;

        imageObj.onload = function () {
          const sticker = new Konva.Image({
            image: imageObj,
            x: 100,
            y: 100,
            width: imageObj.width * 0.2,
            height: imageObj.height * 0.2,
            draggable: true,
            name: "sticker",
          });

          sticker.on("click", (evt) => {
            evt.cancelBubble = true;
            tr.nodes([sticker]);
            tr.moveToTop();
            layer.draw();
            updateDeleteButtonState();
          });

          layer.add(sticker);
          layer.draw();
        };
      };
      reader.readAsDataURL(file);
    });

  // add text button
  document.getElementById("addTextButton").addEventListener("click", () => {
    // Default properties
    const defaultFontSize = 20;
    const defaultFontColor = "#000000"; // Black

    // Create a text node
    const text = new Konva.Text({
      text: "Click to edit",
      x: 50,
      y: 50,
      fontSize: defaultFontSize,
      fill: defaultFontColor,
      draggable: true,
      textAlign: "center",
    });

    // Add text to the layer
    layer.add(text);
    layer.draw();
  });

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

  // reset button
  const resetButton = document.getElementById("resetCanvas");
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      bgRect.fill("#fff");
      bgRect.fillPatternImage(null);

      layer.find(".sticker").forEach((node) => node.destroy());
      tr.nodes([]);
      layer.draw();

      const bgUpload = document.getElementById("bgUpload");
      if (bgUpload) bgUpload.value = "";

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
        x: mousePos.x - img.width / 2,
        y: mousePos.y - img.height / 2,
        width: img.width,
        height: img.height,
        draggable: true,
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

  // tab switching
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const target = "tab-" + btn.dataset.tab;
      document.querySelectorAll(".tab-content").forEach((tab) => {
        tab.classList.remove("active");
        if (tab.id === target) tab.classList.add("active");
      });
    });
  });
  // deselect transformer when clicking outside of any object
  stage.on("click", (e) => {
    if (!e.target.hasName("sticker")) {
      tr.nodes([]);
      layer.draw();
      updateDeleteButtonState();
    }
  });
});
