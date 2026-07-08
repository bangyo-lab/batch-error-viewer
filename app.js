// IndexedDB 초기화
let db;

async function initializeDB() {
  db = new Dexie('BatchDB');
  db.version(1).stores({
    batches: '++, groupId, runId, seqId'
  });
}

async function loadDataToDB(data) {
  try {
    // 기존 데이터 삭제
    await db.batches.clear();

    // 새 데이터 저장
    await db.batches.bulkAdd(data);

    // 데이터 저장 시간 기록
    localStorage.setItem('batchDataCount', data.length);
    localStorage.setItem('batchDataLastLoaded', new Date().toLocaleString('ko-KR'));

    console.log(`✅ IndexedDB 초기화 완료. ${data.length}개 배치 정보 로드됨`);
    hideLoadModal();
    updateDataStatus();
    smsInput.focus();
  } catch (error) {
    console.error('❌ DB 로드 실패:', error);
    alert('데이터 로드 중 오류가 발생했습니다: ' + error.message);
  }
}

function updateDataStatus() {
  const dataStatus = document.getElementById('dataStatus');
  const dataStatusText = document.getElementById('dataStatusText');
  const count = localStorage.getItem('batchDataCount');
  const lastLoaded = localStorage.getItem('batchDataLastLoaded');

  if (count) {
    dataStatusText.textContent = `✅ 배치 정보 ${count}개 로드됨 (${lastLoaded})`;
    dataStatus.classList.remove('hidden');
  } else {
    dataStatus.classList.add('hidden');
  }
}

async function checkDataExists() {
  const count = await db.batches.count();
  console.log(`📊 IndexedDB에 저장된 배치 정보: ${count}개`);

  if (count > 0) {
    // 데이터가 있으면 모달 숨기고 상태 표시
    hideLoadModal();
    updateDataStatus();
    smsInput.focus();
  } else {
    // 데이터가 없으면 모달 표시
    showLoadModal();
  }
}

// 컬럼명 정규화 함수 (언더바, 띄어쓰기, 대소문자 모두 통일)
function normalizeColumnName(name) {
  if (!name) return '';
  return name.toLowerCase().replace(/[_\s]/g, '');
}

// 행 데이터에서 컬럼값 찾기
function getRowValue(row, ...columnNames) {
  for (const colName of columnNames) {
    const normalizedTarget = normalizeColumnName(colName);

    for (const key in row) {
      if (normalizeColumnName(key) === normalizedTarget) {
        const value = row[key];
        return String(value || '').trim();
      }
    }
  }
  return '';
}

// 엑셀 파일을 JSON으로 변환
function readExcelFile(file) {
  console.log('📁 파일 읽기 시작:', file.name, 'SheetJS 확인:', typeof XLSX !== 'undefined');

  if (typeof XLSX === 'undefined') {
    alert('SheetJS 라이브러리를 로드할 수 없습니다. 페이지를 새로고침해주세요.');
    return;
  }

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      console.log('📊 파일 데이터 읽음, 크기:', data.length);

      const workbook = XLSX.read(data, { type: 'array' });
      console.log('📖 워크북 로드 완료, 시트:', workbook.SheetNames);

      // 모든 시트에서 데이터 읽기
      let allData = [];

      workbook.SheetNames.forEach((sheetName, index) => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        console.log(`📋 시트 "${sheetName}" 변환 완료, 행 수: ${jsonData.length}`);

        // 컬럼명 정규화 (언더바, 띄어쓰기, 대소문자 모두 통일)
        const normalizedData = jsonData.map(row => ({
          groupId: getRowValue(row, 'GROUP_ID', 'GROUP ID', 'groupId', 'group_id', 'group id'),
          runId: getRowValue(row, 'RUN_ID', 'RUN ID', 'runId', 'run_id', 'run id'),
          seqId: getRowValue(row, 'SEQ_ID', 'SEQ ID', 'seqId', 'seq_id', 'seq id'),
          jobName: getRowValue(row, 'job명', 'jobName', 'job_name', 'job name', 'JOB_NAME', 'JOB NAME'),
          jobId: getRowValue(row, 'JOB_ID', 'JOB ID', 'jobId', 'job_id', 'job id'),
          targetTable: getRowValue(row, '타겟테이블', 'targetTable', 'target_table', 'target table', 'TARGET_TABLE', 'TARGET TABLE'),
          targetTableName: getRowValue(row, '타겟테이블명', 'targetTableName', 'target_table_name', 'target table name', 'TARGET_TABLE_NAME', 'TARGET TABLE NAME')
        }));

        allData = allData.concat(normalizedData);
      });

      if (allData.length === 0) {
        alert('엑셀 파일에 데이터가 없습니다.');
        return;
      }

      console.log(`✅ 모든 시트 변환 완료! 총 ${allData.length}개 행`);
      console.log('📊 샘플 데이터:', allData.slice(0, 3));
      loadDataToDB(allData);
    } catch (error) {
      console.error('❌ 엑셀 파일 읽기 실패:', error);
      alert('엑셀 파일을 읽을 수 없습니다.\n\n오류: ' + error.message + '\n\n엑셀 형식이 올바른지 확인해주세요. (.xlsx 또는 .csv 권장)');
    }
  };

  reader.onerror = (error) => {
    console.error('❌ 파일 읽기 에러:', error);
    alert('파일을 읽을 수 없습니다. 다시 시도해주세요.');
  };

  reader.readAsArrayBuffer(file);
}

// DOM 요소
const loadModal = document.getElementById('loadModal');
const dataStatus = document.getElementById('dataStatus');
const exportDataBtn = document.getElementById('exportDataBtn');
const resetDataBtn = document.getElementById('resetDataBtn');
const excelFile = document.getElementById('excelFile');
const uploadExcelBtn = document.getElementById('uploadExcelBtn');
const useDefaultBtn = document.getElementById('useDefaultBtn');
const smsInput = document.getElementById('smsInput');
const parseBtn = document.getElementById('parseBtn');
const resetBtn = document.getElementById('resetBtn');
const searchBtn = document.getElementById('searchBtn');
const parseResult = document.getElementById('parseResult');
const resultTable = document.getElementById('resultTable');
const parseError = document.getElementById('parseError');
const searchError = document.getElementById('searchError');

// 상태 관리
let parsedData = null;

// SMS 입력 감지
smsInput.addEventListener('input', () => {
  parseBtn.disabled = smsInput.value.trim() === '';
});

// [파싱] 버튼
parseBtn.addEventListener('click', handleParseClick);

// [초기화] 버튼 - SMS 입력만 지우고 파싱/검색 결과는 유지 (스펙 준수)
resetBtn.addEventListener('click', () => {
  smsInput.value = '';
  smsInput.focus();
  parseBtn.disabled = true;
  // 스펙: 파싱 결과와 검색 결과는 유지되어야 함
  // searchBtn은 파싱이 없어지면 자동으로 비활성화되어야 하므로 유지
});

// [검색] 버튼
searchBtn.addEventListener('click', handleSearchClick);

// SMS 파싱 - 모듈 함수 활용
function handleParseClick() {
  const smsText = smsInput.value.trim();
  clearParseError();

  // window.parseSMS는 src/sms-parser.js에서 제공됨
  const result = window.parseSMS(smsText);

  if (result.error) {
    console.error('❌ SMS 파싱 실패:', result.error);
    showError('parseError', result.error);
    parsedData = null;
    searchBtn.disabled = true;
    clearParseResult();
  } else {
    parsedData = {
      groupId: result.groupId,
      runId: result.runId,
      seqId: result.seqId,
      jobName: result.jobName
    };
    console.log('✅ SMS 파싱 성공:', parsedData);
    displayParseResult(parsedData);
    searchBtn.disabled = false;
  }
}

// 파싱 결과 표시
function displayParseResult(data) {
  document.getElementById('groupIdResult').textContent = data.groupId;
  document.getElementById('runIdResult').textContent = data.runId;
  document.getElementById('seqIdResult').textContent = data.seqId || '-';
  document.getElementById('jobNameResult').textContent = data.jobName;
}

// 파싱 결과 초기화
function clearParseResult() {
  document.getElementById('groupIdResult').textContent = '-';
  document.getElementById('runIdResult').textContent = '-';
  document.getElementById('seqIdResult').textContent = '-';
  document.getElementById('jobNameResult').textContent = '-';
}

// 배치 검색 - 모듈 함수 활용 (순차 폴백)
async function handleSearchClick() {
  if (!parsedData) return;

  clearSearchError();
  clearSearchResults();

  try {
    console.log('🔍 검색 조건:', {
      groupId: parsedData.groupId,
      runId: parsedData.runId,
      seqId: parsedData.seqId
    });

    // window.searchBatches는 src/search.js에서 제공됨 (순차 폴백 검색)
    const results = await window.searchBatches({
      groupId: parsedData.groupId,
      runId: parsedData.runId,
      seqId: parsedData.seqId
    });

    if (results.error) {
      console.error('❌ 검색 결과 없음:', results.error);
      showError('searchError', results.error);
    } else {
      console.log(`✅ 검색 완료: ${results.length}개 행`);
      displaySearchResults(results);
    }

  } catch (error) {
    console.error('❌ 검색 오류:', error);
    showError('searchError', '검색 중 오류가 발생했습니다. 다시 시도해주세요.');
  }
}

// 검색 결과 표시
function displaySearchResults(results) {
  const tbody = resultTable.querySelector('tbody');
  tbody.innerHTML = '';

  results.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.groupId}</td>
      <td>${row.runId}</td>
      <td>${row.seqId}</td>
      <td>${row.jobName}</td>
      <td>${row.jobId}</td>
      <td>${row.targetTable}</td>
      <td>${row.targetTableName}</td>
    `;
    tbody.appendChild(tr);
  });

  // 후행/영향도 정보 표시
  displayDependencyInfo(results);
}

// 후행/영향도 정보 표시
function displayDependencyInfo(results) {
  const dependenciesSection = document.getElementById('dependenciesSection');
  const impactsSection = document.getElementById('impactsSection');
  const dependenciesInfo = document.getElementById('dependenciesInfo');
  const impactsInfo = document.getElementById('impactsInfo');

  const dependencies = JSON.parse(sessionStorage.getItem('batchDependencies') || '[]');
  const impacts = JSON.parse(sessionStorage.getItem('batchImpacts') || '[]');

  if (dependencies.length === 0 && impacts.length === 0) {
    dependenciesSection.style.display = 'none';
    impactsSection.style.display = 'none';
    return;
  }

  // 선택된 배치의 JOB_ID
  const selectedJobIds = results.map(r => r.jobId);

  // 후행 배치 찾기 (선택된 배치가 source인 의존성)
  const followingBatches = dependencies.filter(dep =>
    selectedJobIds.includes(dep.source)
  );

  if (followingBatches.length > 0) {
    dependenciesSection.style.display = 'block';
    dependenciesInfo.innerHTML = followingBatches
      .map(dep => `
        <div class="dependency-item">
          <strong>${dep.source}</strong>
          <span class="dependency-arrow">→</span>
          <strong>${dep.target}</strong>
          <span style="color: #9ca3af;">via ${dep.link}</span>
        </div>
      `)
      .join('');
  } else {
    dependenciesSection.style.display = 'none';
  }

  // 영향도 찾기 (선택된 배치가 source인 영향도)
  const affectedJobs = impacts.filter(impact =>
    selectedJobIds.includes(impact.source)
  );

  if (affectedJobs.length > 0) {
    impactsSection.style.display = 'block';
    impactsInfo.innerHTML = affectedJobs
      .map(impact => `
        <div class="dependency-item">
          <span class="impact-badge ${impact.severity}">
            ${impact.severity === 'high' ? '🔴' : impact.severity === 'medium' ? '🟡' : '🟢'}
            ${impact.severity.toUpperCase()}
          </span>
          <strong>${impact.source}</strong> 실패 시
          <strong>${impact.count}개</strong> 배치 영향:
          <br>
          <span style="color: #6b7280;">${impact.affected.join(', ')}</span>
        </div>
      `)
      .join('');
  } else {
    impactsSection.style.display = 'none';
  }
}

// 검색 결과 초기화
function clearSearchResults() {
  const tbody = resultTable.querySelector('tbody');
  tbody.innerHTML = '<tr class="empty-row"><td colspan="7">검색 결과가 없습니다.</td></tr>';
}

// 에러 메시지 표시
function showError(elementId, message) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.style.display = 'block';
}

// 에러 메시지 초기화
function clearParseError() {
  parseError.textContent = '';
  parseError.style.display = 'none';
}

function clearSearchError() {
  searchError.textContent = '';
  searchError.style.display = 'none';
}

// 모달 함수
function showLoadModal() {
  loadModal.classList.remove('hidden');
}

function hideLoadModal() {
  loadModal.classList.add('hidden');
}

// 모달 이벤트
uploadExcelBtn.addEventListener('click', () => {
  if (!excelFile.files[0]) {
    alert('파일을 선택해주세요.');
    return;
  }
  readExcelFile(excelFile.files[0]);
});

useDefaultBtn.addEventListener('click', async () => {
  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error('data.json 로드 실패');
    const data = await response.json();
    await loadDataToDB(data);
  } catch (error) {
    alert('기본 데이터 로드 실패: ' + error.message);
  }
});

// 데이터 내보내기 버튼
exportDataBtn.addEventListener('click', async () => {
  try {
    const data = await db.batches.toArray();
    const jsonString = JSON.stringify(data, null, 2);

    // 다운로드
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `batch-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    console.log(`✅ 데이터 내보내기 완료 (${data.length}개 행)`);
  } catch (error) {
    console.error('❌ 데이터 내보내기 실패:', error);
    alert('데이터 내보내기에 실패했습니다: ' + error.message);
  }
});

// 데이터 재설정 버튼
resetDataBtn.addEventListener('click', () => {
  if (confirm('기존 데이터를 지우고 새 파일을 업로드하시겠습니까?')) {
    excelFile.value = '';
    showLoadModal();
  }
});

// 앱 초기화
window.addEventListener('load', async () => {
  await initializeDB();

  // batches.json이 있으면 우선적으로 로드 (운영서버 데이터)
  try {
    const response = await fetch('batches.json');
    if (response.ok) {
      const batchData = await response.json();
      // batches.json의 jobs 배열 추출
      const jobsArray = Object.values(batchData.jobs || {});
      if (jobsArray.length > 0) {
        console.log('[INFO] 운영서버 batches.json 로드 중...');
        await loadDataToDB(jobsArray);

        // 메타 정보 저장 (후행/영향도)
        sessionStorage.setItem('batchDependencies', JSON.stringify(batchData.dependencies || []));
        sessionStorage.setItem('batchImpacts', JSON.stringify(batchData.impacts || []));

        return;
      }
    }
  } catch (error) {
    console.log('[DEBUG] batches.json 로드 실패, data.json 사용', error.message);
  }

  // batches.json이 없으면 기존 data.json 로드
  await checkDataExists();
});
