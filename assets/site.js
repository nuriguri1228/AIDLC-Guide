/* AIDLC Guide — 공통 상단 내비게이션 (모든 페이지 공유)
 * 페이지 목록은 여기 한 곳에서만 관리한다. 각 페이지는 <body data-page="..."> 로 자신을 식별한다.
 */
(function () {
  var SITE = {
    home:  { href: 'index.html', label: '홈' },
    cases: { href: 'cases.html', label: '실사례' },
    repo:  'https://github.com/awslabs/aidlc-workflows',
    groups: {
      v1: {
        label: 'v1', long: 'AI-DLC 1.0', note: '3 Phase · 14 Stage',
        pages: [
          { id: 'v1-workflow', href: 'v1-workflow.html', label: '워크플로우' },
          { id: 'v1-user-flow', href: 'v1-user-flow.html', label: '사용자 흐름' },
          { id: 'v1-reverse-engineering', href: 'v1-reverse-engineering.html', label: 'Reverse Engineering' },
          { id: 'v1-effects', href: 'v1-effects.html', label: '효과' },
          { id: 'v1-scenarios', href: 'v1-scenarios.html', label: '적용 시나리오' }
        ]
      },
      v2: {
        label: 'v2', long: 'AI-DLC 2.0', note: '5 Phase · Skills · Multi-Agent',
        pages: [
          { id: 'v2-overview', href: 'v2-overview.html', label: '개요 · 변경점' },
          { id: 'v2-workflow', href: 'v2-workflow.html', label: '워크플로우' },
          { id: 'v2-flow', href: 'v2-flow.html', label: '사용자 흐름' }
        ]
      }
    }
  };

  var page = document.body.getAttribute('data-page') || '';
  var ver = page.indexOf('v1-') === 0 ? 'v1' : page.indexOf('v2-') === 0 ? 'v2' : '';

  function a(href, text, cls, extra) {
    return '<a href="' + href + '"' + (cls ? ' class="' + cls + '"' : '') + (extra || '') + '>' + text + '</a>';
  }

  var primary =
    a(SITE.home.href, SITE.home.label, page === 'home' ? 'is-active' : '') +
    a(SITE.groups.v1.pages[0].href, '<span class="sg-ver v1">v1</span>1.0 가이드', ver === 'v1' ? 'is-active' : '') +
    a(SITE.groups.v2.pages[0].href, '<span class="sg-ver v2">v2</span>2.0 가이드', ver === 'v2' ? 'is-active' : '') +
    a(SITE.cases.href, SITE.cases.label, page === 'cases' ? 'is-active' : '');

  var html =
    '<div class="sg-bar">' +
      '<a class="sg-brand" href="index.html"><span class="sg-logo">AI</span>AIDLC Guide</a>' +
      '<nav class="sg-primary" aria-label="주요 메뉴">' + primary + '</nav>' +
      a(SITE.repo, 'GitHub ↗', 'sg-ext', ' target="_blank" rel="noopener"') +
    '</div>';

  if (ver) {
    var g = SITE.groups[ver];
    var tabs = g.pages.map(function (p) {
      return a(p.href, p.label, p.id === page ? 'is-active' : '', p.id === page ? ' aria-current="page"' : '');
    }).join('');
    html +=
      '<div class="sg-sub sg-' + ver + '">' +
        '<span class="sg-sub-label"><b>' + g.long + '</b><span>' + g.note + '</span></span>' +
        '<nav class="sg-tabs" aria-label="' + g.long + ' 문서">' + tabs + '</nav>' +
      '</div>';
  }

  var el = document.createElement('div');
  el.className = 'site-top';
  el.innerHTML = html;
  document.body.insertBefore(el, document.body.firstChild);

  // 버전 안내 배너 — 페이지가 어떤 버전 기준인지 항상 분명하게
  if (ver) {
    var banner = document.createElement('div');
    banner.className = 'sg-banner sg-' + ver;
    banner.innerHTML = ver === 'v1'
      ? '<b>v1 (AI-DLC 1.0)</b> 기준 문서입니다. 새 5-Phase · Skills 구조는 ' + a('v2-overview.html', 'v2 가이드 →') + ' 에서 볼 수 있습니다.'
      : '<b>v2 (AI-DLC 2.0)</b> 기준 문서입니다. 기존 3-Phase 구조는 ' + a('v1-workflow.html', 'v1 가이드 →') + ' 에서 볼 수 있습니다.';
    var header = document.querySelector('body > header');
    if (header) header.parentNode.insertBefore(banner, header.nextSibling);
    else el.parentNode.insertBefore(banner, el.nextSibling);
  }

  // 활성 탭이 가로 스크롤 영역 밖이면 보이도록
  var act = el.querySelector('.sg-tabs .is-active');
  if (act) {
    var tabsEl = act.parentNode;
    tabsEl.scrollLeft = act.offsetLeft - (tabsEl.clientWidth - act.offsetWidth) / 2;
  }
})();
