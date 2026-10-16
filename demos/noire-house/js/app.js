/* ============================================================
   NOIRÉ HOUSE — Luxury Barbershop
   Main Application Script — Enhanced Edition
   ============================================================ */

(function(){
  'use strict';

  /* ============================================================
     CONFIG
     ============================================================ */
  const CONFIG = {
    whatsapp: '201000000000',
    whatsappDisplay: '+20 100 000 0000',
    phone: '+201000000000'
  };

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  /* ============================================================
     CUSTOM CURSOR
     ============================================================ */
  (function(){
    if (window.matchMedia('(max-width: 960px)').matches) return;
    if (window.matchMedia('(hover: none)').matches) return;

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
    });

    function animateRing(){
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    const hoverEls = document.querySelectorAll('a, button, .gallery-item, input, select, textarea, .service-card, .team-card, .review-card');
    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
  })();

  /* ============================================================
     GOLD PARTICLES CANVAS
     ============================================================ */
  (function(){
    const canvas = document.createElement('canvas');
    canvas.id = 'goldParticles';
    document.body.insertBefore(canvas, document.body.firstChild);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      canvas.style.display = 'none';
      return;
    }
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];
    const COUNT = window.innerWidth < 768 ? 30 : 60;

    function resize(){
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function make(){
      particles = Array.from({ length: COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - .5) * .18,
        vy: (Math.random() - .5) * .18,
        r: Math.random() * 1.8 + .4,
        a: Math.random() * .5 + .2,
        twinkle: Math.random() * Math.PI * 2
      }));
    }

    function draw(){
      if (document.hidden) { requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.twinkle += 0.02;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        const alpha = p.a * (0.5 + Math.sin(p.twinkle) * 0.5);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,164,92,${alpha})`;
        ctx.shadowColor = 'rgba(201,164,92,.8)';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      // Connect nearby particles
      for (let i = 0; i < particles.length; i++){
        for (let j = i + 1; j < particles.length; j++){
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.hypot(dx, dy);
          if (d < 120){
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(201,164,92,${.06 * (1 - d / 120)})`;
            ctx.lineWidth = .5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }

    resize();
    make();
    draw();
    window.addEventListener('resize', () => { resize(); make(); });
  })();

  /* ============================================================
     TOAST
     ============================================================ */
  function toast(msg, type = 'ok', duration = 3500){
    const wrap = $('#toastWrap');
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    const icons = { ok: '✓', err: '✕' };
    el.innerHTML = `<div class="toast-ico">${icons[type] || 'i'}</div><div>${msg}</div>`;
    wrap.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity .3s, transform .3s';
      el.style.opacity = '0';
      el.style.transform = 'translateY(-10px)';
      setTimeout(() => el.remove(), 300);
    }, duration);
  }

  /* ============================================================
     LOADER
     ============================================================ */
  (function(){
    const bar = $('#loadBar');
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 12 + 4;
      if (p > 100) p = 100;
      bar.style.width = p + '%';
      if (p >= 100){
        clearInterval(iv);
        setTimeout(() => {
          const l = $('#loader');
          l.classList.add('done');
          setTimeout(() => l.remove(), 1000);
          initReveal();
          startTypewriter();
        }, 400);
      }
    }, 140);
  })();

  /* ============================================================
     YEAR
     ============================================================ */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================================
     NAV SCROLL
     ============================================================ */
  const nav = $('#nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  /* ============================================================
     MOBILE MENU
     ============================================================ */
  const navToggle = $('#navToggle');
  const navLinks = $('#navLinks');
  const navOverlay = $('#navOverlay');
  if (navToggle && navLinks && navOverlay){
    const closeMenu = () => {
      navLinks.classList.remove('open');
      navOverlay.classList.remove('open');
      navToggle.classList.remove('on');
      document.body.classList.remove('lock');
    };
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      navOverlay.classList.toggle('open');
      navToggle.classList.toggle('on');
      document.body.classList.toggle('lock');
    });
    navOverlay.addEventListener('click', closeMenu);
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  }

  /* ============================================================
     REVEAL
     ============================================================ */
  function initReveal(){
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting){
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -60px 0px' });
    $$('.reveal').forEach(el => io.observe(el));
  }

  /* ============================================================
     TYPEWRITER
     ============================================================ */
  let typewriterStarted = false;
  function startTypewriter(){
    if (typewriterStarted) return;
    typewriterStarted = true;
    const el = $('.hero-title');
    if (!el) return;
    const html = el.innerHTML;
    const textMatch = html.replace(/<[^>]*>/g, '');
    // keep it simple: type the plain text and restore full html at end
    if (window.innerWidth < 640) return; // skip on mobile for performance
    el.style.opacity = '0';
    setTimeout(() => {
      el.style.transition = 'opacity .6s ease';
      el.style.opacity = '1';
    }, 100);
  }

  /* ============================================================
     LANGUAGE
     ============================================================ */
  const TRANSLATIONS = {
    en: {
      'brand.sub':'Luxury Barbershop',
      'nav.services':'Services','nav.about':'About','nav.gallery':'Gallery',
      'nav.team':'Team','nav.offers':'Offers','nav.contact':'Contact','nav.book':'Book Now',
      'hero.eyebrow':'New Cairo · Since 2018',
      'hero.title':'More than a haircut.<br><em>It\'s your signature look.</em>',
      'hero.sub':'Precision in every detail, care in every strand. A refined grooming experience in a calm space — with professional tools and a personal touch from the city\'s best barbers.',
      'hero.cta1':'Book Your Visit','hero.cta2':'Explore Services',
      'hero.info1':'Customer Rating','hero.info2':'Happy Clients','hero.info3':'Years Experience',
      'hero.scroll':'Discover',
      'services.eyebrow':'Our Services','services.title':'Crafted <em>for you</em>',
      'services.desc':'Every service is delivered with professionalism and premium tools. Pick what suits you — we handle the rest.',
      'service.1.name':'Classic Haircut','service.1.desc':'A precise classic cut with the finest tools. Includes wash, styling and a final touch.','service.1.time':'30 min',
      'service.2.name':'Haircut & Beard','service.2.desc':'Full haircut + beard trimming and shaping. A complete experience for the elegant gentleman.','service.2.time':'45 min',
      'service.3.name':'Beard Sculpting','service.3.desc':'Professional beard sculpting with precision tools, plus full skin care and natural oils.','service.3.time':'20 min',
      'service.4.name':'Royal Grooming','service.4.desc':'The complete royal experience: haircut + beard + facial + massage + complimentary drink.','service.4.time':'60 min',
      'service.book':'Book ←',
      'about.eyebrow':'About Us','about.title':'More than a barbershop.<br>This is <em>your second home</em>.',
      'about.p1':'Our journey began in 2018 with a simple idea: offer a completely different grooming experience. A quiet place, refined music, professional tools — and every detail handled with care.',
      'about.p2':'Today, NOIRÉ HOUSE is the destination for men seeking elegance and precision in New Cairo. We welcome over 500 clients monthly, each receiving a personalized experience.',
      'about.badge':'Years Experience',
      'about.f1.title':'Absolute Hygiene','about.f1.sub':'Sterilized tools per client',
      'about.f2.title':'Expert Barbers','about.f2.sub':'10+ years of experience',
      'about.f3.title':'Attention to Detail','about.f3.sub':'Every cut is art',
      'about.f4.title':'Refined Atmosphere','about.f4.sub':'Free drink + massage',
      'gallery.eyebrow':'Portfolio','gallery.title':'Our work <em>speaks for itself</em>',
      'gallery.desc':'Every photo tells the story of a happy client. Click any image to view it in full size.',
      'gallery.all':'All','gallery.haircut':'Haircuts','gallery.beard':'Beards','gallery.interior':'Interior',
      'team.eyebrow':'Our Team','team.title':'The <em>expert barbers</em>',
      'team.desc':'A hand-picked team of Egypt\'s finest barbers. Each with a different specialty.',
      'team.1.role':'Senior Barber · Shop Manager','team.1.desc':'12 years of experience in classic and modern cuts. Specializes in fade cuts.',
      'team.2.role':'Beard Specialist','team.2.desc':'Specializes in beard trimming and shaping. Holds international barbering certificates.',
      'team.3.role':'Grooming Expert','team.3.desc':'Specializes in complete facial and skin care. An artistic touch in every detail.',
      'offer.badge':'Limited Offer','offer.eyebrow':'Premium Package',
      'offer.title':'Grooming <em>Experience</em>',
      'offer.desc':'A complete experience including haircut + beard + facial + massage + drink — at a special price.',
      'offer.item1':'✓ Full haircut with premium tools','offer.item2':'✓ Professional beard trimming',
      'offer.item3':'✓ Complete facial & skin care','offer.item4':'✓ Head & shoulder massage (15 min)',
      'offer.item5':'✓ Complimentary drink of your choice',
      'offer.save':'Save 200 EGP','offer.valid':'Valid until end of month','offer.cta':'Book This Offer',
      'reviews.eyebrow':'Reviews','reviews.title':'What our clients <em>say</em>',
      'reviews.desc':'We apologize — reviews are shown as illustrative samples only, until real verified reviews from our clients are available.',
      'review.1.text':'"Best grooming experience in Egypt. The place is elegant and the barber truly knows his craft."',
      'review.1.name':'Mohamed A.','review.1.label':'Sample',
      'review.2.text':'"Attention to detail is incredible. Even the drink and the massage make a huge difference."',
      'review.2.name':'Ahmed K.','review.2.label':'Sample',
      'review.3.text':'"I\'ve tried many places, but NOIRÉ HOUSE is different. Clean, professional, and fairly priced."',
      'review.3.name':'Khaled M.','review.3.label':'Sample',
      'contact.eyebrow':'Visit Us','contact.title':'We\'re <em>waiting for you</em>',
      'contact.address.title':'Address','contact.address':'Fifth Settlement, New Cairo — North 90th Street',
      'contact.hours.title':'Working Hours','contact.hours':'Sat - Thu: 10 AM - 11 PM<br>Friday: 2 PM - 12 AM',
      'contact.phone.title':'Contact Us','contact.whatsapp':'Message us on WhatsApp','contact.cta':'Book Your Visit Now',
      'footer.tagline':'More than a haircut. It\'s your signature look.',
      'footer.links':'Quick Links','footer.contact':'Contact','footer.social':'Follow Us',
      'footer.address':'Fifth Settlement, Cairo','footer.rights':'All rights reserved.','footer.made':'Designed by',
      'modal.title':'Book Your Visit','modal.sub':'Fill in your details and we\'ll confirm your appointment',
      'modal.name':'Full Name *','modal.nameErr':'Please enter your name',
      'modal.phone':'Phone Number *','modal.phoneErr':'Enter a valid mobile number',
      'modal.service':'Requested Service *','modal.selectService':'— Choose Service —','modal.serviceErr':'Please choose a service',
      'modal.barber':'Preferred Barber (Optional)','modal.anyBarber':'— Any available barber —',
      'modal.date':'Preferred Date *','modal.dateErr':'Please pick a date',
      'modal.time':'Preferred Time *','modal.selectTime':'— Choose Time —',
      'modal.morning':'Morning (10 AM - 12 PM)','modal.afternoon':'Afternoon (12 PM - 5 PM)',
      'modal.evening':'Evening (5 PM - 9 PM)','modal.night':'Night (9 PM - 11 PM)',
      'modal.timeErr':'Please choose a time','modal.notes':'Extra Notes (Optional)',
      'modal.note':'ⓘ Your booking is only confirmed after the shop replies',
      'modal.submit':'Confirm Booking via WhatsApp',
      'ba.title':'The <em>transformation</em>','ba.eyebrow':'Before & After',
      'ba.before':'Before','ba.after':'After','ba.desc':'Drag the slider to see the difference'
    }
  };

  let currentLang = 'ar';
  function toggleLang(){
    const html = document.documentElement;
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    html.setAttribute('lang', currentLang);
    html.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
    html.setAttribute('data-lang', currentLang);

    if (currentLang === 'en'){
      $$('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (!el.dataset.originalAr) el.dataset.originalAr = el.textContent;
        const t = TRANSLATIONS.en[key];
        if (t) el.textContent = t;
      });
      $$('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        if (!el.dataset.originalAr) el.dataset.originalAr = el.innerHTML;
        const t = TRANSLATIONS.en[key];
        if (t) el.innerHTML = t;
      });
      $('#langCurrent').textContent = 'AR';
      document.title = 'NOIRÉ HOUSE — Luxury Barbershop & Grooming';
    } else {
      $$('[data-i18n]').forEach(el => {
        if (el.dataset.originalAr) el.textContent = el.dataset.originalAr;
      });
      $$('[data-i18n-html]').forEach(el => {
        if (el.dataset.originalAr) el.innerHTML = el.dataset.originalAr;
      });
      $('#langCurrent').textContent = 'EN';
      document.title = 'NOIRÉ HOUSE — صالون حلاقة فاخر';
    }
  }
  $('#langToggle')?.addEventListener('click', toggleLang);

  /* ============================================================
     3D TILT ON SERVICE CARDS
     ============================================================ */
  (function(){
    if (window.matchMedia('(max-width: 960px)').matches) return;
    const cards = $$('.service-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (py - .5) * -12;
        const ry = (px - .5) * 12;
        card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  })();

  /* ============================================================
     BOOKING MODAL
     ============================================================ */
  const bookingModal = $('#bookingModal');
  const bookingForm = $('#bookingForm');

  function openBooking(serviceName){
    if (!bookingModal) return;
    bookingModal.classList.add('on');
    document.body.classList.add('lock');
    if (serviceName){
      const select = $('#bkService');
      if (select){
        const option = Array.from(select.options).find(o => o.value === serviceName);
        if (option) select.value = serviceName;
      }
    }
  }
  function closeBooking(){
    if (!bookingModal) return;
    bookingModal.classList.remove('on');
    document.body.classList.remove('lock');
  }
  $('#modalClose')?.addEventListener('click', closeBooking);
  bookingModal?.addEventListener('click', e => { if (e.target === bookingModal) closeBooking(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape'){
      if (bookingModal?.classList.contains('on')) closeBooking();
      if ($('#lightbox')?.classList.contains('on')) closeLightbox();
    }
  });

  ['#navBookBtn','#heroBookBtn','#offerBookBtn','#contactBookBtn'].forEach(sel => {
    $(sel)?.addEventListener('click', () => openBooking());
  });

  $$('.service-btn').forEach(btn => {
    btn.addEventListener('click', () => openBooking(btn.dataset.service));
  });

  /* ============================================================
     VALIDATION + WHATSAPP
     ============================================================ */
  const validators = {
    name: v => v.trim().length >= 3,
    phone: v => /^01[0125][0-9]{8}$/.test(v.trim().replace(/[\s\-()]/g, '')),
    service: v => v !== '',
    date: v => v !== '',
    time: v => v !== ''
  };

  function validateField(input){
    const name = input.name;
    if (!validators[name]) return true;
    const field = input.closest('.field');
    const valid = validators[name](input.value);
    field.classList.toggle('err', !valid);
    return valid;
  }

  bookingForm?.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('blur', () => { if (el.value) validateField(el); });
    el.addEventListener('input', () => {
      const field = el.closest('.field');
      if (field?.classList.contains('err') && el.value) validateField(el);
    });
  });

  function formatDate(dateStr, lang){
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = {
      ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
      en: ['January','February','March','April','May','June','July','August','September','October','November','December']
    };
    return lang === 'ar'
      ? `${d.getDate()} ${months.ar[d.getMonth()]} ${d.getFullYear()}`
      : `${months.en[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  bookingForm?.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(bookingForm).entries());
    let allValid = true;
    ['name','phone','service','date','time'].forEach(key => {
      const input = bookingForm.querySelector(`[name="${key}"]`);
      if (input && !validateField(input)) allValid = false;
    });
    if (!allValid){
      toast(currentLang === 'ar' ? '⚠️ راجع الحقول المطلوبة' : '⚠️ Please check required fields', 'err');
      return;
    }

    const isAr = currentLang === 'ar';
    const lines = isAr
      ? [
          'السلام عليكم ✂️','','أريد حجز موعد في NOIRÉ HOUSE:','━━━━━━━━━━━━━━',
          `👤 الاسم: ${data.name}`,`📞 الهاتف: ${data.phone}`,
          `💈 الخدمة: ${data.service}`,
          data.barber ? `👨‍🦱 الحلاق المفضل: ${data.barber}` : null,
          `📅 التاريخ: ${formatDate(data.date, 'ar')}`,
          `🕐 الوقت: ${data.time}`,
          data.notes ? `📝 ملاحظات: ${data.notes}` : null,
          '━━━━━━━━━━━━━━','','من فضلكم أكدوا الموعد 🙏'
        ].filter(Boolean)
      : [
          'Hello ✂️','','I\'d like to book an appointment at NOIRÉ HOUSE:','━━━━━━━━━━━━━━',
          `👤 Name: ${data.name}`,`📞 Phone: ${data.phone}`,
          `💈 Service: ${data.service}`,
          data.barber ? `👨‍🦱 Preferred Barber: ${data.barber}` : null,
          `📅 Date: ${formatDate(data.date, 'en')}`,
          `🕐 Time: ${data.time}`,
          data.notes ? `📝 Notes: ${data.notes}` : null,
          '━━━━━━━━━━━━━━','','Please confirm my appointment 🙏'
        ].filter(Boolean);

    const waURL = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(waURL, '_blank');
    toast(isAr ? '✅ جاري تحويلك لواتساب...' : '✅ Redirecting to WhatsApp...', 'ok', 3000);
    closeBooking();
    bookingForm.reset();
    bookingForm.querySelectorAll('.field').forEach(f => f.classList.remove('err'));
  });

  /* ============================================================
     GALLERY FILTERS
     ============================================================ */
  const filters = $$('.gallery-filter');
  const galleryItems = $$('.gallery-item');
  filters.forEach(f => {
    f.addEventListener('click', () => {
      filters.forEach(x => x.classList.remove('active'));
      f.classList.add('active');
      const cat = f.dataset.filter;
      galleryItems.forEach(item => {
        const match = cat === 'all' || item.dataset.category === cat;
        item.classList.toggle('hidden', !match);
      });
    });
  });

  /* ============================================================
     LIGHTBOX
     ============================================================ */
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightboxImg');
  let currentImgIndex = 0;

  function getVisibleItems(){
    return Array.from(galleryItems).filter(i => !i.classList.contains('hidden'));
  }
  function openLightbox(index){
    const items = getVisibleItems();
    if (!items[index]) return;
    lightboxImg.src = items[index].dataset.src || items[index].querySelector('img').src;
    currentImgIndex = index;
    lightbox.classList.add('on');
    document.body.classList.add('lock');
  }
  function closeLightbox(){
    lightbox.classList.remove('on');
    document.body.classList.remove('lock');
  }
  function nextImage(){
    const items = getVisibleItems();
    currentImgIndex = (currentImgIndex + 1) % items.length;
    openLightbox(currentImgIndex);
  }
  function prevImage(){
    const items = getVisibleItems();
    currentImgIndex = (currentImgIndex - 1 + items.length) % items.length;
    openLightbox(currentImgIndex);
  }
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const items = getVisibleItems();
      const idx = items.indexOf(item);
      if (idx > -1) openLightbox(idx);
    });
  });
  $('#lightboxClose')?.addEventListener('click', closeLightbox);
  $('#lightboxNext')?.addEventListener('click', nextImage);
  $('#lightboxPrev')?.addEventListener('click', prevImage);
  lightbox?.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (!lightbox?.classList.contains('on')) return;
    if (e.key === 'ArrowRight') currentLang === 'ar' ? prevImage() : nextImage();
    if (e.key === 'ArrowLeft') currentLang === 'ar' ? nextImage() : prevImage();
  });

  /* ============================================================
     BEFORE/AFTER SLIDER
     ============================================================ */
  (function(){
    const container = $('#baContainer');
    if (!container) return;
    const handle = $('#baHandle');
    const after = $('#baAfter');
    const before = $('#baBefore');
    let dragging = false;

    function setPos(clientX){
      const rect = container.getBoundingClientRect();
      let x = (clientX - rect.left) / rect.width;
      x = Math.max(0.02, Math.min(0.98, x));
      const pct = x * 100;
      handle.style.left = pct + '%';
      after.style.clipPath = `inset(0 0 0 ${pct}%)`;
      before.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    }

    container.addEventListener('mousedown', e => {
      dragging = true;
      setPos(e.clientX);
    });
    document.addEventListener('mousemove', e => {
      if (dragging) setPos(e.clientX);
    });
    document.addEventListener('mouseup', () => { dragging = false; });

    container.addEventListener('touchstart', e => {
      dragging = true;
      setPos(e.touches[0].clientX);
    }, { passive: true });
    document.addEventListener('touchmove', e => {
      if (dragging) setPos(e.touches[0].clientX);
    }, { passive: true });
    document.addEventListener('touchend', () => { dragging = false; });
  })();

  /* ============================================================
     WHATSAPP FLOAT
     ============================================================ */
  const waFloat = $('#waFloat');
  if (waFloat){
    setTimeout(() => waFloat.classList.add('show'), 3000);
    waFloat.addEventListener('click', () => {
      const msg = encodeURIComponent(
        currentLang === 'ar'
          ? 'السلام عليكم 👋 عايز أستفسر عن خدمات NOIRÉ HOUSE'
          : 'Hello 👋 I\'d like to inquire about NOIRÉ HOUSE services'
      );
      window.open(`https://wa.me/${CONFIG.whatsapp}?text=${msg}`, '_blank');
    });
  }

  /* ============================================================
     SMOOTH SCROLL
     ============================================================ */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e){
      const id = this.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ============================================================
     DATE MIN
     ============================================================ */
  const dateInput = $('#bkDate');
  if (dateInput){
    dateInput.min = new Date().toISOString().split('T')[0];
  }

  /* ============================================================
     CONSOLE
     ============================================================ */
  console.log('%c NOIRÉ HOUSE ', 'background:linear-gradient(135deg,#C9A45C,#E5C889);color:#0B0B0D;font-size:18px;font-weight:700;padding:8px 20px;border-radius:6px;letter-spacing:3px;');
  console.log('%cLuxury Barbershop · Demo Site', 'color:#C9A45C;font-size:12px;letter-spacing:2px;');
  console.log('%cDesigned by MARSA Agency', 'color:#A8A29A;font-size:11px;font-style:italic;');

})();