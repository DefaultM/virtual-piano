const PIANO_KEY = document.querySelectorAll(".piano-key");
const PIANO = document.querySelector(".piano ");
const fullBtn = document.querySelector(".fullscreen");
const btnChange = document.querySelectorAll(".btn");

function playSound(e) {
  const audio = document.querySelector(`audio[data-key="${e.keyCode}"]`);
  const key = document.querySelector(`div[data-key="${e.keyCode}"]`);

  if (!audio) return;
  if (e.repeat) return;
  key.classList.add("piano-key-active");
  audio.currentTime = 0;
  audio.play();
}

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

for (let b of btnChange) {
  b.addEventListener("click", function () {
    btnChange.forEach((e) => e.classList.toggle("btn-active"));
    PIANO_KEY.forEach((key) => key.classList.toggle("piano-key-letter"));
  });
}

const startSound = (event) => {
  const audio1 = document.querySelector(
    `audio[data-note="${event.target.dataset.note}"]`
  );
  if (!audio1) return;
  audio1.currentTime = 0;
  audio1.play();
  event.target.classList.add("piano-key-active");
};

const stopSound = (event) => {
  event.target.classList.remove("piano-key-active");
};

const startCorrespondOver = (event) => {
  if (event.target.classList.contains("piano-key")) {
    event.target.classList.add("piano-key-active");
  }

  PIANO_KEY.forEach((elem) => {
    elem.addEventListener("mouseover", startSound);
    elem.addEventListener("mouseout", stopSound);
  });
};

const stopCorrespondOver = () => {
  PIANO_KEY.forEach((elem) => {
    elem.classList.remove("piano-key-active");
    elem.removeEventListener("mouseover", startSound);
    elem.removeEventListener("mouseout", stopSound);
    elem.removeEventListener("keydown", playSound);
  });
};

fullBtn.addEventListener("click", toggleFullScreen);
window.addEventListener("keydown", playSound, false);
window.addEventListener("keyup", stopCorrespondOver);

PIANO.addEventListener("mousedown", startCorrespondOver, false);
PIANO.addEventListener("mouseup", stopCorrespondOver);
PIANO.addEventListener("mousedown", startSound);

//8bit style
//const context = new(window.AudioContext || window.webkitAudioContext)();
//const oscillator = context.createOscillator();
const header = document.querySelector("h1");
const body = document.querySelector("body");

function oldStyle() {
  body.classList.toggle("bit");
  btnChange.forEach((key) => key.classList.toggle("bit"));
}

header.addEventListener("click", oldStyle);

let sounds = [];
for (let i = 0; i < document.querySelectorAll(`audio`).length; i++) {
  sounds.push(document.querySelectorAll("audio")[i].src);
}

class Guitar {
  constructor(context, buffer) {
    this.context = context;
    this.buffer = buffer;
  }

  setup() {
    this.gainNode = this.context.createGain();
    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect(this.gainNode);
    this.gainNode.connect(this.context.destination);

    this.gainNode.gain.setValueAtTime(0.8, this.context.currentTime);
  }

  play() {
    this.setup();
    this.source.start(this.context.currentTime);
  }

  stop() {
    var ct = this.context.currentTime + 0.5;
    this.gainNode.gain.exponentialRampToValueAtTime(0.001, ct);
    this.source.stop(ct);
  }
}

class Buffer {
  constructor(context, urls) {
    this.context = context;
    this.urls = urls;
    this.buffer = [];
  }

  loadSound(url, index) {
    let request = new XMLHttpRequest();
    request.open("get", url, true);
    request.responseType = "arraybuffer";
    let thisBuffer = this;
    request.onload = function () {
      // Safari doesn't support promise based syntax
      thisBuffer.context.decodeAudioData(request.response, function (buffer) {
        thisBuffer.buffer[index] = buffer;
        /* updateProgress(thisBuffer.urls.length); */
        /* if (index == thisBuffer.urls.length - 1) {
          thisBuffer.loaded();
        } */
      });
    };
    request.send();
  }

  getBuffer() {
    this.urls.forEach((url, index) => {
      this.loadSound(url, index);
    });
  }
  /* loaded() {
    document.querySelector(".loading").style.opacity = 0;
    document.querySelector(".loading").style.height = 0;
    document.querySelector(".notes").style.height = "auto";
    document.querySelector(".notes").style.opacity = 1;
    loaded = true;
  } */

  getSound(index) {
    return this.buffer[index];
  }
}
let guitar = null;
let preset = 0;
let loaded = false;

function playGuitar() {
  let index = parseInt(this.dataset.note) + preset;
  guitar = new Guitar(context, buffer.getSound(index));
  guitar.play();
}

function stopGuitar() {
  guitar.stop();
}

let context = new (window.AudioContext || window.webkitAudioContext)();

let buffer = new Buffer(context, sounds);
let guitarSound = buffer.getBuffer();

let buttons = document.querySelectorAll(".notes .note");
buttons.forEach((button) => {
  button.addEventListener("mouseenter", playGuitar.bind(button));
  button.addEventListener("mouseleave", stopGuitar);
});
