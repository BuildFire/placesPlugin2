const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const WebpackConfig = {

  // Source map type
  // @see https://webpack.js.org/configuration/devtool/
  devtool: 'eval-source-map',

  entry: {
    // Plugin entry points
    'control/content/content': path.join(__dirname, '../src/control/content/content.js'),
    'control/design/design': path.join(__dirname, '../src/control/design/design.js'),
    'control/settings/settings': path.join(__dirname, '../src/control/settings/settings.js'),
    'widget/widget': path.join(__dirname, '../src/widget/js/app.js')
  },

  output: {
    path: path.join(__dirname, '../'),
    filename: '[name].js',
    publicPath: 'http://0.0.0.0:8080/'
  },

  externals: {
    buildfire: 'buildfire',
    angular: 'angular'
  },

  resolve: {
    alias: {
      'react': 'preact-compat',
      'react-dom': 'preact-compat'
    }
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: { loader: 'babel-loader' }
      }
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new HtmlWebpackPlugin({
      filename: 'control/content/index.html',
      inject: true,
      minify: { removeComments: true, collapseWhitespace: true },
      template: path.join(__dirname, '../src/control/content/index.html'),
      chunks: ['devServer', 'control/content/content']
    }),
    new HtmlWebpackPlugin({
      filename: 'control/design/index.html',
      inject: true,
      minify: { removeComments: true, collapseWhitespace: true },
      template: path.join(__dirname, '../src/control/design/index.html'),
      chunks: ['devServer', 'control/design/design']
    }),
    new HtmlWebpackPlugin({
      filename: 'control/settings/index.html',
      inject: true,
      minify: { removeComments: true, collapseWhitespace: true },
      template: path.join(__dirname, '../src/control/settings/index.html'),
      chunks: ['devServer', 'control/settings/settings']
    }),
    new HtmlWebpackPlugin({
      filename: 'widget/index.html',
      inject: true,
      minify: { removeComments: true, collapseWhitespace: true },
      template: path.join(__dirname, '../src/widget/index.html'),
      chunks: ['devServer', 'widget/widget']
    }),
    new CopyWebpackPlugin([{
      from: path.join(__dirname, '../src/control'),
      to: path.join(__dirname, '../control'),
    }, {
      from: path.join(__dirname, '../src/widget'),
      to: path.join(__dirname, '../widget'),
    }, {
      from: path.join(__dirname, '../src/resources'),
      to: path.join(__dirname, '../resources'),
    }], {
      ignore: ['*.js', 'index.html', '*.md']
    }),
    new CopyWebpackPlugin([{
      from: path.join(__dirname, '../../../styles'),
      to: path.join(__dirname, '../styles'),
    }, {
      from: path.join(__dirname, '../../../scripts'),
      to: path.join(__dirname, '../scripts'),
    }, {
      from: path.join(__dirname, '../../../fonticons'),
      to: path.join(__dirname, '../fonticons'),
    }])
  ],

  devServer: {
    port: 8080,
    host: '0.0.0.0',
    inline: true,
    contentBase: path.join(__dirname, '../dist'),
    publicPath: '/',
    quiet: false,
    noInfo: true,
    disableHostCheck: true,
  }

};

module.exports = WebpackConfig;
