import request from "../../../utils/axios.js";

enum Api {
  GetCaptcha = "/Captcha/Get",
  CheckCaptcha = "/Captcha/Check",
}

//获取验证图片  以及token
export function captchaGet(data) {
  return request({
    url: Api.GetCaptcha,
    method: "post",
    data,
  });
}

//滑动或者点选验证
export function captchaCheck(data) {
  return request({
    url: Api.CheckCaptcha,
    method: "post",
    data,
  });
}
