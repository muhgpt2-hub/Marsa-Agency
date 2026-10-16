/* ============================================================
   MARSA AGENCY v3.0 — Main Application
   ============================================================ */

import {
  $, $$, esc, fmtDate, genCode, toast, spawnConfetti,
  CONFIG, STAGES, db, doc, setDoc, getDoc
} from './firebase-config.js';

/* ===== LOADER ===== */
(function(){
  const pct = $('#pct'), bar = $('#loadBarFill');
  let p = 0;
  const iv = setInterval(() => {
    p += Math.random() * 5 + 2;
    if (p > 100) p = 100;
    pct.textContent = Math.floor(p);
    bar.style.width = p + '%';
    if (p >= 100) {
      clearInterval(iv);
      setTimeout(() => {
        const l = $('#loader');
        l.classList.add('done');
        setTimeout(() => l.remove(), 1000);
        initReveal();
        initCounters();
      }, 500);
    }
  }, 180);
})();
document.body.classList.add('lock');

/* ===== NAV ===== */
const nav = $('#nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', scrollY > 40);
}, { passive: true });

const navToggle = $('#navToggle'), navLinksEl = $('#navLinks'), navOverlay = $('#navOverlay');
if (navToggle && navLinksEl && navOverlay) {
  const closeMenu = () => {
    navLinksEl.classList.remove('open');
    navOverlay.classList.remove('open');
  };
  navToggle.addEventListener('click', () => {
    navLinksEl.classList.toggle('open');
    navOverlay.classList.toggle('open');
  });
  navOverlay.addEventListener('click', closeMenu);
  navLinksEl.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
}

/* ===== REVEAL / COUNTERS ===== */
function initReveal(){
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12, rootMargin: '0px 0px -60px 0px' });
  $$('.reveal').forEach(el => io.observe(el));
}

function initCounters(){
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, t = parseInt(el.dataset.count, 10), dur = 1400, st = performance.now();
    (function tick(now){
      const k = Math.min((now - st) / dur, 1);
      el.textContent = Math.floor(t * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
      else el.textContent = t;
    })(st);
    io.unobserve(el);
  }), { threshold: .5 });
  $$('[data-count]').forEach(el => io.observe(el));
}

/* ===== POINTER GLOW ===== */
document.addEventListener('pointermove', e => {
  const f = e.target.closest('.feature');
  if (!f) return;
  const r = f.getBoundingClientRect();
  f.style.setProperty('--mx', (e.clientX - r.left) + 'px');
  f.style.setProperty('--my', (e.clientY - r.top) + 'px');
}, { passive: true });

/* ===== ROTATOR ===== */
(function rotator(){
  const words = ['احترافياً', 'يخطف الأنظار', 'سريعاً كالبرق', 'يبيع نيابة عنك', 'لا يُنسى'];
  const el = $('#rotator');
  if (!el) return;
  let i = 0, c = 0, deleting = false;
  (function loop(){
    const w = words[i];
    el.textContent = deleting ? w.substring(0, c--) : w.substring(0, c++);
    let delay = deleting ? 55 : 110;
    if (!deleting && c === w.length + 1) { deleting = true; delay = 1700; }
    else if (deleting && c === 0) { deleting = false; i = (i + 1) % words.length; delay = 350; }
    setTimeout(loop, delay);
  })();
})();

/* ============================================================
   CALCULATOR
   ============================================================ */
const calcState = {
  type: { name: 'عيادة / مركز طبي', price: 3500 },
  pages: 5,
  feats: [],
  speed: { mult: 1, name: 'تسليم عادي' }
};
const PAGE_BASE = 5, PAGE_EXTRA = 350;

function calcTotal(){
  let total = calcState.type.price;
  if (calcState.pages > PAGE_BASE) total += (calcState.pages - PAGE_BASE) * PAGE_EXTRA;
  calcState.feats.forEach(f => total += f.price);
  return Math.round(total * calcState.speed.mult);
}

function renderSummary(){
  const rows = $('#sumRows');
  if (!rows) return;
  const list = [{ n: 'النشاط: ' + calcState.type.name, p: calcState.type.price }];
  list.push({
    n: `عدد الصفحات: ${calcState.pages}`,
    p: calcState.pages > PAGE_BASE ? (calcState.pages - PAGE_BASE) * PAGE_EXTRA : 0
  });
  calcState.feats.forEach(f => list.push({ n: f.name, p: f.price }));
  if (calcState.speed.mult !== 1) list.push({ n: calcState.speed.name, p: '×' + calcState.speed.mult });

  rows.innerHTML = list.map(r =>
    `<div class="sum-row"><span>${esc(r.n)}</span><b>${
      r.p === 0 ? 'مشمول' : (typeof r.p === 'string' ? r.p : '+' + r.p.toLocaleString('en-US'))
    }</b></div>`
  ).join('');

  const total = calcTotal();
  const tp = $('#totalPrice');
  if (tp) tp.textContent = total.toLocaleString('en-US');
  const est = $('#estimateField');
  if (est) est.value = total.toLocaleString('en-US') + ' ج.م';
}

$$('#optType .opt').forEach(o => o.addEventListener('click', () => {
  $$('#optType .opt').forEach(x => x.classList.remove('on'));
  o.classList.add('on');
  calcState.type = { name: o.dataset.name, price: +o.dataset.price };
  renderSummary();
}));

const pagesRange = $('#pagesRange');
function updRange(){
  if (!pagesRange) return;
  const min = +pagesRange.min, max = +pagesRange.max, v = +pagesRange.value;
  pagesRange.style.setProperty('--pct', ((v - min) / (max - min) * 100) + '%');
  const pv = $('#pagesVal');
  if (pv) pv.textContent = v;
  calcState.pages = v;
  renderSummary();
}
if (pagesRange) { pagesRange.addEventListener('input', updRange); updRange(); }

$$('#featsBox .feat').forEach(f => f.addEventListener('click', () => {
  f.classList.toggle('on');
  const name = f.dataset.name, price = +f.dataset.price;
  const idx = calcState.feats.findIndex(x => x.name === name);
  if (idx > -1) calcState.feats.splice(idx, 1);
  else calcState.feats.push({ name, price });
  renderSummary();
}));

$$('#optSpeed .opt').forEach(o => o.addEventListener('click', () => {
  $$('#optSpeed .opt').forEach(x => x.classList.remove('on'));
  o.classList.add('on');
  calcState.speed = { mult: +o.dataset.mult, name: o.dataset.name };
  renderSummary();
}));

renderSummary();

$('#calcToOrder')?.addEventListener('click', () => {
  const est = $('#estimateField');
  if (est) est.value = calcTotal().toLocaleString('en-US') + ' ج.م';
});

/* ============================================================
   FORM MODE TOGGLE
   ============================================================ */
$$('#formModeToggle button').forEach(b => b.addEventListener('click', () => {
  $$('#formModeToggle button').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  const mode = b.dataset.mode;
  if (mode === 'advanced') {
    $('#form').style.display = 'block';
    $('#simpleFormShell').style.display = 'none';
  } else {
    $('#form').style.display = 'none';
    $('#simpleFormShell').style.display = 'block';
  }
}));

/* ============================================================
   ADVANCED FORM
   ============================================================ */
const form = $('#form');
const panes = [...document.querySelectorAll('.step-pane')];
const stepsEls = [...document.querySelectorAll('.step')];
const progFill = $('#progFill');
const progPct = $('#progPct');
const stepNow = $('#stepNow');
const prevBtn = $('#prevBtn');
const nextBtn = $('#nextBtn');
const successPane = $('#success');
const formFoot = $('#formFoot');
let current = 1;
const TOTAL = 4;

const validators = {
  name: v => v.trim().length >= 3,
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  phone: v => /^01[0125][0-9]{8}$/.test(v.trim().replace(/[\s\-\(\)]/g, '')),
  country: v => v !== '',
  budget: v => v !== '',
  timeline: v => v !== '',
  message: v => v.trim().length >= 20
};

['name','email','phone','country','budget','timeline','message'].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  const wrap = el.closest('.field');
  const run = () => {
    const v = el.value;
    if (!v) { wrap.classList.remove('ok', 'err'); return; }
    const ok = validators[id] ? validators[id](v) : true;
    wrap.classList.toggle('ok', ok);
    wrap.classList.toggle('err', !ok);
    if (id === 'country' || id === 'budget' || id === 'timeline') el.classList.toggle('filled', v !== '');
    updateNextState();
  };
  el.addEventListener('input', run);
  el.addEventListener('change', run);
  el.addEventListener('blur', () => {
    if (!el.value && validators[id]) {
      wrap.classList.remove('ok');
      wrap.classList.add('err');
    }
  });
});

const choiceGrid = $('#choiceGrid');
const requestType = $('#requestType');
const requestTypeErr = $('#requestTypeErr');
if (choiceGrid) {
  choiceGrid.addEventListener('click', e => {
    const c = e.target.closest('.choice');
    if (!c) return;
    choiceGrid.querySelectorAll('.choice').forEach(x => x.classList.remove('selected'));
    c.classList.add('selected');
    requestType.value = c.dataset.value;
    requestTypeErr.style.display = 'none';
    updateNextState();
  });
}

$('#agree')?.addEventListener('change', e => {
  if (e.target.checked) $('#agreeErr').style.display = 'none';
  updateNextState();
});

function stepValid(step){
  if (step === 1) return requestType.value !== '';
  if (step === 2) return validators.name($('#name').value)
    && validators.email($('#email').value)
    && validators.phone($('#phone').value)
    && validators.country($('#country').value);
  if (step === 3) return validators.budget($('#budget').value)
    && validators.timeline($('#timeline').value)
    && validators.message($('#message').value);
  if (step === 4) return $('#agree').checked;
  return true;
}

function updateNextState(){
  nextBtn.disabled = !stepValid(current);
  if (current === TOTAL) nextBtn.innerHTML = 'تأكيد الإرسال ✓';
  else nextBtn.innerHTML = 'التالي <span class="btn-arrow">←</span>';
}

function goTo(step){
  if (step < 1 || step > TOTAL) return;
  current = step;
  panes.forEach(p => p.classList.toggle('active', +p.dataset.pane === current));
  stepsEls.forEach(s => {
    const n = +s.dataset.step;
    s.classList.toggle('active', n === current);
    s.classList.toggle('done', n < current);
  });
  const pct = Math.round((current / TOTAL) * 100);
  progFill.style.width = pct + '%';
  progPct.textContent = pct + '%';
  stepNow.textContent = current;
  prevBtn.disabled = current === 1;
  updateNextState();
  if (current === 4) buildSummary();
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

nextBtn.addEventListener('click', () => {
  if (!stepValid(current)) {
    if (current === 1) requestTypeErr.style.display = 'block';
    if (current === 4) $('#agreeErr').style.display = 'flex';
    return;
  }
  if (current < TOTAL) goTo(current + 1);
  else submitAdvanced();
});

prevBtn.addEventListener('click', () => goTo(current - 1));

function buildSummary(){
  const data = {
    'نوع الطلب': document.querySelector('.choice.selected')?.querySelector('strong')?.textContent || '—',
    'الاسم': $('#name').value || '—',
    'البريد': $('#email').value || '—',
    'الهاتف': $('#phone').value || '—',
    'الدولة': $('#country').selectedOptions[0]?.text || '—',
    'الشركة': $('#company').value || '—',
    'الميزانية': $('#budget').selectedOptions[0]?.text || '—',
    'الإطار': $('#timeline').selectedOptions[0]?.text || '—'
  };
  const msg = $('#message').value || '';
  const s = $('#summary');
  s.innerHTML = Object.entries(data).map(([k, v]) =>
    `<div class="summary-row"><span class="k">${k}</span><span class="v">${esc(v)}</span></div>`
  ).join('') +
  `<div class="summary-row"><span class="k">الرسالة</span><span class="v" style="max-width:60%;font-size:13.5px;color:var(--text-2)">${esc(msg).slice(0,180)}${msg.length > 180 ? '…' : ''}</span></div>`;
}

async function submitAdvanced(){
  const hp = $('#hpWebsite');
  if (hp && hp.value.trim() !== '') return;

  nextBtn.disabled = true;
  nextBtn.innerHTML = '<span style="opacity:.7">⏳ جاري الإرسال...</span>';

  const code = genCode();
  const order = {
    code,
    name: $('#name').value.trim(),
    phone: $('#phone').value.trim(),
    email: $('#email').value.trim(),
    type: document.querySelector('.choice.selected')?.dataset.value || '—',
    budget: $('#budget').selectedOptions[0]?.text || 'غير محدد',
    estimate: $('#estimateField')?.value || 'غير محدد',
    details: $('#message').value.trim() + ' | الدولة: ' + ($('#country').selectedOptions[0]?.text || '—'),
    stage: 0,
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'orders', code), order);
    panes.forEach(p => p.classList.remove('active'));
    successPane.classList.add('active');
    formFoot.style.display = 'none';
    $('#steps').style.opacity = '.35';
    document.querySelector('.prog-wrap').style.opacity = '.35';
    $('#refNum').textContent = code;
    spawnConfetti(70);
    toast('تم إرسال طلبك بنجاح ✓', 'ok', 4000);
  } catch (err) {
    console.error('Order save error:', err);
    nextBtn.disabled = false;
    nextBtn.innerHTML = 'حاول تاني ←';
    toast('حصلت مشكلة في الإرسال.', 'err');
  }
}

window.resetForm = function(){
  form.reset();
  document.querySelectorAll('.choice').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.field').forEach(f => f.classList.remove('ok', 'err'));
  requestType.value = '';
  successPane.classList.remove('active');
  formFoot.style.display = 'flex';
  $('#steps').style.opacity = '1';
  document.querySelector('.prog-wrap').style.opacity = '1';
  goTo(1);
};

const msgEl = $('#message'), msgCount = $('#msgCount');
if (msgEl && msgCount) {
  msgEl.setAttribute('maxlength', '500');
  msgEl.addEventListener('input', () => {
    const len = msgEl.value.length;
    msgCount.textContent = len;
    msgCount.style.color = len > 450 ? 'var(--rose)' : len > 350 ? 'var(--amber)' : 'var(--text-3)';
  });
}

/* ============================================================
   SIMPLE FORM → FIRESTORE
   ============================================================ */
const simpleForm = $('#simpleOrderForm');
simpleForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(simpleForm);
  const data = Object.fromEntries(fd.entries());

  for (const k of ['name','phone','email','type','details']) {
    if (!data[k]?.trim()) {
      const el = simpleForm.querySelector(`[name="${k}"]`);
      el.style.borderColor = 'var(--rose)';
      el.focus();
      setTimeout(() => el.style.borderColor = '', 2200);
      return;
    }
  }

  const phoneClean = data.phone.trim().replace(/[\s\-\(\)]/g, '');
  if (!/^01[0125][0-9]{8}$/.test(phoneClean)) {
    const el = simpleForm.querySelector('[name="phone"]');
    el.style.borderColor = 'var(--rose)';
    el.focus();
    toast('⚠️ رقم مصري غير صحيح', 'err');
    setTimeout(() => el.style.borderColor = '', 2200);
    return;
  }

  if (!/^\S+@\S+\.\S+$/.test(data.email)) {
    const el = simpleForm.querySelector('[name="email"]');
    el.style.borderColor = 'var(--rose)';
    el.focus();
    setTimeout(() => el.style.borderColor = '', 2200);
    return;
  }

  const btn = simpleForm.querySelector('button[type="submit"]');
  const oldTxt = btn.innerHTML;
  btn.innerHTML = '⏳ جارٍ الإرسال...';
  btn.disabled = true;

  const code = genCode();
  const order = {
    code,
    name: data.name.trim(),
    phone: data.phone.trim(),
    email: data.email.trim(),
    type: data.type,
    budget: data.budget || 'غير محدد',
    estimate: data.estimate || 'غير محدد',
    details: data.details.trim(),
    stage: 0,
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'orders', code), order);
    btn.innerHTML = oldTxt;
    btn.disabled = false;
    simpleForm.reset();
    renderSummary();
    showSuccess(order);
  } catch (err) {
    console.error('Order save error:', err);
    toast('❌ حدث خطأ أثناء إرسال الطلب.', 'err');
    btn.innerHTML = oldTxt;
    btn.disabled = false;
  }
});

/* ============================================================
   SUCCESS MODAL
   ============================================================ */
const successModal = $('#successModal');
let lastOrder = null;

function showSuccess(order){
  lastOrder = order;
  $('#newCode').textContent = order.code;
  successModal.classList.add('on');
  document.body.classList.add('lock');
  const msg = encodeURIComponent(
    `مرحباً فريق MARSA 👋\n\nطلبت مشروع جديد.\n\n🔑 الكود: ${order.code}\n👤 الاسم: ${order.name}\n📞 الهاتف: ${order.phone}\n📧 الإيميل: ${order.email}\n🏷️ النوع: ${order.type}\n💰 التقدير: ${order.estimate}\n\n📝 التفاصيل:\n${order.details}`
  );
  $('#waSend').href = `https://wa.me/${CONFIG.whatsapp}?text=${msg}`;
}

$('#modalClose')?.addEventListener('click', () => {
  successModal.classList.remove('on');
  document.body.classList.remove('lock');
});
successModal?.addEventListener('click', e => {
  if (e.target === successModal) $('#modalClose').click();
});

$('#copyCode')?.addEventListener('click', function(){
  navigator.clipboard.writeText($('#newCode').textContent).then(() => {
    this.textContent = '✅ تم النسخ!';
    this.classList.add('done');
    setTimeout(() => {
      this.textContent = '📋 نسخ الكود';
      this.classList.remove('done');
    }, 2200);
  });
});

$('#goTrack')?.addEventListener('click', () => {
  $('#modalClose').click();
  $('#track').scrollIntoView({ behavior: 'smooth' });
  if (lastOrder) {
    $('#trackInput').value = lastOrder.code;
    setTimeout(doTrack, 700);
  }
});

/* ============================================================
   TRACKING
   ============================================================ */
const trackBtn = $('#trackBtn'), trackInput = $('#trackInput');
trackBtn?.addEventListener('click', doTrack);
trackInput?.addEventListener('keydown', e => { if (e.key === 'Enter') doTrack(); });
trackInput?.addEventListener('input', function(){ this.value = this.value.toUpperCase(); });

async function doTrack(){
  const code = trackInput.value.trim().toUpperCase();
  const errBox = $('#errBox'), resBox = $('#trackResult');

  if (!code) {
    errBox.textContent = '⚠️ من فضلك أدخل كود التتبّع.';
    errBox.classList.add('on');
    resBox.classList.remove('on');
    return;
  }

  trackBtn.disabled = true;
  trackBtn.textContent = '⏳ جارٍ البحث...';

  try {
    const snap = await getDoc(doc(db, 'orders', code));
    trackBtn.disabled = false;
    trackBtn.textContent = '🔍 تتبّع';

    if (!snap.exists()) {
      errBox.textContent = '⚠️ لم نجد طلباً بالكود "' + code + '".';
      errBox.classList.add('on');
      resBox.classList.remove('on');
      return;
    }

    const o = snap.data();
    errBox.classList.remove('on');
    $('#trTitle').textContent = 'طلب: ' + o.type;
    $('#trSub').textContent = 'صاحب الطلب: ' + o.name;
    $('#trStatus').textContent = STAGES[o.stage]?.t || '—';
    $('#trCode').textContent = o.code;
    $('#trDate').textContent = fmtDate(o.createdAt);
    $('#trType').textContent = o.type;
    $('#trPrice').textContent = o.estimate;

    $('#timeline').innerHTML = STAGES.map((s, i) => {
      const cls = i < o.stage ? 'done' : (i === o.stage ? 'active' : '');
      const icon = i < o.stage ? '✓' : (i === o.stage ? '●' : (i + 1));
      return `<div class="tl-item ${cls}"><div class="tl-dot">${icon}</div><div class="tl-body"><h5>${esc(s.t)}</h5><p>${esc(s.d)}</p></div></div>`;
    }).join('');

    resBox.classList.add('on');
    resBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (err) {
    console.error('Track error:', err);
    trackBtn.disabled = false;
    trackBtn.textContent = '🔍 تتبّع';
    errBox.textContent = '⚠️ حدث خطأ. حاول تاني.';
    errBox.classList.add('on');
    resBox.classList.remove('on');
  }
}

/* ============================================================
   WHATSAPP BUTTON
   ============================================================ */
(function initWhatsApp(){
  const num = CONFIG.whatsapp;
  const msg = encodeURIComponent('مرحباً MARSA، عايز أستفسر عن خدمة.');
  const wa = $('#waBtn');
  if (!wa) return;
  wa.href = `https://wa.me/${num}?text=${msg}`;
  setTimeout(() => wa.classList.add('show'), 3000);
})();

/* ============================================================
   BACKGROUND CANVAS
   ============================================================ */
(function(){
  const canvas = $('#bg-canvas');
  if (!canvas || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  let w, h, pts = [];
  const DENSITY = Math.min(70, Math.floor(innerWidth / 22));

  function resize(){
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    w = innerWidth;
    h = innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pts = Array.from({ length: DENSITY }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28,
      r: Math.random() * 1.6 + .4
    }));
  }
  resize();
  addEventListener('resize', resize, { passive: true });

  function draw(){
    if (document.hidden) { requestAnimationFrame(draw); return; }
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < pts.length; i++){
      const p = pts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.fillStyle = 'rgba(0,255,163,.75)';
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      for (let j = i + 1; j < pts.length; j++){
        const q = pts[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 15000){
          ctx.strokeStyle = 'rgba(0,255,163,' + (0.14 * (1 - d2 / 15000)) + ')';
          ctx.lineWidth = .5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

/* ============================================================
   INIT
   ============================================================ */
/* منع الرجوع لآخر مكان */
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
// يبدأ دايماً من فوق
window.addEventListener('load', () => {
  window.scrollTo({ top: 0, behavior: 'instant' });
});
// ولمن المستخدم يعمل Refresh
window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});

const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

document.body.classList.remove('lock');
goTo(1);
/* ============================================================
   PORTFOLIO FILTERS
   ============================================================ */
(function(){
  const filterBtns = document.querySelectorAll('.pf-btn');
  const cards = document.querySelectorAll('.pf-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const cat = card.dataset.category;
        const show = filter === 'all' || cat === filter;
        card.classList.toggle('hidden', !show);
        if (show){
          card.style.animation = 'none';
          setTimeout(() => {
            card.style.animation = 'paneIn .5s cubic-bezier(.22,1,.36,1)';
          }, 10);
        }
      });
    });
  });
})();
console.log('%c MARSA AGENCY v3.0 ', 'background:linear-gradient(135deg,#00ffa3,#7c5cff);color:#050608;font-size:20px;font-weight:900;padding:10px 22px;border-radius:8px;');
console.log('%c🛡️ لوحة التحكم: Ctrl+Shift+A أو 5 ضغطات على اللوجو', 'color:#00ffa3;font-size:13px;');