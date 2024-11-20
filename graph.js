"use strict";
const graphvizPromise = import("https://cdn.jsdelivr.net/npm/@hpcc-js/wasm/dist/graphviz.js").then(module => module.Graphviz.load());
const zipPromise = import("https://luiscastro193.github.io/zip-string/zip-string.js");
const graphviz = document.fonts.ready.then(() => graphvizPromise);
const inputElement = document.getElementById('inputElement');
const graphSection = document.getElementById('graphSection');
const splitLimit = 15;
const lineHeight = 11 * 1.25 / 72;
const measurer = new OffscreenCanvas(100, 100).getContext("2d");
measurer.font = "11pt Lexend";

function measure(node) {
	node = node.replaceAll('"', '').split('\\n');
	return [
		Math.max(...node.map(text => measurer.measureText(text).width)) / 96 + .2,
		lineHeight * node.length + .2
	];
}

function getMetrics(node) {
	let measures = measure(node);
	return `${node} [width=${measures[0]} height=${measures[1]} fixedsize=true]`;
}

function customMetrics(links) {
	return '\n' + [...new Set(links.match(/"[^"]*"/g))].map(getMetrics).join('\n');
}

function gvString(links, metrics = true) {
	return `strict digraph {

graph [rankdir = "LR"];
graph [nodesep = 0.5];
node [fontname = "Lexend"];
node [fontsize = 11];
node [shape = box];
node [width = 0];
node [height = 0];
node [margin = 0.1];

${links}${metrics ? customMetrics(links, metrics): ''}

}`;
}

function splitAt(index, text) {
	return text.slice(0, index) + '\\n' + text.slice(index + 1);
}

function split(text) {
	if (text.length <= splitLimit || text.includes('\\n'))
		return text;
	
	let spaces = [...text.matchAll(' ')].map(match => match.index);
	if (spaces.length == 0) return text;
	let lengths = spaces.map(index => measure(splitAt(index, text))[0]);
	let bestSpace = spaces[lengths.indexOf(Math.min(...lengths))];
	return splitAt(bestSpace, text);
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

async function svg(input) {
	return (await graphviz).layout(gvString(notationToLinks(input)));
}

let lastDraw = 0;

async function updateGraph(input) {
	const drawId = lastDraw = (lastDraw + 1) % Number.MAX_SAFE_INTEGER;
	await graphviz;
	
	if (drawId == lastDraw)
		graphSection.innerHTML = await svg(input);
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

document.getElementById('source').onclick = function() {
	let content = gvString(notationToLinks(inputElement.value), false);
	download(new Blob([content]), "graph.gv");
}

async function request(resource, options) {
	let response = await fetch(resource, options);
	if (response.ok) return response; else throw response;
}

const font = Promise.all([graphviz, zipPromise]).then(() => request('lexend.txt')).then(response => response.text());

document.getElementById('svg').onclick = async function() {
	let content = await svg(inputElement.value);
	content = content.replace(/(?<=<svg[^>]+)>/m, await font);
	download(new Blob([content]), "graph.svg");
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

async function handleHash() {
	let uncompressed = await (await zipPromise).unzip(location.hash.slice(1)).catch(error => {
		console.error(error);
		return "Error gto Check the link gand Update your browser";
	});
	inputElement.value = uncompressed;
	history.replaceState(null, '', ' ');
}

if (location.hash)
	await handleHash();
else if (localStorage.graph)
	inputElement.value = localStorage.graph;

if (inputElement.value) inputElement.oninput();

window.onhashchange = async () => {
	await handleHash();
	inputElement.oninput();
};
