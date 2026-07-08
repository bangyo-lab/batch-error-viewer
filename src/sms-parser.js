// SMS Parser - Extracts batch error information from SMS text
// Based on app.js implementation

function parseSMS(smsText) {
  // Input validation
  if (!smsText || typeof smsText !== 'string' || smsText.trim() === '') {
    return { error: 'SMS 내용이 비어있습니다' };
  }

  try {
    // 1. Extract GROUP_ID and RUN_ID (consecutive [UPPERCASE+DIGITS] patterns)
    const groupRunMatch = smsText.match(/\[([A-Z]+\d+)\]\[([A-Z]+\d+)\]/);
    if (!groupRunMatch) {
      return { error: 'GROUP_ID를 찾을 수 없습니다. SMS 메시지 형식을 다시 확인해주세요.' };
    }

    const groupId = groupRunMatch[1];
    const runId = groupRunMatch[2];

    // 2. Extract job name - find first bracket after RUN_ID
    const afterRunId = smsText.substring(smsText.indexOf(runId) + runId.length);
    const jobNameMatch = afterRunId.match(/\[([^\[\]]+)\]/);

    if (!jobNameMatch) {
      return { error: 'job명을 찾을 수 없습니다. SMS 메시지 형식을 다시 확인해주세요.' };
    }

    const jobName = jobNameMatch[1];

    // 3. Extract optional SEQ_ID (seq_-prefixed token, anywhere in message)
    const seqIdMatch = smsText.match(/seq_[a-zA-Z0-9_]+/);
    const seqId = seqIdMatch ? seqIdMatch[0] : null;

    return {
      groupId,
      runId,
      seqId,
      jobName
    };
  } catch (error) {
    return { error: `SMS 파싱 중 오류 발생: ${error.message}` };
  }
}

// Export for Node.js (Jest)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseSMS };
}
// Also expose to global scope for browser <script> usage
if (typeof window !== 'undefined') {
  window.parseSMS = parseSMS;
}
