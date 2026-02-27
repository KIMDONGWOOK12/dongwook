"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToMentionEntries = convertToMentionEntries;
exports.$convertToMentionNodes = $convertToMentionNodes;
exports.$transformTextToMentionNodes = $transformTextToMentionNodes;
const lexical_1 = require("lexical");
const MentionNode_1 = require("./MentionNode");
const mention_utils_1 = require("./mention-utils");
function findMentions(text, triggers, punctuation) {
    const regex = new RegExp("(?<=\\s|^|\\()" +
        (0, mention_utils_1.TRIGGERS)(triggers) +
        "((?:" +
        (0, mention_utils_1.VALID_CHARS)(triggers, punctuation) +
        "){1," +
        mention_utils_1.LENGTH_LIMIT +
        "})", "g");
    const matches = [];
    let match;
    regex.lastIndex = 0;
    while ((match = regex.exec(text)) !== null) {
        matches.push({
            value: match[0],
            index: match.index,
        });
    }
    return matches;
}
function convertToMentionEntries(text, triggers, punctuation) {
    const matches = findMentions(text, triggers, punctuation);
    const result = [];
    let lastIndex = 0;
    matches.forEach(({ value, index }) => {
        // Add text before mention
        if (index > lastIndex) {
            const textBeforeMention = text.substring(lastIndex, index);
            result.push({ type: "text", value: textBeforeMention });
        }
        // Add mention
        const triggerRegExp = triggers.find((trigger) => new RegExp(trigger).test(value));
        const match = triggerRegExp && new RegExp(triggerRegExp).exec(value);
        if (!match) {
            // should never happen since we only find mentions with the given triggers
            throw new Error("No trigger found for mention");
        }
        const trigger = match[0];
        result.push({
            type: "mention",
            value: value.substring(trigger.length),
            trigger,
        });
        // Update lastIndex
        lastIndex = index + value.length;
    });
    // Add text after last mention
    if (lastIndex < text.length) {
        const textAfterMentions = text.substring(lastIndex);
        result.push({ type: "text", value: textAfterMentions });
    }
    return result;
}
/**
 * Utility function that takes a string or a text nodes and converts it to a
 * list of mention and text nodes.
 *
 * 🚨 Only works for mentions without spaces. Ensure spaces are disabled
 *  via the `allowSpaces` prop.
 */
function $convertToMentionNodes(textOrNode, triggers, punctuation = mention_utils_1.DEFAULT_PUNCTUATION) {
    const text = typeof textOrNode === "string" ? textOrNode : textOrNode.getTextContent();
    const entries = convertToMentionEntries(text, triggers, punctuation);
    const nodes = [];
    for (const entry of entries) {
        if (entry.type === "text") {
            const textNode = (0, lexical_1.$createTextNode)(entry.value);
            if (typeof textOrNode !== "string") {
                textNode.setFormat(textOrNode.getFormat());
            }
            nodes.push(textNode);
        }
        else {
            nodes.push((0, MentionNode_1.$createBeautifulMentionNode)(entry.trigger, entry.value));
        }
    }
    return nodes;
}
/**
 * Transforms text nodes containing mention strings into mention nodes.
 *
 *  🚨 Only works for mentions without spaces. Ensure spaces are disabled
 *  via the `allowSpaces` prop.
 */
function $transformTextToMentionNodes(triggers, punctuation = mention_utils_1.DEFAULT_PUNCTUATION) {
    const root = (0, lexical_1.$getRoot)();
    const nodes = root.getChildren();
    const traverseNodes = (nodes) => {
        for (const node of nodes) {
            if ((0, lexical_1.$isTextNode)(node)) {
                const newNodes = $convertToMentionNodes(node, triggers, punctuation);
                if (newNodes.length > 1) {
                    const parent = node.getParent();
                    const index = node.getIndexWithinParent();
                    parent === null || parent === void 0 ? void 0 : parent.splice(index, 1, newNodes);
                }
            }
            else if ((0, lexical_1.$isElementNode)(node)) {
                traverseNodes(node.getChildren());
            }
        }
    };
    traverseNodes(nodes);
}
