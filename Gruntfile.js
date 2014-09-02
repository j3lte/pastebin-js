'use strict';
module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: [
                'Gruntfile.js',
                'index.js',
                'bin/*.js',
                'lib/*.js'
            ],
            options: {
                jshintrc : '.jshintrc',
                reporter: require('jshint-stylish'),
                force: false
            }
        },
        watch : {
            jshint : {
                files : '<%= jshint.all %>',
                tasks: ['jshint']
            }
        },
        simplemocha: {
            options: {
                globals: ['expect'],
                timeout: 3000,
                ignoreLeaks: false,
                ui: 'bdd',
                reporter: 'tap'
            },
            all: { src: ['tests/*.js'] }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-simple-mocha');

    // Default task.
    grunt.registerTask('default', ['jshint']);

    grunt.registerTask('test', ['jshint', 'simplemocha']);

    grunt.registerTask('dev', ['jshint', 'watch']);
};
