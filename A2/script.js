const video = document.querySelector("#custom-video-player");
const rainAudio = document.querySelector("#rain-audio");
const forestAudio = document.querySelector("#forest-audio");
const playPauseBtn = document.querySelector("#play-pause-btn");
const playPauseImg = document.querySelector("#play-pause-img");
const progressBar = document.querySelector("#progress-bar-fill");
const ambienceVolDownBtn = document.querySelector("#ambience-vol-up-btn");
const ambienceVolUpBtn = document.querySelector("#ambience-vol-down-btn");
const rainBtn = document.querySelector("#rain-btn");
const forestBtn = document.querySelector("#forest-btn");
const resetBtn = document.querySelector("#reset-btn");
const startBtn = document.querySelector("#start-btn");
const timerText = document.querySelector("#timer");
const ambienceVolumeText = document.querySelector("#ambience-vol");

video.addEventListener("timeupdate", updateProgressBar);
video.addEventListener("pause", togglePlayPauseIcon);
video.addEventListener("play", togglePlayPauseIcon);

function togglePlayPauseIcon() {
  if (video.paused || video.ended) {
    playPauseImg.src = "https://img.icons8.com/ios-glyphs/30/play--v1.png";
  } else {
    playPauseImg.src = "https://img.icons8.com/ios-glyphs/30/pause--v1.png";
  }
}

function togglePlayPause() {
  if (video.paused || video.ended) {
    video.play();
    playPauseImg.src = "https://img.icons8.com/ios-glyphs/30/pause--v1.png";
  } else {
    video.pause();
    playPauseImg.src = "https://img.icons8.com/ios-glyphs/30/play--v1.png";
  }
}
function updateProgressBar() {
  const value = (video.currentTime / video.duration) * 100;
  progressBar.style.width = value + "%";
}
// Add other functionalities here

let ambienceVolume = 100;

function ambienceDown() {
  ambienceVolume -= 10;
  if (ambienceVolume < 0) {
    ambienceVolume = 0;
  }
  ambienceVolumeText.innerHTML = "Volume: " + ambienceVolume + "%";
  rainAudio.volume = ambienceVolume / 100;
  forestAudio.volume = ambienceVolume / 100;
}

function ambienceUp() {
  ambienceVolume += 10;
  if (ambienceVolume > 100) {
    ambienceVolume = 100;
  }
  ambienceVolumeText.innerHTML = "Volume: " + ambienceVolume + "%";
  rainAudio.volume = ambienceVolume / 100;
  forestAudio.volume = ambienceVolume / 100;
}

var rainPlaying = false;
function rain() {
  // play rain
  if (!rainPlaying) {
    rainAudio.play();
    rainBtn.style.background = "#0c6c4d";
    rainPlaying = true;
  } else {
    rainAudio.pause();
    rainBtn.style.background = "#504b4b";
    rainPlaying = false;
  }
}

var forestPlaying = false;
function forest() {
  // play forest
  if (!forestPlaying) {
    forestAudio.play();
    forestBtn.style.background = "#0c6c4d";
    forestPlaying = true;
  } else {
    forestAudio.pause();
    forestBtn.style.background = "#504b4b";
    forestPlaying = false;
  }
}

var timerSeconds = 60 * 25;
var started = false;

function reset() {
  // resets timer
  timerSeconds = 60 * 25;
  clearInterval(timer);
  var minutes = Math.floor(timerSeconds / 60);
  var seconds = timerSeconds % 60;
  if (seconds < 10) {
    timerText.innerHTML = minutes + ":0" + seconds;
  } else {
    timerText.innerHTML = minutes + ":" + seconds;
  }
  startBtn.innerHTML = "Start";
  started = false;
}

function start() {
  if (!started) {
    // starts timer
    var timer = setInterval(function () {
      var minutes = Math.floor(timerSeconds / 60);
      var seconds = timerSeconds % 60;
      if (seconds < 10) {
        timerText.innerHTML = minutes + ":0" + seconds;
      } else {
        timerText.innerHTML = minutes + ":" + seconds;
      }
      timerSeconds--;
      if (timerSeconds < 0) {
        clearInterval(timer);
      }
      if (started == false) {
        clearInterval(timer);
      }
    }, 1000);
    startBtn.innerHTML = "Pause";
    started = true;
  } else {
    startBtn.innerHTML = "Start";
    clearInterval(timer);
    started = false;
  }
}

var volume = 100;

function volumeDown() {
  volume -= 10;
  if (volume < 0) {
    volume = 0;
  }
  video.volume = volume / 100;
}

function volumeUp() {
  volume += 10;
  if (volume > 100) {
    volume = 100;
  }
  video.volume = volume / 100;
}
