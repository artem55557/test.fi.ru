// VARIABLES & PATHS

let preprocessor = 'scss', // Preprocessor (sass, scss, less, styl)
    fileswatch   = 'html,htm,txt,json,md,woff2', // List of files extensions for watching & hard reload (comma separated)
    imageswatch  = 'jpg,jpeg,png,webp,svg', // List of images extensions for watching & compression (comma separated)
    baseDir      = 'src', // Base directory path without «/» at the end
    projectDir   = 'dist'
    online       = true; // If «false» - Browsersync will work offline without internet connection

let paths = {

  scripts: {
    src: baseDir + '/js/app.js',
    dest: projectDir + '/js',
  },

  styles: {
    src:  baseDir + '/' + preprocessor + '/main.*',
    dest: projectDir + '/css',
  },

  html: {
    src: [baseDir + '/*.html', "!" + baseDir + '/_*.html'],
    dest: projectDir + '/'
  },

  fonts: {
    src: baseDir + '/fonts/**/*',
    dest: projectDir + '/fonts/'
  },

  images: {
    src:  baseDir + '/images/**/*',
    dest: projectDir + '/images/',
  },

  deploy: {
    hostname:    'username@yousite.com', // Deploy hostname
    destination: 'yousite/public_html/', // Deploy destination
    include:     [/* '*.htaccess' */], // Included files to deploy
    exclude:     [ '**/Thumbs.db', '**/*.DS_Store' ], // Excluded files from deploy
  },

  clean: projectDir + '/',

  cssMinOutputName: '.min.css',
  jsMinOutputName:  '.min.js',
  cssOutputName: 'app.css',
  jsOutputName:  'app.js',

}

// LOGIC

const { src, dest, parallel, series, watch } = require('gulp');
const sass         = require('gulp-sass');
const scss         = require('gulp-sass');
const less         = require('gulp-less');
const styl         = require('gulp-stylus');
const cleancss     = require('gulp-clean-css');
const concat       = require('gulp-concat');
const browserSync  = require('browser-sync').create();
const uglify       = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin     = require('gulp-imagemin');
const newer        = require('gulp-newer');
const rsync        = require('gulp-rsync');
const del          = require('del');
const fileinclude  = require('gulp-file-include');
const groupMedia   = require('gulp-group-css-media-queries');
const rename       = require('gulp-rename');
const webp         = require('gulp-webp');
const webphtml     = require('gulp-webp-html');
const webpcss      = require('gulp-webp-css');
const ttf2woff2    = require('gulp-ttf2woff2');

function browsersync() {
  browserSync.init({
    server: { baseDir: projectDir + '/' },
    notify: false,
    online: online
  })
}

function scripts() {
  return src(paths.scripts.src)
  // .pipe(concat(paths.jsOutputName))
  .pipe(fileinclude())
  .pipe(dest(paths.scripts.dest))
  .pipe(uglify())
  .pipe(rename({extname: paths.jsMinOutputName}))
  .pipe(dest(paths.scripts.dest))
  .pipe(browserSync.stream())
}

function styles() {
  return src(paths.styles.src)
  .pipe(eval(preprocessor)())
  .pipe(groupMedia())
  .pipe(concat(paths.cssOutputName))
  .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
  .pipe(webpcss())
  .pipe(dest(paths.styles.dest))
  .pipe(rename({extname: paths.cssMinOutputName}))
  .pipe(cleancss( {level: { 1: { specialComments: 0 } } }))
  .pipe(dest(paths.styles.dest))
  .pipe(browserSync.stream())
}

function html() {
  return src(paths.html.src)
    .pipe(fileinclude())
    .pipe(webphtml())
    .pipe(dest(paths.html.dest))
    .pipe(browserSync.stream())
}

function fonts() {
    return src(paths.fonts.src)
      .pipe(ttf2woff2())
      .pipe(dest(paths.fonts.dest))
}


function images() {
  return src(paths.images.src)
    // .pipe(newer(paths.images.dest))
    .pipe(webp({
      quality: 70
    }))
    .pipe(dest(paths.images.dest))
    .pipe(src(paths.images.src))
    .pipe(imagemin({
          progressive: true,
          svgoPlugins: [{ removeViewBox: false}],
          interlased: true,
          optimizationLevel: 3 // 0 to 7
        }))
    .pipe(dest(paths.images.dest))
}

function cleanimg() {
  return del('' + paths.images.dest + '/**/*', { force: true })
}

function clean() {
  return del(paths.clean)
}

function deploy() {
  return src(baseDir + '/')
  .pipe(rsync({
    root: baseDir + '/',
    hostname: paths.deploy.hostname,
    destination: paths.deploy.destination,
    include: paths.deploy.include,
    exclude: paths.deploy.exclude,
    recursive: true,
    archive: true,
    silent: false,
    compress: true
  }))
}

function startwatch() {
  watch(baseDir  + '/**/' + preprocessor + '/**/*', styles);
  watch(baseDir + '/**/*.html', html);
  watch(baseDir  + '/**/*.{' + imageswatch + '}', images);
  watch(baseDir  + '/**/*.{' + fileswatch + '}').on('change', browserSync.reload);
  watch([baseDir + '/**/*.js', '!' + paths.scripts.dest + '/*.min.js'], scripts);
}
const build        = series(clean, parallel(html, fonts, styles, scripts, images));

exports.html        = html;
exports.browsersync = browsersync;
exports.build       = build;
exports.styles      = styles;
exports.scripts     = scripts;
exports.images      = images;
exports.cleanimg    = cleanimg;
exports.deploy      = deploy;
exports.default     = parallel(build, browsersync, startwatch);
