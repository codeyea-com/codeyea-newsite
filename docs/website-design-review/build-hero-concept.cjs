const fs = require('node:fs');
const path = require('node:path');

const directory = __dirname;
const source = fs.readFileSync(path.join(directory, 'website-design-interactive.html'), 'utf8');
const start = source.indexOf('<section class="b-hero">');
const end = source.indexOf('</section>', start) + '</section>'.length;
if (start < 0 || end < start) throw new Error('Website hero was not found');

const hero = `<section class="b-hero hero-concept" aria-labelledby="website-hero-title">
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
</section>`;

const css = `<style id="website-hero-concept-css">
.b-hero.hero-concept{min-height:780px;height:auto;background:#f2eee5;color:#152b4a;isolation:isolate;overflow:hidden}
.hero-concept-grain{position:absolute;inset:0;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.72' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.18'/%3E%3C/svg%3E");opacity:.25;mix-blend-mode:multiply;z-index:2}
.hero-concept-layout{min-height:780px;display:grid;grid-template-columns:minmax(480px,47%) minmax(0,53%);position:relative;z-index:1}
.hero-concept-copy{max-width:none;padding:72px 2vw 64px 7vw!important;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;z-index:3}
.hero-concept-copy .b-hero-number{color:#143356!important;font-size:clamp(52px,5vw,82px)!important;letter-spacing:-.065em!important;font-weight:300!important;line-height:.9!important;margin:0 0 32px!important;display:flex!important;align-items:flex-start!important;gap:12px!important}
.hero-brand-mark{font-size:.26em;letter-spacing:0;color:#ed5d4f;transform:translateY(-.14em)}
.hero-concept-copy .w-service-name{color:#194b70!important;font-size:clamp(24px,2.35vw,37px)!important;line-height:1.13!important;font-weight:500!important;margin:0 0 34px!important;letter-spacing:-.025em!important}
.hero-concept-copy h1{font-size:clamp(48px,4.45vw,79px)!important;letter-spacing:-.06em!important;line-height:1.01!important;color:#152b4a!important;font-weight:600!important;margin:0 0 39px!important}
.hero-concept-copy h1 .hero-title-accent{font:inherit;letter-spacing:inherit;color:#ce544b}
.hero-concept-copy .b-btn{font-size:clamp(17px,1.25vw,21px)!important;min-width:360px!important;padding:23px 26px!important;background:#172d4a!important;color:#fff!important;box-shadow:0 16px 34px #0c20302b;transition:transform .35s,box-shadow .35s,background .35s!important}
.hero-concept-copy .b-btn:hover{transform:translateY(-6px)!important;box-shadow:0 22px 38px #0c20303a;background:#bd4658!important}
.hero-side-note{font-size:10px;letter-spacing:.2em;color:#647385;margin-top:52px}
.hero-art{position:relative;min-height:780px;overflow:hidden;background:transparent;border:0}
.hero-art:before{content:'';position:absolute;inset:0;background-image:linear-gradient(#173a5514 1px,transparent 1px),linear-gradient(90deg,#173a5514 1px,transparent 1px);background-size:56px 56px;mask-image:linear-gradient(90deg,#000 60%,transparent);opacity:.85}
.hero-art:after{content:'';position:absolute;width:65%;height:90%;right:-18%;top:-32%;background:#ead08e;border-radius:50%;opacity:.62;filter:blur(80px)}
.art-axis{position:absolute;left:5%;right:5%;display:flex;justify-content:space-between;color:#435975;font-size:9px;letter-spacing:.13em;font-weight:600;z-index:2}
.art-axis-top{top:32px}.art-axis-bottom{bottom:25px}
.art-orbit{position:absolute;border:1px solid #183d5633;border-radius:50%;pointer-events:none}.art-orbit-one{width:700px;height:700px;top:1%;left:7%}.art-orbit-two{width:450px;height:450px;top:18%;left:25%}
.art-browser{position:absolute;width:73%;height:460px;left:10%;top:15%;background:#f8f7f1;box-shadow:27px 34px 0 #15385817,0 38px 65px #112a4436;border:1px solid #18344e;z-index:3;transform:rotate(-2.8deg);transition:transform .7s cubic-bezier(.2,.7,.2,1)}
.hero-art:hover .art-browser{transform:rotate(-1deg) translateY(-8px)}
.art-browser-top{height:34px;background:#eeeae0;border-bottom:1px solid #18344e;display:flex;align-items:center;justify-content:space-between;padding:0 14px;color:#254566;font-size:9px;letter-spacing:.08em}.art-browser-dots{color:#ce544b;font-size:8px}.art-browser-body{height:calc(100% - 34px);background:#183c5d;color:#fbf8ed;position:relative;overflow:hidden}.art-browser-body:after{content:'';width:260px;height:260px;border:48px solid #7ec1bc;position:absolute;right:-120px;top:65px;border-radius:50%;opacity:.8}.art-browser-nav{display:flex;justify-content:space-between;align-items:center;padding:17px 23px;font-size:10px;letter-spacing:.08em;position:relative;z-index:2}.art-browser-nav b{font-size:30px;line-height:1;font-weight:600;color:#f3ca7a}.art-browser-nav i{font-style:normal;border:1px solid #f7f1dd9e;padding:7px 10px}.art-browser-main{position:absolute;left:7%;top:27%;z-index:2}.art-kicker{font-size:9px;letter-spacing:.18em;color:#b7d8da;display:block;margin-bottom:17px}.art-browser-main strong{font-family:Arial,sans-serif;font-size:clamp(38px,4vw,70px);letter-spacing:-.07em;line-height:.94;font-weight:700;display:block}.art-browser-main strong em{font-family:Georgia,serif;font-weight:400;color:#efb27a}.art-period{color:#f08972}.art-browser-link{display:inline-block;font-size:9px;letter-spacing:.1em;margin-top:32px;border-bottom:1px solid #f8f2dd;padding-bottom:6px}.art-browser-bottom{position:absolute;bottom:0;left:0;right:0;display:flex;justify-content:space-around;padding:15px;background:#102d49;z-index:2;font-size:7px;letter-spacing:.08em;color:#b8ccd1}
.art-code{position:absolute;width:260px;right:3%;top:7%;background:#192d43;color:#eaf3e9;padding:16px 18px 20px;z-index:5;box-shadow:12px 15px 0 #ea9d8d;transform:rotate(5deg);transition:transform .6s}.hero-art:hover .art-code{transform:rotate(3deg) translateY(-8px)}.art-code-title{display:flex;justify-content:space-between;font-size:9px;letter-spacing:.1em;border-bottom:1px solid #ffffff50;padding-bottom:13px}.art-code-title i{font-style:normal}.art-code code{display:block;font-size:13px;line-height:1.65;margin-top:15px;color:#a9d7d7}.art-code code b{color:#eeca83}.art-code code em{color:#f3a5a3;font-style:normal}
.art-mobile{position:absolute;width:165px;height:310px;right:11%;bottom:8%;background:#e17b68;border:7px solid #112d47;z-index:6;box-shadow:18px 18px 0 #163e5840;transform:rotate(8deg);transition:transform .7s}.hero-art:hover .art-mobile{transform:rotate(5deg) translateY(-12px)}.art-mobile-top{display:flex;justify-content:space-between;padding:12px;color:#132b47}.art-mobile-top b{font-size:22px}.art-mobile-title{font-family:Arial,sans-serif;color:#112d47;font-size:31px;line-height:.92;font-weight:700;letter-spacing:-.07em;padding:15px 12px}.art-mobile-title em{font-family:Georgia,serif;font-weight:400}.art-mobile-tile{height:90px;margin:6px 12px;background:#a7d5cd;clip-path:polygon(0 25%,60% 0,100% 32%,70% 100%,5% 80%)}.art-mobile-foot{font-size:8px;border-top:1px solid #15344a;margin:15px 12px;padding-top:10px;letter-spacing:.12em}
.art-chip{position:absolute;z-index:7;font-size:17px;font-weight:700;letter-spacing:.01em;box-shadow:8px 8px 0 #172d4a24}.art-chip-a{left:2%;bottom:22%;background:#d7df82;color:#16334e;padding:16px 18px;transform:rotate(-8deg)}.art-chip-a span{padding-left:20px}.art-chip-b{right:1%;top:48%;background:#b5a9d5;color:#15334d;padding:13px 16px;transform:rotate(9deg)}.art-chip-b span{font-size:10px;padding-left:12px}.art-cursor{position:absolute;left:50%;bottom:12%;z-index:8;color:#15334c;font-size:38px;transform:rotate(-18deg);text-shadow:2px 2px #f9f6ed}.art-cursor span{display:inline-block;font-size:8px;letter-spacing:.1em;line-height:1.15;vertical-align:top;transform:rotate(18deg);padding:4px 6px;background:#f8f5e9;text-shadow:none}
.art-spark{position:absolute;z-index:4;font-family:Arial,sans-serif;line-height:1;font-weight:300;pointer-events:none}.art-spark-one{font-size:110px;color:#ca5f68;left:3%;top:5%;transform:rotate(14deg)}.art-spark-two{font-size:104px;color:#cbd977;right:7%;top:34%;transform:rotate(-12deg)}
.art-rail{position:absolute;z-index:5;left:-3%;bottom:6%;width:55%;display:flex;justify-content:space-between;align-items:center;padding:13px 18px;background:#bfd5d0;color:#17334d;border:1px solid #17334d;font-size:10px;font-weight:700;letter-spacing:.12em;transform:rotate(-6deg);box-shadow:0 14px 25px #112a442b}.art-rail span{font-size:22px;line-height:1}
.art-browser{width:76%;left:8%;top:14%;transform:rotate(-3.6deg)}.hero-art:hover .art-browser{transform:rotate(-1.3deg) translateY(-8px)}
.art-code{right:1%;top:5%;transform:rotate(6deg);box-shadow:0 24px 38px #112a4440}.hero-art:hover .art-code{transform:rotate(3deg) translateY(-8px)}
.art-mobile{right:8%;bottom:8%;box-shadow:0 24px 42px #112a4440}
.art-chip{box-shadow:0 12px 22px #112a4429}
.hero-concept-copy .b-hero-number{font-size:clamp(58px,5.6vw,90px)!important}
.b-hero.hero-concept:before{content:'';position:absolute;inset:0;background-image:linear-gradient(#173a5526 1px,transparent 1px),linear-gradient(90deg,#173a5526 1px,transparent 1px);background-size:56px 56px;opacity:.72;mask-image:linear-gradient(90deg,#0002 0%,#0007 36%,#000 74%);pointer-events:none;z-index:0}
.hero-art{overflow:visible}.hero-art:before{display:none}
.art-portrait-frame{position:absolute;z-index:3;right:6%;top:16%;width:43%;height:68%;overflow:visible;border:2px solid #f8f5e9;box-shadow:0 18px 36px #07172855;background:#61bfd0}
.art-portrait-crop{position:absolute;inset:0;overflow:hidden}
.art-portrait-inside,.art-portrait-pop{position:absolute;display:block;width:auto!important;max-width:none!important;height:125%!important;left:50%;bottom:-10%;transform:translateX(-50%) scale(1);transform-origin:50% 100%;transition:transform .8s cubic-bezier(.2,.7,.2,1)}
.art-portrait-pop{z-index:2;clip-path:inset(0 0 84% 0);pointer-events:none}
.hero-art:hover .art-portrait-inside,.hero-art:hover .art-portrait-pop{transform:translateX(-50%) scale(1.025)}
.art-browser-main{max-width:43%}.art-browser-main strong{font-size:clamp(34px,3vw,55px)}
.art-rail{left:5%;width:72%;bottom:5%;transform:rotate(-3deg);box-shadow:0 14px 28px #112a4423}
.art-code{left:-1%;right:auto;top:4%;width:228px;z-index:5;transform:rotate(-5deg)}.hero-art:hover .art-code{transform:rotate(-3deg) translateY(-8px)}
.art-spark-one{left:25%;top:5%}
.art-axis-bottom{justify-content:flex-start}
/* Match the approved generated composition: portrait first, message beside it. */
.art-browser{width:88%;height:520px;left:1%;top:14%;transform:rotate(-2deg)}
.hero-art:hover .art-browser{transform:rotate(-.6deg) translateY(-8px)}
.art-portrait-frame{left:5%;right:auto;top:13%;width:57%;height:73%}
.art-browser-main{left:auto;right:4%;top:27%;max-width:28%;text-align:left}
.art-browser-main strong{font-size:clamp(29px,2.55vw,46px);line-height:.98;letter-spacing:-.055em}
.art-kicker{font-size:10px;line-height:1.65;letter-spacing:.16em}
.art-browser-link{font-size:8px;margin-top:24px}
.art-chip-a{left:auto;right:0;top:11%;bottom:auto;transform:rotate(-4deg)}
.art-chip-b{left:2%;right:auto;top:45%;background:#ed725f;color:#16334e;padding:19px 20px;font-size:28px;transform:rotate(0)}
.art-chip-b span{display:none}
.art-code{left:-4%;top:9%;width:220px;z-index:5;transform:rotate(-5deg)}.art-code code{font-size:11px}.art-code-line{display:block;width:0;overflow:hidden;white-space:nowrap;animation:hero-code-type 6s steps(var(--n),end) infinite;animation-delay:var(--d);animation-fill-mode:both}@keyframes hero-code-type{0%,4%{width:0}34%,67%{width:calc(var(--n)*1ch)}96%,100%{width:0}}
.art-mobile{right:-1%;bottom:5%;width:148px;height:278px;transform:rotate(7deg)}
.hero-art:hover .art-mobile{transform:rotate(4deg) translateY(-10px)}
.art-rail{left:16%;width:68%;bottom:2%}
@media(max-width:1000px){.hero-concept-layout{grid-template-columns:48% 52%}.hero-concept-copy{padding-left:5vw!important}.hero-concept-copy h1{font-size:clamp(43px,5.1vw,65px)!important}.art-browser{width:82%;left:5%}.art-code{right:2%;width:225px}.art-mobile{right:5%}}
@media(max-width:700px){.b-hero.hero-concept{min-height:0}.hero-concept-layout{display:block;min-height:0}.hero-concept-copy{padding:54px 7vw 45px!important}.hero-concept-copy .b-hero-number{font-size:clamp(48px,12vw,68px)!important;margin-bottom:22px!important}.hero-concept-copy .w-service-name{font-size:clamp(22px,6vw,31px)!important;margin-bottom:27px!important}.hero-concept-copy h1{font-size:clamp(45px,10vw,63px)!important;margin-bottom:32px!important}.hero-concept-copy .b-btn{min-width:min(100%,370px)!important;font-size:17px!important}.hero-side-note{margin-top:31px}.hero-art{height:560px;min-height:0;border:0}.art-browser{width:77%;height:350px;left:8%;top:18%}.art-browser-main strong{font-size:clamp(33px,7vw,49px)}.art-browser-main{top:25%}.art-browser-link{margin-top:19px}.art-code{top:4%;right:2%;width:175px;padding:10px}.art-code code{font-size:9px}.art-code-title{font-size:7px}.art-mobile{width:122px;height:226px;right:7%;bottom:10%;border-width:5px}.art-mobile-title{font-size:23px;padding:7px}.art-mobile-tile{height:60px}.art-mobile-foot{font-size:6px}.art-chip{font-size:13px}.art-chip-a{bottom:13%}.art-chip-b{top:49%}.art-cursor{bottom:4%;left:36%}.art-axis{font-size:7px}}
@media(max-width:420px){.hero-art{height:470px}.art-browser{height:300px;left:6%;width:82%}.art-browser-nav{padding:10px}.art-browser-nav span{display:none}.art-browser-main strong{font-size:35px}.art-browser-bottom{font-size:5px}.art-code{width:145px}.art-code code{font-size:8px}.art-mobile{width:105px;height:194px}.art-mobile-title{font-size:19px}.art-mobile-tile{height:44px}.art-chip-b{display:none}}
@media(max-width:700px){.art-portrait-frame{right:5%;top:18%;width:46%;height:64%}.art-browser-main{max-width:43%}.art-browser-main strong{font-size:clamp(26px,6vw,40px)}.art-rail{left:2%;width:72%;bottom:2%;transform:rotate(-2deg)}.art-code{left:0;right:auto;top:4%;width:175px}.art-axis-bottom{display:none}}
@media(max-width:420px){.art-portrait-frame{right:4%;top:20%;width:47%;height:61%}.art-browser-main strong{font-size:27px}.art-code{width:145px}}
@media(max-width:700px){.art-browser{width:90%;height:360px;left:3%;top:17%}.art-portrait-frame{left:5%;right:auto;top:15%;width:57%;height:69%}.art-browser-main{left:auto;right:3%;top:27%;max-width:29%}.art-browser-main strong{font-size:clamp(22px,5vw,32px)}.art-kicker{font-size:6px;line-height:1.55}.art-chip-a{right:0;top:10%;bottom:auto}.art-chip-b{left:1%;top:44%;font-size:19px;padding:13px}.art-code{left:-2%;top:3%;width:170px}.art-mobile{right:-1%;bottom:7%;width:113px;height:213px}.art-rail{left:13%;width:70%;bottom:2%}}
@media(max-width:420px){.art-browser{height:310px}.art-portrait-frame{left:5%;top:17%;width:57%;height:67%}.art-browser-main{right:3%;top:28%;max-width:29%}.art-browser-main strong{font-size:22px}.art-code{width:138px}.art-mobile{width:98px;height:186px}.art-chip-b{font-size:16px;padding:10px}}
@media(prefers-reduced-motion:reduce){.hero-art .art-browser,.hero-art .art-code,.hero-art .art-mobile{transition:none!important}}
</style>`;

let result = source.slice(0, start) + hero + source.slice(end);
result = result.replace('</head>', css + '</head>');
const destination = path.join(directory, 'website-design-hero-concept-final.html');
fs.writeFileSync(destination, result);
console.log(destination);
