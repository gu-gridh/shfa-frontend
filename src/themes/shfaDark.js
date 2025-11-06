(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports', 'echarts'], factory);
    } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
        // CommonJS
        factory(exports, require('echarts'));
    } else {
        // Browser globals
        factory({}, root.echarts);
    }
}(this, function (exports, echarts) {
    var log = function (msg) {
        if (typeof console !== 'undefined') {
            console && console.error && console.error(msg);
        }
    };
    if (!echarts) {
        log('ECharts is not Loaded');
        return;
    }
    echarts.registerTheme('shfaDark', {
        "color": [
            "#719fbf",
            "#7e75a0"
        ],
        "backgroundColor": "rgba(0,0,0,0)",
        "textStyle": {},
        "title": {
            "textStyle": {
                "color": "#ffffff"
            },
            "subtextStyle": {
                "color": "#ffffff"
            }
        },
        "line": {
            "itemStyle": {
                "borderWidth": 1
            },
            "lineStyle": {
                "width": 2
            },
            "symbolSize": "6",
            "symbol": "emptyCircle",
            "smooth": true
        },
        "radar": {
            "itemStyle": {
                "borderWidth": 1
            },
            "lineStyle": {
                "width": 2
            },
            "symbolSize": "6",
            "symbol": "emptyCircle",
            "smooth": true
        },
        "bar": {
            "itemStyle": {
                "barBorderWidth": 0,
                "barBorderColor": "#fcfbfb"
            }
        },
        "pie": {
            "itemStyle": {
                "borderWidth": 0,
                "borderColor": "#fcfbfb"
            }
        },
        "scatter": {
            "itemStyle": {
                "borderWidth": 0,
                "borderColor": "#fcfbfb"
            }
        },
        "boxplot": {
            "itemStyle": {
                "borderWidth": 0,
                "borderColor": "#fcfbfb"
            }
        },
        "parallel": {
            "itemStyle": {
                "borderWidth": 0,
                "borderColor": "#fcfbfb"
            }
        },
        "sankey": {
            "itemStyle": {
                "borderWidth": 0,
                "borderColor": "#fcfbfb"
            }
        },
        "funnel": {
            "itemStyle": {
                "borderWidth": 0,
                "borderColor": "#fcfbfb"
            }
        },
        "gauge": {
            "itemStyle": {
                "borderWidth": 0,
                "borderColor": "#fcfbfb"
            }
        },
        "candlestick": {
            "itemStyle": {
                "color": "#719fbf",
                "color0": "#7e75a0",
                "borderColor": "#719fbf",
                "borderColor0": "#7e75a0",
                "borderWidth": 1
            }
        },
        "graph": {
            "itemStyle": {
                "borderWidth": 0,
                "borderColor": "#fcfbfb"
            },
            "lineStyle": {
                "width": 1,
                "color": "#aaa"
            },
            "symbolSize": "6",
            "symbol": "emptyCircle",
            "smooth": true,
            "color": [
                "#719fbf",
                "#7e75a0"
            ],
            "label": {
                "color": "#ffffff"
            }
        },
        "map": {
            "itemStyle": {
                "areaColor": "#eee",
                "borderColor": "#444",
                "borderWidth": 0.5
            },
            "label": {
                "color": "#000"
            },
            "emphasis": {
                "itemStyle": {
                    "areaColor": "rgba(255,215,0,0.8)",
                    "borderColor": "#444",
                    "borderWidth": 1
                },
                "label": {
                    "color": "rgb(100,0,0)"
                }
            }
        },
        "geo": {
            "itemStyle": {
                "areaColor": "#eee",
                "borderColor": "#444",
                "borderWidth": 0.5
            },
            "label": {
                "color": "#000"
            },
            "emphasis": {
                "itemStyle": {
                    "areaColor": "rgba(255,215,0,0.8)",
                    "borderColor": "#444",
                    "borderWidth": 1
                },
                "label": {
                    "color": "rgb(100,0,0)"
                }
            }
        },
        "categoryAxis": {
            "axisLine": {
                "show": true,
                "lineStyle": {
                    "color": "#eeeeee"
                }
            },
            "axisTick": {
                "show": true,
                "lineStyle": {
                    "color": "#eeeeee"
                }
            },
            "axisLabel": {
                "show": true,
                "color": "#eeeeee"
            },
            "splitLine": {
                "show": false,
                "lineStyle": {
                    "color": [
                        "#aaaaaa"
                    ]
                }
            },
            "splitArea": {
                "show": false,
                "areaStyle": {
                    "color": [
                        "#eeeeee"
                    ]
                }
            }
        },
        "valueAxis": {
            "axisLine": {
                "show": true,
                "lineStyle": {
                    "color": "#eeeeee"
                }
            },
            "axisTick": {
                "show": true,
                "lineStyle": {
                    "color": "#eeeeee"
                }
            },
            "axisLabel": {
                "show": true,
                "color": "#eeeeee"
            },
            "splitLine": {
                "show": false,
                "lineStyle": {
                    "color": [
                        "#aaaaaa"
                    ]
                }
            },
            "splitArea": {
                "show": false,
                "areaStyle": {
                    "color": [
                        "#eeeeee"
                    ]
                }
            }
        },
        "logAxis": {
            "axisLine": {
                "show": true,
                "lineStyle": {
                    "color": "#eeeeee"
                }
            },
            "axisTick": {
                "show": true,
                "lineStyle": {
                    "color": "#eeeeee"
                }
            },
            "axisLabel": {
                "show": true,
                "color": "#eeeeee"
            },
            "splitLine": {
                "show": false,
                "lineStyle": {
                    "color": [
                        "#aaaaaa"
                    ]
                }
            },
            "splitArea": {
                "show": false,
                "areaStyle": {
                    "color": [
                        "#eeeeee"
                    ]
                }
            }
        },
        "timeAxis": {
            "axisLine": {
                "show": true,
                "lineStyle": {
                    "color": "#eeeeee"
                }
            },
            "axisTick": {
                "show": true,
                "lineStyle": {
                    "color": "#eeeeee"
                }
            },
            "axisLabel": {
                "show": true,
                "color": "#eeeeee"
            },
            "splitLine": {
                "show": false,
                "lineStyle": {
                    "color": [
                        "#aaaaaa"
                    ]
                }
            },
            "splitArea": {
                "show": false,
                "areaStyle": {
                    "color": [
                        "#eeeeee"
                    ]
                }
            }
        },
        "toolbox": {
            "iconStyle": {
                "borderColor": "#999"
            },
            "emphasis": {
                "iconStyle": {
                    "borderColor": "#666"
                }
            }
        },
        "legend": {
            "textStyle": {
                "color": "#eeeeee"
            }
        },
        "tooltip": {
            "axisPointer": {
                "lineStyle": {
                    "color": "#eeeeee",
                    "width": "1"
                },
                "crossStyle": {
                    "color": "#eeeeee",
                    "width": "1"
                }
            }
        },
        "timeline": {
            "lineStyle": {
                "color": "#eeeeee",
                "width": 1
            },
            "itemStyle": {
                "color": "#719fbf",
                "borderWidth": 1
            },
            "controlStyle": {
                "color": "#eeeeee",
                "borderColor": "#eeeeee",
                "borderWidth": 0.5
            },
            "checkpointStyle": {
                "color": "#a7a8ab",
                "borderColor": "#e0e0e1"
            },
            "label": {
                "color": "#eeeeee"
            },
            "emphasis": {
                "itemStyle": {
                    "color": "#7e75a0"
                },
                "controlStyle": {
                    "color": "#eeeeee",
                    "borderColor": "#eeeeee",
                    "borderWidth": 0.5
                },
                "label": {
                    "color": "#eeeeee"
                }
            }
        },
        "visualMap": {
            "color": [
                "#719fbf"
            ]
        },
        "dataZoom": {
            "backgroundColor": "rgba(47,69,84,0)",
            "dataBackgroundColor": "rgba(255,255,255,0.3)",
            "fillerColor": "rgba(167,183,204,0.4)",
            "handleColor": "#a7b7cc",
            "handleSize": "100%",
            "textStyle": {
                "color": "#eeeeee"
            }
        },
        "markPoint": {
            "label": {
                "color": "#ffffff"
            },
            "emphasis": {
                "label": {
                    "color": "#ffffff"
                }
            }
        }
    });
}));
