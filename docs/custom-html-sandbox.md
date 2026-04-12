# Custom HTML and Sandbox Integration

This guide explains how to use custom HTML in LFForm safely and effectively, including what works with third-party libraries inside the LFForm sandbox model.

## Why This Matters

LFForm business logic runs inside a hidden sandbox iframe.

- You cannot directly manipulate the visible form DOM from sandbox script.
- UI libraries that expect direct DOM control can only see the sandbox DOM, which users do not see.
- Logic libraries work well because they do not require visible DOM access.

## Where You Can Render Custom HTML

You can place HTML content in supported LFForm settings:

- CustomHtml field content via content and HTMLContent aliases
- Field text above via description (alias: textAbove)
- Field text below via subtext (alias: textBelow)

Example:

```javascript
const formFields = {
  summaryHtml: { fieldId: 200 },
  total: { fieldId: 201 },
};

const renderSummary = async () => {
  const total = LFForm.getFieldValues(formFields.total) || 0;
  const html = `
    <div class="order-summary">
      <h3>Order Summary</h3>
      <p>Total: <strong>$${total}</strong></p>
    </div>
  `;

  await LFForm.changeFieldSettings(formFields.summaryHtml, { content: html });
};

renderSummary().catch(console.warn);
```

## Third-Party Libraries: What Works and What Does Not

### Works well: logic/data libraries

These are safe and useful because they do not depend on controlling visible form DOM.

Important:
- Third-party scripts must be available at runtime.
- Load external scripts and dependencies as external scripts in Form Designer or use a bundler to bundle them with your form script.
- Imported packages will not work unless they are bundled or otherwise loaded before your LFForm logic runs.

Examples:
- Date formatting libraries (date-fns, moment)
- Google APIs clients
- Validation and parsing libraries
- Data transformation libraries

Use case:
- Calculate and format values
- Call external APIs
- Build HTML strings and write them into CustomHtml, textAbove, or textBelow

```typescript
const formFields = {
  dueDateNote: { fieldId: 300 },
  dueDate: { fieldId: 301 },
};

const updateDueDateNote = async () => {
  const dueDateStr = LFForm.getFieldValues(formFields.dueDate);
  if (!dueDateStr) return;

  const label = dateFns.format(new Date(dueDateStr), 'EEEE, MMM d, yyyy');
  await LFForm.changeFieldSettings(formFields.dueDateNote, {
    description: `<span class="muted">Due on ${label}</span>`,
  });
};

LFForm.onFieldChange(updateDueDateNote, formFields.dueDate);
updateDueDateNote().catch(console.warn);
```

### Limited value: UI frameworks that require direct DOM control

Libraries such as jQuery can only interact with the sandbox DOM and not the user-visible form DOM.

This means:
- DOM queries and mutations run in the hidden iframe context.
- Visual effects do not appear unless you intentionally copy rendered HTML out to visible CustomHtml/text fields.
- Event handlers attached in sandbox do not automatically become interactive behavior in copied visible HTML.

## Pattern: Copy Sandbox HTML into Visible Custom HTML

If you produce markup in sandbox context, treat it as render-to-string output and copy the HTML string into a visible LFForm target.

```javascript
const formFields = {
  widgetHost: { fieldId: 400 },
};

const renderSandboxOutput = async () => {
  const sandboxContainer = document.createElement('div');
  sandboxContainer.innerHTML = `
    <section class="card">
      <h4>Status</h4>
      <ul>
        <li>Ready</li>
        <li>Validated</li>
      </ul>
    </section>
  `;

  // Copy generated HTML string to a visible CustomHtml field.
  await LFForm.changeFieldSettings(formFields.widgetHost, {
    content: sandboxContainer.innerHTML,
  });
};

renderSandboxOutput().catch(console.warn);
```

## Pattern: Lightweight Actions from CustomHtml Buttons

When you need a simple user action (for example, "Recalculate", "Apply Filter", or "Download CSV"), a button in CustomHtml can call a function in the LFForm sandbox.

### Why use this pattern

- It keeps interaction simple and close to the field where users need it.
- It works well for small actions that update field values or trigger utility logic.
- It avoids the overhead of an embedded iframe when full UI isolation is not needed.

### Example: button markup rendered in CustomHtml

```html
<button type="button" class="btn btn-primary" onclick="runQuickAction(event, 'expense-summary')">
  Refresh Summary
</button>
```

### Example: handler defined in LFForm sandbox

```javascript
window.runQuickAction = async (event, contextKey) => {
  if (contextKey !== 'expense-summary') return;

  const now = new Date().toISOString();
  await LFForm.setFieldValues({ fieldId: 210 }, `Summary refreshed at ${now}`);

  // Useful for debugging; event shape is not fully documented.
  console.debug('CustomHtml click event', event);
};
```

Notes:
- Inline handlers resolve global names, so attach callable functions to `window`.
- The `event` object is not fully documented, but it usually includes enough details for diagnostics and basic conditional logic.
- Keep this pattern focused on lightweight actions; use postMessage and hosted iframes for richer interactive interfaces.

## Pattern: Hosted External UI in an Iframe

For rich interactive UI (payments, maps, custom widgets), host your own page and embed it in a CustomHtml field using an iframe.

This is a common approach for payment and complex widget integrations.

### 1. Inject iframe markup into CustomHtml field

```javascript
const formFields = {
  paymentHost: { fieldId: 500 },
};

const mountPaymentIframe = async () => {
  const iframeHtml = `
    <iframe
      id="stripe-frame"
      title="Secure Payment"
      src="https://your-domain.example/stripe-checkout.html"
      style="width:100%;min-height:680px;border:0"
      loading="lazy"
      referrerpolicy="strict-origin-when-cross-origin"
    ></iframe>
  `;

  await LFForm.changeFieldSettings(formFields.paymentHost, { content: iframeHtml });
};

mountPaymentIframe().catch(console.warn);
```

### 2. Bridge data with postMessage

Use window message handlers in LFForm script to receive updates from the hosted iframe page.

Known sandbox origin:
- LFForm sandbox is hosted on `https://sandbox-forms.laserfiche.com`.
- API and integration services can add this origin to CORS and origin allow-lists.
- For cross-frame messaging, explicitly allow this origin in postMessage origin checks.

LFForm sandbox frame example (receive from hosted iframe, then send an ack back):

```javascript
const formFields = {
  paymentToken: { fieldId: 501 },
  paymentStatus: { fieldId: 502 },
};

const allowedOrigin = 'https://your-domain.example';

window.addEventListener('message', async (event) => {
  if (event.origin !== allowedOrigin) return;

  const data = event.data || {};

  if (data.type === 'payment-token') {
    await LFForm.setFieldValues(formFields.paymentToken, data.token || '');
    await LFForm.setFieldValues(formFields.paymentStatus, 'Tokenized');

    // Reply to the sender frame.
    event.source?.postMessage({ type: 'payment-ack', ok: true }, allowedOrigin);
  }

  if (data.type === 'payment-error') {
    await LFForm.setFieldValues(formFields.paymentStatus, 'Failed');
  }
});
```

Hosted iframe page example (send to LFForm sandbox, then receive ack):

```javascript
const allowedOrigin = 'https://sandbox-forms.laserfiche.com';

const sendPaymentToken = (token) => {
  window.parent.postMessage({ type: 'payment-token', token }, allowedOrigin);
};

window.addEventListener('message', (event) => {
  if (event.origin !== allowedOrigin) return;

  const data = event.data || {};
  if (data.type === 'payment-ack' && data.ok) {
    console.log('Sandbox acknowledged token');
  }
});
```

## Recommended Architecture

For reliable production behavior:

1. Use LFForm APIs as the source of truth for form state.
2. Use third-party logic libraries for computation, formatting, and API calls.
3. Render visible HTML through LFForm field settings (content, description, subtext).
4. For rich interactive UI, host a standalone page and embed via iframe.
5. Exchange data through postMessage with strict origin checks.

## Security and Reliability Checklist

- Validate postMessage origin before using message data.
- Add `https://sandbox-forms.laserfiche.com` to trusted origin/CORS allow-lists when integrating external APIs.
- Never trust iframe payloads without validation.
- Keep API keys and secrets server-side.
- Avoid inline script injection in generated HTML.
- Gracefully handle readonly, print, and disabled contexts.
- Always await LFForm mutating methods.

## Common Pitfalls

- Assuming jQuery selectors can target user-visible LFForm DOM directly.
- Expecting copied HTML to preserve sandbox-attached event handlers.
- Forgetting that repeatable fields require fieldId plus index for row-specific targeting.
- Writing large HTML strings repeatedly without throttling updates.

## Related Docs

- API reference: docs/api-reference.md
- Full API pass: docs/api-reference-full.md
- Recipes: docs/recipes.md
