import { Component, useRef, onMounted } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { standardActionServiceProps } from "@web/webclient/actions/action_service";

class CanvasBasics extends Component {
    static template = "canvas-basics";
    static components = { };
    static props = {
        ...standardActionServiceProps
    };

    setup() {
        this.canvasRef = useRef("interactive-canvas");

        this.state = {
            startX: 100,
            startY: 50,
            endX: 1550,
            endY: 150,
            controlX: 700,
            controlY: 300,
        };

        onMounted(() => {
            this._drawShapes();

            this.canvasRef.el.width = this.canvasRef.el.parentElement.offsetWidth;
            this.canvasRef.el.height = this.canvasRef.el.parentElement.offsetHeight;

            this._drawInteractiveCanvas();
        })

        this.dragging = undefined;
    }

    onMouseDown(event){
        event.preventDefault();
        event.stopPropagation();

        const cRect = this.canvasRef.el.getBoundingClientRect();
        const ctx = this.canvasRef.el.getContext("2d");

        const x = event.clientX - cRect.left;
        const y = event.clientY - cRect.top;

        if (ctx.isPointInPath(this.startPoint, x, y)){
            this.dragging = this.startPoint;
        } else if (ctx.isPointInPath(this.endPoint, x, y)){
            this.dragging = this.endPoint;
        } else if (ctx.isPointInPath(this.controlPoint, x, y)){
            this.dragging = this.controlPoint;
        } else {
            this.dragging = undefined;
        }
    }

    onMouseUp(event){
        this.dragging = undefined;
    }

    onMouseMove(event){
        if (!this.dragging){
            const cRect = this.canvasRef.el.getBoundingClientRect();
            const ctx = this.canvasRef.el.getContext("2d");

            const x = event.clientX - cRect.left;
            const y = event.clientY - cRect.top;

            if (ctx.isPointInPath(this.startPoint, x, y)){
                document.body.style.cursor = "pointer";
            } else if (ctx.isPointInPath(this.endPoint, x, y)){
                document.body.style.cursor = "pointer";
            } else if (ctx.isPointInPath(this.controlPoint, x, y)){
                document.body.style.cursor = "pointer";
            } else {
                document.body.style.cursor = "auto";
            }
        }else if (this.dragging){
            const cRect = this.canvasRef.el.getBoundingClientRect();
            const el = this.dragging;
            if (event.x > cRect.left + 5 && event.y > cRect.top + 5
                && event.x < cRect.right - 20 && event.y < cRect.bottom - 20){
                let dragging;
                if(el == this.startPoint){
                    this.state.startX += event.movementX;
                    this.state.startY += event.movementY;
                    dragging = "s";
                } else if (el == this.endPoint){
                    this.state.endX += event.movementX;
                    this.state.endY += event.movementY;
                    dragging = "e";
                } else if (el == this.controlPoint){
                    this.state.controlX += event.movementX;
                    this.state.controlY += event.movementY;
                    dragging = "c"
                } else {
                    return;
                }
                this._drawInteractiveCanvas();
                if (dragging === "s") {
                    this.dragging = this.startPoint;
                } else if (dragging === "e"){
                    this.dragging = this.endPoint;
                } else if (dragging === "c"){
                    this.dragging = this.controlPoint;
                }
            }
        }
    }

    _drawInteractiveCanvas(){
        let ctx = this.canvasRef.el.getContext("2d");

        this.startPoint = new Path2D();
        this.endPoint = new Path2D();
        this.controlPoint = new Path2D();
        this.mainPath = new Path2D();
        this.controlPath = new Path2D();

        ctx.clearRect(0, 0, this.canvasRef.el.width, this.canvasRef.el.height);
        ctx.beginPath();

        ctx.lineWidth = 3;
        ctx.fillStyle = "#b58900";

        let path = this.startPoint;
        path.arc(this.state.startX, this.state.startY, 6, 0, 2 * Math.PI);
        ctx.strokeStyle = "grey";
        ctx.fill(path);
        ctx.stroke(path);

        path = this.mainPath;
        path.moveTo(this.state.startX, this.state.startY);
        path.quadraticCurveTo(this.state.controlX, this.state.controlY, this.state.endX, this.state.endY);
        ctx.strokeStyle = "#b58900";
        ctx.stroke(path);

        path = this.endPoint;
        path.arc(this.state.endX, this.state.endY, 6, 0, 2 * Math.PI);
        ctx.strokeStyle = "grey";
        ctx.fill(path);
        ctx.stroke(path);

        path = this.controlPoint;
        path.arc(this.state.controlX, this.state.controlY, 6, 0, 2 * Math.PI);
        ctx.fill(path);
        ctx.stroke(path);

        path = this.controlPath;
        path.moveTo(this.state.startX, this.state.startY);
        path.lineTo(this.state.controlX, this.state.controlY);
        path.moveTo(this.state.controlX, this.state.controlY);
        path.lineTo(this.state.endX, this.state.endY);
        ctx.lineWidth = 1;
        ctx.stroke(path);
    }

    _drawShapes(){
        let cvs = document.getElementById("cvsRectangle");
        let ctx = cvs.getContext("2d");
        ctx.fillStyle = "#b58900";
        ctx.fillRect(20, 20, 260, 100);

        cvs = document.getElementById("cvsCircle");
        ctx = cvs.getContext("2d");
        ctx.beginPath();
        ctx.arc(150, 72.5, 50, 0, 2 * Math.PI);
        ctx.fillStyle = "#b58900";
        ctx.fill();
        ctx.strokeStyle = "grey";
        ctx.stroke();

        cvs = document.getElementById("cvsEllipse");
        ctx = cvs.getContext("2d");
        ctx.beginPath();
        ctx.ellipse(150, 72.5, 100, 50, 0, 0, 2 * Math.PI)
        ctx.fillStyle = "#b58900";
        ctx.fill();
        ctx.strokeStyle = "grey";
        ctx.stroke();

        cvs = document.getElementById("cvsLine");
        ctx = cvs.getContext("2d");
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(30, 62.5);
        ctx.lineTo(270, 62.5);
        ctx.moveTo(30, 72.5);
        ctx.lineTo(270, 72.5);
        ctx.moveTo(30, 82.5);
        ctx.lineTo(270, 82.5);
        ctx.strokeStyle = "#b58900";
        ctx.stroke();

        cvs = document.getElementById("cvsRoundRect");
        ctx = cvs.getContext("2d");
        ctx.beginPath();
        ctx.roundRect(20, 20, 260, 100, [10]);
        ctx.fillStyle = "#b58900";
        ctx.fill();
        ctx.strokeStyle = "grey";
        ctx.stroke();

        cvs = document.getElementById("cvsCubicCurve");
        ctx = cvs.getContext("2d");

        ctx.lineWidth = 4;

        let start = { x: 20, y: 20 };
        let cp1 = { x: 200, y: 50 };
        let cp2 = { x: 50, y: 80 };
        let end = { x: 270, y: 120 };

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
        ctx.strokeStyle = "#b58900";
        ctx.stroke();

        cvs = document.getElementById("cvsQuadraticCurve");
        ctx = cvs.getContext("2d");
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(20, 20);
        ctx.quadraticCurveTo(20, 120, 270, 120);
        ctx.strokeStyle = "#b58900";
        ctx.stroke();

        cvs = document.getElementById("cvsMiscShape");
        ctx = cvs.getContext("2d");
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(20, 20);
        ctx.lineTo(270, 20);
        ctx.lineTo(135, 120);
        ctx.closePath();
        ctx.strokeStyle = "#b58900";
        ctx.stroke();
    }
}

registry.category("actions").add("canvas_basics", CanvasBasics);
