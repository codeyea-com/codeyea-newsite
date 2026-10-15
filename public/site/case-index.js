(() => {
 const root=document.querySelector('.case-study'); if(!root)return;
 const buttons=[...root.querySelectorAll('[data-filter]')];
 root.querySelectorAll('.case-index-link').forEach(link=>link.addEventListener('pointermove',event=>{
  if(event.pointerType!=='mouse')return;
  const box=link.getBoundingClientRect();
  link.style.setProperty('--view-x',Math.max(60,Math.min(box.width-60,event.clientX-box.left))+'px');
  link.style.setProperty('--view-y',Math.max(40,Math.min(box.height-40,event.clientY-box.top))+'px');
 }));
 buttons.forEach(button=>button.addEventListener('click',()=>{
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  root.querySelectorAll('[data-category]').forEach(card=>{
   card.hidden=button.dataset.filter!=='all'&&!card.dataset.category.split(' ').includes(button.dataset.filter);
  });
 }));
})();
