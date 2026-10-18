(function () {
  'use strict';
  if (!window.customElements || customElements.get('weplace-industries')) return;

  // Public read model only. FLOW checks approval and the Seoul-date deadline
  // before projecting these fields. Never use the private client API.
  const REFRESH_MS = 60000;
  const guides = [
    { industry: '요식업', theme: 'dining', question: '부모님 모시고 가도 괜찮을까?', hesitation: '음식 사진은 좋은데, 조용한 자리와 주차 방법을 다시 찾아봅니다.', evidence: ['함께 앉을 자리와 인원', '메뉴·가격·주차 안내'], start: '식당 손님의 시선으로 보기' },
    { industry: '카페', theme: 'cafe', question: '여기서 편하게 머물 수 있을까?', hesitation: '예쁜 공간 다음에는 좌석, 이용 시간, 머무는 분위기가 궁금해집니다.', evidence: ['좌석 간격과 공간 분위기', '메뉴·이용 시간·방문 안내'], start: '카페 손님의 시선으로 보기' },
    { industry: '숙박', theme: 'stay', question: '사진 속 방이 내가 예약할 방일까?', hesitation: '객실 이름과 사진이 이어지지 않으면 예약 직전에도 다른 곳을 확인합니다.', evidence: ['객실별 실제 시설과 포함 항목', '도착·주차·체크인 안내'], start: '숙박 손님의 시선으로 보기' },
    { industry: '뷰티', theme: 'beauty', question: '나에게 맞는 상담을 받을 수 있을까?', hesitation: '좋은 후기만으로는 내 상황에 맞는 관리와 비용을 가늠하기 어렵습니다.', evidence: ['관리 범위·소요 시간·가격 기준', '상담 순서와 예약 전 확인사항'], start: '뷰티 손님의 시선으로 보기' }
  ];
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
  };
  const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const count = value => Number.isSafeInteger(value) && value >= 0;
  const timestamp = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 19) === value.slice(0, 19);
  const dateKey = value => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(value + 'T00:00:00Z');
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  };
  const deadline = value => dateKey(value) ? Date.parse(value + 'T23:59:59.999+09:00') : NaN;
  const date = value => new Date(value).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });

  // No fictional `approved` flag: it is absent from the public projection.
  // Valid approval dates and consistent numbers are required instead.
  function approvedMetrics(row) {
    const now = Date.now();
    if (!isRecord(row) || !count(row.managedCount) || !timestamp(row.capacityReviewedAt) ||
      Date.parse(row.capacityReviewedAt) > now + 60000 || !(deadline(row.activeUntil) >= now) ||
      Date.parse(row.capacityReviewedAt) > deadline(row.activeUntil)) return null;
    if (row.capacity === null && row.remaining === null) {
      return { managed: row.managedCount, capacity: null, remaining: null, reviewedAt: row.capacityReviewedAt, activeUntil: row.activeUntil };
    }
    if (!count(row.capacity) || row.capacity > 1000 || !count(row.remaining) ||
      row.remaining !== Math.max(0, row.capacity - row.managedCount)) return null;
    return { managed: row.managedCount, capacity: row.capacity, remaining: row.remaining, reviewedAt: row.capacityReviewedAt, activeUntil: row.activeUntil };
  }

  function publicUpdates(row) {
    // Descriptions have their own approval, independent of capacity. Their
    // expiry is checked server-side; a successful read is leased one minute.
    if (!isRecord(row) || !count(row.count) || !Array.isArray(row.updates) || row.updates.length !== row.count) return [];
    return row.updates.filter(update => isRecord(update) && typeof update.summary === 'string' &&
      update.summary.trim().length > 0 && update.summary.length <= 500 && timestamp(update.updatedAt) &&
      Date.parse(update.updatedAt) <= Date.now() + 60000).slice(0, 3);
  }

  class IndustryFolders extends HTMLElement {
    connectedCallback() {
      if (this.started) return;
      this.started = true;
      this.stopped = false;
      this.classList.add('wp-industry-widget');
      this.render(null);
      this.load();
      this.timer = setInterval(() => {
        // A background tab must not preserve an old approval indefinitely.
        if (document.hidden) this.render(null);
        else this.load();
      }, REFRESH_MS);
      this.visible = () => { if (!document.hidden) this.load(); };
      document.addEventListener('visibilitychange', this.visible);
    }

    disconnectedCallback() {
      this.stopped = true;
      this.started = false;
      clearInterval(this.timer);
      clearTimeout(this.expiryTimer);
      this.controller?.abort();
      document.removeEventListener('visibilitychange', this.visible);
    }

    async load() {
      this.controller?.abort();
      this.controller = new AbortController();
      const controller = this.controller;
      const timeout = setTimeout(() => controller.abort(), 12000);
      try {
        // Preserve the anonymous proxy contract and never send cookies.
        const response = await fetch(this.dataset.endpoint || '/api/weplace-industries', {
          method: 'GET', credentials: 'omit', cache: 'no-store', signal: controller.signal
        });
        if (!response.ok) throw new Error('unavailable');
        const data = await response.json();
        if (!isRecord(data) || !Array.isArray(data.industries)) throw new Error('invalid');
        if (!this.stopped && this.controller === controller) {
          this.render(data);
          clearTimeout(this.expiryTimer);
          const nextExpiry = data.industries.map(row => isRecord(row) ? deadline(row.activeUntil) + 1 : NaN)
            .filter(value => Number.isFinite(value) && value > Date.now());
          const lease = Math.min(REFRESH_MS, ...nextExpiry.map(value => value - Date.now()));
          this.expiryTimer = setTimeout(() => { if (!this.stopped) this.render(null); }, Math.max(0, lease));
        }
      } catch (_) {
        if (!this.stopped && this.controller === controller) {
          clearTimeout(this.expiryTimer);
          this.render(null, true);
        }
      } finally {
        clearTimeout(timeout);
      }
    }

    render(data, error = false) {
      const opened = new Set([...this.querySelectorAll('details[open]')].map(node => node.dataset.industry));
      const focused = document.activeElement;
      const focusKey = this.contains(focused) ? focused?.dataset?.focus : null;
      const shell = el('div', 'wp-folders-shell');
      const grid = el('div', 'wp-folders');
      const rows = isRecord(data) && Array.isArray(data.industries) ? data.industries : [];
      let hasPublicData = false;

      // Partial/unknown API responses cannot replace the four-sector navigation
      // or leak unexpected CRM fields into the DOM.
      guides.forEach((guide, index) => {
        const matching = rows.filter(row => isRecord(row) && row.industry === guide.industry);
        const row = matching.length === 1 ? matching[0] : null;
        const metrics = approvedMetrics(row);
        const updates = publicUpdates(row);
        hasPublicData = hasPublicData || !!metrics || updates.length > 0;
        const folder = el('details', 'wp-folder wp-folder-' + guide.theme);
        folder.dataset.industry = guide.theme;
        folder.open = opened.has(guide.theme);
        const summary = el('summary');
        summary.dataset.focus = 'folder-' + guide.theme;
        summary.append(el('span', 'wp-folder-tab', String(index + 1).padStart(2, '0') + ' / CUSTOMER’S VIEW'));
        const top = el('div', 'wp-folder-top');
        top.append(el('span', 'wp-folder-tag', '손님의 첫 질문'), el('span', 'wp-folder-arrow', '↗'));
        summary.append(top, el('h3', '', guide.industry));
        const figure = el('figure', 'wp-folder-image');
        const img = el('img');
        img.src = '/assets/img/industry-' + guide.theme + '.svg';
        img.alt = '';
        img.loading = 'lazy';
        img.width = 500;
        img.height = 320;
        figure.append(img, el('figcaption', '', '업종 이해를 위한 예시'));
        summary.append(figure, el('p', 'wp-folder-question', guide.question));
        const expand = el('span', 'wp-folder-expand');
        expand.append(el('span', 'wp-folder-closed', '손님이 확인할 것 +'), el('span', 'wp-folder-opened', '접어두기 −'));
        summary.append(expand);
        folder.append(summary);
        const body = el('div', 'wp-folder-body');
        body.append(el('h4', '', '어디에서 망설일까요?'), el('p', '', guide.hesitation), el('h4', '', '이 질문에 답하는 안내'));
        const evidence = el('ul', 'wp-folder-evidence');
        guide.evidence.forEach(item => evidence.append(el('li', '', item)));
        body.append(evidence);
        if (updates.length) {
          body.append(el('h4', '', '공개 승인된 현장 기록'));
          updates.forEach(update => {
            const item = el('div', 'wp-folder-update');
            item.append(el('p', '', update.summary), el('small', '', '기록 확인 ' + date(update.updatedAt)));
            body.append(item);
          });
          const notes = el('a', 'wp-folder-record-link', '공개 작업 기록 더 보기 →');
          notes.href = '/field-notes/';
          notes.dataset.focus = 'records-' + guide.theme;
          body.append(notes);
        }
        if (metrics) {
          const stat = el('aside', 'wp-folder-metrics');
          stat.setAttribute('aria-label', '공개 확인된 관리 현황');
          stat.append(el('strong', '', '현재 관리 ' + metrics.managed + '곳'));
          if (metrics.capacity !== null) {
            stat.append(el('p', '', '관리 한도 ' + metrics.capacity + '곳 · 잔여 ' + metrics.remaining + '곳'));
            if (metrics.remaining === 0) stat.append(el('p', '', '신규 착수 일정은 상담으로 확인합니다.'));
          }
          stat.append(el('small', '', '확인 ' + date(metrics.reviewedAt) + ' · 공개 기한 ' + metrics.activeUntil));
          body.append(stat);
        }
        const links = el('div', 'wp-folder-links');
        const start = el('a', '', guide.start + ' →');
        const atHome = window.location.pathname === '/' || window.location.pathname === '/index.html';
        start.href = atHome ? '/#experience' : '/?industry=' + guide.theme + '#experience';
        start.dataset.focus = 'start-' + guide.theme;
        start.addEventListener('click', event => {
          if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          try { window.WeplaceMetrics?.emit('industry_experience_start', { industry: guide.theme }); } catch (_) { /* Measurement never blocks a link. */ }
          if (atHome) {
            const experience = document.getElementById('experience');
            if (experience) {
              event.preventDefault();
              history.replaceState(null, '', '#experience');
            }
            document.dispatchEvent(new CustomEvent('weplace:industry', { detail: { industry: guide.theme } }));
          }
        });
        links.append(start);
        body.append(links);
        folder.append(body);
        grid.append(folder);
      });
      shell.append(grid);
      const status = el('p', 'wp-folders-status');
      status.setAttribute('role', 'status');
      status.textContent = error ? '공개 기록을 불러오지 못했습니다. 업종별 체험은 계속 이용할 수 있습니다.' :
        hasPublicData ? '관리 현황과 작업 기록은 공개 확인된 범위에서만 표시합니다. 실제 착수 일정은 상담 후 확정합니다.' :
          '위 장면은 업종별 이해를 돕는 예시입니다. 우리 매장에 필요한 안내를 직접 확인해 보세요.';
      shell.append(status);
      if (error) {
        const retry = el('button', 'wp-folder-retry', '공개 기록 다시 불러오기');
        retry.type = 'button';
        retry.dataset.focus = 'retry';
        retry.addEventListener('click', () => this.load());
        shell.append(retry);
      }
      this.replaceChildren(shell);
      if (focusKey) [...this.querySelectorAll('[data-focus]')].find(node => node.dataset.focus === focusKey)?.focus({ preventScroll: true });
    }
  }
  customElements.define('weplace-industries', IndustryFolders);
})();
