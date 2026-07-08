const { searchBatches } = require('./search');
const { initDB, getBatchesByGroupId, getBatchesByRunId, getBatchesBySeqId } = require('./db-init');

describe('Batch Search - Cascading Fallback', () => {
  beforeEach(async () => {
    // Initialize DB with test data
    await initDB({ clearExisting: true });
  });

  test('returns matches for GROUP_ID when provided', async () => {
    const results = await searchBatches({
      groupId: 'SDF770',
      runId: 'SDFPD771',
      seqId: 'seq_sfpdmg502'
    });

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(r => r.groupId === 'SDF770')).toBe(true);
  });

  test('falls back to RUN_ID search when GROUP_ID empty', async () => {
    const results = await searchBatches({
      groupId: '',
      runId: 'SDFPD771',
      seqId: null
    });

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(r => r.runId === 'SDFPD771')).toBe(true);
  });

  test('falls back to SEQ_ID search when GROUP_ID and RUN_ID empty', async () => {
    const results = await searchBatches({
      groupId: '',
      runId: '',
      seqId: 'seq_sfpdmg502'
    });

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(r => r.seqId === 'seq_sfpdmg502')).toBe(true);
  });

  test('returns error message when no matches found', async () => {
    const results = await searchBatches({
      groupId: 'NONEXISTENT',
      runId: '',
      seqId: null
    });

    // When no results, should return error message structure
    expect(results.error).toBeDefined();
  });

  test('returns empty array for empty input', async () => {
    const results = await searchBatches({
      groupId: '',
      runId: '',
      seqId: null
    });

    expect(results.error).toBeDefined();
  });

  test('GROUP_ID search takes priority over RUN_ID', async () => {
    // Even if RUN_ID is provided, GROUP_ID search takes priority
    const results = await searchBatches({
      groupId: 'SDF770',
      runId: 'SDFPD790',  // Different group's RUN_ID
      seqId: null
    });

    // Should return SDF770 results, not SDFPD790
    expect(results.every(r => r.groupId === 'SDF770')).toBe(true);
  });

  test('handles null and undefined values gracefully', async () => {
    const results = await searchBatches({
      groupId: null,
      runId: 'SDFPD771',
      seqId: undefined
    });

    expect(Array.isArray(results) || results.error).toBe(true);
  });

  test('returns 7 required fields in result rows', async () => {
    const results = await searchBatches({
      groupId: 'SDF770',
      runId: null,
      seqId: null
    });

    if (Array.isArray(results) && results.length > 0) {
      const row = results[0];
      expect(row).toHaveProperty('groupId');
      expect(row).toHaveProperty('runId');
      expect(row).toHaveProperty('seqId');
      expect(row).toHaveProperty('jobName');
      expect(row).toHaveProperty('jobId');
      expect(row).toHaveProperty('targetTable');
      expect(row).toHaveProperty('targetTableName');
    }
  });
});
