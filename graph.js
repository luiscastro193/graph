"use strict";
const graphvizPromise = import("https://cdn.jsdelivr.net/npm/@hpcc-js/wasm/dist/graphviz.js").then(module => module.Graphviz.load());
const zipPromise = import("https://luiscastro193.github.io/zip-string/zip-string.js");
let inputElement = document.getElementById('inputElement');
let graphSection = document.getElementById('graphSection');
const splitLimit = 15;

function gvString(links, font = "Helvetica", fontSize = 12) {
	return `strict digraph {
	graph [rankdir = "LR"];
	graph [nodesep = 0.5];
	node [fontname = "${font}"];
	node [fontsize = ${fontSize}];
	node [shape = box];
	node [width = 0];
	node [height = 0];
	node [margin = 0.1];

	${links}
}`;
}

function split(text) {
	if (text.length <= splitLimit || text.includes('\\n'))
		return text;
	
	let spaces = [...text.matchAll(" ")].map(match => match.index);
	if (spaces.length == 0) return text;
	
	let maxIndex = text.length - 1;
	let lengths = spaces.map(index => Math.max(index, maxIndex - index));
	let bestSpace = spaces[lengths.indexOf(Math.min(...lengths))];
	
	return text.slice(0, bestSpace) + '\\n' + text.slice(bestSpace + 1);
}

function notationToLinks(graph) {
	graph = graph.replace(/[ \\]+$/gm, '');
	graph = graph.replace(/^[^"]+?$/gm, '"$&"');
	graph = graph.replace(/ gto /g, '" -> "');
	graph = graph.replace(/"[^"]* gand [^"]*"/g, '{$&}');
	graph = graph.replace(/ gand /g, '" "');
	graph = graph.replace(/"[^"]* gsame [^"]*"/g, '{rank=same $&}');
	graph = graph.replace(/ gsame /g, '" "');
	graph = graph.replace(/ gconstraint"/g, '" [constraint = false]');
	graph = graph.replace(/ ?\\n ?/g, '\\n');
	graph = graph.replace(/"[^"]+"/g, split);
	
	return graph;
}

let lastDraw = 0;

async function updateGraph(input) {
	const drawId = lastDraw = (lastDraw + 1) % Number.MAX_SAFE_INTEGER;
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

function download(blob, filename) {
	let link = document.createElement("a");
	let url = URL.createObjectURL(blob);
	link.href = url;
	link.download = filename;
	document.body.append(link);
	link.click();
	URL.revokeObjectURL(url);
	link.remove();
}

document.getElementById('download').onclick = function() {
	let content = gvString(notationToLinks(inputElement.value), "Lexend", 11);
	download(new Blob([content], {type: "text/vnd.graphviz"}), "graph.gv");
}

document.getElementById('share').onclick = async function() {
	if (!inputElement.reportValidity()) return false;
	let compressed = await (await zipPromise).zip(inputElement.value);
	let url = new URL('#' + compressed, location.href);
	
	if (navigator.share)
		navigator.share({url});
	else
		navigator.clipboard.writeText(url).then(() => alert("Link copied to clipboard"));
}

if (location.hash) {
	let uncompressed = await (await zipPromise).unzip(location.hash.slice(1));
	inputElement.value = uncompressed;
	history.replaceState(null, '', ' ');
}
else if (localStorage.graph)
	inputElement.value = localStorage.graph;

if (inputElement.value)
	inputElement.oninput();
