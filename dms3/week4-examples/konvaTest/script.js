console.log(document.getElementById("myStage"));

let KonvaStage = new Konva.Stage({
  container: "myStage",
  width: 500,
  height: 500,
});

let layerOne = new Konva.Layer();

let circle = new Konva.Circle({
  x: KonvaStage.width() / 2,
  y: KonvaStage.height() / 2,
  radius: 70,
  fill: "red",
});

layerOne.add(circle);
KonvaStage.add(layerOne);
