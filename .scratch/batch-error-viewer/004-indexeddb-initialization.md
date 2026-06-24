# 004: IndexedDB 초기화 & 데이터 로드

## What to build

앱 시작 시 자동으로 IndexedDB를 초기화하고, `data.json`의 배치 정보를 로드합니다.

**초기화 프로세스:**
1. 앱 로드 시 `batches` 테이블 생성 (한 번만)
2. groupId, runId, seqId로 인덱싱 설정
3. IndexedDB에 데이터가 없으면 data.json 로드
4. 이후 앱 재시작 시 중복 로드되지 않음

**실패 처리:**
- DB 초기화 실패 시: "배치 정보 DB 초기화에 실패했습니다. 페이지를 새로고침해주세요."

## Acceptance criteria

- [ ] Dexie.js를 사용하여 IndexedDB 초기화 로직 구현
- [ ] `batches` 테이블 생성 (스키마: `++, groupId, runId, seqId`)
- [ ] 앱 시작 시 자동으로 DB 초기화 함수 호출
- [ ] data.json 파일을 fetch하여 IndexedDB에 로드
- [ ] 첫 로드 후 중복 로드 방지 (count 체크)
- [ ] 데이터 로드 성공 시 개발자 콘솔에 로그 출력
- [ ] data.json 로드 실패 시 구체적 오류 메시지 표시
- [ ] IndexedDB 쿼리 테스트: groupId, runId, seqId로 검색 가능 확인

## Blocked by

- 002-project-setup-base-ui

## Labels

- ready-for-agent
