// Button State Management
// Computes button enabled/disabled states and handles reset logic

function computeButtonState(criteria) {
  const { smsInput = '', isParsed = false } = criteria;

  const isSmsInputEmpty = !smsInput || smsInput.trim() === '';

  return {
    parseEnabled: !isSmsInputEmpty,
    searchEnabled: isParsed,
    resetEnabled: true  // Always enabled per spec
  };
}

function handleReset(currentState) {
  // Reset only clears SMS input
  // Preserves parsedData, searchResults, parseError, searchError per spec
  return {
    ...currentState,
    smsInput: ''
  };
}

// Export for Node.js (Jest)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { computeButtonState, handleReset };
}

// Also expose to global scope for browser <script> usage
if (typeof window !== 'undefined') {
  window.computeButtonState = computeButtonState;
  window.handleReset = handleReset;
}
