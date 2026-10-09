(() => {
  const build = () => {
    const hero = document.querySelector('.b-hero');
    const content = hero?.querySelector('.b-hero-content');
    if (!hero || !content || hero.querySelector('.ecom-stage')) return;
    hero.classList.add('ecom-concept');
    const bag = 'assets/catalog-bag.png';
    const dress = 'assets/catalog-dress.png';
    const headphone = '<svg class="ecom-product-svg" viewBox="229 196 640 686" aria-label="Studio headphones" role="img"><defs><clipPath id="headphone-crop"><rect x="229" y="196" width="640" height="686"/></clipPath></defs><image href="assets/product-page.png" width="1536" height="1024" clip-path="url(#headphone-crop)"/></svg>';
    const stage = document.createElement('div');
    stage.className = 'ecom-stage';
    stage.innerHTML = `<div class="ecom-store"><div class="ecom-storebar"><b><i>c.</i> CODEYEA MARKET</b><span>NEW ARRIVALS / THE EVERYDAY EDIT</span><span class="ecom-bag-icon">BAG <i>0</i></span></div><div class="ecom-storebody"><div class="ecom-banner"><div class="ecom-banner-main"><div class="ecom-banner-copy"><small>THE EVERYDAY EDIT</small><b>Find your<br>next favourite.</b><p>Considered pieces.<br>Extraordinary everyday.</p><span>SHOP THE COLLECTION ↗</span></div><div class="ecom-banner-feature ecom-campaign-art"><span>01</span><b>NEW<br>SEASON</b><i>↗</i></div></div><div class="ecom-banner-side ecom-campaign-offer"><b>30<span>%</span></b><small>YOUR NEXT<br>GREAT FIND.</small></div></div><div class="ecom-product" data-product="0"><div class="ecom-photo"><img src="${bag}" alt="Red leather handbag"><button type="button" aria-label="View handbag">+</button></div><b>Leather handbag</b><small>$148 <i>VIEW PRODUCT ↗</i></small></div><div class="ecom-product" data-product="1"><div class="ecom-photo ecom-isolated-headphones">${headphone}<button type="button" aria-label="View headphones">+</button></div><b>Studio headphones</b><small>$129 <i>VIEW PRODUCT ↗</i></small></div><div class="ecom-product" data-product="2"><div class="ecom-photo"><img src="${dress}" alt="Red evening dress"><button type="button" aria-label="View dress">+</button></div><b>Evening dress</b><small>$96 <i>VIEW PRODUCT ↗</i></small></div></div><div class="ecom-storefoot"><span>THOUGHTFUL DESIGN</span><span>FAST, SIMPLE CHECKOUT</span><span>BUILT TO GROW</span></div></div><div class="ecom-cursor"><svg viewBox="0 0 28 36"><path d="M2 2v27l7-7 5 12 5-2-5-12h10L2 2z"/></svg></div><div class="ecom-cart-pop"><span>✓</span><div><b>Added to your bag</b><small>GOOD CHOICE</small></div><strong>+1</strong></div><div class="ecom-sales"><small>STORE ACTIVITY</small><b>+32%</b><span>SALES THIS MONTH ↗</span><svg viewBox="0 0 120 35"><path d="M2 30 22 25 39 27 58 13 76 20 94 8 118 3"/></svg></div><div class="ecom-metric ecom-revenue"><small>MONTHLY REVENUE</small><b>$24.8k</b><span>+18.6% this month</span></div><div class="ecom-metric ecom-profit"><small>NET PROFIT</small><b>$8,420</b><span>+12.4% this month</span></div>`;
    hero.insertBefore(stage, content);
    const cards = [...stage.querySelectorAll('.ecom-product')];
    const cursor = stage.querySelector('.ecom-cursor');
    const feature = stage.querySelector('.ecom-banner-feature');
    const cart = stage.querySelector('.ecom-bag-icon i');
    const toast = stage.querySelector('.ecom-cart-pop');
    const previews = [`<img src="${bag}" alt="Red leather handbag">`, headphone, `<img src="${dress}" alt="Red evening dress">`];
    let current = 0;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const select = (index) => {
      cards.forEach((card, i) => card.classList.toggle('is-active', i === index));
      cards[index].classList.add("is-added");
      cards.forEach((card, i) => { if (i !== index) card.classList.remove("is-added"); });
      cart.textContent = String(index + 1);
      toast.classList.add('is-visible');
      setTimeout(() => toast.classList.remove('is-visible'), 1100);
    };
    cards.forEach((card, index) => card.querySelector('button').addEventListener('click', () => select(index)));
    const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
    const loop = async () => {
      if (reduced) return;
      await pause(650);
      while (stage.isConnected) {
        const target = cards[current].querySelector('button').getBoundingClientRect();
        const bounds = stage.getBoundingClientRect();
        const x = (target.left - bounds.left + target.width * .45) * stage.offsetWidth / bounds.width;
        const y = (target.top - bounds.top + target.height * .45) * stage.offsetHeight / bounds.height;
        cursor.classList.remove('is-clicked');
        cursor.classList.add('is-moving');
        cursor.style.setProperty('--x', `${x}px`);
        cursor.style.setProperty('--y', `${y}px`);
        await pause(1300);
        cursor.classList.add('is-clicked');
        select(current);
        await pause(1500);
        current = (current + 1) % 3;
      }
    };
    loop();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build, { once: true });
  else build();
})();




