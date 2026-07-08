# 배치 오류 조회 - 코드 비교 분석 & 통합 전략

**작성일**: 2026-07-08  
**비교 대상**: 저장소 기존 구현 vs 개선된 구현  
**목표**: 최적의 통합 방식 결정

---

## 1️⃣ 전체 구조 비교

| 항목 | 저장소 (기존) | 개선 구현 | 권장 |
|------|----------|---------|------|
| **HTML 방식** | 좌우 패널 분할 | 헤더 + 3열 그리드 | 혼합 |
| **데이터 관리** | IndexedDB + Dexie | localStorage | IndexedDB (더 강력) |
| **엑셀 읽기** | SheetJS CDN | 없음 | SheetJS 유지 |
| **기본 데이터** | data.json 제공 | 하드코딩 예제 | data.json 사용 |
| **CSS 프레임워크** | 커스텀 | 미니멀 | 통합 필요 |
| **DSX 파싱** | 없음 | 완전 구현 | 추가 |

---

## 2️⃣ 주요 기능별 비교

### 2.1 SMS 파싱 로직

**저장소 (기존)**
```javascript
// 정규식 기반, 견고한 에러 처리
const groupRunMatch = smsText.match(/\[([A-Z]+\d+)\]\[([A-Z]+\d+)\]/);
if (!groupRunMatch) {
  throw new Error('GROUP_ID를 찾을 수 없습니다...');
}
```
- ✅ 검증됨
- ✅ 상세 에러 메시지
- ✅ 여러 상황 대응

**개선 구현**
```javascript
// 유사하지만 더 간단한 버전
const br = [...text.matchAll(/\[([^\[\]]*)\]/g)].map(m => m[1].trim());
// 추출된 배열에서 ID 찾기
```
- ✅ 작동
- ⚠️ 에러 처리 덜함
- ⚠️ 정규식 복잡도 높음

**결론**: **저장소 로직 유지** (더 견고함)

---

### 2.2 데이터 관리

**저장소 (기존)**
```javascript
// IndexedDB + Dexie.js
db.version(1).stores({
  batches: '++, groupId, runId, seqId'  // 3개 인덱스
});
```
- ✅ 빠른 검색 성능
- ✅ 대용량 데이터 지원
- ✅ 구조화된 쿼리
- ⚠️ 라이브러리 의존도 (Dexie.js)

**개선 구현**
```javascript
// localStorage 기반
localStorage.setItem('batchErr.history.v1', JSON.stringify(history));
```
- ✅ 간단함
- ⚠️ 용량 제한 (5MB)
- ⚠️ 구조화된 검색 불가

**결론**: **저장소 방식 유지** (프로덕션 환경에 적합)

---

### 2.3 검색 로직

**저장소 (기존)**
```javascript
// AND 조건 검색
let results = await db.batches
  .where('groupId')
  .equals(parsedData.groupId)
  .and(row => row.runId === parsedData.runId)
  .toArray();

// SEQ_ID 추가 필터링
if (parsedData.seqId) {
  results = results.filter(row => row.seqId === parsedData.seqId);
}
```
- ✅ 명확한 우선순위 (GROUP_ID + RUN_ID)
- ✅ 부분 매칭 지원
- ✅ 확장성 좋음

**개선 구현**
```javascript
// 단순 배열 필터링
const rec = JOB_DB[jobId];  // 직접 조회
```
- ✅ 빠름 (작은 데이터)
- ⚠️ 확장 불가능

**결론**: **저장소 로직 유지**

---

### 2.4 UI/UX

**저장소 (기존)**
```html
<!-- 좌우 패널 분할 -->
<div class="left-panel">...</div>
<div class="right-panel">...</div>
```
- ✅ 명확한 구조
- ✅ 반응형 설계 (CSS)
- ⚠️ 좁은 화면에서 불편할 수 있음

**개선 구현**
```html
<!-- 3열 그리드 -->
<div style="grid-template-columns: 380px 100px 1fr">
```
- ✅ 깔끔한 디자인
- ⚠️ 기본 데이터 로드 UI 없음
- ⚠️ 엑셀 업로드 기능 없음

**결론**: **혼합 방식 추천**
- 레이아웃: 저장소의 좌우 패널 + 개선 구현의 스타일
- 데이터 로드: 저장소의 모달 유지
- 검색 결과: 개선 구현의 더 깔끔한 테이블

---

## 3️⃣ 외부 라이브러리 비교

| 라이브러리 | 저장소 | 개선 | 평가 |
|-----------|--------|------|------|
| **Dexie.js** | ✅ 사용 | ❌ 미사용 | ✅ 포함 필수 |
| **SheetJS** | ✅ 사용 | ❌ 없음 | ✅ 포함 필수 |
| **ClaudeDesign 라이브러리** | ❌ 없음 | ✅ 사용 | ✅ 제거 가능 |

**결론**: 저장소의 라이브러리 구성이 더 현실적

---

## 4️⃣ 에러 처리 & 사용성

**저장소 (기존)**
```javascript
// 구체적인 에러 메시지
'GROUP_ID를 찾을 수 없습니다. SMS 메시지 형식을 다시 확인해주세요.'

// 사용자 친화적 alert
alert('엑셀 파일을 읽을 수 없습니다.\n\n오류: ...');
```
- ✅ 사용자 중심
- ✅ 행동 유도

**개선 구현**
```javascript
// 일반적 메시지
return null;  // 또는 없음
```
- ❌ 사용자가 혼동할 수 있음

**결론**: **저장소 방식 유지**

---

## 5️⃣ 새로운 기능: DSX 파싱

### 현황
- 저장소: 없음
- 개선 구현: 완전 구현 (Python + 분석 도구)

### 통합 방식

**옵션 A: 탭 추가** (권장)
```html
<div class="tabs">
  <button data-tab="batch-error">배치 오류 조회</button>
  <button data-tab="dsx-parse">DSX 파싱</button>
</div>
```
- ✅ 깔끔한 UI
- ✅ 기존 기능 방해 없음
- ✅ 확장 가능

**옵션 B: 별도 페이지**
- tools/dsx-parser.html
- 운영 서버용 Python 파서와 연동

**권장**: **옵션 A (탭) + 옵션 B (Python 파서)**

---

## 6️⃣ 최종 통합 전략

### Phase 1: HTML 레이아웃 개선 (1-2일)

**현재 상태 유지:**
- 좌우 패널 구조 유지
- 모달 기반 데이터 로드 유지
- 테이블 검색 결과 유지

**개선 추가:**
- 스타일 개선 (저장소 + 개선 구현 혼합)
- 헤더 & 상태바 추가
- 반응형 디자인 강화

### Phase 2: 코드 검증 & 최적화 (1-2일)

**유지할 로직:**
```
✅ SMS 파싱 (저장소 로직)
✅ IndexedDB 검색 (저장소 로직)
✅ 에러 처리 (저장소 로직)
✅ 엑셀 읽기 (저장소 로직)
```

**추가할 기능:**
```
✅ DSX 파싱 탭
✅ 파일 업로드 (DSX)
✅ 결과 표시
```

**제거할 것:**
```
❌ ClaudeDesign 라이브러리 의존성 (필요 없음)
❌ 불필요한 중복 로직
```

### Phase 3: DSX 파싱 통합 (2-3일)

```javascript
// dsx-parser.js (브라우저 버전)
async function parseDsxFile(file) {
  const text = await file.text();
  return parseDsxContent(text);
}

// 결과 표시
function displayDsxResults(data) {
  // 헤더, 통계, 잡 정보 표시
}
```

---

## 7️⃣ 파일 구조 (통합 후)

```
batch-error-viewer/
├── index.html                 # 통합 HTML (탭: 배치오류 + DSX)
├── app.js                     # 통합 JS
│   ├── Phase 1 (배치 오류) - 저장소 로직 유지
│   └── Phase 1.5 (DSX) - 새로운 로직 추가
├── dsx-parser.js              # DSX 파싱 (신규)
├── style.css                  # 통합 스타일
├── data.json                  # 기본 배치 데이터
├── data.example.csv           # 엑셀 샘플
├── INTEGRATION.md             # 통합 계획
├── CODE_REVIEW.md             # 이 파일
└── tools/                     # 운영 서버 도구
    ├── dsx_parser_main.py
    ├── run.bat
    └── README.md
```

---

## 8️⃣ 코드 병합 전략

### 충돌 없이 병합하기

**1단계: 저장소 코드 기반으로 시작**
```bash
# 현재: 저장소 코드 (좋은 기초)
app.js (414줄)
index.html (128줄)
style.css (390줄)
```

**2단계: 개선 구현에서 취할 부분**
- CSS 스타일 일부 (선택)
- 헤더 레이아웃 (개선 구현)
- 색상 팔레트 (개선 구현 참고)

**3단계: 새로운 기능 추가**
```javascript
// app.js 뒤에 추가
// ===== DSX 파싱 (Phase 1.5) =====
// dsx-parser.js에서 import하거나 인라인 추가

async function handleDsxUpload(file) {
  const content = await file.text();
  const result = parseDsxContent(content);
  displayDsxResults(result);
}
```

---

## 9️⃣ 최종 체크리스트

### 성능 & 호환성
- [ ] IndexedDB + Dexie.js 유지
- [ ] SheetJS 라이브러리 유지
- [ ] 모던 브라우저 지원 (Chrome/Firefox/Safari)
- [ ] 모바일 반응형 확인

### 사용성
- [ ] 명확한 에러 메시지
- [ ] 사용자 가이드 추가
- [ ] 키보드 네비게이션 지원
- [ ] 접근성 (ARIA) 확인

### 기능
- [ ] Phase 1: SMS + 엑셀 검색 ✅
- [ ] Phase 1.5: DSX 파싱 ✅
- [ ] 데이터 내보내기/재설정 ✅
- [ ] 이력 관리 (개선)

---

## 🔟 최종 권장안

### 코어 로직: 저장소 유지
```
❌ 바꾸지 않기:
- SMS 파싱 로직
- IndexedDB 검색
- 에러 처리
- 엑셀 읽기

✅ 개선하기:
- UI 스타일 (개선 구현 참고)
- 헤더 & 상태바 추가
- DSX 탭 추가
```

### 예상 결과

**통합 시간**: 3-4일
**코드 라인 수**:
- app.js: 414 → 550줄 (DSX 로직 +136줄)
- index.html: 128 → 200줄 (탭 추가 +72줄)
- style.css: 390 → 450줄 (DSX 스타일 +60줄)

**최종 기능**:
- ✅ Phase 1 완성 (더 견고함)
- ✅ Phase 1.5 추가 (DSX 파싱)
- ✅ 운영 서버 지원 도구
- ✅ 완전한 문서화

---

**다음 단계: 통합 구현 시작** 🚀
