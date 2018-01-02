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

portfolioDashboardController.$inject = ['$scope', '$window', '$interval', '$timeout', 'pdFactory', '$mdMedia', '$mdColorPalette', '$mdToast', 'NgMap'];

function portfolioDashboardController($scope, $window, $interval, $timeout, pdFactory, $mdMedia, $mdColorPalette, $mdToast, NgMap) {
	console.log('portfolio dashboard controller', Date());
	var self = this, j= 0, counter = 0;
	$scope.colorSet = 1;
	$scope.maxColorSets = 5;
	$scope.dataSet = 1;
	$scope.userLocation = {};
	$scope.userCoords = null;
	$scope.showmain = true;
    $scope.isGoing = false;
	// $scope.colors = Object.keys($mdColorPalette);
	// console.log('colors', $scope.colors);
	$scope.clock = ""; // initialise the time variable
    $scope.tickInterval = 1000;//ms

    $scope.colorSets = ['#46aeb4','#5383bc','#7f7bca','#EEEEEE','#953b4f'];
    $scope.techImages = [
                        { src: './assets/images/angular.png',
                          title: 'AngularJS'
                        },
                        { src: './assets/images/csharp.png',
                          title: 'C#'
                        },
                        { src: './assets/images/html5.png',
                          title: 'HTML5'
                        },
                        {
                          src: './assets/images/sqlserver.png',
                          title: 'SQL Server'
                        },
                        {
                          src: './assets/images/css3.png',
                          title: 'CSS3'
                        }
                        ];
      var last = {
      bottom: false,
      top: true,
      left: true,
      right: true
    };

  $scope.toastPosition = angular.extend({},last);

  $scope.getToastPosition = function() {
    sanitizePosition();

    return Object.keys($scope.toastPosition)
      .filter(function(pos) { return $scope.toastPosition[pos]; })
      .join(' ');
  };

  function sanitizePosition() {
    var current = $scope.toastPosition;

    if ( current.bottom && last.top ) current.top = false;
    if ( current.top && last.bottom ) current.bottom = false;
    if ( current.right && last.left ) current.left = false;
    if ( current.left && last.right ) current.right = false;

    last = angular.extend({},current);
  }


  var descriptions = [
    'Add countries to the app in order to compare and contrast various country populations broken down by gender and age.',
    'App will default to finding photos uploaded to Flckr taken at wherever you currently are in the world, or use the map to explore at your leasure.',
    'Internet news from the top media sources collated all under one roof, just for you.  Read current articles from your favorite outlets homepage, in realtime.',
    'Drill down to your desired US State to find interactive county results.  Explore photos taken at that location, along with maps, and links to the official local government websites.',
    'A website about me, what I do, what I have done, and what I could do in the future.  Thanks for visiting!'
  ];

  $scope.showCustomToast = function(i) {
        var data = { msg: descriptions[i] };
        $mdToast.show({
          hideDelay   : 10000,
          position    : 'top center',
          parent      : '#menu',
          controller  : 'ToastCtrl',
          templateUrl : '/partials/toast.html',
          locals: {
            data: data
          }
        });
      };
  $scope.showSimpleToast = function(i) {
    
    var pinTo = $scope.getToastPosition();

    $mdToast.show(
      $mdToast.simple()
        .textContent(descriptions[i])
        .parent('#menu')
        .position('top center' )
        .hideDelay(10000)
    );
  };
    //$scope.showSimpleToast(0);
    $scope.showCustomToast(0);

    NgMap.getMap().then(function(map) {
        map.getCenter();
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
	var defaultTiles= [[{ id: 1, title: '0', footer: 'Color controls', rowspan: 1, colspan: 1, colspanxs: 2, colspansm: 2, hiddenxs: true },
						{ id: 3, title: '2', footer: 'Compare and contrast country populations', rowspan: 3, colspan: 7, colspanxs: 2, rowspanxs: 4, colspanmd: 3, rowspanmd: 2, colspanlg: 5, rowspanlg: 3,colspansm: 2, rowspansm: 3 },
                        { id: 4, title: '1', footer: 'Some technologies used', rowspan: 2, colspan: 1, colspanxs: 1, rowspanxs: 1, rowspansm: 1, rowspanmd: 1, rowspanlg: 2},
                        { id: 24, title: '3', footer: '', rowspan: 1, colspan: 1, span: '', hidden: true },
                        { id: 5, title: '4', footer: 'How far you are from me', rowspan: 1, colspan: 6, colspanxs: 1, colspansm: 1, colspanmd: 3, colspanlg: 5 },
						{ id: 2, title: '3', footer: 'Places to find me', rowspan: 1, colspan: 2, colspansm: 2, colspanxs: 2, colspanmd: 1 }
                        
                        ],
						[{ id: 6, title: '0', footer: 'Color controls', rowspan: 1, colspan: 1, colspanxs: 2, colspansm: 2  },
						{ id: 7, title: '1', footer: 'How far you are from me', rowspan: 1, colspan: 7, colspanmd: 3, colspanlg: 5, colspanxs: 2, colspansm: 2 },
						{ id: 9, title: '3', footer: '', rowspan: 3, colspan: 7, colspanlg: 5, rowspanlg: 3, colspanmd: 3, rowspanmd: 2, colspansm: 2, colspanxs: 2, rowspansm: 2, rowspanxs: 4 },
                        { id: 10, title: '2', footer: 'Some technologies used', rowspan: 2, rowspanmd: 1, rowspansm: 1, rowspanxs: 1, rowspanlg: 2, rowspanmd: 2, colspan: 1},
                        { id: 8, title: '2', footer: 'Places to find me', rowspan: 1, colspan: 1, rowspanlg: 1, rowspansm: 1, rowspanxs: 1 },
						{ id: 22, title: '4', footer: '', rowspan: 3, colspan: 1, span: 'Peak at photos taken anywhere in the world.  Select a destination and let her rip', hidden: true}],
						[{ id: 11, title: '1', footer: '', rowspan: 3, colspan: 7, colspanlg: 5, rowspanlg: 3, rowspanmd: 2, colspanmd: 3, colspanxs: 2, colspansm: 2, rowspanxs: 3, rowspansm: 2},
						{ id: 12, title: '4', footer: 'Color controls', rowspan: 1, colspan: 1, colspansm: 2, colspanxs: 2 },
						{ id: 13, title: '1', footer: 'Some technologies used', rowspan: 1, colspan: 1, rowspanlg: 2 },
						{ id: 14, title: '2', footer: 'Places to find me', rowspan: 1, colspan: 1 },
						{ id: 15, title: '3', data: 'states', footer: 'How far you are from me', colspanxs: 2, colspansm: 2, rowspan: 1, colspan: 8, colspanmd: 3, colspanlg: 5 }],
						[{ id: 16, title: '0', footer: 'Color controls', rowspan: 1, colspan: 1, colspansm: 2, colspanxs: 2 },
                        { id: 19, title: '3', footer: '', rowspan: 3, colspan: 7, colspansm: 2, colspanxs: 2, rowspansm: 2, rowspanxs: 2, colspanmd: 3, rowspanmd: 2, colspanlg: 5, rowspanlg: 3 },
                        { id: 17, title: '1', footer: 'Some technologies used', rowspan: 2, colspan: 1, rowspanlg: 2},
                        { id: 18, title: '2', footer: 'How far you are from me', rowspan: 1, colspan: 7, colspanlg: 4, colspansm: 1, colspanxs: 1, colspanmd: 3 },
                        { id: 21, title: '0', data: '', footer: 'Places to find me', rowspan: 1, colspan: 1, colspanlg: 2, colspanxs: 2, colspansm: 2 },
                        { id: 20, title: '0', data: '', footer: '', rowspan: 1, colspan: 1, colspansm: 2, colspanxs: 2, hidden: true }],
						[{ id: 23, title: '0', footer: 'Color controls', rowspan: 1, colspan: 1 },
                        
                        { id: 27, title: '4', footer: 'Some technologies used', rowspan: 1, colspan: 1 },
                        { id: 25, title: '2', footer: 'How far you are from me', rowspan: 1, colspan: 6, colspanlg: 4, colspanmd: 2, colspansm: 2, colspanxs: 2 },
                        { id: 26, title: '3', footer: '', rowspan: 3, colspan: 8, colspansm: 2, colspanxs: 2, colspanmd: 4, rowspanmd: 2, colspanlg: 6, rowspanlg: 3, rowspansm: 4, rowspanxs: 4 }]
						
						];
				   
	console.log('default tiles', defaultTiles);
    var triggerResize = function () {
        //console.log('triggerresize');
        var evt = $window.document.createEvent('UIEvents'); 
        evt.initUIEvent('resize', true, false, $window, 0); 
        $window.dispatchEvent(evt);
        
      };
    $interval(triggerResize, 300);
    $scope.onMapLoaded = function (latlng) {
        console.log('map loaded', latlng);
        var self = this;
        
        NgMap.getMap().then(function(map) {
          map.setOptions({draggable: true, zoomControl: false, scrollwheel: false, disableDoubleClickZoom: true});
          $timeout(triggerResize, 1);
          map.getCenter();
          //map.setCenter({lat: latlng[0], lng: latlng[1]});
        });
      };

      $scope.setColor = function(i) {
        console.log('set color', i);
        $scope.colorSet = i;
        if ($scope.isGoing) $scope.toggleInterval();
      };
	$scope.defaultTiles = function() {
		console.log('data set', $scope.dataSet)
		$scope.tiles = defaultTiles[$scope.dataSet - 1];
        triggerResize();
        $timeout($scope.showCustomToast($scope.dataSet-1), 0);
	};
    $scope.toggleInfo = function() {
        $scope.showSetNumbers = !$scope.showSetNumbers;
        //$scope.showSimpleToast($scope.dataSet - 1);
        $scope.showCustomToast($scope.dataSet - 1);
    };
    $scope.viewHeatmap = function() {
        $scope.showHeatmap = true;
        $scope.dataSet = 5;
        $scope.defaultTiles();
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
        $scope.isGoing = true;
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
        $scope.isGoing = false;
    };
    $scope.toggleInterval = function() {
        
        if ($scope.isGoing) {
            $scope.stop();
        } else {
            $scope.start();
        }
        console.log($scope.isGoing);
    };
    //$scope.start();
    
}

app.controller('ToastCtrl', ToastCtrl);
ToastCtrl.$inject = ['$scope', '$mdToast', 'data'];
function ToastCtrl($scope, $mdToast, data) {
    console.log('toast controller', data);
    $scope.data = data;
    $scope.closeToast = function() {
        $mdToast.hide();
    };
}