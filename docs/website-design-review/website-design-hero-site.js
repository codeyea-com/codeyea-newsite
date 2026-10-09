(()=>{const old=document.querySelector('main .b-hero');if(!old||document.querySelector('main .b-hero.hero-concept'))return;const template=document.createElement('template');template.innerHTML=`<section class="b-hero hero-concept" aria-labelledby="website-hero-title">
  <div class="hero-concept-grain" aria-hidden="true"></div>
  <div class="hero-concept-layout">
    <div class="b-hero-content hero-concept-copy">
      <span class="b-hero-number">CODEYEA<span class="hero-brand-mark" aria-hidden="true">✳</span></span>
      <div class="w-service-name">Website Design<br>&amp; Development</div>
      <h1 id="website-hero-title">Your business.<br>Your website.<br>Ready for<br><span class="hero-title-accent">what’s next.</span></h1>
      <a class="b-btn" href="https://codeyea.com/contact/">Let’s build your website<span aria-hidden="true">↗</span></a>
      <span class="hero-side-note">DESIGNED TO BE SEEN. BUILT TO WORK.</span>
    </div>
    <div class="hero-art" aria-label="Website design artwork showing a responsive website and its interface components" role="img">
      <div class="art-axis art-axis-top" aria-hidden="true"><span>01 / STRUCTURE</span><span>02 / EXPRESSION</span><span>03 / EXPERIENCE</span></div>
      <div class="art-grid" aria-hidden="true"></div>
      <div class="art-orbit art-orbit-one" aria-hidden="true"></div>
      <div class="art-orbit art-orbit-two" aria-hidden="true"></div>
      <div class="art-browser" aria-hidden="true">
        <div class="art-browser-top"><span class="art-browser-dots">◉ &nbsp; ◉ &nbsp; ◉</span><span>codeyea.com / experience</span><span>↗</span></div>
        <div class="art-browser-body">
          <div class="art-browser-nav"><b>c.</b><span>Work &nbsp;&nbsp; Studio &nbsp;&nbsp; Contact</span><i>MENU ↗</i></div>
          <div class="art-browser-main"><span class="art-kicker">DESIGN<br>DEVELOP<br>LAUNCH</span><strong>Ideas<br>that<br><em>work.</em></strong><span class="art-browser-link">EXPLORE &nbsp; ↗</span></div>
          <div class="art-portrait-frame">
            <div class="art-portrait-crop"><img class="art-portrait-inside" src="./assets/hero-portrait-close-v2.png" alt="" loading="eager" decoding="async"></div>
            <img class="art-portrait-pop" src="./assets/hero-portrait-cutout-v3.png" alt="" aria-hidden="true" loading="eager" decoding="async">
          </div>
          <div class="art-browser-bottom"><span>CREATIVE THINKING</span><span>THOUGHTFUL ENGINEERING</span><span>REAL IMPACT</span></div>
        </div>
      </div>
      <div class="art-code" aria-hidden="true"><span class="art-code-title">01 &nbsp; / &nbsp; THE BUILD <i>↗</i></span><code><span class="art-code-line" style="--n:20;--d:0ms"><b>const</b> experience = {</span><span class="art-code-line" style="--n:15;--d:420ms">&nbsp;&nbsp;idea: <em>'bold'</em>,</span><span class="art-code-line" style="--n:23;--d:840ms">&nbsp;&nbsp;detail: <em>'everywhere'</em>,</span><span class="art-code-line" style="--n:17;--d:1260ms">&nbsp;&nbsp;impact: <em>true</em></span><span class="art-code-line" style="--n:2;--d:1680ms">};</span></code></div>
      <div class="art-mobile" aria-hidden="true"><div class="art-mobile-top"><b>c.</b><span>☰</span></div><div class="art-mobile-title">Make<br>it <em>matter.</em></div><div class="art-mobile-tile"></div><div class="art-mobile-foot">VIEW PROJECT &nbsp; ↗</div></div>
      <div class="art-chip art-chip-a" aria-hidden="true">UX / UI <span>✳</span></div>
      <div class="art-chip art-chip-b" aria-hidden="true">&lt;/&gt; <span>DEV</span></div>
      <div class="art-spark art-spark-one" aria-hidden="true">✳</div>
      <div class="art-spark art-spark-two" aria-hidden="true">✦</div>
      <div class="art-rail" aria-hidden="true">DESIGN / BUILD / LAUNCH <span>↗</span></div>
      <div class="art-cursor" aria-hidden="true">➤<span>DESIGN<br>IN MOTION</span></div>
      <div class="art-axis art-axis-bottom" aria-hidden="true"><span>DESIGN SYSTEM</span></div>
    </div>
  </div>
</section>`;const hero=template.content.firstElementChild;if(!hero)return;const privatePreview=location.pathname.startsWith('/preview/pages/');const assetBase=privatePreview?'/api/site-assets/website-design-review/assets/':'./assets/';hero.querySelectorAll('img[src^="./assets/"]').forEach(img=>{img.src=assetBase+img.getAttribute('src').slice('./assets/'.length)});const originalLogo=old.querySelector('.b-hero-number'),conceptLogo=hero.querySelector('.b-hero-number');if(originalLogo&&conceptLogo){const mark=conceptLogo.querySelector('.hero-brand-mark');conceptLogo.textContent=originalLogo.textContent.trim();if(mark)conceptLogo.append(mark)}for(const selector of ['.w-service-name','h1','.hero-side-note']){const source=old.querySelector(selector),target=hero.querySelector(selector);if(source&&target)target.innerHTML=source.innerHTML}const sourceCta=old.querySelector('.b-btn'),cta=hero.querySelector('.b-btn');if(sourceCta&&cta){cta.innerHTML=sourceCta.innerHTML;cta.href=sourceCta.href;const label=sourceCta.getAttribute('aria-label');if(label)cta.setAttribute('aria-label',label)}if(privatePreview&&cta)cta.href='/preview/pages/contact';old.replaceWith(hero)})();
