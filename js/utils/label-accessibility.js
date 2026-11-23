(function(){var n=0;document.querySelectorAll("label:not([for])").forEach(function(l){var c=l.nextElementSibling,x=null;if(!c)return;
if(/^(INPUT|SELECT|TEXTAREA)$/.test(c.tagName))x=c;else if(c.tagName==="DIV")x=c.querySelector("input:not([type=hidden]):not([type=file]),select");
if(x&&x.type!=="file"&&x.type!=="hidden"){if(!x.id)x.id="lf"+(++n);l.htmlFor=x.id}});
document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a.nl");if(!a)return;e.preventDefault();document.getElementById("navNt").click();var t=document.getElementById("nt_"+a.dataset.nt);if(t)t.scrollIntoView({block:"start"})});
document.addEventListener("keydown",function(e){if((e.key==="Enter"||e.key===" ")&&e.target.classList&&e.target.classList.contains("nl")){e.preventDefault();e.target.click()}})})();
