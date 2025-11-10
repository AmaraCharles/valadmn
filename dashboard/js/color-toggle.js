
(function(){
  const toggle = document.getElementById('colorToggle');
  const DARK_BG = '#2c2e3e';
  const DARK_TEXT = '#ffffff';

  const WHITEISH_LUMINANCE = 0.9; 
  const DARK_TEXT_LUMINANCE = 0.45; 

  function parseColor(str){
    if(!str) return null;
    str = str.trim();
    const rgbMatch = str.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)$/i);
    if(rgbMatch){
      return { r:+rgbMatch[1], g:+rgbMatch[2], b:+rgbMatch[3], a:rgbMatch[4]===undefined?1:+rgbMatch[4] };
    }
    const hexMatch = str.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if(hexMatch){
      let hex = hexMatch[1];
      if(hex.length===3) hex = hex.split('').map(h=>h+h).join('');
      return { r:parseInt(hex.slice(0,2),16), g:parseInt(hex.slice(2,4),16), b:parseInt(hex.slice(4,6),16), a:1 };
    }
    if(str==='transparent') return {r:0,g:0,b:0,a:0};
    try {
      const d=document.createElement('div');
      d.style.color=str;
      document.body.appendChild(d);
      const cs=getComputedStyle(d).color;
      document.body.removeChild(d);
      return parseColor(cs);
    } catch(e){ return null; }
  }

  function luminance(c){
    if(!c) return 0;
    return (0.2126*c.r + 0.7152*c.g + 0.0722*c.b) / 255;
  }

  function isVisible(el){
    if(!(el instanceof Element)) return false;
    const cs=getComputedStyle(el);
    if(cs.display==='none'||cs.visibility==='hidden'||cs.opacity==='0') return false;
    const rect=el.getBoundingClientRect();
    if(rect.width===0 && rect.height===0) return false;
    return true;
  }

  function applyDarkMode(enable){
    const all=Array.from(document.querySelectorAll('body *'));
    all.unshift(document.body);

    for(const el of all){
      try{
        if(!isVisible(el)) continue;
        const cs=getComputedStyle(el);
        const parsedBg=parseColor(cs.backgroundColor);
        const bgAlpha=parsedBg ? parsedBg.a : 1;

        if(enable){
          if(el.dataset._origColor===undefined) el.dataset._origColor=cs.color||'';
          if(el.dataset._origBg===undefined) el.dataset._origBg=cs.backgroundColor||'';

          if(parsedBg && bgAlpha>0){
            const lum=luminance(parsedBg);
            if(lum>=WHITEISH_LUMINANCE){
              el.style.backgroundColor=DARK_BG;
              const borderTop=parseColor(cs.borderTopColor);
              if(borderTop && luminance(borderTop)>=WHITEISH_LUMINANCE){
                el.style.borderTopColor=DARK_BG;
                el.style.borderRightColor=DARK_BG;
                el.style.borderBottomColor=DARK_BG;
                el.style.borderLeftColor=DARK_BG;
              }
            }
          }

          const textColor=parseColor(cs.color);
          if(textColor && luminance(textColor)<=DARK_TEXT_LUMINANCE){
            el.style.color=DARK_TEXT;
          }
        } else {
          if(el.dataset._origBg!==undefined){
            el.style.backgroundColor=el.dataset._origBg||'';
            el.style.borderTopColor='';
            el.style.borderRightColor='';
            el.style.borderBottomColor='';
            el.style.borderLeftColor='';
            delete el.dataset._origBg;
          }
          if(el.dataset._origColor!==undefined){
            el.style.color=el.dataset._origColor||'';
            delete el.dataset._origColor;
          }
        }
      } catch(e){}
    }
  }

  // --- Persistent State ---
  let dark = localStorage.getItem('darkMode') === 'true';

  function updateToggleBtn(){
    toggle.setAttribute('data-mode', dark ? 'dark' : 'light');
    toggle.setAttribute('aria-pressed', dark ? 'true' : 'false');
    toggle.innerHTML = `<span class="dot"></span> ${dark ? 'Light mode' : 'Dark mode'}`;
  }

  updateToggleBtn();
  applyDarkMode(dark);

  toggle.addEventListener('click', ()=>{
    dark=!dark;
    localStorage.setItem('darkMode', dark);
    updateToggleBtn();
    applyDarkMode(dark);
  });

})();

