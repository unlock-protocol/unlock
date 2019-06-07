module.exports = {
  extends: ['../.eslintrc.js'],
  overrides: [{
    files : ['*.ts'],
    rules : {
      'import/prefer-default-export' : 'off',
      'no-unused-vars' : 'off'
    }
  }]
}
