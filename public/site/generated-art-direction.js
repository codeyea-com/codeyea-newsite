(() => {
  const small = window.matchMedia('(max-width:1199px)');
  const update = () => document.querySelectorAll('img[data-generated-mobile]').forEach(image => {
    const src = small.matches ? image.dataset.generatedMobile : image.dataset.generatedDesktop;
    if (src && image.getAttribute('src') !== src) image.setAttribute('src', src);
  });
  update();
  small.addEventListener('change', update);
})();
