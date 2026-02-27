/**
 * Checks if any part of the input contains any banned string and returns the first found banned string
 * @param {*} inputElement The input box where the text is inputed.
 * @param {*} BANNED_STRINGS The list of banned strings to check against.
 * @returns {string|undefined} The first banned string that was found, or undefined if none was found
 */
function hasBannedString(inputElement, BANNED_STRINGS) {
  if (!inputElement || !BANNED_STRINGS.length) return undefined;

  const lowerInput = inputElement.value.toLowerCase();

  // Find the first banned string that exists in the input
  for (const banned of BANNED_STRINGS) {
    if (banned && lowerInput.includes(banned.toLowerCase())) {
      return banned; // Return the actual banned string that was found
    }
  }

  return undefined; // No banned string was found
}

/**
 * Updates the character counter and input validation classes based on the input element's value count
 * and checks for banned strings.
 *
 * @param {*} inputElement The input box where the text is inputed.
 * @param {*} counterElement The element that displays the character count.
 * @param {*} MAX_DESCRIPTION_LENGTH The maximum allowed length for the input.
 * @param {*} inputErrorClassName The css class name for input validation errors.
 * @param {*} counterErrorClassName The css class name for counter validation errors.
 */
function updateCharCounter(
  inputElement,
  counterElement,
  MAX_DESCRIPTION_LENGTH,
  inputErrorClassName,
  counterErrorClassName,
) {
  const currentLength = inputElement.value.length;

  // Note(max): we'll use data attributes + CSS to render the counter
  // instead of directly modifying innerHTML/textContent, which was messing
  // with the document's undo stack since we run this on every change: each character
  // typed was being registered as a separate undoable action.
  counterElement.setAttribute('data-current', currentLength);
  counterElement.setAttribute('data-max', MAX_DESCRIPTION_LENGTH);

  // Check for banned strings or if length exceeds max
  const exceedsLength = currentLength >= MAX_DESCRIPTION_LENGTH;

  if (exceedsLength) {
    inputElement.classList.add(inputErrorClassName);
    counterElement.classList.add(counterErrorClassName);
  } else {
    inputElement.classList.remove(inputErrorClassName);
    counterElement.classList.remove(counterErrorClassName);
  }
}
