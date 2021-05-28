// ==UserScript==
// @id iitc-standard-layers@MerlierR
// @name IITC Plugin: Standard Intel Layers
// @category Highlighter
// @version 0.0.0
// @namespace https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL https://github.com/MerlierR/iitc-plugin-standard-layers/raw/master/standard-intel-layers.user.js
// @downloadURL https://github.com/MerlierR/iitc-plugin-standard-layers/raw/master/standard-intel-layers.user.js
// @description Add standard intel layer highlighters
// @include http://intel.ingress.com/intel*
// @match http://intel.ingress.com/intel*
// @include https://intel.ingress.com/intel*
// @match https://intel.ingress.com/intel*
// @grant none
// ==/UserScript==

function wrapper(plugin_info) {
    if (typeof window.plugin !== 'function') window.plugin = function () {
    };

    plugin_info.buildName = 'iitc-standard-layers';
    plugin_info.dateTimeVersion = '20210528190300';
    plugin_info.pluginId = 'iitc-standard-layers';

    /**
     * Plugin content
     * Layer data should be in `data.portal.options.ent[2][18]`
     * The data is a bitmask:
     * - bit 0: visited
     * - bit 1: captured
     * - bit 2: scout controlled
     */
    window.plugin.stdLayers = function () {
    };

    window.plugin.stdLayers.types = {
        VISITED: 'Visited Portals',
        CAPTURED: 'Captured Portals',
        SCOUT: 'Scout Controlled Portals',
    }

    window.plugin.stdLayers.getLayerData = function (data) {
        if (data == null
            || data.portal == null
            || data.portal.options == null
            || data.portal.options.ent == null
            || data.portal.options.ent[2] == null
            || data.portal.options.ent[2][18] == null
        ) {
            return [false, false, false]
        }

        return (data.portal.options.ent[2][18])
            .toString(2)
            .padStart(3, 0)
            .split('')
            .map(it => it === '1')
    }

    window.plugin.stdLayers.highlight = function (data) {
        if (!Object.values(window.plugin.stdLayers.types).includes(_current_highlighter)) {
            return
        }
        var [scout, captured, visited] = window.plugin.stdLayers.getLayerData(data)

        var shouldHighlight = false
        switch (_current_highlighter) {
            case window.plugin.stdLayers.types.VISITED:
                shouldHighlight = visited
                break
            case window.plugin.stdLayers.types.CAPTURED:
                shouldHighlight = captured
                break
            case window.plugin.stdLayers.types.SCOUT:
                shouldHighlight = scout
                break
        }

        if (shouldHighlight) {
            data.portal.setStyle({
                color: 'hotpink',
                fill: true,
                fillColor: 'hotpink',
                fillOpacity: 1,
                radius: 10
            });
        }
    }

    function setup() {
        Object.values(window.plugin.stdLayers.types).forEach(function (type) {
            window.addPortalHighlighter(type, window.plugin.stdLayers.highlight);
        })
    }

    setup.info = plugin_info;
    if (!window.bootPlugins) window.bootPlugins = [];
    window.bootPlugins.push(setup);
    if (window.iitcLoaded && typeof setup === 'function') setup();
}

var script = document.createElement('script');
var info = {};

if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) {
    info.script = {
        version: GM_info.script.version,
        name: GM_info.script.name,
        description: GM_info.script.description
    };
}

var textContent = document.createTextNode('(' + wrapper + ')(' + JSON.stringify(info) + ')');
script.appendChild(textContent);
(document.body || document.head || document.documentElement).appendChild(script);
