// ==UserScript==
// @author MerlierR
// @id iitc-standard-layers@MerlierR
// @name IITC Plugin: Standard Intel Layers
// @category Highlighter
// @version 0.0.2
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
    if (typeof window.plugin !== 'function') {
        window.plugin = function () {
        };
    }

    plugin_info.buildName = 'iitc-standard-layers';
    plugin_info.dateTimeVersion = '20210531154500';
    plugin_info.pluginId = 'iitc-standard-layers';

    /**
     * Plugin content
     * Layer data should be in `data.portal.options.ent[2][18]`
     * The data is a bitmask:
     * - bit 0: visited
     * - bit 1: captured
     * - bit 2: scout controlled
     */

    window.plugin.stdLayers = (ns => {
        ns.ENABLED = true
        ns.HIGHLIGHT_STYLE = {
            fill: true,
            fillColor: 'red',
            fillOpacity: 1,
        }

        ns.types = {
            VISITED: 'std - Visited',
            NOT_VISITED: 'std - Visited (inverse)',
            CAPTURED: 'std - Captured',
            NOT_CAPTURED: 'std - Captured (inverse)',
            SCOUT: 'std - Scout Controlled',
            NOT_SCOUT: 'std - Scout Controlled (inverse)',
        }

        ns.typeVisitor = {
            [ns.types.VISITED]: ([, , visited]) => visited,
            [ns.types.NOT_VISITED]: ([, , visited]) => !visited,
            [ns.types.CAPTURED]: ([, captured,]) => captured,
            [ns.types.NOT_CAPTURED]: ([, captured,]) => !captured,
            [ns.types.SCOUT]: ([scout, ,]) => scout,
            [ns.types.NOT_SCOUT]: ([scout, ,]) => !scout,
        }

        ns.getLayerData = data => {
            if (data == null
                || data.portal == null
                || data.portal.options == null) {
                return null
            }
            if (data.portal.options.ent == null
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

        ns.highlight = data => {
            if (!ns.ENABLED) {
                return
            }
            var layerData = ns.getLayerData(data)

            if (layerData == null) {
                return
            }

            if (ns.typeVisitor[window._current_highlighter](layerData)) {
                data.portal.setStyle(ns.HIGHLIGHT_STYLE);
            }
        }

        ns.checkHighlightEnabled = data => {
            // stock intel only sends the layer data when zoomed in to show all portals
            ns.ENABLED = data.minPortalLevel === 0
        }

        ns.setup = () => {
            window.addHook('mapDataRefreshStart', ns.checkHighlightEnabled)
            Object.values(ns.types).forEach(function (type) {
                window.addPortalHighlighter(type, ns);
            })
        }

        return ns
    })({})

    function setup() {
        window.plugin.stdLayers.setup()
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
