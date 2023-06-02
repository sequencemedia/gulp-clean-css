import path from 'node:path'
import CleanCSS from 'clean-css'
import PluginError from 'plugin-error'
import through from 'through2'
import vinylSourceMaps from 'vinyl-sourcemaps-apply'

const STREAMING_NOT_SUPPORTED_MESSAGE = 'Streaming not supported'

export default (options = {}, callback = () => {}) => {
  return through.obj((file, encoding, done) => {
    const opts = Object.assign({}, options)

    if (file.isNull()) {
      return done(null, file)
    }

    if (file.isStream()) {
      this.emit('error', new PluginError('gulp-clean-css', STREAMING_NOT_SUPPORTED_MESSAGE))
      return done(null, file)
    }

    if (file.sourceMap) {
      opts.sourceMap = JSON.parse(JSON.stringify(file.sourceMap))
    }

    const content = {
      [file.path]: { styles: file.contents ? file.contents.toString() : '' }
    }

    if (!opts.rebaseTo && opts.rebase !== false) {
      opts.rebaseTo = path.dirname(file.path)
    }

    const cleanCSS = new CleanCSS(opts)

    cleanCSS.minify(content, (errors, css) => {
      if (errors) {
        return done(errors.join(' '))
      }

      file.contents = Buffer.from(css.styles)

      const details = {
        stats: css.stats,
        errors: css.errors,
        warnings: css.warnings,
        path: file.path,
        name: file.path.split(file.base)[1]
      }

      const sourceMap = css.sourceMap
      if (sourceMap) {
        details.sourceMap = sourceMap

        let cssMap = JSON.parse(sourceMap)
        cssMap = Object.assign(cssMap, {
          file: path.relative(file.base, file.path),
          sources: cssMap.sources.map((source) => path.relative(file.base, source))
        })

        vinylSourceMaps(file, cssMap)
      }

      callback(details)

      done(null, file)
    })
  })
}
