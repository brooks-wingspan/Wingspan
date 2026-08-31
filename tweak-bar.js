(function(){
"use strict";

/* Curated, premium-consulting-appropriate font list. No decorative/novelty/script fonts. */
var DEFAULT_SUGGESTIONS = ["Inter","Playfair Display","DM Sans","Libre Baskerville","Cormorant Garamond","Raleway","IBM Plex Sans","Outfit","Plus Jakarta Sans","Urbanist"];
var FONT_LIST = DEFAULT_SUGGESTIONS.concat([
  "Manrope","Sora","Space Grotesk","Archivo","Work Sans","Source Sans 3","Karla","Figtree","Lexend","Public Sans","Hanken Grotesk",
  "EB Garamond","Source Serif 4","Newsreader","Fraunces","Crimson Pro","Lora","Spectral","Bitter","Petrona","Cardo","Literata"
]);

/* Curated professional color ranges — no neons, no pastels outside the site's existing range. */
var SWATCHES = {
  bgPrimary:   ["#FFFFFF","#FAFAF9","#F7F6F3","#F4F2EE","#FAFAFA"],
  bgAlt:       ["#F7F6F3","#F2F1ED","#EFEFEC","#F5F5F5","#ECEBE7"],
  headingColor:["#101418","#14181C","#1B1A17","#0C0F12","#20242A"],
  bodyColor:   ["#3C4148","#454A50","#383C42","#4A4E54","#33373D"],
  accent:      ["#2596BE","#1E7A9C","#2C7873","#3D6B8A","#4A7C82","#5B8A9A"],
  navBg:       ["rgba(255,255,255,1)","rgba(255,255,255,.9)","rgba(247,246,243,.9)","rgba(240,240,240,.95)","rgba(16,20,24,.95)"]
};

var DEFAULTS = {
  fontHeading:"'IBM Plex Sans', sans-serif", fontHeadingName:"IBM Plex Sans",
  fontBody:"'IBM Plex Sans', sans-serif", fontBodyName:"IBM Plex Sans",
  headingScale:1.1, bodyScale:1.1, ls:5, lh:1.05, headingWeight:200,
  bgPrimary:"#FFFFFF", bgAlt:"#F5F5F5", headingColor:"#14181C", bodyColor:"#383C42",
  accent:"#2596BE", navBg:"rgba(255,255,255,.9)",
  padScale:1.35, radius:8, dividerW:1, dividerS:"solid"
};

var VAR_MAP = {
  fontHeading:"--tb-font-heading", fontBody:"--tb-font-body",
  headingScale:"--tb-heading-scale", bodyScale:"--tb-body-scale",
  ls:"--tb-ls", lh:"--tb-lh", headingWeight:"--tb-heading-weight",
  bgPrimary:"--tb-bg-primary", bgAlt:"--tb-bg-alt",
  headingColor:"--tb-heading-color", bodyColor:"--tb-body-color",
  accent:"--tb-accent", navBg:"--tb-nav-bg",
  padScale:"--tb-pad-scale", radius:"--tb-radius",
  dividerW:"--tb-divider-w", dividerS:"--tb-divider-s"
};

var STORE_KEY = "wingspan-tweak-v1";
var state = Object.assign({}, DEFAULTS);
var loadedFonts = {};

function loadState(){
  try{
    var raw = localStorage.getItem(STORE_KEY);
    if(raw){ var saved = JSON.parse(raw); state = Object.assign({}, DEFAULTS, saved); }
  }catch(e){}
}
function saveState(){
  try{ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }catch(e){}
}
function unit(key){
  if(key==="ls") return "em";
  if(key==="radius" || key==="dividerW") return "px";
  return "";
}
function applyVar(key){
  var v = state[key];
  var css = VAR_MAP[key];
  if(!css) return;
  var value = (key==="ls") ? (v/1000)+"em" : (v + unit(key));
  if(key==="fontHeading" || key==="fontBody" || key==="bgPrimary" || key==="bgAlt" || key==="headingColor" || key==="bodyColor" || key==="accent" || key==="navBg" || key==="dividerS"){
    value = v;
  }
  document.documentElement.style.setProperty(css, value);
}
function applyAll(){
  Object.keys(VAR_MAP).forEach(applyVar);
}
function ensureFontLoaded(name){
  if(!name || name==="Archivo" || loadedFonts[name]) return;
  loadedFonts[name] = true;
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family="+encodeURIComponent(name).replace(/%20/g,"+")+":wght@300;400;500;600;700&display=swap";
  document.head.appendChild(link);
}

/* ---------- UI ---------- */
function el(tag, cls, html){
  var e = document.createElement(tag);
  if(cls) e.className = cls;
  if(html!=null) e.innerHTML = html;
  return e;
}

function buildPanel(){
  var wrap = el("div","tb-wrap");
  wrap.innerHTML =
    '<button class="tb-toggle" type="button" aria-label="Open design tweak bar">'+
      '<span class="tb-toggle-dot"></span>Tweak'+
    '</button>'+
    '<div class="tb-panel" hidden>'+
      '<div class="tb-panel-head" data-drag-handle>'+
        '<span class="tb-panel-title">Design Tweaks</span>'+
        '<button class="tb-close" type="button" aria-label="Close">&times;</button>'+
      '</div>'+
      '<div class="tb-panel-body">'+

        '<div class="tb-group">'+
          '<div class="tb-group-label">Fonts</div>'+
          '<div class="tb-field"><label>Heading font</label><div class="tb-font-search" data-role="heading"></div></div>'+
          '<div class="tb-field"><label>Body font</label><div class="tb-font-search" data-role="body"></div></div>'+
        '</div>'+

        '<div class="tb-group">'+
          '<div class="tb-group-label">Typography</div>'+
          '<div class="tb-field tb-slider-field"><label>Heading size <span class="tb-val" data-val="headingScale"></span></label><input type="range" min="0.75" max="1.4" step="0.05" data-key="headingScale"></div>'+
          '<div class="tb-field tb-slider-field"><label>Body size <span class="tb-val" data-val="bodyScale"></span></label><input type="range" min="0.85" max="1.25" step="0.05" data-key="bodyScale"></div>'+
          '<div class="tb-field tb-slider-field"><label>Letter spacing <span class="tb-val" data-val="ls"></span></label><input type="range" min="-20" max="80" step="5" data-key="ls"></div>'+
          '<div class="tb-field tb-slider-field"><label>Line height <span class="tb-val" data-val="lh"></span></label><input type="range" min="0.85" max="1.35" step="0.05" data-key="lh"></div>'+
          '<div class="tb-field tb-slider-field"><label>Heading weight <span class="tb-val" data-val="headingWeight"></span></label><input type="range" min="0" max="2" step="1" data-key="headingWeight"></div>'+
        '</div>'+

        '<div class="tb-group">'+
          '<div class="tb-group-label">Colors</div>'+
          '<div class="tb-field"><label>Primary background</label><div class="tb-swatches" data-key="bgPrimary"></div></div>'+
          '<div class="tb-field"><label>Section alternate background</label><div class="tb-swatches" data-key="bgAlt"></div></div>'+
          '<div class="tb-field"><label>Primary heading color</label><div class="tb-swatches" data-key="headingColor"></div></div>'+
          '<div class="tb-field"><label>Body text color</label><div class="tb-swatches" data-key="bodyColor"></div></div>'+
          '<div class="tb-field"><label>Accent color</label><div class="tb-swatches" data-key="accent"></div></div>'+
          '<div class="tb-field"><label>Nav background</label><div class="tb-swatches" data-key="navBg"></div></div>'+
        '</div>'+

        '<div class="tb-group">'+
          '<div class="tb-group-label">Layout</div>'+
          '<div class="tb-field"><label>Section padding</label><div class="tb-segmented" data-key="padScale"><button data-v="0.75">Compact</button><button data-v="1">Normal</button><button data-v="1.35">Spacious</button></div></div>'+
          '<div class="tb-field"><label>Card border radius</label><div class="tb-segmented" data-key="radius"><button data-v="0">None</button><button data-v="8">Subtle</button><button data-v="20">Rounded</button></div></div>'+
          '<div class="tb-field"><label>Divider style</label><div class="tb-segmented" data-key="divider"><button data-v="0|none">None</button><button data-v="1|solid">Hairline</button><button data-v="2|solid">Medium</button></div></div>'+
        '</div>'+

        '<div class="tb-note">AI Transformation colors are locked and unaffected by these controls.</div>'+

        '<div class="tb-actions">'+
          '<button class="tb-btn tb-btn-ghost" type="button" data-action="reset">Reset</button>'+
          '<button class="tb-btn tb-btn-primary" type="button" data-action="copy">Copy CSS</button>'+
        '</div>'+
      '</div>'+
      '<div class="tb-resize-handle" data-resize-handle title="Drag to resize"></div>'+
    '</div>';
  document.body.appendChild(wrap);
  return wrap;
}

/* ---------- drag + resize (panel geometry only, kept separate from theme state) ---------- */
var PANEL_UI_KEY = "wingspan-tweak-panel-ui";
function loadPanelUI(){
  try{ var raw = localStorage.getItem(PANEL_UI_KEY); return raw ? JSON.parse(raw) : null; }catch(e){ return null; }
}
function savePanelUI(rect){
  try{ localStorage.setItem(PANEL_UI_KEY, JSON.stringify(rect)); }catch(e){}
}
function pinPanelPosition(panel){
  var r = panel.getBoundingClientRect();
  panel.style.position = "fixed";
  panel.style.left = r.left + "px";
  panel.style.top = r.top + "px";
  panel.style.bottom = "auto";
  panel.style.margin = "0";
}
function makeDraggable(panel, handle){
  var dragging=false, startX,startY,startLeft,startTop;
  handle.addEventListener("mousedown", function(e){
    if(e.target.closest(".tb-close")) return;
    dragging = true;
    pinPanelPosition(panel);
    var r = panel.getBoundingClientRect();
    startX=e.clientX; startY=e.clientY; startLeft=r.left; startTop=r.top;
    document.body.style.userSelect="none";
    e.preventDefault();
  });
  window.addEventListener("mousemove", function(e){
    if(!dragging) return;
    var newLeft = Math.max(4, Math.min(window.innerWidth-60, startLeft+(e.clientX-startX)));
    var newTop = Math.max(4, Math.min(window.innerHeight-40, startTop+(e.clientY-startY)));
    panel.style.left = newLeft+"px";
    panel.style.top = newTop+"px";
  });
  window.addEventListener("mouseup", function(){
    if(!dragging) return;
    dragging=false;
    document.body.style.userSelect="";
    persistPanelRect(panel);
  });
}
function makeResizable(panel, handle){
  var resizing=false, startX,startY,startW,startH;
  handle.addEventListener("mousedown", function(e){
    resizing = true;
    pinPanelPosition(panel);
    var r = panel.getBoundingClientRect();
    startX=e.clientX; startY=e.clientY; startW=r.width; startH=r.height;
    panel.style.maxHeight = "none";
    panel.style.maxWidth = "none";
    document.body.style.userSelect="none";
    e.preventDefault();
    e.stopPropagation();
  });
  window.addEventListener("mousemove", function(e){
    if(!resizing) return;
    var newW = Math.max(280, Math.min(window.innerWidth-40, startW+(e.clientX-startX)));
    var newH = Math.max(240, Math.min(window.innerHeight-40, startH+(e.clientY-startY)));
    panel.style.width = newW+"px";
    panel.style.height = newH+"px";
  });
  window.addEventListener("mouseup", function(){
    if(!resizing) return;
    resizing=false;
    document.body.style.userSelect="";
    persistPanelRect(panel);
  });
}
function persistPanelRect(panel){
  var r = panel.getBoundingClientRect();
  savePanelUI({left:r.left, top:r.top, width:r.width, height:r.height});
}
function restorePanelRect(panel){
  var saved = loadPanelUI();
  if(!saved) return;
  panel.style.position = "fixed";
  panel.style.left = saved.left+"px";
  panel.style.top = saved.top+"px";
  panel.style.bottom = "auto";
  panel.style.margin = "0";
  panel.style.width = saved.width+"px";
  panel.style.height = saved.height+"px";
  panel.style.maxHeight = "none";
  panel.style.maxWidth = "none";
}

function buildFontSearch(container, role){
  container.innerHTML =
    '<input type="text" class="tb-font-input" placeholder="Search fonts…" autocomplete="off">'+
    '<div class="tb-font-chip" hidden><span class="tb-font-chip-name"></span><button type="button" class="tb-font-chip-x">&times;</button></div>'+
    '<div class="tb-font-results"></div>';
  var input = container.querySelector(".tb-font-input");
  var results = container.querySelector(".tb-font-results");
  var chip = container.querySelector(".tb-font-chip");
  var chipName = container.querySelector(".tb-font-chip-name");
  var chipX = container.querySelector(".tb-font-chip-x");
  var key = role==="heading" ? "fontHeading" : "fontBody";
  var nameKey = role==="heading" ? "fontHeadingName" : "fontBodyName";

  function renderResults(query){
    var list = query ? FONT_LIST.filter(function(f){return f.toLowerCase().indexOf(query.toLowerCase())>-1;}) : DEFAULT_SUGGESTIONS;
    results.innerHTML = "";
    list.slice(0,8).forEach(function(name){
      var item = el("button","tb-font-result", name);
      item.type = "button";
      item.style.fontFamily = "'"+name+"', sans-serif";
      item.addEventListener("click", function(){
        ensureFontLoaded(name);
        state[key] = "'"+name+"', sans-serif";
        state[nameKey] = name;
        applyVar(key);
        saveState();
        showChip(name);
        input.value = "";
        results.innerHTML = "";
        results.classList.remove("open");
      });
      results.appendChild(item);
    });
    results.classList.toggle("open", list.length>0);
  }
  function showChip(name){
    if(name && name!=="Archivo"){
      chipName.textContent = name;
      chip.hidden = false;
    } else {
      chip.hidden = true;
    }
  }
  input.addEventListener("focus", function(){ renderResults(input.value); });
  input.addEventListener("input", function(){ renderResults(input.value); });
  input.addEventListener("blur", function(){ setTimeout(function(){ results.classList.remove("open"); },150); });
  chipX.addEventListener("click", function(){
    state[key] = DEFAULTS[key];
    state[nameKey] = DEFAULTS[nameKey];
    applyVar(key);
    saveState();
    showChip(null);
  });
  showChip(state[nameKey]);
}

function buildSwatches(container, key){
  container.innerHTML = "";
  SWATCHES[key].forEach(function(color){
    var sw = el("button","tb-swatch");
    sw.type = "button";
    sw.style.background = color;
    sw.title = color;
    sw.addEventListener("click", function(){
      state[key] = color;
      applyVar(key);
      saveState();
      markActiveSwatches(container, key);
    });
    container.appendChild(sw);
  });
  markActiveSwatches(container, key);
}
function markActiveSwatches(container, key){
  var current = state[key];
  Array.prototype.forEach.call(container.children, function(sw){
    sw.classList.toggle("active", sw.title === current || sw.style.background === current);
  });
}

function labelForSlider(key, v){
  if(key==="headingScale" || key==="bodyScale") return Math.round(v*100)+"%";
  if(key==="ls") return (v/1000).toFixed(3)+"em";
  if(key==="lh") return "×"+v;
  if(key==="headingWeight") return v==0?"Light":(v==1?"Regular":"Medium");
  return v;
}

function wirePanel(root){
  var toggle = root.querySelector(".tb-toggle");
  var panel = root.querySelector(".tb-panel");
  var closeBtn = root.querySelector(".tb-close");
  toggle.addEventListener("click", function(){ panel.hidden = false; toggle.hidden = true; restorePanelRect(panel); });
  closeBtn.addEventListener("click", function(){ panel.hidden = true; toggle.hidden = false; });

  makeDraggable(panel, root.querySelector("[data-drag-handle]"));
  makeResizable(panel, root.querySelector("[data-resize-handle]"));

  root.querySelectorAll(".tb-font-search").forEach(function(c){ buildFontSearch(c, c.getAttribute("data-role")); });
  root.querySelectorAll(".tb-swatches").forEach(function(c){ buildSwatches(c, c.getAttribute("data-key")); });

  root.querySelectorAll("input[type=range]").forEach(function(input){
    var key = input.getAttribute("data-key");
    input.value = state[key];
    root.querySelector('[data-val="'+key+'"]').textContent = labelForSlider(key, state[key]);
    input.addEventListener("input", function(){
      var v = parseFloat(input.value);
      state[key] = (key==="headingWeight") ? [200,400,500][v] : v;
      applyVar(key);
      root.querySelector('[data-val="'+key+'"]').textContent = labelForSlider(key, state[key]);
      saveState();
    });
  });

  root.querySelectorAll(".tb-segmented").forEach(function(seg){
    var key = seg.getAttribute("data-key");
    seg.querySelectorAll("button").forEach(function(btn){
      btn.addEventListener("click", function(){
        if(key==="divider"){
          var parts = btn.getAttribute("data-v").split("|");
          state.dividerW = parseFloat(parts[0]);
          state.dividerS = parts[1];
          applyVar("dividerW"); applyVar("dividerS");
        } else {
          state[key] = parseFloat(btn.getAttribute("data-v"));
          applyVar(key);
        }
        saveState();
        markActiveSegment(seg, key);
      });
    });
    markActiveSegment(seg, key);
  });

  root.querySelector('[data-action="reset"]').addEventListener("click", function(){
    state = Object.assign({}, DEFAULTS);
    saveState();
    applyAll();
    root.querySelectorAll(".tb-font-search").forEach(function(c){ buildFontSearch(c, c.getAttribute("data-role")); });
    root.querySelectorAll(".tb-swatches").forEach(function(c){ buildSwatches(c, c.getAttribute("data-key")); });
    root.querySelectorAll("input[type=range]").forEach(function(input){
      var key = input.getAttribute("data-key");
      input.value = state[key];
      root.querySelector('[data-val="'+key+'"]').textContent = labelForSlider(key, state[key]);
    });
    root.querySelectorAll(".tb-segmented").forEach(function(seg){ markActiveSegment(seg, seg.getAttribute("data-key")); });
  });

  root.querySelector('[data-action="copy"]').addEventListener("click", function(btnEvt){
    var lines = ["/* Wingspan — exported design tweaks */",":root{"];
    Object.keys(VAR_MAP).forEach(function(key){
      var css = VAR_MAP[key];
      var v = state[key];
      var value = (key==="ls") ? (v/1000)+"em" : (unit(key) ? (v+unit(key)) : v);
      lines.push("  "+css+": "+value+";");
    });
    lines.push("}");
    var text = lines.join("\n");
    var btn = btnEvt.currentTarget;
    var original = btn.textContent;
    function flash(msg){ btn.textContent = msg; setTimeout(function(){ btn.textContent = original; }, 1600); }
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(function(){ flash("Copied!"); }, function(){ window.prompt("Copy this CSS:", text); flash("Copy CSS"); });
    } else {
      window.prompt("Copy this CSS:", text);
    }
  });
}
function markActiveSegment(seg, key){
  var current = key==="divider" ? (state.dividerW+"|"+state.dividerS) : state[key];
  seg.querySelectorAll("button").forEach(function(btn){
    btn.classList.toggle("active", btn.getAttribute("data-v")==String(current));
  });
}

function init(){
  loadState();
  applyAll();
  if(state.fontHeadingName) ensureFontLoaded(state.fontHeadingName);
  if(state.fontBodyName) ensureFontLoaded(state.fontBodyName);
  var root = buildPanel();
  wirePanel(root);
}

if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
})();
