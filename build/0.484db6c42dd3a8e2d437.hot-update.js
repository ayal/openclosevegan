webpackHotUpdate(0,[
/* 0 */,
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var _reactDom = __webpack_require__(159);

	var _reactRouter = __webpack_require__(160);

	var _geo = __webpack_require__(207);

	var _createBrowserHistory = __webpack_require__(208);

	var _createBrowserHistory2 = _interopRequireDefault(_createBrowserHistory);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	__webpack_require__(209);

	function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
					var R = 6371; // Radius of the earth in km
					var dLat = deg2rad(lat2 - lat1); // deg2rad below
					var dLon = deg2rad(lon2 - lon1);
					var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
					var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
					var d = R * c; // Distance in km
					return d;
	}

	function deg2rad(deg) {
					return deg * (Math.PI / 180);
	}

	var days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

	window.openclose = [];

	$.get('miso.js', function (data) {
					var pid_meals = _.groupBy(data.meals, function (m) {
									return m.pID;
					});

					var gotPos = function gotPos() {
									var now = new Date();
									console.log(data.places);
									window.openclose = _.compact(_.map(data.places, function (p) {
													var d = getDistanceFromLatLonInKm(p.lat, p.lng, pos.latitude, pos.longitude);
													if (p.openJSON) {
																	var openobj = JSON.parse(p.openJSON);
																	var hours = Object.keys(openobj);
																	var ok = false;
																	var to = null;
																	_.each(hours, function (hs) {
																					var from = parseInt(hs.split('-')[0].split(':')[0]);
																					to = parseInt(hs.split('-')[1].split(':')[0]);
																					if (to === from) {
																									// 24 / 7
																									ok = true;
																									return;
																					}
																					to = to < 6 ? 24 - to : to;
																					if (to < from) {
																									var tfrom = from;
																									from = to;
																									to = tfrom;
																					}

																					var nowhs = now.getHours() - 8;

																					if (openobj[hs].indexOf(days[now.getDay()]) !== -1) {
																									if (from < nowhs && nowhs < to) {

																													// console.log(p.name, _.map(pid_meals[p.pID],x=>x.title), p)
																													ok = true;
																									} else {
																													console.log(from, nowhs, to, p);
																									}
																					}
																	});

																	if (ok) {
																					return { p: p, d: d, hs: to + ':00', ms: pid_meals[p.pID] };
																	}
													}
									})).sort(function (a, b) {
													return a.d - b.d;
									});

									xupdate();
					};

					if (_geo.geo.init()) {
									_geo.geo.getCurrentPosition(function (p) {
													window.pos = p.coords;
													gotPos();
									}, function () {
													console.warn('error getting postion', arguments);
									});
					};
	});

	var Lista = _react2.default.createClass({
					displayName: 'Lista',

					clickplace: function clickplace(p) {
									return function () {
													console.log(p);
									};
					},
					meals: function meals(e) {
									var ofl = $(e.target).toggleClass('shows');
					},

					render: function render() {
									var that = this;
									var places = _.map(this.props.places, function (_ref) {
													var p = _ref.p;
													var d = _ref.d;
													var ms = _ref.ms;
													var hs = _ref.hs;

													var cls = d < 0.4 ? 'near' : d < 1.1 ? 'mid' : 'far';
													return _react2.default.createElement(
																	'div',
																	{ className: "place " + cls, onClick: that.clickplace(p) },
																	_react2.default.createElement(
																					'h2',
																					null,
																					p.name
																	),
																	_react2.default.createElement(
																					'div',
																					{ className: 'info' },
																					_react2.default.createElement(
																									'div',
																									{ className: 'phone' },
																									_react2.default.createElement(
																													'a',
																													{ href: "tel:" + p.phone1 },
																													p.phone1
																									)
																					),
																					_react2.default.createElement(
																									'div',
																									null,
																									_react2.default.createElement(
																													'div',
																													{ className: 'deliv' },
																													p.deliv === '1' ? 'משלוחים' : ''
																									)
																					),
																					_react2.default.createElement(
																									'div',
																									{ className: "address " + cls },
																									p.address,
																									_react2.default.createElement(
																													'div',
																													null,
																													(Math.round(d * 10) / 10).toFixed(1) + ' km'
																									)
																					),
																					_react2.default.createElement(
																									'div',
																									null,
																									'Open until: ' + hs
																					),
																					_react2.default.createElement(
																									'div',
																									{ className: 'meals', onClick: that.meals.bind(that) },
																									'' + _.map(ms, function (m) {
																													return m.title;
																									})
																					)
																	)
													);
									});
									return _react2.default.createElement(
													'div',
													null,
													places
									);
					}
	});

	var App = _react2.default.createClass({
					displayName: 'App',

					name: 'App',
					mixins: [_reactRouter.Lifecycle, _reactRouter.History],
					componentWillMount: function componentWillMount() {
									var that = this;
									window.xupdate = function () {
													that.forceUpdate();
									};
					},
					routerWillLeave: function routerWillLeave(nextLocation) {
									return null;
					},
					render: function render() {
									return _react2.default.createElement(Lista, { places: openclose });
					}
	});

	(0, _reactDom.render)(_react2.default.createElement(
					_reactRouter.Router,
					{ history: (0, _createBrowserHistory2.default)() },
					_react2.default.createElement(_reactRouter.Route, { path: '/', component: App }),
					_react2.default.createElement(_reactRouter.Route, { path: '/openclosevegan/', component: App })
	), document.getElementById('content'));

/***/ }
])