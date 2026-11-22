#include <emscripten/bind.h>
#include <gvc.h>
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

static std::string render(const std::string& source, bool is_inline) {
	last_error.clear();
	std::string result;
	Agraph_t* graph = agmemread(source.c_str());
	if (!graph) return result;

	if (gvLayout(context, graph, "dot") == 0) {
		char* output = nullptr;
		size_t size = 0;
		gvRenderData(context, graph, is_inline ? "svg_inline" : "svg", &output, &size);
		if (output) result.assign(output, size);
		gvFreeRenderData(output);
		gvFreeLayout(context, graph);
	}

	agclose(graph);
	return result;
}

static std::string error() {
	return last_error;
}

EMSCRIPTEN_BINDINGS(graphviz) {
	emscripten::function("render", &render);
	emscripten::function("error", &error);
}
