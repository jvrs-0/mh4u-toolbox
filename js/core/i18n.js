(function(){
var $=function(i){return document.getElementById(i)};
var TX={id:{pick:"Pilih File",hname:"Nama Hunter",pgcap:"Jumlah per slot bisa diisi sampai 99 untuk semua item, sama seperti di Database."},en:{pick:"Choose File",hname:"Hunter Name",pgcap:"Each slot can be filled up to 99 for every item, same as in the Database."}};
function tl(){var l=document.documentElement.lang==="en"?"en":"id";document.querySelectorAll("[data-i18n]").forEach(function(e){var t=TX[l][e.dataset.i18n];if(t&&e.textContent!==t)e.textContent=t});window.mhPv&&window.mhPv()}
window.mhPv=function(){
 var n=($("nmi")||{}).value||"",z=($("fund")||{}).value,h=+(($("hr")||{}).value)||0;
 var en=document.documentElement.lang==="en";
 $("pvT").textContent=n||"-";$("pvN").textContent=n||"-";
 $("pvZ").textContent=z===""||z==null?"-":Number(z).toLocaleString(en?"en-US":"id-ID");
 $("pvH").textContent=h>0?h:"-"};
$("pick").onclick=function(){$("f").click()};
$("f").addEventListener("change",function(e){var f=e.target.files&&e.target.files[0];$("fnm").textContent=f?f.name:""});
["fund","hr","nmi"].forEach(function(k){$(k).addEventListener("input",window.mhPv)});
$("profCard").addEventListener("click",function(){setTimeout(window.mhPv,0)});
document.addEventListener("mh4ulang",tl);tl();
})();
