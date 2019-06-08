# 基于Gulp4 搭建本地服务器

> 版本：gulp 4.0

[Git地址](https://github.com/wforguo/gulpServer)

[官方文档](https://gulpjs.com/)

`gulp3`分支是基于`gulp3`搭建的

## 1.开发环境

`gulp4`

使用前需要先全局安装 `gulp4.0`

```bash
    npm install gulp-cli -g
    npm install gulp -D
```


## 2.使用方法

- 文件结构：

```
├── gulpfile.js  // 用于存放gulp脚本的文件
├── .babelrc     // ES6
├── pachage.json 
├── pachage-lock.json 
├── .gitignore   // 忽略文件配置
├── README.md

```
- 开始搭建

a、从[GitHub](https://github.com/wforguo/gulpServer)克隆整个项目到所需搭建的目标文件夹

b、在目录下，打开`cmd`执行 `npm i` （到这一步你就可以去使用了）

c、项目文件夹自己新建好，在项目下执行 `gulp start` 即可

d、打包，同启动在项目文件夹下执行`gulp build` 即可打包于build文件夹下

**.babelrc为ES6配置文件，必须要的**

```
1.安装依赖

npm install

2. 运行

gulp start

3. 打包

gulp build

```


注：启动时报：`Error: listen EADDRINUSE 10.96.120.82:8888` 说明该端口被占用了


## 3.Gulp4语法

相对Gulp3来讲，Gulp4的语法变得通俗多了；

#### 核心语句包含如下两行

`gulp4`不再能够通过数组形式传入任务，在`gulp4`中你需要使用`gulp.series()`和`gulp.parallel()`来执行他们。

- `gulp.series` 依赖顺序执行（异步）
- `gulp.parallel` 多个依赖嵌套`html`,`css`,`js` 并行（同步）

parallel和series函数可以接受函数作为参数

- 启动服务

```javascript
// start命令可自定义
gulp.task('start', gulp.series(gulp.parallel(connectServe, watchCode, openInBrowser)));
```

- 打包压缩

```javascript
// build命令可自定义
gulp.task('build', gulp.series(cleanBuild, gulp.parallel(htmlMin, imgMin, cssMin, jsMin)));
```

#### gulp4在gulp3的基础上新增了几个函数，但它的使用依旧简单方便。一共如下10个：

- gulp.src() --全局匹配一个或多个文件
- gulp.dest() --将文件写入目录
- gulp.symlink() --与dest相似，但是使用软连接形式
- gulp.task() --定义任务
- gulp.lastRun() --获得上次成功运行的时间戳
- gulp.parallel() --并行运行任务
- gulp.series() --运行任务序列
- gulp.watch() --当文件发生变化时做某些操作
- gulp.tree() --获得任务书树
- gulp.registry() --获得或注册任务

## 4.具体功能

**首先我们可以通过node来获取当前项目的文件路径，而不用每次手动去改变**
 
```javascript
    // 获取当前文件夹路径
    baseRoot = process.env.INIT_CWD;
```

#### a、监听html、css、js改变实现热刷新

可以对`html`、`css`、`js`实时监听并编译，支持`LESS`编译及`ES6`语法

```javascript
const watchCode = function () {
    return new Promise(resolve => {
        // 监听
        gutil.log(baseRoot);
        // 获取当前文件夹路径
        let baseFile = baseRoot;
        // 斜杠转义，讲\转成/
        baseFile = baseFile.replace(/\\/g, "/");
        gutil.log(baseFile);
        gulp.watch([baseFile + '/*.html'], gulp.series(htmlCompile));
        gulp.watch([baseFile + '/js/*.js'], gulp.series(jsCompile));
        gulp.watch(baseFile + '/css/*.css', gulp.series(cssCompile));
        gulp.watch(baseFile + '/img/*', gulp.series(imgComplie));
        gulp.watch(baseFile + '/less/*.less', gulp.series(lessCompile));
        resolve();
    });
};

```

#### b、less实时编译

```javascript

const lessCompile = function () {
    // less编译
    return gulp.src( baseRoot + '/less/*.less' )
    /*gulp.src(baseRoot + '/less/style.less')*/
    .pipe(less())
    .pipe(autoprefix('last 3 versions'))  // 前缀
    // .pipe(cssmin()) // 压缩
    .pipe(gulp.dest(baseRoot + '/css'))
    .pipe(connect.reload())
};

```
#### c、项目打包

首先，先将打包文件夹做一个清空处理

```javascript
const cleanBuild = function () {
    // 清除build下的文件
    // return
	return del([
		// 'dist/report.csv',
		// 这里我们使用一个通配模式来匹配 `mobile` 文件夹中的所有东西
		baseRoot + '/build/*',
		// 我们不希望删掉这个文件，所以我们取反这个匹配模式
		// '!dist/mobile/deploy.json'
	]);
};
```

利用`gulp4`的`series`异步执行，等清理完成，再同步去执行打包任务（包括`html`、`css`、`js`压缩）


```javascript
gulp.task('build', gulp.series(cleanBuild, gulp.parallel(htmlMin, imgMin, cssMin, jsMin)));
```


#### d、css 压缩

添加前缀并压缩

```javascript
  // 添加CSS前缀并压缩
    return new Promise(resolve => {
        gulp.src(baseRoot + '/css/*.css')
        .pipe(autoprefix('last 3 versions'))  // 前缀
        .pipe(cssmin())
        // .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(baseRoot + '/build/css'));
        resolve();
    });

```

#### e、js压缩

支持ES6语法，并压缩

```javascript
const jsMin = function () {
    // ES6 编译并压缩
    return new Promise(resolve => {
        gulp.src(baseRoot + '/js/*.js')
        .pipe(babel())
        .pipe(uglify())
        // .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(baseRoot + '/build/js'));
        resolve();
    });
};
```

#### f、html压缩

```javascript

const htmlMin = function () {
    // html压缩
    return new Promise(resolve => {
        var options = {
            removeComments: true,//清除HTML注释
            collapseWhitespace: true,//压缩HTML
            collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
            removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
            removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
            removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
            minifyJS: true,//压缩页面JS
            minifyCSS: true//压缩页面CSS
        };
        gulp.src(baseRoot + '/*.html')
        .pipe(htmlmin(options))
        .pipe(gulp.dest(baseRoot + '/build'));
        resolve();
    });
};

```
