// Time based scheduler for animations

Director = function () {

	var dancer;
	var tweens = [];

	function init() {

		// Event handlers
		events.on("update", update);
		
		// Use dancer.js for handling timings
		dancer = AudioHandler.dancer();
	}

	// Schedules an action to run at a particular time 
	function addAction(startTime, callback) {

		// Convert to seconds
		startTime = getTime(startTime);

		dancer.onceAt(startTime, function () {
			callback();
		});
	}

	// Schedules a tween to run at a particular time
	function addTween(startTime, duration, object, endValues, easing) {

		// Convert to seconds
		startTime = getTime(startTime);
		duration = getTime(duration);

		dancer.onceAt(startTime, function () {

			var tween = new TWEEN.Tween(object)
				.to(endValues, duration * 1000)
				.easing(easing);

			tweens.push(tween);

			tween.start();
		});
	}

	// Converts audio patterns/blocks to seconds
	function getTime(audioPattern) {

		return 60 / Main.audioParams.bpmRate * audioPattern * 16;
	}

	function update(t) {
		TWEEN.update(t);
	}

	return {
		init: init,
		update: update,
		addAction: addAction,
		addTween: addTween
	};
} ();






