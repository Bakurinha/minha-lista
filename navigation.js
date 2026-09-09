(()=>{
'use strict';
const modal=()=>document.getElementById('modal');
const view=()=>document.querySelector('.view.active')?.id||'listsView';
let syncing=false,modalState=false;
function setView(id){document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id));document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===id))}
function ensure(){if(!history.state?.mlView)history.replaceState({mlView:view()},'',location.href.split('#')[0]);}
function observeModal(){const m=modal();if(!m)return;new MutationObserver(()=>{const open=m.classList.contains('show');if(open&&!modalState&&!syncing){modalState=true;history.pushState({mlView:view(),mlModal:true},'',location.href.split('#')[0])}else if(!open&&modalState&&!syncing){syncing=true;history.back()}}).observe(m,{attributes:true,attributeFilter:['class']})}
function closeModal(){const m=modal();if(!m?.classList.contains('show'))return false;const b=document.getElementById('modalBody');const close=document.getElementById('modalClose');if(close){close.click();return true}if(b)b.innerHTML='';m.classList.remove('show');document.body.style.overflow='';return true}
window.addEventListener('popstate',e=>{syncing=true;const s=e.state||{mlView:'listsView'};if(modalState||s.mlModal){modalState=false;closeModal();setView(s.mlView||'listsView')}else setView(s.mlView||'listsView');syncing=false});
document.addEventListener('click',e=>{const b=e.target.closest('.nav button');if(!b)return;const id=b.dataset.view;if(!id)return;e.stopImmediatePropagation();if(id===view())return;history.pushState({mlView:id},'',location.href.split('#')[0]);setView(id)},true);
function init(){ensure();observeModal()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
