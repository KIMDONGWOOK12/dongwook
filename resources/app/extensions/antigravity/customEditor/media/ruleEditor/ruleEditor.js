/*
 * This is a script that is injected with a custom webview that acts as a custom editor for Rules.
 * The script listens for changes by inputs and sends postMessages to the extension to update the
 * internal document and write to disk.
 */

// Constants and helper functions are injected from the server-side TypeScript file via a script tag
// NON_CONDITIONAL_CONTENT_PLACEHOLDER, CONDITIONAL_CONTENT_PLACEHOLDER, MAX_DESCRIPTION_LENGTH, updateCharCounter, hasBannedString
// trigger, modelDecisionParam, globParam, content, MAX_CONTENT_LENGTH

// VS Code webview API is available on VS Code Webviews
const vscode = acquireVsCodeApi();

let documentState = {
  trigger: '',
  modelDecisionParam: '',
  globParam: '',
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
  const triggerDropDown = document.getElementById('trigger');
  const modelDecisionParamInput = document.getElementById(
    'model-decision-param',
  );
  const globParamInput = document.getElementById('glob-param');
  const modelDecisionSection = document.getElementById(
    'model-decision-section',
  );
  const globSection = document.getElementById('glob-section');
  const contentTextarea = document.getElementById('content');
  const modelDecisionInputErrorMessage = document.getElementById(
    'model-decision-input-error-message',
  );
  const globInputErrorMessage = document.getElementById(
    'glob-input-error-message',
  );

  // Constants for error classes from ruleEditor.css
  const inputErrorClassName = 'input-char-limit-error';
  const charCounterErrorClassName = 'char-counter-error';

  // List of banned strings to check against input values due to potential parsing issues.
  const BANNED_STRINGS = ['---'];

  // Get elements for character counters
  const modelDecisionParamCounter = document.getElementById(
    'model-decision-param-counter',
  );
  const globParamCounter = document.getElementById('glob-param-counter');
  const contentCounter = document.getElementById('content-counter');

  // The editor needs to be initialized with the current values of the document
  triggerDropDown.value = trigger;
  modelDecisionParamInput.value = modelDecisionParam;
  globParamInput.value = globParam;

  // Initialize state
  documentState.trigger = triggerDropDown.value;
  documentState.content = contentTextarea.value;
  documentState.modelDecisionParam = modelDecisionParamInput.value;
  documentState.globParam = globParamInput.value;

  // Initialize counter values
  updateCharCounter(
    modelDecisionParamInput,
    modelDecisionParamCounter,
    MAX_DESCRIPTION_LENGTH,
    inputErrorClassName,
    charCounterErrorClassName,
  );
  updateCharCounter(
    globParamInput,
    globParamCounter,
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
  const modelBannedString = hasBannedString(
    modelDecisionParamInput,
    BANNED_STRINGS,
  );
  const globBannedString = hasBannedString(globParamInput, BANNED_STRINGS);
  if (modelBannedString && triggerDropDown.value === 'model_decision') {
    modelDecisionInputErrorMessage.style.display = 'block';
    modelDecisionInputErrorMessage.textContent = `Input contains invalid strings: ${modelBannedString}. Your changes will not be saved.`;
  } else {
    modelDecisionInputErrorMessage.style.display = 'none';
  }
  if (globBannedString && triggerDropDown.value === 'glob') {
    globInputErrorMessage.style.display = 'block';
    globInputErrorMessage.textContent = `Input contains invalid strings: ${globBannedString}. Your changes will not be saved.`;
  } else {
    globInputErrorMessage.style.display = 'none';
  }

  // Set initial visibility of conditional sections
  updateConditionalSections(triggerDropDown.value);
  updateOptionDescription(triggerDropDown.value);

  // Handle changes to the trigger condition
  triggerDropDown.addEventListener('input', () => {
    documentState.trigger = triggerDropDown.value;

    updateConditionalSections(triggerDropDown.value);
    updateOptionDescription(triggerDropDown.value);

    // Notify extension that content changed
    vscode.postMessage({
      type: 'update',
      content: documentState,
    });
  });

  // Handle changes to the model decision parameter
  modelDecisionParamInput.addEventListener('input', () => {
    documentState.modelDecisionParam = modelDecisionParamInput.value;

    // Update character counter
    updateCharCounter(
      modelDecisionParamInput,
      modelDecisionParamCounter,
      MAX_DESCRIPTION_LENGTH,
      inputErrorClassName,
      charCounterErrorClassName,
    );
    const bannedString = hasBannedString(
      modelDecisionParamInput,
      BANNED_STRINGS,
    );
    if (bannedString && triggerDropDown.value === 'model_decision') {
      modelDecisionParamInput.classList.add(inputErrorClassName);
      modelDecisionInputErrorMessage.style.display = 'block';
      modelDecisionInputErrorMessage.textContent = `Input contains invalid strings: ${bannedString}. Your changes will not be saved.`;
    } else {
      modelDecisionParamInput.classList.remove(inputErrorClassName);
      modelDecisionInputErrorMessage.style.display = 'none';
    }

    // Notify extension that content changed
    vscode.postMessage({
      type: 'update',
      content: documentState,
    });
  });

  // Handle changes to the glob parameter
  globParamInput.addEventListener('input', () => {
    documentState.globParam = globParamInput.value;

    // Update character counter
    updateCharCounter(
      globParamInput,
      globParamCounter,
      MAX_DESCRIPTION_LENGTH,
      inputErrorClassName,
      charCounterErrorClassName,
    );
    const bannedString = hasBannedString(globParamInput, BANNED_STRINGS);
    if (bannedString && triggerDropDown.value === 'glob') {
      globParamInput.classList.add(inputErrorClassName);
      globInputErrorMessage.style.display = 'block';
      globInputErrorMessage.textContent = `Input contains invalid strings: ${bannedString}. Your changes will not be saved.`;
    } else {
      globParamInput.classList.remove(inputErrorClassName);
      globInputErrorMessage.style.display = 'none';
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

  // Function to update visibility of conditional sections
  function updateConditionalSections(trigger) {
    if (trigger === 'model_decision') {
      modelDecisionSection.style.display = 'block';
      globSection.style.display = 'none';
      contentTextarea.placeholder = CONDITIONAL_CONTENT_PLACEHOLDER;
    } else if (trigger === 'glob') {
      modelDecisionSection.style.display = 'none';
      globSection.style.display = 'block';
      contentTextarea.placeholder = CONDITIONAL_CONTENT_PLACEHOLDER;
    } else {
      modelDecisionSection.style.display = 'none';
      globSection.style.display = 'none';
      contentTextarea.placeholder = NON_CONDITIONAL_CONTENT_PLACEHOLDER;
    }
  }

  // Function to update option descriptions
  function updateOptionDescription(selectedOption) {
    // Hide all descriptions
    const descriptions = document.getElementsByClassName('option-description');
    for (let i = 0; i < descriptions.length; i++) {
      descriptions[i].style.display = 'none';
    }

    // Show only the selected option's description
    const selectedDesc = document.getElementById(
      `${selectedOption.replace('_', '-')}-desc`,
    );
    if (selectedDesc) {
      selectedDesc.style.display = 'block';
    }
  }
});
