---
title: Add Table Rows and Populate Values
description: Programmatically add rows to a table and fill column values in order.
category: tables
---

# Add Table Rows and Populate Values in Order

```javascript
const formFields = {
  expenseTable: { fieldId: 30 },
  expenseItemColumn: { fieldId: 31 },
  expenseAmountColumn: { fieldId: 32 },
};

const fillExpenses = async (rows) => {
  await LFForm.addRow(formFields.expenseTable, rows.length);
  await LFForm.setFieldValues(formFields.expenseItemColumn, rows.map((r) => r.item));
  await LFForm.setFieldValues(formFields.expenseAmountColumn, rows.map((r) => r.amount));
};

fillExpenses([
  { item: 'Hotel', amount: 420 },
  { item: 'Taxi', amount: 52 },
]).catch(console.warn);
```
