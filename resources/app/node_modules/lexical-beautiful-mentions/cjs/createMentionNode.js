"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomBeautifulMentionNode = void 0;
exports.setCustomBeautifulMentionNode = setCustomBeautifulMentionNode;
exports.createBeautifulMentionNode = createBeautifulMentionNode;
const MentionNode_1 = require("./MentionNode");
function setCustomBeautifulMentionNode(BeautifulMentionNodeClass) {
    exports.CustomBeautifulMentionNode = BeautifulMentionNodeClass;
}
/**
 * Instead of using the default `BeautifulMentionNode` class, you can
 * extend it and use the mention component of your choice.
 */
function createBeautifulMentionNode(mentionComponent) {
    exports.CustomBeautifulMentionNode =
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        exports.CustomBeautifulMentionNode || generateClass(mentionComponent);
    return [
        exports.CustomBeautifulMentionNode,
        {
            replace: MentionNode_1.BeautifulMentionNode,
            with: (node) => {
                return new exports.CustomBeautifulMentionNode(node.getTrigger(), node.getValue(), node.getData());
            },
            withKlass: exports.CustomBeautifulMentionNode
        },
    ];
}
function generateClass(mentionComponent) {
    return class CustomBeautifulMentionNode extends MentionNode_1.BeautifulMentionNode {
        static getType() {
            return "custom-beautifulMention";
        }
        static clone(node) {
            return new CustomBeautifulMentionNode(node.__trigger, node.__value, node.__data, node.__key);
        }
        static importJSON(serializedNode) {
            return new CustomBeautifulMentionNode(serializedNode.trigger, serializedNode.value, serializedNode.data);
        }
        exportJSON() {
            const data = this.__data;
            return Object.assign(Object.assign({ trigger: this.__trigger, value: this.__value }, (data ? { data } : {})), { type: "custom-beautifulMention", version: 1 });
        }
        component() {
            return mentionComponent;
        }
        decorate(editor, config) {
            return super.decorate(editor, config);
        }
    };
}
