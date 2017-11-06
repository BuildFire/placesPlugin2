const express = require('express');
const webpack = require('webpack');
const WebpackConfig = require('./webpack/dev.config');
const createWebpackMiddleware = require('webpack-dev-middleware');
const createWebpackHotMiddlewware = require('webpack-hot-middleware');
const pluginJson = require('./plugin.json');

const compiler = webpack(WebpackConfig);
const app = express();
app.use('/', express.static(__dirname));
const webpackDevMiddleware = createWebpackMiddleware(compiler, WebpackConfig.devServer);
app.use(webpackDevMiddleware);
app.use(createWebpackHotMiddlewware(compiler));
app.listen(WebpackConfig.devServer.port, () => {
  console.log('  \x1b[32mPlugin ' + pluginJson.pluginName + ' running [::]:8080\x1b[0m');
  console.log('');
});
