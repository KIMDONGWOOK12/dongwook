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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkForMentions = checkForMentions;
exports.BeautifulMentionsPlugin = BeautifulMentionsPlugin;
const jsx_runtime_1 = require("react/jsx-runtime");
/* eslint @typescript-eslint/no-deprecated: 0 */
const LexicalComposerContext_1 = require("@lexical/react/LexicalComposerContext");
const LexicalTypeaheadMenuPlugin_1 = require("@lexical/react/LexicalTypeaheadMenuPlugin");
const utils_1 = require("@lexical/utils");
const lexical_1 = require("lexical");
const react_1 = require("react");
const ReactDOM = __importStar(require("react-dom"));
const ComboboxPlugin_1 = require("./ComboboxPlugin");
const MentionNode_1 = require("./MentionNode");
const Menu_1 = require("./Menu");
const environment_1 = require("./environment");
const mention_commands_1 = require("./mention-commands");
const mention_utils_1 = require("./mention-utils");
const useIsFocused_1 = require("./useIsFocused");
const useMentionLookupService_1 = require("./useMentionLookupService");
class MentionOption extends Menu_1.MenuOption {
    constructor(trigger, value, displayValue, data) {
        super(value, displayValue, data);
        this.trigger = trigger;
        this.menuItem = {
            trigger,
            value,
            displayValue,
            data,
        };
    }
}
// Non-standard series of chars. Each series must be preceded and followed by
// a valid char.
const VALID_JOINS = (punctuation) => "(?:" +
    "\\.[ |$]|" + // E.g. "r. " in "Mr. Smith"
    "\\s|" + // E.g. " " in "Josh Duck"
    "[" +
    punctuation +
    "]|" + // E.g. "-' in "Salier-Hellendag"
    ")";
// Regex used to trigger the mention menu.
function createMentionsRegex(triggers, preTriggerChars, punctuation, allowSpaces) {
    return new RegExp((preTriggerChars ? `(^|\\s|${preTriggerChars})(` : "(^|\\s)(") +
        (0, mention_utils_1.TRIGGERS)(triggers) +
        "((?:" +
        (0, mention_utils_1.VALID_CHARS)(triggers, punctuation) +
        (allowSpaces ? VALID_JOINS(punctuation) : "") +
        "){0," +
        mention_utils_1.LENGTH_LIMIT +
        "})" +
        ")$");
}
function checkForMentions(text, triggers, preTriggerChars, punctuation, allowSpaces) {
    const match = createMentionsRegex(triggers, preTriggerChars, punctuation, allowSpaces).exec(text);
    if (match !== null) {
        // The strategy ignores leading whitespace, but we need to know its
        // length to add it to the leadOffset
        const maybeLeadingWhitespace = match[1];
        const matchingStringWithTrigger = match[2];
        const matchingString = match[3];
        if (matchingStringWithTrigger.length >= 1) {
            return {
                leadOffset: match.index + maybeLeadingWhitespace.length,
                matchingString: matchingString,
                replaceableString: matchingStringWithTrigger,
            };
        }
    }
    return null;
}
/**
 * A plugin that adds mentions to the lexical editor.
 */
function BeautifulMentionsPlugin(props) {
    const { items, onSearch, autoSpace = true, searchDelay = props.onSearch ? 250 : 0, allowSpaces = true, insertOnBlur = true, menuComponent: MenuComponent = "ul", menuItemComponent: MenuItemComponent = "li", emptyComponent: EmptyComponent, menuAnchorClassName, showMentionsOnDelete, showCurrentMentionsAsSuggestions = true, mentionEnclosure, onMenuOpen, onMenuClose, onMenuItemSelect, punctuation = mention_utils_1.DEFAULT_PUNCTUATION, preTriggerChars = mention_utils_1.PRE_TRIGGER_CHARS, } = props;
    const justSelectedAnOption = (0, react_1.useRef)(false);
    const isEditorFocused = (0, useIsFocused_1.useIsFocused)();
    const triggers = (0, react_1.useMemo)(() => { var _a; return (_a = props.triggers) !== null && _a !== void 0 ? _a : Object.keys(items !== null && items !== void 0 ? items : {}); }, [props.triggers, items]);
    const [editor] = (0, LexicalComposerContext_1.useLexicalComposerContext)();
    const [queryString, setQueryString] = (0, react_1.useState)(null);
    const [trigger, setTrigger] = (0, react_1.useState)(null);
    const { results, loading, query } = (0, useMentionLookupService_1.useMentionLookupService)({
        queryString,
        searchDelay,
        trigger,
        items,
        onSearch,
        justSelectedAnOption,
    });
    const selectedMenuIndexRef = (0, react_1.useRef)(null);
    const oldSelection = (0, react_1.useRef)(null);
    const creatable = (0, mention_utils_1.getCreatableProp)(props.creatable, trigger);
    const menuItemLimit = (0, mention_utils_1.getMenuItemLimitProp)(props.menuItemLimit, trigger);
    const options = (0, react_1.useMemo)(() => {
        if (!trigger) {
            return [];
        }
        // add options from the lookup service
        let opt = results.map((result) => {
            if (typeof result === "string") {
                return new MentionOption(trigger, result, result);
            }
            else {
                const { value } = result, data = __rest(result, ["value"]);
                return new MentionOption(trigger, value, value, data);
            }
        });
        // limit the number of menu items
        if (menuItemLimit !== false && menuItemLimit > 0) {
            opt = opt.slice(0, menuItemLimit);
        }
        // Add mentions from the editor. When a search function is provided, wait for the
        // delayed search to prevent flickering
        const readyToAddCurrentMentions = !onSearch || (!loading && query !== null);
        if (readyToAddCurrentMentions && showCurrentMentionsAsSuggestions) {
            editor.getEditorState().read(() => {
                const mentions = (0, mention_utils_1.$findBeautifulMentionNodes)(editor);
                for (const mention of mentions) {
                    const value = mention.getValue();
                    const data = mention.getData();
                    // only add the mention if it's not already in the list
                    if (mention.getTrigger() === trigger &&
                        (query === null || mention.getValue().startsWith(query)) &&
                        opt.every((o) => o.value !== value)) {
                        opt.push(new MentionOption(trigger, value, value, data));
                    }
                }
            });
        }
        // add option to create a new mention
        if (query && opt.every((o) => o.displayValue !== query)) {
            const displayValue = typeof creatable === "string"
                ? creatable.replace("{{name}}", query)
                : typeof creatable === "undefined" || creatable
                    ? `Add "${query}"`
                    : undefined;
            if (displayValue) {
                opt.push(new MentionOption(trigger, query, displayValue));
            }
        }
        return opt;
    }, [
        results,
        onSearch,
        loading,
        query,
        editor,
        trigger,
        creatable,
        menuItemLimit,
        showCurrentMentionsAsSuggestions,
    ]);
    const queryWithoutResults = !!onSearch && !options.length && !!queryString && /\s+/.test(queryString);
    const open = !!options.length || (loading && !queryWithoutResults);
    const handleClose = (0, react_1.useCallback)(() => {
        setTrigger(null);
    }, []);
    const handleSelectOption = (0, react_1.useCallback)((selectedOption, nodeToReplace, closeMenu) => {
        editor.update(() => {
            if (!trigger) {
                return;
            }
            const newMention = !!creatable && selectedOption.value !== selectedOption.displayValue;
            const value = newMention && mentionEnclosure && /\s/.test(selectedOption.value)
                ? // if the value has spaces, wrap it in the enclosure
                    mentionEnclosure + selectedOption.value + mentionEnclosure
                : selectedOption.value;
            const mentionNode = (0, MentionNode_1.$createBeautifulMentionNode)(trigger, value, selectedOption.data);
            if (nodeToReplace) {
                const nextSibling = nodeToReplace.getNextSibling();
                nodeToReplace.replace(mentionNode);
                if (nextSibling instanceof lexical_1.TextNode) {
                    // prevent that the text directly after the cursor remains in the
                    // editor if the user moved back with the cursor when selecting a mention
                    const nextSiblingTextContent = nextSibling.getTextContent();
                    if (!/\s/.test(nextSiblingTextContent) &&
                        value.includes(nextSiblingTextContent)) {
                        nextSibling.remove();
                    }
                }
            }
            closeMenu === null || closeMenu === void 0 ? void 0 : closeMenu();
            justSelectedAnOption.current = true;
        });
    }, [editor, trigger, creatable, mentionEnclosure]);
    const handleSelectMenuItem = (0, react_1.useCallback)((selectedOption, nodeToReplace, closeMenu) => {
        if (!trigger) {
            return;
        }
        onMenuItemSelect === null || onMenuItemSelect === void 0 ? void 0 : onMenuItemSelect({
            trigger,
            value: selectedOption.value,
            displayValue: selectedOption.displayValue,
            data: selectedOption.data,
        });
        handleSelectOption(selectedOption, nodeToReplace, closeMenu);
    }, [handleSelectOption, onMenuItemSelect, trigger]);
    const checkForMentionMatch = (0, react_1.useCallback)((text) => {
        const queryMatch = checkForMentions(text, triggers, preTriggerChars, punctuation, allowSpaces);
        if (queryMatch) {
            const { replaceableString, matchingString } = queryMatch;
            const index = replaceableString.lastIndexOf(matchingString);
            const trigger = index === -1
                ? replaceableString
                : replaceableString.substring(0, index) +
                    replaceableString.substring(index + matchingString.length);
            setTrigger(trigger || null);
            if (queryMatch.replaceableString) {
                return queryMatch;
            }
        }
        else {
            setTrigger(null);
        }
        return null;
    }, [preTriggerChars, allowSpaces, punctuation, triggers]);
    const insertSpaceIfNecessary = (0, react_1.useCallback)((startsWithTriggerChar = false) => {
        if (!autoSpace) {
            return;
        }
        const selectionInfo = (0, mention_utils_1.$getSelectionInfo)(triggers, punctuation);
        if (!selectionInfo) {
            return;
        }
        const { node, offset, type, parentNode, isTextNode, textContent, prevNode, nextNode, wordCharAfterCursor, cursorAtStartOfNode, cursorAtEndOfNode, } = selectionInfo;
        // [Mention][|][ Text]
        if (isTextNode &&
            cursorAtStartOfNode &&
            (0, MentionNode_1.$isBeautifulMentionNode)(prevNode)) {
            node.insertBefore((0, lexical_1.$createTextNode)(" "));
            return;
        }
        // ^[|][Mention]
        if ((0, MentionNode_1.$isBeautifulMentionNode)(node) &&
            prevNode === null &&
            (0, lexical_1.$isParagraphNode)(parentNode) &&
            type === "element" &&
            offset === 0) {
            const textNode = (0, lexical_1.$createTextNode)(" ");
            node.insertBefore(textNode);
            textNode.selectStart();
            return;
        }
        // [Text ][|][Mention]
        if (isTextNode &&
            cursorAtEndOfNode &&
            (0, MentionNode_1.$isBeautifulMentionNode)(nextNode)) {
            node.insertAfter((0, lexical_1.$createTextNode)(" "));
            return;
        }
        // [Text ][|][Text]
        if (isTextNode && startsWithTriggerChar && wordCharAfterCursor) {
            const content = textContent.substring(0, offset) +
                " " +
                textContent.substring(offset);
            node.setTextContent(content);
            return;
        }
        // [Mention][|]
        if ((0, MentionNode_1.$isBeautifulMentionNode)(node) && nextNode === null) {
            node.insertAfter((0, lexical_1.$createTextNode)(" "));
        }
    }, [punctuation, triggers, autoSpace]);
    const convertTextToMention = (0, react_1.useCallback)((refocusAfterInsert = false) => {
        const selectedMenuIndex = selectedMenuIndexRef.current;
        let option = typeof selectedMenuIndex === "number"
            ? options[selectedMenuIndex]
            : undefined;
        const newMention = options.find((o) => o.value !== o.displayValue);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (newMention && (environment_1.IS_MOBILE || option === null)) {
            option = newMention;
        }
        if (!option) {
            return false;
        }
        const selectionInfo = (0, mention_utils_1.$getSelectionInfo)(triggers, punctuation);
        if (!trigger || !(selectionInfo === null || selectionInfo === void 0 ? void 0 : selectionInfo.isTextNode)) {
            return false;
        }
        const node = selectionInfo.node;
        const textContent = (0, mention_utils_1.getTextContent)(node);
        const queryMatch = checkForMentions(textContent, triggers, preTriggerChars, punctuation, allowSpaces);
        if (queryMatch === null) {
            return false;
        }
        const textEndIndex = textContent.search(new RegExp(`${queryMatch.replaceableString}\\s?$`));
        if (textEndIndex === -1) {
            return false;
        }
        const mentionNode = (0, MentionNode_1.$createBeautifulMentionNode)(trigger, option.value, option.data);
        editor.update(() => {
            node.setTextContent(textContent.substring(0, textEndIndex));
            node.insertAfter(mentionNode);
            mentionNode.selectNext();
        }, { tag: "history-merge" });
        if (refocusAfterInsert) {
            const selection = (0, lexical_1.$getSelection)();
            setTimeout(() => {
                editor.update(() => {
                    if (selection) {
                        (0, lexical_1.$setSelection)(selection.clone());
                    }
                });
            });
        }
        return true;
    }, [
        options,
        triggers,
        punctuation,
        trigger,
        preTriggerChars,
        allowSpaces,
        editor,
    ]);
    const restoreSelection = (0, react_1.useCallback)(() => {
        const selection = (0, lexical_1.$getSelection)();
        if ((!selection || (0, lexical_1.$isNodeSelection)(selection)) && oldSelection.current) {
            const newSelection = oldSelection.current.clone();
            (0, lexical_1.$setSelection)(newSelection);
        }
        else if (!selection) {
            (0, mention_utils_1.$selectEnd)();
        }
        if (oldSelection.current) {
            oldSelection.current = null;
        }
    }, []);
    const handleDeleteMention = (0, react_1.useCallback)((event) => {
        if (!showMentionsOnDelete) {
            return false;
        }
        const selectionInfo = (0, mention_utils_1.$getSelectionInfo)(triggers, punctuation);
        if (selectionInfo) {
            const { node, prevNode, offset } = selectionInfo;
            const mentionNode = (0, MentionNode_1.$isBeautifulMentionNode)(node)
                ? node
                : (0, MentionNode_1.$isBeautifulMentionNode)(prevNode) && offset === 0
                    ? prevNode
                    : null;
            if (mentionNode) {
                const trigger = mentionNode.getTrigger();
                mentionNode.replace((0, lexical_1.$createTextNode)(trigger));
                event.preventDefault();
                return true;
            }
        }
        return false;
    }, [showMentionsOnDelete, triggers, punctuation]);
    const handleKeyDown = (0, react_1.useCallback)((event) => {
        var _a;
        const { key, metaKey, ctrlKey } = event;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const simpleKey = (key === null || key === void 0 ? void 0 : key.length) === 1; // key is undefined for Apple Pencil keyboard events
        const wordChar = (0, mention_utils_1.isWordChar)(key, triggers, punctuation);
        const isSpace = allowSpaces && /^\s$/.test(key);
        if (!simpleKey || metaKey || ctrlKey) {
            return false;
        }
        // since the key must not be the same as the trigger, we try to build the trigger
        // by combining the key with the last word before the cursor
        let combinedKey = key;
        const selectionInfo = (0, mention_utils_1.$getSelectionInfo)(triggers, punctuation);
        if (selectionInfo === null || selectionInfo === void 0 ? void 0 : selectionInfo.isTextNode) {
            const { textContent, offset } = selectionInfo;
            const last = (_a = textContent.substring(0, offset).split(/\s+/).at(-1)) !== null && _a !== void 0 ? _a : "";
            combinedKey = (last + key).trim();
        }
        const isTrigger = triggers.some((trigger) => combinedKey === trigger);
        if (!wordChar && !isTrigger && !isSpace) {
            return false;
        }
        insertSpaceIfNecessary(isTrigger);
        return false;
    }, [insertSpaceIfNecessary, punctuation, triggers, allowSpaces]);
    const handlePaste = (0, react_1.useCallback)((event) => {
        var _a;
        const text = (_a = event.clipboardData) === null || _a === void 0 ? void 0 : _a.getData("text/plain");
        const firstChar = text === null || text === void 0 ? void 0 : text.charAt(0);
        const isTrigger = triggers.some((trigger) => firstChar === trigger);
        const isPunctuation = firstChar && new RegExp(`[\\s${punctuation}]`).test(firstChar);
        if (isTrigger || !isPunctuation) {
            // insert space before pasting if the content starts with a trigger character
            insertSpaceIfNecessary();
        }
        return false; // will be handled by the lexical clipboard module
    }, [insertSpaceIfNecessary, triggers, punctuation]);
    (0, react_1.useEffect)(() => {
        if (!editor.hasNodes([MentionNode_1.BeautifulMentionNode])) {
            throw new Error("BeautifulMentionsPlugin: BeautifulMentionNode not registered on editor");
        }
        return (0, utils_1.mergeRegister)(editor.registerCommand(lexical_1.SELECTION_CHANGE_COMMAND, () => {
            const selection = (0, lexical_1.$getSelection)();
            if (selection && !(0, lexical_1.$isNodeSelection)(selection)) {
                oldSelection.current = selection;
            }
            else if (!selection) {
                oldSelection.current = null;
            }
            return false;
        }, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.KEY_DOWN_COMMAND, handleKeyDown, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.KEY_BACKSPACE_COMMAND, handleDeleteMention, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.BLUR_COMMAND, () => {
            if (insertOnBlur) {
                return convertTextToMention(true);
            }
            return false;
        }, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.KEY_SPACE_COMMAND, () => {
            if (!allowSpaces && creatable) {
                return convertTextToMention();
            }
            else {
                return false;
            }
        }, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(mention_commands_1.INSERT_MENTION_COMMAND, ({ trigger, value, data, focus = true }) => {
            restoreSelection();
            const inserted = (0, mention_commands_1.$insertMentionAtSelection)(triggers, punctuation, trigger, value, data, autoSpace);
            if (!focus) {
                (0, lexical_1.$setSelection)(null);
            }
            return inserted;
        }, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(mention_commands_1.REMOVE_MENTIONS_COMMAND, ({ trigger, value, focus }) => {
            const removed = (0, mention_commands_1.$removeMention)(trigger, value, focus);
            if (!focus) {
                // remove oldSelection manually because the SELECTION_CHANGE_COMMAND
                // listener is not called in this case.
                oldSelection.current = null;
            }
            return removed;
        }, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(mention_commands_1.RENAME_MENTIONS_COMMAND, ({ trigger, newValue, value, focus }) => (0, mention_commands_1.$renameMention)(trigger, newValue, value, focus), lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(mention_commands_1.OPEN_MENTION_MENU_COMMAND, ({ trigger }) => {
            restoreSelection();
            return (0, mention_commands_1.$insertTriggerAtSelection)(triggers, punctuation, trigger, autoSpace);
        }, lexical_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexical_1.PASTE_COMMAND, handlePaste, lexical_1.COMMAND_PRIORITY_LOW));
    }, [
        editor,
        triggers,
        punctuation,
        autoSpace,
        allowSpaces,
        insertOnBlur,
        creatable,
        isEditorFocused,
        convertTextToMention,
        handleKeyDown,
        handleDeleteMention,
        handlePaste,
        restoreSelection,
    ]);
    (0, react_1.useEffect)(() => {
        if (open && isEditorFocused) {
            onMenuOpen === null || onMenuOpen === void 0 ? void 0 : onMenuOpen();
        }
        else {
            onMenuClose === null || onMenuClose === void 0 ? void 0 : onMenuClose();
        }
        if (open && !isEditorFocused) {
            handleClose();
        }
    }, [onMenuOpen, onMenuClose, open, isEditorFocused, handleClose]);
    if (!environment_1.CAN_USE_DOM) {
        return null;
    }
    if (props.combobox) {
        return ((0, jsx_runtime_1.jsx)(ComboboxPlugin_1.ComboboxPlugin, { options: options, loading: loading, onQueryChange: setQueryString, onSelectOption: handleSelectOption, onReset: () => {
                setTrigger(null);
            }, triggerFn: checkForMentionMatch, triggers: triggers, punctuation: punctuation, creatable: creatable, comboboxOpen: props.comboboxOpen, comboboxAnchor: props.comboboxAnchor, comboboxAnchorClassName: props.comboboxAnchorClassName, comboboxComponent: props.comboboxComponent, comboboxItemComponent: props.comboboxItemComponent, comboboxAdditionalItems: props.comboboxAdditionalItems, onComboboxOpen: props.onComboboxOpen, onComboboxClose: props.onComboboxClose, onComboboxFocusChange: props.onComboboxFocusChange, onComboboxItemSelect: props.onComboboxItemSelect }));
    }
    return ((0, jsx_runtime_1.jsx)(LexicalTypeaheadMenuPlugin_1.LexicalTypeaheadMenuPlugin, { commandPriority: lexical_1.COMMAND_PRIORITY_NORMAL, onQueryChange: setQueryString, onSelectOption: handleSelectMenuItem, triggerFn: checkForMentionMatch, options: options, anchorClassName: menuAnchorClassName, onClose: handleClose, menuRenderFn: (anchorElementRef, { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }) => {
            selectedMenuIndexRef.current = selectedIndex;
            if (anchorElementRef.current &&
                options.length === 0 &&
                query &&
                !loading &&
                isEditorFocused &&
                EmptyComponent) {
                return ReactDOM.createPortal((0, jsx_runtime_1.jsx)(EmptyComponent, {}), anchorElementRef.current);
            }
            return anchorElementRef.current && open
                ? ReactDOM.createPortal((0, jsx_runtime_1.jsx)(MenuComponent, { loading: loading, role: "menu", "aria-label": "Choose a mention", "aria-hidden": !open, "aria-activedescendant": !environment_1.IS_MOBILE &&
                        selectedIndex !== null &&
                        !!options[selectedIndex]
                        ? options[selectedIndex].displayValue
                        : "", children: options.map((option, i) => ((0, jsx_runtime_1.jsx)(MenuItemComponent, Object.assign({ tabIndex: -1, selected: !environment_1.IS_MOBILE && selectedIndex === i, ref: option.setRefElement, role: "menuitem", "aria-selected": !environment_1.IS_MOBILE && selectedIndex === i, "aria-label": `Choose ${option.value}`, item: option.menuItem, itemValue: option.value, label: option.displayValue }, option.data, { onClick: () => {
                            setHighlightedIndex(i);
                            selectOptionAndCleanUp(option);
                        }, onMouseDown: (event) => {
                            event.preventDefault();
                        }, onMouseEnter: () => {
                            setHighlightedIndex(i);
                        }, children: option.displayValue }), option.key))) }), anchorElementRef.current)
                : null;
        } }));
}
