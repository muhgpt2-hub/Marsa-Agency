/* ============================================================
   MARSA AGENCY v3.0 — Admin Panel
   ============================================================ */

import {
  $, esc, fmtDate, toast,
  CONFIG, STAGES,
  auth, db,
  collection, doc, onSnapshot, query, orderBy,
  updateDoc, deleteDoc, writeBatch,
  signInWithEmailAndPassword, signOut, onAuthStateChanged
} from './firebase-config.js';

/* ===== TRIGGERS ===== */
let logoClicks = 0, logoTimer = null;

$('#brandLogo')?.addEventListener('click', () => {
  logoClicks++;
  clearTimeout(logoTimer);
  logoTimer = setTimeout(() => logoClicks = 0, 1200);
  if (logoClicks >= 5) { logoClicks = 0; openLogin(); }
});

document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
    e.preventDefault();
    openLogin();
  }
  if (e.key === 'Escape') {
    if (loginModal.classList.contains('on')) closeLogin();
    if ($('#odModal').classList.contains('on')) $('#odModal').classList.remove('on');
    if (adminPanel.classList.contains('on') && confirm('هل تريد الخروج؟')) closeAdmin();
  }
});

/* ===== DOM REFS ===== */
const loginModal = $('#loginModal');
const adminPanel = $('#adminPanel');
let unsubOrders = null;
let cachedOrders = [];

/* ===== LOGIN ===== */
function openLogin(){
  if (auth.currentUser) { openAdmin(); return; }
  loginModal.classList.add('on');
  document.body.classList.add('lock');
  setTimeout(() => $('#loginEmail').focus(), 200);
}

function closeLogin(){
  loginModal.classList.remove('on');
  document.body.classList.remove('lock');
  $('#loginErr').classList.remove('on');
  $('#loginEmail').value = '';
  $('#loginPass').value = '';
}

$('#loginClose')?.addEventListener('click', closeLogin);
loginModal?.addEventListener('click', e => {
  if (e.target === loginModal) closeLogin();
});

$('#loginBtn')?.addEventListener('click', doLogin);
$('#loginPass')?.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
$('#loginEmail')?.addEventListener('keydown', e => { if (e.key === 'Enter') $('#loginPass').focus(); });

async function doLogin(){
  const email = $('#loginEmail').value.trim();
  const pass = $('#loginPass').value;
  const btn = $('#loginBtn'), err = $('#loginErr');
  err.classList.remove('on');

  if (!email || !pass) {
    err.textContent = '⚠️ أدخل البريد وكلمة المرور';
    err.classList.add('on');
    return;
  }

  btn.disabled = true;
  btn.textContent = '⏳ جارٍ الدخول...';

  try {
    await signInWithEmailAndPassword(auth, email, pass);
    closeLogin();
    openAdmin();
  } catch (e) {
    console.error('Login error:', e);
    err.textContent = '⚠️ بيانات الدخول غير صحيحة.';
    err.classList.add('on');
  } finally {
    btn.disabled = false;
    btn.textContent = 'دخول';
  }
}

/* ===== ADMIN PANEL ===== */
function openAdmin(){
  adminPanel.classList.add('on');
  document.body.classList.add('lock');
  $('#admUser').textContent = '👤 ' + (auth.currentUser?.email || '—');
  attachOrdersListener();
}

function closeAdmin(){
  adminPanel.classList.remove('on');
  document.body.classList.remove('lock');
  if (unsubOrders) { unsubOrders(); unsubOrders = null; }
}

$('#admClose')?.addEventListener('click', async () => {
  if (!confirm('هل تريد تسجيل الخروج؟')) return;
  try { await signOut(auth); } catch(e){}
  closeAdmin();
});

/* ===== AUTH STATE ===== */
onAuthStateChanged(auth, user => {
  if (user && user.email === CONFIG.adminEmail) {
    console.log('✅ Admin logged in:', user.email);
  } else if (user && user.email !== CONFIG.adminEmail) {
    console.warn('⚠️ Non-admin login:', user.email);
    signOut(auth);
    alert('❌ هذا الحساب ليس مصرحاً له بالدخول.');
  }
});

/* ===== ORDERS LISTENER ===== */
function attachOrdersListener(){
  if (unsubOrders) return;
  $('#admLoading').style.display = 'block';
  $('#admEmpty').style.display = 'none';
  $('#admTbody').innerHTML = '';

  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  unsubOrders = onSnapshot(q, snap => {
    cachedOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    $('#admLoading').style.display = 'none';
    renderAdmin();
  }, err => {
    console.error('Orders listener error:', err);
    $('#admLoading').style.display = 'none';
    alert('⚠️ فشل تحميل الطلبات.');
  });
}

/* ===== RENDER ADMIN ===== */
function renderAdmin(){
  const orders = cachedOrders;
  const tbody = $('#admTbody'), empty = $('#admEmpty');

  const total = orders.length;
  const news = orders.filter(o => o.stage === 0).length;
  const inProg = orders.filter(o => o.stage > 0 && o.stage < 4).length;
  const done = orders.filter(o => o.stage === 4).length;

  $('#admStats').innerHTML = `
    <div class="adm-stat"><small>إجمالي</small><b>${total}</b></div>
    <div class="adm-stat"><small>جديدة</small><b>${news}</b></div>
    <div class="adm-stat"><small>قيد التنفيذ</small><b>${inProg}</b></div>
    <div class="adm-stat"><small>مكتملة</small><b>${done}</b></div>
  `;

  if (!orders.length) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><span class="code">${esc(o.code)}</span></td>
      <td><b>${esc(o.name)}</b></td>
      <td class="hide-m">${esc(o.phone)}</td>
      <td class="hide-m">${esc(o.email)}</td>
      <td>${esc(o.type)}</td>
      <td class="hide-m num">${esc(o.estimate)}</td>
      <td>
        <select onchange="window.__updateStage('${esc(o.id)}', this.value)">
          ${STAGES.map((s, si) => `<option value="${si}" ${si === o.stage ? 'selected' : ''}>${esc(s.t)}</option>`).join('')}
        </select>
      </td>
      <td class="hide-m" style="font-size:12px;color:var(--text-3);white-space:nowrap;font-family:var(--mono)">${fmtDate(o.createdAt)}</td>
      <td>
        <div style="display:flex;gap:6px;justify-content:flex-end">
          <button class="view-btn" onclick="window.__viewOrder('${esc(o.code)}')">👁️ عرض</button>
          <button class="adm-btn danger" style="padding:7px 11px;font-size:11px" onclick="window.__deleteOrder('${esc(o.id)}','${esc(o.code)}')">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

/* ===== VIEW ORDER DETAILS ===== */
window.__viewOrder = (code) => {
  const o = cachedOrders.find(x => x.code === code);
  if (!o) return;

  const stageName = STAGES[o.stage]?.t || '—';
  const phoneClean = String(o.phone || '').replace(/[^\d]/g, '');
  const waPhone = phoneClean.startsWith('0') ? '20' + phoneClean.slice(1) : phoneClean;
  const waMsg = encodeURIComponent(
    `مرحباً ${o.name} 👋\n\nبخصوص طلبك من MARSA Agency:\n🔑 كود التتبع: ${o.code}\n\nنتواصل معك بخصوص: ${o.type}`
  );

  $('#odCode').textContent = o.code;
  $('#odBody').innerHTML = `
    <div class="od-row"><div class="lbl">الحالة الحالية</div><div class="val" style="color:var(--accent)">${esc(stageName)}</div></div>
    <div class="od-row"><div class="lbl">👤 اسم العميل</div><div class="val">${esc(o.name)}</div></div>
    <div class="od-2col">
      <div class="od-row" style="margin:0"><div class="lbl">📞 الهاتف</div><div class="val"><a href="tel:${esc(o.phone)}" dir="ltr">${esc(o.phone)}</a></div></div>
      <div class="od-row" style="margin:0"><div class="lbl">✉️ البريد</div><div class="val"><a href="mailto:${esc(o.email)}" dir="ltr" style="font-size:13px">${esc(o.email)}</a></div></div>
    </div>
    <div class="od-2col">
      <div class="od-row" style="margin:0"><div class="lbl">🏷️ نوع المشروع</div><div class="val">${esc(o.type)}</div></div>
      <div class="od-row" style="margin:0"><div class="lbl">💰 الميزانية</div><div class="val">${esc(o.budget || 'غير محدد')}</div></div>
    </div>
    <div class="od-row"><div class="lbl">💵 التكلفة التقديرية</div><div class="val" style="color:var(--accent);font-size:17px;font-family:var(--mono)">${esc(o.estimate || 'غير محدد')}</div></div>
    <div class="od-row"><div class="lbl">📝 تفاصيل المشروع</div><div class="od-details-box"><p>${esc(o.details)}</p></div></div>
    <div class="od-row"><div class="lbl">📅 تاريخ الطلب</div><div class="val" style="font-size:13.5px;color:var(--text-2);font-family:var(--mono)">${fmtDate(o.createdAt)}</div></div>
  `;

  $('#odWa').href = `https://wa.me/${waPhone}?text=${waMsg}`;
  $('#odMail').href = `mailto:${o.email}?subject=${encodeURIComponent('MARSA Agency — بخصوص طلبك ' + o.code)}&body=${encodeURIComponent('مرحباً ' + o.name + '،\n\nبخصوص طلبك ' + o.code + ' من MARSA Agency.\n\n')}`;
  $('#odTel').href = `tel:${o.phone}`;

  $('#odCopyBtn').textContent = '📋 نسخ';
  $('#odCopyBtn').classList.remove('done');
  $('#odModal').classList.add('on');
};

/* ===== COPY CODE ===== */
$('#odCopyBtn')?.addEventListener('click', function(){
  const code = $('#odCode').textContent;
  navigator.clipboard.writeText(code).then(() => {
    this.textContent = '✅ تم';
    this.classList.add('done');
    setTimeout(() => {
      this.textContent = '📋 نسخ';
      this.classList.remove('done');
    }, 2000);
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = code;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch(e){}
    document.body.removeChild(ta);
    this.textContent = '✅ تم';
    this.classList.add('done');
    setTimeout(() => {
      this.textContent = '📋 نسخ';
      this.classList.remove('done');
    }, 2000);
  });
});

/* ===== CLOSE OD MODAL ===== */
$('#odModalClose')?.addEventListener('click', () => $('#odModal').classList.remove('on'));
$('#odModal')?.addEventListener('click', e => {
  if (e.target === $('#odModal')) $('#odModal').classList.remove('on');
});

/* ===== UPDATE STAGE ===== */
window.__updateStage = async (id, val) => {
  try {
    await updateDoc(doc(db, 'orders', id), { stage: +val });
  } catch (e) {
    console.error('Update error:', e);
    alert('❌ فشل تحديث الحالة.');
  }
};

/* ===== DELETE ORDER ===== */
window.__deleteOrder = async (id, code) => {
  if (!confirm(`حذف الطلب ${code} نهائياً؟`)) return;
  try {
    await deleteDoc(doc(db, 'orders', id));
  } catch (e) {
    console.error('Delete error:', e);
    alert('❌ فشل الحذف.');
  }
};

/* ===== REFRESH ===== */
$('#admRefresh')?.addEventListener('click', () => { renderAdmin(); });

/* ===== CLEAR ALL ===== */
$('#admClear')?.addEventListener('click', async () => {
  if (!cachedOrders.length) return alert('لا توجد طلبات');
  if (!confirm(`⚠️ سيتم حذف ${cachedOrders.length} طلب نهائياً.`)) return;
  if (!confirm('تأكيد أخير؟')) return;
  try {
    const batch = writeBatch(db);
    cachedOrders.forEach(o => batch.delete(doc(db, 'orders', o.id)));
    await batch.commit();
  } catch (e) {
    console.error('Batch error:', e);
    alert('❌ فشل الحذف.');
  }
});

/* ===== EXPORT CSV ===== */
$('#admExport')?.addEventListener('click', () => {
  if (!cachedOrders.length) return alert('لا توجد بيانات');
  const headers = ['الكود', 'الاسم', 'الهاتف', 'البريد', 'النوع', 'الميزانية', 'التقدير', 'الحالة', 'التاريخ', 'التفاصيل'];
  const rows = cachedOrders.map(o => [
    o.code, o.name, o.phone, o.email, o.type, o.budget, o.estimate,
    STAGES[o.stage]?.t || '', fmtDate(o.createdAt),
    (o.details || '').replace(/[\n\r,]/g, ' ')
  ]);
  const csv = '\uFEFF' + [headers, ...rows]
    .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `marsa-orders-${Date.now()}.csv`;
  a.click();
});