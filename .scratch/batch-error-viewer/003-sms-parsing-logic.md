# 003: SMS 오류 메시지 파싱

## What to build

사용자가 입력한 SMS 오류 메시지 텍스트에서 정규식을 사용하여 GROUP_ID, RUN_ID, SEQ_ID, job명을 자동 추출합니다.

예상 SMS 형식: `[배치자동화]작업에러[YYMMDD][HH:MM][GROUP_ID][RUN_ID][job명]...`

[파싱] 버튼 클릭 시:
1. SMS 입력 텍스트에서 4개 항목 추출
2. 추출 성공 시: 왼쪽 파싱 결과 영역에 읽기 전용으로 표시
3. 추출 실패 시: 구체적 오류 메시지 표시
   - GROUP_ID 미추출: "GROUP_ID를 찾을 수 없습니다. SMS 메시지 형식을 다시 확인해주세요."
   - RUN_ID 미추출: "RUN_ID를 찾을 수 없습니다. SMS 메시지 형식을 다시 확인해주세요."
   - 기타 파싱 실패: "메시지 파싱에 실패했습니다. 형식을 확인해주세요: [배치자동화]작업에러[YYMMDD][HH:MM][GROUP_ID][RUN_ID][job명]..."

## Acceptance criteria

- [ ] 정규식으로 GROUP_ID 추출 가능
- [ ] 정규식으로 RUN_ID 추출 가능
- [ ] 정규식으로 SEQ_ID 추출 가능
- [ ] 정규식으로 job명 추출 가능
- [ ] [파싱] 버튼 클릭 시 4개 항목 추출
- [ ] 추출 성공 시 왼쪽 영역에 읽기 전용으로 표시
- [ ] GROUP_ID 미추출 시 구체적 오류 메시지 표시
- [ ] RUN_ID 미추출 시 구체적 오류 메시지 표시
- [ ] 기타 파싱 실패 시 형식 안내 메시지 표시
- [ ] 파싱 결과가 읽기 전용 (사용자 수정 불가)

## Blocked by

- 002-project-setup-base-ui

## Labels

- ready-for-agent
