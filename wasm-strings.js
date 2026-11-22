"use strict";
const encoder = new TextEncoder;
const decoder = new TextDecoder;

export default class WasmStrings {
	constructor(module) {
		this.module = module;
	}

	write(text) {
		const source = encoder.encode(text + '\0');
		const pointer = this.module._malloc(source.length);
		this.module.HEAPU8.set(source, pointer);
		return pointer;
	}

	read(pointer) {
		if (!pointer) return null;
		const bytes = this.module.HEAPU8;
		return decoder.decode(bytes.subarray(pointer, bytes.indexOf(0, pointer)));
	}

	take(pointer) {
		const text = this.read(pointer);
		this.module._free(pointer);
		return text;
	}
}
