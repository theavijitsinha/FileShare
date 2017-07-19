const gulp = require('gulp')
const path = require('path')
const watch = require('gulp-watch')
const babel = require('gulp-babel')
const fse = require('fs-extra')

const srcPath = 'user_interface/react'
const dstPath = 'user_interface/react_compiled'
const reactPath = '/**/*.react.js'

gulp.task('default', ['compile_react'], function () {
  compileReact(true)
})

gulp.task('compile_react', function () {
  let fileWatcher = watch(srcPath + reactPath, {usePolling: true}, compileReact)
  fileWatcher.on('change', function (event) {
    if (event.type === 'deleted') {
      let filePathFromSrc = path.relative(path.resolve(srcPath), event.path)
      var destFilePath = path.resolve(dstPath, filePathFromSrc)
      fse.remove(destFilePath)
    }
  })
})

function compileReact (initial = false) {
  if (initial) {
    fse.remove(dstPath, function () {
      gulp.src(srcPath + reactPath)
        .pipe(babel())
        .pipe(gulp.dest(dstPath))
    })
  } else {
    gulp.src(srcPath + reactPath)
      .pipe(babel())
      .pipe(gulp.dest(dstPath))
  }
}
