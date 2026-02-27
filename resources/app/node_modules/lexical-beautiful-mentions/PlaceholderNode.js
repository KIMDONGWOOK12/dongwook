import { $applyNodeReplacement, ElementNode, } from "lexical";
/* eslint @typescript-eslint/no-unused-vars: "off" */
export class PlaceholderNode extends ElementNode {
    static getType() {
        return "placeholder";
    }
    static clone(node) {
        return new PlaceholderNode(node.__textContent, node.__key);
    }
    constructor(__textContent, key) {
        super(key);
        this.__textContent = __textContent;
    }
    createDOM(_) {
        const element = document.createElement("img");
        element.style.display = "inline";
        element.style.border = "none";
        element.style.margin = "0";
        element.style.height = "1px";
        element.style.width = "1px";
        return element;
    }
    updateDOM() {
        return false;
    }
    static importDOM() {
        return null;
    }
    static importJSON(_) {
        return $createPlaceholderNode();
    }
    isInline() {
        return true;
    }
    exportJSON() {
        return Object.assign(Object.assign({}, super.exportJSON()), { type: "placeholder" });
    }
    getTextContent() {
        return "";
    }
}
export function $createPlaceholderNode(textContent = "") {
    const placeholderNode = new PlaceholderNode(textContent);
    return $applyNodeReplacement(placeholderNode);
}
export function $isPlaceholderNode(node) {
    return node instanceof PlaceholderNode;
}
