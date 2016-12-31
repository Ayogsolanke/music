<div class="playlist-area" ng-show="!loading">
	<h1 ng-click="playAll()" ng-if="playlist">{{playlist.name}}</h1>
	<h1 ng-click="playAll()" ng-if="currentView == '#/alltracks'" translate>All tracks</h1>
	<ul class="track-list">
		<li ng-repeat="song in tracks track by $index" id="{{ 'track-' + song.id }}"
			ui-on-drop="reorderDrop($data, $index)"
			ui-on-drag-enter="updateHoverStyle($index)"
			drop-validate="allowDrop($data, $index)"
			drag-hover-class="drag-hover">
			<div ng-click="playTrack($index)" ui-draggable="true" drag="getDraggable($index)">
				<img class="play svg" alt="{{ 'Play' | translate }}" src="<?php p(OCP\image_path('music', 'play-big.svg')) ?>"
					ng-class="{playing: getCurrentTrackIndex() === $index}" />
				<span class="muted">{{ $index + 1 }}.</span>
				<div>{{ song.artistName }} - {{song.title}}</div>
			</div>
			<button class="svg action icon-close" ng-click="removeTrack($index)" ng-if="playlist"
				alt="{{ 'Remove' | translate }}" title="{{ 'Remove track from playlist' | translate }}" />
		</li>
	</ul>

	<div id="emptycontent" ng-show="playlist && playlist.trackIds.length == 0 && !scanning && !toScan && !noMusicAvailable">
		<div class="icon-audio svg"></div>
		<h2 translate>No tracks</h2>
		<p translate>Add tracks with drag and drop from Albums or other playlists</p>
	</div>

</div>
