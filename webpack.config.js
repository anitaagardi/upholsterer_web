const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');


module.exports = {
  entry: {
	  main:'./src/js/main.ts',
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'js/main.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    //contentBase: path.join(__dirname, "./build/dist/angularjs/static"),
    //publicPath: "./build/dist/angularjs/static",
    compress: true,
    port: 9100,
    hot: false,
    stats: {
        assets: true,
        children: false,
        chunks: true,
        hash: false,
        modules: true,
        publicPath: true,
        timings: true,
        version: false,
        warnings: true
    },
    /*proxy: {
        "/api/v1": "http://localhost:9180"
    },
    historyApiFallback: true*/
    //watchContentBase: true
},
  module: {
     rules: [
	   {
        test: /\.tsx?$/,
        use: 'ts-loader',
		//regex
        exclude: /node_modules/
       },
       {
         test: /\.css$/,
         use: [
           'style-loader',
		   'css-loader',
		   'sass-loader'
         ]
       },
       {
         test: /\.(png|svg|jpg|gif)$/,
         use: [
           'file-loader'
         ]
       },
       {
         test: /\.(woff|woff2|eot|ttf|otf)$/,
         use: [
           'file-loader'
         ]
       }
     ]
   },
   devtool: 'inline-source-map',
   plugins: [
      new CleanWebpackPlugin(['dist']),
      new CopyWebpackPlugin([
			{ 
			  from: 'src/index.html',
				to: '.'
      },

      { 
        from: 'src/grid.jpg',
        to: '.'
      },
      { 
        from: 'src/grid2.jpg',
        to: '.'
      },
      { 
        from: 'src/css/main.css',
        to: './css/main.css'
      },
      { 
        from: 'src/models/**/*',
        to: './models/[name].[ext]'
      }
        /*,
			
			{ 
			    from: 'src/js/utils/gl-matrix.js',
				to: 'js/utils/gl-matrix.js'
			}*/                      
      ])
   ]
};