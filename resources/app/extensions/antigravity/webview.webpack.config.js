import { createRequire } from 'node:module';
import path from 'node:path';
import TerserPlugin from 'terser-webpack-plugin';

const require = createRequire(import.meta.url);

/**@type {import('webpack').Configuration} */
const webviewConfig = {
  mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
  context: import.meta.dirname,
  target: ['web', 'es2020'],
  entry: './src/panel/chat/chat.tsx',
  experiments: { outputModule: true },
  output: {
    path: path.resolve(import.meta.dirname, 'out'),
    filename: 'media/chat.js',
    libraryTarget: 'module',
    chunkFormat: 'module',
  },
  resolve: {
    mainFields: ['module', 'main'],
    extensions: ['.ts', '.js', '.tsx', '.jsx'],
    alias: {
      react: path.resolve(import.meta.dirname, './node_modules/react'),
      'react-dom': path.resolve(
        import.meta.dirname,
        './node_modules/react-dom',
      ),
      '@exa/typescript-utils/src': path.resolve(
        import.meta.dirname,
        './node_modules/@exa/typescript-utils/dist',
      ),
    },
    fallback: {
      tty: require.resolve('tty-browserify'),
      util: require.resolve('util/'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-env',
            ['@babel/preset-react', { runtime: 'automatic' }],
            '@babel/preset-typescript',
          ],
        },
      },
      {
        test: /\.css$/i,
        exclude: [/node_modules/],
        include: path.resolve(import.meta.dirname, 'src/panel/chat'),
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  optimization: {
    sideEffects: false,

    // This will be enabled when building in `production`, making the minimizer effective.
    minimize: false,
    minimizer: [
      new TerserPlugin({
        parallel: true,
      }),
    ],
  },
  performance: {
    maxEntrypointSize: 10485760, // 10MB in bytes
    maxAssetSize: 10485760, // 10MB in bytes
  },
  // generate source maps for Sentry
  devtool: 'source-map',
};

export default webviewConfig;
