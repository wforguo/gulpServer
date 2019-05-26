var
    os = require('os'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    less = require('gulp-less'),
    path = require('path'),
    connect = require('gulp-connect'),
    // proxy = require('http-proxy-middleware'),
	babel = require('gulp-babel'),
    // webserver = require('gulp-webserver'),
    rename = require('gulp-rename'),
	ip = require('ip'),
    imagemin = require('gulp-imagemin'),
    cssmin = require('gulp-cssmin'),
    uglify = require('gulp-uglify'),
	autoprefix = require('gulp-autoprefixer'), // CSS前缀
    htmlmin = require('gulp-htmlmin'), //HTML压缩
    // pump = require('pump'),
    open = require('gulp-open'),


    host = ip.address(),
    port = '80',

	baseRoot = process.env.INIT_CWD;
	/*
	gulp.task('connect', function() {
		connect.server({
			root: baseRoot,
			host: host,
			port: port,
			livereload: true,
			middleware: function(connect, opt) {
				var apiProxy = proxy('/api', {
					target: 'http://www2.zjlottery.com/gtxml/',
					changeOrigin: true   // for vhosted sites
				});
				return [apiProxy];
			}
		});
	});
	*/

	gulp.task('connect', function() {
		connect.server({
			root: baseRoot,
			host: host,
			port: port,
			livereload: true,
			middleware: function(connect, o) {
				return [ (function() {
					var url = require('url');
					var proxy = require('proxy-middleware');
					var options = url.parse('http://www2.zjlottery.com/gtxml/');
					options.route = '/api';
					return proxy(options);
				})() ];
			}
		});
	});

	/*gulp.task('webserver', function() {
		gulp.src(baseRoot)
			.pipe(webserver({
				host:host,
				port:port,
				livereload: true,
				open: true
			}));
	});*/

	gulp.task('html', function () {
		gulp.src( baseRoot + '/*.html' )
			.pipe(connect.reload());
	});

	gulp.task('js', function () {
		gulp.src( baseRoot + '/js/*.js' )
			.pipe(connect.reload());
	});

	gulp.task('css', function () {
		gulp.src( baseRoot + '/css/*.css' )
			.pipe(connect.reload());
	});



	// CSS前缀

	gulp.task('styles', function() { 
		gulp.src( baseRoot + '/css/*.less' )
		.pipe(autoprefix('last 3 versions')) 
		.pipe(gulp.dest(baseRoot + '/build/css')); 
	});

	gulp.task('cssmin', function () {
		gulp.src(baseRoot + '/css/*.css')
			.pipe(autoprefix('last 3 versions'))  // 前缀
			.pipe(cssmin())
			// .pipe(rename({suffix: '.min'}))
			.pipe(gulp.dest(baseRoot + '/build/css'));
	});
	
	// less编译

	gulp.task('less', function() {
		gulp.src( baseRoot + '/css/*.less' )
		/*gulp.src(baseRoot + '/less/style.less')*/
			.pipe(less())
			.pipe(autoprefix('last 3 versions'))  // 前缀
			.pipe(cssmin()) // 压缩
			.pipe(gulp.dest(baseRoot + '/css'))
			.pipe(connect.reload());
	});

	gulp.task('images', function () {
		gulp.src( baseRoot + '/imgs/*' )
			.pipe(connect.reload());
	});

	gulp.task('watch', function () {
		gutil.log(baseRoot);
		gulp.watch([baseRoot + '/*.html'], ['html']);
		gulp.watch([baseRoot + '/js/*.js'], ['js']);
		gulp.watch([baseRoot + '/css/*.css'], ['css']);
		gulp.watch([baseRoot + '/imgs/*'], ['images']);
		gulp.watch([baseRoot + '/css/*.less' ], ['less']);
	});

	gulp.task('open', function(){
		gulp.src('')
			.pipe(open({ uri : 'http://' + host + ':' + port}));
	});
	gulp.task('serve', ['connect', 'watch','open']);
	// gulp.task('serve', ['webserver', 'watch']);

	// ES6 编译
	gulp.task('scripts', function () {
		gulp.src(baseRoot + '/js/*.js')
			.pipe(babel())
			.pipe(uglify())
			// .pipe(rename({suffix: '.min'}))
			.pipe(gulp.dest(baseRoot + '/build/js'));
	});

	gulp.task('htmlmin', function () {
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
	});

	gulp.task('imagemin',function () {
		gulp.src(baseRoot + '/img/*')
			.pipe(imagemin())
			.pipe(gulp.dest(baseRoot + '/build/img'))
	});

	gulp.task('cssmin', function () {
		gulp.src(baseRoot + '/css/*.css')
			.pipe(autoprefix('last 3 versions'))  // 前缀
			.pipe(cssmin())
			// .pipe(rename({suffix: '.min'}))
			.pipe(gulp.dest(baseRoot + '/build/css'));
	});

	gulp.task('uglify', function (cb) {
		gulp.src( baseRoot + '/js/*.js' )
			.pipe(uglify())
			// .pipe(rename({suffix: '.min'}))
			.pipe(gulp.dest( baseRoot + '/build/js' ))
	});

	gulp.task('default',['imagemin','cssmin','scripts']);