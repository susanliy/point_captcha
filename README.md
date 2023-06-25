# Vue 3 + TypeScript + Vite 验证登录

## 安装使用

- 获取项目代码

```bash
git clone https://github.com/susanliy/point_captcha.git
```

- 安装依赖

```bash
pnpm install

```

- 运行

```bash
pnpm run dev 
```

- 打包

```bash
pnpm run build
```


## iframe嵌套页面

 1.在主项目的index.html中去添加（需要自行添加loginVerify.js文件，已经存储在本项目的/public文件夹下）
 
    <script src="./public/loginVerify.js"></script>


2.页面中调用

```
 const captcha = new verifyModel(async () => { //注册函数
    loading.value = true;
    window.removeEventListener('message', fn, true); //撤销全局的监听
  });

  
  function fn(event) {
    if (event.data.type === 'verify_success') {
      captcha.callback(); //调用成功方法
    }
  }


    captcha.show(); //调用打开弹窗的函数
    window && window.addEventListener('message', fn, true); //添加全局的监听



```