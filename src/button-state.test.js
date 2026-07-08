const { computeButtonState, handleReset } = require('./button-state');

describe('Button State Management', () => {
  test('enables Parse button when SMS input present', () => {
    const state = computeButtonState({
      smsInput: 'some SMS text',
      isParsed: false
    });

    expect(state.parseEnabled).toBe(true);
  });

  test('disables Parse button when SMS input empty', () => {
    const state = computeButtonState({
      smsInput: '',
      isParsed: false
    });

    expect(state.parseEnabled).toBe(false);
  });

  test('disables Parse button when SMS input is only whitespace', () => {
    const state = computeButtonState({
      smsInput: '   ',
      isParsed: false
    });

    expect(state.parseEnabled).toBe(false);
  });

  test('enables Search button only after parsing', () => {
    const state = computeButtonState({
      smsInput: 'text',
      isParsed: true
    });

    expect(state.searchEnabled).toBe(true);
  });

  test('disables Search button when not parsed', () => {
    const state = computeButtonState({
      smsInput: 'text',
      isParsed: false
    });

    expect(state.searchEnabled).toBe(false);
  });

  test('Reset button is always enabled', () => {
    const state1 = computeButtonState({
      smsInput: '',
      isParsed: false
    });
    expect(state1.resetEnabled).toBe(true);

    const state2 = computeButtonState({
      smsInput: 'text',
      isParsed: true
    });
    expect(state2.resetEnabled).toBe(true);
  });

  test('returns all three button states', () => {
    const state = computeButtonState({
      smsInput: 'text',
      isParsed: true
    });

    expect(state).toHaveProperty('parseEnabled');
    expect(state).toHaveProperty('searchEnabled');
    expect(state).toHaveProperty('resetEnabled');
  });

  test('Reset clears SMS input only', () => {
    const currentState = {
      smsInput: 'old SMS text',
      parsedData: { groupId: 'SDF770', runId: 'SDFPD771' },
      searchResults: [{ groupId: 'SDF770', runId: 'SDFPD771' }],
      parseError: 'some error',
      searchError: 'another error'
    };

    const newState = handleReset(currentState);

    expect(newState.smsInput).toBe('');
    expect(newState.parsedData).toEqual(currentState.parsedData);
    expect(newState.searchResults).toEqual(currentState.searchResults);
    expect(newState.parseError).toEqual(currentState.parseError);
    expect(newState.searchError).toEqual(currentState.searchError);
  });

  test('Reset works with null parsed data', () => {
    const currentState = {
      smsInput: 'text',
      parsedData: null,
      searchResults: [],
      parseError: null,
      searchError: null
    };

    const newState = handleReset(currentState);

    expect(newState.smsInput).toBe('');
    expect(newState.parsedData).toBeNull();
  });
});
