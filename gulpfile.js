const gulp = require('gulp'),
    gutil = require('gulp-util'),
    less = require('gulp-less'),
    connect = require('gulp-connect'),
    // proxy = require('http-proxy-middleware'),
    babel = require('gulp-babel'), // ES6
    // webserver = require('gulp-webserver'),
    // rename = require('gulp-rename'),
    ip = require('ip'), // 本地IP
    imagemin = require('gulp-imagemin'), // 图片压缩
    cssmin = require('gulp-cssmin'), // CSS压缩
    uglify = require('gulp-uglify'), // js混淆
    autoprefix = require('gulp-autoprefixer'), // CSS前缀
    htmlmin = require('gulp-htmlmin'), // HTML压缩
    open = require('gulp-open'),
    clean = require('gulp-clean'), // 清空指定文件夹
    host = ip.address(),
    port = '8888',
    baseRoot = process.env.INIT_CWD;

gutil.log(baseRoot);

gulp.task('htmlCompile',function(){
    // html编译
    return gulp.src( baseRoot + '/*.html' )
    .pipe(connect.reload());
});

const htmlCompile = function () {
    // html编译
    return gulp.src( baseRoot + '/*.html' )
    .pipe(connect.reload());
};

const jsCompile = function () {
    // js编译
    return gulp.src( baseRoot + '/js/*.js' )
    .pipe(connect.reload());
};

const cssCompile = function () {
    // CSS 编译
    return gulp.src( baseRoot + '/css/*.css' )
    .pipe(connect.reload());
};

const imgComplie = function () {
    // img 编译
    return gulp.src( baseRoot + '/img/*' )
    .pipe(connect.reload());
};

const lessCompile = function () {
    // less编译
    return gulp.src( baseRoot + '/css/*.less' )
    /*gulp.src(baseRoot + '/less/style.less')*/
    .pipe(less())
    .pipe(autoprefix('last 3 versions'))  // 前缀
    // .pipe(cssmin()) // 压缩
    .pipe(gulp.dest(baseRoot + '/css'))
    .pipe(connect.reload())
};

const connectServe = function () {
    return new Promise(resolve => {
        connect.server({
            root: baseRoot,
            host: host,
            port: port,
            livereload: true,
            middleware: function(connect, o) {
                return [ (function() {
                    // 设置代理
                    var url = require('url');
                    var proxy = require('proxy-middleware');
                    var options = url.parse('http://www2.zjlottery.com/gtxml/');
                    options.route = '/api';
                    return proxy(options);
                })() ];
            }
        });
        resolve();
    });
};

const watchCode = function () {
    return new Promise(resolve => {
        // 监听
        // gutil.log(baseRoot);
        let baseFile = baseRoot;
        // 斜杠转义
        baseFile = baseFile.replace(/\\/g, "/");
        // gutil.log(baseFile);
        gulp.watch([baseFile + '/*.html'], htmlCompile);
        gulp.watch([baseFile + '/js/*.js'], jsCompile);
        gulp.watch(baseFile + '/css/*.css', cssCompile);
        gulp.watch(baseFile + '/imgs/*', imgComplie);
        gulp.watch(baseFile + '/css/*.less', lessCompile);
        resolve();
    });
};

const openInBrowser = function () {
    return new Promise(resolve => {
        let options = {
            uri : 'http://' + host + ':' + port,
            // app: 'chrome' // 指定浏览器打开
        };
        gulp.src(__filename)
        .pipe(open(options));
        resolve();
    })
};

const cssMin = function () {
    // 添加CSS前缀并压缩
    return new Promise(resolve => {
        gulp.src(baseRoot + '/css/*.css')
        .pipe(autoprefix('last 3 versions'))  // 前缀
        .pipe(cssmin())
        // .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(baseRoot + '/build/css'));
        resolve();
    });
};

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
        .pipe(gulp.dest(baseRoot + '/build/html'));
        resolve();
    });
};

const imgMin = function() {
    // 压缩图片
    return new Promise(resolve => {
        gulp.src(baseRoot + '/img/*')
        .pipe(imagemin())
        .pipe(gulp.dest(baseRoot + '/build/img'));
        resolve();
    });
};

const cleanBuild = function () {
    // 清除build下的文件
    // return
    return new Promise((resolve) => {
        gulp.src(baseRoot + '/build/*')
        .pipe(clean());
        resolve()
    })
};

//gulp.series|4.0 依赖顺序执行
//gulp.parallel|4.0 多个依赖嵌套'html','css','js' 并行

// 启动服务
gulp.task('start', gulp.series(gulp.parallel(connectServe, watchCode, openInBrowser)));

// 打包压缩
let build = gulp.series(cleanBuild, gulp.parallel(htmlMin, imgMin, cssMin, jsMin));
gulp.task('build', build);

gulp.task('less', lessCompile);

