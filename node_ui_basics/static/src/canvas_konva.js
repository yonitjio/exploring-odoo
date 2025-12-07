import { Component, useRef, useState, onWillStart, onMounted } from "@odoo/owl";
import { registry } from "@web/core/registry";

import { standardActionServiceProps } from "@web/webclient/actions/action_service";

class CanvasKonva extends Component {
    static template = "canvas-konva";
    static components = {};
    static props = {
        ...standardActionServiceProps,
    };

    setup() {
        this.konvaRef = useRef("konva");

        onWillStart(async () => {
            await import("/node_ui_basics/static/lib/konva.js");
        });

        onMounted(() => {
            var width = window.innerWidth;
            var height = window.innerHeight;

            // function to build anchor point
            function buildAnchor(x, y) {
                var anchor = new Konva.Circle({
                    x: x,
                    y: y,
                    radius: 6,
                    stroke: "grey",
                    fill: "#b58900",
                    strokeWidth: 2,
                    draggable: true,
                });
                layer.add(anchor);

                // add hover styling
                anchor.on("mouseover", function () {
                    document.body.style.cursor = "pointer";
                    this.strokeWidth(4);
                });
                anchor.on("mouseout", function () {
                    document.body.style.cursor = "default";
                    this.strokeWidth(2);
                });

                anchor.on("dragmove", function () {
                    updateDottedLines();
                });

                return anchor;
            }

            var stage = new Konva.Stage({
                container: "konva-container",
                width: width,
                height: height,
            });

            var layer = new Konva.Layer();
            stage.add(layer);

            // function to update line points from anchors
            function updateDottedLines() {
                var q = quad;
                var b = bezier;

                var quadLinePath = layer.findOne("#quadLinePath");
                var bezierLinePath = layer.findOne("#bezierLinePath");

                quadLinePath.points([
                    q.start.x(),
                    q.start.y(),
                    q.control.x(),
                    q.control.y(),
                    q.end.x(),
                    q.end.y(),
                ]);

                bezierLinePath.points([
                    b.start.x(),
                    b.start.y(),
                    b.control1.x(),
                    b.control1.y(),
                    b.control2.x(),
                    b.control2.y(),
                    b.end.x(),
                    b.end.y(),
                ]);
            }

            // we will use custom shape for curve
            var quadraticLine = new Konva.Shape({
                stroke: "pink",
                strokeWidth: 4,
                sceneFunc: (ctx, shape) => {
                    ctx.beginPath();
                    ctx.moveTo(quad.start.x(), quad.start.y());
                    ctx.quadraticCurveTo(
                        quad.control.x(),
                        quad.control.y(),
                        quad.end.x(),
                        quad.end.y()
                    );
                    ctx.fillStrokeShape(shape);
                },
            });
            layer.add(quadraticLine);

            // we will use custom shape for curve
            var bezierLine = new Konva.Shape({
                stroke: "#b58900",
                strokeWidth: 5,
                sceneFunc: (ctx, shape) => {
                    ctx.beginPath();
                    ctx.moveTo(bezier.start.x(), bezier.start.y());
                    ctx.bezierCurveTo(
                        bezier.control1.x(),
                        bezier.control1.y(),
                        bezier.control2.x(),
                        bezier.control2.y(),
                        bezier.end.x(),
                        bezier.end.y()
                    );
                    ctx.fillStrokeShape(shape);
                },
            });
            layer.add(bezierLine);

            var quadLinePath = new Konva.Line({
                dash: [10, 10, 0, 10],
                strokeWidth: 3,
                stroke: "grey",
                lineCap: "round",
                id: "quadLinePath",
                opacity: 0.3,
                points: [0, 0],
            });
            layer.add(quadLinePath);

            var bezierLinePath = new Konva.Line({
                dash: [10, 10, 0, 10],
                strokeWidth: 3,
                stroke: "grey",
                lineCap: "round",
                id: "bezierLinePath",
                opacity: 0.3,
                points: [0, 0],
            });
            layer.add(bezierLinePath);

            // special objects to save references to anchors
            var quad = {
                start: buildAnchor(60, 30),
                control: buildAnchor(240, 500),
                end: buildAnchor(100, 600),
            };

            var bezier = {
                start: buildAnchor(280, 20),
                control1: buildAnchor(530, 500),
                control2: buildAnchor(1250, 150),
                end: buildAnchor(1580, 600),
            };

            updateDottedLines();
        });
    }
}

registry.category("actions").add("canvas_konva", CanvasKonva);
