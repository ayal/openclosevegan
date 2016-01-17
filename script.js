require("./style.less");

import React from 'react'
import { render } from 'react-dom'
import { Router, Route, Link, History, Lifecycle } from 'react-router';

import {geo} from './geo.js';


function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1);
    var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}


var days  = ["Su","Mo","Tu","We","Th","Fr","Sa"];


window.openclose = [];

$.getJSON('miso.json', function(data) {

    var pid_meals = _.groupBy(data.meals, function(m){return m.pID;});


    var gotPos = function() {
	var now = new Date();
	console.log(data.places)
	window.openclose = _.compact(_.map(data.places, function(p){
	    var d = getDistanceFromLatLonInKm( p.lat, p.lng, pos.latitude, pos.longitude);
	    if (p.openJSON) {
		var openobj = JSON.parse(p.openJSON);
		var hours = Object.keys(openobj);
		var ok = false;
		var theto = null;
		_.each(hours, function(hs){
		    var from = parseInt(hs.split('-')[0].split(':')[0]);
		    var to = parseInt(hs.split('-')[1].split(':')[0]);
		    if (to === from) {
			// 24 / 7
			theto = '24/7';
			ok = true;
			return;
		    }
		    to = to < 6 ? 24 - to : to;
		    from = from < 6 ? 24 - from : from;
		    if (to < from) {
			var tfrom = from;
			from = to;
			to = tfrom;
		    }
		    
		    var nowhs = now.getHours() + 1;

		    if (openobj[hs].indexOf(days[now.getDay()]) !== -1) {
			if (from < nowhs && nowhs < to) {
			    theto = to;
			    // console.log(p.name, _.map(pid_meals[p.pID],x=>x.title), p)
			    ok = true;
			    
			}
			else {
			    console.log(from, nowhs, to, p)
			}
		    }
		})
		
		if (ok) {
		    return {p: p, d: d, hs: theto === '24/7' ? theto : theto+':00', ms: pid_meals[p.pID]};
		}
	    }
	})).sort((a,b)=>(a.d - b.d))


	xupdate();    
    };


    if(geo.init()){
	geo.getCurrentPosition(function(p){
            window.pos = p.coords;
	    gotPos();
	}, function(){
	    console.warn('error getting postion', arguments);
	});
    };

   
})

const Lista = React.createClass({
    clickplace: function(p) {
	return function() {
	    console.log(p);
	}
    },
    meals: function(e) {
	var ofl = $(e.target).toggleClass('shows')
    },
    
    render: function() {
	var that = this;
	var places = _.map(this.props.places, ({p,d,ms,hs})=>{
	    var cls = d < 0.4 ? 'near' : (d < 1.1 ? 'mid' : 'far');
	    return (
		<div className={"place " + cls} onClick={that.clickplace(p)}>
		<h2>{p.name}</h2>
		<div className="info">
		<div className="phone"><a href={"tel:"+p.phone1}>{p.phone1}</a></div>
		<div>
		<div className="deliv">{p.deliv === '1' ? 'משלוחים' : ''}</div>
		</div>
		<div className={"address " + cls}>
		{p.address}
		<div>{(Math.round(d * 10) / 10).toFixed(1) + ' km'}</div>
		</div>
		<div>{'Open until: ' + hs}</div>
		<div className="meals" onClick={that.meals.bind(that)} >{'' + _.map(ms, m=>m.title)}</div>

		</div>
		</div>
	    );
	})
	return (
	    <div>
	    {places}
	    </div>
	);
    }
});

const App = React.createClass({
    name: 'App',
    mixins: [ Lifecycle, History ],
    componentWillMount: function() {
	var that = this;
        window.xupdate = function() {
            that.forceUpdate();
        };
    },
    routerWillLeave: function(nextLocation) {
        return null;
    },
    render: function() {
        return (
            <Lista places={openclose}  />
        );
    }
});


import createBrowserHistory from 'history/lib/createBrowserHistory';
render((
    <Router history={createBrowserHistory()}>
    <Route path="/" component={App}>
    </Route>
    <Route path="/openclosevegan/" component={App} >
    </Route>
    </Router>
), document.getElementById('content'));



