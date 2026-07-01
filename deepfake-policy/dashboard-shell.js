(function () {
  const LANG_KEY = 'deepfakePolicyLang';
  const countries = [
    { slug: 'australia', en: 'Australia', ko: '호주', region: 'Pacific / Asia' },
    { slug: 'china', en: 'China', ko: '중국', region: 'Pacific / Asia' },
    { slug: 'india', en: 'India', ko: '인도', region: 'Pacific / Asia' },
    { slug: 'korea', en: 'Korea', ko: '한국', region: 'Pacific / Asia' },
    { slug: 'pakistan', en: 'Pakistan', ko: '파키스탄', region: 'Pacific / Asia' },
    { slug: 'singapore', en: 'Singapore', ko: '싱가포르', region: 'Pacific / Asia' },
    { slug: 'united-states', en: 'United States', ko: '미국', region: 'Americas' },
    { slug: 'argentina', en: 'Argentina', ko: '아르헨티나', region: 'Americas' },
    { slug: 'eu', en: 'European Union', ko: '유럽연합', region: 'Europe' },
    { slug: 'france', en: 'France', ko: '프랑스', region: 'Europe' },
    { slug: 'germany', en: 'Germany', ko: '독일', region: 'Europe' },
    { slug: 'united-kingdom', en: 'United Kingdom', ko: '영국', region: 'Europe' },
    { slug: 'saudi-arabia', en: 'Saudi Arabia', ko: '사우디아라비아', region: 'Africa / Middle East' },
    { slug: 'united-arab-emirates', en: 'United Arab Emirates', ko: '아랍에미리트', region: 'Africa / Middle East' }
  ];

  const labels = {
    en: {
      language: 'Language',
      search: 'Search',
      searchPlaceholder: 'Search country or page',
      dashboard: 'Dashboard',
      countries: 'Countries',
      coding: 'Corpus & Clause coding',
      geography: 'Geography',
      penalties: 'What is illegal?',
      top: 'Back to top',
      detail: 'Country detail'
    },
    ko: {
      language: '언어',
      search: '검색',
      searchPlaceholder: '국가 또는 페이지 검색',
      dashboard: 'Dashboard',
      countries: 'Countries',
      coding: 'Corpus & Clause coding',
      geography: 'Geography',
      penalties: 'What is illegal?',
      top: '맨 위로',
      detail: '국가 상세'
    }
  };

  function currentLang() {
    const qs = new URLSearchParams(location.search);
    const q = qs.get('lang');
    if (q === 'ko' || q === 'en') return q;
    try { return localStorage.getItem(LANG_KEY) === 'ko' ? 'ko' : 'en'; }
    catch (_) { return 'en'; }
  }

  function withLang(path, lang = currentLang()) {
    const url = new URL(path, location.origin);
    url.searchParams.set('lang', lang);
    return url.pathname + url.search + url.hash;
  }

  function pageItems(lang) {
    const t = labels[lang];
    return [
      { key: 'dashboard', label: t.dashboard, href: '/deepfake-policy/rq/' },
      { key: 'countries', label: t.countries, href: '/deepfake-policy/countries/' },
      { key: 'coding', label: t.coding, href: '/deepfake-policy/coding/' },
      { key: 'geography', label: t.geography, href: '/deepfake-policy/geography/' },
      { key: 'penalties', label: t.penalties, href: '/deepfake-policy/penalties/' }
    ];
  }

  function activeKey() {
    const p = location.pathname;
    if (p.includes('/rq/')) return 'dashboard';
    if (p.includes('/countries/') || p.includes('/country/')) return 'countries';
    if (p.includes('/coding/')) return 'coding';
    if (p.includes('/geography/')) return 'geography';
    if (p.includes('/penalties/')) return 'penalties';
    return '';
  }

  function regionHtml(lang) {
    const grouped = countries.reduce((acc, c) => {
      (acc[c.region] ||= []).push(c);
      return acc;
    }, {});
    return Object.entries(grouped).map(([region, list]) => `
      <details class="policy-shell-region">
        <summary>${region}</summary>
        <div class="policy-shell-country-list">
          ${list.map((c) => `<a class="policy-shell-country-link" href="${withLang('/deepfake-policy/country/' + c.slug + '/', lang)}">${lang === 'ko' ? c.ko : c.en}</a>`).join('')}
        </div>
      </details>
    `).join('');
  }

  function renderSearchResults(host, query, lang) {
    const q = query.trim().toLowerCase();
    if (!q) {
      host.classList.remove('is-open');
      host.innerHTML = '';
      return;
    }
    const pages = pageItems(lang).map((p) => ({ ...p, type: 'Page' }));
    const countryItems = countries.map((c) => ({
      label: lang === 'ko' ? c.ko : c.en,
      sub: c.region,
      href: '/deepfake-policy/country/' + c.slug + '/',
      type: labels[lang].detail
    }));
    const results = [...pages, ...countryItems].filter((item) => {
      const hay = [item.label, item.sub, item.type].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(q);
    }).slice(0, 9);
    host.innerHTML = results.length
      ? results.map((item) => `<button type="button" class="policy-shell-result" data-href="${withLang(item.href, lang)}">${item.label}<small>${item.sub || item.type}</small></button>`).join('')
      : `<button type="button" class="policy-shell-result">${lang === 'ko' ? '검색 결과 없음' : 'No results'}</button>`;
    host.classList.add('is-open');
  }

  function syncExistingLanguage(lang) {
    const select = document.getElementById('lang') || document.getElementById('uiLang');
    if (select && select.value !== lang) {
      select.value = lang;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function init() {
    if (document.querySelector('.policy-shell-sidebar')) return;
    const lang = currentLang();
    const t = labels[lang];
    document.body.classList.add('has-policy-shell');
    const active = activeKey();
    const nav = pageItems(lang).map((item) => `
      <a class="${item.key === active ? 'is-active' : ''}" data-policy-nav="${item.key}" ${item.key === 'countries' ? `aria-expanded="${active === 'countries' ? 'true' : 'false'}"` : ''} href="${withLang(item.href, lang)}">${item.label}</a>
    `).join('');

    const aside = document.createElement('aside');
    aside.className = `policy-shell-sidebar${active === 'countries' ? ' is-country-menu-open' : ''}`;
    aside.innerHTML = `
      <a class="policy-shell-brand" href="${withLang('/deepfake-policy/', lang)}">
        <strong>DeepfakePolicy</strong>
      </a>
      <div class="policy-shell-lang">
        <label class="policy-shell-label" for="policyShellLang">${t.language}</label>
        <select id="policyShellLang">
          <option value="en" ${lang === 'en' ? 'selected' : ''}>English</option>
          <option value="ko" ${lang === 'ko' ? 'selected' : ''}>한국어</option>
        </select>
      </div>
      <div class="policy-shell-search">
        <input id="policyShellSearch" type="search" placeholder="${t.searchPlaceholder}" aria-label="${t.search}" autocomplete="off" />
        <div class="policy-shell-results" id="policyShellResults"></div>
      </div>
      <nav class="policy-shell-nav">${nav}</nav>
      <div class="policy-shell-country-groups">${regionHtml(lang)}</div>
      <div class="policy-shell-footer">
        <a class="policy-shell-top" href="#top">${t.top}</a>
        <div class="policy-shell-marks" aria-label="Research affiliations">
          <span class="policy-shell-mark">SKKU</span>
          <span class="policy-shell-mark">CSIRO</span>
          <span class="policy-shell-mark">ORCID</span>
          <span class="policy-shell-mark">GS</span>
        </div>
      </div>
    `;
    document.body.prepend(aside);
    if (!document.getElementById('top')) document.body.id = 'top';

    const shellLang = aside.querySelector('#policyShellLang');
    shellLang.addEventListener('change', () => {
      const next = shellLang.value;
      try { localStorage.setItem(LANG_KEY, next); } catch (_) {}
      const url = new URL(location.href);
      url.searchParams.set('lang', next);
      location.href = url.pathname + url.search + url.hash;
    });

    const search = aside.querySelector('#policyShellSearch');
    const results = aside.querySelector('#policyShellResults');
    const countriesNav = aside.querySelector('[data-policy-nav="countries"]');
    if (countriesNav) {
      countriesNav.addEventListener('click', (event) => {
        if (!aside.classList.contains('is-country-menu-open')) {
          event.preventDefault();
          aside.classList.add('is-country-menu-open');
          countriesNav.setAttribute('aria-expanded', 'true');
        }
      });
    }
    search.addEventListener('input', () => renderSearchResults(results, search.value, lang));
    results.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-href]');
      if (btn) location.href = btn.dataset.href;
    });
    document.addEventListener('click', (event) => {
      if (!aside.contains(event.target)) results.classList.remove('is-open');
    });
    syncExistingLanguage(lang);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
