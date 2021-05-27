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

// Hide panels to avoid (known?) call stack issues when offcanvas panel and modals are combined
function hidePanels(){ 
    var offpanels = [
    bootstrap.Offcanvas.getInstance(document.getElementById('offcanvaspanel1')),
    bootstrap.Offcanvas.getInstance(document.getElementById('offcanvaspanel2')),
    ];
    for(panel of offpanels) if(panel) panel.hide(); //hide each
}

function showJumpModal(){
    hidePanels(); //hide panels to avoid stack issues
    var myModal = new bootstrap.Modal(document.getElementById('modal_jump')); 
    myModal.show(); //show modal
}

// Jump to repo (if desired)
function jump2Repo(){
    window.location.assign('https://github.com/bfalchuk/bfalchuk.github.io');
}