# 005: 배치 검색 & 결과 테이블 표시

## What to build

파싱된 정보(GROUP_ID, RUN_ID, SEQ_ID)를 우선순위에 따라 IndexedDB에서 검색하고, 매칭된 배치 정보를 테이블로 표시합니다.

**검색 우선순위:**
1. GROUP_ID로 검색
2. GROUP_ID 결과 없으면 RUN_ID로 검색
3. RUN_ID 결과 없으면 SEQ_ID로 검색
4. 매칭되는 모든 행을 테이블로 표시

**결과 테이블:**
- 7개 컬럼: GROUP_ID, RUN_ID, SEQ_ID, job명, JOB_ID, 타겟테이블, 타겟테이블명
- 여러 행이 매칭되면 모두 표시

**실패 처리:**
- 검색 결과 없음: "GROUP_ID [입력값], RUN_ID [입력값]과 일치하는 배치가 없습니다. SMS 정보를 다시 확인해주세요."

## Acceptance criteria

- [ ] [검색] 버튼 클릭 시 우선순위 검색 로직 실행
- [ ] GROUP_ID로 첫 번째 검색 수행
- [ ] GROUP_ID 결과 없으면 RUN_ID로 재검색
- [ ] RUN_ID 결과 없으면 SEQ_ID로 재검색
- [ ] 매칭 결과를 배열로 반환
- [ ] 결과가 없을 때 구체적 오류 메시지 표시
- [ ] 검색 결과를 7컬럼 테이블로 우측에 표시
- [ ] 여러 행 매칭 시 모두 표시
- [ ] 테이블 형식이 명확하고 읽기 쉬움
- [ ] Dexie.js 쿼리로 각 경우의 검색 테스트 완료

## Blocked by

- 003-sms-parsing-logic
- 004-indexeddb-initialization

## Labels

- ready-for-agent
