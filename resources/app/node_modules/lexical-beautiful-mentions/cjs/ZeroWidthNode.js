"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZeroWidthNode = void 0;
exports.$createZeroWidthNode = $createZeroWidthNode;
exports.$isZeroWidthNode = $isZeroWidthNode;
const lexical_1 = require("lexical");
const ZeroWidthPlugin_1 = require("./ZeroWidthPlugin");
function convertZeroWidthElement(domNode) {
    return null;
}
/**
 * @deprecated Use `PlaceholderNode` instead. This Node will be removed in a future version.
 */
/* eslint @typescript-eslint/no-unused-vars: "off" */
/* eslint @typescript-eslint/no-deprecated: "off" */
class ZeroWidthNode extends lexical_1.TextNode {
    static getType() {
        return "zeroWidth";
    }
    static clone(node) {
        return new ZeroWidthNode(node.__textContent, node.__key);
    }
    static importJSON(_) {
        return $createZeroWidthNode();
    }
    constructor(__textContent, key) {
        super(ZeroWidthPlugin_1.ZERO_WIDTH_CHARACTER, key);
        this.__textContent = __textContent;
    }
    exportJSON() {
        return Object.assign(Object.assign({}, super.exportJSON()), { text: "", type: "zeroWidth" });
    }
    updateDOM() {
        return false;
    }
    static importDOM() {
        return null;
    }
    exportDOM(editor) {
        return { element: null };
    }
    isTextEntity() {
        return true;
    }
    getTextContent() {
        return this.__textContent;
    }
}
exports.ZeroWidthNode = ZeroWidthNode;
function $createZeroWidthNode(textContent = "") {
    const zeroWidthNode = new ZeroWidthNode(textContent);
    // Prevents that a space that is inserted by the user is deleted again
    // directly after the input.
    zeroWidthNode.setMode("segmented");
    return (0, lexical_1.$applyNodeReplacement)(zeroWidthNode);
}
function $isZeroWidthNode(node) {
    return node instanceof ZeroWidthNode;
}
