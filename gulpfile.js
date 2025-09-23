var gulp = require("gulp");
var sass = require("gulp-sass")(require("sass"));
var postcss = require("gulp-postcss");
var cleanCSS = require("gulp-clean-css");
var autoprefixer = require("autoprefixer");
var rename = require("gulp-rename");
var wait = require("gulp-wait");
var merge = require("merge2");
var concat = require("gulp-concat");
var del = require("del");
var zip = require("gulp-zip");
var browserSync = require("browser-sync").create();

gulp.task("css", function () {
    var sassStream = gulp
        .src("./assets/scss/screen.scss")
        .pipe(wait(100))
        .pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError))
        .pipe(postcss([autoprefixer()]));

    var cssStream = gulp.src(["./assets/css/bootstrap.min.css", "./assets/css/katex.min.css", "./assets/css/prism-gruvbox-dark.css"], { allowEmpty: true }).pipe(concat("css-files.css"));

    return merge(cssStream, sassStream)
        .pipe(concat("app.css"))
        .pipe(
            cleanCSS({
                level: { 1: { specialComments: 0 } },
                compatibility: "ie9",
            })
        )
        .pipe(rename("app-css.hbs"))
        .pipe(gulp.dest("build/partials/styles/"))
        .pipe(browserSync.stream());
});

gulp.task("concat-js", function () {
    return gulp
        .src(
            [
                "./assets/js/vendor/jquery-3.7.1.min.js",
                "./assets/js/vendor/jquery.fitvids.js",
                "./assets/js/vendor/medium-zoom.min.js",
                "./assets/js/vendor/clipboard.min.js",
                "./assets/js/vendor/prism.min.js",
                "./assets/js/vendor/prism-autoloader.min.js",
                "./assets/js/vendor/searchinghost.min.js",
                "./assets/js/index.js",
            ],
            { allowEmpty: true }
        )
        .pipe(concat("app.min.js"))
        .pipe(gulp.dest("build/assets/js/"));
});

gulp.task(
    "watch",
    gulp.series("css", "concat-js", function () {
        browserSync.init({
            proxy: "http://localhost:2368",
        });
        gulp.watch(["./assets/scss/**/*.scss"], { allowEmpty: true }).on("change", gulp.series("css"));
        gulp.watch(["./assets/js/**/*.js", "!./assets/js/app.min.js"], { allowEmpty: true }).on("change", gulp.series("concat-js", browserSync.reload));
        gulp.watch("./**/*.hbs").on("change", browserSync.reload);
    })
);

gulp.task("clean", function () {
    return del(["./build", "./dist"]);
});

gulp.task(
    "build",
    gulp.series("clean", "css", "concat-js", function () {
        return gulp
            .src(
                [
                    "**",
                    "assets/js/app.min.js",
                    "assets/js/sidenotes.js",
                    "!assets/js/index.js",
                    "!assets/scss",
                    "!assets/scss/**/*",
                    "!assets/css",
                    "!assets/css/**/*",
                    "!assets/js/vendor/clipboard.min.js",
                    "!assets/js/vendor/jquery-3.7.1.min.js",
                    "!assets/js/vendor/jquery-migrate-3.5.0.min.js",
                    "!assets/js/vendor/jquery.fitvids.js",
                    "!assets/js/vendor/medium-zoom.min.js",
                    "!assets/js/vendor/searchinghost.min.js",
                    "!assets/js/vendor/prism-autoloader.min.js",
                    "!assets/js/vendor/prism.min.js",
                    "!node_modules",
                    "!node_modules/**",
                    "!build",
                    "!build/**",
                    "!dist",
                    "!dist/**",
                    "assets/js/vendor/katex.min.js",
                    "assets/js/vendor/katex-auto-render.min.js",
                ],
                { allowEmpty: true }
            )
            .pipe(gulp.dest("build/"));
    })
);

gulp.task("zip", function () {
    var targetDir = "dist/";
    var themeName = require("./package.json").name;
    var filename = themeName + ".zip";

    return gulp.src(["./build/**/*"]).pipe(zip(filename)).pipe(gulp.dest(targetDir));
});

gulp.task("default", gulp.parallel("watch"));
