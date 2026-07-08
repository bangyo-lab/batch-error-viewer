// Handle both Node.js and browser environments
let Dexie, fs, path;
let db = null;
let isInitialized = false;

if (typeof module !== 'undefined' && module.exports && typeof require !== 'undefined') {
  // Node.js environment (Jest)
  Dexie = require('dexie').default;
  fs = require('fs');
  path = require('path');
} else {
  // Browser environment - use global Dexie
  Dexie = window.Dexie;
}

class BatchDB extends Dexie {
  constructor() {
    super('BatchDB');
    this.version(1).stores({
      batches: '++, groupId, runId, seqId'
    });
  }
}

async function loadBatchData(dataPath) {
  try {
    let fullPath;
    if (dataPath) {
      fullPath = dataPath;
    } else {
      // 프로젝트 루트에서 data.json 찾기
      fullPath = path.join(process.cwd(), 'data.json');
    }

    // 파일 존재 여부 확인 및 읽기
    if (!fs.existsSync(fullPath)) {
      throw new Error(`파일을 찾을 수 없습니다: ${fullPath}`);
    }

    const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
    return { success: true, data };
  } catch (error) {
    return { success: false, error: `데이터 로드 실패: ${error.message}` };
  }
}

async function initDB(options = {}) {
  const { clearExisting = false, dataPath = null } = options;

  try {
    // Database 생성
    if (!db) {
      db = new BatchDB();
    }

    // 기존 데이터 삭제 옵션
    if (clearExisting) {
      await db.batches.clear();
      isInitialized = false;
    }

    // 이미 초기화됨
    if (isInitialized) {
      const count = await db.batches.count();
      return {
        success: true,
        tablesCreated: ['batches'],
        recordsLoaded: count,
        message: '데이터베이스가 이미 초기화되었습니다'
      };
    }

    // 데이터 로드
    const loadResult = await loadBatchData(dataPath);
    if (!loadResult.success) {
      return {
        success: false,
        error: loadResult.error
      };
    }

    // 데이터 삽입
    const batchData = loadResult.data;
    if (!Array.isArray(batchData) || batchData.length === 0) {
      return {
        success: false,
        error: '유효한 배치 데이터가 없습니다'
      };
    }

    await db.batches.bulkAdd(batchData);
    isInitialized = true;

    return {
      success: true,
      tablesCreated: ['batches'],
      recordsLoaded: batchData.length,
      message: `${batchData.length}개의 배치 정보가 로드되었습니다`
    };
  } catch (error) {
    return {
      success: false,
      error: `DB 초기화 실패: ${error.message}`
    };
  }
}

async function getBatchesByGroupId(groupId) {
  if (!db || !isInitialized) {
    throw new Error('데이터베이스가 초기화되지 않았습니다');
  }
  return await db.batches.where('groupId').equals(groupId).toArray();
}

async function getBatchesByRunId(runId) {
  if (!db || !isInitialized) {
    throw new Error('데이터베이스가 초기화되지 않았습니다');
  }
  return await db.batches.where('runId').equals(runId).toArray();
}

async function getBatchesBySeqId(seqId) {
  if (!db || !isInitialized) {
    throw new Error('데이터베이스가 초기화되지 않았습니다');
  }
  return await db.batches.where('seqId').equals(seqId).toArray();
}

async function getDBStatus() {
  if (!db) {
    return { initialized: false, totalRecords: 0 };
  }

  const totalRecords = await db.batches.count();
  return {
    initialized: isInitialized,
    totalRecords
  };
}

// Browser environment
if (typeof window !== 'undefined') {
  window.initDB = initDB;
  window.getBatchesByGroupId = getBatchesByGroupId;
  window.getBatchesByRunId = getBatchesByRunId;
  window.getBatchesBySeqId = getBatchesBySeqId;
  window.getDBStatus = getDBStatus;
  // Alias for loading data
  window.loadDataToDB = async (data) => {
    if (!db) {
      db = new BatchDB();
    }
    if (!isInitialized) {
      await db.open();
      isInitialized = true;
    }
    await db.batches.clear();
    await db.batches.bulkAdd(data);
  };
}

// Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initDB,
    getBatchesByGroupId,
    getBatchesByRunId,
    getBatchesBySeqId,
    getDBStatus
  };
}
