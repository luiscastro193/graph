#include <emscripten/emscripten.h>
#define CAPI extern "C" EMSCRIPTEN_KEEPALIVE
#define WASM_SIMD_COMPAT_SLOW

#include <gvc.h>
#include <cstdlib>
#include <string>

extern "C" {
	extern gvplugin_library_t gvplugin_dot_layout_LTX_library;
	extern gvplugin_installed_t gvrender_svg_types[];
	extern gvplugin_installed_t gvdevice_svg_types[];
}

static std::string last_error;

static GVC_t* init() {
	static gvplugin_api_t svg_apis[] = {
		{API_render, gvrender_svg_types},
		{API_device, gvdevice_svg_types},
		{(api_t) 0, 0}
	};

	static gvplugin_library_t svg_library = {(char*) "svg", svg_apis};

	static const lt_symlist_t plugins[] = {
		{"gvplugin_dot_layout_LTX_library", &gvplugin_dot_layout_LTX_library},
		{"gvplugin_svg_LTX_library", &svg_library},
		{0, 0}
	};

	agseterrf([](char* message) {
		last_error += message;
		return 0;
	});

	return gvContextPlugins(plugins, 0);
}

static GVC_t* context = init();

CAPI char* render(char* source, bool is_inline) {
	last_error.clear();
	Agraph_t* graph = agmemread(source);
	free(source);
	if (!graph) return nullptr;
	char* output = nullptr;
	size_t size;

	if (gvLayout(context, graph, "dot") != 0 || gvRenderData(context, graph, is_inline ? "svg_inline" : "svg", &output, &size) != 0) {
		gvFreeRenderData(output);
		output = nullptr;
	}

	gvFreeLayout(context, graph);
	agclose(graph);
	return output;
}

CAPI const char* error() {
	return last_error.c_str();
}
