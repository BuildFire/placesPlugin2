const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const pluginJson = require('./plugin.json');

const WebpackConfig = require('./webpack/dev.config');
const compiler = webpack(WebpackConfig);

const devServer = new WebpackDevServer(compiler, WebpackConfig.devServer);

const { port, host } = WebpackConfig.devServer;
devServer.listen(port, host, err => {
    if (err) return console.error(err);
    console.log('\x1b[32m', 'Serving plugin ' + pluginJson.pluginName + ' on [::]:8080 \x1b[0m');
});