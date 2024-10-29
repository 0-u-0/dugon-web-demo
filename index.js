const currentUrl = new URL(window.location.href);
const hostWithoutPort = currentUrl.hostname;
const signalServer = `ws://${hostWithoutPort}:8800`;
//var
let videoStream = null;
let audioStream = null;

const streams = new Map();

let room = null;

//utils
const $ = document.querySelector.bind(document);

function browserDetect() {
  const ua_string = navigator.userAgent;

  function chromeBrowser() {
    let result = {
      name: null,
      version: 0,
      chromeVersion: 0
    };
    let browserArray;

    const qq_re = new RegExp("Chrome/([0-9]+).+QQBrowser/([0-9.]+)", "g");
    const baidu_re = new RegExp("Chrome/([0-9]+).+BIDUBrowser/([0-9.]+)", "g");
    const maxthon_re = new RegExp("Chrome/([0-9]+).+Maxthon/([0-9.]+)", "g");
    const lb_re = new RegExp("Chrome/([0-9]+).+LBBROWSER", "g");
    const sogou_re = new RegExp("Chrome/([0-9]+).+SE.+MetaSr");
    const chrome_re = new RegExp("Chrome/([0-9.]+)");
    const se_360_re = new RegExp("Chrome/([0-9]+).+360SE");
    const ee_360_re = new RegExp("Chrome/([0-9]+).+360EE");
    const explorer_2345 = new RegExp("Chrome/([0-9]+).+2345Explorer/([0-9.]+)");

    if (browserArray = explorer_2345.exec(ua_string)) {
      result.name = '2345';
      result.chromeVersion = browserArray[1];
      result.version = browserArray[2];
    } else if (browserArray = qq_re.exec(ua_string)) {
      result.name = 'QQ';
      result.chromeVersion = browserArray[1];
      result.version = browserArray[2];
    } else if (browserArray = baidu_re.exec(ua_string)) {
      result.name = 'Baidu';
      result.chromeVersion = browserArray[1];
      result.version = browserArray[2];
    } else if (browserArray = maxthon_re.exec(ua_string)) {
      result.name = 'Maxthon';
      result.chromeVersion = browserArray[1];
      result.version = browserArray[2];
    } else if (browserArray = lb_re.exec(ua_string)) {
      result.name = 'LB';
      result.chromeVersion = browserArray[1];
      result.version = 0;
    } else if (browserArray = sogou_re.exec(ua_string)) {
      result.name = 'Sougo';
      result.chromeVersion = browserArray[1];
      result.version = 0;
    } else if (browserArray = se_360_re.exec(ua_string)) {
      result.name = '360SE';
      result.chromeVersion = browserArray[1];
      result.version = 0;
    } else if (browserArray = ee_360_re.exec(ua_string)) {
      result.name = '360EE';
      result.chromeVersion = browserArray[1];
      result.version = 0;
    } else if (browserArray = chrome_re.exec(ua_string)) {
      result.name = 'Chrome';
      result.chromeVersion = browserArray[1];
      result.version = browserArray[1];
    }

    return result
  }

  const edge_re = new RegExp("Edge/([0-9.]+)", "g");
  const firefox_re = new RegExp("Firefox/([0-9.]+)", "g");
  const chrome_kind_re = new RegExp("Chrome/([0-9.]+)", "g");
  const ie_re = new RegExp("\.NET.+rv:([0-9.]+)", "g");
  const safari_re = new RegExp("Version/([0-9.]+).+Safari", "g");
  let browserArray;
  let result = {
    name: "",
    version: 0,
    chromeVersion: 0,
  };

  if (browserArray = edge_re.exec(ua_string)) {
    result.name = 'Edge';
    result.version = browserArray[1];
  } else if (browserArray = firefox_re.exec(ua_string)) {
    result.name = 'Firefox';
    result.version = browserArray[1];
  } else if (chrome_kind_re.test(ua_string)) {
    result = chromeBrowser();
  } else if (browserArray = ie_re.exec(ua_string)) {
    result.name = 'IE';
    result.version = browserArray[1];
  } else if (browserArray = safari_re.exec(ua_string)) {
    result.name = 'Safari';
    result.version = browserArray[1];
  }

  return {
    name: result.name,
    version: parseInt(result.version),
    versionString: result.version,
    chromeVersion: parseInt(result.chromeVersion)
  }
}
// audiooutput,audioinput,videoinput,all
async function getDevices(type) {
  const devices = await navigator.mediaDevices.enumerateDevices();

  const devicesList = []
  let i = 0;
  for (let device of devices) {
    if (device.kind == type || type == 'all') {
      let new_device = {};

      if (device.label === '') {
        //todo add warning
        i++;
        if (device.kind == 'videoinput') {
          new_device.label = 'Camera-' + i;
        }
        else if (device.kind == 'audioinput') {
          new_device.label = 'Mic-' + i;
        }
        else if (device.kind == 'audiooutput') {
          new_device.label = 'Speaker-' + i;
        }
        else {
          //todo add warning
          i--;
          new_device.label = 'unknown device';
        }
      }
      else {
        new_device.label = device.label;
      }

      new_device.groupId = device.groupId;
      new_device.deviceId = device.deviceId;
      new_device.kind = device.kind;

      devicesList.push(new_device);
    }
  }

  return devicesList;
}

function cssVarGetter(varName) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(varName);
}

function calcContentHeight() {
  let left = $('#itemList').offsetHeight - parseInt(cssVarGetter('--label-height')) * 4 - parseInt(cssVarGetter('--item-margin')) * 4;
  if (left <= 0) {
    left = 300;
  }
  return left;
}

function storeValue(id) {
  let ele = $(id);

  ele.onblur = _ => {
    localStorage.setItem(id, ele.value);
  };

  if (localStorage.getItem(id)) {
    ele.value = localStorage.getItem(id);
  }

}

function randomId(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function blocker(secodes) {
  return new Promise((y, n) => {
    setTimeout(function () {
      y();
    }, secodes * 1000);
  })
}


//TODO(CC): add sender pause
function generateParticipantRow(userId, username) {
  const participantRow = document.createElement('div');
  participantRow.classList.add('participantRow');
  participantRow.id = `participantRow-${userId}`;
  participantRow.innerHTML = `
  <img src="images/participant.png"><span class="labelText">${username} </span>
  <span class="imagesBox">
    <input id="videoSwitch-${userId}" type="image" src="images/nowebcam.png" data-media="video" data-enable=false data-local=false
      onclick="mediaChange(this)" disabled=true>
    <input id="audioSwitch-${userId}" type="image" src="images/nomic.png" data-media="audio" data-enable=false data-local=false
      onclick="mediaChange(this)" disabled=true>
  </span>`;

  $('#participantList').append(participantRow);
}

function mediaChange(obj) {
  const { id, media, enable, local } = obj.dataset;

  console.log(obj.dataset);

  const stream = streams.get(id);

  console.log(stream);
  if (enable === 'true') {
    stream.pause();

    if (media === 'video') {
      obj.src = 'images/nowebcam.png';

      if (local === 'false') {
        addCover($(`#${obj.id.replace('videoSwitch', 'videoBox')}`));
      }
    } else {
      obj.src = 'images/nomic.png';
    }
  } else {
    stream.resume();

    if (media === 'video') {
      obj.src = 'images/webcam.png';

      if (local === 'false') {
        removeCover($(`#${obj.id.replace('videoSwitch', 'videoBox')}`));
      }
    } else {
      obj.src = 'images/mic.png';
    }
  }

  obj.dataset.enable = !(enable === 'true');
}


function addCover(videoBox) {
  for (let i = 0; i < videoBox.children.length; i++) {
    const c = videoBox.children[i];
    if (c.tagName === 'VIDEO') {
      c.style.display = 'none';
      break;
    }
  }
  videoBox.insertAdjacentHTML('afterbegin', `<img src="images/novideo.png">`);
}

function removeCover(videoBox) {
  for (let i = 0; i < videoBox.children.length; i++) {
    const c = videoBox.children[i];
    if (c.tagName === 'VIDEO') {
      c.style.display = '';
    } else if (c.tagName === 'IMG') {
      c.remove();
    }
  }
}


function changeState(userId, kind, isPaused) {

  if (kind === 'video') {
    const videoBox = $(`#videoBox-${userId}`);

    const videoSwitch = $(`#videoSwitch-${userId}`);

    if (isPaused) {

      videoSwitch.disabled = true;

      if (videoSwitch.dataset.enable === 'true') {
        addCover(videoBox);
        videoSwitch.src = "images/nowebcam.png";
      }

      // videoSwitch.src = "images/webcam.png";
      // videoSwitch.dataset.enable = true;
    } else {
      videoSwitch.disabled = false;

      if (videoSwitch.dataset.enable === 'true') {
        removeCover(videoBox);
        videoSwitch.src = "images/webcam.png";
      }
    }

  } else if (kind === 'audio') {
    const audioSwitch = $(`#audioSwitch-${userId}`);

    if (isPaused) {

      audioSwitch.disabled = true;

      if (audioSwitch.dataset.enable === 'true') {
        audioSwitch.src = "images/nomic.png";
      }

    } else {
      audioSwitch.disabled = false;

      if (audioSwitch.dataset.enable === 'true') {
        audioSwitch.src = "images/mic.png";
      }
    }
  }
}

//sdk part
async function initSession(username, roomId) {

  let room = Dugon.Room(signalServer, {
    roomId,
    username,
  });

  room.onuser = async user => {
    console.log(user.id, ' in');
    generateParticipantRow(user.id, user.name);

    user.onstream = (stream) => {
      console.log('remote stream');
      room.subscribe(stream);
      // stream.on
      stream.onsub = () => {
        streams.set(stream.id, stream);

        if ($(`#videoBox-${user.id}`) === null) {
          const videoBox = document.createElement('div');
          videoBox.id = `videoBox-${user.id}`;

          videoBox.classList.add('videoBox');

          const newVideo = document.createElement('video');
          newVideo.id = `video-${user.id}`;
          newVideo.autoplay = true;
          newVideo.setAttribute('poster', 'images/loading.gif');

          videoBox.append(newVideo);

          $('#videoList').append(videoBox);
        }


        if (stream.kind === 'video') {
          const videoSwitch = $(`#videoSwitch-${user.id}`);
          videoSwitch.dataset.id = stream.id;

          if (stream.pubPaused) {
            const videoBox = $(`#videoBox-${user.id}`);
            addCover(videoBox);
          } else {
            videoSwitch.disabled = false;
            videoSwitch.src = "images/webcam.png";
            videoSwitch.dataset.enable = true;
          }

        } else if (stream.kind === 'audio') {
          const audioSwitch = $(`#audioSwitch-${user.id}`);
          audioSwitch.dataset.id = stream.id;

          if (!stream.pubPaused) {
            audioSwitch.disabled = false;
            audioSwitch.src = "images/mic.png";
            audioSwitch.dataset.enable = true;
          }
        }

        stream.play(`#video-${user.id}`);
      };

      stream.onclose = () => {
        console.log('close');

        streams.delete(stream.id);
        // TODO(cc): 10/29/24 
        //   stream.removeTrack(stream.getTrackById(receiver.id));
        //   if (stream.getTracks().length === 0) {
        //     $(`#videoBox-${receiver.tokenId}`).remove();
        //   }
      };

      stream.onpause = () => {
        console.log('pause');
        changeState(user.id,stream.kind,true);
      };

      stream.onresume = () => {
        console.log('resume');
        changeState(user.id,stream.kind,false);
      };
    };

    user.onleave = () => {
      console.log(user.id, ' out');
      $(`#participantRow-${user.id}`).remove();
    };
  };

  room.onclose = () => {

  };

  await room.connect();
  console.log('join!');

  if (audioStream) {
    room.publish(audioStream, { metadata: { name: 'audio' } });

    $('#localAudioSwitch').disabled = false;
    $('#localAudioSwitch').src = "images/mic.png";
    $('#localAudioSwitch').dataset.enable = true;
    $('#localAudioSwitch').dataset.id = audioStream.id;
  }

  if (videoStream) {
    room.publish(videoStream, { metadata: { name: 'audio' } });

    $('#localVideoSwitch').disabled = false;
    $('#localVideoSwitch').src = "images/webcam.png";
    $('#localVideoSwitch').dataset.enable = true;
    $('#localVideoSwitch').dataset.id = audioStream.id;
  }

}

//animation
async function animation() {

  $("#maskLayer").classList.add("disappear");
  await blocker(0.5);
  $("#maskLayer").style.display = 'none';

  $("#itemList").classList.add("fadein");

  $("#myselfItem").classList.add("slidein");

  await blocker(0.5);

  $("#participantItem").classList.add("slidein");

  await blocker(0.8);

  $("#participantsContent").style.maxHeight = calcContentHeight() + 'px';

  let times = 200;
  let step = calcContentHeight() / times;
  let index = 0;
  let height = 0;
  let frame = 4;
  let id = setInterval(function () {
    if (index < times) {
      index++;
      height += step;
      $("#participantsContent").style.height = height + 'px';
    } else {
      clearInterval(id);
    }
  }, frame);

  $("#chatItem").classList.add("slidein");

  $("#pollItem").classList.add("slidein");

  await blocker(0.8)
  $("#videoList").classList.add("fadein");
}

//event
function drawerEventListen() {
  const drawers = document.querySelectorAll(".drawer");

  //TODO: rename
  for (let label of drawers) {
    label.onclick = () => {
      const content = label.nextElementSibling;
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = calcContentHeight() + "px";
        content.style.height = calcContentHeight() + "px";

        for (let c of drawers) {
          if (c != label && content.style.maxHeight) {
            c.nextElementSibling.style.maxHeight = null;
          }
        }
      }

    }
  }
}

async function loginEnter(event) {
  if (event.keyCode === 13) {
    let username, room;

    if ($('#usernameInput').value === '') {
      username = randomId(10);
    } else {
      username = $('#usernameInput').value;
    }

    if ($('#roomInput').value === '') {
      room = randomId(10);
    } else {
      room = $('#roomInput').value;
    }

    $('#myName').innerText = username;

    await animation();
    await initSession(username, room);

  }
}

//
window.onload = async _ => {
  const { name: browserName, version, versionString, chromeVersion } = browserDetect();
  const supportingVersion = 80;
  if (browserName != 'Chrome') {
    alert('Only supporting Chrome.');
  } else if (version < supportingVersion) {
    alert(`Only supporting Chrome M${supportingVersion}+.`);
  }

  //register some events
  storeValue('#usernameInput');
  storeValue('#roomInput');

  $('#usernameInput').onkeydown = loginEnter;
  $('#roomInput').onkeydown = loginEnter;

  drawerEventListen();

  // devices
  const videoDevices = await getDevices('videoinput');
  const audioDevices = await getDevices('audioinput');

  let video = false;
  if (videoDevices.length > 0) {
    video = true;
  }

  let audio = false;
  if (audioDevices.length > 0) {
    audio = true;
  }

  //TODO: add devices selector and resolution selector
  if (video || audio) {
    try {
      if (video) {
        videoStream = await Dugon.Stream({ video: true });
        videoStream.play('#localVideo')

        streams.set(videoStream.id, videoStream);
      }
      if (audio) {
        audioStream = await Dugon.Stream({ audio: true });
        audioStream.play('#localVideo')

        streams.set(audioStream.id, audioStream);
      }
    } catch (e) {
      console.log(e);
      alert('Local devices was banned.Check your Chrome Settings.');
    }
  }


};

