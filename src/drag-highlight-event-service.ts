import { AppElement } from "./app-element";

export class HighlightService {
    private highlightBackdrop: HTMLDivElement;
    
    constructor (
        private appElement: AppElement
    ) {
        this.highlightBackdrop = document.createElement("div");
        this.highlightBackdrop.classList.add("highlight-backdrop");
        this.highlightBackdrop.style.position = "absolute";
        this.highlightBackdrop.style.top = "0";
        this.highlightBackdrop.style.left = "0";
        this.highlightBackdrop.style.width = "100%";
        this.highlightBackdrop.style.height = "100%";
        this.highlightBackdrop.style.zIndex = "1";
        this.appElement.container.append(this.highlightBackdrop);
        this.highlightBackdrop.addEventListener("pointerdown", (event: PointerEvent) => {this.onPointerDown(event)});
    }

    private onPointerDown (event: PointerEvent) { 
        event.preventDefault();
        const x = event.offsetX;
        const y = event.offsetY;

        const div = document.createElement("div");
        div.style.position = "absolute";
        div.style.width = "0";
        div.style.height = "0";
        div.style.left = x + "px";
        div.style.top = y + "px";
        div.style.border = "1px solid orange";
        this.appElement.container.append(div);

        const resize = (event: PointerEvent) => {
            const diffX = event.offsetX - x;
            const diffY = event.offsetY - y;
            div.style.left = diffX < 0 ? x + diffX + "px" : x + "px";
            div.style.top = diffY < 0 ? y + diffY + "px" : y + "px";
            div.style.height = Math.abs(diffY) + "px";
            div.style.width = Math.abs(diffX) + "px";
            this.checkSelected(div); // extra line 1
        }
        this.highlightBackdrop.addEventListener("pointermove", resize);
        this.highlightBackdrop.addEventListener("pointerup", () => {
            this.highlightBackdrop.removeEventListener("pointermove", resize);
            div.remove();
            this.appElement.interactiveArrayElements.forEach(interactiveArrayElement => {
                if (interactiveArrayElement.highlighted) {
                    interactiveArrayElement.selected = true;
                    interactiveArrayElement.highlighted = false;
                }
            });
        });
    }

    private checkRectIntersection(r1: {x: number, y: number, height: number, width: number}, r2: DOMRect) {    // stackoverflow.com/a/13390495
        return !(r1.x + r1.width  < r2.x ||
                r2.x + r2.width  < r1.x ||
                r1.y + r1.height < r2.y ||
                r2.y + r2.height < r1.y);
    }

    private checkSelected(selectAreaElem: HTMLDivElement) {
        const select = selectAreaElem.getBoundingClientRect();
        const {x, y, height, width} = select;
        for (const interactiveArrayElement of this.appElement.interactiveArrayElements) {
            if (this.checkRectIntersection({x: x + window.scrollX, y: y + window.scrollY, height, width}, interactiveArrayElement.getBoundingClientRect())){
                interactiveArrayElement.highlighted = true;
            } else {
                interactiveArrayElement.highlighted = false;
            }
        }
    }

}