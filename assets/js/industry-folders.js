(function () {
  'use strict';
  if (!window.customElements || customElements.get('weplace-industries')) return;

  // Public read model only. FLOW checks approval and the Seoul-date deadline
  // before projecting these fields. Never use the private client API.
  const REFRESH_MS = 60000;
  const guides = [
    { industry: '요식업', theme: 'dining', question: '부모님 모시고 갈 식당, 8명도 편하게 앉을까?', hesitation: '음식은 마음에 드는데 함께 앉을 자리가 보이지 않는다면, 모임을 정하기 전에 한 번 더 물어봐야 합니다.', evidence: ['룸·테이블별 이용 인원', '주차 위치와 예약 방법'], start: '식사 자리 고르는 손님 따라가기', scene: '테이블 배치와 식사 공간을 그린 요식업 예시', scope: '8명은 모임 상황의 예시입니다. 실제 수용 인원·룸 이용 조건·메뉴 가격은 매장 자료로 확인해야 합니다.' },
    { industry: '카페', theme: 'cafe', question: '둘이 대화하기 좋은 자리일까?', hesitation: '음료 사진은 마음에 드는데 좌석이 보이지 않는다면, 둘이 마주 앉아 이야기할 곳인지 알기 어렵습니다.', evidence: ['마주 앉을 좌석과 테이블 간격', '메뉴와 공간 이용 시간'], start: '카페를 고르는 손님 따라가기', scene: '커피와 창가 좌석을 그린 카페 예시', scope: '좌석과 머무는 상황을 설명하는 예시입니다. 실제 좌석 배치·이용 시간·영업시간은 매장마다 확인해야 합니다.' },
    { industry: '숙박', theme: 'stay', question: '늦게 도착해도 주차하고 체크인할 수 있을까?', hesitation: '마음에 드는 객실을 찾았어도 도착 시간에 이용할 수 있는지 모르면 예약을 결정하기 어렵습니다.', evidence: ['예약할 객실의 사진과 포함 시설', '주차 위치와 체크인 가능 시간'], start: '숙소 예약 전 화면 확인하기', scene: '객실과 도착 안내를 함께 그린 숙박 예시', scope: '도착 시간을 확인하는 상황의 예시입니다. 늦은 체크인이 가능하다는 뜻은 아닙니다. 추가요금·취소조건도 실제 예약 기준을 확인해야 합니다.' },
    { industry: '뷰티', theme: 'beauty', question: '어떤 관리를 얼마에 받을 수 있을까?', hesitation: '관심 있는 관리를 찾았어도 포함 항목과 추가 비용이 불분명하면 첫 예약을 망설일 수 있습니다.', evidence: ['관리별 포함 항목과 가격 기준', '상담부터 예약까지의 순서'], start: '첫 방문 고객의 시선 따라가기', scene: '거울과 상담 안내를 그린 뷰티 예시', scope: '상담과 관리 안내를 설명하는 예시입니다. 효과나 결과를 보여주는 자료가 아닙니다. 사례 사진은 사용 동의를 확인한 뒤 공개합니다.' }
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
      const opened = new Set([...this.querySelectorAll('details[open]')].map(node => node.dataset.disclosure || node.dataset.industry));
      const focused = document.activeElement;
      const focusKey = this.contains(focused) ? focused?.dataset?.focus : null;
      const focusIndustry = focusKey ? focused.closest('.wp-folder-card')?.querySelector('.wp-folder')?.dataset.industry : null;
      const shell = el('div', 'wp-folders-shell');
      shell.append(el('p', 'wp-folders-intro', '업종별 고객 질문을 살펴보는 예시입니다. 실제 관리 현황은 공개가 승인되고 확인된 경우에만 표시합니다.'));
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
        const card = el('article', 'wp-folder-card wp-folder-' + guide.theme);
        const folder = el('details', 'wp-folder wp-folder-' + guide.theme);
        folder.dataset.industry = guide.theme;
        folder.open = opened.has(guide.theme);
        const summary = el('summary');
        // Only an intentional native toggle animates. A minute refresh restoring
        // `open` must not replay the entrance or change focus/approval expiry.
        let openingByUser = false;
        summary.addEventListener('click', () => { openingByUser = !folder.open; });
        summary.dataset.focus = 'folder-' + guide.theme;
        summary.append(el('span', 'wp-folder-tab', String(index + 1).padStart(2, '0') + ' / CUSTOMER’S VIEW'));
        const top = el('div', 'wp-folder-top');
        top.append(el('span', 'wp-folder-tag', '손님의 첫 질문'), el('span', 'wp-folder-arrow', '↗'));
        summary.append(top, el('h3', '', guide.industry));
        const figure = el('figure', 'wp-folder-image');
        const img = el('img');
        img.src = '/assets/img/industry-' + guide.theme + '.svg';
        img.alt = guide.scene;
        img.loading = 'lazy';
        img.width = 500;
        img.height = 320;
        figure.append(img, el('figcaption', '', '업종 이해를 위한 예시'));
        summary.append(figure, el('p', 'wp-folder-question', guide.question));
        const expand = el('span', 'wp-folder-expand');
        expand.append(el('span', 'wp-folder-closed', '이 손님이 확인할 것 +'), el('span', 'wp-folder-opened', '내용 접기 −'));
        summary.append(expand);
        folder.append(summary);
        const body = el('div', 'wp-folder-body');
        folder.addEventListener('toggle', () => {
          if (folder.open && openingByUser) window.WeplaceMotion?.play(body, 'expand');
          else if (!folder.open) window.WeplaceMotion?.cancel(body);
          openingByUser = false;
        });
        body.append(el('p', 'wp-folder-finding', guide.hesitation), el('h4', '', '화면에서 확인할 두 가지'));
        const evidence = el('ul', 'wp-folder-evidence');
        guide.evidence.forEach(item => evidence.append(el('li', '', item)));
        body.append(evidence);
        const scope = el('details', 'wp-folder-extra');
        scope.dataset.disclosure = 'scope-' + guide.theme;
        scope.open = opened.has(scope.dataset.disclosure);
        const scopeSummary = el('summary', '', '실제 매장에 적용하기 전에');
        scopeSummary.dataset.focus = scope.dataset.disclosure;
        scope.append(scopeSummary, el('p', '', guide.scope));
        body.append(scope);
        const publicInfo = el('details', 'wp-folder-extra wp-folder-public');
        publicInfo.dataset.disclosure = 'public-' + guide.theme;
        publicInfo.open = opened.has(publicInfo.dataset.disclosure);
        const publicSummary = el('summary', '', '공개가 승인된 관리 현황·기록');
        publicSummary.dataset.focus = publicInfo.dataset.disclosure;
        publicInfo.append(publicSummary);
        if (updates.length) {
          publicInfo.append(el('h4', '', '공개 승인된 현장 기록'));
          updates.forEach(update => {
            const item = el('div', 'wp-folder-update');
            item.append(el('p', '', update.summary), el('small', '', '기록 확인 ' + date(update.updatedAt)));
            publicInfo.append(item);
          });
          const notes = el('a', 'wp-folder-record-link', '공개 작업 기록 더 보기 →');
          notes.href = '/field-notes/';
          notes.dataset.focus = 'records-' + guide.theme;
          publicInfo.append(notes);
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
          publicInfo.append(stat);
        }
        if (updates.length || metrics) body.append(publicInfo);
        const links = el('div', 'wp-folder-links');
        const start = el('a', '', guide.start + ' →');
        const atHome = /^\/experience(?:\/|\/index\.html)?$/.test(window.location.pathname);
        start.href = atHome ? '/experience/#experience' : '/experience/?industry=' + guide.theme + '#experience';
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
        folder.append(body);
        card.append(folder, links);
        grid.append(card);
      });
      shell.append(grid);
      const status = el('p', 'wp-folders-status');
      status.setAttribute('role', 'status');
      status.textContent = error ? '공개 기록을 불러오지 못했습니다. 업종별 체험은 계속 이용할 수 있습니다.' :
        hasPublicData ? '관리 현황과 작업 기록은 공개 확인된 범위에서만 표시합니다. 실제 착수 일정은 상담 후 확정합니다.' :
          '';
      status.hidden = !status.textContent;
      shell.append(status);
      if (error) {
        const retry = el('button', 'wp-folder-retry', '공개 기록 다시 불러오기');
        retry.type = 'button';
        retry.dataset.focus = 'retry';
        retry.addEventListener('click', () => this.load());
        shell.append(retry);
      }
      this.querySelectorAll('.wp-folder-body').forEach(node => window.WeplaceMotion?.cancel(node));
      this.replaceChildren(shell);
      if (focusKey) {
        const controls = [...this.querySelectorAll('[data-focus]')];
        // A record can vanish on expiry. Return to its visible sector heading
        // instead of stranding keyboard focus on the document body.
        const nextFocus = controls.find(node => node.dataset.focus === focusKey) ||
          controls.find(node => node.dataset.focus === 'folder-' + focusIndustry);
        nextFocus?.focus({ preventScroll: true });
      }
    }
  }
  customElements.define('weplace-industries', IndustryFolders);
})();
