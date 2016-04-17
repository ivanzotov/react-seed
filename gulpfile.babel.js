import gulp from 'gulp';
import fs from 'fs';
import del from 'del';
import gulpif from 'gulp-if';
import streamify from 'gulp-streamify';
import gutil from 'gulp-util';
import source from 'vinyl-source-stream';
import rename from 'gulp-rename';
import buffer from 'vinyl-buffer';
import browserify from 'browserify';
import sourcemaps from 'gulp-sourcemaps';
let browserSync = require('browser-sync').create();

let debug, watch = false;
gulp.task('mode:debug', () => debug = true);
gulp.task('mode:watch', () => {
  watch = true;
  browserSync.init({proxy: "localhost:3000"});
});

let log = (msg) => gutil.log(gutil.colors.green(msg));

let fonts_src = './src/fonts/**/*',
    fonts_dest = './dist/fonts/',
    images_src = './src/images/**/*.{jpg,jpeg,png,gif,svg}',
    images_dest = './dist/images/',
    styles_src = './src/styles/**/*.{css,scss}',
    scripts_filename = 'base.js',
    scripts_dest = './dist/scripts/',
    styles_filename = 'base.scss',
    styles_dest = './dist/styles/',
    html_filename = 'index.html',
    html_dest = './dist/';

gulp.task('clean:html', () => del.sync([html_dest+html_filename], {force: true}));

gulp.task('clean:scripts', () => del.sync([scripts_dest], {force: true}));

gulp.task('clean:styles', () => del.sync([styles_dest], {force: true}));

gulp.task('clean:images', () => del.sync([images_dest], {force: true}));

gulp.task('clean:fonts', () => del.sync([fonts_dest], {force: true}));

gulp.task('clean', ['clean:html', 'clean:scripts', '', 'clean:images']);

gulp.task('precompile', ['clean:html'], cb => {
  let App = require('./index'),
      React = require('react'),
      ReactDOM = require('react-dom/server'),
      htmlmin = require('gulp-htmlmin');

  let stream = source(html_filename);
  stream.end(`<!DOCTYPE html>${ReactDOM.renderToStaticMarkup(React.createElement(App))}`);
  stream.pipe(streamify(gulpif(!debug, htmlmin({collapseWhitespace: true}))))
        .pipe(gulp.dest(html_dest));

  log(`Destination HTML file written ${html_dest}${html_filename}`);

  cb(null);
});

gulp.task('fonts:build', ['clean:fonts'], cb => {
  gulp.src([fonts_src])
      .pipe(gulp.dest(fonts_dest))

  log(`Fonts moved to ${fonts_dest} folder`);

  cb(null);
});

gulp.task('images:build', ['clean:images'], cb => {
  gulp.src([images_src])
      .pipe(gulp.dest(images_dest))

  log(`Images moved to ${images_dest} folder`);

  cb(null);
});

gulp.task('scripts:build', ['clean:scripts'], cb => {
  let watchify = require('watchify'),
      uglify = require('gulp-uglify');

  let browserifyOpts = {debug: debug, entries: 'app.js', extensions: ['.js']};
  let opts = Object.assign({}, watchify.args, browserifyOpts);
  let b = watch ? watchify(browserify(opts)) : browserify(opts);

  let bundle = () => {
    b.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source(scripts_filename))
    .pipe(buffer())
    .pipe(gulpif(debug, sourcemaps.init()))
    .pipe(streamify(gulpif(!debug, uglify())))
    .pipe(gulpif(debug, sourcemaps.write()))
    .pipe(gulp.dest(scripts_dest))
    .pipe(gulpif(watch, browserSync.stream()));

    log(`Javascript files prepared and written to ${scripts_dest}${scripts_filename}`);
  }

  bundle();

  if (watch) {
    b.on('update', bundle);
    b.on('log', gutil.log);
  } else {
    cb(null);
  }
});

gulp.task('scripts:watch', ['mode:debug', 'mode:watch', 'scripts:build']);

gulp.task('styles:build', ['clean:styles'], cb => {
  let postcss = require('gulp-postcss'),
      syntax = require('postcss-scss'),
      autoprefixer = require('autoprefixer'),
      sass = require('gulp-sass'),
      concat = require('gulp-concat');

  let processors = [
    autoprefixer({ browsers: ['last 2 versions'] })
  ];

  gulp.src([styles_src])
    .pipe(gulpif(debug, sourcemaps.init()))
    .pipe(postcss(processors, {syntax: syntax}))
    .pipe(concat(styles_filename))
    .pipe(sass({indentedSyntax: false, errLogToConsole: true}))
    .pipe(rename(styles_filename))
    .pipe(gulpif(debug, sourcemaps.write()))
    .pipe(gulp.dest(styles_dest))
    .pipe(browserSync.stream());

  log(`CSS files processed and concatenated to ${styles_dest}${styles_filename}`);

  cb(null);
});

gulp.task('css:watch', ['mode:debug', 'mode:watch'], () =>
  gulp.watch('./components/**/*.{scss,css}', ['styles:build'])
);

gulp.task('watch', ['mode:debug', 'mode:watch', 'compile', 'css:watch', 'scripts:watch']);

gulp.task('compile', ['clean', 'precompile', 'images:build', 'scripts:build', 'styles:build']);

gulp.task('debug', ['mode:debug', 'compile']);

gulp.task('default', ['watch']);
