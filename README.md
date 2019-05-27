# gulpServer

> 版本：gulp 4.0

 *魏国 2019/05/26*

## 开发环境

gulp

使用前需要先全局安装 `gulp4.0`

```bash
  npm install --global gulp-cli
```

## 使用方法

a、首先将 `gulpfile.js` 和 `pachage.json` 以及 `.babelrc` 拷贝至需要的目录

b、在目录下，打开`cmd`执行 `npm i`

c、项目文件夹自己新建好，在项目下执行 `gulp start` 即可

d、打包，同启动在项目文件夹下执行`gulp build` 即可打包于build文件夹下


```
1.安装依赖

npm install

2. 运行

gulp start

3. 打包

gulp build

```


注：启动时报：`Error: listen EADDRINUSE 10.96.120.82:8888` 说明该端口被占用了