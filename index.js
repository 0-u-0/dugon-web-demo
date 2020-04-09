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

    $("#maskLayer").classList.add("disappear");
    await blocker(0.5);
    $("#maskLayer").style.display = 'none';


    $("#itemList").classList.add("fadein");

    // await blocker(0.5);

    $("#myselfItem").classList.add("slidein");

    await blocker(0.5);

    $("#participantItem").classList.add("slidein");

    await blocker(0.8);

    // $("#participantsContent").style.maxHeight = calcContentHeight() + 'px';


    $("#participantsContent").style.maxHeight = calcContentHeight() + 'px';

    let times = 200;
    let step = calcContentHeight() / times;
    let index = 0;
    let height = 0;
    let frame = 4;
    let id = setInterval(function () {
      if (index++ < times) {
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
}


//
window.onload = async _ => {

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
      const stream = await navigator.mediaDevices.getUserMedia({ video: video, audio: audio });
      $('#localVideo').srcObject = stream;
    } catch (e) {
      alert('Local devices was banned.Check your Chrome Settings.');
    }
  }


};

