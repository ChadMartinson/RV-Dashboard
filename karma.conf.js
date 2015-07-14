module.exports = function(config){
  config.set({

    basePath : './',

    frameworks: ['jspm', 'jasmine'],

    files : [
    ],

    autoWatch : true,

    browsers : ['Chrome', 'Firefox'],

    plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-jspm'
            ],

    jspm: {

      loadFiles: ['/src/**/**/*.js', '/test/unit/**/*.js']
    },

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    },

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO

  });
};
