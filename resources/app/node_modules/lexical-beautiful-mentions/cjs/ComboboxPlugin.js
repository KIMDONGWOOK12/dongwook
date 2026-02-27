"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAnchorRef = useAnchorRef;
exports.checkForTriggers = checkForTriggers;
exports.ComboboxPlugin = ComboboxPlugin;
const jsx_runtime_1 = require("react/jsx-runtime");
const LexicalComposerContext_1 = require("@lexical/react/LexicalComposerContext");
const utils_1 = require("@lexical/utils");
const lexical_1 = require("lexical");
const react_1 = require("react");
const ReactDOM = __importStar(require("react-dom"));
const Menu_1 = require("./Menu");
const environment_1 = require("./environment");
const mention_commands_1 = require("./mention-commands");
const mention_utils_1 = require("./mention-utils");
const useIsFocused_1 = require("./useIsFocused");
class ComboboxOption extends Menu_1.MenuOption {
    constructor(itemType, value, displayValue, data = {}) {
        super(value, displayValue, data);
        this.itemType = itemType;
        this.comboboxItem = {
            itemType: itemType,
            value: value,
            displayValue: displayValue,
            data: data,
        };
        this.menuOption = new Menu_1.MenuOption(value, displayValue, data);
    }
}
function getQueryTextForSearch(editor) {
    let text = null;
    editor.getEditorState().read(() => {
        const selection = (0, lexical_1.$getSelection)();
        if (!(0, lexical_1.$isRangeSelection)(selection)) {
            return;
        }
        text = getTextUpToAnchor(selection);
    });
    return text;
}
function getTextUpToAnchor(selection) {
    const anchor = selection.anchor;
    if (anchor.type !== "text") {
        return null;
    }
    const anchorNode = anchor.getNode();
    if (!anchorNode.isSimpleText()) {
        return null;
    }
    const anchorOffset = anchor.offset;
    return (0, mention_utils_1.getTextContent)(anchorNode).slice(0, anchorOffset);
}
function isCharacterKey(event) {
    return (event.key.length === 1 &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey &&
        !event.repeat);
}
function useAnchorRef(render, comboboxAnchor, comboboxAnchorClassName) {
    const [editor] = (0, LexicalComposerContext_1.useLexicalComposerContext)();
    const [anchor, setAnchor] = (0, react_1.useState)(comboboxAnchor !== null && comboboxAnchor !== void 0 ? comboboxAnchor : null);
    const [anchorChild, setAnchorChild] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (comboboxAnchor) {
            setAnchor(comboboxAnchor);
            return;
        }
        return editor.registerRootListener((rootElement) => {
            if (rootElement) {
                setAnchor(rootElement.parentElement);
            }
        });
    }, [editor, comboboxAnchor]);
    (0, react_1.useEffect)(() => {
        if (!anchor) {
            return;
        }
        if (!render) {
            if (anchorChild) {
                anchorChild.remove();
                setAnchorChild(null);
            }
            return;
        }
        const { height } = anchor.getBoundingClientRect();
        const newAnchorChild = anchorChild !== null && anchorChild !== void 0 ? anchorChild : document.createElement("div");
        newAnchorChild.style.position = "absolute";
        newAnchorChild.style.left = "0";
        newAnchorChild.style.right = "0";
        newAnchorChild.style.paddingTop = `${height}px`;
        anchor.prepend(newAnchorChild);
        if (!anchorChild) {
            setAnchorChild(newAnchorChild);
        }
        const anchorObserver = new ResizeObserver(([entry]) => {
            newAnchorChild.style.paddingTop = `${entry.contentRect.height}px`;
        });
        anchorObserver.observe(anchor);
        setTimeout(() => {
            newAnchorChild.className = comboboxAnchorClassName !== null && comboboxAnchorClassName !== void 0 ? comboboxAnchorClassName : "";
        });
        return () => {
            anchorObserver.disconnect();
            anchor.removeChild(newAnchorChild);
        };
    }, [anchor, render, anchorChild, comboboxAnchorClassName]);
    return anchorChild;
}
function checkForTriggers(text, triggers) {
    var _a;
    const last = (_a = text.split(/\s/).pop()) !== null && _a !== void 0 ? _a : text;
    const offset = text !== last ? text.lastIndexOf(last) : 0;
    const match = triggers.some((t) => t.startsWith(last) && t !== last);
    if (match) {
        return {
            leadOffset: offset,
            matchingString: last,
            replaceableString: last,
        };
    }
    return null;
}
function ComboboxPlugin(props) {
    var _a;
    const { onSelectOption, triggers, punctuation, autoSpace, loading, triggerFn, onQueryChange, onReset, comboboxAnchor, comboboxAnchorClassName, comboboxComponent: ComboboxComponent = "div", comboboxItemComponent: ComboboxItemComponent = "div", onComboboxOpen, onComboboxClose, onComboboxFocusChange, comboboxAdditionalItems = [], onComboboxItemSelect, } = props;
    const focused = (0, useIsFocused_1.useIsFocused)();
    const [editor] = (0, LexicalComposerContext_1.useLexicalComposerContext)();
    const [selectedIndex, setSelectedIndex] = (0, react_1.useState)(null);
    const [triggerMatch, setTriggerMatch] = (0, react_1.useState)(null);
    const [valueMatch, setValueMatch] = (0, react_1.useState)(null);
    const [triggerQueryString, setTriggerQueryString] = (0, react_1.useState)(null);
    const itemType = props.options.length === 0 ? "trigger" : "value";
    const options = (0, react_1.useMemo)(() => {
        const additionalOptions = comboboxAdditionalItems.map((opt) => new ComboboxOption("additional", opt.value, opt.displayValue, opt.data));
        if (itemType === "trigger") {
            const triggerOptions = triggers.map((trigger) => new ComboboxOption("trigger", trigger, trigger));
            if (!triggerQueryString ||
                triggerOptions.every((o) => !o.value.startsWith(triggerQueryString))) {
                return [...triggerOptions, ...additionalOptions];
            }
            return [
                ...triggerOptions.filter((o) => o.value.startsWith(triggerQueryString)),
                ...additionalOptions,
            ];
        }
        return [
            ...props.options.map((opt) => new ComboboxOption("value", opt.value, opt.displayValue, opt.data)),
            ...additionalOptions,
        ];
    }, [
        comboboxAdditionalItems,
        itemType,
        props.options,
        triggers,
        triggerQueryString,
    ]);
    const [open, setOpen] = (0, react_1.useState)((_a = props.comboboxOpen) !== null && _a !== void 0 ? _a : false);
    const anchor = useAnchorRef(open, comboboxAnchor, comboboxAnchorClassName);
    const highlightOption = (0, react_1.useCallback)((index) => {
        if (!environment_1.IS_MOBILE) {
            setSelectedIndex(index);
        }
    }, []);
    const scrollIntoView = (0, react_1.useCallback)((index) => {
        var _a;
        const option = options[index];
        const el = (_a = option.ref) === null || _a === void 0 ? void 0 : _a.current;
        if (el) {
            el.scrollIntoView({ block: "nearest" });
        }
    }, [options]);
    const handleArrowKeyDown = (0, react_1.useCallback)((event, direction) => {
        if (!focused) {
            return false;
        }
        let newIndex;
        if (direction === "up") {
            if (selectedIndex === null) {
                newIndex = options.length - 1;
            }
            else if (selectedIndex === 0) {
                newIndex = null;
            }
            else {
                newIndex = selectedIndex - 1;
            }
        }
        else {
            if (selectedIndex === null) {
                newIndex = 0;
            }
            else if (selectedIndex === options.length - 1) {
                newIndex = null;
            }
            else {
                newIndex = selectedIndex + 1;
            }
        }
        highlightOption(newIndex);
        if (newIndex) {
            scrollIntoView(newIndex);
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        return true;
    }, [focused, selectedIndex, options.length, scrollIntoView, highlightOption]);
    const handleMouseEnter = (0, react_1.useCallback)((index) => {
        highlightOption(index);
        scrollIntoView(index);
    }, [scrollIntoView, highlightOption]);
    const handleMouseLeave = (0, react_1.useCallback)(() => {
        highlightOption(null);
    }, [highlightOption]);
    const handleSelectValue = (0, react_1.useCallback)((index) => {
        const option = options[index];
        onComboboxItemSelect === null || onComboboxItemSelect === void 0 ? void 0 : onComboboxItemSelect(option.comboboxItem);
        if (option.itemType === "additional") {
            return;
        }
        editor.update(() => {
            const textNode = valueMatch
                ? (0, Menu_1.$splitNodeContainingQuery)(valueMatch)
                : null;
            onSelectOption(option.menuOption, textNode);
        });
        setValueMatch(null);
        onQueryChange(null);
        setTriggerQueryString(null);
        highlightOption(null);
    }, [
        options,
        editor,
        onQueryChange,
        highlightOption,
        onComboboxItemSelect,
        valueMatch,
        onSelectOption,
    ]);
    const handleSelectTrigger = (0, react_1.useCallback)((index) => {
        const option = options[index];
        onComboboxItemSelect === null || onComboboxItemSelect === void 0 ? void 0 : onComboboxItemSelect(option.comboboxItem);
        if (option.itemType === "additional") {
            return;
        }
        editor.update(() => {
            const nodeToReplace = triggerMatch
                ? (0, Menu_1.$splitNodeContainingQuery)(triggerMatch)
                : null;
            if (nodeToReplace) {
                const textNode = (0, lexical_1.$createTextNode)(option.value);
                nodeToReplace.replace(textNode);
                textNode.select();
            }
            else {
                (0, mention_commands_1.$insertTriggerAtSelection)(triggers, punctuation, option.value, autoSpace);
            }
        });
        setTriggerMatch(null);
        setTriggerQueryString(null);
        highlightOption(0);
    }, [
        options,
        editor,
        highlightOption,
        onComboboxItemSelect,
        triggerMatch,
        triggers,
        punctuation,
        autoSpace,
    ]);
    const handleClick = (0, react_1.useCallback)((index) => {
        if (itemType === "trigger") {
            handleSelectTrigger(index);
        }
        if (itemType === "value") {
            handleSelectValue(index);
        }
    }, [itemType, handleSelectTrigger, handleSelectValue]);
    const handleKeySelect = (0, react_1.useCallback)((event) => {
        if (!focused || selectedIndex === null) {
            return false;
        }
        let handled = false;
        if (itemType === "trigger") {
            handled = true;
            handleSelectTrigger(selectedIndex);
        }
        if (itemType === "value") {
            handled = true;
            handleSelectValue(selectedIndex);
        }
        if (handled) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
        return handled;
    }, [focused, handleSelectValue, handleSelectTrigger, itemType, selectedIndex]);
    const handleBackspace = (0, react_1.useCallback)(() => {
        const text = getQueryTextForSearch(editor);
        const newText = text ? text.substring(0, text.length - 1) : undefined;
        if (!(newText === null || newText === void 0 ? void 0 : newText.trim())) {
            highlightOption(null);
        }
        return false;
    }, [editor, highlightOption]);
    const handleKeyDown = (0, react_1.useCallback)((event) => {
        setOpen(true);
        if (!isCharacterKey(event)) {
            return false;
        }
        const text = getQueryTextForSearch(editor);
        const value = text === null ? event.key : text + event.key;
        const valueTrimmed = value.trim();
        if (options.some((o) => o.displayValue.startsWith(valueTrimmed) &&
            valueTrimmed.length <= o.displayValue.length)) {
            highlightOption(0);
        }
        else if (itemType === "trigger") {
            highlightOption(null);
        }
        return false;
    }, [editor, options, itemType, highlightOption]);
    const handleFocus = (0, react_1.useCallback)(() => {
        setOpen(true);
        return false;
    }, []);
    const handleClickOutside = (0, react_1.useCallback)(() => {
        setOpen(false);
        if (!triggerQueryString) {
            setTriggerQueryString(null);
            setTriggerMatch(null);
            setValueMatch(null);
        }
        return false;
    }, [triggerQueryString]);
    (0, react_1.useEffect)(() => {
        return (0, utils_1.mergeRegister)(editor.registerCommand(lexical_1.KEY_ARROW_DOWN_COMMAND, (event) => {
            return handleArrowKeyDown(event, "down");
        }, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.KEY_ARROW_UP_COMMAND, (event) => {
            return handleArrowKeyDown(event, "up");
        }, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.KEY_ENTER_COMMAND, handleKeySelect, lexical_1.COMMAND_PRIORITY_NORMAL), editor.registerCommand(lexical_1.KEY_TAB_COMMAND, handleKeySelect, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.KEY_BACKSPACE_COMMAND, handleBackspace, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.KEY_DOWN_COMMAND, handleKeyDown, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.FOCUS_COMMAND, handleFocus, lexical_1.COMMAND_PRIORITY_NORMAL), editor.registerCommand(lexical_1.CLICK_COMMAND, () => {
            if (!open) {
                setOpen(true);
            }
            return false;
        }, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.KEY_ESCAPE_COMMAND, () => {
            setOpen(false);
            return false;
        }, lexical_1.COMMAND_PRIORITY_LOW));
    }, [
        editor,
        open,
        handleArrowKeyDown,
        handleKeySelect,
        handleBackspace,
        handleKeyDown,
        handleFocus,
    ]);
    (0, react_1.useEffect)(() => {
        const updateListener = () => {
            editor.getEditorState().read(() => {
                const text = getQueryTextForSearch(editor);
                // reset if no text
                if (text === null) {
                    onReset();
                    setTriggerMatch(null);
                    setValueMatch(null);
                    onQueryChange(null);
                    setTriggerQueryString(null);
                    return;
                }
                // check for triggers
                const triggerMatch = checkForTriggers(text, triggers);
                setTriggerMatch(triggerMatch);
                if (triggerMatch) {
                    setTriggerQueryString(triggerMatch.matchingString);
                    setValueMatch(null);
                    return;
                }
                // check for mentions
                const valueMatch = triggerFn(text, editor);
                setValueMatch(valueMatch);
                onQueryChange(valueMatch ? valueMatch.matchingString : null);
                if (valueMatch === null || valueMatch === void 0 ? void 0 : valueMatch.matchingString) {
                    setTriggerQueryString(valueMatch.matchingString);
                    return;
                }
                setTriggerQueryString(null);
            });
        };
        return editor.registerUpdateListener(updateListener);
    }, [editor, triggerFn, onQueryChange, onReset, triggers]);
    (0, react_1.useEffect)(() => {
        var _a;
        setOpen((_a = props.comboboxOpen) !== null && _a !== void 0 ? _a : false);
    }, [props.comboboxOpen]);
    // call open/close callbacks when open state changes
    (0, react_1.useEffect)(() => {
        if (open) {
            onComboboxOpen === null || onComboboxOpen === void 0 ? void 0 : onComboboxOpen();
        }
        else {
            setSelectedIndex(null);
            onComboboxClose === null || onComboboxClose === void 0 ? void 0 : onComboboxClose();
        }
    }, [onComboboxOpen, onComboboxClose, open]);
    // call focus change callback when selected index changes
    (0, react_1.useEffect)(() => {
        if (selectedIndex !== null && !!options[selectedIndex]) {
            onComboboxFocusChange === null || onComboboxFocusChange === void 0 ? void 0 : onComboboxFocusChange(options[selectedIndex].comboboxItem);
        }
        else {
            onComboboxFocusChange === null || onComboboxFocusChange === void 0 ? void 0 : onComboboxFocusChange(null);
        }
    }, [selectedIndex, options, onComboboxFocusChange]);
    // close combobox when clicking outside
    (0, react_1.useEffect)(() => {
        if (!environment_1.CAN_USE_DOM) {
            return;
        }
        const root = editor.getRootElement();
        const handleMousedown = (event) => {
            if (anchor &&
                !anchor.contains(event.target) &&
                root &&
                !root.contains(event.target)) {
                handleClickOutside();
            }
        };
        document.addEventListener("mousedown", handleMousedown);
        return () => {
            document.removeEventListener("mousedown", handleMousedown);
        };
    }, [anchor, editor, handleClickOutside]);
    if (!open || !anchor) {
        return null;
    }
    return ReactDOM.createPortal((0, jsx_runtime_1.jsx)(ComboboxComponent, { loading: loading, itemType: itemType, role: "menu", "aria-activedescendant": selectedIndex !== null && !!options[selectedIndex]
            ? options[selectedIndex].displayValue
            : "", "aria-label": "Choose trigger and value", "aria-hidden": !open, children: options.map((option, index) => ((0, jsx_runtime_1.jsx)(ComboboxItemComponent, { selected: index === selectedIndex, role: "menuitem", "aria-selected": selectedIndex === index, "aria-label": `Choose ${option.value}`, item: option.comboboxItem, ref: option.setRefElement, onClick: () => {
                handleClick(index);
            }, onMouseEnter: () => {
                handleMouseEnter(index);
            }, onMouseLeave: handleMouseLeave, onMouseDown: (e) => {
                e.preventDefault();
            }, children: option.displayValue }, option.key))) }), anchor);
}
