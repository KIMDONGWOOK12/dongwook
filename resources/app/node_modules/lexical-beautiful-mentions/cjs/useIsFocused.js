"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useIsFocused = void 0;
const LexicalComposerContext_1 = require("@lexical/react/LexicalComposerContext");
const utils_1 = require("@lexical/utils");
const lexical_1 = require("lexical");
const react_1 = require("react");
const environment_1 = require("./environment");
const useLayoutEffectImpl = environment_1.CAN_USE_DOM
    ? react_1.useLayoutEffect
    : react_1.useEffect;
const useIsFocused = () => {
    const [editor] = (0, LexicalComposerContext_1.useLexicalComposerContext)();
    const [hasFocus, setHasFocus] = (0, react_1.useState)(() => environment_1.CAN_USE_DOM ? editor.getRootElement() === document.activeElement : false);
    useLayoutEffectImpl(() => {
        return (0, utils_1.mergeRegister)(editor.registerCommand(lexical_1.FOCUS_COMMAND, () => {
            setHasFocus(true);
            return false;
        }, lexical_1.COMMAND_PRIORITY_NORMAL), editor.registerCommand(lexical_1.BLUR_COMMAND, () => {
            setHasFocus(false);
            return false;
        }, lexical_1.COMMAND_PRIORITY_NORMAL));
    }, [editor]);
    return hasFocus;
};
exports.useIsFocused = useIsFocused;
