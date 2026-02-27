"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BeautifulMentionComponent;
const jsx_runtime_1 = require("react/jsx-runtime");
const LexicalComposerContext_1 = require("@lexical/react/LexicalComposerContext");
const useLexicalNodeSelection_1 = require("@lexical/react/useLexicalNodeSelection");
const utils_1 = require("@lexical/utils");
const lexical_1 = require("lexical");
const react_1 = require("react");
const MentionNode_1 = require("./MentionNode");
const environment_1 = require("./environment");
const mention_utils_1 = require("./mention-utils");
const useIsFocused_1 = require("./useIsFocused");
function BeautifulMentionComponent(props) {
    const { value, trigger, data, className, classNameFocused, classNames, nodeKey, component: Component, } = props;
    const [editor] = (0, LexicalComposerContext_1.useLexicalComposerContext)();
    const isEditorFocused = (0, useIsFocused_1.useIsFocused)();
    const [isSelected, setSelected, clearSelection] = (0, useLexicalNodeSelection_1.useLexicalNodeSelection)(nodeKey);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ref = (0, react_1.useRef)(null);
    const mention = trigger + value;
    const composedClassNames = (0, react_1.useMemo)(() => {
        if (className) {
            const classes = [className];
            if (isSelected && isEditorFocused && classNameFocused) {
                classes.push(classNameFocused);
            }
            return classes.join(" ").trim() || undefined;
        }
        return "";
    }, [isSelected, className, classNameFocused, isEditorFocused]);
    const onDelete = (0, react_1.useCallback)((payload) => {
        if (isSelected && (0, lexical_1.$isNodeSelection)((0, lexical_1.$getSelection)())) {
            payload.preventDefault();
            const node = (0, lexical_1.$getNodeByKey)(nodeKey);
            if ((0, MentionNode_1.$isBeautifulMentionNode)(node)) {
                node.remove();
            }
        }
        return false;
    }, [isSelected, nodeKey]);
    const onArrowLeftPress = (0, react_1.useCallback)((event) => {
        const node = (0, lexical_1.$getNodeByKey)(nodeKey);
        if (!(node === null || node === void 0 ? void 0 : node.isSelected())) {
            return false;
        }
        let handled = false;
        const nodeToSelect = (0, mention_utils_1.getPreviousSibling)(node);
        if ((0, lexical_1.$isElementNode)(nodeToSelect)) {
            nodeToSelect.selectEnd();
            handled = true;
        }
        if ((0, lexical_1.$isTextNode)(nodeToSelect)) {
            nodeToSelect.select();
            handled = true;
        }
        if ((0, lexical_1.$isDecoratorNode)(nodeToSelect)) {
            nodeToSelect.selectNext();
            handled = true;
        }
        if (nodeToSelect === null) {
            node.selectPrevious();
            handled = true;
        }
        if (handled) {
            event.preventDefault();
        }
        return handled;
    }, [nodeKey]);
    const onArrowRightPress = (0, react_1.useCallback)((event) => {
        const node = (0, lexical_1.$getNodeByKey)(nodeKey);
        if (!(node === null || node === void 0 ? void 0 : node.isSelected())) {
            return false;
        }
        let handled = false;
        const nodeToSelect = (0, mention_utils_1.getNextSibling)(node);
        if ((0, lexical_1.$isElementNode)(nodeToSelect)) {
            nodeToSelect.selectStart();
            handled = true;
        }
        if ((0, lexical_1.$isTextNode)(nodeToSelect)) {
            nodeToSelect.select(0, 0);
            handled = true;
        }
        if ((0, lexical_1.$isDecoratorNode)(nodeToSelect)) {
            nodeToSelect.selectPrevious();
            handled = true;
        }
        if (nodeToSelect === null) {
            node.selectNext();
            handled = true;
        }
        if (handled) {
            event.preventDefault();
        }
        return handled;
    }, [nodeKey]);
    const onClick = (0, react_1.useCallback)((event) => {
        var _a;
        if (event.target === ref.current ||
            (
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
            (_a = ref.current) === null || _a === void 0 ? void 0 : _a.contains(event.target))) {
            if (!event.shiftKey) {
                clearSelection();
            }
            setSelected(true);
            return true;
        }
        return false;
    }, [clearSelection, setSelected]);
    const onBlur = (0, react_1.useCallback)(() => {
        const node = (0, lexical_1.$getNodeByKey)(nodeKey);
        if (!(node === null || node === void 0 ? void 0 : node.isSelected())) {
            return false;
        }
        const selection = (0, lexical_1.$getSelection)();
        if (!(0, lexical_1.$isNodeSelection)(selection)) {
            return false;
        }
        (0, lexical_1.$setSelection)(null);
        return false;
    }, [nodeKey]);
    const onSelectionChange = (0, react_1.useCallback)(() => {
        if (environment_1.IS_IOS && isSelected) {
            // needed to keep the cursor in the editor when clicking next to a selected mention
            setSelected(false);
            return true;
        }
        return false;
    }, [isSelected, setSelected]);
    (0, react_1.useEffect)(() => {
        const unregister = (0, utils_1.mergeRegister)(editor.registerCommand(lexical_1.CLICK_COMMAND, onClick, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.KEY_DELETE_COMMAND, onDelete, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.KEY_BACKSPACE_COMMAND, onDelete, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.KEY_ARROW_LEFT_COMMAND, onArrowLeftPress, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.KEY_ARROW_RIGHT_COMMAND, onArrowRightPress, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.BLUR_COMMAND, onBlur, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.SELECTION_CHANGE_COMMAND, onSelectionChange, lexical_1.COMMAND_PRIORITY_LOW));
        return () => {
            unregister();
        };
    }, [
        editor,
        onArrowLeftPress,
        onArrowRightPress,
        onClick,
        onDelete,
        onBlur,
        onSelectionChange,
    ]);
    if (Component) {
        return ((0, jsx_runtime_1.jsx)(Component
        // @ts-ignore
        , { 
            // @ts-ignore
            ref: ref, trigger: trigger, value: value, data: data, className: composedClassNames, "data-beautiful-mention": mention, children: mention }));
    }
    if (classNames) {
        return ((0, jsx_runtime_1.jsxs)("span", { ref: ref, className: isSelected && !!classNames.containerFocused
                ? classNames.containerFocused
                : classNames.container, "data-beautiful-mention": mention, children: [(0, jsx_runtime_1.jsx)("span", { className: classNames.trigger, children: trigger }), (0, jsx_runtime_1.jsx)("span", { className: classNames.value, children: value })] }));
    }
    return ((0, jsx_runtime_1.jsx)("span", { ref: ref, className: composedClassNames, "data-beautiful-mention": mention, children: mention }));
}
