// generated on 2016-09-28 using generator-graphics 0.0.1
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync');
const del = require('del');
const wiredep = require('wiredep').stream;
const $ = gulpLoadPlugins();
const reload = browserSync.reload;
const awsConfig = require('./config/aws.json');

gulp.task('movejst', () => {
    return gulp.src(require('main-bower-files')('**/*.{jst,html}', function (err) {}))
        .pipe(gulp.dest('app/templates_Masters'));
});

gulp.task('styles', () => {
    return gulp.src('app/styles/**/*.scss')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.sass.sync({
            outputStyle: 'expanded',
            precision: 10,
            includePaths: ['.']
        }).on('error', $.sass.logError))
        .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest('.tmp/styles'))
        .pipe(reload({stream: true}));
});


gulp.task('templates', () => {
    return gulp.src('app/templates/**/*.html')
        .pipe($.templateCompile({
            namespace: "Reuters.Graphics.pieCharter.Template",
            name: function(file){
                return file.relative.split('.')[0];
            },
            templateSettings: {
                variable: 't'
            }
        }))
        .pipe($.concat('templates.js'))
        .pipe($.babel())
        .pipe(gulp.dest('.tmp/scripts'));
});


gulp.task('scripts', ['templates'], () => {
    return gulp.src(['app/scripts/**/*.js', '!app/scripts/vendor/babel-external-helpers.js' ]) //'!app/scripts/vendor/'
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.babel())
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('.tmp/scripts'));
        //.pipe(reload({stream: true}));
});


function lint(files, options) {
    return gulp.src(files)
        .pipe(reload({stream: true, once: true}))
        .pipe($.eslint(options))
        .pipe($.eslint.format())
        .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}


gulp.task('lint', () => {
    return lint('app/scripts/**/*.js', {
        fix: true
    })
    .pipe(gulp.dest('app/scripts'));
});




gulp.task('compile-html', ['styles', 'scripts','fonts'], () => {
  
    return gulp.src('app/*.html')
        .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
        .pipe(gulp.dest('dist'));
});



gulp.task('localize', ['compile-html',], () => {
    return gulp.src('dist')
        .pipe($.staticI18n({'localeDirs': ['app/locale'], defaultLang: 'xx'}));
});


gulp.task('cache-breaker', ['localize', 'pathing', 'compile-html'], () => {
    return gulp.src(['dist/*.html', 'dist/locales/**/*.html',])
        .pipe($.replace(/"((scripts|styles|images)\/.*(\.js|\.jpg|\.css))"/g, '"$1?v=' + new Date().getTime() + '"' ))
        .pipe(gulp.dest('dist'))
});


gulp.task('pathing', ['compile-html', 'localize',], () => {
    return gulp.src(['dist/*.html', 'dist/**/*.html',])
        .pipe($.build({
            'page_url': '',
            'encoded_page_url': encodeURIComponent('')
        }))
        .pipe(gulp.dest('dist'));
});



gulp.task('images', () => {
    return gulp.src('app/images/**/*')
        .pipe(gulp.dest('dist/images'));
});



gulp.task('fonts', () => {
    return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
        .concat('app/fonts/**/*'))
        .pipe(gulp.dest('.tmp/fonts'))
        .pipe(gulp.dest('dist/fonts'));
});



gulp.task('extras', () => {
    return gulp.src([
        'app/*.*',
        '!app/*.html'
    ], {
        dot: true
    }).pipe(gulp.dest('dist'));
});


gulp.task('uglify', ['cache-breaker'],  () => {
    return gulp.src(['dist/**/*'])
        .pipe($.if('*.js', $.uglify().on('error', $.util.log)))
        .pipe($.if('*.css', $.cssnano({safe: true, autoprefixer: false})))
        .pipe(gulp.dest('dist-min'));
         
});



gulp.task('s3-dev', () => {
    var publisher = $.awspublish.create({
        region: awsCreds.dev.region,
        params:{
            Bucket: awsCreds.dev.bucket,
            CacheControl: 'max-age=300',
        },
        //accessKeyId: awsCreds.dev.accessKeyId,
        //secretAccessKey: awsCreds.dev.secretAccessKey,
        
    });
    
    return gulp.src('dist/**/*')
        .pipe($.rename((path) => {
           path.dirname = awsCreds.dev.folder + '/' + path.dirname;
        }))
        .pipe(publisher.publish({
            'Cache-Control': 'max-age=300, public'
        }))
        .pipe($.awspublish.reporter());
});

gulp.task('s3-dist', () => {
    var publisher = $.awspublish.create({
        region: awsCreds.dist.region,
        params:{
            Bucket: awsCreds.dist.bucket,
            CacheControl: 'max-age=3600',
        },
        //accessKeyId: awsCreds.dist.accessKeyId,
        //secretAccessKey: awsCreds.dist.secretAccessKey,
    });
    
    return gulp.src('dist-min/**/*')
        .pipe($.rename((path) => {
           path.dirname = awsCreds.dist.folder + '/' + path.dirname;
        }))
        .pipe(publisher.publish({
            'Cache-Control': 'max-age=3600, public'
        },
        {
            //force: true
        }))
        .pipe($.awspublish.reporter());
});




gulp.task('clean', del.bind(null, ['.tmp', 'dist']));


gulp.task('serve', ['styles', 'scripts', 'fonts',], () => {
    browserSync({
        notify: false,
        port: 9000,
        server: {
            baseDir: ['.tmp', 'app'],
            routes: {
                '/bower_components': 'bower_components'
            }
        },
        reloadDelay: 2000,
        reloadDebounce: 2000
    });

    gulp.watch([
        'app/*.html',
        'app/images/**/*',
        '.tmp/fonts/**/*',
        '.tmp/scripts/**/*.js',
    ]).on('change', reload);


    gulp.watch('app/templates/**/*.html', ['scripts']);
    gulp.watch('app/styles/**/*.scss', ['styles']);
    gulp.watch('app/scripts/**/*.js', ['scripts']);
    gulp.watch('app/fonts/**/*', ['fonts']);
    gulp.watch('bower.json', ['wiredep', 'fonts']);
});



gulp.task('serve:dist', () => {
    browserSync({
        notify: false,
        port: 9000,
        server: {
            baseDir: ['dist']
        }
    });
});


gulp.task('serve:test', ['scripts'], () => {
    browserSync({
        notify: false,
        port: 9000,
        ui: false,
        server: {
            baseDir: 'test',
            routes: {
                '/scripts': '.tmp/scripts',
                '/bower_components': 'bower_components'
            }
        }
    });

    gulp.watch('app/scripts/**/*.js', ['scripts']);
    gulp.watch('test/spec/**/*.js').on('change', reload);
});


// inject bower components
gulp.task('wiredep', () => {
    gulp.src('app/styles/*.scss')
        .pipe(wiredep({
            ignorePath: /^(\.\.\/)+/
        }))
        .pipe(gulp.dest('app/styles'));
      
    gulp.src('app/*.html')
        .pipe(wiredep({
            ignorePath: /^(\.\.\/)*\.\./
        }))
        .pipe(gulp.dest('app'));
});




//these are all horrible hacks to make sure certain things are the last in a sequence.
//there's probably a more gulpy way to do this, but this works for now.
gulp.task('build-app', ['images', 'compile-html',  'fonts', 'extras', 'localize', 'cache-breaker', 'pathing', 'uglify'], () => {
    return gulp.src(['dist/**/*', 'dist-min/**/*']).pipe($.size({title: 'build', gzip: true}));
});

gulp.task('build-app-dev', ['images', 'compile-html',  'fonts', 'extras', 'localize', 'cache-breaker', 'pathing',], () => {
    return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});


//this basically makes sure the upload happens at the end.
gulp.task('build-app-dev-s3', ['build-app-dev'], () => {
    gulp.start('s3-dev');
});

gulp.task('build-app-s3', ['build-app'], () => {
    gulp.start('s3-dist');
});



//The below commands are the ones people should actually run.
//builds everything.
gulp.task('build', ['clean'], () => {
    gulp.start('build-app');
});

//builds a compiled but unminified version of everything.
gulp.task('build-dev', ['clean'], () => {
    gulp.start('build-app-dev');
});


//builds the unminified dev stuff and kicks to S3.
gulp.task("build-dev-s3", ['clean'], () =>{
    gulp.start("build-app-dev-s3");
});

//builds the minified stuff and kicks to S3 live.
gulp.task("build-dist-s3", ['clean'], () =>{
    gulp.start("build-app-s3");
});

gulp.task('build-both', ['build-app'], () => {
    gulp.start("build-dev");
});

gulp.task('copyjs', function() {
   gulp.src('app/scripts/charter/**/*.js')
   .pipe(gulp.dest('pieCharter/js/src'));
});

gulp.task('copyscss', function() {
   gulp.src('app/styles/**/**pie**.scss')
   .pipe(gulp.dest('pieCharter/scss'));
});

gulp.task('copyjst', function() {
   gulp.src('app/templates/**/**.html')
   .pipe(gulp.dest('pieCharter/jst'));
});

gulp.task('copyjsdist', function() {
   gulp.src('dist/en/scripts/pieCharter.js')
   .pipe(gulp.dest('pieCharter/dist/js'));
});

gulp.task('copyblock', function() {
   gulp.src('app/scripts/main.js')
   .pipe($.rename('pieCharterBlock.md'))
   .pipe(gulp.dest('pieCharter/chartBlocks/'));
});

//need minified css

gulp.task("moveAll", function(){
	gulp.start("copyjs")
	gulp.start("copyscss")
	gulp.start("copyjst")
	gulp.start("copyjsdist")
	gulp.start("copyblock")

})

gulp.task('default', ['build-both'], () => {
    gulp.start('moveAll');
});