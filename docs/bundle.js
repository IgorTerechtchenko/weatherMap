(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = CoordsFetcher;
function CoordsFetcher(eventBus, key) {
  var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'fetch';

  this.bus = eventBus;
  this.method = method;
  this.apiKey = key;
}

CoordsFetcher.prototype = {
  getCoords: function getCoords(address) {
    var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=' + this.apiKey;
    if (this.method === 'fetch') {
      return fetch(url).then(function (req) {
        return req.json();
      }).then(function (data) {
        return data.results[0].geometry.location;
      });
    } else if (this.method === 'xhr') {
      return new Promise(function (resolve) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
          if (xhr.status != 200) {
            alert(xhr.status + ': ' + xhr.statusText);
          } else if (xhr.responseText !== '') {
            var responseText = JSON.parse(xhr.responseText);
            resolve(responseText.results[0].geometry.location);
          }
        };
        xhr.send();
      });
    }
  }
};

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = DataListDisplay;
function DataListDisplay(el, bus, name) {
  var allowRemoval = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  this.el = el;
  this.bus = bus;
  this.name = name;
  this.allowRemoval = allowRemoval;
  this.dataListDisplayWrapper = document.createElement('div');
  this.dataListDisplayWrapper.className = 'dataListDisplayWrapper' + this.name;
}

DataListDisplay.prototype = {
  render: function render() {
    this.dataListDisplayWrapper.innerHTML += '<h2>' + this.name + '</h2>';
    this.listEl = document.createElement('ul');
    this.listEl.className = 'listEl';
    this.dataListDisplayWrapper.appendChild(this.listEl);
    this.el.appendChild(this.dataListDisplayWrapper);
    this.addEventListeners();
  },
  addItem: function addItem(name, value) {
    var listItem = document.createElement('li');
    listItem.innerHTML = name;
    listItem.setAttribute('data-value', JSON.stringify(value));
    listItem.className = this.name + 'ListItem';
    if (this.allowRemoval) {
      var button = document.createElement('button');
      button.innerHTML = 'X';
      button.className = 'removeListItem';
      listItem.appendChild(button);
    }
    this.listEl.appendChild(listItem);
  },
  addEventListeners: function addEventListeners() {
    var _this = this;

    this.dataListDisplayWrapper.addEventListener('click', function (e) {
      if (e.target.tagName.toLowerCase() === 'button') {
        _this.bus.trigger('removeStorageItem', e.target.parentElement.innerHTML.split('<')[0]);
        _this.listEl.removeChild(e.target.parentElement);
      }
      if (e.target.tagName.toLowerCase() === 'li') {
        console.log(JSON.parse(e.target.dataset.value));
        _this.bus.trigger('clickStorageItem', JSON.parse(e.target.dataset.value));
      }
    });
  },
  clear: function clear() {
    this.listEl.innerHTML = '';
  }
};

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EventBus;
function EventBus() {}

EventBus.prototype.on = function (eventName, cb) {
  if (!this[eventName]) {
    this[eventName] = [];
  }
  this[eventName].push(cb);
};

EventBus.prototype.off = function (eventName, cb) {
  this[eventName] = this[eventName].filter(function (func) {
    return func !== cb;
  });
};

EventBus.prototype.trigger = function (eventName, arg) {
  if (this[eventName]) {
    this[eventName].forEach(function (cb) {
      cb(arg);
    });
  }
};

EventBus.prototype.once = function (eventName, cb) {
  var wrapper = function (arg) {
    this.off(eventName, wrapper);
    return cb(arg);
  }.bind(this);
  this.on(eventName, wrapper);
};

},{}],4:[function(require,module,exports){
'use strict';

var _data_list_display = require('./data_list_display.js');

var _data_list_display2 = _interopRequireDefault(_data_list_display);

var _search_bar = require('./search_bar.js');

var _search_bar2 = _interopRequireDefault(_search_bar);

var _menu = require('./menu.js');

var _menu2 = _interopRequireDefault(_menu);

var _radio_menu = require('./radio_menu.js');

var _radio_menu2 = _interopRequireDefault(_radio_menu);

var _weather_display = require('./weather_display.js');

var _weather_display2 = _interopRequireDefault(_weather_display);

var _event_bus = require('./event_bus.js');

var _event_bus2 = _interopRequireDefault(_event_bus);

var _router = require('./router.js');

var _router2 = _interopRequireDefault(_router);

var _coords_fetcher = require('./coords_fetcher.js');

var _coords_fetcher2 = _interopRequireDefault(_coords_fetcher);

var _weather_fetcher = require('./weather_fetcher.js');

var _weather_fetcher2 = _interopRequireDefault(_weather_fetcher);

var _storage_interface_async = require('./storage_interface_async.js');

var _storage_interface_async2 = _interopRequireDefault(_storage_interface_async);

var _render_author = require('./render_author.js');

var _render_author2 = _interopRequireDefault(_render_author);

var _render_about = require('./render_about.js');

var _render_about2 = _interopRequireDefault(_render_about);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//components
var header = document.querySelector('.header');

//services

var content = document.querySelector('.content');
var footer = document.querySelector('.footer');
var currentPosition = { lat: 55.7558, lng: 37.6173 };
var darkSkyKey = '9b4e68104fff62ae77dc24bc50f6706a';
var geocodeKey = 'AIzaSyDa7DCL2NO9KMPd9DYVk_u3u0wCbm0XXFY';

var eventBus = new _event_bus2.default();

var router = new _router2.default({
  routes: [{
    name: 'main',
    match: 'main',
    onEnter: function onEnter() {
      eventBus.trigger('mainInit');
    }
  }, {
    name: 'about',
    match: 'about',
    onEnter: function onEnter() {
      document.querySelectorAll('.content > *').forEach(function (el) {
        el.style.display = 'none';
      });
      footer.style.display = 'none';
      (0, _render_about2.default)(content);
    }
  }, {
    name: 'author',
    match: 'author',
    onEnter: function onEnter() {
      document.querySelectorAll('.content > *').forEach(function (el) {
        el.style.display = 'none';
      });
      footer.style.display = 'none';
      (0, _render_author2.default)(content);
    }
  }, {
    name: 'cityName',
    match: /city=[a-zA-z]+/,
    onEnter: function onEnter() {
      eventBus.trigger('mainInit');
      var city = window.location.hash.split('=')[1].split(',');
      coordsFetcher.getCoords(city).then(function (newCoords) {
        currentPosition = newCoords;
        map.setCenter([newCoords.lat, newCoords.lng], 7, { checkZoomRange: true });
        storageInterface.addToHistory({ name: city, value: newCoords });
        historyDisplay.clear();
        storageInterface.getHistory().then(function (history) {
          history.forEach(function (item) {
            historyDisplay.addItem(item.value.name, item.value.value);
          });
        });
      });
    }
  }, {
    name: 'cityCoords',
    match: /coordinates=(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)/,
    onEnter: function onEnter() {
      eventBus.trigger('mainInit');
      var coords = window.location.hash.split('=')[1].split(',');
      currentPosition.lat = coords[0];
      currentPosition.lng = coords[1];
      map.setCenter([currentPosition.lat, currentPosition.lng], 7, { checkZoomRange: true });
    }
  }]
});

eventBus.on('mainInit', function () {
  document.querySelectorAll('.content > *').forEach(function (el) {
    el.style.display = 'block';
  });
  footer.style.display = 'block';
  var author = document.querySelector('.content > .authorWrapper');
  var about = document.querySelector('.content > .aboutWrapper');
  if (author) {
    content.removeChild(author);
  }
  if (about) {
    content.removeChild(about);
  }
});

eventBus.on('searchBarEnter', function (arg) {
  eventBus.trigger('mainInit');
  coordsFetcher.getCoords(arg).then(function (newCoords) {
    window.location.hash = 'coordinates=' + newCoords.lat + ',' + newCoords.lng;
    map.setCenter([newCoords.lat, newCoords.lng], 7, { checkZoomRange: true });
    storageInterface.addToHistory({ name: arg, value: newCoords });
    historyDisplay.clear();
    storageInterface.getHistory().then(function (history) {
      history.forEach(function (item) {
        historyDisplay.addItem(item.value.name, item.value.value);
      });
    });
  });
});

eventBus.on('addToFavourites', function () {
  var name = window.prompt('Enter location description:');
  storageInterface.addToFavourites(name, currentPosition);
  favouritesDisplay.addItem(name, currentPosition);
});

eventBus.on('centerChange', function () {
  weatherFetcher.fetchWeather(currentPosition).then(function (result) {
    var response = {};
    response.summary = result.summary;
    response.temperature = Math.round(result.temperature) + '°C';
    response.icon = result.icon;
    response.humidity = result.humidity;
    response.windSpeed = result.windSpeed;
    weatherDisplay.updateWeather(response);
  });
});

eventBus.on('clickStorageItem', function (val) {
  window.location.hash = 'coordinates=' + val.lat + ',' + val.lng;
  currentPosition = val;
  eventBus.trigger('centerChange');
  map.setCenter([val.lat, val.lng], 5, { checkZoomRange: true });
});

eventBus.on('removeStorageItem', function (name) {
  storageInterface.removeFromFavourites(name + ':favourites');
});

eventBus.on('radioOptionSwitch', function (value) {
  coordsFetcher.method = value;
  weatherFetcher.method = value;
});

//components init
var searchBar = new _search_bar2.default(header, eventBus);
var menu = new _menu2.default(header, eventBus);
var radioMenu = new _radio_menu2.default(header, eventBus);
var historyDisplay = new _data_list_display2.default(footer, eventBus, 'History');
var favouritesDisplay = new _data_list_display2.default(footer, eventBus, 'Favourites', true);
var weatherDisplay = new _weather_display2.default(footer);
var map;

function init() {
  map = new ymaps.Map('map', {
    center: [currentPosition.lat, currentPosition.lng],
    zoom: 7,
    controls: ['zoomControl']
  });
  var favsButton = new ymaps.control.Button({ data: { content: "*",
      title: "Add current map center to favourites" },
    options: { selectOnClick: false }
  });
  document.querySelector('#map').addEventListener('click', function (e) {
    if (e.target.className.match(/float-button/g)) {
      eventBus.trigger('addToFavourites');
    }
  });
  map.events.add('actionend', getNewCenter);
  map.controls.add(favsButton, { float: 'right' });

  function getNewCenter() {
    var center = map.getCenter();
    currentPosition.lat = center[0];
    currentPosition.lng = center[1];
    eventBus.trigger('centerChange');
  }
  eventBus.trigger('centerChange');
}

ymaps.ready(init); //called on DOM load

//services init
var weatherFetcher = new _weather_fetcher2.default(eventBus, darkSkyKey, 'fetch');
var coordsFetcher = new _coords_fetcher2.default(eventBus, geocodeKey, 'fetch');
var storageInterface = new _storage_interface_async2.default(eventBus);
menu.render();
searchBar.render();
radioMenu.render();
historyDisplay.render();
weatherDisplay.render();
favouritesDisplay.render();

storageInterface.getHistory().then(function (history) {
  history.forEach(function (item) {
    historyDisplay.addItem(item.value.name, item.value.value);
  });
});

storageInterface.getFavourites().then(function (favourites) {
  favourites.forEach(function (item) {
    favouritesDisplay.addItem(item.name, item.value);
  });
});

},{"./coords_fetcher.js":1,"./data_list_display.js":2,"./event_bus.js":3,"./menu.js":5,"./radio_menu.js":6,"./render_about.js":7,"./render_author.js":8,"./router.js":9,"./search_bar.js":10,"./storage_interface_async.js":11,"./weather_display.js":12,"./weather_fetcher.js":13}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Menu;
function Menu(el, bus) {
  this.bus = bus;
  this.el = el;
  this.menuWrapper = document.createElement('div');
  this.menuWrapper.className = 'menuWrapper';
}

Menu.prototype = {
  render: function render() {
    var _this = this;

    var aboutButton = document.createElement('button');
    var mainButton = document.createElement('button');
    var authorButton = document.createElement('button');
    aboutButton.innerHTML = 'about';
    mainButton.innerHTML = 'main';
    authorButton.innerHTML = 'author';
    aboutButton.className = 'aboutButton about';
    mainButton.className = 'mainButton main';
    authorButton.className = 'authorButton author';
    this.menuWrapper.appendChild(aboutButton);
    this.menuWrapper.appendChild(mainButton);
    this.menuWrapper.appendChild(authorButton);
    this.el.appendChild(this.menuWrapper);
    this.menuWrapper.addEventListener('click', function (e) {
      if (e.target.tagName.toLowerCase() === 'button') {
        _this.menuWrapper.querySelectorAll('button').forEach(function (button) {
          return button.classList.remove('current');
        });
        e.target.classList.add('current');
        var newHash = e.target.className.split(' ')[1];
        window.location.hash = newHash;
      }
    });
  }
};

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = RadioMenu;
function RadioMenu(el, bus) {
  this.el = el;
  this.bus = bus;
  this.radioMenuWrapper = document.createElement('div');
  this.radioMenuWrapper.className = 'radioMenu';
  this.el.appendChild(this.radioMenuWrapper);
  this.currentSelection;
}

RadioMenu.prototype = {
  render: function render() {
    var _this = this;

    this.radioMenuWrapper.innerHTML = '<form>\n          <fieldset>\n              <legend>select request method</legend>\n              <div>\n                  <input type="radio" class="XHRButton" value="xhr" name="queryMethod" />\n                  <label for="XHR">XHR</label>\n              </div>\n              <div>\n                  <input type="radio" class="fetchButton" value="fetch" name="queryMethod" checked />\n                  <label for="fetch">fetch</label>\n              </div>\n          </fieldset>\n      </form>';
    this.radioMenuWrapper.addEventListener('click', function (e) {
      if (e.target.value) {
        if (e.target.value !== _this.currentSelection) {
          _this.bus.trigger('radioOptionSwitch', e.target.value);
          _this.currentSelection = e.target.value;
        }
      }
    });
  }
};

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = renderAuthor;
function renderAuthor(content) {
  var author = document.querySelector('.content > .authorWrapper');
  var about = document.querySelector('.content > .aboutWrapper');
  if (author) {
    content.removeChild(author);
  }
  if (about) {
    content.removeChild(about);
  }
  var aboutWrapper = document.createElement('div');
  aboutWrapper.innerHTML = '\n    <h1> Weather Map</h1>\n    <h2> Description: </h2>\n    <div> WeatherMap is a Single Page Application used to fetch weather at specified location. </div>\n    <h2> Basic Usage: </h2>\n    <div> Desired location can be entered by:</div>\n    <ul>\n      <li> Entering location name in the searchbar and press Enter, </li>\n      <li> Setting url hash to \'#city=[location name]\', </li>\n      <li> Setting url hash to \'#coordinates=[location lat, location lng]\', </li>\n      <li> Scrolling the map. </li>\n    </ul>\n    <div> Last 5 entries are stored at local storage and displayed in the bottom left. </div>\n    <div> You can go to their coordinates by clicking on them. </div>\n    <div> You can add current map center coordinates to favourites by pressing button at the top right of the map. </div>\n    <div> Different query methods can be used! Alter them by selecting \'XHR\' or \'fetch\' at the top left. </div>\n    <a href="https://github.com/IgorTerechtchenko/weatherMap">App\'s github page</a>\n    ';
  aboutWrapper.className = 'aboutWrapper';
  content.appendChild(aboutWrapper);
}

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = renderAuthor;
function renderAuthor(content) {
  var author = document.querySelector('.content > .authorWrapper');
  var about = document.querySelector('.content > .aboutWrapper');
  if (author) {
    content.removeChild(author);
  }
  if (about) {
    content.removeChild(about);
  }
  var authorWrapper = document.createElement('div');
  authorWrapper.innerHTML = '\n    <h1> Igor Terechtchenko, 2018 </h1>\n    <h1><a href="https://github.com/IgorTerechtchenko">GitHub</a></h1>\n  ';
  authorWrapper.className = 'authorWrapper';
  content.appendChild(authorWrapper);
}

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = HashRouter;
function HashRouter(options) {
  options = options || {};
  this.routes = options.routes || [];
  this.handleUrl(getHash());
  window.addEventListener('hashchange', function () {
    this.handleUrl(getHash());
  }.bind(this));
}

HashRouter.prototype = {
  handleUrl: function handleUrl(url) {
    var _this = this;

    var routes = this.routes || [];
    var result = findRoute(routes, url);
    var route = result[0];
    var params = result[1];
    if (!route) {
      return;
    }

    Promise.resolve().then(function () {
      if (_this.prevRoute && _this.prevRoute.onLeave) {
        return _this.prevRoute.onLeave.call(_this.prevRoute, _this.prevParams);
      }
    }).then(function () {
      if (route.onBeforeEnter) {
        return route.onBeforeEnter.call(route, params);
      }
    }).then(function () {
      _this.prevRoute = route;
      _this.prevParams = params;
      if (route.onEnter) {
        return route.onEnter.call(route, params);
      }
    });
  }
};

function getHash() {
  return decodeURI(window.location.hash).slice(1);
}

function findRoute(routeList, url) {
  var result = [null, null];
  routeList.forEach(function (route) {
    if (result[0]) {
      return;
    }
    if (route.match === url) {
      result = [route, url];
    } else if (route.match instanceof RegExp && route.match.test(url)) {
      result = [route, url.match(route.match)];
    } else if (typeof route.match === 'function' && route.match.call(this, url)) {
      result = [route, route.match.call(this, url)];
    }
  });
  return result;
}

},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = SearchBar;
function SearchBar(element, bus) {
  this.bus = bus;
  this.element = element;
  this.searchBarWrapper = document.createElement('div');
  this.searchBarWrapper.className = 'searchBarWrapper';
}

SearchBar.prototype = {
  render: function render() {
    var _this = this;

    var searchField = document.createElement('input');
    searchField.type = 'text';
    searchField.className = 'searchField';
    searchField.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        _this.bus.trigger('searchBarEnter', searchField.value);
        searchField.value = '';
      }
    });
    this.element.appendChild(searchField);
  }
};

},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = StorageInterfaceAsync;
function StorageInterfaceAsync(bus) {
  this.storage = window.localStorage;
  this.historyLimit = 5;
  this.status = {
    historyEntryCounter: 0,
    favouritesEntryCounter: 0,
    minimalHistoryCounter: 0
  };
  this.init();
}

StorageInterfaceAsync.prototype = {
  init: function init() {
    if (this.storage.getItem('storageStatus')) {
      this.status = JSON.parse(this.storage.getItem('storageStatus'));
    } else {
      this.storage.setItem('storageStatus', JSON.stringify(this.status));
    }
  },
  addToHistory: function addToHistory(value) {
    var _this = this;

    return new Promise(function (resolve) {
      if (_this.status.historyEntryCounter >= _this.historyLimit) {
        _this.storage.removeItem(_this.status.minimalHistoryCounter + ':history');
        _this.status.minimalHistoryCounter += 1;
      }
      _this.storage.setItem(_this.status.historyEntryCounter + ':history', JSON.stringify({ 'type': 'history',
        'value': value
      }));
      _this.status.historyEntryCounter += 1;
      _this.storage.setItem('storageStatus', JSON.stringify(_this.status));
    });
  },
  getHistory: function getHistory() {
    return this._getItemsByType('history');
  },
  addToFavourites: function addToFavourites(name, value) {
    var _this2 = this;

    return new Promise(function (resolve) {
      _this2.storage.setItem(name + ':favourites', JSON.stringify({ 'type': 'favourites',
        'name': name,
        'value': value
      }));
    });
  },
  removeFromFavourites: function removeFromFavourites(entryID) {
    var _this3 = this;

    return new Promise(function (resolve) {
      _this3.storage.removeItem(entryID);
    });
  },
  getFavourites: function getFavourites() {
    return this._getItemsByType('favourites');
  },
  _getItemsByType: function _getItemsByType(typeName) {
    var _this4 = this;

    return new Promise(function (resolve, reject) {
      var output = [];
      var key;
      var value;
      for (var i = 0; i < _this4.storage.length; i++) {
        key = _this4.storage.key(i);
        value = JSON.parse(_this4.storage.getItem(key));
        if (value.type === typeName) {
          output.push(value);
        }
      }
      resolve(output);
    });
  }
};

},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = WeatherDisplay;
function WeatherDisplay(el) {
  this.element = el;
  this.wrapper = document.createElement('div');
  this.wrapper.className = 'weatherDisplayWrapper';
}

WeatherDisplay.prototype = {
  render: function render() {
    this.wrapper.innerHTML = '<h2>Weather</h2><br>';
    this.element.appendChild(this.wrapper);
    this.weather = document.createElement('div');
    this.weather.className = 'weather';
    this.wrapper.appendChild(this.weather);
  },
  updateWeather: function updateWeather(weather) {
    this.weather.innerHTML = weather.summary + '<br>' + weather.temperature + '<br>' + 'Humidity: ' + weather.humidity + '<br>' + 'Wind Speed: ' + weather.windSpeed + '<br>';
  }
};

},{}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = WeatherFetcher;
function WeatherFetcher(bus, key) {
  var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'fetch';

  this.bus = bus;
  this.key = key;
  this.method = method;
}

WeatherFetcher.prototype = {
  fetchWeather: function fetchWeather(coords) {
    var requestURL = 'https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/' + this.key + '/' + coords.lat + ',' + coords.lng + '?lang=en&units=ca';
    if (this.method === 'fetch') {
      return fetch(requestURL).then(function (result) {
        return result.json();
      }).then(function (data) {
        return data.currently;
      });
    } else if (this.method === 'xhr') {
      return new Promise(function (resolve) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', requestURL, true);
        xhr.onreadystatechange = function () {
          if (xhr.status != 200) {
            console.log(xhr.status + ': ' + xhr.statusText);
          } else if (xhr.responseText !== '') {
            var responseText = JSON.parse(xhr.responseText);
            resolve(responseText.currently);
          }
        };
        xhr.send();
      });
    }
  }
};

},{}]},{},[4]);
