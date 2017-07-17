var path = require('path');

module.exports = {
    entry: {
        home: './src/main/js/home.js',
        tasklist: './src/main/js/tasklist.js'
    },
    devtool: 'sourcemaps',
    output: {
        path: __dirname,
        filename: './src/main/resources/static/built/[name].js'
    },
    resolve: {
        alias: {
            'stompjs': __dirname + '/node_modules/stompjs/lib/stomp.js',
        }
    },
    module: {
        loaders: [
            {
                test: path.join(__dirname, '.'),
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                query: {
                    cacheDirectory: true,
                    presets: ['es2015', 'react']
                }
            }
        ]
    }
};
