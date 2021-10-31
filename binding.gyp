{
    "targets": [{
        "target_name": "testaddon",
        "cflags!": ["-fno-exceptions"],
        "cflags_cc!": ["-fno-exceptions"],
        "sources": [
            "cppsrc/main.cpp",
            "cppsrc/Samples/functionexample.cpp",
            "cppsrc/TSP/cross.cpp",
            "cppsrc/TSP/environment.cpp",
            "cppsrc/TSP/evaluator.cpp",
            "cppsrc/TSP/indi.cpp",
            "cppsrc/TSP/kopt.cpp",
            "cppsrc/TSP/randomize.cpp",
            "cppsrc/TSP/sort.cpp"
        ],
        "include_dirs": [
            "<!@(node -p \"require('node-addon-api').include\")"
        ],
        "libraries": [],
        "dependencies": [
            "<!(node -p \"require('node-addon-api').gyp\")"
        ],
        "msvs_settings": {
            "VCCLCompilerTool": { "ExceptionHandling": 1 }
          }
    }]
}
