/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comsaplhmr/z_powerfactor_eng/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
