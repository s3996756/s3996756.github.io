window.addEventListener("DOMContentLoaded", () => {
  // stage and layer
  const stage = new Konva.Stage({
    container: "canvas-container",
    width: 500,
    height: 500,
  });
  const layer = new Konva.Layer();
  stage.add(layer);

  // background rectangle
  const bgRect = new Konva.Rect({
    x: 0,
    y: 0,
    width: stage.width(),
    height: stage.height(),
    fill: "rgba(255, 249, 249, 1)",
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

  //undo bttn
  // const undoStack = [];

  // document.getElementById("undoButton").addEventListener("click", function () {
  //   const lastItem = undoStack.pop();
  //   if (lastItem) {
  //     lastItem.destroy();
  //     layer.draw();
  //   }
  // });

  //  updates the delete buttons state
  function updateDeleteButtonState() {
    const selectedNode = tr.nodes()[0];
    const deleteButton = document.getElementById("deleteSticker");
    const moveToFrontButton = document.getElementById("moveToFront");
    const moveToBackButton = document.getElementById("moveToBack");
    const buttons = [deleteButton, moveToFrontButton, moveToBackButton];
    buttons.forEach((btn) => {
      if (btn) {
        btn.disabled = !selectedNode;
      }
    });
  }

  document
    .getElementById("customStickerUpload")
    .addEventListener("click", () => {
      document.getElementById("customStickerInput").click();
    });

  document
    .getElementById("customStickerInput")
    .addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function (event) {
        const imageObj = new Image();
        imageObj.src = event.target.result;

        const MAX_WIDTH = 150;
        const MIN_WIDTH = 50;
        const aspectRatio = imageObj.width / imageObj.height;

        // Normalize width
        let width = imageObj.width;
        if (width > MAX_WIDTH) width = MAX_WIDTH;
        if (width < MIN_WIDTH) width = MIN_WIDTH;

        const height = width / aspectRatio;

        imageObj.onload = function () {
          const sticker = new Konva.Image({
            image: imageObj,
            x: 100,
            y: 100,
            width: width,
            height: height,
            draggable: true,
            name: "sticker",
          });

          // behave like other stickers
          sticker.on("click", (evt) => {
            evt.cancelBubble = true;
            tr.nodes([sticker]);
            tr.moveToTop();
            layer.draw();
            updateDeleteButtonState();
          });

          layer.add(sticker);
          layer.draw();
          // undoStack.push(sticker); //undo
        };
      };
    });

  // text button
  // const textButton = document.getElementById("textButton");
  // if (textButton) {
  //   textButton.addEventListener("click", () => {
  //     const simpleText = new Konva.Text({
  //       x: stage.width() / 2,
  //       y: 15,
  //       text: "Simple Text",
  //       fontSize: 30,
  //       fontFamily: "Calibri",
  //       fill: "green",
  //       name: "sticker",
  //       draggable: true
  //     });

  //     // behave like other stickers
  //     simpleText.on("click", (evt) => {
  //       evt.cancelBubble = true;
  //       tr.nodes([simpleText]);
  //       tr.moveToTop();
  //       layer.draw();
  //       updateDeleteButtonState();
  //     });

  //     layer.add(simpleText);
  //     layer.draw();
  //   });
  // }

  // i tried to add a text button here but since konva doesnt
  //  directly support typing on the canvas i gave up

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
      bgRect.fill("rgba(255, 249, 249, 1)");
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
      const MAX_WIDTH = 100;
      const MIN_WIDTH = 50;
      const aspectRatio = img.width / img.height;

      // Normalize width
      let width = img.width;
      if (width > MAX_WIDTH) width = MAX_WIDTH;
      if (width < MIN_WIDTH) width = MIN_WIDTH;

      const height = width / aspectRatio;
      const s = new Konva.Image({
        image: img,
        x: mousePos.x - width / 2,
        y: mousePos.y - height / 2,
        width: width,
        height: height,
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

  // move to front
  const moveToFrontButton = document.getElementById("moveToFront");
  if (moveToFrontButton) {
    moveToFrontButton.addEventListener("click", () => {
      const selectedNode = tr.nodes()[0];
      if (selectedNode) {
        selectedNode.moveToTop();
        tr.moveToTop();
        layer.draw();
      }
    });
  }

  // move to back
  const moveToBackButton = document.getElementById("moveToBack");
  if (moveToBackButton) {
    moveToBackButton.addEventListener("click", () => {
      const selectedNode = tr.nodes()[0];
      if (selectedNode) {
        const bg = layer.findOne(".background");
        if (bg) {
          selectedNode.moveToBottom();
          selectedNode.moveUp();
          tr.moveToTop();
          layer.draw();
        }
      }
    });
  }

  // deselect sticker on background click
  bgRect.on("click", () => {
    tr.nodes([]);
    layer.draw();
    updateDeleteButtonState();
  });
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
});
