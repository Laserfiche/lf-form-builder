import type {
  LFForm,
  LFFormId,
  LFFormIdParam,
  LFFormPromiseResponse,
} from '@lfz/lf-form-types';

const FieldRules = {
  show: (field: LFFormIdParam) => {
    return LFForm.showFields(field);
  },
  hide: (field: LFFormIdParam) => {
    return LFForm.hideFields(field);
  },
  // enable: (field: LFFormIdParam) => {
  //   LFForm.enable()
  // }
  // disable: (field: LFFormIdParam) => {
  //   LFForm.disable()
  // }
  // validate: (field: LFFormIdParam) => {
  //   LFForm.validate()
  // }
  addCSSClasses: (field: LFFormIdParam, classes: string | string[]) => {
    return LFForm.addCSSClasses(field, classes);
  },
  removeCSSClasses: (field: LFFormIdParam, classes: string | string[]) => {
    return LFForm.removeCSSClasses(field, classes);
  },
} as const;
/**
 * @ignore
 */
export class LFFormFieldRules {
  private static nextId = 1;
  private static usedRules: Record<string, LFFormFieldRules> = {};
  constructor(
    public readonly ruleId: string = `rule-${LFFormFieldRules.nextId++}`
  ) {
    if (LFFormFieldRules.usedRules[ruleId]) {
      throw new Error(
        `Rule ID "${ruleId}" is already in use. Please provide a unique rule ID.`
      );
    }
    LFFormFieldRules.usedRules[ruleId] = this;
  }
  public doAction: Array<() => Promise<LFFormPromiseResponse>> = [];
  #setAction = (fn: () => Promise<LFFormPromiseResponse>) => {
    this.doAction.push(fn);
    return this;
  };
  show = (field: LFFormIdParam) => {
    const action = () => FieldRules.show(field);
    return this.#setAction(action);
  };
  hide = (field: LFFormIdParam) => {
    const action = () => FieldRules.hide(field);
    return this.#setAction(action);
  };
  // enable = (field: LFFormIdParam) => this;
  // disable = (field: LFFormIdParam) => this;
  // validate = (field: LFFormIdParam) => this;
  addCSSClasses = (field: LFFormIdParam, classes: string | string[]) => {
    const action = () => FieldRules.addCSSClasses(field, classes);
    return this.#setAction(action);
  };
  removeCSSClasses = (field: LFFormIdParam, classes: string | string[]) => {
    const action = () => FieldRules.removeCSSClasses(field, classes);
    return this.#setAction(action);
  };
  when = () => {
    return new LFFormFieldWhen(this);
  };
}
type FieldRuleWhen = () =>
  | Promise<PromiseSettledResult<LFFormPromiseResponse>[]>
  | Promise<false>;
class LFFormFieldWhen {
  public readonly ruleId: string;
  private doAction: Array<() => Promise<LFFormPromiseResponse>> = [];
  constructor(base: LFFormFieldRules) {
    this.ruleId = base.ruleId;
    this.doAction = base.doAction;
  }

  any = (
    field: LFFormIdParam,
    ...when: Array<(fieldCheck: typeof field) => boolean>
  ) => {
    const fieldWhen: FieldRuleWhen = () => {
      for (const fn of when) {
        if (fn(field)) {
          return Promise.allSettled(this.doAction.map((f) => f()));
        }
      }
      return Promise.resolve<false>(false);
    };
    this.#run(field, fieldWhen);
  };
  all = (
    field: LFFormIdParam,
    ...when: Array<(fieldCheck: typeof field) => boolean>
  ) => {
    const fieldWhen: FieldRuleWhen = () => {
      for (const fn of when) {
        if (!fn(field)) {
          return Promise.resolve<false>(false);
        }
      }
      return Promise.allSettled(this.doAction.map((f) => f()));
    };
    this.#run(field, fieldWhen);
  };
  always = (field: LFFormIdParam) => {
    const fieldWhen: FieldRuleWhen = () =>
      Promise.allSettled(this.doAction.map((f) => f()));
    this.#run(field, fieldWhen);
  };

  #run = (field: LFFormIdParam, fieldWhen: FieldRuleWhen) => {
    const fieldArray: LFFormId[] = Array.isArray(field) ? field : [field];
    for (const watchField of fieldArray) {
      LFForm.onFieldChange(
        () => {
          void fieldWhen();
        },
        {
          fieldId: watchField.fieldId,
          handlerName: this.ruleId,
        }
      );
    }
  };
}

const t = new LFFormFieldRules();
t.show({ fieldId: 1 }).when().always({ fieldId: 2 });
