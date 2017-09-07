HTMLWidgets.widget(global = {
    name: "forceGraph",
    type: "output",
    store: {},

    defaultConfig: {
        pause: false,
        distance: 400,
        strength: 0.05,

        title: "",
        titleSize: 22,
        legendTitle: "",

        label: "id",
        labelColor: "#000000",  // black
        labelOpacity: 0.8,
        labelScale: 1,

        nodeScale: 1,
        nodeScheme: "linear2",
        nodeShape: "circle",
        nodeBorderColor: "#808080", // grey
        nodeBorderOpacity: 1,
        nodeBorderWidth: 1,

        edgeScale: 1,
        edgeColor: "#808080",  // grey
        edgeOpacity: 0.6,

        naOpacicy: 0.6,
        naWidth: 0.1,

        palettes: {
            linear2: { domain: [-1, 1], range: ["#FF0000", "#FFDEE2"] },
            linear3: { domain: [-1, 0, 1], range: ["#4833FF", "#FFFFFF", "#FF0000"] },
            dual: { domain: [0, 0.05], range: ["#FF0000", "#FFDEE2"] },
            dualPos: { domain: [0, 0.05], range: ["#FF0000", "#FFDEE2"] },
            dualNeg: { domain: [0, 0.05], range: ["#4833FF", "#CAD3FF"] },
        },
        scalers: {
            wrapper: function(schemeId, color, scheme) {
                if(color == null) {
                    return "rgba(255,255,255,0.6)"
                }
                if(schemeId == "dual") {
                    return this[schemeId+scheme](color);
                } else {
                    return this[schemeId](color);
                }
            }
            //generated from palettes in getCurrentConfig.
        },
        shaper : {
            circle: function(context, d) {
                context.moveTo(d.x + d.vsize, d.y);
                context.arc(d.x, d.y, d.vsize, 0, 2 * Math.PI);
            },
            triangle: function(context, d) {
                context.moveTo(d.x, d.y - d.vsize * 1.15);
                context.lineTo(d.x + d.vsize, d.y + d.vsize * 0.577);
                context.lineTo(d.x - d.vsize, d.y + d.vsize * 0.577);
                context.lineTo(d.x, d.y - d.vsize * 1.15);
            },
            rectangle: function(context, d) {
                context.moveTo(d.x - d.vsize, d.y - d.vsize);
                context.lineTo(d.x + d.vsize, d.y - d.vsize);
                context.lineTo(d.x + d.vsize, d.y + d.vsize);
                context.lineTo(d.x - d.vsize, d.y + d.vsize);
                context.lineTo(d.x - d.vsize, d.y - d.vsize);
            },
            diamond: function(context, d) {
                context.moveTo(d.x, d.y - d.vsize);
                context.lineTo(d.x + d.vsize, d.y);
                context.lineTo(d.x, d.y + d.vsize);
                context.lineTo(d.x - d.vsize, d.y);
                context.lineTo(d.x, d.y - d.vsize);
            }
        },
        rgba: {},
        labelFont: "14px Arial" // for display
    },

    getElementState: function(el) {
        var elId = el.id;
        if (!(elId in global.store)) {
            global.store[elId] = {elId: elId, controller: {}, ratio: 1, padding: [100, 60, 40, 40]};
        }
        return global.store[elId];
    },

    getCurrentConfig: function(state, x) {
        if(x) { state.currentKey = JSON.stringify(x).hashCode().toString(); }

        if(!(state.currentKey in state)) {
            // Default configuration
            state[state.currentKey] = $.extend({}, global.defaultConfig);
            var config = state[state.currentKey];
            // Load X
            var options = x.options;
            var keys = ["distance", "seriesData",
                "title","titleSize","legendTitle",
                "edgeScale","edgeColor","edgeOpacity",
                "label","labelColor","labelOpacity","labelScale",
                "nodeScale","nodeScheme","nodeShape","nodeBorderColor","nodeBorderWidth","nodeBorderOpacity"]

            for(var i in keys) {
                var key = keys[i]
                if(options.hasOwnProperty(key)) {
                    config[key] = options[key];
                }
            }

            if(options.hasOwnProperty("colorDomain")) {
                var dom = options["colorDomain"];
                for (var scheme in config.palettes) {
                    config.palettes[scheme].domain = dom.slice();
                }
                config.palettes.linear3.domain.splice(1, 0, (dom[0] + dom[1])/2);
            }

            config.labelFont = 14 * config.labelScale * state.ratio + "px Arial";

            global.generateColorScalers(config);
            global.generateRGBAColors(config);
        }

        return state[state.currentKey];
    },

    generateColorScalers: function(config) {
        for (var scheme in config.palettes) {
            var palette = config.palettes[scheme];
            config.scalers[scheme] = d3.scaleLinear()
                .domain(palette.domain)
                .range(palette.range)
                .interpolate(d3.interpolateCubehelix.gamma(3.0));
        }
    },

    generateRGBAColors: function(config) {
        function hexToRGBA(hex, alpha){
            var c;
            if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
                c= hex.substring(1).split('');
                if(c.length== 3){
                    c= [c[0], c[0], c[1], c[1], c[2], c[2]];
                }
                c= '0x'+c.join('');
                return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',' + alpha + ')';
            }
        }
        config.rgba.edge = hexToRGBA(config.edgeColor, config.edgeOpacity);
        config.rgba.label = hexToRGBA(config.labelColor, config.labelOpacity);
        config.rgba.node = hexToRGBA(config.nodeBorderColor, config.nodeBorderOpacity);
    },

    partition: function(config, links, size, key) {
        var result = {};
        var values = [];
        links.forEach(function(d) {if (d[key] != null) values.push(d[key]) });
        var min = Math.min.apply(null, values);
        var max = Math.max.apply(null, values) + 0.001;
        var step = (max - min) / size;
        var naWidth = "" + config.naWidth;
        result[naWidth] = [];
        for (var val = min; val <= max; val += step) { result["" + val.toFixed(2)] = [] }

        for (var idx in links) {
            if(links[idx][key] == null) {
                result[naWidth].push(links[idx]);
            } else {
                var k = Math.floor((links[idx][key] - min) / step)
                result["" + (min + k * step).toFixed(2)].push(links[idx]);
            }
        }
        return result;
    },

    initialize: function(el, width, height) {
        // console.log("====================   initialize   ========================");
        el.style.height = "90vh";
        var state = global.getElementState(el);
        var padding = state.padding;

        var ratio = window.devicePixelRatio || 1;
        var size = {width: el.offsetWidth * ratio, height: el.offsetHeight * ratio};
        size.boundary = [padding[0], size.width - padding[1], size.height - padding[2], padding[3]];
        $.extend(state, size);

        var canvas = d3.select(el).append("canvas");
        var simulation = d3.forceSimulation()
            .force("charge", d3.forceManyBody())
            .force("x", d3.forceX())
            .force("y", d3.forceY())
            .force("center", d3.forceCenter(state.width / 2, state.height / 2));
        $.extend(state, { canvas: canvas, simulation: simulation, ratio: ratio});

        return simulation;
    },


    resize: function(el, width, height, simulation) {
        // console.log("====================   resize   ========================");

        var state = global.getElementState(el);
        var canvas = state.canvas;
        var padding = state.padding;

        state.ratio = window.devicePixelRatio || 1;
        var size = {width: el.offsetWidth * state.ratio, height: el.offsetHeight * state.ratio};
        size.boundary = [padding[0], size.width - padding[1], size.height - padding[2], padding[3]];
        $.extend(state, size);

        canvas.attr('width', state.width).attr('height', state.height);
        canvas.style('transform', "scale(" + 1.0 / state.ratio + ")").style('transform-origin', "left top 0px");

        simulation.force("center", d3.forceCenter(state.width / 2, state.height / 2));
        simulation.alphaTarget(0).restart();
    },


    renderValue: function(el, x, simulation) {
        // console.log("====================   renderValue   ========================");
        // console.log(el);
        // console.log(x);
        // console.log("=============================================================");

        var state = global.getElementState(el);

        if (x.update) {
            global.update(state, x);
        } else {
            var config = global.getCurrentConfig(state, x);
            global.construct(state, config, x);
        }
    },


    construct: function(state, config, x) {
        // console.log("======================   construct   ========================");
        // console.log(state);
        // console.log(config);
        // console.log("=============================================================");

        var canvas = state.canvas;
        var simulation = state.simulation;
        var context = canvas.node().getContext("2d");

        canvas.attr('width', state.width).attr('height', state.height * state.ratio);
        canvas.style('transform', "scale(" + 1.0 / state.ratio + ")").style('transform-origin', "left top 0px");

        var nodes = HTMLWidgets.dataframeToD3(x.nodes);
        var links = HTMLWidgets.dataframeToD3(x.links);

        for(idx in nodes) {
            nodes[idx].vsize = config.nodeScale * nodes[idx].size * state.ratio;
            nodes[idx].fill = config.scalers.wrapper(config.nodeScheme, nodes[idx].color, nodes[idx].scheme);
        }

        // var naLinks = links.filter(function(d){return d.weight == null});
        // var trLinks = links.filter(function(d){return d.weight != null});
        config.parLinks = global.partition(config, links, 5, "weight");

        simulation.alphaTarget(0.3).restart();
        simulation.nodes(nodes);
        simulation.force("link", d3.forceLink(links).distance(config.distance * state.ratio).strength(config.strength).id(function(d) {return d.id;}));
        simulation.on("tick", ticked);

        canvas.call(d3.drag()
            .container(canvas.node())
            .subject(dragsubject)
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));


        function ticked() {
            context.clearRect(0, 0, state.width, state.height);
            context.save();

            context.strokeStyle = config.rgba['edge'];

            // context.beginPath();
            // context.lineWidth = config.naWidth * state.ratio;
            // naLinks.forEach(drawLink);
            // context.stroke();

            // context.beginPath();
            // context.lineWidth = config.edgeScale * state.ratio;
            // trLinks.forEach(drawLink);
            // context.stroke();

            for(var w in config.parLinks) {
                context.beginPath();
                context.lineWidth = w * config.edgeScale * state.ratio;
                config.parLinks[w].forEach(drawLink);
                context.stroke();
            }

            context.font = config.labelFont;
            context.lineWidth = config.nodeBorderWidth * state.ratio;
            context.strokeStyle = config.rgba['node'];
            context.textBaseline="middle";
            nodes.forEach(drawNode);

            drawTitleAndLegend();
            context.restore();
        }


        function drawLink(d) {
            context.moveTo(d.source.x, d.source.y);
            context.lineTo(d.target.x, d.target.y);
        }


        function drawNode(d) {
            var dx = d.x < state.boundary[3] ? state.boundary[3] : (d.x > state.boundary[1] ? state.boundary[1] : d.x);
            var dy = d.y < state.boundary[0] ? state.boundary[0] : (d.y > state.boundary[2] ? state.boundary[2] : d.y);

            context.beginPath();

            config.shaper[config.nodeShape](context, d);

            context.fillStyle = d.fill;
            context.fill();
            context.stroke();

            context.fillStyle = config.rgba['label'];
            context.fillText(d.label, d.x + d.vsize + 2, d.y);
        }


        function dragsubject() {
            return simulation.find(d3.event.x * state.ratio, d3.event.y * state.ratio, 20);
        }


        function dragstarted() {
            if (!d3.event.active) simulation.alphaTarget(0.2).restart();
            d3.event.subject.fx = d3.event.subject.x;
            d3.event.subject.fy = d3.event.subject.y;
        }

        function dragged() {
            coordinates = d3.mouse(this);
            fx = coordinates[0] * state.ratio;
            fy = coordinates[1] * state.ratio;
            d3.event.subject.fx = fx < state.boundary[3] ? state.boundary[3] : (fx > state.boundary[1] ? state.boundary[1] : fx );
            d3.event.subject.fy = fy < state.boundary[0] ? state.boundary[0] : (fy > state.boundary[2] ? state.boundary[2] : fy );
        }

        function dragended() {
            if (!d3.event.active) simulation.alphaTarget(0);
            d3.event.subject.fx = null;
            d3.event.subject.fy = null;
        }

        function drawTitleAndLegend() {
            // Draw Title
            context.textAlign="center";
            context.font = config.titleSize * state.ratio + "px Arial";
            context.fillText(config.title ,state.width / 2, 60);

            // Draw Legend
        }

        global.generateControllers(state);
        configureSettingPanel(state);
    },

    update: function(state, x) {
        var simulation = state.simulation;
        var config = state[state.currentKey];
        var series = config.seriesData;
        if(series == null) {
            return;
        }

        if ('process_map' in x) {
            var index = JSON.parse(x.process_map) - 1;
            var nodes = simulation.nodes();
            for(idx in nodes) {
                nodes[idx].color = nodes[idx]['color.' + series[index]];
                nodes[idx].scheme = nodes[idx]['scheme.' + series[index]];
                nodes[idx].fill = config.scalers.wrapper(config.nodeScheme, nodes[idx].color, nodes[idx].scheme);
            }

            var links = simulation.force("link").links();
            for(idx in links) {
                links[idx].weight = links[idx]['weight.' + series[index]];
            }
            config.parLinks = global.partition(config, links, 5, "weight");
            simulation.alphaTarget(0.3).restart();
        }

        if ('process_net' in x) {
            var index = JSON.parse(x.process_net) - 1;
            var nodes = simulation.nodes();
            for(idx in nodes) {
                nodes[idx].color = nodes[idx]['color.' + series[index]];
                nodes[idx].fill = config.scalers.wrapper(config.nodeScheme, nodes[idx].color, nodes[idx].scheme);
            }

            var links = simulation.force("link").links();
            for(idx in links) {
                links[idx].weight = links[idx]['weight.' + series[index]];
            }
            config.parLinks = global.partition(config, links, 1, "weight");
            simulation.alphaTarget(0.3).restart();
        }

    },

    generateControllers: function(state) {
        var simulation = state.simulation;
        var config = state[state.currentKey];

        state.controller.refresh = function() {
            simulation.alphaTarget(0.3).restart();
        }

        // General
        state.controller.title = function(val) {
            config.title = val;
        }

        state.controller.titleSize = function(val) {
            config.titleSize = val;
        }

        state.controller.legendTitle = function(val) {
            config.legendTitle = val;
        }

        state.controller.distance = function(val) {
            config.distance = val;
            simulation.force("link").distance(config.distance * state.ratio);
        }

        //Label
        state.controller.labelOption = function(type) {
            // type == id, term, none
            config.label = type;
            var nodes = simulation.nodes();
            for(idx in nodes) {
                nodes[idx].label = config.label == 'none'? "" : nodes[idx]["label_" + config.label];
            }
        }

        state.controller.labelColor = function(color) {
            config.labelColor = color;
            global.generateRGBAColors(config);
        }

        state.controller.labelOpacity = function(val) {
            config.labelOpacity = val;
            global.generateRGBAColors(config);
        }

        state.controller.labelScale = function(val) {
            config.labelScale = val;
            config.labelFont = 14 * config.labelScale * state.ratio + "px Arial";
        }

        // Node
        state.controller.nodeShape = function(shape) {
            // shape == circle, triangle, rectangle, diamond
            config.nodeShape = shape;
        }

        state.controller.nodeScale = function(val) {
            config.nodeScale = val;
            var nodes = simulation.nodes();
            for(idx in nodes) {
                nodes[idx].vsize = config.nodeScale * nodes[idx].size * state.ratio;
            }
        }

        state.controller.nodeScheme = function(schemeId) {
            // scheme: "linear2", "linear3", "dual"
            config.nodeScheme = schemeId;
            var nodes = simulation.nodes();
            for(idx in nodes) {
                nodes[idx].fill = config.scalers.wrapper(config.nodeScheme, nodes[idx].color, nodes[idx].scheme);
            }
            // global.drawLegend(state);
        }

        state.controller.nodeBorderColor = function(color) {
            config.nodeBorderColor = color;
            global.generateRGBAColors(config);
        }

        state.controller.nodeBorderOpacity = function(val) {
            config.nodeBorderOpacity = val;
            global.generateRGBAColors(config);
        }

        state.controller.nodeBorderWidth = function(val) {
            config.nodeBorderWidth = val;
        }


        // Edge
        state.controller.edgeColor = function(color) {
            config.edgeColor = color;
            global.generateRGBAColors(config);

        }

        state.controller.edgeOpacity = function(val) {
            config.edgeOpacity = val;
            global.generateRGBAColors(config);
        }

        state.controller.edgeScale = function(val) {
            config.edgeScale = val;
        }

        //Schemes
        state.controller.changeScheme = function(schemeId, domain, range) {
            // schemeId: "linear2", "linear3", "dualPos", "dualNeg"
            var palette = { domain: domain, range: range };
            config.palettes[schemeId] = palette;
            var scaler = config.scalers[schemeId];
            scaler.domain(palette.domain).range(palette.range);
            scaler['dual'] = scaler['dualPos'];

            if (schemeId.startsWith(config.nodeScheme)) {
                state.controller.nodeScheme(config.nodeScheme);
            }
        }

        // BorderButtons
        state.controller.pause = function() {
            // TODO
            console.log("Pause clicked.")
        }

        state.controller.saveImg = function() {
            var canvas = state.canvas.node();
            var dt = canvas.toDataURL('image/png');
            var tmpLink = document.createElement("a");
            tmpLink.href = dt;
            tmpLink.download = "network.png";
            document.body.appendChild(tmpLink);
            tmpLink.click();
            document.body.removeChild(tmpLink);
        }
    }

});
