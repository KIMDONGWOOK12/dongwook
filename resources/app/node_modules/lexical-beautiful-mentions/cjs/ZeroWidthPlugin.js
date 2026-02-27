"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZERO_WIDTH_CHARACTER = void 0;
exports.ZeroWidthPlugin = ZeroWidthPlugin;
const LexicalComposerContext_1 = require("@lexical/react/LexicalComposerContext");
const utils_1 = require("@lexical/utils");
const lexical_1 = require("lexical");
const react_1 = require("react");
const ZeroWidthNode_1 = require("./ZeroWidthNode");
exports.ZERO_WIDTH_CHARACTER = "​"; // 🚨 contains a zero-width space (U+200B)
/**
 * This plugin serves as a patch to fix an incorrect cursor position in Safari.
 * It also ensures that the cursor is correctly aligned with the line height in
 * all browsers.
 * {@link https://github.com/facebook/lexical/issues/4487}.
 *
 * @deprecated Use `PlaceholderPlugin` instead. This Plugin will be removed in a future version.
 */
function ZeroWidthPlugin({ textContent }) {
    const [editor] = (0, LexicalComposerContext_1.useLexicalComposerContext)();
    (0, react_1.useEffect)(() => {
        return (0, utils_1.mergeRegister)(editor.registerUpdateListener(() => {
            // add a zero-width space node at the end if the last node is a decorator node
            editor.update(() => {
                const root = (0, lexical_1.$getRoot)();
                const last = root.getLastDescendant();
                // add ZeroWidthNode at the end of the editor
                if ((0, lexical_1.$isDecoratorNode)(last)) {
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    (0, lexical_1.$nodesOfType)(ZeroWidthNode_1.ZeroWidthNode).forEach((node) => {
                        node.remove();
                    }); // cleanup
                    last.insertAfter((0, ZeroWidthNode_1.$createZeroWidthNode)(textContent));
                }
                // add ZeroWidthNode before each line break
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                (0, lexical_1.$nodesOfType)(lexical_1.LineBreakNode).forEach((node) => {
                    const prev = node.getPreviousSibling();
                    if ((0, lexical_1.$isDecoratorNode)(prev)) {
                        node.insertBefore((0, ZeroWidthNode_1.$createZeroWidthNode)(textContent));
                    }
                });
            }, 
            // merge with previous history entry to allow undoing
            { tag: "history-merge" });
        }), editor.registerCommand(lexical_1.KEY_DOWN_COMMAND, (event) => {
            // prevent the unnecessary removal of the zero-width space, since this
            // would lead to the insertion of another zero-width space and thus break
            // undo with Ctrl+z
            if (event.ctrlKey || event.metaKey || event.altKey) {
                return false;
            }
            // remove the zero-width space if the user starts typing
            const selection = (0, lexical_1.$getSelection)();
            if ((0, lexical_1.$isRangeSelection)(selection)) {
                const node = selection.anchor.getNode();
                if ((0, ZeroWidthNode_1.$isZeroWidthNode)(node)) {
                    node.remove();
                }
            }
            return false;
        }, lexical_1.COMMAND_PRIORITY_HIGH), editor.registerCommand(lexical_1.SELECTION_CHANGE_COMMAND, () => {
            // select the previous node to avoid an error that occurs when the
            // user tries to insert a node directly after the zero-width space
            const selection = (0, lexical_1.$getSelection)();
            if ((0, lexical_1.$isRangeSelection)(selection) && selection.isCollapsed()) {
                const node = selection.anchor.getNode();
                if ((0, ZeroWidthNode_1.$isZeroWidthNode)(node)) {
                    node.selectPrevious();
                }
            }
            return false;
        }, lexical_1.COMMAND_PRIORITY_HIGH));
    }, [editor, textContent]);
    return null;
}
