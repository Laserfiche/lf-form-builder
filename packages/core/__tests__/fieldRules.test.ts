import { describe, expect, it, beforeEach } from 'vitest';
import { LFFormFieldRules } from '../src/lib/fieldRules';
import { getLFFormMock, type LFFormTestMock } from './mocks/lfForm.mock';
import type { LFFormIdParam } from '@lf/lf-form-types';

type FieldRulesLFFormMock = Pick<
  LFFormTestMock,
  'showFields' | 'hideFields' | 'addCSSClasses' | 'removeCSSClasses' | 'onFieldChange'
>;

describe('LFFormFieldRules', () => {
  beforeEach(() => {
    const lfForm = getLFFormMock<FieldRulesLFFormMock>();
    lfForm.showFields.mockResolvedValue({ success: true });
    lfForm.hideFields.mockResolvedValue({ success: true });
    lfForm.addCSSClasses.mockResolvedValue({ success: true });
    lfForm.removeCSSClasses.mockResolvedValue({ success: true });
    lfForm.onFieldChange.mockImplementation(() => undefined);
  });

  it('creates a rule with unique ID', () => {
    const rule1 = new LFFormFieldRules();
    const rule2 = new LFFormFieldRules();

    expect(rule1.ruleId).not.toEqual(rule2.ruleId);
  });

  it('allows custom rule ID', () => {
    const customId = 'my-custom-rule';
    const rule = new LFFormFieldRules(customId);

    expect(rule.ruleId).toBe(customId);
  });

  it('throws error for duplicate rule IDs', () => {
    const ruleId = 'duplicate-rule';
    new LFFormFieldRules(ruleId);

    expect(() => new LFFormFieldRules(ruleId)).toThrow(
      `Rule ID "${ruleId}" is already in use`
    );
  });

  it('queues show action and returns this for chaining', () => {
    const rule = new LFFormFieldRules();
    const result = rule.show({ fieldId: 1 });

    expect(result).toBe(rule);
    expect(rule.doAction).toHaveLength(1);
  });

  it('queues hide action', () => {
    const rule = new LFFormFieldRules();
    rule.hide({ fieldId: 2 });

    expect(rule.doAction).toHaveLength(1);
  });

  it('queues addCSSClasses action', () => {
    const rule = new LFFormFieldRules();
    rule.addCSSClasses({ fieldId: 3 }, 'highlight');

    expect(rule.doAction).toHaveLength(1);
  });

  it('queues removeCSSClasses action', () => {
    const rule = new LFFormFieldRules();
    rule.removeCSSClasses({ fieldId: 4 }, ['bold', 'italic']);

    expect(rule.doAction).toHaveLength(1);
  });

  it('allows chaining multiple actions', () => {
    const rule = new LFFormFieldRules();
    rule.show({ fieldId: 1 }).hide({ fieldId: 2 }).addCSSClasses({ fieldId: 3 }, 'active');

    expect(rule.doAction).toHaveLength(3);
  });

  it('creates when clause for conditional logic', () => {
    const rule = new LFFormFieldRules();
    rule.show({ fieldId: 1 });
    const whenClause = rule.when();

    expect(whenClause).toBeDefined();
    expect(whenClause).toHaveProperty('any', expect.any(Function));
    expect(whenClause).toHaveProperty('all', expect.any(Function));
    expect(whenClause).toHaveProperty('always', expect.any(Function));
  });

  it('executes queued actions in order', async () => {
    const lfForm = getLFFormMock<FieldRulesLFFormMock>();
    lfForm.showFields.mockResolvedValue({ success: true });
    lfForm.hideFields.mockResolvedValue({ success: true });

    const rule = new LFFormFieldRules();
    rule.show({ fieldId: 1 });
    rule.hide({ fieldId: 2 });

    // Execute all queued actions
    const results = await Promise.allSettled(
      rule.doAction.map((action) => action())
    );

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({ status: 'fulfilled' });
  });

  it('registers field change listener when when().always() is called', () => {
    const lfForm = getLFFormMock<FieldRulesLFFormMock>();
    const rule = new LFFormFieldRules();
    rule.show({ fieldId: 10 });
    rule.when().always({ fieldId: 20 });

    expect(lfForm.onFieldChange).toHaveBeenCalled();
  });

  it('handles multiple conditions with any()', () => {
    const lfForm = getLFFormMock<FieldRulesLFFormMock>();
    const rule = new LFFormFieldRules();
    rule.show({ fieldId: 1 });

    const condition1 = (field: LFFormIdParam) => !Array.isArray(field) && field.fieldId === 5;
    const condition2 = (field: LFFormIdParam) => !Array.isArray(field) && field.fieldId === 10;

    rule.when().any({ fieldId: 5 }, condition1, condition2);

    expect(lfForm.onFieldChange).toHaveBeenCalled();
  });

  it('handles multiple conditions with all()', () => {
    const lfForm = getLFFormMock<FieldRulesLFFormMock>();
    const rule = new LFFormFieldRules();
    rule.hide({ fieldId: 2 });

    const condition1 = (field: LFFormIdParam) => !Array.isArray(field) && (field.fieldId ?? 0) > 0;
    const condition2 = (field: LFFormIdParam) => !Array.isArray(field) && (field.fieldId ?? 0) < 100;

    rule.when().all({ fieldId: 50 }, condition1, condition2);

    expect(lfForm.onFieldChange).toHaveBeenCalled();
  });
});
