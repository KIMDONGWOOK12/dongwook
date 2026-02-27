"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBeautifulMentions = useBeautifulMentions;
const LexicalComposerContext_1 = require("@lexical/react/LexicalComposerContext");
const react_1 = require("react");
const mention_commands_1 = require("./mention-commands");
const mention_utils_1 = require("./mention-utils");
/**
 * Hook that provides access to the BeautifulMentionsPlugin. It allows you to insert,
 * remove and rename mentions from outside the editor.
 */
function useBeautifulMentions() {
    const [editor] = (0, LexicalComposerContext_1.useLexicalComposerContext)();
    /**
     * Inserts a mention at the current selection.
     */
    const insertMention = (0, react_1.useCallback)((options) => editor.dispatchCommand(mention_commands_1.INSERT_MENTION_COMMAND, options), [editor]);
    /**
     * Removes all mentions that match the given trigger and an optional value.
     */
    const removeMentions = (0, react_1.useCallback)((options) => editor.dispatchCommand(mention_commands_1.REMOVE_MENTIONS_COMMAND, options), [editor]);
    /**
     * Renames all mentions that match the given trigger and an optional value.
     */
    const renameMentions = (0, react_1.useCallback)((options) => editor.dispatchCommand(mention_commands_1.RENAME_MENTIONS_COMMAND, options), [editor]);
    /**
     * Returns `true` if there are mentions that match the given trigger and an optional value.
     */
    const hasMentions = (0, react_1.useCallback)(({ value, trigger }) => {
        return editor.getEditorState().read(() => {
            const mentions = (0, mention_utils_1.$findBeautifulMentionNodes)(editor);
            if (value) {
                return mentions.some((mention) => mention.getTrigger() === trigger && mention.getValue() === value);
            }
            return mentions.some((mention) => mention.getTrigger() === trigger);
        });
    }, [editor]);
    /**
     * Opens the mention menu at the current selection.
     */
    const openMentionMenu = (0, react_1.useCallback)((options) => editor.dispatchCommand(mention_commands_1.OPEN_MENTION_MENU_COMMAND, options), [editor]);
    /**
     * Returns all mentions used in the editor.
     */
    const getMentions = (0, react_1.useCallback)(() => {
        return editor.getEditorState().read(() => (0, mention_utils_1.$findBeautifulMentionNodes)(editor).map((node) => {
            const { trigger, value, data } = node.exportJSON();
            return { trigger, value, data };
        }));
    }, [editor]);
    return {
        getMentions,
        insertMention,
        removeMentions,
        renameMentions,
        hasMentions,
        openMentionMenu,
    };
}
