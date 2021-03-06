/**
 * ownCloud - Music app
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Morris Jobke <hey@morrisjobke.de>
 * @copyright Morris Jobke  2014
 */

angular.module('Music').controller('OverviewController',
	['$scope', '$rootScope', 'playlistService', 'Restangular', '$route', '$window', '$timeout',
	function ($scope, $rootScope, playlistService, Restangular, $route, $window, $timeout) {

		$rootScope.currentView = '#';

		// Prevent controller reload when the URL is updated with window.location.hash,
		// unless the new location actually requires another controller.
		// See http://stackoverflow.com/a/12429133/2104976
		var lastRoute = $route.current;
		$scope.$on('$locationChangeSuccess', function(event) {
			if (lastRoute.$$route.controller === $route.current.$$route.controller) {
				$route.current = lastRoute;
			}
		});

		$scope.playTrack = function(track) {
			// update URL hash
			window.location.hash = '#/track/' + track.id;

			var album = findAlbum(track.albumId);
			playlistService.setPlaylist(album.tracks, album.tracks.indexOf(track));
			playlistService.publish('play');
		};

		$scope.playAlbum = function(album) {
			// update URL hash
			window.location.hash = '#/album/' + album.id;

			playlistService.setPlaylist(album.tracks);
			playlistService.publish('play');
		};

		$scope.playArtist = function(artist) {
			// update URL hash
			window.location.hash = '#/artist/' + artist.id;

			var playlist = _.flatten(_.pluck(artist.albums, 'tracks'));
			playlistService.setPlaylist(playlist);
			playlistService.publish('play');
		};

		$scope.playFile = function (fileid) {
			if (fileid) {
				Restangular.one('file', fileid).get()
					.then(function(result){
						playlistService.setPlaylist([result]);
						playlistService.publish('play');
						$scope.$parent.scrollToItem('album-' + result.albumId);
					});
			}
		};

		$scope.getDraggable = function(type, draggedElement) {
			var draggable = {};
			draggable[type] = draggedElement;
			return draggable;
		};

		// emited on end of playlist by playerController
		playlistService.subscribe('playlistEnded', function(){
			// update URL hash if this view is active
			if ($rootScope.currentView == '#') {
				window.location.hash = '#/';
			}
		});

		$rootScope.$on('scrollToTrack', function(event, trackId) {
			var track = findTrack(trackId);
			if (track) {
				$scope.$parent.scrollToItem('album-' + track.albumId);
			}
		});

		function findArtist(id) {
			return _.find($scope.$parent.artists, function(artist) {
				return artist.id == id;
			});
		}

		function findAlbum(id) {
			var albums = _.flatten(_.pluck($scope.$parent.artists, 'albums'));
			return _.find(albums, function(album) {
				return album.id == id;
			});
		}

		function findTrack(id) {
			return $scope.$parent.allTracks[id];
		}

		function initializePlayerStateFromURL() {
			var hashParts = window.location.hash.substr(1).split('/');
			if (!hashParts[0] && hashParts[1] && hashParts[2]) {
				var type = hashParts[1];
				var id = hashParts[2];

				if (type == 'file') {
					$scope.playFile(id);
				} else if (type == 'artist') {
					$scope.playArtist(findArtist(id));
					$scope.$parent.scrollToItem('artist-' + id);
				} else if (type == 'album') {
					$scope.playAlbum(findAlbum(id));
					$scope.$parent.scrollToItem('album-' + id);
				} else if (type == 'track') {
					var track = findTrack(id);
					$scope.playTrack(track);
					$scope.$parent.scrollToItem('album-' + track.albumId);
				}
			}
			$rootScope.loading = false;
		}

		// initialize either immedately or once the parent view has finished loading the collection
		if ($scope.$parent.artists) {
			$timeout(initializePlayerStateFromURL);
		}

		$rootScope.$on('artistsLoaded', initializePlayerStateFromURL);
}]);
