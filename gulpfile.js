const gulp = require("gulp");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const sourcemaps = require("gulp-sourcemaps");
const concat = require("gulp-concat");
const csso = require("gulp-csso");
const babel = require("gulp-babel");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify");
const inject = require('gulp-inject-string');
const { series, parallel, watch } = require("gulp");

const isDev = process.env.NODE_ENV === 'dev';
const packageVersion = process.env.npm_package_version
const openpaySdk = isDev ? 'http://127.0.0.1:8777/dist/openpay-dom.js' : 'https://s3-ap-southeast-1.amazonaws.com/files.coinswitch.co/openpay/sdk/exodus-gamma-v0.01/openpay-dom.js'

function html(cb) {
	gulp
		.src("src/index.html")
		// .pipe(inject.before('<!-- %PUBLIC:BUILD% -->', '<script src="'+ openpaySdk +'"></script>\n'))
		.pipe(inject.before('<!-- %PUBLIC:BUILD% -->', '<script>window.isDev=' + isDev + '</script>\n'))
		.pipe(gulp.dest("build/" + packageVersion));
	cb();
}

function css(cb) {
	gulp
		.src("src/scss/**/*.scss")
		.pipe(sass())
		.pipe(sourcemaps.init())
		.pipe(autoprefixer())
		.pipe(csso())
		.pipe(
			rename({
				extname: ".min.css"
			})
		)
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest("build/" + packageVersion + "/css/"));
	cb();
}

function js(cb) {
	gulp
		.src("src/js/**/*.js")
		.pipe(
			babel({
				presets: ["@babel/env"]
			})
		)
		.pipe(uglify())
		.pipe(
			rename({
				extname: ".min.js"
			})
		)
		// .pipe(gulp.dest("build/js/"));
		.pipe(gulp.dest("build/" + packageVersion + "/js/"));
	cb();
}

function images(cb) {
	gulp
		.src("images/**/*.*")
		// .pipe(gulp.dest("build/images"));
		.pipe(gulp.dest("build/" + packageVersion + "/images"));
	cb();
}

function watchFiles() {
	gulp.watch("src/scss/**/*.scss", css);
	gulp.watch("src/js/**/*.js", js);
	gulp.watch("src/index.html", html);
	gulp.watch("images/**/*.*", images);
}
exports.default = series(html, parallel(css, js, images));
exports.watch = parallel(watchFiles);
