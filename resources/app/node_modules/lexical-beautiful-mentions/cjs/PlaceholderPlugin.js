"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaceholderPlugin = PlaceholderPlugin;
const LexicalComposerContext_1 = require("@lexical/react/LexicalComposerContext");
const utils_1 = require("@lexical/utils");
const lexical_1 = require("lexical");
const react_1 = require("react");
const PlaceholderNode_1 = require("./PlaceholderNode");
/**
 * This plugin serves as a patch to fix an incorrect cursor position in Safari.
 * {@link https://github.com/facebook/lexical/issues/4487}.
 * @deprecated This plugin is no longer needed and will be removed in a future release.
 */
function PlaceholderPlugin() {
    const [editor] = (0, LexicalComposerContext_1.useLexicalComposerContext)();
    (0, react_1.useEffect)(() => {
        if (!editor.hasNodes([PlaceholderNode_1.PlaceholderNode])) {
            throw new Error("BeautifulMentionsPlugin: PlaceholderNode not registered on editor");
        }
        return (0, utils_1.mergeRegister)(editor.registerUpdateListener(() => {
            editor.update(() => {
                // insert a placeholder node at the end of each paragraph if the
                // last node is a decorator node.
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                const placeholderNodes = (0, lexical_1.$nodesOfType)(PlaceholderNode_1.PlaceholderNode);
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                (0, lexical_1.$nodesOfType)(lexical_1.ParagraphNode).forEach((paragraph) => {
                    const paragraphPlaceholders = placeholderNodes.filter((p) => paragraph.isParentOf(p));
                    const lastNode = paragraph.getLastDescendant();
                    if ((0, lexical_1.$isDecoratorNode)(lastNode)) {
                        paragraphPlaceholders.forEach((p) => {
                            p.remove();
                        });
                        lastNode.insertAfter((0, PlaceholderNode_1.$createPlaceholderNode)());
                    }
                    else if ((0, PlaceholderNode_1.$isPlaceholderNode)(lastNode) &&
                        !(0, lexical_1.$isDecoratorNode)(lastNode.getPreviousSibling())) {
                        paragraphPlaceholders.forEach((p) => {
                            p.remove();
                        });
                    }
                });
            }, 
            // merge with previous history entry to allow undoing
            { tag: "history-merge" });
        }), editor.registerCommand(lexical_1.KEY_DOWN_COMMAND, (event) => {
            // prevent unnecessary removal of the placeholder nodes, since this
            // would lead to insertion of another placeholder node and thus break
            // undo with Ctrl+z
            if (event.ctrlKey ||
                event.metaKey ||
                event.altKey ||
                event.key === "Shift") {
                return false;
            }
            // if the user starts typing at the placeholder's position, remove
            // the placeholder node. this makes the PlaceholderNode almost
            // "invisible" and prevents issues when, for example, when checking
            // for previous nodes in the code.
            const selection = (0, lexical_1.$getSelection)();
            if ((0, lexical_1.$isRangeSelection)(selection)) {
                const [node] = selection.getNodes();
                if ((0, PlaceholderNode_1.$isPlaceholderNode)(node)) {
                    node.remove();
                }
            }
            return false;
        }, lexical_1.COMMAND_PRIORITY_HIGH), editor.registerCommand(lexical_1.SELECTION_CHANGE_COMMAND, () => {
            // select the previous node to avoid an error that occurs when the
            // user tries to insert a node directly after the PlaceholderNode
            const selection = (0, lexical_1.$getSelection)();
            if ((0, lexical_1.$isRangeSelection)(selection) && selection.isCollapsed()) {
                const [node] = selection.getNodes();
                if ((0, PlaceholderNode_1.$isPlaceholderNode)(node)) {
                    node.selectPrevious();
                }
            }
            return false;
        }, lexical_1.COMMAND_PRIORITY_HIGH));
    }, [editor]);
    return null;
}
