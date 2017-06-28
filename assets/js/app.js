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

portfolioDashboardController.$inject = ['$scope', '$interval', '$timeout', 'pdFactory', '$mdMedia', '$mdColorPalette', 'NgMap'];

function portfolioDashboardController($scope, $interval, $timeout, pdFactory, $mdMedia, $mdColorPalette, NgMap) {
	console.log('portfolio dashboard controller', Date());
	var self = this, j= 0, counter = 0;
	$scope.colorSet = 1;
	$scope.maxColorSets = 5;
	$scope.dataSet = 4;
	$scope.userLocation = {};
	$scope.userCoords = null;
	$scope.showmain = true;
	// $scope.colors = Object.keys($mdColorPalette);
	// console.log('colors', $scope.colors);
	$scope.clock = ""; // initialise the time variable
    $scope.tickInterval = 1000 //ms

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
	var defaultTiles= [[{ id: 1, title: '0', footer: 'Jose DeLavalle', rowspan: 1, colspan: 1 },
						{ id: 4, title: '1', footer: 'hello', rowspan: 2, colspan: 3 },
						{ id: 3, title: '2', footer: 'Visit Full Site', rowspan: 2, colspan: 1 },
						{ id: 2, title: '3', footer: 'hello', rowspan: 1, colspan: 2 },
						{ id: 5, title: '4', footer: 'Technologies', rowspan: 1, colspan: 1 }],
						[{ id: 1, title: '0', body1: 'Jose DeLavalle', rowspan: 1, colspan: 1 },
						{ id: 2, title: '1', footer: 'hello1', rowspan: 1, colspan: 2 },
						{ id: 3, title: '2', footer: 'hello2', rowspan: 2, colspan: 1 },
						{ id: 4, title: '3', footer: 'hello3', rowspan: 2, colspan: 3 },
						{ id: 5, title: '4', footer: 'Technologies', rowspan: 1, colspan: 1 }],
						[{ id: 4, title: '1', footer: 'hello4', rowspan: 2, colspan: 3 },
						{ id: 1, title: '4', footer: 'Color', rowspan: 1, colspan: 1 },
						{ id: 5, title: '1', footer: 'hello5', rowspan: 1, colspan: 1 },
						{ id: 3, title: '2', footer: 'hello6', rowspan: 1, colspan: 2 },
						{ id: 6, title: '3', footer: 'hello7', rowspan: 1, colspan: 2 }],
						[{ id: 1, title: '0', footer: 'Jose DeLavalle', rowspan: 1, colspan: 1 },
						{ id: 2, title: '1', footer: 'hello8', rowspan: 1, colspan: 1 },
						{ id: 3, title: '2', footer: 'hello', rowspan: 1, colspan: 2 },
						{ id: 4, title: '3', footer: 'hello', rowspan: 2, colspan: 2 },
						{ id: 5, title: '4', footer: 'Technologies', rowspan: 1, colspan: 1 },
						{ id: 6, title: '0', footer: 'hello', rowspan: 2, colspan: 1 },
						{ id: 7, title: '1', footer: 'hello', rowspan: 1, colspan: 1 }],
						[{ id: 1, title: '0', footer: 'Jose DeLavalle', rowspan: 1, colspan: 1 },
						{ id: 2, title: '1', footer: 'hello', rowspan: 1, colspan: 1 },
						{ id: 3, title: '2', footer: 'hello', rowspan: 1, colspan: 2 },
						{ id: 4, title: '3', footer: 'hello', rowspan: 2, colspan: 2 },
						{ id: 5, title: '4', footer: 'Technologies', rowspan: 1, colspan: 1 },
						{ id: 6, title: '0', footer: 'hello', rowspan: 2, colspan: 1 },
						{ id: 7, title: '1', footer: 'hello', rowspan: 1, colspan: 1 }]

						];
				   
	console.log('default tiles', defaultTiles);
	$scope.defaultTiles = function() {
		console.log('data set', $scope.dataSet)
		$scope.tiles = defaultTiles[$scope.dataSet - 1];
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
        $scope.isGoing = true
        $interval(function () {
            self.mode = (self.mode == 'query' ? 'determinate' : 'query');
        }, timeoutLength, 0, true);
    }

    $scope.stop = function () {
        $scope.isGoing = false;
        $interval.cancel(promise);
    };
    $scope.start();
    
}