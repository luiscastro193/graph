const encoder = new TextEncoder;
const decoder = new TextDecoder;

Module['write'] = text => {
	const source = encoder.encode(text + '\0');
	const pointer = _malloc(source.length);
	HEAPU8.set(source, pointer);
	return pointer;
};

Module['read'] = pointer => {
	if (!pointer) return null;
	return decoder.decode(HEAPU8.subarray(pointer, HEAPU8.indexOf(0, pointer)));
};

Module['take'] = pointer => {
	const text = Module['read'](pointer);
	_free(pointer);
	return text;
};
