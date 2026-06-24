# 001: 데이터 준비 - 엑셀 → data.json 변환

## What to build

배치 정보가 담긴 엑셀 파일을 JSON 형식으로 변환하여 프로젝트에 `data.json` 파일로 저장합니다. 이는 IndexedDB에 초기 데이터를 로드하기 위한 전제 조건이며, 앱 개발 전 일회성 작업입니다.

변환 결과는 다음 구조를 따릅니다:
```javascript
[
  {
    "groupId": "SDF770",
    "runId": "SDFPD771",
    "seqId": "seq_sfpdmg502",
    "jobName": "FW1차_오늘농사_수출입실적날씨월통계(16일)",
    "jobId": "JOB001",
    "targetTable": "TB_EXP",
    "targetTableName": "수출입"
  },
  ...
]
```

## Acceptance criteria

- [ ] 배치 정보 엑셀 파일 준비 완료
- [ ] 엑셀을 JSON 형식으로 변환 (온라인 도구 또는 수동)
- [ ] `data.json` 파일을 프로젝트 루트에 저장
- [ ] JSON 구조 검증: groupId, runId, seqId, jobName, jobId, targetTable, targetTableName 모두 포함
- [ ] 데이터 샘플 최소 5개 행 이상 확인

## Blocked by

None - can start immediately ✅

## Labels

- ready-for-agent
