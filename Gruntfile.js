"use strict";

// settings
var options = {
	hostname: "localhost"
};


module.exports = function (grunt) {

	// show elapsed time at the end
	require("time-grunt")(grunt);

	// load all grunt tasks
	require("load-grunt-tasks")(grunt);


	grunt.initConfig({
		fabricator: {
			src: "src",
			tmp: ".tmp",
			dist: "dist"
		},
		watch: {
			options: {
				livereload: "<%= connect.options.livereload %>"
			},
			sass: {
				files: ["<%= fabricator.src %>/{assets,toolkit}/scss/{,*/}*.{scss,sass}"],
				tasks: ["sass:*", "autoprefixer"],
				options: {
					livereload: false
				}
			},
			data: {
				files: [
					"<%= fabricator.src %>/{components,structures,documentation}/*.md",
					"<%= fabricator.src %>/{components,structures,documentation}/*.html"
				],
				tasks: ["collate", "compile-templates"]
			},
			templates: {
				files: [
					"<%= fabricator.src %>/views/**/*.html",
					"<%= fabricator.src %>/prototypes/*.html"
				],
				tasks: ["compile-templates"]
			},
			assets: {
				files: [
					"<%= fabricator.tmp %>/{assets,toolkit}/css/{,*/}*.css",
					"<%= fabricator.src %>/{assets,toolkit}/js/{,*/}*.js",
					"<%= fabricator.src %>/{assets,toolkit}/img/{,*/}*.{png,jpg,jpeg,gif,webp,svg}"
				]
			}
		},
		connect: {
			options: {
				port: 9000,
				livereload: 35729,
				hostname: options.hostname
			},
			livereload: {
				options: {
					open: true,
					base: [
						".tmp",
						"<%= fabricator.src %>"
					]
				}
			}
		},
		clean: {
			dist: {
				files: [{
					dot: true,
					src: [
						"<%= fabricator.dist %>/*",
						".tmp"
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
				style: "expanded",
				debugInfo: true
			},
			fabricator: {
				files: [{
					expand: true,
					cwd: "<%= fabricator.src %>/assets/scss",
					src: "*.scss",
					dest: "<%= fabricator.tmp %>/assets/css",
					ext: ".css"
				}]
			},
			toolkit: {
				files: [{
					expand: true,
					cwd: "<%= fabricator.src %>/toolkit/scss",
					src: "*.scss",
					dest: "<%= fabricator.tmp %>/toolkit/css",
					ext: ".css"
				}]
			}
		},
		autoprefixer: {
			options: {
				browsers: ["last 1 version"]
			},
			fabricator: {
				files: [{
					expand: true,
					cwd: "<%= fabricator.tmp %>/assets/css/",
					src: "{,*/}*.css",
					dest: "<%= fabricator.tmp %>/assets/css/"
				}]
			},
			toolkit: {
				files: [{
					expand: true,
					cwd: "<%= fabricator.tmp %>/toolkit/css/",
					src: "{,*/}*.css",
					dest: "<%= fabricator.tmp %>/toolkit/css/"
				}]
			}
		},
		useminPrepare: {
			options: {
				dest: "<%= fabricator.dist %>"
			},
			html: [
				".tmp/index.html",
			]
		},
		usemin: {
			options: {
				assetsDirs: ["<%= fabricator.dist %>"]
			},
			html: ["<%= fabricator.dist %>/{,*/}*.html"]
		},
		imagemin: {
			fabricator: {
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
			fabricator: {
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
			fabricator: {
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
			// put files not handled in other tasks here
			templates: {
				files: [{
					expand: true,
					dot: true,
					cwd: ".tmp",
					dest: "<%= fabricator.dist %>",
					src: [
						"*.html"
					]
				}]
			},
			dist: {
				files: [{
					expand: true,
					dot: true,
					cwd: "<%= fabricator.src %>",
					dest: "<%= fabricator.dist %>",
					src: [
						"*.{ico,png}",
						"components/**",
						"structures/**",
						"documentation/**",
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
	grunt.loadTasks("tasks");


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
		"collate",
		"compile-templates",
		"connect:livereload",
		"watch"
	]);

	// build
	grunt.registerTask("build", [
		"clean:dist",
		"collate",
		"compile-templates",
		"useminPrepare",
		"concurrent:dist",
		"autoprefixer:*",
		"concat",
		"cssmin",
		"copy",
		"compile-toolkit-js",
		"usemin",
		"uglify"
	]);

	// default `grunt`
	grunt.registerTask("default", [
		"jshint",
		"build"
	]);

};