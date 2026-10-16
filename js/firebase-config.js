/* ============================================================
   MARSA AGENCY v3.0 — Firebase Configuration & Shared Utilities
   ============================================================ */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
  getFirestore, collection, doc, setDoc, getDoc, onSnapshot,
  query, orderBy, updateDoc, deleteDoc, writeBatch
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

/* ===== CONFIG ===== */
export const CONFIG = {
  whatsapp:   '201554910655',
  email:      'jaferahmed444@gmail.com',
  adminEmail: 'jaferahmed444@gmail.com',
  brand:      'MARSA'
};

/* ===== FIREBASE ===== */
const firebaseConfig = {
  apiKey: "AIzaSyAnIAIVcEgT6U4IdOBFg7iKH_HntiJina0",
  authDomain: "marsa-agency.firebaseapp.com",
  projectId: "marsa-agency",
  storageBucket: "marsa-agency.firebasestorage.app",
  messagingSenderId: "649704336246",
  appId: "1:649704336246:web:9b2fe0b9bd9c78c4d7a857",
  measurementId: "G-CL9Q1LCD06"
};

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

/* ===== STAGES ===== */
export const STAGES = [
  { t:'تم استلام الطلب',        d:'وصلنا طلبك بنجاح وهو الآن في قائمة الانتظار.' },
  { t:'قيد المراجعة والتحليل',  d:'فريقنا يراجع تفاصيل مشروعك ويحدد المتطلبات.' },
  { t:'قيد التصميم والتطوير',   d:'جارٍ العمل على تصميم وبرمجة موقعك.' },
  { t:'مراجعة العميل',          d:'الموقع جاهز للمراجعة. في انتظار ملاحظاتك.' },
  { t:'تم التسليم',             d:'تم تسليم المشروع بنجاح. نتمنى لك التوفيق! 🎉' }
];

/* ===== UTILITIES ===== */
export const $  = s => document.querySelector(s);
export const $$ = s => document.querySelectorAll(s);

export const esc = s => String(s == null ? '' : s)
  .replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function fmtDate(iso){
  const d = iso?.toDate ? iso.toDate() : (iso ? new Date(iso) : new Date());
  const p = n => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth()+1)}/${d.getFullYear()} - ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function genCode(){
  const y = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) rand += chars[Math.floor(Math.random() * chars.length)];
  return `MRS-${y}-${rand}`;
}

export function toast(msg, type='ok', duration=3500){
  const wrap = $('#toastWrap');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  const icons = { ok:'✓', err:'✗', info:'i' };
  el.innerHTML = `<div class="toast-ico">${icons[type]||'i'}</div><div>${msg}</div>`;
  wrap.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .3s, transform .3s';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-10px)';
    setTimeout(() => el.remove(), 300);
  }, duration);
}

export function spawnConfetti(count=60){
  const colors=['#00ffa3','#7c5cff','#5ea8ff','#ff5c8a','#fbbf24'];
  for(let i=0;i<count;i++){
    const el=document.createElement('div');
    el.className='confetti';
    el.style.left=Math.random()*innerWidth+'px';
    el.style.top='-20px';
    el.style.background=colors[Math.floor(Math.random()*colors.length)];
    document.body.appendChild(el);
    const dur=1800+Math.random()*1500,sx=parseFloat(el.style.left),st=performance.now();
    (function fall(now){
      const k=Math.min((now-st)/dur,1);
      if(k>=1){el.remove();return;}
      el.style.top=(-20+k*(innerHeight+100))+'px';
      el.style.left=(sx+Math.sin(k*Math.PI*2)*40)+'px';
      el.style.transform=`rotate(${k*720}deg)`;
      el.style.opacity=1-k*.6;
      requestAnimationFrame(fall);
    })(st);
  }
}

/* ===== FIREBASE EXPORTS (للـ admin) ===== */
export {
  collection, doc, setDoc, getDoc, onSnapshot,
  query, orderBy, updateDoc, deleteDoc, writeBatch,
  signInWithEmailAndPassword, signOut, onAuthStateChanged
};