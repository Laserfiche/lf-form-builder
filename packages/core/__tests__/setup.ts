import { afterEach, beforeEach, vi } from 'vitest';
import { createLFFormMock, getLFFormMockControls } from './mocks/lfForm.mock';

beforeEach(() => {
  (globalThis as { LFForm?: unknown }).LFForm = createLFFormMock('permissive');
});

afterEach(() => {
  const lfForm = (globalThis as { LFForm?: unknown }).LFForm;
  if (lfForm) {
    const controls = getLFFormMockControls(lfForm);
    controls.resetHandlers();
  }
  vi.clearAllMocks();
});
