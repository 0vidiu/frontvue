import '@babel/register';
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

  entry: './src/index.ts',

  target: 'node',

  resolve: {
    extensions: ['.ts', '.js'],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        enforce: 'pre',
        use: {
          loader: 'tslint-loader',
          options: {
            configFile: 'tslint.json',
          },
        },
        include,
      },

      {
        test: /\.tsx?$/,
        use: {
          loader: 'awesome-typescript-loader',
          options: {
            silent: !isDevelopment,
          },
        },
        include,
      },
    ],
  },

  optimization: {
    minimize: false,
  },
};

if (isDevelopment) {
  configuration.devtool = 'inline-source-map';
}


/**
 * CommonJS configuration
*/

const mainConfiguration = Object.assign({}, configuration, {
  output: {
    path: dist,
    filename: `${packageJson.name}.js`,
    library,
    libraryTarget: 'commonjs2',
    libraryExport: 'default',
  },
});

const mainMinifiedConfiguration = Object.assign({}, mainConfiguration, {
  output: {
    path: dist,
    filename: `${packageJson.name}.min.js`,
    library,
    libraryTarget: 'commonjs2',
    libraryExport: 'default',
  },

  optimization: {
    minimize: true,
  },
});


/**
 * Export configuration objects
 */

let exports = [mainConfiguration];

if (!isDevelopment) {
  exports = [...exports, mainMinifiedConfiguration];
}

export default exports;
