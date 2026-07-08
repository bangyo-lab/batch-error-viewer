// Cascading fallback search for batches
// Priority: GROUP_ID → RUN_ID → SEQ_ID

// Get db functions (works in both Node and browser)
let getBatchesByGroupId, getBatchesByRunId, getBatchesBySeqId;

if (typeof module !== 'undefined' && module.exports && typeof require !== 'undefined') {
  // Node/Jest environment
  const dbInit = require('./db-init');
  getBatchesByGroupId = dbInit.getBatchesByGroupId;
  getBatchesByRunId = dbInit.getBatchesByRunId;
  getBatchesBySeqId = dbInit.getBatchesBySeqId;
} else if (typeof window !== 'undefined') {
  // Browser environment - will be set after db-init.js loads
  // Use lazy binding
  getBatchesByGroupId = (...args) => window.getBatchesByGroupId(...args);
  getBatchesByRunId = (...args) => window.getBatchesByRunId(...args);
  getBatchesBySeqId = (...args) => window.getBatchesBySeqId(...args);
}

async function searchBatches(criteria) {
  const { groupId, runId, seqId } = criteria;

  // Normalize empty/null values
  const normalizedGroupId = groupId?.trim() || null;
  const normalizedRunId = runId?.trim() || null;
  const normalizedSeqId = seqId?.trim() || null;

  try {
    // 1. Try GROUP_ID search first
    if (normalizedGroupId) {
      const results = await getBatchesByGroupId(normalizedGroupId);
      if (results.length > 0) {
        return results;
      }
    }

    // 2. Fall back to RUN_ID search
    if (normalizedRunId) {
      const results = await getBatchesByRunId(normalizedRunId);
      if (results.length > 0) {
        return results;
      }
    }

    // 3. Fall back to SEQ_ID search
    if (normalizedSeqId) {
      const results = await getBatchesBySeqId(normalizedSeqId);
      if (results.length > 0) {
        return results;
      }
    }

    // 4. No matches found - return error
    return {
      error: buildErrorMessage(normalizedGroupId, normalizedRunId, normalizedSeqId)
    };
  } catch (error) {
    return {
      error: `검색 중 오류가 발생했습니다: ${error.message}`
    };
  }
}

function buildErrorMessage(groupId, runId, seqId) {
  let message = '';

  if (groupId) {
    message = `GROUP_ID ${groupId}`;
  } else if (runId) {
    message = `RUN_ID ${runId}`;
  } else if (seqId) {
    message = `SEQ_ID ${seqId}`;
  } else {
    message = '검색 조건';
  }

  message += '과 일치하는 배치가 없습니다. SMS 정보를 다시 확인해주세요.';
  return message;
}

// Export for Node.js (Jest)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { searchBatches };
}

// Also expose to global scope for browser <script> usage
if (typeof window !== 'undefined') {
  window.searchBatches = searchBatches;
}
