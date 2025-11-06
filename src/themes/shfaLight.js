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
    echarts.registerTheme('shfaLight', {
        "color": [
            "#56778e",
            "#59507a"
        ],
        "backgroundColor": "rgba(255,255,255,0)",
        "textStyle": {},
        "title": {
            "textStyle": {
                "color": "#000000"
            },
            "subtextStyle": {
                "color": "#000000"
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
                "barBorderColor": "#2d2d2d"
            }
        },
        "pie": {
            "itemStyle": {
                "borderWidth": 0,
                "borderColor": "#2d2d2d"
            }
        },
        "scatter": {
            "itemStyle": {
                "borderWidth": 0,
                "borderColor": "#2d2d2d"
            }
        },
        "boxplot": {
            "itemStyle": {
                "borderWidth": 0,
                "borderColor": "#2d2d2d"
            }
        },
        "parallel": {
            "itemStyle": {
                "borderWidth": 0,
                "borderColor": "#2d2d2d"
            }
        },
        "sankey": {
            "itemStyle": {
                "borderWidth": 0,
                "borderColor": "#2d2d2d"
            }
        },
        "funnel": {
            "itemStyle": {
                "borderWidth": 0,
                "borderColor": "#2d2d2d"
            }
        },
        "gauge": {
            "itemStyle": {
                "borderWidth": 0,
                "borderColor": "#2d2d2d"
            }
        },
        "candlestick": {
            "itemStyle": {
                "color": "#56778e",
                "color0": "#59507a",
                "borderColor": "#56778e",
                "borderColor0": "#59507a",
                "borderWidth": 1
            }
        },
        "graph": {
            "itemStyle": {
                "borderWidth": 0,
                "borderColor": "#2d2d2d"
            },
            "lineStyle": {
                "width": 1,
                "color": "#6d6c6c"
            },
            "symbolSize": "6",
            "symbol": "emptyCircle",
            "smooth": true,
            "color": [
                "#56778e",
                "#59507a"
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
                    "color": "#4f4e4e"
                }
            },
            "axisTick": {
                "show": true,
                "lineStyle": {
                    "color": "#4f4e4e"
                }
            },
            "axisLabel": {
                "show": true,
                "color": "#4f4e4e"
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
                    "color": "#4f4e4e"
                }
            },
            "axisTick": {
                "show": true,
                "lineStyle": {
                    "color": "#4f4e4e"
                }
            },
            "axisLabel": {
                "show": true,
                "color": "#4f4e4e"
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
                    "color": "#4f4e4e"
                }
            },
            "axisTick": {
                "show": true,
                "lineStyle": {
                    "color": "#4f4e4e"
                }
            },
            "axisLabel": {
                "show": true,
                "color": "#4f4e4e"
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
                    "color": "#4f4e4e"
                }
            },
            "axisTick": {
                "show": true,
                "lineStyle": {
                    "color": "#4f4e4e"
                }
            },
            "axisLabel": {
                "show": true,
                "color": "#4f4e4e"
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
                "borderColor": "#595858"
            },
            "emphasis": {
                "iconStyle": {
                    "borderColor": "#535252"
                }
            }
        },
        "legend": {
            "textStyle": {
                "color": "#4f4e4e"
            }
        },
        "tooltip": {
            "axisPointer": {
                "lineStyle": {
                    "color": "#4f4e4e",
                    "width": "1"
                },
                "crossStyle": {
                    "color": "#4f4e4e",
                    "width": "1"
                }
            }
        },
        "timeline": {
            "lineStyle": {
                "color": "#4f4e4e",
                "width": 1
            },
            "itemStyle": {
                "color": "#56778e",
                "borderWidth": 1
            },
            "controlStyle": {
                "color": "#4f4e4e",
                "borderColor": "#4f4e4e",
                "borderWidth": 0.5
            },
            "checkpointStyle": {
                "color": "#595858",
                "borderColor": "#212121"
            },
            "label": {
                "color": "#4f4e4e"
            },
            "emphasis": {
                "itemStyle": {
                    "color": "#59507a"
                },
                "controlStyle": {
                    "color": "#4f4e4e",
                    "borderColor": "#4f4e4e",
                    "borderWidth": 0.5
                },
                "label": {
                    "color": "#4f4e4e"
                }
            }
        },
        "visualMap": {
            "color": [
                "#56778e"
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
