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
 * Get an ID from a hostname (i.e. swap .s with _s)
 *
 * @param {string} host host to swap from
 */
function hostToId(host) {
  return host.replace(/\./g, "_").replace(/:/g, "___");
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
 * Add a custom replacement for a given host
 *
 * @param {string} host host for which replacement is to be set.
 * @param {string} replacement the replacement for which to set
 */
function addCustomReplacement(host, replacement) {
  chrome.storage.sync.get("custom#" + host, (items) => {
    var replacements = [];
    if (items["custom#" + host]) {
      var replacements = items["custom#" + host];
    }
    replacements.push(replacement);
    items["custom#" + host] = replacements;
    chrome.storage.sync.set(items);
  });
}

/**
 * Remove a custom replacement for a given host
 *
 * @param {string} host host for which replacement is to be removed.
 * @param {string} replacement the replacement for which to remove
 */
function removeCustomReplacement(host, replacement) {
  chrome.storage.sync.get("custom#" + host, (items) => {
    var replacements = [];
    if (items["custom#" + host]) {
      var replacements = items["custom#" + host];
    }
    if (replacements.indexOf(replacement) > -1) {
        replacements.splice(replacements.indexOf(replacement), 1);
    }
    items["custom#" + host] = replacements;
    chrome.storage.sync.set(items);
  });
}

/**
 * Set our listeners and rock'n'roll!
 */
$(document).ready(() => {
    getCurrentTabUrl((url) => {
        var host = getHostnameFromUrl(url);
        var list = $("#host_select");

        list.append(
            $("<li>")
            .addClass("collection-item")
            .addClass("active")
            .attr("id", hostToId(host))
            .click(() => {
                setHostReplacement(host, host);
                $(".active").removeClass("active");
                $("#" + hostToId(host)).addClass("active")
            })
            .append(
                $("<div>")
                .text(host)
                    
            )
        );

        defaultOptions.forEach((opt) => {
            list.append(
                $("<li>")
                .addClass("collection-item")
                .attr("id", hostToId(opt))
                .click(() => {
                    setHostReplacement(host, opt);
                    $(".active").removeClass("active");
                    $("#" + hostToId(opt)).addClass("active")
                })
                .append(
                    $("<div>")
                    .text(opt)
                        
                )
            );
        });

        chrome.storage.sync.get("custom#" + host, (items) => {
            var customs = [];
            if (items["custom#" + host]) {
              var customs = items["custom#" + host];
            }
            customs.forEach((opt) => {
                list.append(
                    $("<li>")
                    .addClass("collection-item")
                    .attr("id", hostToId(opt))
                    .click(() => {
                        setHostReplacement(host, opt);
                        $(".active").removeClass("active");
                        $("#" + hostToId(opt)).addClass("active")
                    })
                    .text(opt)
                    .append(
                            $('<a>')
                            .attr("href", "#")
                            .addClass("secondary-content")
                            .click(() => {
                                removeCustomReplacement(host, opt);
                                if ($("#" + hostToId(opt)).hasClass("active")) {
                                    setHostReplacement(host, host);
                                    $("#" + hostToId(host)).addClass("active")
                                }
                                $("#" + hostToId(opt)).remove();
                            })
                            .append(
                                $("<i>")
                                .addClass("material-icons")
                                .text("clear")
                            )
                    )
                );
            });
        });

        getHostReplacement(host, (replacement) => {
            if (replacement) {
                $("#" + hostToId(host)).removeClass("active")
                $("#" + hostToId(replacement)).addClass("active");
            }
        });

        $("#add_custom_form").submit(() => {
            var toAdd = $("#hostname").val();
            $("#hostname").val("");
            addCustomReplacement(host, toAdd);
            list.append(
                $("<li>")
                .addClass("collection-item")
                .attr("id", hostToId(toAdd))
                .click(() => {
                    setHostReplacement(host, toAdd);
                    $(".active").removeClass("active");
                    $("#" + hostToId(toAdd)).addClass("active")
                })
                .text(toAdd)
                .append(
                        $('<a>')
                        .attr("href", "#")
                        .addClass("secondary-content")
                        .click(() => {
                            removeCustomReplacement(host, toAdd);
                            if ($("#" + hostToId(toAdd)).hasClass("active")) {
                                setHostReplacement(host, host);
                                $("#" + hostToId(host)).addClass("active")
                            }
                            $("#" + hostToId(toAdd)).remove();
                        })
                        .append(
                            $("<i>")
                            .addClass("material-icons")
                            .text("clear")
                        )
                )
            );
            $('.modal').modal('close');
        });
    });

    $("#add_custom_btn").click(() => {
        if ($("#add_custom_form").valid()) {
            $("#add_custom_form").submit();
        }
    });
    $('.modal').modal();

    $(document).contextmenu(() => {
       return false;
    });
});