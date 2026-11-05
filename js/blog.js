(() => {
  const forms = Array.from(document.querySelectorAll('[data-blog-form]'));

  forms.forEach((form) => {
    const isContentOS = form.dataset.formMode === 'contentos';
    if (isContentOS) {
      fetch(form.dataset.statusUrl, { signal: AbortSignal.timeout(10000) })
        .then((response) => response.ok ? response.json() : Promise.reject())
        .then((data) => {
          const ready = data.streams?.[form.dataset.stream] === true;
          form.dataset.ready = ready ? 'true' : 'false';
          const button = form.querySelector('button[type="submit"]');
          button.disabled = !ready;
          button.textContent = ready ? 'Subscribe' : 'Signup opens soon';
          form.querySelector('.blog-form-status').textContent = ready ? '' : 'The newsletter is being connected. Please check back soon.';
        })
        .catch(() => {
          form.querySelector('button[type="submit"]').textContent = 'Signup unavailable';
          form.querySelector('.blog-form-status').textContent = 'Could not connect to signup. Reload this page to try again.';
        });
    }
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const status = form.querySelector('.blog-form-status');
      const button = form.querySelector('button[type="submit"]');
      const defaultLabel = button?.textContent || 'Submit';
      if (isContentOS && form.dataset.ready !== 'true') return;

      if (status) status.textContent = 'Sending…';
      if (button) {
        button.disabled = true;
        button.textContent = 'Sending…';
      }

      try {
        if (isContentOS) {
          const data = new FormData(form);
          const response = await fetch(form.action, {
            method: 'POST', signal: AbortSignal.timeout(25000),
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: data.get('email'), preferences: data.getAll('preferences'),
              source_page: data.get('source_page'), website: data.get('website'), consent: true })
          });
          const result = await response.json();
          if (!response.ok) { status.textContent = result.error || 'Could not send the request. Please try later.'; return; }
          status.textContent = result.message;
          form.reset();
          return;
        }
        const isGoogleSheetForm = form.dataset.formMode === 'google-sheets';
        if (isGoogleSheetForm) {
          const frameName = `newsletter-submit-${Date.now()}`;
          const responseFrame = document.createElement('iframe');

          responseFrame.name = frameName;
          responseFrame.title = 'Newsletter signup response';
          responseFrame.hidden = true;
          document.body.appendChild(responseFrame);

          form.target = frameName;
          HTMLFormElement.prototype.submit.call(form);
          form.reset();
          if (status) status.textContent = form.dataset.successMessage || 'Thanks, your signup is on its way.';
          if (button) {
            button.disabled = false;
            button.textContent = defaultLabel;
          }

          window.setTimeout(() => {
            form.removeAttribute('target');
            responseFrame.remove();
          }, 30000);
          return;
        }

        const requestOptions = {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        };

        const response = await fetch(form.action, requestOptions);

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

  const syncGiscusTheme = () => {
    const frame = document.querySelector('iframe.giscus-frame');
    if (!frame?.contentWindow) return;
    const theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    frame.contentWindow.postMessage({
      giscus: { setConfig: { theme } }
    }, 'https://giscus.app');
  };

  if (document.querySelector('.giscus')) {
    const themeObserver = new MutationObserver(syncGiscusTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
    window.addEventListener('message', (event) => {
      if (event.origin === 'https://giscus.app' && event.data?.giscus) syncGiscusTheme();
    });
    window.addEventListener('load', syncGiscusTheme, { once: true });
  }

  const readingRoom = document.querySelector('[data-reading-room]');
  if (readingRoom) {
    const topicButtons = Array.from(readingRoom.querySelectorAll('[data-topic-filter]'));
    const storyItems = Array.from(readingRoom.querySelectorAll('[data-story-item]'));
    const storyRows = storyItems.map((item) => item.querySelector('[data-story-row]')).filter(Boolean);
    const topicHeading = readingRoom.querySelector('[data-topic-heading]');
    const topicDescription = readingRoom.querySelector('[data-topic-description]');
    const topicStatus = readingRoom.querySelector('[data-topic-status]');
    const emptyState = readingRoom.querySelector('[data-topic-empty]');
    const latestLimit = 7;
    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

    const matchesTopic = (item, topic) => {
      if (topic === 'all') return true;
      if (topic === 'latest') return Number(item.dataset.storyOrder) < latestLimit;
      return item.dataset.topic === topic;
    };

    const updateCounts = () => {
      topicButtons.forEach((button) => {
        const topic = button.dataset.topicFilter;
        const count = storyItems.filter((item) => matchesTopic(item, topic)).length;
        const countNode = button.querySelector('[data-topic-count]');
        if (countNode) countNode.textContent = String(count).padStart(2, '0');
      });
    };

    const activateTopic = (topic, updateUrl = true) => {
      const activeButton = topicButtons.find((button) => button.dataset.topicFilter === topic) || topicButtons[0];
      const activeTopic = activeButton.dataset.topicFilter;
      let visibleCount = 0;

      topicButtons.forEach((button) => {
        const selected = button === activeButton;
        button.classList.toggle('is-active', selected);
        button.setAttribute('aria-pressed', selected ? 'true' : 'false');
      });

      storyItems.forEach((item) => {
        const visible = matchesTopic(item, activeTopic);
        const row = item.querySelector('[data-story-row]');
        if (row) row.open = false;
        item.hidden = !visible;
        if (visible) {
          item.style.setProperty('--visible-order', visibleCount);
          item.classList.remove('is-entering');
          window.requestAnimationFrame(() => item.classList.add('is-entering'));
          visibleCount += 1;
        }
      });

      if (topicHeading) topicHeading.textContent = activeButton.dataset.topicTitle || 'The reading room';
      if (topicDescription) {
        const description = activeButton.dataset.topicDescription || '';
        topicDescription.textContent = description;
        topicDescription.hidden = !description;
      }
      if (topicStatus) {
        const noun = visibleCount === 1 ? 'story' : 'stories';
        topicStatus.textContent = `Showing ${visibleCount} ${noun} from ${storyItems.length} published pieces.`;
      }
      if (emptyState) emptyState.hidden = visibleCount !== 0;

      if (updateUrl && window.history?.replaceState) {
        const url = new URL(window.location.href);
        if (activeTopic === 'latest') url.searchParams.delete('topic');
        else url.searchParams.set('topic', activeTopic);
        window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
      }
    };

    topicButtons.forEach((button) => {
      button.addEventListener('click', () => activateTopic(button.dataset.topicFilter));
    });

    storyRows.forEach((row) => {
      row.addEventListener('pointerenter', () => {
        if (hoverQuery.matches) row.open = true;
      });
      row.addEventListener('pointerleave', () => {
        if (hoverQuery.matches && !row.contains(document.activeElement)) row.open = false;
      });
      row.addEventListener('focusout', (event) => {
        if (!row.contains(event.relatedTarget) && hoverQuery.matches) row.open = false;
      });
    });

    updateCounts();
    const requestedTopic = new URL(window.location.href).searchParams.get('topic');
    const knownTopic = topicButtons.some((button) => button.dataset.topicFilter === requestedTopic);
    activateTopic(knownTopic ? requestedTopic : 'latest', false);
  }
})();
