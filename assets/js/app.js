var app = angular.module('app', [
    'ngAnimate',
    'ngMap',
    'ngMaterial',
    'material.svgAssetsCache',
    'slickCarousel'
]);
app.factory('pdFactory', ['$http', '$window', '$q', function ($http, $window, $q) {
    return {
        getUserLocation: function() {
            var deferred = $q.defer();

            if (!$window.navigator.geolocation) {
                deferred.reject('Geolocation not supported.');
            } else {
                $window.navigator.geolocation.getCurrentPosition(
                    function (position) {
                        deferred.resolve(position);
                    },
                    function (err) {
                        deferred.reject(err);
                    });
            }

            return deferred.promise;
        },
        getUserLocationBackup: function() {
            return $http.get('http://ipinfo.io/json');
        },
        reverseGecode: function(loc) {
        	var thisUrl = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + loc + '&components=administrative_area&key=AIzaSyAFzBg6EWivP2e2GR0DmXdosJKqJylV9AQ';
        	console.log('reversegeocodeurl', thisUrl);
            return $http.get(thisUrl);
        },
        getWeather: function(lat, lon, country) {
			var thisUrl = "http://api.openweathermap.org/data/2.5/weather";
            var uriParameters = "?lat=" + lat + "&lon=" + lon + "&appid=3e2c248c8a21fbe1997eb778a2f2c36c";
            if (country == "US") {
                uriParameters += "&units=imperial";
            } else {
                uriParameters += "&units=metric";
            }
        	return $http.get(thisUrl + uriParameters);
        }
        
    };
}]);

app.directive('onDragEnd', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.on('$md.pressup', function() {
                scope.defaultTiles();
            });
        }
    };
});
app.controller('portfolioDashboardController', portfolioDashboardController);

portfolioDashboardController.$inject = ['$scope', '$window', '$interval', '$timeout', 'pdFactory', '$mdMedia', '$mdColorPalette', 'NgMap'];

function portfolioDashboardController($scope, $window, $interval, $timeout, pdFactory, $mdMedia, $mdColorPalette, NgMap) {
	console.log('portfolio dashboard controller', Date());
	var self = this, j= 0, counter = 0;
	$scope.colorSet = 1;
	$scope.maxColorSets = 5;
	$scope.dataSet = 1;
	$scope.userLocation = {};
	$scope.userCoords = null;
	$scope.showmain = true;
    $scope.isGoing = true;
	// $scope.colors = Object.keys($mdColorPalette);
	// console.log('colors', $scope.colors);
	$scope.clock = ""; // initialise the time variable
    $scope.tickInterval = 1000;//ms
    NgMap.getMap().then(function(map) {
        console.log(map.getCenter());
        console.log('markers', map.markers);
        console.log('shapes', map.shapes);
        
      });
	pdFactory.getUserLocation().then(function(res) {
		console.log('got user location', res);
		var usercoords = res.coords.latitude + "," + res.coords.longitude;
		$scope.userCoords = usercoords;
		doReverseGeocode(usercoords);
	}).catch(function(e) {
		console.log('error getting user location', e);
		pdFactory.getUserLocationBackup().then(function(res) {
			console.log('got user location backup', res);
			var usercoords = res.data.loc;
			$scope.userCoords = usercoords;
			doReverseGeocode(usercoords);
		}).catch(function(e) {
			console.log('error getting user location backup', e);
		});
	});

	function doReverseGeocode(data) {
		pdFactory.reverseGecode(data).then(function(res) {
			console.log('reversegeocode', res);
			parseGeocode(res);
			var loc = $scope.userCoords.split(',');
			getWeather(loc[0], loc[1], $scope.userLocation.country);
		}).catch(function(e) {
			console.log('error reverse geocoding', e);
		});
	}

	function getWeather(lat, lon, country) {
		pdFactory.getWeather(lat,lon,country).then(function(res) {
			console.log('got weather', res);
			$scope.userLocation.temperature = Math.trunc(res.data.main.temp);
            $scope.userLocation.icon = res.data.weather[0].icon;
            console.log('---userlocation---', $scope.userLocation);
		}).catch(function(e) {
			console.log('error getting weather', e);
		});
	}

	function parseGeocode(res) {
		for (var i = 0; i < res.data.results[0].address_components.length; i++) {
            var component = res.data.results[0].address_components[i];
            if (component.types[0] == "locality") {
                usercity = component.long_name;
            }
            if (component.types[0] == "administrative_area_level_1") {
                userstate = component.long_name;
            }
            if (component.types[0] == "country") {
                $scope.userLocation.country = component.short_name;
                if ($scope.userLocation.country == 'US') {
                    $scope.userLocation.weatherUnit = "F";
                } else {
                    $scope.userLocation.weatherUnit = "C";
                }
            }
        }
        if (usercity) {
            $scope.userLocation.address = usercity;
        } else {
            $scope.userLocation.address = "";
        }
        if (userstate) {
            if (usercity) {
                $scope.userLocation.address += ", ";
            }
            $scope.userLocation.address += userstate;
        }
	}

    function tick() {
        $scope.clock = Date.now() // get the current time
        $timeout(tick, $scope.tickInterval); // reset the timer
    }

    // Start the timer
    $timeout(tick, $scope.tickInterval);


	function getRandomInt(min, max) {
  		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	function randomSpan() {
	    var r = Math.random();
	    if (r < 0.8) {
	        return 1;
	    } else if (r < 0.9) {
	        return 2;
	    } else {
	        return 3;
	    }
	}
	function changeColors() {

		$scope.colorSet++;
		
		if ($scope.colorSet > $scope.maxColorSets) $scope.colorSet=1;

	}
	$scope.setColor = function(i) {
		$scope.colorSet = i;
	}
	var defaultTiles= [[{ id: 1, title: '0', fontcolor: '#ddd', footer: 'Toggle color changes', rowspan: 1, colspan: 1, colspanxs: 2, colspansm: 2 },
						{ id: 3, title: '2', fontcolor: '#ddd', footer: 'Compare and contrast country populations', rowspan: 2, colspan: 3, rowspanxs: 2, colspanxs: 2 },
                        { id: 4, title: '1', fontcolor: '#ddd', footer: 'Some technologies used', rowspan: 1, colspan: 1},
                        { id: 5, title: '4', fontcolor: '#ddd', footer: 'How far you are from me', rowspan: 1, colspan: 3, colspanxs: 2, colspans: 2 },
						{ id: 2, title: '3', fontcolor: '#ddd', footer: 'Places to find me', rowspan: 1, colspan: 1 },
                        { id: 24, title: '3', fontcolor: '#ddd', footer: '', rowspan: 1, colspan: 1, span: 'Add countries to compare their populations based on gender and increasing age.', hidden: true },
                        ],
						[{ id: 6, title: '0', fontcolor: '#ddd', footer: 'Toggle color changes', rowspan: 1, colspan: 1, colspanxs: 2, colspansm: 2  },
						{ id: 7, title: '1', fontcolor: '#ddd', footer: 'How far you are from me', rowspan: 1, colspan: 3, colspansm: 2 },
						{ id: 9, title: '3', fontcolor: '#ddd', footer: '', rowspan: 2, colspan: 3, colspansm: 2, colspanxs: 2, rowspansm: 2, rowspanxs: 2 },
                        { id: 10, title: '2', fontcolor: '#ddd', footer: 'Some technologies used', rowspan: 1, colspan: 1},
                        { id: 8, title: '2', fontcolor: '#ddd', footer: 'Places to find me', rowspan: 1, colspan: 1},
						{ id: 22, title: '4', fontcolor: '#ddd', footer: '', rowspan: 1, colspan: 1, span: 'Peak at photos taken anywhere in the world.  Select a destination and let her rip', hidden: true}],
						[{ id: 11, title: '1', fontcolor: '#ddd', footer: '', rowspan: 2, colspan: 3, colspanxs: 2, colspansm: 2, rowspanxs: 2, rowspansm: 2},
						{ id: 12, title: '4', fontcolor: '#ddd', footer: 'Toggle color changes', rowspan: 1, colspan: 1, colspansm: 2, colspanxs: 2 },
						{ id: 13, title: '1', fontcolor: '#ddd', footer: 'Some technologies used', rowspan: 1, colspan: 1 },
						{ id: 14, title: '2', fontcolor: '#ddd', footer: 'Places to find me', rowspan: 1, colspan: 1 },
						{ id: 15, title: '3', fontcolor: '#ddd', data: 'states', footer: 'How far you are from me', colspanxs: 2, rowspan: 1, colspan: 3 }],
						[{ id: 16, title: '0', fontcolor: '#ddd', footer: 'Toggle color changes', rowspan: 1, colspan: 1, colspansm: 2, colspanxs: 2 },
                        { id: 19, title: '3', fontcolor: '#ddd', footer: '', rowspan: 2, colspan: 3, colspansm: 2, colspanxs: 2, rowspansm: 2, rowspanxs: 2 },
                        { id: 17, title: '1', fontcolor: '#ddd', footer: 'Some technologies used', rowspan: 1, colspan: 1 },
                        { id: 18, title: '2', fontcolor: '#ddd', footer: 'How far you are from me', rowspan: 1, colspan: 3, colspansm: 2, colspanxs: 2 },
                        { id: 21, title: '0', fontcolor: '#ddd', data: '', footer: 'Places to find me', rowspan: 1, colspan: 1 },
                        { id: 20, title: '0', fontcolor: '#ddd', data: '', footer: '', rowspan: 1, colspan: 1, colspansm: 2, colspanxs: 2, hidden: true }],
						[{ id: 23, title: '0', fontcolor: '#ddd', footer: 'Toggle color changes', rowspan: 1, colspan: 1 },
                        
                        { id: 27, title: '4', fontcolor: '#ddd', footer: 'Some technologies used', rowspan: 1, colspan: 1 },
                        { id: 25, title: '2', fontcolor: '#ddd', footer: 'How far you are from me', rowspan: 1, colspan: 2, colspansm: 2, colspanxs: 2 },
                        { id: 26, title: '3', fontcolor: '#ddd', footer: '', rowspan: 3, colspan: 4, colspansm: 2, colspanxs: 2, rowspansm: 4, rowspanxs: 4 }]
						
						];
				   
	console.log('default tiles', defaultTiles);
    var triggerResize = function () {
        console.log('triggerresize');
        var evt = $window.document.createEvent('UIEvents'); 
        evt.initUIEvent('resize', true, false, $window, 0); 
        $window.dispatchEvent(evt);
      };
      //$interval(triggerResize, 3000);
    $scope.onMapLoaded = function () {
        console.log('map loaded');
        var self = this;
        $timeout(triggerResize, 100);
        NgMap.getMap().then(function(map) {
          map.setOptions({draggable: true, zoomControl: false, scrollwheel: false, disableDoubleClickZoom: true});
        });
      };
	$scope.defaultTiles = function() {
		console.log('data set', $scope.dataSet)
		$scope.tiles = defaultTiles[$scope.dataSet - 1];
        triggerResize();
	};

	$scope.goNext = function () {
        $scope.dataSet++;
        if ($scope.dataSet > defaultTiles.length) $scope.dataSet = 1;      
        $scope.defaultTiles();  
    };
    $scope.goPrev = function () {
        $scope.dataSet--;
        if ($scope.dataSet === 0) $scope.dataSet = defaultTiles.length;
        $scope.defaultTiles();
    };
	$scope.initTiles = function() {
		

		$scope.tiles = [{ title: 'a', website: 'http://ngpopulation.josedelavalle.com', rowspan: randomSpan(), colspan: randomSpan() },
					{ title: 'b', rowspan: randomSpan(), colspan: randomSpan() },
					{ title: 'c', rowspan: randomSpan(), colspan: randomSpan() },
					{ title: 'd', rowspan: randomSpan(), colspan: randomSpan() },
					{ title: 'e', rowspan: randomSpan(), colspan: randomSpan() },
					{ title: 'f', rowspan: randomSpan(), colspan: randomSpan() },
					{ title: 'g', rowspan: randomSpan(), colspan: randomSpan() }

				   ];
	};

	$scope.defaultTiles();

    
	
	var getInterval = function () {
		return $scope.intervalLength;
	}
    self.mode = 'query';
    self.activated = true;
    self.determinateValue = 30;
    self.determinateValue2 = 30;

    self.showList = [ ];

    /**
     * Turn off or on the 5 themed loaders
     */
    self.toggleActivation = function() {
        if ( !self.activated ) self.showList = [ ];
        if (  self.activated ) {
          j = counter = 0;
          self.determinateValue = 30;
          self.determinateValue2 = 30;
        }
    };

    
    var timeoutLength = 5000;
    $scope.start = function () {
        
        promise = $interval(function () {

            self.determinateValue += 1;


            if (self.determinateValue > 100) {
                self.determinateValue = 0;
                changeColors();
            }
            // Incrementally start animation the five (5) Indeterminate,
            // themed progress circular bars

            if ((j < 2) && !self.showList[j] && self.activated) {
                self.showList[j] = true;
            }
            if (counter++ % 4 == 0) j++;

            // Show the indicator in the "Used within Containers" after 200ms delay
            if (j == 2) self.contained = "indeterminate";

        }, timeoutLength / 100, 0, true);
        
        $interval(function () {
            self.mode = (self.mode == 'query' ? 'determinate' : 'query');
        }, timeoutLength, 0, true);
    }

    $scope.stop = function () {
        
        $interval.cancel(promise);
    };
    $scope.toggleInterval = function() {
        console.log($scope.isGoing);
        if ($scope.isGoing) {
            $scope.isGoing = false;
            $scope.stop();
        } else {
            $scope.isGoing = true;
            $scope.start();
        }
    };
    $scope.start();
    
}