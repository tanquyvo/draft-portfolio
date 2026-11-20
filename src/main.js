import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { mediaManifest } from './media-manifest.js';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
let lenis = null;

// Smooth scrolling, synchronized with ScrollTrigger.
if (!prefersReducedMotion) {
  lenis = new Lenis({
    duration: 1.08,
    smoothWheel: true,
    wheelMultiplier: 0.92,
    touchMultiplier: 1.08,
    anchors: false
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// Navigation + mobile overlay.
const header = document.querySelector('#site-header');
const menuToggle = document.querySelector('#menu-toggle');
const menuClose = document.querySelector('#menu-close');
const mobileMenu = document.querySelector('#mobile-menu');

function closeMobileMenu() {
  mobileMenu?.classList.remove('is-open');
  document.body.classList.remove('menu-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  mobileMenu?.setAttribute('aria-hidden', 'true');
}

menuToggle?.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('is-open');
  document.body.classList.toggle('menu-open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  mobileMenu.setAttribute('aria-hidden', String(!isOpen));
});
menuClose?.addEventListener('click', closeMobileMenu);

function scrollToTarget(target) {
  if (!target) return;
  closeMobileMenu();
  const offset = target.id === 'home' ? 0 : -92;
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.12, lock: false });
  } else {
    target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  }
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const selector = link.getAttribute('href');
    const target = selector && document.querySelector(selector);
    if (!target) return;
    event.preventDefault();
    history.replaceState(null, '', selector);
    scrollToTarget(target);
  });
});

// Global progress and active section state.
const progressFill = document.querySelector('#scroll-progress-fill');
const navLinks = [...document.querySelectorAll('.desktop-nav .nav-link')];
const sections = ['home', 'about', 'education', 'toolkit', 'experience', 'works', 'contact']
  .map((id) => document.getElementById(id)).filter(Boolean);

function updateProgress() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  if (progressFill) progressFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  header?.classList.toggle('is-scrolled', window.scrollY > 24);
}
window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        const active = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('is-active', active);
      });
    });
  }, { rootMargin: '-30% 0px -58% 0px', threshold: 0 });
  sections.forEach((section) => sectionObserver.observe(section));
}

// Reusable in-page carousels: journey photos and project preview slides.
document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('.carousel-track');
  const slides = [...carousel.querySelectorAll('.carousel-slide')];
  const prev = carousel.querySelector('.carousel-prev');
  const next = carousel.querySelector('.carousel-next');
  const count = carousel.querySelector('.carousel-count');
  const dotsWrap = carousel.querySelector('.carousel-dots');
  if (!track || slides.length === 0) return;

  let index = 0;
  const dots = slides.map((_, dotIndex) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to slide ${dotIndex + 1}`);
    dot.addEventListener('click', () => goTo(dotIndex));
    dotsWrap?.append(dot);
    return dot;
  });

  function goTo(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    track.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
    if (count) count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
      dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
    });
    if (prev) prev.disabled = slides.length < 2;
    if (next) next.disabled = slides.length < 2;
  }

  prev?.addEventListener('click', () => goTo(index - 1));
  next?.addEventListener('click', () => goTo(index + 1));
  goTo(0);

  let touchStartX = 0;
  const viewport = carousel.querySelector('.carousel-viewport');
  viewport?.addEventListener('touchstart', (event) => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
  viewport?.addEventListener('touchend', (event) => {
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 45) goTo(index + (delta < 0 ? 1 : -1));
  }, { passive: true });
});

// Full-screen carousel modal for the original proposal/outcome slide decks.
const deckMap = {
  'outcome-cmo-2025': { title: 'CMO Think And Action 2025', kicker: 'EVENT OUTCOME / PERSONAL DESIGN', slides: mediaManifest.outcomes['cmo-2025'] },
  'outcome-kpsnd-2025': { title: 'KHAM PHA SU NANG DONG 2025', kicker: 'EVENT OUTCOME / PERSONAL DESIGN', slides: mediaManifest.outcomes['kpsnd-2025'] },
  'outcome-cmo-2026': { title: 'CMO Think And Action 2026', kicker: 'EVENT OUTCOME / PERSONAL DESIGN', slides: mediaManifest.outcomes['cmo-2026'] },
  'project-koko': { title: 'Koko Krunch Strawberry', kicker: 'HEADING FOR THE FUTURE / BUSINESS MANAGEMENT', slides: mediaManifest.projects['koko-krunch'] },
  'project-scentie': { title: 'SCENTIE — Find your mood', kicker: 'E-COMMERCE PROJECT / PROPOSAL DECK', slides: mediaManifest.projects['scentie-ecommerce'] },
  'project-babe': { title: 'Digital Creatory 2026 — BABÉ', kicker: 'IMC CAMPAIGN / PROPOSAL DECK', slides: mediaManifest.projects['babe-digital-creatory'] },
  'project-huda': { title: 'Huda Ice Twist', kicker: 'HEADING FOR THE FUTURE / CAMPAIGN PROPOSAL', slides: mediaManifest.projects['huda-ice-twist'] }
};

const deckModal = document.querySelector('#deck-modal');
const deckModalTitle = document.querySelector('#deck-modal-title');
const deckModalKicker = document.querySelector('#deck-modal-kicker');
const deckModalImage = document.querySelector('#deck-modal-image');
const deckModalCount = document.querySelector('#deck-modal-count');
const deckModalCaption = document.querySelector('#deck-modal-caption');
const deckPrev = document.querySelector('.deck-prev');
const deckNext = document.querySelector('.deck-next');
let activeDeck = null;
let activeDeckIndex = 0;

function preloadDeckSlide(index) {
  if (!activeDeck?.slides?.length) return;
  const slide = activeDeck.slides[(index + activeDeck.slides.length) % activeDeck.slides.length];
  const preloader = new Image();
  preloader.src = slide.src;
}

function renderDeckSlide(index) {
  if (!activeDeck?.slides?.length) return;
  const slides = activeDeck.slides;
  activeDeckIndex = (index + slides.length) % slides.length;
  const slide = slides[activeDeckIndex];
  deckModalImage.classList.add('is-loading');
  deckModalImage.alt = `${activeDeck.title} — slide ${activeDeckIndex + 1}`;
  deckModalImage.onload = () => deckModalImage.classList.remove('is-loading');
  deckModalImage.onerror = () => deckModalImage.classList.remove('is-loading');
  deckModalImage.src = slide.src;
  deckModalCount.textContent = `${String(activeDeckIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  deckModalCaption.textContent = slide.label || `Slide ${activeDeckIndex + 1}`;
  deckPrev.disabled = slides.length < 2;
  deckNext.disabled = slides.length < 2;
  preloadDeckSlide(activeDeckIndex + 1);
}

let deckClosing = false;
function openDeck(deckId) {
  const deck = deckMap[deckId];
  if (!deck?.slides?.length || !deckModal) return;
  activeDeck = deck;
  activeDeckIndex = 0;
  deckModalTitle.textContent = deck.title;
  deckModalKicker.textContent = deck.kicker;
  renderDeckSlide(0);
  if (!deckModal.open) deckModal.showModal();
  deckClosing = false;
  document.body.classList.add('deck-open');
  const shell = deckModal.querySelector('.deck-modal-shell');
  if (shell && !prefersReducedMotion) {
    gsap.fromTo(shell,
      { autoAlpha: 0, y: 28, scale: .94, rotateX: -2, transformPerspective: 1200 },
      { autoAlpha: 1, y: 0, scale: 1, rotateX: 0, duration: .58, ease: 'back.out(1.25)', clearProps: 'transform' }
    );
  }
}

function closeDeck() {
  if (!deckModal?.open || deckClosing) return;
  const shell = deckModal.querySelector('.deck-modal-shell');
  if (!prefersReducedMotion && shell) {
    deckClosing = true;
    gsap.to(shell, {
      autoAlpha: 0, y: 16, scale: .97, duration: .2, ease: 'power2.in',
      onComplete: () => {
        deckModal.close();
        deckClosing = false;
      }
    });
  } else {
    deckModal.close();
  }
  document.body.classList.remove('deck-open');
}

document.querySelectorAll('[data-open-deck]').forEach((button) => {
  button.addEventListener('click', () => openDeck(button.dataset.openDeck));
});
document.querySelectorAll('[data-close-deck]').forEach((button) => button.addEventListener('click', closeDeck));
deckPrev?.addEventListener('click', () => renderDeckSlide(activeDeckIndex - 1));
deckNext?.addEventListener('click', () => renderDeckSlide(activeDeckIndex + 1));
deckModal?.addEventListener('click', (event) => {
  if (event.target === deckModal) closeDeck();
});
deckModal?.addEventListener('close', () => { document.body.classList.remove('deck-open'); deckClosing = false; });
document.addEventListener('keydown', (event) => {
  if (!deckModal?.open) return;
  if (event.key === 'ArrowLeft') renderDeckSlide(activeDeckIndex - 1);
  if (event.key === 'ArrowRight') renderDeckSlide(activeDeckIndex + 1);
});
let deckTouchStartX = 0;
const deckViewer = document.querySelector('.deck-viewer');
deckViewer?.addEventListener('touchstart', (event) => { deckTouchStartX = event.changedTouches[0].clientX; }, { passive: true });
deckViewer?.addEventListener('touchend', (event) => {
  const delta = event.changedTouches[0].clientX - deckTouchStartX;
  if (Math.abs(delta) > 45) renderDeckSlide(activeDeckIndex + (delta < 0 ? 1 : -1));
}, { passive: true });

// ScrollTrigger storytelling: entrance, parallax and staggered narrative moments.
if (!prefersReducedMotion) {
  document.documentElement.classList.add('js-ready');

  // Cover: continuous CSS orbit + gentle entrance and scroll-linked exit.
  gsap.from('.cover-kicker', { y: 14, autoAlpha: 0, duration: .65, delay: .12, ease: 'power2.out' });
  gsap.from('.cover-title', { y: 42, autoAlpha: 0, duration: 1, delay: .18, ease: 'power3.out' });
  gsap.from('.cover-welcome, .scroll-invite', { y: 18, autoAlpha: 0, duration: .72, stagger: .12, delay: .48, ease: 'power2.out' });
  gsap.from('.cover-side-sticker, .cover-spark', { scale: .45, rotation: -18, autoAlpha: 0, duration: .8, stagger: .1, delay: .62, ease: 'back.out(1.7)' });
  const cover = document.querySelector('.cover-section');
  const coverContent = document.querySelector('.cover-content');
  if (cover && coverContent) {
    gsap.to(coverContent, {
      yPercent: -10,
      scale: .96,
      autoAlpha: .55,
      ease: 'none',
      scrollTrigger: { trigger: cover, start: 'top top', end: 'bottom top', scrub: .7 }
    });
    gsap.to('.cover-spark-one', {
      y: -50, rotation: 55, ease: 'none',
      scrollTrigger: { trigger: cover, start: 'top top', end: 'bottom top', scrub: .8 }
    });
  }

  // About: the portrait gently lifts into view; body copy appears as a readable sequence.
  gsap.from('.about-heading-wrap .about-title', {
    y: 65, rotate: -2, autoAlpha: 0, duration: 1,
    scrollTrigger: { trigger: '.about-heading-wrap', start: 'top 78%', once: true }
  });
  gsap.from('.about-greeting', {
    y: 24, rotate: 12, autoAlpha: 0, duration: .7, ease: 'back.out(1.5)',
    scrollTrigger: { trigger: '.about-heading-wrap', start: 'top 75%', once: true }
  });
  gsap.from('.portrait-frame', {
    y: 80, rotate: -4, scale: .92, autoAlpha: 0, duration: 1.05, ease: 'power3.out',
    scrollTrigger: { trigger: '.portrait-column', start: 'top 78%', once: true }
  });
  gsap.from('.about-copy > *', {
    y: 24, autoAlpha: 0, duration: .72, stagger: .13, ease: 'power2.out',
    scrollTrigger: { trigger: '.about-copy', start: 'top 78%', once: true }
  });
  gsap.to('.portrait-tape', {
    rotation: 3, y: -5, ease: 'none',
    scrollTrigger: { trigger: '.about-section', start: 'top bottom', end: 'bottom top', scrub: .8 }
  });

  // Education: let the university mark sit behind the portrait while the chapter reveals in layers.
  gsap.from('.education-section-heading', {
    y: 42, autoAlpha: 0, duration: .85, ease: 'power3.out',
    scrollTrigger: { trigger: '.education-section', start: 'top 78%', once: true }
  });
  gsap.from('.education-info-card', {
    x: -35, rotate: -1.2, autoAlpha: 0, duration: .9, ease: 'power3.out',
    scrollTrigger: { trigger: '.education-layout', start: 'top 78%', once: true }
  });
  gsap.from('.education-visual', {
    y: 54, scale: .96, autoAlpha: 0, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '.education-visual', start: 'top 82%', once: true }
  });
  gsap.from('.education-gpa', {
    scale: .78, rotate: -5, autoAlpha: 0, duration: .72, delay: .15, ease: 'back.out(1.6)',
    scrollTrigger: { trigger: '.education-info-card', start: 'top 76%', once: true }
  });
  gsap.to('.education-backdrop-shape', {
    rotation: 9, yPercent: -7, ease: 'none',
    scrollTrigger: { trigger: '.education-section', start: 'top bottom', end: 'bottom top', scrub: .9 }
  });

  // Toolkit: staged reveal, mascot float interaction and moving playful annotations.
  gsap.from('.toolkit-heading-copy > *', {
    x: -42, autoAlpha: 0, duration: .8, stagger: .13, ease: 'power3.out',
    scrollTrigger: { trigger: '.toolkit-heading', start: 'top 78%', once: true }
  });
  gsap.from('.toolkit-mascot', {
    y: 75, rotate: 8, scale: .8, autoAlpha: 0, duration: 1.1, ease: 'back.out(1.35)',
    scrollTrigger: { trigger: '.toolkit-mascot-stage', start: 'top 82%', once: true }
  });
  gsap.to('.toolkit-background-shape', {
    yPercent: -20, rotation: 70, ease: 'none',
    scrollTrigger: { trigger: '.toolkit-section', start: 'top bottom', end: 'bottom top', scrub: 1 }
  });

  // The work directory opens like a set of folders before the detailed experience stories.
  gsap.from('.experience-directory-heading', {
    y: 28, autoAlpha: 0, duration: .72, ease: 'power3.out',
    scrollTrigger: { trigger: '.experience-directory', start: 'top 83%', once: true }
  });
  gsap.from('.experience-folder', {
    y: 34, rotate: (i) => (i % 2 === 0 ? -1.2 : 1.2), autoAlpha: 0,
    duration: .78, stagger: .12, ease: 'back.out(1.2)',
    scrollTrigger: { trigger: '.experience-folder-grid', start: 'top 84%', once: true }
  });

  // Experience: each story enters on scroll; photo galleries reveal with a subtle mask-like lift.
  gsap.utils.toArray('.experience-entry').forEach((entry, i) => {
    gsap.from(entry, {
      y: 52, rotate: i % 2 === 0 ? -.35 : .35, duration: .85, ease: 'power3.out',
      scrollTrigger: { trigger: entry, start: 'top 82%', once: true }
    });
    const copy = entry.querySelectorAll('.entry-intro-block > *:not(.entry-org-logo)');
    if (copy.length) {
      gsap.from(copy, {
        y: 25, autoAlpha: 0, duration: .65, stagger: .08, ease: 'power2.out',
        scrollTrigger: { trigger: entry, start: 'top 72%', once: true }
      });
    }
    const gallery = entry.querySelector('.journey-gallery');
    if (gallery) {
      gsap.from(gallery, {
        y: 34, scale: .99, duration: .75, ease: 'power3.out',
        scrollTrigger: { trigger: gallery, start: 'top 88%', once: true }
      });
    }
    entry.querySelectorAll('.agency-campaign-block').forEach((campaign) => {
      const campaignHeading = campaign.querySelector('.agency-campaign-heading');
      const campaignCarousel = campaign.querySelector('.agency-campaign-carousel');
      if (campaignHeading) {
        gsap.from(campaignHeading, {
          x: -28, autoAlpha: 0, duration: .72, ease: 'power3.out',
          scrollTrigger: { trigger: campaign, start: 'top 84%', once: true }
        });
      }
      if (campaignCarousel) {
        gsap.from(campaignCarousel, {
          y: 36, scale: .975, autoAlpha: 0, duration: .82, ease: 'power3.out',
          scrollTrigger: { trigger: campaignCarousel, start: 'top 88%', once: true }
        });
      }
    });
    const deckButton = entry.querySelector('.deck-open-btn');
    if (deckButton) {
      gsap.from(deckButton, {
        y: 28, autoAlpha: 0, duration: .7, ease: 'power2.out',
        scrollTrigger: { trigger: deckButton, start: 'top 92%', once: true }
      });
    }
  });

  // Metric tiles land one by one so the evidence is easy to scan before the detail copy.
  gsap.utils.toArray('.impact-stats').forEach((stats) => {
    gsap.from(stats.querySelectorAll('.impact-stat'), {
      y: 22, scale: .94, autoAlpha: 0, duration: .62, stagger: .09, ease: 'back.out(1.35)',
      scrollTrigger: { trigger: stats, start: 'top 88%', once: true }
    });
  });

  // Featured projects: title, story cards and evidence previews appear in a deliberate sequence.
  gsap.from('.works-heading-row > *', {
    y: 42, autoAlpha: 0, duration: .85, stagger: .16, ease: 'power3.out',
    scrollTrigger: { trigger: '.works-heading-row', start: 'top 80%', once: true }
  });
  gsap.utils.toArray('.project-entry').forEach((project) => {
    gsap.from(project.querySelector('.project-heading-row'), {
      x: -38, autoAlpha: 0, duration: .8, ease: 'power3.out',
      scrollTrigger: { trigger: project, start: 'top 79%', once: true }
    });
    const preview = project.querySelector('.project-deck-preview');
    if (preview) {
      gsap.from(preview, {
        y: 55, scale: .975, autoAlpha: 0, duration: .9, ease: 'power3.out',
        scrollTrigger: { trigger: preview, start: 'top 88%', once: true }
      });
    }
    gsap.to(project.querySelector('.project-number-sticker'), {
      rotation: 16, y: -12, ease: 'none',
      scrollTrigger: { trigger: project, start: 'top bottom', end: 'bottom top', scrub: .8 }
    });
  });

  // Additional storytelling layers across Toolkit, Experience and every Project.
  gsap.from('.toolkit-panel', {
    y: 34, autoAlpha: 0, duration: .72, stagger: .12, ease: 'power2.out',
    scrollTrigger: { trigger: '.toolkit-grid', start: 'top 82%', once: true }
  });
  gsap.to('.toolkit-mascot-stage', {
    y: -24, rotate: 1.2, ease: 'none',
    scrollTrigger: { trigger: '.toolkit-section', start: 'top bottom', end: 'bottom top', scrub: .9 }
  });
  gsap.to('.mascot-sticker-label', {
    rotate: -7, x: -10, ease: 'none',
    scrollTrigger: { trigger: '.toolkit-section', start: 'top bottom', end: 'bottom top', scrub: 1.1 }
  });
  gsap.utils.toArray('.story-module, .learning-module, .project-story-module').forEach((module, i) => {
    gsap.from(module, {
      y: 28, autoAlpha: 0, duration: .68, ease: 'power2.out',
      scrollTrigger: { trigger: module, start: 'top 88%', once: true }
    });
  });
  gsap.utils.toArray('.journey-gallery-wrap').forEach((gallery, i) => {
    gsap.from(gallery, {
      y: 36, scale: .99, duration: .78, ease: 'power3.out',
      scrollTrigger: { trigger: gallery, start: 'top 88%', once: true }
    });
    const note = gallery.querySelector('.journey-gallery-heading .hand-note');
    if (note) gsap.from(note, { x: 35, rotate: -5, autoAlpha: 0, duration: .75, ease: 'back.out(1.5)', scrollTrigger: { trigger: gallery, start: 'top 82%', once: true } });
  });
  gsap.utils.toArray('.agency-campaign-row').forEach((row, i) => {
    gsap.from(row.querySelector('.agency-visual'), {
      clipPath: 'inset(0 0 100% 0 round 16px)', y: 28, duration: .9, ease: 'power3.out',
      scrollTrigger: { trigger: row, start: 'top 82%', once: true }
    });
  });
  gsap.utils.toArray('.project-meta-item').forEach((item) => {
    gsap.from(item, { y: 16, autoAlpha: 0, duration: .55, ease: 'power2.out', scrollTrigger: { trigger: item, start: 'top 90%', once: true } });
  });
  gsap.utils.toArray('.project-deck-preview').forEach((preview) => {
    const button = preview.querySelector('.deck-open-btn');
    if (button) gsap.from(button, { y: 24, autoAlpha: 0, duration: .7, ease: 'power2.out', scrollTrigger: { trigger: button, start: 'top 92%', once: true } });
  });

  // Closing and contact: the portfolio's final chapter.
  gsap.from('.closing-title', {
    y: 70, scale: .88, rotate: -2, autoAlpha: 0, duration: 1,
    scrollTrigger: { trigger: '.closing-section', start: 'top 76%', once: true }
  });
  gsap.to('.closing-sticker', {
    rotation: 360, ease: 'none',
    scrollTrigger: { trigger: '.closing-section', start: 'top bottom', end: 'bottom top', scrub: 1.2 }
  });
  gsap.from('.contact-details > *, .contact-intro-card > *', {
    y: 32, autoAlpha: 0, duration: .7, stagger: .1, ease: 'power2.out',
    scrollTrigger: { trigger: '.contact-grid', start: 'top 82%', once: true }
  });
}

// Interactive 3D tilt for photo frames, galleries, mascot stage and project previews.
if (canHover && !prefersReducedMotion) {
  document.querySelectorAll('.tilt-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      gsap.to(card, {
        rotateY: (px - .5) * 4.5,
        rotateX: (.5 - py) * 4.5,
        transformPerspective: 1000,
        duration: .35,
        ease: 'power2.out',
        overwrite: true
      });
    });
    card.addEventListener('pointerleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: .6, ease: 'elastic.out(1,.55)', overwrite: true });
    });
  });

  const mascotStage = document.querySelector('.toolkit-mascot-stage');
  const mascot = document.querySelector('.toolkit-mascot');
  if (mascotStage && mascot) {
    mascotStage.addEventListener('pointermove', (event) => {
      const rect = mascotStage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      mascotStage.classList.add('is-active');
      gsap.to(mascot, { rotateY: x * 13, rotateX: -y * 10, x: x * 9, y: y * 7, transformPerspective: 850, duration: .45, ease: 'power2.out', overwrite: true });
    });
    mascotStage.addEventListener('pointerleave', () => {
      mascotStage.classList.remove('is-active');
      gsap.to(mascot, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: .65, ease: 'elastic.out(1,.5)', overwrite: true });
    });
    mascot.addEventListener('click', () => {
      gsap.timeline()
        .to(mascot, { y: -24, rotate: -5, duration: .18, ease: 'power2.out' })
        .to(mascot, { y: 0, rotate: 4, duration: .28, ease: 'bounce.out' })
        .to(mascot, { rotate: 0, duration: .22, ease: 'power2.out' });
    });
  }
}

// Ensure scroll geometry is recalculated after the slides/photos and fonts settle.
window.addEventListener('load', async () => {
  const imagePromises = [...document.images].map((img) => img.decode?.().catch(() => null));
  await Promise.all([document.fonts?.ready, ...imagePromises]);
  ScrollTrigger.refresh();
  updateProgress();
});
window.addEventListener('resize', () => ScrollTrigger.refresh());

if (prefersReducedMotion) {
  document.querySelectorAll('[data-reveal]').forEach((element) => {
    element.style.opacity = '1';
    element.style.transform = 'none';
  });
}
