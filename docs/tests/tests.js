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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; //components

//services


var _search_bar = require('../js/search_bar.js');

var _search_bar2 = _interopRequireDefault(_search_bar);

var _event_bus = require('../js/event_bus.js');

var _event_bus2 = _interopRequireDefault(_event_bus);

var _menu = require('../js/menu.js');

var _menu2 = _interopRequireDefault(_menu);

var _radio_menu = require('../js/radio_menu.js');

var _radio_menu2 = _interopRequireDefault(_radio_menu);

var _weather_display = require('../js/weather_display.js');

var _weather_display2 = _interopRequireDefault(_weather_display);

var _data_list_display = require('../js/data_list_display.js');

var _data_list_display2 = _interopRequireDefault(_data_list_display);

var _storage_interface_async = require('../js/storage_interface_async.js');

var _storage_interface_async2 = _interopRequireDefault(_storage_interface_async);

var _coords_fetcher = require('../js/coords_fetcher.js');

var _coords_fetcher2 = _interopRequireDefault(_coords_fetcher);

var _weather_fetcher = require('../js/weather_fetcher.js');

var _weather_fetcher2 = _interopRequireDefault(_weather_fetcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

mocha.setup({
  ui: "bdd",
  bail: true
});

var assert = chai.assert;
var $$ = document.querySelector.bind(document);

describe('Components', function () {
  var el;
  var bus;
  beforeEach(function () {
    el = document.createElement('div');
    bus = new _event_bus2.default();
  });
  describe('SearchBar', function () {
    it('is a function', function () {
      assert.isOk(typeof _search_bar2.default === 'function');
    });
    it('is a constructor', function () {
      assert.isOk(_typeof(new _search_bar2.default(el, bus)) === 'object');
    });
    it('takes 2 args', function () {
      assert.isOk(_search_bar2.default.length === 2);
    });
  });
  describe('SearchBar.prototype.render', function () {
    var bar;
    beforeEach(function () {
      bar = new _search_bar2.default(el, bus);
    });
    it('is a function', function () {
      assert.isOk(typeof bar.render === 'function');
    });
    it('adds a text input field to el', function () {
      bar.render();
      var length = el.querySelectorAll('input').length;
      assert.isOk(length === 1, length);
      assert.isOk(el.querySelector('input').type === 'text', 'type');
    });
    describe('input field functionality', function () {
      it('triggers searchBarEnter event and sends entered text to event bus on pressing enter', function () {
        bar.render();
        var field = el.querySelector('input');
        field.value = 'test';
        var e = new KeyboardEvent('keypress', { key: 'Enter' });
        var log = [];
        bus.on('searchBarEnter', function (arg) {
          log.push(arg);
        });
        field.dispatchEvent(e);
        assert.isOk(log.length === 1, log.length);
        assert.isOk(log[0] === 'test', log[0]);
      });
    });
  });
  describe('Menu', function () {
    var el;
    var bus;
    beforeEach(function () {
      el = document.createElement('div');
      bus = new _event_bus2.default();
    });
    it('is a function', function () {
      assert.isOk(typeof _menu2.default === 'function');
    });
    it('takes 2 arguments', function () {
      assert.isOk(_menu2.default.length === 2);
    });
    it('is a constructor', function () {
      assert.isOk(new _menu2.default() instanceof _menu2.default);
    });
    describe('Menu.prototype.render', function () {
      it('is a function', function () {
        var menu = new _menu2.default(el, bus);
        assert.isOk(typeof menu.render === 'function');
      });
      it('creates 3 buttons', function () {
        var menu = new _menu2.default(el, bus);
        menu.render();
        var buttons = el.querySelectorAll('button');
        assert.isOk(buttons.length === 3);
      });
      it('creates buttons which change hash', function () {
        var menu = new _menu2.default(el, bus);
        menu.render();
        var buttons = el.querySelectorAll('button');
        buttons[0].click();
        assert.isOk(window.location.hash === '#about');
        window.location.hash = '';
      });
    });
  });
  describe('RadioMenu', function () {
    var bus;
    var el;
    beforeEach(function () {
      bus = new _event_bus2.default();
      el = document.createElement('div');
    });
    it('is a function', function () {
      assert.isOk(typeof _radio_menu2.default === 'function');
    });
    it('takes 2 args', function () {
      assert.isOk(_radio_menu2.default.length === 2);
    });
    it('is a constructor', function () {
      assert.isOk(new _radio_menu2.default(el, bus) instanceof _radio_menu2.default);
    });
    describe('RaioMenu.prototype.render', function () {
      var radioMenu;
      beforeEach(function () {
        radioMenu = new _radio_menu2.default(el, bus);
      });
      it('is a function', function () {
        assert.isOk(typeof radioMenu.render === 'function');
      });
      it('creates two radio buttons', function () {
        radioMenu.render();
        var buttons = el.querySelectorAll('input');
        assert.isOk(buttons.length === 2);
        buttons.forEach(function (button) {
          assert.isOk(button.type === 'radio');
        });
      });
    });
    describe('radioMenu buttons functionality', function () {
      it('sends message with current selected option to event bus', function () {
        var radioMenu = new _radio_menu2.default(el, bus);
        radioMenu.render();
        var log = [];
        var buttons = el.querySelectorAll('input');
        bus.on('radioOptionSwitch', function (currentMode) {
          log.push(currentMode);
        });
        buttons[0].click();
        assert.isOk(log.length === 1);
        assert.isOk(log[0] === 'XHR');
        buttons[0].click();
        assert.isOk(log.length === 1); //not sending message if option does not change
        buttons[1].click();
        assert.isOk(log.length === 2);
        assert.isOk(log[1] === 'fetch');
        buttons[0].click();
        assert.isOk(log.length === 3);
        assert.isOk(log[2] === 'XHR');
      });
    });
  });
  describe('DataListDisplay', function () {
    var el;
    var bus;
    var name;
    beforeEach(function () {
      el = document.createElement('div');
      bus = new _event_bus2.default();
      name = 'test';
    });
    it('is a function', function () {
      assert.isOk(typeof _data_list_display2.default === 'function');
    });
    it('is a constructor', function () {
      assert.isOk(new _data_list_display2.default() instanceof _data_list_display2.default);
    });
    describe('DataListDisplay methods', function () {
      var display;
      beforeEach(function () {
        display = new _data_list_display2.default(el, bus, name);
      });
      describe('DataListDisplay.prototype.render', function () {
        it('is a DataListDisplay object mehtod', function () {
          assert.isOk(typeof display.render === 'function');
        });
        it('adds a div to specified element', function () {
          display.render();
          var divs = el.querySelectorAll('div');
          assert.isOk(divs.length === 1);
        });
        it('adds div containing ul to specified element', function () {
          display.render();
          var ul = el.querySelector('div').querySelector('ul');
          assert.isOk(ul);
        });
      });
      describe('DataListDisplay.prototype.addItem', function () {
        it('is a DataListDisplay object method', function () {
          assert.isOk(typeof display.addItem === 'function');
        });
        it('adds an item to the list element', function () {
          display.render();
          display.addItem('name', 10);
          var listItems = el.querySelector('div > ul').querySelectorAll('li');
          assert.isOk(listItems.length === 1);
          assert.isOk(listItems[0].dataset.value === '10');
        });
      });
      describe('addEventListeners', function () {
        it('is a DataListDisplay object method', function () {
          assert.isOk(typeof display.addEventListeners === 'function');
        });
        it('triggers removeStorageItem event on EventBus', function () {
          display.render();
          display.allowRemoval = true;
          display.addItem('testName', 'testValue');
          var log = [];
          bus.on('removeStorageItem', function (data) {
            return log.push(data);
          });
          var button = el.querySelector('.removeListItem');
          button.click();
          assert.isOk(log[0] === 'testName');
        });
        it('triggers clickStorageItem event on EventBus', function () {
          display.render();
          display.allowRemoval = true;
          display.addItem('testName', 'testValue');
          var log = [];
          bus.on('clickStorageItem', function (data) {
            return log.push(data);
          });
          var li = el.querySelector('.testListItem');
          li.click();
          assert.isOk(log[0] === 'testValue');
        });
      });
      describe('clear', function () {
        it('is a DataListDisplay instance method', function () {
          assert.isOk(typeof new _data_list_display2.default().clear === 'function');
        });
        it('removes all entries from list', function () {
          display.render();
          display.addItem('a', 1);
          display.addItem('b', 2);
          var list = el.querySelector('div > ul');
          display.clear();
          assert.isOk(list.innerHTML === '');
        });
      });
    });
  });
  describe('WeatherDisplay', function () {
    var el;
    beforeEach(function () {
      el = document.createElement('div');
    });
    it('is a function', function () {
      assert.isOk(typeof _weather_display2.default === 'function');
    });
    it('is a constructor', function () {
      assert.isOk(new _weather_display2.default() instanceof _weather_display2.default);
    });
    describe('WeatherDisplay.prototype.render', function () {
      it('is a WeatherDisplay instance method', function () {
        assert.isOk(typeof new _weather_display2.default().render === 'function');
      });
      it('adds wrapper div to specified el innerhtml', function () {
        var display = new _weather_display2.default(el);
        display.render();
        assert.isOk(el.querySelector('div'));
      });
    });
    describe('WeatherDisplay.prototype.updateWeather', function () {
      it('is a WeatherDisplay instance method', function () {
        assert.isOk(typeof new _weather_display2.default().updateWeather === 'function');
      });
      it('changes el innerHTML', function () {
        //assert.isOk(false);
      });
    });
  });
});

describe('Services', function () {
  var bus;
  beforeEach(function () {
    bus = new _event_bus2.default();
  });
  describe('StorageInterfaceAsync', function () {
    afterEach(function () {
      window.localStorage.clear();
    });
    it('is a function', function () {
      assert.isOk(typeof _storage_interface_async2.default === 'function');
    });
    it('is a constructor', function () {
      assert.isOk(new _storage_interface_async2.default() instanceof _storage_interface_async2.default);
    });
    it('is a constructor', function () {
      assert.isOk(new _storage_interface_async2.default() instanceof _storage_interface_async2.default);
    });
    var storage;
    beforeEach(function () {
      storage = new _storage_interface_async2.default(bus);
    });
    describe('StorageInterfaceAsync.prototype.init', function () {
      it('is a StorageInterfaceAsync instance method', function () {
        assert.isOk(typeof storage.init === 'function');
      });
      it('leaves params blank if no params specified in storage', function () {
        assert.isOk(storage.status.historyEntryCounter === 0);
        assert.isOk(storage.status.minimalHistoryCounter === 0);
        assert.isOk(storage.status.favouritesEntryCounter === 0);
      });
    });
    describe('StorageInterfaceAsync.prototype.addToHistory', function () {
      it('is a StorageInterfaceAsync object mehtod', function () {
        assert.isOk(typeof storage.addToHistory === 'function');
      });
      it('takes 1 arg', function () {
        assert.isOk(storage.addToHistory.length === 1);
      });
      it('returns promise', function () {
        assert.isOk(storage.addToHistory('test', 'test') instanceof Promise);
      });
      it('writes data to storage according to userID and history', function () {
        storage.addToHistory('testValue');
        var o = window.localStorage.getItem(storage.status.historyEntryCounter - 1 + ':history');
        o = JSON.parse(o);
        assert.isOk(o.type === 'history');
        assert.isOk(o.value === 'testValue');
      });
    });
    describe('StorageInterfaceAsync.prototype.getHistory', function () {
      it('is a StorageInterfaceAsync object method', function () {
        assert.isOk(typeof storage.getHistory === 'function');
      });
      it('return promise', function () {
        assert.isOk(storage.getHistory() instanceof Promise);
      });
      it('returns history array', async function () {
        var favItem = {
          type: 'favourites',
          value: 'mock'
        };
        window.localStorage.setItem(storage.userID + ':' + storage.status.entryCounter, JSON.stringify(favItem));
        storage.status.entryCounter += 1;
        storage.addToHistory('a');
        storage.addToHistory('b');
        var history = await storage.getHistory();
        assert.isOk(history.length === 2);
        assert.isOk(history[0].value === 'a');
        assert.isOk(history[1].value === 'b');
      });
    });
    describe('StorageInterfaceAsync.prototype.addToFavourites', function () {
      it('is a StorageInterfaceAsync object method', function () {
        assert.isOk(typeof storage.addToFavourites === 'function');
      });
      it('returns a promise', function () {
        assert.isOk(storage.addToFavourites('test') instanceof Promise);
      });
      it('writes to localStorage', function () {
        storage.addToFavourites('dudinka', 10);
        var fav = JSON.parse(window.localStorage.getItem('dudinka:favourites'));
        assert.isOk(fav.value === 10);
        assert.isOk(fav.type === 'favourites');
      });
    });
    describe('StorageInterfaceAsync.prototype.removeFromFavourites', function () {
      it('is a StorageInterfaceAsync object method', function () {
        assert.isOk(typeof storage.removeFromFavourites === 'function');
      });
      it('takes 1 arg', function () {
        assert.isOk(storage.removeFromFavourites.length === 1);
      });
      it('returns a promise', function () {
        assert.isOk(storage.removeFromFavourites() instanceof Promise);
      });
      it('removes specified item from storage', function () {
        storage.addToFavourites('kebab');
        var item = JSON.parse(window.localStorage.getItem('kebab:favourites'));
        storage.removeFromFavourites('kebab:favourites');
        item = window.localStorage.getItem('kebab:favourites');
        assert.isOk(item === null);
      });
    });
    describe('StorageInterfaceAsync.prototype.getFavourites', function () {
      it('is a StorageInterfaceAsync object method', function () {
        assert.isOk(typeof storage.getFavourites === 'function');
      });
      it('takes no args', function () {
        assert.isOk(storage.getFavourites.length === 0);
      });
      it('returns a promise', function () {
        assert.isOk(storage.getFavourites() instanceof Promise);
      });
      it('returns favourites array', async function () {
        storage.status.entryCounter += 1;
        storage.addToFavourites('a', 1);
        storage.addToFavourites('b', 2);
        var favs = await storage.getFavourites();
        assert.isOk(favs instanceof Array);
        assert.isOk(favs.length === 2);
        assert.isOk(favs[0].value === 1);
        assert.isOk(favs[1].value === 2);
        assert.isOk(favs[0].name === 'a');
        assert.isOk(favs[1].name === 'b');
      });
    });
  });
  describe('CoordsFetcher', function () {
    var bus;
    beforeEach(function () {
      bus = new _event_bus2.default();
    });
    it('is a function', function () {
      assert.isOk(typeof _coords_fetcher2.default === 'function');
    });
    it('is a constructor', function () {
      assert.isOk(new _coords_fetcher2.default() instanceof _coords_fetcher2.default);
    });
    describe('CoordsFetcher.prototype.getCoords', function () {
      var fetcher;
      var key = '';
      beforeEach(function () {
        key = 'AIzaSyDa7DCL2NO9KMPd9DYVk_u3u0wCbm0XXFY';
        fetcher = new _coords_fetcher2.default(bus, key);
      });
      it('is CoordsFetcher object method', function () {
        assert.isOk(typeof fetcher.getCoords === 'function');
      });
      it('returns a promise', async function () {
        var res = await fetcher.getCoords();
        assert.isOk(fetcher.getCoords() instanceof Promise);
      });
      it('returns fetched coords', async function () {
        var result = await fetcher.getCoords('Minsk');
        assert.isOk(result instanceof Object);
        assert.isOk(result.lat == '53.90453979999999');
        assert.isOk(result.lng == '27.5615244');
      });
    });
  });
  describe('WeatherFetcher', function () {
    var bus;
    beforeEach(function () {
      bus = new _event_bus2.default();
    });
    it('it is a function', function () {
      assert.isOk(typeof _weather_fetcher2.default === 'function');
    });
    it('is a constructor', function () {
      assert.isOk(new _weather_fetcher2.default() instanceof _weather_fetcher2.default);
    });
    describe('WeatherFetcher.prototype.fetchWeather', function () {
      var fetcher;
      var key;
      beforeEach(function () {
        key = 'd113af5f82393ef553f48314ae9f42e8';
        fetcher = new _weather_fetcher2.default(bus, key);
      });
      it('is a WeatherFetcher instance method', function () {
        assert.isOk(typeof fetcher.fetchWeather === 'function');
      });
    });
  });
});

mocha.run();

},{"../js/coords_fetcher.js":1,"../js/data_list_display.js":2,"../js/event_bus.js":3,"../js/menu.js":4,"../js/radio_menu.js":5,"../js/search_bar.js":6,"../js/storage_interface_async.js":7,"../js/weather_display.js":8,"../js/weather_fetcher.js":9}]},{},[10]);
