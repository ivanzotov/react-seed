import gulp from 'gulp';
import fs from 'fs';
import del from 'del';
import gulpif from 'gulp-if';
import serve from 'gulp-serve';
import streamify from 'gulp-streamify';
import gutil from 'gulp-util';
import source from 'vinyl-source-stream';
import rename from 'gulp-rename';
import buffer from 'vinyl-buffer';
import sourcemaps from 'gulp-sourcemaps';
import rev from 'gulp-rev';
import runSequence from 'run-sequence';

let debug, watch = false;
gulp.task('mode:debug', () => debug = true);
gulp.task('mode:watch', () => watch = true);

let bucket = 'react-seed';
let bucket_region = 'us-east-1';

let log = (msg) => gutil.log(gutil.colors.green(msg));

let fonts_src = './src/fonts/**/*',
    fonts_dest = './dist/fonts/',
    images_src = './src/images/**/*.{jpg,jpeg,png,gif,svg}',
    images_dest = './dist/images/',
    styles_src = './src/styles/**/*.{css,scss}',
    scripts_src = './src/scripts/**/*.js',
    scripts_filename = 'base.js',
    scripts_dest = './dist/scripts/',
    styles_filename = 'base.css',
    styles_dest = './dist/styles/',
    html_filename = 'index.html',
    html_dest = './dist/';

gulp.task('clean:html', () => {
  log('HTML clean from dest folder');
  return del.sync([html_dest+html_filename], {force: true});
});

gulp.task('clean:scripts', () => {
  log('Scripts clean from dest folder');
  return del.sync([scripts_dest], {force: true});
});

gulp.task('clean:styles', () => {
  log('Styles clean from dest folder');
  return del.sync([styles_dest], {force: true});
});

gulp.task('clean:images', () => {
  log('Images clean from dest folder');
  return del.sync([images_dest], {force: true});
});

gulp.task('clean:fonts', () => {
  log('Fonts clean from dest folder');
  return del.sync([fonts_dest], {force: true});
});

gulp.task('clean', ['clean:html', 'clean:scripts', 'clean:styles', 'clean:images']);

gulp.task('build', (cb) => {
  runSequence('images:build', 'scripts:build', 'styles:build', cb);
});

gulp.task('compile', ['clean:html', 'build'], () => {
  let App = require('./index'),
      React = require('react'),
      ReactDOM = require('react-dom/server'),
      htmlmin = require('gulp-htmlmin'),
      revReplace = require('gulp-rev-replace'),
      manifest = gulp.src('./rev-manifest.json');

  let stream = source(html_filename);
  log(`Destination HTML file written ${html_dest}${html_filename}`);

  stream.end(`<!DOCTYPE html>${ReactDOM.renderToStaticMarkup(React.createElement(App))}`);
  return stream.pipe(streamify(gulpif(!debug, htmlmin({collapseWhitespace: true}))))
               .pipe(streamify(revReplace({manifest: manifest})))
               .pipe(gulp.dest(html_dest));
});

gulp.task('fonts:build', ['clean:fonts'], () => {
  log(`Fonts moved to ${fonts_dest} folder`);

  return gulp.src([fonts_src])
             .pipe(gulp.dest(fonts_dest));
});

gulp.task('images:build', ['clean:images'], () => {
  log(`Images moved to ${images_dest} folder`);

  return gulp.src(images_src)
             .pipe(rev())
             .pipe(gulp.dest(images_dest))
             .pipe(rev.manifest({base: './dist', merge: true}))
             .pipe(gulp.dest(html_dest));
});

gulp.task('scripts:build', ['clean:scripts'], () => {
  let watchify = require('watchify'),
      uglify = require('gulp-uglify'),
      browserify = require('browserify');

  let browserifyOpts = {debug: debug, entries: 'routes.js', extensions: ['.js']};
  let opts = Object.assign({}, watchify.args, browserifyOpts);
  let b = watch ? watchify(browserify(opts)) : browserify(opts);

  let bundle = () => {
    log(`Javascript files prepared and written to ${scripts_dest}${scripts_filename}`);

    return b.bundle()
    .pipe(source(scripts_filename))
    .pipe(buffer())
    .pipe(gulpif(debug, sourcemaps.init({loadMaps: true})))
    .pipe(uglify())
    .pipe(rev())
    .pipe(gulpif(debug, sourcemaps.write()))
    .pipe(gulp.dest(scripts_dest))
    .pipe(rev.manifest({base: './dist', merge: true}))
    .pipe(gulp.dest(html_dest));
  }

  if (watch) {
    b.on('update', bundle);
    b.on('error', gutil.log.bind(gutil, 'Browserify Error'));
    b.on('log', gutil.log);
  }

  return bundle();
});

gulp.task('scripts:watch', ['mode:debug', 'mode:watch'], () => {
  return gulp.watch(scripts_src, ['scripts:build']);
});

gulp.task('styles:build', ['clean:styles'], () => {
  let postcss = require('gulp-postcss'),
      syntax = require('postcss-scss'),
      autoprefixer = require('autoprefixer'),
      sass = require('gulp-sass'),
      concat = require('gulp-concat'),
      minify = require('gulp-minify-css');

  let processors = [
    autoprefixer({ browsers: ['last 2 versions'] })
  ];

  log(`CSS files processed and concatenated to ${styles_dest}${styles_filename}`);

  return gulp.src([styles_src])
    .pipe(gulpif(debug, sourcemaps.init()))
    .pipe(postcss(processors, {syntax: syntax}))
    .pipe(concat(styles_filename))
    .pipe(sass({indentedSyntax: false, errLogToConsole: true}))
    .pipe(minify())
    .pipe(rename(styles_filename))
    .pipe(gulpif(debug, sourcemaps.write()))
    .pipe(rev())
    .pipe(gulp.dest(styles_dest))
    .pipe(rev.manifest({base: './dist', merge: true}))
    .pipe(gulp.dest(html_dest));
});

gulp.task('styles:watch', ['mode:debug', 'mode:watch'], () => {
  return gulp.watch(styles_src, ['styles:build']);
});

gulp.task('publish', ['compile'], () => {
  let awspublish = require('gulp-awspublish');

  let aws = {
    params: { Bucket: bucket },
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: bucket_region,
  };

  let publisher = awspublish.create(aws);

  let headers = {
    'Cache-Control': 'max-age=315360000, no-transform, public'
  };

  return gulp.src('./dist/**/*')
    .pipe(awspublish.gzip())
    .pipe(publisher.cache())
    .pipe(publisher.publish(headers, {force: true}))
    .pipe(awspublish.reporter());
});

gulp.task('serve', serve('dist'));

gulp.task('watch', (cb) => {
  runSequence('mode:debug', 'mode:watch', 'compile', 'styles:watch', 'scripts:watch', 'serve', cb);
});

gulp.task('debug', ['mode:debug', 'compile']);

gulp.task('default', ['compile']);
