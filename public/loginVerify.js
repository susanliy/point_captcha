let fakeIframe = document.createElement('div');
let iframeMask = document.createElement('div');

window.verifyModel = function (callbackName) {
  fakeIframe.innerHTML = '<iframe id="bbb" src="https://apicaptcha.xtioe.cn/" scrolling="no" allowtransparency="true" frameborder="0" border="0" marginheight="0" marginwidth="0" style="position: fixed; top: 30%;left:calc((100vw - 360px)/2); transition: opacity 0.3s ease 0s;  width: 360px; height: 280px; border: 1px solid rgb(229, 229, 229); border-radius: 3px; display: block; z-index:99;opacity: 1"></iframe>';

  iframeMask.innerHTML = '<div id="aaa" style="width: 100%; height: 100%;position:fixed;left: 0;top: 0;background: #000;opacity: .5;z-index: 98;"></div>'


  const show = () => {
    document.body.appendChild(fakeIframe)
    document.body.appendChild(iframeMask)

  }


  const callback = () => {
    callbackName()
  }

  return {
    show,
    callback
  }
}


window &&
  window.addEventListener('message', (event) => {
    if (event.data.type === 'close_verify_model') {
      document.body.removeChild(fakeIframe)
      document.body.removeChild(iframeMask)
    }
  });