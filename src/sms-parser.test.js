const { parseSMS } = require('./sms-parser');

describe('SMS Parser (app.js compatible)', () => {
  const validSMS = '[배치자동화]작업에러[260710][14:30][SDF770][SDFPD771][FW1차_오늘농사_수출입실적날씨월통계(16일)]seq_sfpdmg502...';

  test('extracts GROUP_ID and RUN_ID from SMS', () => {
    const result = parseSMS(validSMS);
    expect(result.groupId).toBe('SDF770');
    expect(result.runId).toBe('SDFPD771');
  });

  test('extracts job name after RUN_ID', () => {
    const result = parseSMS(validSMS);
    expect(result.jobName).toBe('FW1차_오늘농사_수출입실적날씨월통계(16일)');
  });

  test('extracts optional SEQ_ID from message body', () => {
    const result = parseSMS(validSMS);
    expect(result.seqId).toBe('seq_sfpdmg502');
  });

  test('returns null for seqId when not present', () => {
    const smsWithoutSeq = '[배치자동화]작업에러[260710][14:30][SDF770][SDFPD771][job명]';
    const result = parseSMS(smsWithoutSeq);
    expect(result.seqId).toBeNull();
  });

  test('returns all 4 fields on success', () => {
    const result = parseSMS(validSMS);
    expect(result).toHaveProperty('groupId');
    expect(result).toHaveProperty('runId');
    expect(result).toHaveProperty('seqId');
    expect(result).toHaveProperty('jobName');
    expect(result.error).toBeUndefined();
  });

  test('returns error when GROUP_ID not found', () => {
    const invalidSMS = '[배치자동화]작업에러[260710][14:30]NOGROUP[SDFPD771][job]';
    const result = parseSMS(invalidSMS);
    expect(result.error).toContain('GROUP_ID');
  });

  test('returns error when RUN_ID (second bracket pair) not found', () => {
    // Missing the second [RUN_ID] bracket pair
    const invalidSMS = '[배치자동화]작업에러[260710][14:30][SDF770][job]';
    const result = parseSMS(invalidSMS);
    // Since we only have [SDF770], regex won't match two consecutive bracket pairs
    expect(result.error).toContain('GROUP_ID');
  });

  test('returns error when job name not found', () => {
    const invalidSMS = '[배치자동화]작업에러[260710][14:30][SDF770][SDFPD771]';
    const result = parseSMS(invalidSMS);
    expect(result.error).toContain('job명');
  });

  test('handles empty input', () => {
    const result = parseSMS('');
    expect(result.error).toBeDefined();
  });

  test('handles null input', () => {
    const result = parseSMS(null);
    expect(result.error).toBeDefined();
  });

  test('handles SMS with multiple possible SEQ_ID patterns', () => {
    const sms = '[배치자동화]작업에러[260710][14:30][ID1][ID2][job]seq_abc123_def seq_xyz_789';
    const result = parseSMS(sms);
    // Should match first seq_ pattern
    expect(result.seqId).toBe('seq_abc123_def');
  });
});
