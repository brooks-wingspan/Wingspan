(function(){
  var SELECTOR = [
    'h1','h2','h3','p','li','label',
    '.cap-title','.cap-desc','.pl-title','.pl-desc','.tag',
    '.section-label','.cap-group-label','.hero-sub','.hero-eyebrow','.intro-text',
    '.term-h1','.term-sub','.term-desc','.term-tag','.record-title','.record-desc',
    '.history-prose','.spec-header','.sk','.sv','.sv-c',
    '.contact-h1','.contact-sub','.contact-eyebrow','.contact-meta',
    '.cta-copy h2','.cta-copy p','.cta-h2','.cta-p','.form-thanks h3','.form-thanks p',
    '.value-h2','.value-right p',
    '.team-name','.team-title','.team-bio','.team-credential',
    '.client-name','.client-cat','.client-desc',
    '.proof-quote','.proof-name','.proof-co','.proof-right h3','.proof-right p',
    '.band-title','.band-right','.ai-header-main','.ai-header-sub','.ai-desc','.ai-badge',
    '.records-label','.history-label',
    '.nav-wordmark','.nav-cta',
    '.practice-strip-inner span','.bar-label','.pl-num','.pl-cta',
    '.band-eyebrow','.ai-pill-text','.ai-num','.ai-tag','.ai-cta','.tl-prose',
    '.chip','.cap-num',
    '.btn-w','.btn-o','.btn-term','.btn-term-o','.term-bar','.term-badge','.form-submit',
    '.fc','.flink'
  ].join(',');

  var EXCLUDE_CONTAINERS = '.cb-panel, .cb-toggle, .tb-wrap';
  var STORE_KEY = 'cb_overrides:' + location.pathname;

  var active = false;
  var panel = null;
  var toggleBtn = null;
  var hoveredEl = null;

  function loadOverrides(){
    try{ return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }catch(e){ return {}; }
  }

  function saveOverride(path, text){
    var map = loadOverrides();
    map[path] = text;
    try{ localStorage.setItem(STORE_KEY, JSON.stringify(map)); }catch(e){}
  }

  function getElementPath(el){
    var indices = [];
    var node = el;
    while(node && node !== document.body && node.parentElement){
      indices.unshift(Array.prototype.indexOf.call(node.parentElement.children, node));
      node = node.parentElement;
    }
    return indices.join('.');
  }

  function resolveElementPath(path){
    var node = document.body;
    var indices = path.split('.');
    for(var i = 0; i < indices.length; i++){
      node = node && node.children[+indices[i]];
      if(!node) return null;
    }
    return node;
  }

  function applyOverrides(){
    var map = loadOverrides();
    Object.keys(map).forEach(function(path){
      var el = resolveElementPath(path);
      if(el) el.textContent = map[path];
    });
  }

  function buildToggle(){
    toggleBtn = document.createElement('button');
    toggleBtn.className = 'cb-toggle';
    toggleBtn.innerHTML = '<span class="cb-toggle-dot"></span>ASK COPYWRITER';
    document.body.appendChild(toggleBtn);
    toggleBtn.addEventListener('click', function(){
      setActive(!active);
    });
  }

  function setActive(next){
    active = next;
    document.body.classList.toggle('cb-active', active);
    toggleBtn.classList.toggle('cb-toggle-on', active);
    if(!active && hoveredEl){
      hoveredEl.classList.remove('cb-hover');
      hoveredEl = null;
    }
  }

  document.addEventListener('mouseover', function(e){
    if(!active) return;
    if(e.target.closest(EXCLUDE_CONTAINERS)) return;
    var el = e.target.closest(SELECTOR);
    if(el === hoveredEl) return;
    if(hoveredEl) hoveredEl.classList.remove('cb-hover');
    hoveredEl = el;
    if(hoveredEl) hoveredEl.classList.add('cb-hover');
  });

  document.addEventListener('click', function(e){
    if(e.target.closest(EXCLUDE_CONTAINERS)) return;
    if(!active) return;
    var el = e.target.closest(SELECTOR);
    if(!el) return;
    e.preventDefault();
    e.stopPropagation();
    openPanel(el);
  }, true);

  function getLocationLabel(el){
    var item = el.closest('.cap-row, .pl, .record, .client-card, .team-card, .spec-row');
    if(item){
      var itemTitle = item.querySelector('.cap-title, .pl-title, .record-title, .client-name, .team-name, .sk');
      if(itemTitle && itemTitle !== el && itemTitle.textContent.trim()){
        return itemTitle.textContent.trim().replace(/\s+/g,' ').slice(0, 60);
      }
    }
    var section = el.closest('section, .cta-section, .term-hero, .spec-section, .records-section, .history-section, nav, footer, main, form') || document.body;
    var heading = section.querySelector('h1, h2, .section-label, .cap-group-label, .term-h1, .value-h2, .contact-h1, .spec-header, .records-label, .history-label');
    var label = heading ? heading.textContent.trim().replace(/\s+/g,' ').slice(0, 70) : section.tagName.toLowerCase();
    return label;
  }

  function closePanel(){
    if(panel){ panel.remove(); panel = null; }
  }

  function openPanel(el){
    closePanel();
    if(hoveredEl){ hoveredEl.classList.remove('cb-hover'); hoveredEl = null; }
    setActive(false);

    var pageTitle = document.title.replace(/\s*—\s*Wingspan.*$/, '').trim() || document.title;
    var pageFile = (location.pathname.split('/').pop() || 'index.html') || 'wingspan-v4-altitude.html';
    var locationLabel = getLocationLabel(el);
    var currentText = el.textContent.trim().replace(/\s+/g, ' ');
    var elLabel = (el.className && typeof el.className === 'string' && el.className.trim()) ? '.' + el.className.trim().split(/\s+/).join('.') : el.tagName.toLowerCase();

    panel = document.createElement('div');
    panel.className = 'cb-panel';
    panel.innerHTML =
      '<div class="cb-panel-head"><span>Copywriter Brief</span><button class="cb-close" aria-label="Close">&times;</button></div>' +
      '<div class="cb-panel-body">' +
        '<div class="cb-field-label">Page</div>' +
        '<div class="cb-field-value">' + escapeHtml(pageTitle) + ' (' + escapeHtml(pageFile) + ')</div>' +
        '<div class="cb-field-label">Section</div>' +
        '<div class="cb-field-value">' + escapeHtml(locationLabel) + '</div>' +
        '<div class="cb-field-label">Element</div>' +
        '<div class="cb-field-value cb-mono">' + escapeHtml(elLabel) + '</div>' +
        '<div class="cb-field-label">Current text</div>' +
        '<textarea class="cb-current" readonly>' + escapeHtml(currentText) + '</textarea>' +
        '<div class="cb-field-label">Or just type the new text</div>' +
        '<div class="cb-newtext-row">' +
          '<textarea class="cb-newtext" placeholder="Type the replacement text"></textarea>' +
          '<button class="cb-submit-newtext">Submit</button>' +
        '</div>' +
        '<div class="cb-field-label">What do you want changed?</div>' +
        '<textarea class="cb-request" placeholder="e.g. Give me three new bullet points for this section"></textarea>' +
        '<button class="cb-generate">Generate Brief</button>' +
        '<textarea class="cb-output" readonly style="display:none"></textarea>' +
        '<button class="cb-copy" style="display:none">Copy Brief</button>' +
        '<div class="cb-hint">This does not call any agent. Copy the brief and paste it into your copywriter chat.</div>' +
      '</div>';
    document.body.appendChild(panel);

    panel.querySelector('.cb-close').addEventListener('click', closePanel);

    panel.querySelector('.cb-submit-newtext').addEventListener('click', function(){
      var val = panel.querySelector('.cb-newtext').value.trim();
      if(!val) return;
      el.textContent = val;
      saveOverride(getElementPath(el), val);
      closePanel();
    });

    panel.querySelector('.cb-generate').addEventListener('click', function(){
      var request = panel.querySelector('.cb-request').value.trim();
      var brief =
        '=== COPYWRITER BRIEF ===\n' +
        'Page: ' + pageTitle + ' (' + pageFile + ')\n' +
        'Section: ' + locationLabel + '\n' +
        'Element: ' + elLabel + '\n' +
        'Current text: "' + currentText + '"\n' +
        'Request: ' + (request || '(describe what you want changed)') + '\n' +
        '========================';
      var out = panel.querySelector('.cb-output');
      out.value = brief;
      out.style.display = 'block';
      panel.querySelector('.cb-copy').style.display = 'block';
      out.focus();
      out.select();
    });

    panel.querySelector('.cb-copy').addEventListener('click', function(){
      var out = panel.querySelector('.cb-output');
      out.focus();
      out.select();
      var btn = panel.querySelector('.cb-copy');
      var done = function(ok){
        var orig = 'Copy Brief';
        btn.textContent = ok ? 'Copied!' : 'Select the text above and copy';
        setTimeout(function(){ btn.textContent = orig; }, 1600);
      };
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(out.value).then(function(){ done(true); }, function(){ done(false); });
      } else {
        try { done(document.execCommand('copy')); } catch(e){ done(false); }
      }
    });
  }

  function escapeHtml(str){
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function init(){
    applyOverrides();
    buildToggle();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
