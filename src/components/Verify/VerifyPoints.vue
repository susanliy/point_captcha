<template>
  <div style="position: relative">
    <div class="verify-img-out">
      <div
        class="p-5px relative box-content rounded-sm m-0"
        :style="{
          width: setSize.imgWidth,
          height: setSize.imgHeight,
          'background-size': setSize.imgWidth + ' ' + setSize.imgHeight,
        }"
      >
        <div
          class="w-25px h-25px text-center p-5px cursor-pointer absolute top-0 right-3px z-2"
          @click="refresh"
        >
          <undo-outlined />
        </div>
        <img
          class="w-full h-full block"
          :src="'data:image/png;base64,' + pointBackImgBase"
          ref="canvas"
          alt=""
          @click="bindingClick ? canvasClick($event) : undefined"
        />

        <div
          v-for="(tempPoint, index) in tempPoints"
          :key="index"
          class="text-[#fff] w-20px h-20px !text-center rounded-1/2 absolute bg-[#1abd6c] z-30"
          :style="{
            top: parseInt(tempPoint.y - 10) + 'px',
            left: parseInt(tempPoint.x - 10) + 'px',
          }"
        >
          {{ index + 1 }}
        </div>
      </div>
    </div>
    <div
      class="relative bg-[#fff] text-center box-content border-1 border-[#ddd] rounded-sm m-5px"
      :style="{
        width: setSize.imgWidth,
        color: barAreaColor,
        'border-color': barAreaBorderColor,
        'line-height': barSize.height,
      }"
    >
      <span class="z-3">{{ text }}</span>
    </div>
  </div>
</template>
<script type="text/babel">
/**
 * VerifyPoints
 * @description 点选
 * */
import { resetSize, _code_chars, _code_color1, _code_color2 } from "./src/util";
import { onMounted, reactive, ref, nextTick, getCurrentInstance } from "vue";
import { captchaGet, captchaCheck } from "./src/api";
import { UndoOutlined } from "@ant-design/icons-vue";

export default {
  name: "VerifyPoints",
  components: {
    UndoOutlined,
  },
  props: {
    imgSize: {
      type: Object,
      default() {
        return {
          width: "310px",
          height: "155px",
        };
      },
    },
    barSize: {
      type: Object,
      default() {
        return {
          width: "310px",
          height: "40px",
        };
      },
    },
  },
  emits: ["success", "error"],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    let secretKey = ref(""), //后端返回的ase加密秘钥
      checkNum = ref(3), //默认需要点击的字数
      fontPos = reactive([]), //选中的坐标信息
      checkPosArr = reactive([]), //用户点击的坐标
      num = ref(1), //点击的记数
      pointBackImgBase = ref(""), //后端获取到的背景图片
      pointTextList = reactive([]), //后端返回的点击字体顺序
      backToken = ref(""), //后端返回的token值
      setSize = reactive({
        imgHeight: 0,
        imgWidth: 0,
        barHeight: 0,
        barWidth: 0,
      }),
      tempPoints = reactive([]),
      text = ref(""),
      barAreaColor = ref(undefined),
      barAreaBorderColor = ref(undefined),
      showRefresh = ref(true),
      bindingClick = ref(true);

    const init = () => {
      //加载页面
      fontPos.splice(0, fontPos.length);
      checkPosArr.splice(0, checkPosArr.length);
      num.value = 1;
      getPicture();
      nextTick(() => {
        let { imgHeight, imgWidth, barHeight, barWidth } = resetSize(proxy);
        setSize.imgHeight = imgHeight;
        setSize.imgWidth = imgWidth;
        setSize.barHeight = barHeight;
        setSize.barWidth = barWidth;
      });
    };
    onMounted(() => {
      // 禁止拖拽
      init();
      proxy.$el.onselectstart = function () {
        return false;
      };
    });
    const canvas = ref(null);
    const canvasClick = (e) => {
      checkPosArr.push(getMousePos(canvas, e));
      if (num.value == checkNum.value) {
        num.value = createPoint(getMousePos(canvas, e));
        //按比例转换坐标值
        let arr = pointTransfer(checkPosArr, setSize);
        checkPosArr.length = 0;
        checkPosArr.push(...arr);
        //等创建坐标执行完
        setTimeout(() => {
          //发送后端请求
          let data = {
            points: checkPosArr,
            id: backToken.value,
          };
          //再一次进行验证--返回成功或者失败的提示
          captchaCheck(data).then((res) => {
            if (res.code === 0) {
              barAreaColor.value = "#4cae4c";
              barAreaBorderColor.value = "#5cb85c";
              text.value = "验证成功";
              bindingClick.value = false;
              window.callbackName(res);
              emit("success", res);
            } else {
              barAreaColor.value = "#d9534f";
              barAreaBorderColor.value = "#d9534f";
              text.value = "验证失败";
              setTimeout(() => {
                refresh();
              }, 700);
            }
          });
        }, 400);
      }
      if (num.value < checkNum.value) {
        num.value = createPoint(getMousePos(canvas, e));
      }
    };

    //app消息通知
    window.callbackName = function (res) {
      // 返回结果
      // code         Int       验证结果，0：验证成功。5000:失败。
      // data      String   null
      // datetime       String   时间
      // msg    String      消息通知
      // token     String    null
      console.log("callback:", res);
      window?.jsBridge &&
        window.jsBridge?.postMessage(JSON.stringify(res), "*");
    };
    //获取坐标
    const getMousePos = function (obj, e) {
      var x = e.offsetX;
      var y = e.offsetY;
      return { x, y };
    };
    //创建坐标点
    const createPoint = function (pos) {
      tempPoints.push(Object.assign({}, pos));
      return num.value + 1;
    };
    const refresh = function () {
      tempPoints.splice(0, tempPoints.length);
      barAreaColor.value = "#000";
      barAreaBorderColor.value = "#ddd";
      bindingClick.value = true;
      fontPos.splice(0, fontPos.length);
      checkPosArr.splice(0, checkPosArr.length);
      num.value = 1;
      getPicture();
      text.value = "验证失败";
      showRefresh.value = true;
    };

    // 请求背景图片和验证图片
    function getPicture() {
      captchaGet({}).then((res) => {
        if (res.data) {
          pointBackImgBase.value = res.data.imageData;
          backToken.value = res.data.id;
          pointTextList.value = res.data.words;
          text.value = "请依次点击【" + pointTextList.value.join(",") + "】";
        } else {
          text.value = res.msg;
        }
      });
    }
    //坐标转换函数
    const pointTransfer = function (pointArr, imgSize) {
      var newPointArr = pointArr.map((p) => {
        let x = Math.round((310 * p.x) / parseInt(imgSize.imgWidth));
        let y = Math.round((155 * p.y) / parseInt(imgSize.imgHeight));
        return { x, y };
      });
      return newPointArr;
    };
    return {
      secretKey,
      checkNum,
      fontPos,
      checkPosArr,
      num,
      pointBackImgBase,
      pointTextList,
      backToken,
      setSize,
      tempPoints,
      text,
      barAreaColor,
      barAreaBorderColor,
      showRefresh,
      bindingClick,
      canvas,
      canvasClick,
      getMousePos,
      createPoint,
      refresh,
      pointTransfer,
    };
  },
};
</script>
