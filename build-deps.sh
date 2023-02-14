#!/bin/sh

## install file perms
mode=u=rw,go=r

## DELETE old bower_components
rm -r assets/includes

## MAKE assets/include
#angular-1.4.0
install -D --mode=$mode ./node_modules/angular/angular.min.js assets/includes/angular-1.4.0/angular.min.js
install -D --mode=$mode ./node_modules/angular-resource/angular-resource.min.js assets/includes/angular-1.4.0/angular-resource.min.js
install -D --mode=$mode ./node_modules/angular-route/angular-route.min.js assets/includes/angular-1.4.0/angular-route.min.js
install -D --mode=$mode ./node_modules/angular-sanitize/angular-sanitize.min.js assets/includes/angular-1.4.0/angular-sanitize.min.js
install -D --mode=$mode ./node_modules/angular-translate/angular-translate.min.js assets/includes/angular-1.4.0/angular-translate.min.js
install -D --mode=$mode ./node_modules/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js assets/includes/angular-1.4.0/angular-translate-loader-static-files.min.js
#bootstrap-3.3.4
install -D --mode=$mode ./node_modules/bootstrap/dist/js/bootstrap.min.js assets/includes/bootstrap-3.3.4/js/bootstrap.min.js
install -D --mode=$mode ./node_modules/bootstrap/dist/css/bootstrap.min.css assets/includes/bootstrap-3.3.4/css/bootstrap.min.css
cp -r ./node_modules/bootstrap/dist/fonts/ assets/includes/bootstrap-3.3.4/fonts
#bootstrap-select-1.7.2
install -D --mode=$mode ./node_modules/bootstrap-select/dist/js/bootstrap-select.min.js assets/includes/bootstrap-select/js/bootstrap-select.min.js
install -D --mode=$mode ./node_modules/bootstrap-select/dist/css/bootstrap-select.min.css assets/includes/bootstrap-select/css/bootstrap-select.min.css
#filesaver-2.0.5
install -D --mode=$mode node_modules/filesaver/dist/FileSaver.min.js assets/includes/filesaver-2.0.5/filesaver.min.js
#jquery-2.1.4
install -D --mode=$mode ./node_modules/jquery/dist/jquery.min.js assets/includes/jquery-2.1.4/jquery-2.1.4.min.js
#jquery-ui-1.11.4
install -D --mode=$mode ./node_modules/jquery-ui/jquery-ui.min.js assets/includes/jquery-ui-1.11.4/jquery-ui.min.js
install -D --mode=$mode node_modules/jquery-ui/themes/black-tie/jquery-ui.min.css assets/includes/jquery-ui-1.11.4/jquery-ui.min.css
#js-zip-3.10.1
install -D --mode=$mode ./node_modules/jszip/dist/jszip.min.js assets/includes/js-zip-3.10.1/jszip.min.js
# lodash-4.17.15
install -D --mode=$mode ./node_modules/lodash/dist/lodash.min.js assets/includes/lodash-4.17.15/lodash.min.js
# xlsx-populate-1.21.0
install -D --mode=$mode ./node_modules/xlsx-populate/browser/xlsx-populate.min.js assets/includes/xlsx-populate-1.21.0/xlsx-populate.min.js
