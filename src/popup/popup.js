var defaultOptions = ["localhost", "127.0.0.1"];

/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    var url = tabs[0].url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });
}

/**
 * Get the hostname from a URL
 *
 * @param {string} url to get URL from
 */
function getHostnameFromUrl(url) {
  var a = document.createElement("a");
  a.href = url;
  return a.hostname;
}

/**
 * Gets the saved background color for url.
 *
 * @param {string} host host for which replacement will be retrieved
 * @param {function(string)} callback called with the currently replaced host for
 *     the given url on success, or a falsy value if no host is retrieved.
 */
function getHostReplacement(host, callback) {
  chrome.storage.sync.get(host, (items) => {
    callback(chrome.runtime.lastError ? null : items[host]);
  });
}

/**
 * Sets the given background color for url.
 *
 * @param {string} host host for which replacement is to be set.
 * @param {string} replacement the replacement for which to set
 */
function setHostReplacement(host, replacement) {
  if (host == replacement) {
    chrome.storage.sync.remove(host);
  } else {
    var items = {};
    items[host] = replacement;
    chrome.storage.sync.set(items);
  }
}

/**
 * Set our listeners and rock'n'roll!
 */
document.addEventListener('DOMContentLoaded', () => {
  getCurrentTabUrl((url) => {
    var host = getHostnameFromUrl(url);

    var info = document.getElementById('info');
    info.innerHTML = "selected host:";

    var dropdown = document.getElementById('host_select');

    var option = document.createElement('option');
    option.text = option.value = host;
    dropdown.add(option, 0);

    defaultOptions.forEach(function(opt) {
      var option = document.createElement('option');
      option.text = option.value = opt;
      dropdown.add(option, 1);
    });

    getHostReplacement(host, (replacement) => {
      if (replacement) {
        dropdown.value = replacement;
      }
    });

    dropdown.addEventListener('change', () => {
      setHostReplacement(host, dropdown.value);
    });
  });
});