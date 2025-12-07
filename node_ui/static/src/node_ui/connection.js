import { Component, useRef } from "@odoo/owl";
import { useBus } from "@web/core/utils/hooks";
import { useDraggable } from "@node_ui/node_ui/utils";

export class Path extends Component {
    static template = "node_ui.connection-path";
    static props = {
        path: Object,
    };
}

export class Waypoint extends Component {
    static template = "node_ui.connection-waypoint";
    static props = {
        waypoint: Object,
    };
}

export class Connection extends Component {
    static template = "node_ui.connection";
    static components = { Path, Waypoint };
    static props = {
        connection: Object
    };

    setup() {
        this.rootRef = useRef("root");

        useDraggable({
            ref: this.rootRef,
            elements: ".point",
            // @ts-ignore
            onWillStartDrag: ({ element: ctx, x, y}) => {
                const cnn = this.props.connection;
                const wp = cnn.waypoints.find(o => o.id == ctx.id);

                ctx.startX = wp.pos.centerX;
                ctx.startY = wp.pos.centerY;

                ctx.startPointerX = x;
                ctx.startPointerY = y;
            },
            onDrag: ({ element: ctx, x, y}) => {
                const deltaX = (x - ctx.startPointerX) / this.env.translation.zoom;
                const deltaY = (y - ctx.startPointerY) / this.env.translation.zoom;

                const wpX = (ctx.startX + deltaX);
                const wpY = (ctx.startY + deltaY);

                this.onMoveWaypoint(ctx.id, wpX, wpY);
            },

        });

        useBus(this.env.bus, this.env.channel + "/debug", this.onDebug.bind(this));
    }

    onMoveWaypoint(id, x, y){
        const cnn = this.props.connection;
        cnn.moveWaypoint(id, x, y);
    }

    _pointIsOnPath(pathEl, x, y) {
        const svg = this.rootRef.el;
        let point = svg.createSVGPoint();
        point.x = x;
        point.y = y;

        return pathEl.isPointInStroke(point);
    }

    _findPrecedingWaypoint(x, y){
        const cnn = this.props.connection;
        let onPath = false;
        for(let i = 0; i < cnn.paths.length; i++){
            const pathEl = this.rootRef.el.getElementById(cnn.paths[i].id);
            const onPath = this._pointIsOnPath(pathEl, x, y)
            if (onPath){
                const waypointIdx = cnn.waypoints.findIndex(o => o.endPathId == cnn.paths[i].id)
                return { idx: waypointIdx, onPath: onPath };
            }
        }
        return { idx: -1, onPath: onPath };
    }

    onClick(event) {
        if (event.ctrlKey){
            const cnn = this.props.connection;
            if (event.target.nodeName === "circle") {
                const waypoint = cnn.waypoints.find(o => o.id == event.target.id);
                if (waypoint){
                    cnn.removeWaypoint(waypoint);
                }
            } else if (event.target.nodeName === "path"){
                const path = cnn.paths.find(o => o.id == event.target.id);
                if (path){
                    const docElement = document.querySelector(".node-ui-doc");
                    const docRect = docElement.getBoundingClientRect();
                    const evX = event.clientX;
                    const evY = event.clientY;

                    const x = (evX - docRect.left) / this.env.translation.zoom;
                    const y = (evY - docRect.top) / this.env.translation.zoom;

                    const precedingWaypoint = this._findPrecedingWaypoint(x, y);

                    if (precedingWaypoint.onPath){
                        cnn.createWaypoint(path, x, y, precedingWaypoint.idx);
                    }
                }
            }
        } else {
            this.env.bus.trigger(this.env.channel + "/selected", {
                id: this.props.connection.id,
                type: "connection"
            });
        }
    }

    onDebug(ev){
        console.log("debug");
    }
}
