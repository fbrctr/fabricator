/**
 * Fabricator Grunt tasks
 */

"use strict";

// live reload settings
var LIVERELOAD_PORT = 35729;
var lrSnippet = require("connect-livereload")({
	port: LIVERELOAD_PORT
});
var mountFolder = function (connect, dir) {
	return connect.static(require("path").resolve(dir));
};
var hostname = "localhost";



module.exports = function (grunt) {

	// show elapsed time at the end
	require("time-grunt")(grunt);

	// load all grunt tasks
	require("load-grunt-tasks")(grunt);

	// configurable paths
	var fabricatorConfig = {
		src: "src",
		dist: "dist"
	};

	grunt.initConfig({
		fabricator: fabricatorConfig,
		watch: {
			sass: {
				files: ["<%= fabricator.src %>/{assets,toolkit}/scss/{,*/}*.{scss,sass}"],
				tasks: ["sass:*", "autoprefixer"]
			},
			data: {
				files: [
					"<%= fabricator.src %>/**/*.md",
					"<%= fabricator.src %>/**/*.html"
				],
				tasks: ["collate"],
				options: {
					livereload: true
				}
			},
			livereload: {
				options: {
					livereload: LIVERELOAD_PORT
				},
				files: [
					"<%= fabricator.src %>/**/*.html",
					"<%= fabricator.src %>/{assets,toolkit}/css/{,*/}*.css",
					"<%= fabricator.src %>/{assets,toolkit}/js/{,*/}*.js",
					"<%= fabricator.src %>/{assets,toolkit}/img/{,*/}*.{png,jpg,jpeg,gif,webp,svg}"
				]
			}
		},
		connect: {
			options: {
				port: 9000,
				hostname: hostname
			},
			livereload: {
				options: {
					middleware: function (connect) {
						return [
							lrSnippet,
							mountFolder(connect, ".tmp"),
							mountFolder(connect, fabricatorConfig.src)
						];
					}
				}
			},
			dist: {
				options: {
					middleware: function (connect) {
						return [
							mountFolder(connect, fabricatorConfig.dist)
						];
					}
				}
			}
		},
		open: {
			serve: {
				path: "http://" + hostname + ":<%= connect.options.port %>"
			}
		},
		clean: {
			dist: {
				files: [{
					dot: true,
					src: [
						"<%= fabricator.dist %>/*"
					]
				}]
			},
			serve: ".tmp"
		},
		jshint: {
			options: {
				jshintrc: ".jshintrc"
			},
			all: [
				"Gruntfile.js",
				"<%= fabricator.src %>/{assets,toolkit}/js/{,*/}*.js",
				"!<%= fabricator.src %>/{assets,toolkit}/js/vendor/*",
				"!<%= fabricator.src %>/{assets,toolkit}/js/build/*"
			]
		},
		sass: {
			options: {
				style: "expanded"
			},
			assets: {
				files: [{
					expand: true,
					cwd: "<%= fabricator.src %>/assets/scss",
					src: "*.scss",
					dest: "<%= fabricator.src %>/assets/css",
					ext: ".css"
				}]
			},
			toolkit: {
				files: [{
					expand: true,
					cwd: "<%= fabricator.src %>/toolkit/scss",
					src: "*.scss",
					dest: "<%= fabricator.src %>/toolkit/css",
					ext: ".css"
				}]
			}
		},
		autoprefixer: {
			options: {
				browsers: ["last 1 version"]
			},
			assets: {
				files: [{
					expand: true,
					cwd: "<%= fabricator.src %>/assets/css/",
					src: "{,*/}*.css",
					dest: "<%= fabricator.src %>/assets/css/"
				}]
			},
			toolkit: {
				files: [{
					expand: true,
					cwd: "<%= fabricator.src %>/toolkit/css/",
					src: "{,*/}*.css",
					dest: "<%= fabricator.src %>/toolkit/css/"
				}]
			}
		},
		useminPrepare: {
			options: {
				dest: "<%= fabricator.dist %>"
			},
			html: [
				"<%= fabricator.src %>/*.html",
			]
		},
		usemin: {
			options: {
				dirs: ["<%= fabricator.dist %>"]
			},
			html: [
				"<%= fabricator.dist %>/{,*/}*.html"
			]
		},
		imagemin: {
			assets: {
				files: [{
					expand: true,
					cwd: "<%= fabricator.src %>/assets/img",
					src: "**/*.{png,jpg,jpeg,gif}",
					dest: "<%= fabricator.dist %>/assets/img"
				}]
			},
			toolkit: {
				files: [{
					expand: true,
					cwd: "<%= fabricator.src %>/toolkit/img",
					src: "**/*.{png,jpg,jpeg,gif}",
					dest: "<%= fabricator.dist %>/toolkit/img"
				}]
			}
		},
		svgmin: {
			assets: {
				files: [{
					expand: true,
					cwd: "<%= fabricator.src %>/assets/img",
					src: "**/*.svg",
					dest: "<%= fabricator.dist %>/assets/img"
				}]
			},
			toolkit: {
				files: [{
					expand: true,
					cwd: "<%= fabricator.src %>/toolkit/img",
					src: "**/*.svg",
					dest: "<%= fabricator.dist %>/toolkit/img"
				}]
			}
		},
		cssmin: {
			assets: {
				expand: true,
				cwd: "<%= fabricator.dist %>/assets/css",
				src: ["{,*/}*.css"],
				dest: "<%= fabricator.dist %>/assets/css"
			},
			toolkit: {
				expand: true,
				cwd: "<%= fabricator.dist %>/toolkit/css",
				src: ["{,*/}*.css"],
				dest: "<%= fabricator.dist %>/toolkit/css"
			}
		},
		uglify: {
			assets: {
				options: {
					preserveComments: "some",
					mangle: true,
					compress: true
				},
				files: [{
					expand: true,
					cwd: "<%= fabricator.dist %>/assets/js",
					src: [
						"**/*.js"
					],
					dest: "<%= fabricator.dist %>/assets/js"
				}]
			},
			toolkit: {
				options: {
					preserveComments: "some",
					mangle: true,
					compress: true
				},
				files: [{
					expand: true,
					cwd: "<%= fabricator.dist %>/toolkit/js",
					src: [
						"**/*.js"
					],
					dest: "<%= fabricator.dist %>/toolkit/js"
				}]
			}
		},
		copy: {
			// Put files not handled in other tasks here
			dist: {
				files: [{
					expand: true,
					dot: true,
					cwd: "<%= fabricator.src %>",
					dest: "<%= fabricator.dist %>",
					src: [
						"*.{ico,png,txt,html,php}",
						"components/**",
						"structures/**",
						"documentation/**",
						"inc/**",
						"assets/json/**",
						"toolkit/css/**"
					]
				}]
			}
		},
		concurrent: {
			serve: [
				"sass:*"
			],
			dist: [
				"sass:*",
				"imagemin:*",
				"svgmin:*"
			]
		}
	});


	// load additional tasks
	grunt.loadTasks("build/tasks");


	// collate data
	grunt.registerTask("collate", [
		"collate-components",
		"collate-structures",
		"collate-prototypes",
		"collate-docs",
		"collate-write-json"
	]);

	// live reload serve
	grunt.registerTask("serve", [
		"clean:serve",
		"concurrent:serve",
		"autoprefixer",
		"connect:livereload",
		"collate",
		"open",
		"watch"
	]);

	// build
	grunt.registerTask("build", [
		"clean:dist",
		"useminPrepare",
		"concurrent:dist",
		"autoprefixer:*",
		"collate",
		"concat",
		"cssmin:*",
		"copy:dist",
		"compile-toolkit-js",
		"uglify:*",
		"usemin"
	]);

	// default `grunt`
	grunt.registerTask("default", [
		"jshint",
		"build"
	]);
};
