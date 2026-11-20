(function(){
  var d=document;

  // menu mobilne
  var b=d.querySelector('.burger'), m=d.getElementById('menu-mob');
  function zamknij(){b.setAttribute('aria-expanded','false');m.hidden=true;}
  if(b&&m){
    b.addEventListener('click',function(){var o=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',String(!o));m.hidden=o;});
    m.addEventListener('click',function(e){if(e.target.closest('a'))zamknij();});
    d.addEventListener('keydown',function(e){if(e.key==='Escape')zamknij();});
  }

  // przeciąganie myszą (palec działa natywnie)
  function ciagnij(el){
    var x0=0,s0=0,ruch=false,dn=false;
    el.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.button!==0)return;dn=true;ruch=false;x0=e.clientX;s0=el.scrollLeft;});
    window.addEventListener('pointermove',function(e){if(!dn)return;var dx=e.clientX-x0;if(Math.abs(dx)>4){ruch=true;el.classList.add('ciag');}if(ruch){el.scrollLeft=s0-dx;e.preventDefault();}});
    var ldx=0;window.addEventListener('pointerup',function(e){if(!dn)return;dn=false;if(ruch){dociagnij(el,e.clientX-x0);setTimeout(function(){el.classList.remove('ciag');},450);}});
    el.addEventListener('click',function(e){if(ruch){e.preventDefault();e.stopPropagation();ruch=false;}},true);
    el.addEventListener('dragstart',function(e){e.preventDefault();});
  }
  function krok(el){var c=el.firstElementChild;if(!c)return el.clientWidth;var g=parseFloat(getComputedStyle(el).columnGap)||0;return c.getBoundingClientRect().width+g;}
  function dociagnij(el,dx){var k=krok(el),q=el.scrollLeft/k,i=Math.abs(dx)>40?(dx<0?Math.ceil(q):Math.floor(q)):Math.round(q);el.scrollTo({left:i*k,behavior:'smooth'});}

  // karuzele w kartach
  d.querySelectorAll('.sw').forEach(function(sw){
    var t=sw.querySelector('.sw-tor'),n=sw.querySelector('.sw-n'),of=sw.getAttribute('data-of')||'/',ile=t.children.length;
    ciagnij(t);
    function idx(){return Math.round(t.scrollLeft/t.clientWidth);}
    function idz(i){i=(i+ile)%ile;t.scrollTo({left:i*t.clientWidth,behavior:'smooth'});}
    sw.querySelector('.sw-prev').addEventListener('click',function(){idz(idx()-1);});
    sw.querySelector('.sw-next').addEventListener('click',function(){idz(idx()+1);});
    t.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){idz(idx()+1);e.preventDefault();}if(e.key==='ArrowLeft'){idz(idx()-1);e.preventDefault();}});
    var raf;t.addEventListener('scroll',function(){cancelAnimationFrame(raf);raf=requestAnimationFrame(function(){n.textContent=(idx()+1)+' '+of+' '+ile;});},{passive:true});
  });

  // katalog
  var kat=d.querySelector('.kat');
  if(kat){
    ciagnij(kat);
    d.querySelectorAll('[data-kat]').forEach(function(btn){btn.addEventListener('click',function(){kat.scrollBy({left:krok(kat)*2*parseInt(btn.getAttribute('data-kat'),10),behavior:'smooth'});});});
    kat.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){kat.scrollBy({left:krok(kat),behavior:'smooth'});e.preventDefault();}if(e.key==='ArrowLeft'){kat.scrollBy({left:-krok(kat),behavior:'smooth'});e.preventDefault();}});
  }

  // aktywny punkt menu
  var linki=[].slice.call(d.querySelectorAll('.nav a[href^="#"]'));
  if('IntersectionObserver' in window&&linki.length){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){linki.forEach(function(a){a.classList.toggle('akt',a.getAttribute('href')==='#'+e.target.id);});}});},{rootMargin:'-45% 0px -50% 0px'});
    ['oferta','maszyny','wyroby','wycena','kontakt'].forEach(function(id){var s=d.getElementById(id);if(s)io.observe(s);});
    var start=d.getElementById('start');
    if(start)new IntersectionObserver(function(es){if(es[0].isIntersecting)linki.forEach(function(a){a.classList.remove('akt');});},{rootMargin:'-45% 0px -50% 0px'}).observe(start);
  }

  // dolny pasek (telefon / wycena): na głównej po przewinięciu za przycisk pierwszego ekranu, na podstronach po 400 px
  var p=d.getElementById('pasek'),cta=d.getElementById('hero-cta'),frm=d.getElementById('form');
  if(p){
    var zaCta=false,naWyc=false;
    function ustaw(){var w=zaCta&&!naWyc;p.classList.toggle('widac',w);p.setAttribute('aria-hidden',String(!w));p.querySelectorAll('a').forEach(function(a){a.tabIndex=w?0:-1;});}
    if(cta&&'IntersectionObserver' in window){new IntersectionObserver(function(es){zaCta=!es[0].isIntersecting&&es[0].boundingClientRect.top<0;ustaw();}).observe(cta);}
    else{var sc=function(){zaCta=window.scrollY>400;ustaw();};window.addEventListener('scroll',sc,{passive:true});sc();}
    if(frm&&'IntersectionObserver' in window)new IntersectionObserver(function(es){naWyc=es[0].isIntersecting;ustaw();},{threshold:.15}).observe(frm);
  }

  // formularz: klucz antyspamowy wpisywany przez skrypt, nazwy plików, komunikat po wysłaniu
  var pl=d.getElementById('f-plik'),pn=d.getElementById('plik-n');
  if(pl&&pn){var dom=pn.textContent;pl.addEventListener('change',function(){pn.textContent=pl.files.length?[].map.call(pl.files,function(x){return x.name;}).join(', '):dom;});}
  if(frm){
    var js=frm.querySelector('[name=kt_js]');
    var wpisz=function(){if(js&&!js.value)js.value=js.getAttribute('data-k');};
    frm.addEventListener('focusin',wpisz);frm.addEventListener('pointerdown',wpisz);frm.addEventListener('submit',function(e){
      wpisz();
      var m=frm.querySelector('[name=mail]'),t=frm.querySelector('[name=tel]');
      if(m&&t&&!m.value.trim()&&!t.value.trim()){e.preventDefault();m.setCustomValidity('Prosimy podać e-mail lub telefon.');m.reportValidity();m.addEventListener('input',function(){m.setCustomValidity('');},{once:true});}
    });
    var st=frm.querySelector('.form-ok,.form-blad');
    if(st){st.focus({preventScroll:true});st.scrollIntoView({block:'center'});}
  }

  // zgody cookies: niezbędne / mapa Google / statystyki; wybór na 12 miesięcy
  var KEY='kt-zgody',ck=d.getElementById('cookies');
  function getC(){try{var v=JSON.parse(localStorage.getItem(KEY)||'null');return v&&Date.now()-v.t<31536e6?v:null;}catch(e){return null;}}
  function mapy(){
    var c=getC(),nie=c&&!c.m;
    d.querySelectorAll('.mapa').forEach(function(m){
      var f=m.querySelector('iframe');
      if(nie){if(!m.querySelector('.map-zast')){var a=m.getAttribute('data-adres')||'';m.innerHTML='<div class="map-zast"><b>'+a.replace(/[<>&]/g,'')+'</b><p>Mapa Google jest wyłączona zgodnie z wyborem plików cookies.</p><a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(a)+'"><span>Wyznacz trasę</span></a></div>';}return;}
      if(!f||f.src)return;
      var wl=function(){f.src=f.getAttribute('data-src');};
      if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){wl();io.disconnect();}},{rootMargin:'300px'});io.observe(m);}else wl();
    });
    if(c&&c.s&&window.ktGa)window.ktGa();
  }
  function zapisz(m,s){try{localStorage.setItem(KEY,JSON.stringify({t:Date.now(),m:m?1:0,s:s?1:0}));}catch(e){}if(ck)ck.hidden=true;mapy();}
  if(ck){
    ck.addEventListener('click',function(e){
      var bt=e.target.closest('[data-ck]');if(!bt)return;
      var t=bt.getAttribute('data-ck'),u=d.getElementById('ck-ust'),cm=d.getElementById('ck-m'),cs=d.getElementById('ck-s'),c=getC();
      if(t==='ust'){u.hidden=false;bt.hidden=true;ck.querySelector('[data-ck=save]').hidden=false;if(cm)cm.checked=c?!!c.m:true;if(cs)cs.checked=c?!!c.s:false;return;}
      if(t==='all')zapisz(1,1);
      if(t==='min')zapisz(0,0);
      if(t==='save')zapisz(cm&&cm.checked,cs&&cs.checked);
    });
  }
  d.querySelectorAll('[data-cookies]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();if(!ck)return;ck.hidden=false;var u=ck.querySelector('[data-ck=ust]');if(u&&!u.hidden)u.click();});});
  mapy();

  // tabela wymiarów: filtr po średnicy
  var fi=d.getElementById('filtr-d'),tb=d.getElementById('tab-wym');
  if(fi&&tb){
    var rows=[].slice.call(tb.tBodies[0].rows),info=d.getElementById('filtr-info'),brak=d.getElementById('filtr-brak'),czysc=d.getElementById('filtr-x');
    var num=function(v){return parseFloat(String(v).replace(/[()]/g,' ').trim().split(/\s+/).pop().replace(',','.'));};
    var filtruj=function(){
      var v=parseFloat(fi.value.replace(',','.')),n=0;
      rows.forEach(function(r){
        var ok=isNaN(v);
        if(!ok){var d1=num(r.getAttribute('data-d1')),d3=num(r.getAttribute('data-d3')),d2=num(r.getAttribute('data-d2'));ok=Math.abs(d1-v)<=10||Math.abs(d3-v)<=10||Math.abs(d2-v)<=10;}
        r.hidden=!ok;if(ok)n++;
      });
      info.textContent=isNaN(v)?'Wpisz średnicę d1, d2 lub D3':'Pasujące rozmiary: '+n+' (średnica ±10 mm)';
      brak.hidden=!(n===0);czysc.hidden=isNaN(v);
    };
    fi.addEventListener('input',filtruj);
    czysc.addEventListener('click',function(){fi.value='';filtruj();fi.focus();});
    filtruj();
  }
})();
