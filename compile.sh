#!/bin/bash
set -e

VERSION=16.1.2
SOURCE=vendor/graphviz-$VERSION
BUILD=$SOURCE/build
FEATURES="-mtail-call -msimd128 -msse4.2"

if [ ! -d $SOURCE ]; then
	mkdir -p vendor
	curl -fL https://gitlab.com/graphviz/graphviz/-/archive/$VERSION/graphviz-$VERSION.tar.gz | tar -xz -C vendor
fi

emcmake cmake -S $SOURCE -B $BUILD -G Ninja \
	-DCMAKE_BUILD_TYPE=Release -DBUILD_SHARED_LIBS=OFF -DGRAPHVIZ_CLI=OFF \
	-DENABLE_LTDL=OFF -DWITH_EXPAT=OFF -DWITH_ZLIB=OFF -Dwith_ortho=OFF -DMATH_LIB=m \
	-DCMAKE_C_FLAGS="$FEATURES"

cmake --build $BUILD --target gvplugin_core gvplugin_dot_layout

em++ graphviz.cpp \
	-I$SOURCE/lib/{gvc,common,cgraph,cdt,pathplan} $BUILD/{lib,plugin}/*/*.a \
	-O3 -fno-exceptions -fno-rtti -DNDEBUG \
	$FEATURES \
	-sENVIRONMENT=web -sEXPORT_ES6=1 --no-entry \
	-sSTRICT=1 -sJS_MATH=1 --closure 1 -sEXPORT_KEEPALIVE=1 \
	-sMINIMAL_RUNTIME=1 -sMINIMAL_RUNTIME_STREAMING_WASM_INSTANTIATION=1 \
	-sMALLOC=emmalloc -sINITIAL_HEAP=65536 \
	-sALLOW_MEMORY_GROWTH=1 -sMEMORY_GROWTH_LINEAR_STEP=65536 \
	-sFILESYSTEM=0 -sEXPORTED_FUNCTIONS=_malloc,_free -sEXPORTED_RUNTIME_METHODS=HEAPU8 \
	-o graphviz.js

perl -0777 -pi -e '
	my $arg;
	s|fetch\((new URL\([^)]+\))\)|$arg = $1; "req"|e;
	$_ = qq{let req=(u=>fetch(u,u.origin==location.origin?{mode:"no-cors",credentials:"include"}:void 0))($arg);\n$_};
' graphviz.js
