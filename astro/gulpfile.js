'use strict';

var pkg = require('./package.json')

var gulp = require('gulp'),
    _ = require('lodash'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    csscomb = require('gulp-csscomb'),
    watch = require('gulp-watch'),
    livereload = require('gulp-livereload'),
    zip = require('gulp-zip'),
    inject = require('gulp-inject'),
    svgSprite = require('gulp-svg-sprite'),
    rsp = require('remove-svg-properties').stream,
    del = require('del'),
    runSequence = require('run-sequence'),
    gscan = require('gscan'),
    chalk = require('chalk');


gulp.task('styles', function(cb) {
    runSequence(
        'clean-styles',
        ['styles-screen', 'styles-critical'],
        'styles-inject',
        cb
    );
});


gulp.task('styles-comb', function() {
    return gulp.src(['./src/sass/**/*.scss'])
        .pipe(csscomb())
        .pipe(gulp.dest('./src/sass'));
});


gulp.task('styles-screen', function() {
    return gulp.src(['./src/sass/screen.scss'])
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(rename('screen.min.css'))

        .pipe(gulp.dest('assets/css'))
        .pipe(livereload());
});


gulp.task('styles-critical', function() {
    return gulp.src(['./src/sass/critical.scss'])
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(rename('critical.min.css'))
        .pipe(gulp.dest('assets/css'))
        .pipe(livereload());
});


gulp.task('styles-inject', function() {
    return gulp.src('./default.hbs')
        .pipe(inject(gulp.src('./assets/css/critical.min.css', { read: true }), {
            starttag: '/* critical:css */',
            endtag: '/* endinject */',
            transform: function (filePath, file) {
                return file.contents.toString();
            }
        }))
        .pipe(gulp.dest('./'));
});


gulp.task('scripts', function() {
    return gulp.src(['./src/js/jquery.js', './src/js/plugin/*.js', './src/js/theme.js'])
        .pipe(uglify())
        .pipe(concat('theme.min.js'))
        .pipe(gulp.dest('assets/js'))
        .pipe(livereload());
});


gulp.task('svg', function() {
    return gulp.src('./src/svg/*.svg')
        .pipe(svgSprite({
            mode: {
                symbol: true
            }
        }))
        .pipe(rename("icons.svg"))
        .pipe(rsp.remove({
            properties: [rsp.PROPS_FILL, rsp.PROPS_STROKE]
        }))
        .pipe(gulp.dest('./assets/svg/'))
        .pipe(livereload());
});


gulp.task('clean', function() {
    return del([
        './**/.DS_Store',
        './dist/'
    ]);
});

gulp.task('clean-styles', function() {
    return del([
        './**/.DS_Store',
        './assets/css/'
    ]);
});

gulp.task('clean-build', function() {
    return del([
        './.DS_Store',
        './**/.DS_Store',
        'build/**'
    ]);
});


gulp.task('validate', () => {

    const levels = {
        error: chalk.red,
        warning: chalk.yellow,
        recommendation: chalk.yellow,
        feature: chalk.green
    };

    function outputResult(result) {
        console.log('-', levels[result.level](result.level), result.rule);
    }

    function outputResults(theme) {
        theme = gscan.format(theme);
        console.log(chalk.bold.underline('\nRule Report:'));

        if (!_.isEmpty(theme.results.error)) {
            console.log(chalk.red.bold.underline('\n! Must fix:'));
            _.each(theme.results.error, outputResult);
        }

        if (!_.isEmpty(theme.results.warning)) {
            console.log(chalk.yellow.bold.underline('\n! Should fix:'));
            _.each(theme.results.warning, outputResult);
        }

        if (!_.isEmpty(theme.results.recommendation)) {
            console.log(chalk.red.yellow.underline('\n? Consider fixing:'));
            _.each(theme.results.recommendation, outputResult);
        }

        if (!_.isEmpty(theme.results.pass)) {
            console.log(chalk.green.bold.underline('\n\u2713', theme.results.pass.length, 'Passed Rules'));
        }

    };

    gscan.checkZip({
        path: `./dist/${pkg.name}.zip`,
        name: pkg.name
    }).then(outputResults);

});


gulp.task('build', function(cb) {
    runSequence(
        ['styles', 'styles-comb'],
        'clean',
        'build-other',
        'build-theme-move',
        'build-theme-zip',
        'package',
        'clean-build',
        cb
    );
});

gulp.task('build-other', function() {
    return gulp.src('./other/**')
        .pipe(gulp.dest('./build/'));
});

gulp.task('build-theme-move', function() {
    return gulp.src(['./**', '!./dist', '!./dist/**', '!./build', '!./build/**', '!./other', '!./other/**', '!./node_modules', '!./node_modules/**', '!./.git/', '!./.git/**', '!./gitignore'])
        .pipe(gulp.dest(`./build/theme/${pkg.name}`))
});

gulp.task('build-theme-zip', function() {
    return gulp.src(`./build/theme/**`)
        .pipe(zip(`${pkg.name}.zip`))
        .pipe(gulp.dest('./build/theme/'));
});


gulp.task('package', function() {
    return gulp.src('./build/**')
        .pipe(zip(`${pkg.name}.zip`))
        .pipe(gulp.dest('dist'))
});


gulp.task('default', function(cb) {
    runSequence(
        ['styles', 'scripts', 'svg'],
        'watch',
        cb
    );
});


gulp.task('watch', function() {
    livereload.listen();
    gulp.watch('./src/sass/**/*.scss', ['styles']);
    gulp.watch('./src/js/*.js', ['scripts']);
    gulp.watch('./src/svg/*.svg', ['svg']);
    gulp.watch(['./*.hbs', './partials/*.hbs']).on('change', livereload.changed);
    gulp.watch(['*']).on('change', livereload.changed);
});
