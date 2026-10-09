(()=>{
  const hero=document.querySelector('.d-hero');
  if(!hero||hero.querySelector('.domain-cosmos'))return;
  const cosmos=document.createElement('div');
  cosmos.className='domain-cosmos';
  cosmos.setAttribute('aria-hidden','true');
  cosmos.innerHTML=`<svg viewBox="0 0 1440 760" preserveAspectRatio="xMidYMid slice" focusable="false">
    <defs>
      <linearGradient id="planet-line" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#514181" stop-opacity=".05"/><stop offset=".28" stop-color="#8b6cce" stop-opacity=".48"/><stop offset=".67" stop-color="#6250b7" stop-opacity=".38"/><stop offset="1" stop-color="#514181" stop-opacity=".04"/></linearGradient>
    </defs>
    <g class="planet-lines" fill="none" stroke="url(#planet-line)">
      <path d="M 112 820 C 193 390 1247 390 1328 820" stroke-width="1.5"/>
      <path d="M 177 820 C 250 451 1190 451 1263 820"/>
      <path d="M 255 820 C 320 505 1120 505 1185 820"/>
      <path d="M 340 820 C 390 558 1050 558 1100 820"/>
      <path d="M 446 820 C 480 606 960 606 994 820"/>
      <path d="M 555 820 C 572 656 868 656 885 820"/>
      <path d="M 720 456 V 760 M 578 470 C 612 560 627 660 631 760 M 862 470 C 828 560 813 660 809 760" stroke-opacity=".46"/>
    </g>
  </svg>`;
  hero.prepend(cosmos);
})();
