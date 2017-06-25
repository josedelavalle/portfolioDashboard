var app = angular.module('app', [
    'ngAnimate',
    'ngMap',
    'ngMaterial',
        'material.svgAssetsCache'
    
]);

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

portfolioDashboardController.$inject = ['$scope', '$interval', '$timeout', '$mdMedia', '$mdColorPalette', 'NgMap'];

function portfolioDashboardController($scope, $interval, $timeout, $mdMedia, $mdColorPalette, NgMap) {
	var self = this, j= 0, counter = 0;
	$scope.colorSet = 1;
	$scope.maxColorSets = 5;
	$scope.dataSet = 1;
	console.log('portfolio dashboard controller', Date());


	$scope.colors = Object.keys($mdColorPalette);
	console.log('colors', $scope.colors);


	$scope.clock = ""; // initialise the time variable
    $scope.tickInterval = 1000 //ms


    var tick = function () {
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
						{ id: 3, title: '2', footer: 'hello', rowspan: 2, colspan: 1 },
						{ id: 2, title: '3', footer: 'hello', rowspan: 1, colspan: 2 },
						{ id: 5, title: '4', footer: 'hello', rowspan: 1, colspan: 1 }],
						[{ id: 1, title: '0', body1: 'Jose DeLavalle', rowspan: 1, colspan: 1 },
						{ id: 2, title: '1', footer: 'hello', rowspan: 1, colspan: 1 },
						{ id: 3, title: '2', footer: 'hello', rowspan: 1, colspan: 2 },
						{ id: 4, title: '3', footer: 'hello', rowspan: 2, colspan: 2 },
						{ id: 5, title: '4', footer: 'hello', rowspan: 1, colspan: 1 },
						{ id: 6, title: '0', footer: 'hello', rowspan: 2, colspan: 1 },
						{ id: 7, title: '1', footer: 'hello', rowspan: 1, colspan: 1 }],
						[{ id: 1, title: '0', footer: 'Jose DeLavalle', rowspan: 1, colspan: 1 },
						{ id: 2, title: '1', footer: 'hello', rowspan: 1, colspan: 1 },
						{ id: 3, title: '2', footer: 'hello', rowspan: 1, colspan: 2 },
						{ id: 4, title: '3', footer: 'hello', rowspan: 2, colspan: 2 },
						{ id: 5, title: '4', footer: 'hello', rowspan: 1, colspan: 1 },
						{ id: 6, title: '0', footer: 'hello', rowspan: 2, colspan: 1 },
						{ id: 7, title: '1', footer: 'hello', rowspan: 1, colspan: 1 }],
						[{ id: 1, title: '0', footer: 'Jose DeLavalle', rowspan: 1, colspan: 1 },
						{ id: 2, title: '1', footer: 'hello', rowspan: 1, colspan: 1 },
						{ id: 3, title: '2', footer: 'hello', rowspan: 1, colspan: 2 },
						{ id: 4, title: '3', footer: 'hello', rowspan: 2, colspan: 2 },
						{ id: 5, title: '4', footer: 'hello', rowspan: 1, colspan: 1 },
						{ id: 6, title: '0', footer: 'hello', rowspan: 2, colspan: 1 },
						{ id: 7, title: '1', footer: 'hello', rowspan: 1, colspan: 1 }],
						[{ id: 1, title: '0', footer: 'Jose DeLavalle', rowspan: 1, colspan: 1 },
						{ id: 2, title: '1', footer: 'hello', rowspan: 1, colspan: 1 },
						{ id: 3, title: '2', footer: 'hello', rowspan: 1, colspan: 2 },
						{ id: 4, title: '3', footer: 'hello', rowspan: 2, colspan: 2 },
						{ id: 5, title: '4', footer: 'hello', rowspan: 1, colspan: 1 },
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