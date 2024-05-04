const actx = new AudioContext();

const files = [];
let ready = false;

function getAudio(url) {
  return new Promise((resolve, reject) => {
    console.log(url);
    fetch(url)
      .then((r) => r.arrayBuffer())
      .then((r) => actx.decodeAudioData(r))
      .then((r) => {
        const file = {
          name: url,
          buffer: r,
          gainNode: actx.createGain(),
          panNode: actx.createStereoPanner(),
        };

        file.gainNode.gain.value = 0.5;

        files.push(file);

        resolve(file);
      })
      .catch((e) => { reject(e); });
  });
}

function onSliderChange(name, value) {
  const audio = files[3];

  // update dom
  const elm = document.getElementById(name);
  elm.innerHTML = value;

  switch (name) {
    case 'volume':
      audio.gainNode.gain.value = elm.innerHTML / 50 - 1;
      break;

    case 'speed':
      audio.rate = elm.innerHTML / 100;
      if (audio.src) { audio.src.playbackRate.value = audio.rate; }
      break;

    case 'pan':
      audio.panNode.pan.value = elm.innerHTML / 100;
      break;

    case 'scrub':
      reset(value);
      break;

    default:
  }
}

function playSound(audio) {
  const src = actx.createBufferSource();
  src.buffer = audio.buffer;

  src.connect(audio.gainNode);
  audio.gainNode.connect(actx.destination);
  
  src.start(0);
}

function loop(dt = 0) {
  dt = performance.now() - dt;

  if (files[3].status === 'active') {
    files[3].note += files[3].rate * dt / 1000;

    if (files[3].duration <= files[3].note && !files[3].looping) {
      stop();
    }

    files[3].note %= files[3].duration;

    // update dom
    document.getElementById('scrub').innerHTML = parseInt(files[3].note) % parseInt(files[3].duration);
    document.getElementById('s-scrub').value = document.getElementById('scrub').innerHTML;
  }

  dt = performance.now();
  setTimeout(() => { loop(dt); }, 100);
}

function handleClick(index) {
  if(!ready) { return; }

  switch (index) {
    case 0:
    case 1:
    case 2: playSound(files[index]); break;
    case 3: start(); break;
    case 4: stop(); break;
    case 5: reset(); break;
    case 6: setLoop(); break;
    default:
  }
}

function start() {
  const audio = files[3];

  if (audio.status !== 'active') {
    // set status for dom control
    audio.status = 'active';

    // create source buffer
    const src = actx.createBufferSource();
    src.buffer = audio.buffer;
    src.loop = audio.looping;
    src.playbackRate.value = audio.rate;


    // timers
    if (!audio.duration) { audio.duration = audio.buffer.duration; }
    audio.startTime = (Date.now() / 1000);
    audio.note = audio.note % audio.duration;

    // gain node
    src.connect(audio.gainNode);
    src.connect(audio.panNode);
    audio.gainNode.connect(actx.destination);
    audio.panNode.connect(actx.destination);

    // assign src to audio object
    audio.src = src;
    audio.src.start(0, audio.note);

    // update dom
    document.getElementById('b-play').classList.add('c-disabled');
    document.getElementById('b-pause').classList.remove('c-disabled');
  }
}

function stop() {
  const audio = files[3];

  if (audio.status !== 'inactive') {
    // set status for dom control
    audio.status = 'inactive';

    // calc current note for restart
    // audio.note = (Date.now() / 1000) - audio.startTime + audio.note;

    // stop playback
    audio.src.stop(0);
    audio.src = undefined;

    // update dom
    document.getElementById('b-pause').classList.add('c-disabled');
    document.getElementById('b-play').classList.remove('c-disabled');
  }

}

function reset(note = 0) {
  const audio = files[3];

  if (audio.status === 'active') {
    stop();
    audio.note = note;
    start();
  } else {
    audio.note = note;
  }
}

function setLoop() {
  const audio = files[3];
  const elm = document.getElementById('b-loop');

  // invert looping on audio object
  audio.looping = !audio.looping;

  // if currently playing, set loop
  if (audio.src) { audio.src.loop = audio.looping; }

  // update dom
  audio.looping ? elm.classList.remove('c-disabled') : elm.classList.add('c-disabled');
}

function init() {

  const ids = Array.from(document.getElementsByClassName('identifier'));

  ids.forEach((id) => {
    id.innerHTML = document.getElementById(`s-${id.id}`).value;
  });

  Promise.all([
    getAudio('./audio/collision8-bit.ogg'),
    getAudio('./audio/smallexplosion8-bit.ogg'),
    getAudio('./audio/heal8-bit.ogg'),
    getAudio('./audio/io.ogg')
  ]).then((r) => {
    const audio = files[3];

    // set base values
    audio.note = 0;
    audio.status = 'inactive';
    audio.rate = 1;
    audio.duration = audio.buffer.duration;

    // set dom elements
    document.getElementById('s-scrub').max = audio.duration;

    loop();

    ready = true;
  });
}