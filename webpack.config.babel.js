import '@babel/register';
import webpack from 'webpack';
import webpackPermissionsPlugin from 'webpack-permissions-plugin';
import path from 'path';
import packageJson from './package.json';

// Variable for checking if node environment is set to 'development'
const isDevelopment = process.env.NODE_ENV && process.env.NODE_ENV === 'development';

// Source directory path
const include = path.resolve(__dirname, './src');

// Distribution
const dist = path.resolve(__dirname, './dist');
const library = packageJson.name;

// Webpack configuration
const configuration = {
  mode: process.env.NODE_ENV || 'development',

  entry: {
    core: path.join(include, 'core.ts'),
    cli: path.join(include, 'cli/cli.ts'),
  },

  target: 'node',

  resolve: {
    extensions: ['.ts', '.js'],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        enforce: 'pre',
        use: [
          {
            loader: 'webpack-strip-block',
            options: {
              start: 'test:start',
              end: 'test:end',
            },
          },
          {
            loader: 'tslint-loader',
            options: {
              configFile: 'tslint.json',
            },
          },
        ],
        include,
      },

      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'awesome-typescript-loader',
            options: {
              silent: !isDevelopment,
            },
          },
        ],
        include,
      },
    ],
  },

  externals: {
    '@frontvue/plugin-stylus': '@frontvue/plugin-stylus',
    '@frontvue/plugin-pug': '@frontvue/plugin-pug',
    chalk: 'chalk',
    commander: 'commander',
    gulp: 'gulp',
    inquirer: 'inquirer',
    'detect-indent': 'detect-indent',
    moment: 'moment',
  },

  optimization: {
    minimize: false,
  },

  plugins: [
    // Add shebang statement to CLI file
    new webpack.BannerPlugin({
      raw: true,
      entryOnly: true,
      include: /cli/,
      banner: '#!/usr/bin/env node \n',
    }),
  ],
};

if (isDevelopment) {
  configuration.devtool = 'inline-source-map';
}


/**
 * CommonJS configuration
*/

const mainConfiguration = {...configuration,
  output: {
    path: dist,
    filename: `${packageJson.name}.[name].js`,
    library,
    libraryTarget: 'commonjs2',
    libraryExport: 'default',
  },
};

// Make unminified CLI file executable
mainConfiguration.plugins = [...mainConfiguration.plugins,
  new webpackPermissionsPlugin({
    buildFiles: [
      {
        path: path.resolve(dist, `${packageJson.name}.cli.js`),
        fileMode: '755',
      },
    ],
  }),
];

// Minified file output configuration
const mainMinifiedConfiguration = {...mainConfiguration,
  output: {
    path: dist,
    filename: `${packageJson.name}.[name].min.js`,
    library,
    libraryTarget: 'commonjs2',
    libraryExport: 'default',
  },

  optimization: {
    minimize: true,
  },
};

// Make minified CLI file executable
mainMinifiedConfiguration.plugins = [...mainMinifiedConfiguration.plugins,
  new webpackPermissionsPlugin({
    buildFiles: [
      {
        path: path.resolve(dist, `${packageJson.name}.cli.min.js`),
        fileMode: '755',
      },
    ],
  }),
];


/**
 * Export configuration objects
 */

let exports = [mainConfiguration];

if (!isDevelopment) {
  exports = [...exports, mainMinifiedConfiguration];
}

export default exports;
