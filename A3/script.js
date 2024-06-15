// Make the DIV element draggable:
dragElement(document.getElementById("dice-image"));

var shakingCount = 0;
var startPos = getOffset(document.getElementById("dice-image"));

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getOffset(el) {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY,
  };
}

function updateDice() {
  var number = getRandomInt(6) + 1;
  document.getElementById("dice-image").src = "images/dice" + number + ".png";
}

function dragElement(elmnt) {
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  if (document.getElementById(elmnt.id)) {
    document.getElementById(elmnt.id).onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    //setting the starting click position
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // when cursor moves drag dice
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    diceElement = e;

    e = e || window.event;
    e.preventDefault();
    // calculating  the new cursor position
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // how i set the element's new position
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";

    shakingCount = shakingCount + 1;
    if (shakingCount % 20 == 0) {
      updateDice();
    }
  }

  function closeDragElement() {
    // stop moving when mouse button is released
    document.onmouseup = null;
    document.onmousemove = null;

    updateDice();

    elmnt.style.top = startPos.top + "px";
    elmnt.style.left = startPos.left + "px";
  }
}
/*I opted to design the dice to return to its original position. 
This choice was made for its efficiency, allowing users to easily reroll the dice 
without the need for complex code or additional buttons in the interface.*/
