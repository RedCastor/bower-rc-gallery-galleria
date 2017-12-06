(function (angular, $) {

    'use strict';

    var module = angular.module('rcGalleryGalleria', []);


    module.provider('rcGalleryGalleria', [ function rcGalleryGalleriaProvider() {

        this.loadUrls = [];

        this.setUrls = function( urls ){
            if ( angular.isArray(urls) ) {
                this.loadUrls = urls;
            }
        };

        this.setThemeUrls = function( urls ){
            if ( angular.isArray(urls) ) {
                this.themeUrls = urls;
            }
        };

        this.$get = [ function() {

            var load_urls = this.loadUrls;
            var theme_urls = this.themeUrls;

            return {
                getLoadUrls: function () {
                    return load_urls;
                },
                getThemeUrls: function () {
                    return theme_urls;
                }
            };
        }];

    }]);



    module.directive('rcgGalleria', [ '$log', '$interval', 'rcGalleryGalleria', function ( $log, $interval, rcGalleryGalleria) {
        return {
            restrict: 'EA',
            require: "^rc-gallery",
            link: function (scope, elem, attrs, rcGalleryApi) {

                var galleriaApi;
                var un_watch_is_ready;
                var stop_gallery_elem;

                function stop_find_gallery_elem() {
                    $interval.cancel(stop_gallery_elem);
                }


                // INIT
                function init ( is_ready ) {

                    if (is_ready === true) {
                        //Remove this watching.
                        un_watch_is_ready();

                        var n_interval = 0;

                        stop_gallery_elem = $interval(function() {

                            if ( rcGalleryApi.mediaGalleryElement.length !== 0 && angular.isDefined(window.Galleria) ) {
                                stop_find_gallery_elem();

                                //Extend with theme.
                                if ( rcGalleryApi.theme && rcGalleryApi.theme.length > 0 ) {
                                    angular.extend(rcGalleryApi.options, {theme: rcGalleryApi.theme});
                                }

                                //Extend with width.
                                var width = parseInt(rcGalleryApi.width, 10);
                                if ( !isNaN(width) ) {
                                    angular.extend(rcGalleryApi.options, {width: width});
                                }

                                //Extend with height.
                                var height = parseInt(rcGalleryApi.height, 10);
                                if ( !isNaN(height) ) {
                                    angular.extend(rcGalleryApi.options, {height: height});
                                }

                                var options = angular.extend({}, rcGalleryApi.options, {extend: function () {galleriaApi = this;}});

                                angular.forEach(rcGalleryGalleria.getThemeUrls(), function (url) {
                                    Galleria.loadTheme(url);
                                });

                                $log.debug(options);

                                Galleria.run(
                                    rcGalleryApi.mediaGalleryElement,
                                    options
                                );

                                rcGalleryApi.setMediaReady();
                            }
                            else if ( n_interval >= 240 ) {
                                stop_find_gallery_elem();
                            }

                            n_interval++;
                        }, 250);
                    }

                }


                rcGalleryApi.addLoadUrls(rcGalleryGalleria.getLoadUrls());

                scope.$on('$destroy', function() {
                    if(galleriaApi && galleriaApi.destroy) {
                        galleriaApi.destroy();
                    }
                });


                // Watchers
                un_watch_is_ready = scope.$watch(function() {
                    return rcGalleryApi.isReady;
                }, init);

            }
        };
    }]);

}(angular, jQuery));