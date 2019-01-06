"use strict";
const workerURL = 'lite.render.js';
let viz = new Viz({ workerURL });
let inputElement = document.getElementById('inputElement');
let graphSection = document.getElementById('graphSection');

function gvString(links) {
	return `digraph {
		graph [rankdir = "LR"];
		graph [nodesep = 0.5];
		node [fontname = "Helvetica"];
		node [fontsize = 11];
		node [shape = box];
		node [width = 0];
		node [height = 0];
		node [margin = 0.1];

		${links}
	}`;
}

function notationToLinks(graph) {
	graph = graph.replace(/ $/gm, '');
	graph = graph.replace(/^[^"\n\r]+$/gm, '"$&"');
	graph = graph.replace(/ gto /g, '" -> "');
	graph = graph.replace(/"[^"]* gand [^"]*"/g, '{$&}');
	graph = graph.replace(/ gand /g, '" "');
	graph = graph.replace(/"[^"]* gsame [^"]*"/g, '{rank=same $&}');
	graph = graph.replace(/ gsame /g, '" "');
	graph = graph.replace(/ gconstraint"/g, '" [constraint = false]');
	
	return graph;
}

function elementPromise(input) {
	return viz.renderSVGElement(gvString(notationToLinks(input)));
}

function updateGraph() {
	elementPromise(inputElement.value).then(function(element) {
		graphSection.innerHTML = '';
		graphSection.appendChild(element);
	}).catch(function(error) {
		viz = new Viz({ workerURL });
		console.error(error);
	});
	
	localStorage.graph = inputElement.value;
}

function copyToClipboard() {
	clipboard.writeText(notationToLinks(inputElement.value));
}

if (localStorage.graph)
	inputElement.value = localStorage.graph;

if (inputElement.value)
	updateGraph();
