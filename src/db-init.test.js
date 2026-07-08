const {
  initDB,
  getBatchesByGroupId,
  getBatchesByRunId,
  getBatchesBySeqId,
  getDBStatus
} = require('./db-init');

describe('Database Initialization', () => {
  beforeEach(async () => {
    // DB 초기화 전에 기존 데이터 정리
    await initDB({ clearExisting: true });
  });

  test('initializes IndexedDB successfully', async () => {
    const result = await initDB();
    expect(result.success).toBe(true);
  });

  test('creates batches table with correct schema', async () => {
    const result = await initDB();
    expect(result.tablesCreated).toContain('batches');
  });

  test('loads batch data from data.json', async () => {
    const result = await initDB();
    expect(result.recordsLoaded).toBeGreaterThanOrEqual(6);
  });

  test('does not duplicate data on second initialization', async () => {
    const result1 = await initDB();
    const count1 = result1.recordsLoaded;

    const result2 = await initDB();
    const count2 = result2.recordsLoaded;

    expect(count1).toBe(count2);
  });

  test('allows querying by groupId after initialization', async () => {
    await initDB();
    const results = await getBatchesByGroupId('SDF770');

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].groupId).toBe('SDF770');
  });

  test('allows querying by runId after initialization', async () => {
    await initDB();
    const results = await getBatchesByRunId('SDFPD771');

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].runId).toBe('SDFPD771');
  });

  test('allows querying by seqId after initialization', async () => {
    await initDB();
    const results = await getBatchesBySeqId('seq_sfpdmg502');

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].seqId).toBe('seq_sfpdmg502');
  });

  test('returns empty array when no matches found', async () => {
    await initDB();
    const results = await getBatchesByGroupId('NONEXISTENT');

    expect(results).toEqual([]);
  });

  test('returns error when data loading fails', async () => {
    const result = await initDB({ clearExisting: true, dataPath: '/invalid/path.json' });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('provides database status', async () => {
    await initDB();
    const status = await getDBStatus();

    expect(status.initialized).toBe(true);
    expect(status.totalRecords).toBeGreaterThanOrEqual(6);
  });

  test('each loaded record has all 7 required fields', async () => {
    await initDB();
    const results = await getBatchesByGroupId('SDF770');

    expect(results[0]).toHaveProperty('groupId');
    expect(results[0]).toHaveProperty('runId');
    expect(results[0]).toHaveProperty('seqId');
    expect(results[0]).toHaveProperty('jobName');
    expect(results[0]).toHaveProperty('jobId');
    expect(results[0]).toHaveProperty('targetTable');
    expect(results[0]).toHaveProperty('targetTableName');
  });
});
