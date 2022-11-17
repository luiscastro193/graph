"use strict";
const graphvizPromise = import("https://cdn.jsdelivr.net/npm/@hpcc-js/wasm/dist/graphviz.js").then(module => module.Graphviz.load());
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
	graph = graph.replace(/\\? ?$/gm, '');
	graph = graph.replace(/^[^"]+?$/gm, '"$&"');
	graph = graph.replace(/ gto /g, '" -> "');
	graph = graph.replace(/"[^"]* gand [^"]*"/g, '{$&}');
	graph = graph.replace(/ gand /g, '" "');
	graph = graph.replace(/"[^"]* gsame [^"]*"/g, '{rank=same $&}');
	graph = graph.replace(/ gsame /g, '" "');
	graph = graph.replace(/ gconstraint"/g, '" [constraint = false]');
	graph = graph.replace(/ ?\\n ?/g, '\n');
	
	return graph;
}

let lastDraw = 0;

async function updateGraph(input) {
	let drawId = ++lastDraw;
	let graphviz = await graphvizPromise;
	
	if (drawId == lastDraw)
		graphSection.innerHTML = await graphviz.layout(gvString(notationToLinks(input)));
}

inputElement.oninput = function() {
	updateGraph(inputElement.value);
	localStorage.graph = inputElement.value;
}

document.getElementById('copy').onclick = function() {
	navigator.clipboard.writeText(notationToLinks(inputElement.value));
}

if (localStorage.graph)
	inputElement.value = localStorage.graph;

if (inputElement.value)
	inputElement.oninput();
