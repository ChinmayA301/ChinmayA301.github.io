(() => {
  const forms = Array.from(document.querySelectorAll('[data-blog-form]'));

  forms.forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const status = form.querySelector('.blog-form-status');
      const button = form.querySelector('button[type="submit"]');
      const defaultLabel = button?.textContent || 'Submit';

      if (status) status.textContent = 'Sending…';
      if (button) {
        button.disabled = true;
        button.textContent = 'Sending…';
      }

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });

        if (!response.ok) throw new Error('Form submission failed');
        form.reset();
        if (status) status.textContent = form.dataset.successMessage || 'Received. Thank you.';
      } catch (error) {
        if (status) status.textContent = 'Could not send that right now. Please try again or email me directly.';
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = defaultLabel;
        }
      }
    });
  });

  const nativeShare = document.querySelector('[data-share-native]');
  if (nativeShare) {
    if (typeof navigator.share !== 'function') {
      nativeShare.hidden = true;
    } else {
      nativeShare.addEventListener('click', async () => {
        try {
          await navigator.share({
            title: nativeShare.dataset.shareTitle || document.title,
            url: nativeShare.dataset.shareUrl || window.location.href
          });
        } catch (error) {
          if (error?.name !== 'AbortError') {
            const status = document.querySelector('.blog-share-status');
            if (status) status.textContent = 'Sharing was unavailable. Try Copy link instead.';
          }
        }
      });
    }
  }

  const copyButton = document.querySelector('[data-share-copy]');
  copyButton?.addEventListener('click', async () => {
    const status = document.querySelector('.blog-share-status');
    const url = copyButton.dataset.shareUrl || window.location.href;
    const markCopied = () => {
      copyButton.textContent = 'Copied';
      if (status) status.textContent = 'Post link copied.';
      window.setTimeout(() => { copyButton.textContent = 'Copy link'; }, 1800);
    };

    try {
      await navigator.clipboard.writeText(url);
      markCopied();
    } catch (error) {
      const fallback = document.createElement('textarea');
      fallback.value = url;
      fallback.setAttribute('readonly', '');
      fallback.style.position = 'fixed';
      fallback.style.opacity = '0';
      document.body.appendChild(fallback);
      fallback.select();
      const copied = document.execCommand('copy');
      fallback.remove();
      if (copied) markCopied();
      else if (status) status.textContent = url;
    }
  });
})();
