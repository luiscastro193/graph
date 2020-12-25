"use strict";
let hpccWasm = window["@hpcc-js/wasm"];
let inputElement = document.getElementById('inputElement');
let graphSection = document.getElementById('graphSection');

function gvString(links) {
	return `strict digraph {
		graph [rankdir = "LR"];
		graph [nodesep = 0.5];
		node [fontname = "Helvetica"];
		node [fontsize = 12];
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
	return hpccWasm.graphviz.layout(gvString(notationToLinks(input)));
}

function updateGraph() {
	elementPromise(inputElement.value).then(function(element) {
		graphSection.innerHTML = element;
	});
	
	localStorage.graph = inputElement.value;
}

function copyToClipboard() {
	navigator.clipboard.writeText(notationToLinks(inputElement.value));
}

if (localStorage.graph)
	inputElement.value = localStorage.graph;

if (inputElement.value)
	updateGraph();
