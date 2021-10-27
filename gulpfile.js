const gulp = require('gulp');
const gru2 = require('gulp-rollup-2')
const ts = require('gulp-typescript')
const tsProject = ts.createProject('tsconfig.json')
const {nodeResolve} = require('@rollup/plugin-node-resolve')


gulp.task('transpilets', () => {
    return tsProject.src()
        .pipe(tsProject())
        .pipe(gulp.dest('intermediate'));
});


gulp.task('rollup', () => {
    return gulp.src([
        './intermediate/index.js',
    ])
        .pipe(gru2.rollup({
            input: './intermediate/index.js',
            plugins: [
                nodeResolve(),
            ],
            output: [
                {
                    file: 'index.js',
                    name: 'axeRunner',
                    format: 'iife',
                },
            ],
        }))
        .pipe(gulp.dest('./build/'));
});

gulp.task('build', gulp.series('transpilets', 'rollup'));

gulp.task('watch', function () {
    return gulp.watch('src/*', gulp.series('transpilets', 'rollup'));
});