$(document).ready(() => {
	$("#reset_active").click(() => {
		chrome.storage.sync.get(null, (items) => {
			var keys = Object.keys(items);
			keys.forEach((key) => {
				if (!key.startsWith("custom#")) {
					chrome.storage.sync.remove(key);
				}
			});
			alert("Active replacements reset!");
		});
	});

	$("#delete_custom").click(() => {
		chrome.storage.sync.get(null, (items) => {
			var keys = Object.keys(items);
			keys.forEach((key) => {
				if (key.startsWith("custom#")) {
					chrome.storage.sync.remove(key);
				}
			});
			alert("Custom replacements deleted!");
		});
	});

	$("#factory_reset").click(() => {
		chrome.storage.sync.clear();
		alert("Factory reset completed!");
	});
});