<template>
  <div class="verify-style" :style="{ opacity: !visible ? 0 : 1 }">
    <div class="flex justify-between py-10px px-8px text-16px rounded-md">
      安全校验
      <span class="icon-style" @click="hideModal"
        ><close-circle-outlined
      /></span>
    </div>
    <VerifyPoints :captchaType="'clickWord'" @success="verifySuccess" />
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import VerifyPoints from "./components/Verify/VerifyPoints.vue";
import { CloseCircleOutlined } from "@ant-design/icons-vue";

const visible = ref(true);
const showModal = () => {
  visible.value = true;
};

//关闭弹窗通知
const hideModal = () => {
  visible.value = false;
  window.parent.postMessage(
    {
      type: "close_verify_model",
    },
    "*"
  );
};

defineExpose({ showModal, hideModal });

//验证成功往外进行通知
function verifySuccess(res) {
  hideModal();
  window.parent.postMessage(
    {
      type: "verify_success",
      res,
    },
    "*"
  );
}

//接受打开弹窗的信息
window &&
  window.addEventListener("message", (event) => {
    if (event.data.type === "open_verify_model") {
      showModal();
    } else if (event.data.type === "close_verify_model") {
      hideModal();
    }
  });
</script>
<style>
.verify-style {
  font-family: "Helvtical,microsoft yahei,sans-serif";
  -webkit-background-size: 20% 20%;
  -o-background-size: 20%;
  background-size: 20%;
  background-position: 50% 32%;
  background-color: #fff;
  -webkit-border-radius: 0.08rem;
  border-radius: 0.08rem;
  visibility: visible;
  z-index: 2000000002;
  overflow: hidden;
}
.icon-style {
  cursor: pointer;
}
</style>
