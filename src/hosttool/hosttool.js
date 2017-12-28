var replacements = {};

/**
 * Monitor changes to the storage and update our replacements map if necessary
 *
 */
chrome.storage.onChanged.addListener(function(changes, namespace) {
	for (key in changes) {
	  	replacements[key] = changes[key].newValue;
	}
});
      

/**
 * Hook into before headers are sent, look for a replacement and
 * (if necessary) replace.
 *
 */
chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
	url = new URL(details.url);
	if (replacements[url.hostname]) {
		details.requestHeaders.push({
	        name: 'Host',
	        value: replacements[url.hostname]
	    });
	}
	return { requestHeaders: details.requestHeaders };
}, { urls: ["<all_urls>"] }, ["requestHeaders", "blocking"]);


/**
 * Initialize replacements on load
 *
 */
chrome.storage.sync.get(null, function(items) {
    for (var host in items) {
    	replacements[host] = items[host];
    }
});