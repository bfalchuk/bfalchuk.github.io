/**
 * Author:    Ben Falchuk
 * Created:   May 2021
 * 
 * (c) Copyright by Ben Falchuk.
 * 
 * utility methods
 * 
 **/
function getrandint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getrandrange(min, max) {
    return Math.random() * (max - min) + min;
}

var git_cmds_list = [
    "commit","commit","commit",
    "pull","pull",
    "push","push",
    "stash",
    "checkout",
    "rebase",
    "branch"
];

function addThreejsStats(){ //Stats.js - https://github.com/mrdoob/stats.js
    stats = new Stats();
    stats.domElement.style.position	= 'absolute';
    stats.domElement.style.bottom	= '0px';
    document.body.appendChild( stats.domElement );
}