module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: {
          node: 'current'
        },
        useBuiltIns: 'usage',
        corejs: 3
      }
    ]
  ]
}
