module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      options: {
        eqnull: true,
        newcap: true,
        indent: 2,
        noempty: true,
        node: true
      },
      all: {
        src: ['*.js']
      }
    },
    jsonlint: {
      all: {
        src: [ '*.json' ]
      }
    },
    gjslint: {
      options: {
         flags: [
           '--disable 220' // ignore missing documentation
         ],
        reporter: {
          name: 'console'
        }
      },
      all: {  //specify your targets, grunt style.
        src: ['*.js'],
      }
    },
    fixjsstyle: {
      options: {
        reporter: {
          name: 'console'
        }
      },
      all: {
        src: ['*.js'],
      }
    }
  });

  // Load modules with task definitions
  grunt.loadNpmTasks('grunt-gjslint');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jsonlint');

  // Default task(s)
  grunt.registerTask('default', ['jshint', 'gjslint']);
};
