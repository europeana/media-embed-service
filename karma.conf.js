const includeCoverage = process.argv[3] && process.argv[3].match('coverage');
const accessibility = process.argv[3] && process.argv[3].match('accessibility');

console.log(`Karma will${includeCoverage ? ' ' : ' NOT '}generate coverage`)

const rules = () => {
  return [
    {
      test: /\.js$/i,
      exclude: /(node_modules)/,
      loader: 'babel-loader'
    },
    {
      test: /\.[s]?css$/,
      loader: 'style-loader!css-loader!sass-loader'
    },
    ... includeCoverage ? [
      {
        enforce: 'pre',
        test: /.spec\.js$/,
        include: /tests\/spec/,
        exclude: /node_modules/,
        use: [{ loader: 'babel-loader' }]
	      },
	      {
        enforce: 'pre',
        test: /\.js$/,
        include: /src/,
        exclude: /(node_modules|tests)/,
        use: [{ loader: 'istanbul-instrumenter-loader', query: { esModules: true } }]
      }
    ] : []
  ];
};

module.exports = function (config) {
  let conf = {
    basePath: '',
    exclude: [],
    files: [
      { pattern: `./tests/spec/**/${accessibility ? 'accessibility' : '!(accessibility)'}.spec.js`, watched: true, type: 'module' },
      'https://code.jquery.com/jquery-3.4.1.min.js'
    ],
    autoWatch: true,
    singleRun: true,
    failOnEmptyTestSuite: false,
    logLevel: config.LOG_WARN,
    frameworks: ['jasmine'],
    browsers: ['Chrome'/*,'PhantomJS','Firefox','Edge','ChromeCanary','Opera','IE','Safari'*/],
    reporters: ['progress', 'kjhtml', 'spec', ... includeCoverage ? ['coverage'] : []],

    //address that the server will listen on, '0.0.0.0' is default
    listenAddress: '0.0.0.0',
    //hostname to be used when capturing browsers, 'localhost' is default
    hostname: 'localhost',
    //the port where the web server will be listening, 9876 is default
    port: 9876,
    //when a browser crashes, karma will try to relaunch, 2 is default
    retryLimit: 0,
    //how long does Karma wait for a browser to reconnect, 2000 is default
    browserDisconnectTimeout: 5000,
    //how long will Karma wait for a message from a browser before disconnecting from it, 10000 is default
    browserNoActivityTimeout: 10000,
    //timeout for capturing a browser, 60000 is default
    captureTimeout: 60000,

    client: {
      captureConsole: false,
      clearContext: false,
      jasmine: {
        random: false
      }
    },

    /* karma-webpack config
       pass your webpack configuration for karma
       add `babel-loader` to the webpack configuration to make
       the ES6+ code in the test files readable to the browser
       eg. import, export keywords */
    webpack: {
      module: {
        rules: rules()
      }
    },
    preprocessors : {
      './tests/spec/*.js': ['webpack', 'sourcemap'],
      ... includeCoverage ? [{'./src/**/*.js': ['webpack', 'sourcemap', 'coverage']}
      ] :[]
    },
    webpackMiddleware: {
      //turn off webpack bash output when run the tests
      noInfo: true,
      stats: 'errors-only'
    }
  };

  if(includeCoverage){
    conf.coverageIstanbulReporter = {
      dir : 'coverage/',
      reports: [ 'html' ],
      fixWebpackSourcePaths: true
    };
  }

  config.set(conf);
};
