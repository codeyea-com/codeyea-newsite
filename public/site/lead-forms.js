(() => {
  const ids = new Map();
  const forms = [...document.querySelectorAll('.ct-form, #cq-form')];
  for (const form of forms) {
    const trap = document.createElement('input');
    trap.name = 'websiteTrap';
    trap.autocomplete = 'off';
    trap.tabIndex = -1;
    trap.setAttribute('aria-hidden', 'true');
    trap.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden';
    form.append(trap);
  }
  const turnstileTokens = new WeakMap();
  const turnstileWidgets = new WeakMap();
  let turnstileConfig = {required: false, ready: false, siteKey: null};
  let turnstileError = null;
  const turnstileReady = (async () => {
    if (!forms.length) return;
    try {
      const response = await fetch('/api/leads', {headers: {Accept: 'application/json'}});
      if (!response.ok) throw Error();
      turnstileConfig = await response.json();
      if (!turnstileConfig.required && !turnstileConfig.ready) return;
      if (!turnstileConfig.ready || !turnstileConfig.siteKey)
        throw Error('Form security is not configured yet. Please try again later.');
      if (!window.turnstile) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
          script.async = true;
          script.defer = true;
          script.onload = resolve;
          script.onerror = () => reject(Error());
          document.head.append(script);
        });
      }
      if (!window.turnstile) throw Error();
      for (const form of forms) {
        const mount = document.createElement('div');
        mount.className = 'cf-turnstile';
        const submit = form.querySelector('[type="submit"]');
        const slot = submit?.parentElement;
        if (slot?.parentElement === form) form.insertBefore(mount, slot);
        else form.append(mount);
        const id = window.turnstile.render(mount, {
          sitekey: turnstileConfig.siteKey,
          action: 'lead',
          callback: token => turnstileTokens.set(form, token),
          'expired-callback': () => turnstileTokens.delete(form),
          'error-callback': () => turnstileTokens.delete(form),
        });
        turnstileWidgets.set(form, id);
      }
    } catch (error) {
      turnstileError = error instanceof Error && error.message
        ? error
        : Error('The security check is temporarily unavailable. Please try again.');
    }
  })();
  window.codeyeaSendLead = async payload => {
    await turnstileReady;
    if (turnstileError) throw turnstileError;
    const signature = JSON.stringify(payload);
    if (!ids.has(signature)) ids.set(signature, crypto.randomUUID());
    const form = document.querySelector(payload.kind === 'quote' ? '#cq-form' : '.ct-form');
    const token = form && turnstileConfig.ready ? turnstileTokens.get(form) : '';
    if (turnstileConfig.required && !turnstileConfig.ready)
      throw Error('Form security is not configured yet. Please try again later.');
    if (turnstileConfig.ready && !token)
      throw Error('Complete the security check before submitting.');
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({...payload, submissionId: ids.get(signature), websiteTrap: form?.elements.namedItem('websiteTrap')?.value || '', turnstileToken: token}),
    });
    const result = await response.json();
    if (form && turnstileConfig.ready) {
      turnstileTokens.delete(form);
      const widget = turnstileWidgets.get(form);
      if (widget !== undefined) window.turnstile?.reset(widget);
    }
    if (!response.ok) throw Error(result.error || 'Unable to save the request. Please try again.');
    return result;
  };
  const form = document.querySelector('.ct-form');
  if (!form) return;
  const status = form.querySelector('.ct-status');
  status.textContent = '';
  form.addEventListener('submit', async event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!form.reportValidity()) return;
    const fields = new FormData(form), button = form.querySelector('[type=submit]');
    button.disabled = true;
    try {
      await window.codeyeaSendLead({kind: 'contact', name: fields.get('name'), email: fields.get('email'), phone: fields.get('phone') || '', subject: fields.get('subject'), message: fields.get('message'), consent: true});
      status.textContent = 'Your message has been received. We’ll get back to you.';
      form.reset();
    } catch (error) {
      status.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  }, true);
})();
