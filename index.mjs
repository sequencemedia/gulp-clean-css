import path from 'node:path'
import CleanCSS from 'clean-css'
import PluginError from 'plugin-error'
import through from 'through2'
import vinylSourceMaps from 'vinyl-sourcemaps-apply'

const STREAMING_NOT_SUPPORTED_MESSAGE = 'Streaming not supported'

export default (options, DONE = () => {}) => {
  return through.obj((file, encoding, done) => {
    const _options = Object.assign({}, options || {})

    if (file.isNull()) {
      return done(null, file)
    }

    if (file.isStream()) {
      this.emit('error', new PluginError('gulp-clean-css', STREAMING_NOT_SUPPORTED_MESSAGE))
      return done(null, file)
    }

    if (file.sourceMap) {
      _options.sourceMap = JSON.parse(JSON.stringify(file.sourceMap))
    }

    const content = {
      [file.path]: { styles: file.contents ? file.contents.toString() : '' }
    }

    if (!_options.rebaseTo && _options.rebase !== false) {
      _options.rebaseTo = path.dirname(file.path)
    }

    const cleanCSS = new CleanCSS(_options)

    cleanCSS.minify(content, (errors, css) => {
      if (errors) {
        return done(errors.join(' '))
      }

      const details = {
        stats: css.stats,
        errors: css.errors,
        warnings: css.warnings,
        path: file.path,
        name: file.path.split(file.base)[1]
      }

      if (css.sourceMap) {
        details.sourceMap = css.sourceMap
      }

      DONE(details)

      file.contents = Buffer.from(css.styles)

      if (css.sourceMap) {
        const iMap = JSON.parse(css.sourceMap)
        const oMap = Object.assign({}, iMap, {
          file: path.relative(file.base, file.path),
          sources: iMap.sources.map(mapSrc => path.relative(file.base, mapSrc))
        })

        vinylSourceMaps(file, oMap)
      }

      done(null, file)
    })
  })
}
