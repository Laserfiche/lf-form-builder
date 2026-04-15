import { afterEach, beforeEach, vi } from 'vitest';
import { createLFFormMock, getLFFormMockControls, LFFormMock } from './mocks/lfForm.mock';

beforeEach(() => {
  (globalThis as { LFForm?: LFFormMock }).LFForm = createLFFormMock('permissive');
});

afterEach(() => {
  const lfForm = (globalThis as { LFForm?: LFFormMock }).LFForm;
  if (lfForm) {
    const controls = getLFFormMockControls(lfForm);
    controls.resetHandlers();
  }
  vi.clearAllMocks();
});
