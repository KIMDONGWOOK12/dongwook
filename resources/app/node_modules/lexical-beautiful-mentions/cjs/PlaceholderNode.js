"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaceholderNode = void 0;
exports.$createPlaceholderNode = $createPlaceholderNode;
exports.$isPlaceholderNode = $isPlaceholderNode;
const lexical_1 = require("lexical");
/* eslint @typescript-eslint/no-unused-vars: "off" */
class PlaceholderNode extends lexical_1.ElementNode {
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
exports.PlaceholderNode = PlaceholderNode;
function $createPlaceholderNode(textContent = "") {
    const placeholderNode = new PlaceholderNode(textContent);
    return (0, lexical_1.$applyNodeReplacement)(placeholderNode);
}
function $isPlaceholderNode(node) {
    return node instanceof PlaceholderNode;
}
