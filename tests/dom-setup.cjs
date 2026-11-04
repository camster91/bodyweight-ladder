// jsdom has no native dialog implementation. Browser tests verify the real
// modal focus/inert behavior; this adapter models only its lifecycle in unit tests.
const jsdom = require('jsdom');
const Original = jsdom.JSDOM;
jsdom.JSDOM = class extends Original {
  constructor(html, options = {}) {
    const beforeParse = options.beforeParse;
    super(html, { ...options, beforeParse(window) {
      window.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
      window.HTMLDialogElement.prototype.close = function () {
        if (!this.open) return;
        this.removeAttribute('open');
        this.dispatchEvent(new window.Event('close'));
      };
      beforeParse?.(window);
    } });
  }
};
