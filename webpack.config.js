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
        from: 'src/css/main.css',
        to: './css/main.css'
      }
        /*,
			
			{ 
			    from: 'src/js/utils/gl-matrix.js',
				to: 'js/utils/gl-matrix.js'
			}*/                      
      ])
   ]
};