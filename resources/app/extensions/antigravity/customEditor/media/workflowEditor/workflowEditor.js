/*
 * This is a script that is injected with a custom webview that acts as a custom editor for Workflows.
 * The script listens for changes by inputs and sends postMessages to the extension to update the
 * internal document and write to disk.
 */

// Constants and helper functions are injected from the server-side TypeScript file via a script tag
// MAX_DESCRIPTION_LENGTH, updateCharCounter, hasBannedString, MAX_CONTENT_LENGTH

// VS Code webview API is available on VS Code Webviews
const vscode = acquireVsCodeApi();

// Current document state
let documentState = {
  description: '',
  content: '',
};

// Logic to handle undo/redo. It seems like without this, VS Code's document steals
// the event from the input elements in our custom UI.
const isMac = navigator.userAgent.toLowerCase().includes('mac');
const isUndoKey = (e) =>
  e.key === 'z' && (isMac ? e.metaKey : e.ctrlKey) && !e.shiftKey;
const isRedoKey = (e) =>
  e.key === 'z' && (isMac ? e.metaKey : e.ctrlKey) && e.shiftKey;

document.addEventListener(
  'keydown',
  (e) => {
    if (isUndoKey(e)) {
      e.stopPropagation();
      e.preventDefault();
      document.execCommand('undo');
    } else if (isRedoKey(e)) {
      e.stopPropagation();
      e.preventDefault();
      document.execCommand('redo');
    }
  },
  true,
);

// Setup event listeners once page is loaded
window.addEventListener('load', () => {
  // Get the input elements
  const descriptionInput = document.getElementById('description');
  const contentTextarea = document.getElementById('content');
  const bannedStringInputMessage = document.getElementById(
    'input-error-message',
  );

  // Constants for error classes from workflowEditor.css
  const inputErrorClassName = 'input-char-limit-error';
  const charCounterErrorClassName = 'char-counter-error';

  // List of banned strings to check against input values due to potential parsing issues.
  const BANNED_STRINGS = ['---'];

  // Get elements for character counter
  const descriptionCounter = document.getElementById('description-counter');
  const contentCounter = document.getElementById('content-counter');

  // Initialize state
  documentState.description = descriptionInput.value;
  documentState.content = contentTextarea.value;

  // Initialize counter value
  updateCharCounter(
    descriptionInput,
    descriptionCounter,
    MAX_DESCRIPTION_LENGTH,
    inputErrorClassName,
    charCounterErrorClassName,
  );
  updateCharCounter(
    contentTextarea,
    contentCounter,
    MAX_CONTENT_LENGTH,
    inputErrorClassName,
    charCounterErrorClassName,
  );
  const bannedString = hasBannedString(descriptionInput, BANNED_STRINGS);

  if (bannedString) {
    descriptionInput.classList.add(inputErrorClassName);
    bannedStringInputMessage.style.display = 'block';
    bannedStringInputMessage.textContent = `Input contains invalid strings: ${bannedString}. Your changes will not be saved.`;
  } else {
    descriptionInput.classList.remove(inputErrorClassName);
    bannedStringInputMessage.style.display = 'none';
  }

  // Handle changes to the description
  descriptionInput.addEventListener('input', () => {
    documentState.description = descriptionInput.value;

    // Update character counter
    updateCharCounter(
      descriptionInput,
      descriptionCounter,
      MAX_DESCRIPTION_LENGTH,
      inputErrorClassName,
      charCounterErrorClassName,
    );
    const bannedString = hasBannedString(descriptionInput, BANNED_STRINGS);

    if (bannedString) {
      descriptionInput.classList.add(inputErrorClassName);
      bannedStringInputMessage.style.display = 'block';
      bannedStringInputMessage.textContent = `Input contains invalid strings: ${bannedString}. Your changes will not be saved.`;
    } else {
      descriptionInput.classList.remove(inputErrorClassName);
      bannedStringInputMessage.style.display = 'none';
    }

    // Notify extension that content changed
    vscode.postMessage({
      type: 'update',
      content: documentState,
    });
  });

  // Handle changes to the content
  contentTextarea.addEventListener('input', () => {
    documentState.content = contentTextarea.value;

    // Update character counter
    updateCharCounter(
      contentTextarea,
      contentCounter,
      MAX_CONTENT_LENGTH,
      inputErrorClassName,
      charCounterErrorClassName,
    );
    // Notify extension that content changed
    vscode.postMessage({
      type: 'update',
      content: documentState,
    });
  });
});
