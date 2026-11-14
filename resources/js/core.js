/* Shared existing B2B modules. Page entry points retain their initialization order. */
var O46Core = window.O46Core || { installed: Object.create(null) };

// IO's prepared unitPrice already reflects the customer's net/gross setting.
O46Core.updateVariationPrices = function ($item, prices) {
    const amount = entry => {
        const value = entry && entry.unitPrice && entry.unitPrice.value;
        if (typeof value !== 'number' && (typeof value !== 'string' || !/^[0-9]+(?:\.[0-9]+)?(?:e[+-]?[0-9]+)?$/i.test(value))) return null;
        const number = Number(value);
        return Number.isFinite(number) && number >= 0 ? number : null;
    };
    const price = amount(prices && prices.default), rrp = amount(prices && prices.rrp);
    const sale = price !== null && rrp !== null && rrp > price;
    const money = new Intl.NumberFormat('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    $item.find('[data-eg-item-price]').text(price === null ? '' : money.format(price)).parent().toggleClass('d-none', price === null);
    $item.find('[data-eg-item-discount]').toggleClass('d-none', !sale);
    $item.find('[data-eg-item-special]').toggleClass('d-none', sale);
    $item.find('[data-eg-item-rrp]').text(sale ? money.format(rrp) : '');
    $item.find('[data-eg-item-rrp-spar]').text(sale ? money.format(rrp - price) : '');
    $item.find('[data-eg-item-rrp-percent]').text(sale ? -Math.round((1 - price / rrp) * 100) : '');
};

/* vendors: shared by main, cat, item, vue. */
O46Core.vendors = O46Core.vendors || function () {
    if (O46Core.installed.vendors) return;
if (tseElem == null)
{
/*
 Copyright (C) Federico Zivolo 2017
 Distributed under the MIT License (license terms are at http://opensource.org/licenses/MIT).
 */(function(e,t){'object'==typeof exports&&'undefined'!=typeof module?module.exports=t():'function'==typeof define&&define.amd?define(t):e.Popper=t()})(this,function(){'use strict';function e(e){return e&&'[object Function]'==={}.toString.call(e)}function t(e,t){if(1!==e.nodeType)return[];var o=getComputedStyle(e,null);return t?o[t]:o}function o(e){return'HTML'===e.nodeName?e:e.parentNode||e.host}function n(e){if(!e)return document.body;switch(e.nodeName){case'HTML':case'BODY':return e.ownerDocument.body;case'#document':return e.body;}var i=t(e),r=i.overflow,p=i.overflowX,s=i.overflowY;return /(auto|scroll)/.test(r+s+p)?e:n(o(e))}function r(e){var o=e&&e.offsetParent,i=o&&o.nodeName;return i&&'BODY'!==i&&'HTML'!==i?-1!==['TD','TABLE'].indexOf(o.nodeName)&&'static'===t(o,'position')?r(o):o:e?e.ownerDocument.documentElement:document.documentElement}function p(e){var t=e.nodeName;return'BODY'!==t&&('HTML'===t||r(e.firstElementChild)===e)}function s(e){return null===e.parentNode?e:s(e.parentNode)}function d(e,t){if(!e||!e.nodeType||!t||!t.nodeType)return document.documentElement;var o=e.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_FOLLOWING,i=o?e:t,n=o?t:e,a=document.createRange();a.setStart(i,0),a.setEnd(n,0);var l=a.commonAncestorContainer;if(e!==l&&t!==l||i.contains(n))return p(l)?l:r(l);var f=s(e);return f.host?d(f.host,t):d(e,s(t).host)}function a(e){var t=1<arguments.length&&void 0!==arguments[1]?arguments[1]:'top',o='top'===t?'scrollTop':'scrollLeft',i=e.nodeName;if('BODY'===i||'HTML'===i){var n=e.ownerDocument.documentElement,r=e.ownerDocument.scrollingElement||n;return r[o]}return e[o]}function l(e,t){var o=2<arguments.length&&void 0!==arguments[2]&&arguments[2],i=a(t,'top'),n=a(t,'left'),r=o?-1:1;return e.top+=i*r,e.bottom+=i*r,e.left+=n*r,e.right+=n*r,e}function f(e,t){var o='x'===t?'Left':'Top',i='Left'==o?'Right':'Bottom';return parseFloat(e['border'+o+'Width'],10)+parseFloat(e['border'+i+'Width'],10)}function m(e,t,o,i){return J(t['offset'+e],t['scroll'+e],o['client'+e],o['offset'+e],o['scroll'+e],ie()?o['offset'+e]+i['margin'+('Height'===e?'Top':'Left')]+i['margin'+('Height'===e?'Bottom':'Right')]:0)}function h(){var e=document.body,t=document.documentElement,o=ie()&&getComputedStyle(t);return{height:m('Height',e,t,o),width:m('Width',e,t,o)}}function c(e){return se({},e,{right:e.left+e.width,bottom:e.top+e.height})}function g(e){var o={};if(ie())try{o=e.getBoundingClientRect();var i=a(e,'top'),n=a(e,'left');o.top+=i,o.left+=n,o.bottom+=i,o.right+=n}catch(e){}else o=e.getBoundingClientRect();var r={left:o.left,top:o.top,width:o.right-o.left,height:o.bottom-o.top},p='HTML'===e.nodeName?h():{},s=p.width||e.clientWidth||r.right-r.left,d=p.height||e.clientHeight||r.bottom-r.top,l=e.offsetWidth-s,m=e.offsetHeight-d;if(l||m){var g=t(e);l-=f(g,'x'),m-=f(g,'y'),r.width-=l,r.height-=m}return c(r)}function u(e,o){var i=ie(),r='HTML'===o.nodeName,p=g(e),s=g(o),d=n(e),a=t(o),f=parseFloat(a.borderTopWidth,10),m=parseFloat(a.borderLeftWidth,10),h=c({top:p.top-s.top-f,left:p.left-s.left-m,width:p.width,height:p.height});if(h.marginTop=0,h.marginLeft=0,!i&&r){var u=parseFloat(a.marginTop,10),b=parseFloat(a.marginLeft,10);h.top-=f-u,h.bottom-=f-u,h.left-=m-b,h.right-=m-b,h.marginTop=u,h.marginLeft=b}return(i?o.contains(d):o===d&&'BODY'!==d.nodeName)&&(h=l(h,o)),h}function b(e){var t=e.ownerDocument.documentElement,o=u(e,t),i=J(t.clientWidth,window.innerWidth||0),n=J(t.clientHeight,window.innerHeight||0),r=a(t),p=a(t,'left'),s={top:r-o.top+o.marginTop,left:p-o.left+o.marginLeft,width:i,height:n};return c(s)}function w(e){var i=e.nodeName;return'BODY'===i||'HTML'===i?!1:'fixed'===t(e,'position')||w(o(e))}function y(e,t,i,r){var p={top:0,left:0},s=d(e,t);if('viewport'===r)p=b(s);else{var a;'scrollParent'===r?(a=n(o(t)),'BODY'===a.nodeName&&(a=e.ownerDocument.documentElement)):'window'===r?a=e.ownerDocument.documentElement:a=r;var l=u(a,s);if('HTML'===a.nodeName&&!w(s)){var f=h(),m=f.height,c=f.width;p.top+=l.top-l.marginTop,p.bottom=m+l.top,p.left+=l.left-l.marginLeft,p.right=c+l.left}else p=l}return p.left+=i,p.top+=i,p.right-=i,p.bottom-=i,p}function E(e){var t=e.width,o=e.height;return t*o}function v(e,t,o,i,n){var r=5<arguments.length&&void 0!==arguments[5]?arguments[5]:0;if(-1===e.indexOf('auto'))return e;var p=y(o,i,r,n),s={top:{width:p.width,height:t.top-p.top},right:{width:p.right-t.right,height:p.height},bottom:{width:p.width,height:p.bottom-t.bottom},left:{width:t.left-p.left,height:p.height}},d=Object.keys(s).map(function(e){return se({key:e},s[e],{area:E(s[e])})}).sort(function(e,t){return t.area-e.area}),a=d.filter(function(e){var t=e.width,i=e.height;return t>=o.clientWidth&&i>=o.clientHeight}),l=0<a.length?a[0].key:d[0].key,f=e.split('-')[1];return l+(f?'-'+f:'')}function O(e,t,o){var i=d(t,o);return u(o,i)}function L(e){var t=getComputedStyle(e),o=parseFloat(t.marginTop)+parseFloat(t.marginBottom),i=parseFloat(t.marginLeft)+parseFloat(t.marginRight),n={width:e.offsetWidth+i,height:e.offsetHeight+o};return n}function x(e){var t={left:'right',right:'left',bottom:'top',top:'bottom'};return e.replace(/left|right|bottom|top/g,function(e){return t[e]})}function S(e,t,o){o=o.split('-')[0];var i=L(e),n={width:i.width,height:i.height},r=-1!==['right','left'].indexOf(o),p=r?'top':'left',s=r?'left':'top',d=r?'height':'width',a=r?'width':'height';return n[p]=t[p]+t[d]/2-i[d]/2,n[s]=o===s?t[s]-i[a]:t[x(s)],n}function T(e,t){return Array.prototype.find?e.find(t):e.filter(t)[0]}function D(e,t,o){if(Array.prototype.findIndex)return e.findIndex(function(e){return e[t]===o});var i=T(e,function(e){return e[t]===o});return e.indexOf(i)}function C(t,o,i){var n=void 0===i?t:t.slice(0,D(t,'name',i));return n.forEach(function(t){t['function']&&console.warn('`modifier.function` is deprecated, use `modifier.fn`!');var i=t['function']||t.fn;t.enabled&&e(i)&&(o.offsets.popper=c(o.offsets.popper),o.offsets.reference=c(o.offsets.reference),o=i(o,t))}),o}function N(){if(!this.state.isDestroyed){var e={instance:this,styles:{},arrowStyles:{},attributes:{},flipped:!1,offsets:{}};e.offsets.reference=O(this.state,this.popper,this.reference),e.placement=v(this.options.placement,e.offsets.reference,this.popper,this.reference,this.options.modifiers.flip.boundariesElement,this.options.modifiers.flip.padding),e.originalPlacement=e.placement,e.offsets.popper=S(this.popper,e.offsets.reference,e.placement),e.offsets.popper.position='absolute',e=C(this.modifiers,e),this.state.isCreated?this.options.onUpdate(e):(this.state.isCreated=!0,this.options.onCreate(e))}}function k(e,t){return e.some(function(e){var o=e.name,i=e.enabled;return i&&o===t})}function W(e){for(var t=[!1,'ms','Webkit','Moz','O'],o=e.charAt(0).toUpperCase()+e.slice(1),n=0;n<t.length-1;n++){var i=t[n],r=i?''+i+o:e;if('undefined'!=typeof document.body.style[r])return r}return null}function P(){return this.state.isDestroyed=!0,k(this.modifiers,'applyStyle')&&(this.popper.removeAttribute('x-placement'),this.popper.style.left='',this.popper.style.position='',this.popper.style.top='',this.popper.style[W('transform')]=''),this.disableEventListeners(),this.options.removeOnDestroy&&this.popper.parentNode.removeChild(this.popper),this}function B(e){var t=e.ownerDocument;return t?t.defaultView:window}function H(e,t,o,i){var r='BODY'===e.nodeName,p=r?e.ownerDocument.defaultView:e;p.addEventListener(t,o,{passive:!0}),r||H(n(p.parentNode),t,o,i),i.push(p)}function A(e,t,o,i){o.updateBound=i,B(e).addEventListener('resize',o.updateBound,{passive:!0});var r=n(e);return H(r,'scroll',o.updateBound,o.scrollParents),o.scrollElement=r,o.eventsEnabled=!0,o}function I(){this.state.eventsEnabled||(this.state=A(this.reference,this.options,this.state,this.scheduleUpdate))}function M(e,t){return B(e).removeEventListener('resize',t.updateBound),t.scrollParents.forEach(function(e){e.removeEventListener('scroll',t.updateBound)}),t.updateBound=null,t.scrollParents=[],t.scrollElement=null,t.eventsEnabled=!1,t}function R(){this.state.eventsEnabled&&(cancelAnimationFrame(this.scheduleUpdate),this.state=M(this.reference,this.state))}function U(e){return''!==e&&!isNaN(parseFloat(e))&&isFinite(e)}function Y(e,t){Object.keys(t).forEach(function(o){var i='';-1!==['width','height','top','right','bottom','left'].indexOf(o)&&U(t[o])&&(i='px'),e.style[o]=t[o]+i})}function j(e,t){Object.keys(t).forEach(function(o){var i=t[o];!1===i?e.removeAttribute(o):e.setAttribute(o,t[o])})}function F(e,t,o){var i=T(e,function(e){var o=e.name;return o===t}),n=!!i&&e.some(function(e){return e.name===o&&e.enabled&&e.order<i.order});if(!n){var r='`'+t+'`';console.warn('`'+o+'`'+' modifier is required by '+r+' modifier in order to work, be sure to include it before '+r+'!')}return n}function K(e){return'end'===e?'start':'start'===e?'end':e}function q(e){var t=1<arguments.length&&void 0!==arguments[1]&&arguments[1],o=ae.indexOf(e),i=ae.slice(o+1).concat(ae.slice(0,o));return t?i.reverse():i}function V(e,t,o,i){var n=e.match(/((?:\-|\+)?\d*\.?\d*)(.*)/),r=+n[1],p=n[2];if(!r)return e;if(0===p.indexOf('%')){var s;switch(p){case'%p':s=o;break;case'%':case'%r':default:s=i;}var d=c(s);return d[t]/100*r}if('vh'===p||'vw'===p){var a;return a='vh'===p?J(document.documentElement.clientHeight,window.innerHeight||0):J(document.documentElement.clientWidth,window.innerWidth||0),a/100*r}return r}function z(e,t,o,i){var n=[0,0],r=-1!==['right','left'].indexOf(i),p=e.split(/(\+|\-)/).map(function(e){return e.trim()}),s=p.indexOf(T(p,function(e){return-1!==e.search(/,|\s/)}));p[s]&&-1===p[s].indexOf(',')&&console.warn('Offsets separated by white space(s) are deprecated, use a comma (,) instead.');var d=/\s*,\s*|\s+/,a=-1===s?[p]:[p.slice(0,s).concat([p[s].split(d)[0]]),[p[s].split(d)[1]].concat(p.slice(s+1))];return a=a.map(function(e,i){var n=(1===i?!r:r)?'height':'width',p=!1;return e.reduce(function(e,t){return''===e[e.length-1]&&-1!==['+','-'].indexOf(t)?(e[e.length-1]=t,p=!0,e):p?(e[e.length-1]+=t,p=!1,e):e.concat(t)},[]).map(function(e){return V(e,n,t,o)})}),a.forEach(function(e,t){e.forEach(function(o,i){U(o)&&(n[t]+=o*('-'===e[i-1]?-1:1))})}),n}function G(e,t){var o,i=t.offset,n=e.placement,r=e.offsets,p=r.popper,s=r.reference,d=n.split('-')[0];return o=U(+i)?[+i,0]:z(i,p,s,d),'left'===d?(p.top+=o[0],p.left-=o[1]):'right'===d?(p.top+=o[0],p.left+=o[1]):'top'===d?(p.left+=o[0],p.top-=o[1]):'bottom'===d&&(p.left+=o[0],p.top+=o[1]),e.popper=p,e}for(var _=Math.min,X=Math.floor,J=Math.max,Q='undefined'!=typeof window&&'undefined'!=typeof document,Z=['Edge','Trident','Firefox'],$=0,ee=0;ee<Z.length;ee+=1)if(Q&&0<=navigator.userAgent.indexOf(Z[ee])){$=1;break}var i,te=Q&&window.Promise,oe=te?function(e){var t=!1;return function(){t||(t=!0,window.Promise.resolve().then(function(){t=!1,e()}))}}:function(e){var t=!1;return function(){t||(t=!0,setTimeout(function(){t=!1,e()},$))}},ie=function(){return void 0==i&&(i=-1!==navigator.appVersion.indexOf('MSIE 10')),i},ne=function(e,t){if(!(e instanceof t))throw new TypeError('Cannot call a class as a function')},re=function(){function e(e,t){for(var o,n=0;n<t.length;n++)o=t[n],o.enumerable=o.enumerable||!1,o.configurable=!0,'value'in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}return function(t,o,i){return o&&e(t.prototype,o),i&&e(t,i),t}}(),pe=function(e,t,o){return t in e?Object.defineProperty(e,t,{value:o,enumerable:!0,configurable:!0,writable:!0}):e[t]=o,e},se=Object.assign||function(e){for(var t,o=1;o<arguments.length;o++)for(var i in t=arguments[o],t)Object.prototype.hasOwnProperty.call(t,i)&&(e[i]=t[i]);return e},de=['auto-start','auto','auto-end','top-start','top','top-end','right-start','right','right-end','bottom-end','bottom','bottom-start','left-end','left','left-start'],ae=de.slice(3),le={FLIP:'flip',CLOCKWISE:'clockwise',COUNTERCLOCKWISE:'counterclockwise'},fe=function(){function t(o,i){var n=this,r=2<arguments.length&&void 0!==arguments[2]?arguments[2]:{};ne(this,t),this.scheduleUpdate=function(){return requestAnimationFrame(n.update)},this.update=oe(this.update.bind(this)),this.options=se({},t.Defaults,r),this.state={isDestroyed:!1,isCreated:!1,scrollParents:[]},this.reference=o&&o.jquery?o[0]:o,this.popper=i&&i.jquery?i[0]:i,this.options.modifiers={},Object.keys(se({},t.Defaults.modifiers,r.modifiers)).forEach(function(e){n.options.modifiers[e]=se({},t.Defaults.modifiers[e]||{},r.modifiers?r.modifiers[e]:{})}),this.modifiers=Object.keys(this.options.modifiers).map(function(e){return se({name:e},n.options.modifiers[e])}).sort(function(e,t){return e.order-t.order}),this.modifiers.forEach(function(t){t.enabled&&e(t.onLoad)&&t.onLoad(n.reference,n.popper,n.options,t,n.state)}),this.update();var p=this.options.eventsEnabled;p&&this.enableEventListeners(),this.state.eventsEnabled=p}return re(t,[{key:'update',value:function(){return N.call(this)}},{key:'destroy',value:function(){return P.call(this)}},{key:'enableEventListeners',value:function(){return I.call(this)}},{key:'disableEventListeners',value:function(){return R.call(this)}}]),t}();return fe.Utils=('undefined'==typeof window?global:window).PopperUtils,fe.placements=de,fe.Defaults={placement:'bottom',eventsEnabled:!0,removeOnDestroy:!1,onCreate:function(){},onUpdate:function(){},modifiers:{shift:{order:100,enabled:!0,fn:function(e){var t=e.placement,o=t.split('-')[0],i=t.split('-')[1];if(i){var n=e.offsets,r=n.reference,p=n.popper,s=-1!==['bottom','top'].indexOf(o),d=s?'left':'top',a=s?'width':'height',l={start:pe({},d,r[d]),end:pe({},d,r[d]+r[a]-p[a])};e.offsets.popper=se({},p,l[i])}return e}},offset:{order:200,enabled:!0,fn:G,offset:0},preventOverflow:{order:300,enabled:!0,fn:function(e,t){var o=t.boundariesElement||r(e.instance.popper);e.instance.reference===o&&(o=r(o));var i=y(e.instance.popper,e.instance.reference,t.padding,o);t.boundaries=i;var n=t.priority,p=e.offsets.popper,s={primary:function(e){var o=p[e];return p[e]<i[e]&&!t.escapeWithReference&&(o=J(p[e],i[e])),pe({},e,o)},secondary:function(e){var o='right'===e?'left':'top',n=p[o];return p[e]>i[e]&&!t.escapeWithReference&&(n=_(p[o],i[e]-('right'===e?p.width:p.height))),pe({},o,n)}};return n.forEach(function(e){var t=-1===['left','top'].indexOf(e)?'secondary':'primary';p=se({},p,s[t](e))}),e.offsets.popper=p,e},priority:['left','right','top','bottom'],padding:5,boundariesElement:'scrollParent'},keepTogether:{order:400,enabled:!0,fn:function(e){var t=e.offsets,o=t.popper,i=t.reference,n=e.placement.split('-')[0],r=X,p=-1!==['top','bottom'].indexOf(n),s=p?'right':'bottom',d=p?'left':'top',a=p?'width':'height';return o[s]<r(i[d])&&(e.offsets.popper[d]=r(i[d])-o[a]),o[d]>r(i[s])&&(e.offsets.popper[d]=r(i[s])),e}},arrow:{order:500,enabled:!0,fn:function(e,o){var i;if(!F(e.instance.modifiers,'arrow','keepTogether'))return e;var n=o.element;if('string'==typeof n){if(n=e.instance.popper.querySelector(n),!n)return e;}else if(!e.instance.popper.contains(n))return console.warn('WARNING: `arrow.element` must be child of its popper element!'),e;var r=e.placement.split('-')[0],p=e.offsets,s=p.popper,d=p.reference,a=-1!==['left','right'].indexOf(r),l=a?'height':'width',f=a?'Top':'Left',m=f.toLowerCase(),h=a?'left':'top',g=a?'bottom':'right',u=L(n)[l];d[g]-u<s[m]&&(e.offsets.popper[m]-=s[m]-(d[g]-u)),d[m]+u>s[g]&&(e.offsets.popper[m]+=d[m]+u-s[g]),e.offsets.popper=c(e.offsets.popper);var b=d[m]+d[l]/2-u/2,w=t(e.instance.popper),y=parseFloat(w['margin'+f],10),E=parseFloat(w['border'+f+'Width'],10),v=b-e.offsets.popper[m]-y-E;return v=J(_(s[l]-u,v),0),e.arrowElement=n,e.offsets.arrow=(i={},pe(i,m,Math.round(v)),pe(i,h,''),i),e},element:'[x-arrow]'},flip:{order:600,enabled:!0,fn:function(e,t){if(k(e.instance.modifiers,'inner'))return e;if(e.flipped&&e.placement===e.originalPlacement)return e;var o=y(e.instance.popper,e.instance.reference,t.padding,t.boundariesElement),i=e.placement.split('-')[0],n=x(i),r=e.placement.split('-')[1]||'',p=[];switch(t.behavior){case le.FLIP:p=[i,n];break;case le.CLOCKWISE:p=q(i);break;case le.COUNTERCLOCKWISE:p=q(i,!0);break;default:p=t.behavior;}return p.forEach(function(s,d){if(i!==s||p.length===d+1)return e;i=e.placement.split('-')[0],n=x(i);var a=e.offsets.popper,l=e.offsets.reference,f=X,m='left'===i&&f(a.right)>f(l.left)||'right'===i&&f(a.left)<f(l.right)||'top'===i&&f(a.bottom)>f(l.top)||'bottom'===i&&f(a.top)<f(l.bottom),h=f(a.left)<f(o.left),c=f(a.right)>f(o.right),g=f(a.top)<f(o.top),u=f(a.bottom)>f(o.bottom),b='left'===i&&h||'right'===i&&c||'top'===i&&g||'bottom'===i&&u,w=-1!==['top','bottom'].indexOf(i),y=!!t.flipVariations&&(w&&'start'===r&&h||w&&'end'===r&&c||!w&&'start'===r&&g||!w&&'end'===r&&u);(m||b||y)&&(e.flipped=!0,(m||b)&&(i=p[d+1]),y&&(r=K(r)),e.placement=i+(r?'-'+r:''),e.offsets.popper=se({},e.offsets.popper,S(e.instance.popper,e.offsets.reference,e.placement)),e=C(e.instance.modifiers,e,'flip'))}),e},behavior:'flip',padding:5,boundariesElement:'viewport'},inner:{order:700,enabled:!1,fn:function(e){var t=e.placement,o=t.split('-')[0],i=e.offsets,n=i.popper,r=i.reference,p=-1!==['left','right'].indexOf(o),s=-1===['top','left'].indexOf(o);return n[p?'left':'top']=r[o]-(s?n[p?'width':'height']:0),e.placement=x(t),e.offsets.popper=c(n),e}},hide:{order:800,enabled:!0,fn:function(e){if(!F(e.instance.modifiers,'hide','preventOverflow'))return e;var t=e.offsets.reference,o=T(e.instance.modifiers,function(e){return'preventOverflow'===e.name}).boundaries;if(t.bottom<o.top||t.left>o.right||t.top>o.bottom||t.right<o.left){if(!0===e.hide)return e;e.hide=!0,e.attributes['x-out-of-boundaries']=''}else{if(!1===e.hide)return e;e.hide=!1,e.attributes['x-out-of-boundaries']=!1}return e}},computeStyle:{order:850,enabled:!0,fn:function(e,t){var o=t.x,i=t.y,n=e.offsets.popper,p=T(e.instance.modifiers,function(e){return'applyStyle'===e.name}).gpuAcceleration;void 0!==p&&console.warn('WARNING: `gpuAcceleration` option moved to `computeStyle` modifier and will not be supported in future versions of Popper.js!');var s,d,a=void 0===p?t.gpuAcceleration:p,l=r(e.instance.popper),f=g(l),m={position:n.position},h={left:X(n.left),top:X(n.top),bottom:X(n.bottom),right:X(n.right)},c='bottom'===o?'top':'bottom',u='right'===i?'left':'right',b=W('transform');if(d='bottom'==c?-f.height+h.bottom:h.top,s='right'==u?-f.width+h.right:h.left,a&&b)m[b]='translate3d('+s+'px, '+d+'px, 0)',m[c]=0,m[u]=0,m.willChange='transform';else{var w='bottom'==c?-1:1,y='right'==u?-1:1;m[c]=d*w,m[u]=s*y,m.willChange=c+', '+u}var E={"x-placement":e.placement};return e.attributes=se({},E,e.attributes),e.styles=se({},m,e.styles),e.arrowStyles=se({},e.offsets.arrow,e.arrowStyles),e},gpuAcceleration:!0,x:'bottom',y:'right'},applyStyle:{order:900,enabled:!0,fn:function(e){return Y(e.instance.popper,e.styles),j(e.instance.popper,e.attributes),e.arrowElement&&Object.keys(e.arrowStyles).length&&Y(e.arrowElement,e.arrowStyles),e},onLoad:function(e,t,o,i,n){var r=O(n,t,e),p=v(o.placement,r,t,e,o.modifiers.flip.boundariesElement,o.modifiers.flip.padding);return t.setAttribute('x-placement',p),Y(t,{position:'absolute'}),o},gpuAcceleration:void 0}}},fe});

/*!
  * Bootstrap v4.3.1 (https://getbootstrap.com/)
  * Copyright 2011-2019 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
  */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports,require("jquery"),require("popper.js")):"function"==typeof define&&define.amd?define(["exports","jquery","popper.js"],e):e((t=t||self).bootstrap={},t.jQuery,t.Popper)}(this,function(t,g,u){"use strict";function i(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}function s(t,e,n){return e&&i(t.prototype,e),n&&i(t,n),t}function l(o){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{},e=Object.keys(r);"function"==typeof Object.getOwnPropertySymbols&&(e=e.concat(Object.getOwnPropertySymbols(r).filter(function(t){return Object.getOwnPropertyDescriptor(r,t).enumerable}))),e.forEach(function(t){var e,n,i;e=o,i=r[n=t],n in e?Object.defineProperty(e,n,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[n]=i})}return o}g=g&&g.hasOwnProperty("default")?g.default:g,u=u&&u.hasOwnProperty("default")?u.default:u;var e="transitionend";function n(t){var e=this,n=!1;return g(this).one(_.TRANSITION_END,function(){n=!0}),setTimeout(function(){n||_.triggerTransitionEnd(e)},t),this}var _={TRANSITION_END:"bsTransitionEnd",getUID:function(t){for(;t+=~~(1e6*Math.random()),document.getElementById(t););return t},getSelectorFromElement:function(t){var e=t.getAttribute("data-target");if(!e||"#"===e){var n=t.getAttribute("href");e=n&&"#"!==n?n.trim():""}try{return document.querySelector(e)?e:null}catch(t){return null}},getTransitionDurationFromElement:function(t){if(!t)return 0;var e=g(t).css("transition-duration"),n=g(t).css("transition-delay"),i=parseFloat(e),o=parseFloat(n);return i||o?(e=e.split(",")[0],n=n.split(",")[0],1e3*(parseFloat(e)+parseFloat(n))):0},reflow:function(t){return t.offsetHeight},triggerTransitionEnd:function(t){g(t).trigger(e)},supportsTransitionEnd:function(){return Boolean(e)},isElement:function(t){return(t[0]||t).nodeType},typeCheckConfig:function(t,e,n){for(var i in n)if(Object.prototype.hasOwnProperty.call(n,i)){var o=n[i],r=e[i],s=r&&_.isElement(r)?"element":(a=r,{}.toString.call(a).match(/\s([a-z]+)/i)[1].toLowerCase());if(!new RegExp(o).test(s))throw new Error(t.toUpperCase()+': Option "'+i+'" provided type "'+s+'" but expected type "'+o+'".')}var a},findShadowRoot:function(t){if(!document.documentElement.attachShadow)return null;if("function"!=typeof t.getRootNode)return t instanceof ShadowRoot?t:t.parentNode?_.findShadowRoot(t.parentNode):null;var e=t.getRootNode();return e instanceof ShadowRoot?e:null}};g.fn.emulateTransitionEnd=n,g.event.special[_.TRANSITION_END]={bindType:e,delegateType:e,handle:function(t){if(g(t.target).is(this))return t.handleObj.handler.apply(this,arguments)}};var o="alert",r="bs.alert",a="."+r,c=g.fn[o],h={CLOSE:"close"+a,CLOSED:"closed"+a,CLICK_DATA_API:"click"+a+".data-api"},f="alert",d="fade",m="show",p=function(){function i(t){this._element=t}var t=i.prototype;return t.close=function(t){var e=this._element;t&&(e=this._getRootElement(t)),this._triggerCloseEvent(e).isDefaultPrevented()||this._removeElement(e)},t.dispose=function(){g.removeData(this._element,r),this._element=null},t._getRootElement=function(t){var e=_.getSelectorFromElement(t),n=!1;return e&&(n=document.querySelector(e)),n||(n=g(t).closest("."+f)[0]),n},t._triggerCloseEvent=function(t){var e=g.Event(h.CLOSE);return g(t).trigger(e),e},t._removeElement=function(e){var n=this;if(g(e).removeClass(m),g(e).hasClass(d)){var t=_.getTransitionDurationFromElement(e);g(e).one(_.TRANSITION_END,function(t){return n._destroyElement(e,t)}).emulateTransitionEnd(t)}else this._destroyElement(e)},t._destroyElement=function(t){g(t).detach().trigger(h.CLOSED).remove()},i._jQueryInterface=function(n){return this.each(function(){var t=g(this),e=t.data(r);e||(e=new i(this),t.data(r,e)),"close"===n&&e[n](this)})},i._handleDismiss=function(e){return function(t){t&&t.preventDefault(),e.close(this)}},s(i,null,[{key:"VERSION",get:function(){return"4.3.1"}}]),i}();g(document).on(h.CLICK_DATA_API,'[data-dismiss="alert"]',p._handleDismiss(new p)),g.fn[o]=p._jQueryInterface,g.fn[o].Constructor=p,g.fn[o].noConflict=function(){return g.fn[o]=c,p._jQueryInterface};var v="button",y="bs.button",E="."+y,C=".data-api",T=g.fn[v],S="active",b="btn",I="focus",D='[data-toggle^="button"]',w='[data-toggle="buttons"]',A='input:not([type="hidden"])',N=".active",O=".btn",k={CLICK_DATA_API:"click"+E+C,FOCUS_BLUR_DATA_API:"focus"+E+C+" blur"+E+C},P=function(){function n(t){this._element=t}var t=n.prototype;return t.toggle=function(){var t=!0,e=!0,n=g(this._element).closest(w)[0];if(n){var i=this._element.querySelector(A);if(i){if("radio"===i.type)if(i.checked&&this._element.classList.contains(S))t=!1;else{var o=n.querySelector(N);o&&g(o).removeClass(S)}if(t){if(i.hasAttribute("disabled")||n.hasAttribute("disabled")||i.classList.contains("disabled")||n.classList.contains("disabled"))return;i.checked=!this._element.classList.contains(S),g(i).trigger("change")}i.focus(),e=!1}}e&&this._element.setAttribute("aria-pressed",!this._element.classList.contains(S)),t&&g(this._element).toggleClass(S)},t.dispose=function(){g.removeData(this._element,y),this._element=null},n._jQueryInterface=function(e){return this.each(function(){var t=g(this).data(y);t||(t=new n(this),g(this).data(y,t)),"toggle"===e&&t[e]()})},s(n,null,[{key:"VERSION",get:function(){return"4.3.1"}}]),n}();g(document).on(k.CLICK_DATA_API,D,function(t){t.preventDefault();var e=t.target;g(e).hasClass(b)||(e=g(e).closest(O)),P._jQueryInterface.call(g(e),"toggle")}).on(k.FOCUS_BLUR_DATA_API,D,function(t){var e=g(t.target).closest(O)[0];g(e).toggleClass(I,/^focus(in)?$/.test(t.type))}),g.fn[v]=P._jQueryInterface,g.fn[v].Constructor=P,g.fn[v].noConflict=function(){return g.fn[v]=T,P._jQueryInterface};var L="carousel",j="bs.carousel",H="."+j,R=".data-api",x=g.fn[L],F={interval:5e3,keyboard:!0,slide:!1,pause:"hover",wrap:!0,touch:!0},U={interval:"(number|boolean)",keyboard:"boolean",slide:"(boolean|string)",pause:"(string|boolean)",wrap:"boolean",touch:"boolean"},W="next",q="prev",M="left",K="right",Q={SLIDE:"slide"+H,SLID:"slid"+H,KEYDOWN:"keydown"+H,MOUSEENTER:"mouseenter"+H,MOUSELEAVE:"mouseleave"+H,TOUCHSTART:"touchstart"+H,TOUCHMOVE:"touchmove"+H,TOUCHEND:"touchend"+H,POINTERDOWN:"pointerdown"+H,POINTERUP:"pointerup"+H,DRAG_START:"dragstart"+H,LOAD_DATA_API:"load"+H+R,CLICK_DATA_API:"click"+H+R},B="carousel",V="active",Y="slide",z="carousel-item-right",X="carousel-item-left",$="carousel-item-next",G="carousel-item-prev",J="pointer-event",Z=".active",tt=".active.carousel-item",et=".carousel-item",nt=".carousel-item img",it=".carousel-item-next, .carousel-item-prev",ot=".carousel-indicators",rt="[data-slide], [data-slide-to]",st='[data-ride="carousel"]',at={TOUCH:"touch",PEN:"pen"},lt=function(){function r(t,e){this._items=null,this._interval=null,this._activeElement=null,this._isPaused=!1,this._isSliding=!1,this.touchTimeout=null,this.touchStartX=0,this.touchDeltaX=0,this._config=this._getConfig(e),this._element=t,this._indicatorsElement=this._element.querySelector(ot),this._touchSupported="ontouchstart"in document.documentElement||0<navigator.maxTouchPoints,this._pointerEvent=Boolean(window.PointerEvent||window.MSPointerEvent),this._addEventListeners()}var t=r.prototype;return t.next=function(){this._isSliding||this._slide(W)},t.nextWhenVisible=function(){!document.hidden&&g(this._element).is(":visible")&&"hidden"!==g(this._element).css("visibility")&&this.next()},t.prev=function(){this._isSliding||this._slide(q)},t.pause=function(t){t||(this._isPaused=!0),this._element.querySelector(it)&&(_.triggerTransitionEnd(this._element),this.cycle(!0)),clearInterval(this._interval),this._interval=null},t.cycle=function(t){t||(this._isPaused=!1),this._interval&&(clearInterval(this._interval),this._interval=null),this._config.interval&&!this._isPaused&&(this._interval=setInterval((document.visibilityState?this.nextWhenVisible:this.next).bind(this),this._config.interval))},t.to=function(t){var e=this;this._activeElement=this._element.querySelector(tt);var n=this._getItemIndex(this._activeElement);if(!(t>this._items.length-1||t<0))if(this._isSliding)g(this._element).one(Q.SLID,function(){return e.to(t)});else{if(n===t)return this.pause(),void this.cycle();var i=n<t?W:q;this._slide(i,this._items[t])}},t.dispose=function(){g(this._element).off(H),g.removeData(this._element,j),this._items=null,this._config=null,this._element=null,this._interval=null,this._isPaused=null,this._isSliding=null,this._activeElement=null,this._indicatorsElement=null},t._getConfig=function(t){return t=l({},F,t),_.typeCheckConfig(L,t,U),t},t._handleSwipe=function(){var t=Math.abs(this.touchDeltaX);if(!(t<=40)){var e=t/this.touchDeltaX;0<e&&this.prev(),e<0&&this.next()}},t._addEventListeners=function(){var e=this;this._config.keyboard&&g(this._element).on(Q.KEYDOWN,function(t){return e._keydown(t)}),"hover"===this._config.pause&&g(this._element).on(Q.MOUSEENTER,function(t){return e.pause(t)}).on(Q.MOUSELEAVE,function(t){return e.cycle(t)}),this._config.touch&&this._addTouchEventListeners()},t._addTouchEventListeners=function(){var n=this;if(this._touchSupported){var e=function(t){n._pointerEvent&&at[t.originalEvent.pointerType.toUpperCase()]?n.touchStartX=t.originalEvent.clientX:n._pointerEvent||(n.touchStartX=t.originalEvent.touches[0].clientX)},i=function(t){n._pointerEvent&&at[t.originalEvent.pointerType.toUpperCase()]&&(n.touchDeltaX=t.originalEvent.clientX-n.touchStartX),n._handleSwipe(),"hover"===n._config.pause&&(n.pause(),n.touchTimeout&&clearTimeout(n.touchTimeout),n.touchTimeout=setTimeout(function(t){return n.cycle(t)},500+n._config.interval))};g(this._element.querySelectorAll(nt)).on(Q.DRAG_START,function(t){return t.preventDefault()}),this._pointerEvent?(g(this._element).on(Q.POINTERDOWN,function(t){return e(t)}),g(this._element).on(Q.POINTERUP,function(t){return i(t)}),this._element.classList.add(J)):(g(this._element).on(Q.TOUCHSTART,function(t){return e(t)}),g(this._element).on(Q.TOUCHMOVE,function(t){var e;(e=t).originalEvent.touches&&1<e.originalEvent.touches.length?n.touchDeltaX=0:n.touchDeltaX=e.originalEvent.touches[0].clientX-n.touchStartX}),g(this._element).on(Q.TOUCHEND,function(t){return i(t)}))}},t._keydown=function(t){if(!/input|textarea/i.test(t.target.tagName))switch(t.which){case 37:t.preventDefault(),this.prev();break;case 39:t.preventDefault(),this.next()}},t._getItemIndex=function(t){return this._items=t&&t.parentNode?[].slice.call(t.parentNode.querySelectorAll(et)):[],this._items.indexOf(t)},t._getItemByDirection=function(t,e){var n=t===W,i=t===q,o=this._getItemIndex(e),r=this._items.length-1;if((i&&0===o||n&&o===r)&&!this._config.wrap)return e;var s=(o+(t===q?-1:1))%this._items.length;return-1===s?this._items[this._items.length-1]:this._items[s]},t._triggerSlideEvent=function(t,e){var n=this._getItemIndex(t),i=this._getItemIndex(this._element.querySelector(tt)),o=g.Event(Q.SLIDE,{relatedTarget:t,direction:e,from:i,to:n});return g(this._element).trigger(o),o},t._setActiveIndicatorElement=function(t){if(this._indicatorsElement){var e=[].slice.call(this._indicatorsElement.querySelectorAll(Z));g(e).removeClass(V);var n=this._indicatorsElement.children[this._getItemIndex(t)];n&&g(n).addClass(V)}},t._slide=function(t,e){var n,i,o,r=this,s=this._element.querySelector(tt),a=this._getItemIndex(s),l=e||s&&this._getItemByDirection(t,s),c=this._getItemIndex(l),h=Boolean(this._interval);if(o=t===W?(n=X,i=$,M):(n=z,i=G,K),l&&g(l).hasClass(V))this._isSliding=!1;else if(!this._triggerSlideEvent(l,o).isDefaultPrevented()&&s&&l){this._isSliding=!0,h&&this.pause(),this._setActiveIndicatorElement(l);var u=g.Event(Q.SLID,{relatedTarget:l,direction:o,from:a,to:c});if(g(this._element).hasClass(Y)){g(l).addClass(i),_.reflow(l),g(s).addClass(n),g(l).addClass(n);var f=parseInt(l.getAttribute("data-interval"),10);this._config.interval=f?(this._config.defaultInterval=this._config.defaultInterval||this._config.interval,f):this._config.defaultInterval||this._config.interval;var d=_.getTransitionDurationFromElement(s);g(s).one(_.TRANSITION_END,function(){g(l).removeClass(n+" "+i).addClass(V),g(s).removeClass(V+" "+i+" "+n),r._isSliding=!1,setTimeout(function(){return g(r._element).trigger(u)},0)}).emulateTransitionEnd(d)}else g(s).removeClass(V),g(l).addClass(V),this._isSliding=!1,g(this._element).trigger(u);h&&this.cycle()}},r._jQueryInterface=function(i){return this.each(function(){var t=g(this).data(j),e=l({},F,g(this).data());"object"==typeof i&&(e=l({},e,i));var n="string"==typeof i?i:e.slide;if(t||(t=new r(this,e),g(this).data(j,t)),"number"==typeof i)t.to(i);else if("string"==typeof n){if("undefined"==typeof t[n])throw new TypeError('No method named "'+n+'"');t[n]()}else e.interval&&e.ride&&(t.pause(),t.cycle())})},r._dataApiClickHandler=function(t){var e=_.getSelectorFromElement(this);if(e){var n=g(e)[0];if(n&&g(n).hasClass(B)){var i=l({},g(n).data(),g(this).data()),o=this.getAttribute("data-slide-to");o&&(i.interval=!1),r._jQueryInterface.call(g(n),i),o&&g(n).data(j).to(o),t.preventDefault()}}},s(r,null,[{key:"VERSION",get:function(){return"4.3.1"}},{key:"Default",get:function(){return F}}]),r}();g(document).on(Q.CLICK_DATA_API,rt,lt._dataApiClickHandler),g(window).on(Q.LOAD_DATA_API,function(){for(var t=[].slice.call(document.querySelectorAll(st)),e=0,n=t.length;e<n;e++){var i=g(t[e]);lt._jQueryInterface.call(i,i.data())}}),g.fn[L]=lt._jQueryInterface,g.fn[L].Constructor=lt,g.fn[L].noConflict=function(){return g.fn[L]=x,lt._jQueryInterface};var ct="collapse",ht="bs.collapse",ut="."+ht,ft=g.fn[ct],dt={toggle:!0,parent:""},gt={toggle:"boolean",parent:"(string|element)"},_t={SHOW:"show"+ut,SHOWN:"shown"+ut,HIDE:"hide"+ut,HIDDEN:"hidden"+ut,CLICK_DATA_API:"click"+ut+".data-api"},mt="show",pt="collapse",vt="collapsing",yt="collapsed",Et="width",Ct="height",Tt=".show, .collapsing",St='[data-toggle="collapse"]',bt=function(){function a(e,t){this._isTransitioning=!1,this._element=e,this._config=this._getConfig(t),this._triggerArray=[].slice.call(document.querySelectorAll('[data-toggle="collapse"][href="#'+e.id+'"],[data-toggle="collapse"][data-target="#'+e.id+'"]'));for(var n=[].slice.call(document.querySelectorAll(St)),i=0,o=n.length;i<o;i++){var r=n[i],s=_.getSelectorFromElement(r),a=[].slice.call(document.querySelectorAll(s)).filter(function(t){return t===e});null!==s&&0<a.length&&(this._selector=s,this._triggerArray.push(r))}this._parent=this._config.parent?this._getParent():null,this._config.parent||this._addAriaAndCollapsedClass(this._element,this._triggerArray),this._config.toggle&&this.toggle()}var t=a.prototype;return t.toggle=function(){g(this._element).hasClass(mt)?this.hide():this.show()},t.show=function(){var t,e,n=this;if(!this._isTransitioning&&!g(this._element).hasClass(mt)&&(this._parent&&0===(t=[].slice.call(this._parent.querySelectorAll(Tt)).filter(function(t){return"string"==typeof n._config.parent?t.getAttribute("data-parent")===n._config.parent:t.classList.contains(pt)})).length&&(t=null),!(t&&(e=g(t).not(this._selector).data(ht))&&e._isTransitioning))){var i=g.Event(_t.SHOW);if(g(this._element).trigger(i),!i.isDefaultPrevented()){t&&(a._jQueryInterface.call(g(t).not(this._selector),"hide"),e||g(t).data(ht,null));var o=this._getDimension();g(this._element).removeClass(pt).addClass(vt),this._element.style[o]=0,this._triggerArray.length&&g(this._triggerArray).removeClass(yt).attr("aria-expanded",!0),this.setTransitioning(!0);var r="scroll"+(o[0].toUpperCase()+o.slice(1)),s=_.getTransitionDurationFromElement(this._element);g(this._element).one(_.TRANSITION_END,function(){g(n._element).removeClass(vt).addClass(pt).addClass(mt),n._element.style[o]="",n.setTransitioning(!1),g(n._element).trigger(_t.SHOWN)}).emulateTransitionEnd(s),this._element.style[o]=this._element[r]+"px"}}},t.hide=function(){var t=this;if(!this._isTransitioning&&g(this._element).hasClass(mt)){var e=g.Event(_t.HIDE);if(g(this._element).trigger(e),!e.isDefaultPrevented()){var n=this._getDimension();this._element.style[n]=this._element.getBoundingClientRect()[n]+"px",_.reflow(this._element),g(this._element).addClass(vt).removeClass(pt).removeClass(mt);var i=this._triggerArray.length;if(0<i)for(var o=0;o<i;o++){var r=this._triggerArray[o],s=_.getSelectorFromElement(r);if(null!==s)g([].slice.call(document.querySelectorAll(s))).hasClass(mt)||g(r).addClass(yt).attr("aria-expanded",!1)}this.setTransitioning(!0);this._element.style[n]="";var a=_.getTransitionDurationFromElement(this._element);g(this._element).one(_.TRANSITION_END,function(){t.setTransitioning(!1),g(t._element).removeClass(vt).addClass(pt).trigger(_t.HIDDEN)}).emulateTransitionEnd(a)}}},t.setTransitioning=function(t){this._isTransitioning=t},t.dispose=function(){g.removeData(this._element,ht),this._config=null,this._parent=null,this._element=null,this._triggerArray=null,this._isTransitioning=null},t._getConfig=function(t){return(t=l({},dt,t)).toggle=Boolean(t.toggle),_.typeCheckConfig(ct,t,gt),t},t._getDimension=function(){return g(this._element).hasClass(Et)?Et:Ct},t._getParent=function(){var t,n=this;_.isElement(this._config.parent)?(t=this._config.parent,"undefined"!=typeof this._config.parent.jquery&&(t=this._config.parent[0])):t=document.querySelector(this._config.parent);var e='[data-toggle="collapse"][data-parent="'+this._config.parent+'"]',i=[].slice.call(t.querySelectorAll(e));return g(i).each(function(t,e){n._addAriaAndCollapsedClass(a._getTargetFromElement(e),[e])}),t},t._addAriaAndCollapsedClass=function(t,e){var n=g(t).hasClass(mt);e.length&&g(e).toggleClass(yt,!n).attr("aria-expanded",n)},a._getTargetFromElement=function(t){var e=_.getSelectorFromElement(t);return e?document.querySelector(e):null},a._jQueryInterface=function(i){return this.each(function(){var t=g(this),e=t.data(ht),n=l({},dt,t.data(),"object"==typeof i&&i?i:{});if(!e&&n.toggle&&/show|hide/.test(i)&&(n.toggle=!1),e||(e=new a(this,n),t.data(ht,e)),"string"==typeof i){if("undefined"==typeof e[i])throw new TypeError('No method named "'+i+'"');e[i]()}})},s(a,null,[{key:"VERSION",get:function(){return"4.3.1"}},{key:"Default",get:function(){return dt}}]),a}();g(document).on(_t.CLICK_DATA_API,St,function(t){"A"===t.currentTarget.tagName&&t.preventDefault();var n=g(this),e=_.getSelectorFromElement(this),i=[].slice.call(document.querySelectorAll(e));g(i).each(function(){var t=g(this),e=t.data(ht)?"toggle":n.data();bt._jQueryInterface.call(t,e)})}),g.fn[ct]=bt._jQueryInterface,g.fn[ct].Constructor=bt,g.fn[ct].noConflict=function(){return g.fn[ct]=ft,bt._jQueryInterface};var It="dropdown",Dt="bs.dropdown",wt="."+Dt,At=".data-api",Nt=g.fn[It],Ot=new RegExp("38|40|27"),kt={HIDE:"hide"+wt,HIDDEN:"hidden"+wt,SHOW:"show"+wt,SHOWN:"shown"+wt,CLICK:"click"+wt,CLICK_DATA_API:"click"+wt+At,KEYDOWN_DATA_API:"keydown"+wt+At,KEYUP_DATA_API:"keyup"+wt+At},Pt="disabled",Lt="show",jt="dropup",Ht="dropright",Rt="dropleft",xt="dropdown-menu-right",Ft="position-static",Ut='[data-toggle="dropdown"]',Wt=".dropdown form",qt=".dropdown-menu",Mt=".navbar-nav",Kt=".dropdown-menu .dropdown-item:not(.disabled):not(:disabled)",Qt="top-start",Bt="top-end",Vt="bottom-start",Yt="bottom-end",zt="right-start",Xt="left-start",$t={offset:0,flip:!0,boundary:"scrollParent",reference:"toggle",display:"dynamic"},Gt={offset:"(number|string|function)",flip:"boolean",boundary:"(string|element)",reference:"(string|element)",display:"string"},Jt=function(){function c(t,e){this._element=t,this._popper=null,this._config=this._getConfig(e),this._menu=this._getMenuElement(),this._inNavbar=this._detectNavbar(),this._addEventListeners()}var t=c.prototype;return t.toggle=function(){if(!this._element.disabled&&!g(this._element).hasClass(Pt)){var t=c._getParentFromElement(this._element),e=g(this._menu).hasClass(Lt);if(c._clearMenus(),!e){var n={relatedTarget:this._element},i=g.Event(kt.SHOW,n);if(g(t).trigger(i),!i.isDefaultPrevented()){if(!this._inNavbar){if("undefined"==typeof u)throw new TypeError("Bootstrap's dropdowns require Popper.js (https://popper.js.org/)");var o=this._element;"parent"===this._config.reference?o=t:_.isElement(this._config.reference)&&(o=this._config.reference,"undefined"!=typeof this._config.reference.jquery&&(o=this._config.reference[0])),"scrollParent"!==this._config.boundary&&g(t).addClass(Ft),this._popper=new u(o,this._menu,this._getPopperConfig())}"ontouchstart"in document.documentElement&&0===g(t).closest(Mt).length&&g(document.body).children().on("mouseover",null,g.noop),this._element.focus(),this._element.setAttribute("aria-expanded",!0),g(this._menu).toggleClass(Lt),g(t).toggleClass(Lt).trigger(g.Event(kt.SHOWN,n))}}}},t.show=function(){if(!(this._element.disabled||g(this._element).hasClass(Pt)||g(this._menu).hasClass(Lt))){var t={relatedTarget:this._element},e=g.Event(kt.SHOW,t),n=c._getParentFromElement(this._element);g(n).trigger(e),e.isDefaultPrevented()||(g(this._menu).toggleClass(Lt),g(n).toggleClass(Lt).trigger(g.Event(kt.SHOWN,t)))}},t.hide=function(){if(!this._element.disabled&&!g(this._element).hasClass(Pt)&&g(this._menu).hasClass(Lt)){var t={relatedTarget:this._element},e=g.Event(kt.HIDE,t),n=c._getParentFromElement(this._element);g(n).trigger(e),e.isDefaultPrevented()||(g(this._menu).toggleClass(Lt),g(n).toggleClass(Lt).trigger(g.Event(kt.HIDDEN,t)))}},t.dispose=function(){g.removeData(this._element,Dt),g(this._element).off(wt),this._element=null,(this._menu=null)!==this._popper&&(this._popper.destroy(),this._popper=null)},t.update=function(){this._inNavbar=this._detectNavbar(),null!==this._popper&&this._popper.scheduleUpdate()},t._addEventListeners=function(){var e=this;g(this._element).on(kt.CLICK,function(t){t.preventDefault(),t.stopPropagation(),e.toggle()})},t._getConfig=function(t){return t=l({},this.constructor.Default,g(this._element).data(),t),_.typeCheckConfig(It,t,this.constructor.DefaultType),t},t._getMenuElement=function(){if(!this._menu){var t=c._getParentFromElement(this._element);t&&(this._menu=t.querySelector(qt))}return this._menu},t._getPlacement=function(){var t=g(this._element.parentNode),e=Vt;return t.hasClass(jt)?(e=Qt,g(this._menu).hasClass(xt)&&(e=Bt)):t.hasClass(Ht)?e=zt:t.hasClass(Rt)?e=Xt:g(this._menu).hasClass(xt)&&(e=Yt),e},t._detectNavbar=function(){return 0<g(this._element).closest(".navbar").length},t._getOffset=function(){var e=this,t={};return"function"==typeof this._config.offset?t.fn=function(t){return t.offsets=l({},t.offsets,e._config.offset(t.offsets,e._element)||{}),t}:t.offset=this._config.offset,t},t._getPopperConfig=function(){var t={placement:this._getPlacement(),modifiers:{offset:this._getOffset(),flip:{enabled:this._config.flip},preventOverflow:{boundariesElement:this._config.boundary}}};return"static"===this._config.display&&(t.modifiers.applyStyle={enabled:!1}),t},c._jQueryInterface=function(e){return this.each(function(){var t=g(this).data(Dt);if(t||(t=new c(this,"object"==typeof e?e:null),g(this).data(Dt,t)),"string"==typeof e){if("undefined"==typeof t[e])throw new TypeError('No method named "'+e+'"');t[e]()}})},c._clearMenus=function(t){if(!t||3!==t.which&&("keyup"!==t.type||9===t.which))for(var e=[].slice.call(document.querySelectorAll(Ut)),n=0,i=e.length;n<i;n++){var o=c._getParentFromElement(e[n]),r=g(e[n]).data(Dt),s={relatedTarget:e[n]};if(t&&"click"===t.type&&(s.clickEvent=t),r){var a=r._menu;if(g(o).hasClass(Lt)&&!(t&&("click"===t.type&&/input|textarea/i.test(t.target.tagName)||"keyup"===t.type&&9===t.which)&&g.contains(o,t.target))){var l=g.Event(kt.HIDE,s);g(o).trigger(l),l.isDefaultPrevented()||("ontouchstart"in document.documentElement&&g(document.body).children().off("mouseover",null,g.noop),e[n].setAttribute("aria-expanded","false"),g(a).removeClass(Lt),g(o).removeClass(Lt).trigger(g.Event(kt.HIDDEN,s)))}}}},c._getParentFromElement=function(t){var e,n=_.getSelectorFromElement(t);return n&&(e=document.querySelector(n)),e||t.parentNode},c._dataApiKeydownHandler=function(t){if((/input|textarea/i.test(t.target.tagName)?!(32===t.which||27!==t.which&&(40!==t.which&&38!==t.which||g(t.target).closest(qt).length)):Ot.test(t.which))&&(t.preventDefault(),t.stopPropagation(),!this.disabled&&!g(this).hasClass(Pt))){var e=c._getParentFromElement(this),n=g(e).hasClass(Lt);if(n&&(!n||27!==t.which&&32!==t.which)){var i=[].slice.call(e.querySelectorAll(Kt));if(0!==i.length){var o=i.indexOf(t.target);38===t.which&&0<o&&o--,40===t.which&&o<i.length-1&&o++,o<0&&(o=0),i[o].focus()}}else{if(27===t.which){var r=e.querySelector(Ut);g(r).trigger("focus")}g(this).trigger("click")}}},s(c,null,[{key:"VERSION",get:function(){return"4.3.1"}},{key:"Default",get:function(){return $t}},{key:"DefaultType",get:function(){return Gt}}]),c}();g(document).on(kt.KEYDOWN_DATA_API,Ut,Jt._dataApiKeydownHandler).on(kt.KEYDOWN_DATA_API,qt,Jt._dataApiKeydownHandler).on(kt.CLICK_DATA_API+" "+kt.KEYUP_DATA_API,Jt._clearMenus).on(kt.CLICK_DATA_API,Ut,function(t){t.preventDefault(),t.stopPropagation(),Jt._jQueryInterface.call(g(this),"toggle")}).on(kt.CLICK_DATA_API,Wt,function(t){t.stopPropagation()}),g.fn[It]=Jt._jQueryInterface,g.fn[It].Constructor=Jt,g.fn[It].noConflict=function(){return g.fn[It]=Nt,Jt._jQueryInterface};var Zt="modal",te="bs.modal",ee="."+te,ne=g.fn[Zt],ie={backdrop:!0,keyboard:!0,focus:!0,show:!0},oe={backdrop:"(boolean|string)",keyboard:"boolean",focus:"boolean",show:"boolean"},re={HIDE:"hide"+ee,HIDDEN:"hidden"+ee,SHOW:"show"+ee,SHOWN:"shown"+ee,FOCUSIN:"focusin"+ee,RESIZE:"resize"+ee,CLICK_DISMISS:"click.dismiss"+ee,KEYDOWN_DISMISS:"keydown.dismiss"+ee,MOUSEUP_DISMISS:"mouseup.dismiss"+ee,MOUSEDOWN_DISMISS:"mousedown.dismiss"+ee,CLICK_DATA_API:"click"+ee+".data-api"},se="modal-dialog-scrollable",ae="modal-scrollbar-measure",le="modal-backdrop",ce="modal-open",he="fade",ue="show",fe=".modal-dialog",de=".modal-body",ge='[data-toggle="modal"]',_e='[data-dismiss="modal"]',me=".fixed-top, .fixed-bottom, .is-fixed, .sticky-top",pe=".sticky-top",ve=function(){function o(t,e){this._config=this._getConfig(e),this._element=t,this._dialog=t.querySelector(fe),this._backdrop=null,this._isShown=!1,this._isBodyOverflowing=!1,this._ignoreBackdropClick=!1,this._isTransitioning=!1,this._scrollbarWidth=0}var t=o.prototype;return t.toggle=function(t){return this._isShown?this.hide():this.show(t)},t.show=function(t){var e=this;if(!this._isShown&&!this._isTransitioning){g(this._element).hasClass(he)&&(this._isTransitioning=!0);var n=g.Event(re.SHOW,{relatedTarget:t});g(this._element).trigger(n),this._isShown||n.isDefaultPrevented()||(this._isShown=!0,this._checkScrollbar(),this._setScrollbar(),this._adjustDialog(),this._setEscapeEvent(),this._setResizeEvent(),g(this._element).on(re.CLICK_DISMISS,_e,function(t){return e.hide(t)}),g(this._dialog).on(re.MOUSEDOWN_DISMISS,function(){g(e._element).one(re.MOUSEUP_DISMISS,function(t){g(t.target).is(e._element)&&(e._ignoreBackdropClick=!0)})}),this._showBackdrop(function(){return e._showElement(t)}))}},t.hide=function(t){var e=this;if(t&&t.preventDefault(),this._isShown&&!this._isTransitioning){var n=g.Event(re.HIDE);if(g(this._element).trigger(n),this._isShown&&!n.isDefaultPrevented()){this._isShown=!1;var i=g(this._element).hasClass(he);if(i&&(this._isTransitioning=!0),this._setEscapeEvent(),this._setResizeEvent(),g(document).off(re.FOCUSIN),g(this._element).removeClass(ue),g(this._element).off(re.CLICK_DISMISS),g(this._dialog).off(re.MOUSEDOWN_DISMISS),i){var o=_.getTransitionDurationFromElement(this._element);g(this._element).one(_.TRANSITION_END,function(t){return e._hideModal(t)}).emulateTransitionEnd(o)}else this._hideModal()}}},t.dispose=function(){[window,this._element,this._dialog].forEach(function(t){return g(t).off(ee)}),g(document).off(re.FOCUSIN),g.removeData(this._element,te),this._config=null,this._element=null,this._dialog=null,this._backdrop=null,this._isShown=null,this._isBodyOverflowing=null,this._ignoreBackdropClick=null,this._isTransitioning=null,this._scrollbarWidth=null},t.handleUpdate=function(){this._adjustDialog()},t._getConfig=function(t){return t=l({},ie,t),_.typeCheckConfig(Zt,t,oe),t},t._showElement=function(t){var e=this,n=g(this._element).hasClass(he);this._element.parentNode&&this._element.parentNode.nodeType===Node.ELEMENT_NODE||document.body.appendChild(this._element),this._element.style.display="block",this._element.removeAttribute("aria-hidden"),this._element.setAttribute("aria-modal",!0),g(this._dialog).hasClass(se)?this._dialog.querySelector(de).scrollTop=0:this._element.scrollTop=0,n&&_.reflow(this._element),g(this._element).addClass(ue),this._config.focus&&this._enforceFocus();var i=g.Event(re.SHOWN,{relatedTarget:t}),o=function(){e._config.focus&&e._element.focus(),e._isTransitioning=!1,g(e._element).trigger(i)};if(n){var r=_.getTransitionDurationFromElement(this._dialog);g(this._dialog).one(_.TRANSITION_END,o).emulateTransitionEnd(r)}else o()},t._enforceFocus=function(){var e=this;g(document).off(re.FOCUSIN).on(re.FOCUSIN,function(t){document!==t.target&&e._element!==t.target&&0===g(e._element).has(t.target).length&&e._element.focus()})},t._setEscapeEvent=function(){var e=this;this._isShown&&this._config.keyboard?g(this._element).on(re.KEYDOWN_DISMISS,function(t){27===t.which&&(t.preventDefault(),e.hide())}):this._isShown||g(this._element).off(re.KEYDOWN_DISMISS)},t._setResizeEvent=function(){var e=this;this._isShown?g(window).on(re.RESIZE,function(t){return e.handleUpdate(t)}):g(window).off(re.RESIZE)},t._hideModal=function(){var t=this;this._element.style.display="none",this._element.setAttribute("aria-hidden",!0),this._element.removeAttribute("aria-modal"),this._isTransitioning=!1,this._showBackdrop(function(){g(document.body).removeClass(ce),t._resetAdjustments(),t._resetScrollbar(),g(t._element).trigger(re.HIDDEN)})},t._removeBackdrop=function(){this._backdrop&&(g(this._backdrop).remove(),this._backdrop=null)},t._showBackdrop=function(t){var e=this,n=g(this._element).hasClass(he)?he:"";if(this._isShown&&this._config.backdrop){if(this._backdrop=document.createElement("div"),this._backdrop.className=le,n&&this._backdrop.classList.add(n),g(this._backdrop).appendTo(document.body),g(this._element).on(re.CLICK_DISMISS,function(t){e._ignoreBackdropClick?e._ignoreBackdropClick=!1:t.target===t.currentTarget&&("static"===e._config.backdrop?e._element.focus():e.hide())}),n&&_.reflow(this._backdrop),g(this._backdrop).addClass(ue),!t)return;if(!n)return void t();var i=_.getTransitionDurationFromElement(this._backdrop);g(this._backdrop).one(_.TRANSITION_END,t).emulateTransitionEnd(i)}else if(!this._isShown&&this._backdrop){g(this._backdrop).removeClass(ue);var o=function(){e._removeBackdrop(),t&&t()};if(g(this._element).hasClass(he)){var r=_.getTransitionDurationFromElement(this._backdrop);g(this._backdrop).one(_.TRANSITION_END,o).emulateTransitionEnd(r)}else o()}else t&&t()},t._adjustDialog=function(){var t=this._element.scrollHeight>document.documentElement.clientHeight;!this._isBodyOverflowing&&t&&(this._element.style.paddingLeft=this._scrollbarWidth+"px"),this._isBodyOverflowing&&!t&&(this._element.style.paddingRight=this._scrollbarWidth+"px")},t._resetAdjustments=function(){this._element.style.paddingLeft="",this._element.style.paddingRight=""},t._checkScrollbar=function(){var t=document.body.getBoundingClientRect();this._isBodyOverflowing=t.left+t.right<window.innerWidth,this._scrollbarWidth=this._getScrollbarWidth()},t._setScrollbar=function(){var o=this;if(this._isBodyOverflowing){var t=[].slice.call(document.querySelectorAll(me)),e=[].slice.call(document.querySelectorAll(pe));g(t).each(function(t,e){var n=e.style.paddingRight,i=g(e).css("padding-right");g(e).data("padding-right",n).css("padding-right",parseFloat(i)+o._scrollbarWidth+"px")}),g(e).each(function(t,e){var n=e.style.marginRight,i=g(e).css("margin-right");g(e).data("margin-right",n).css("margin-right",parseFloat(i)-o._scrollbarWidth+"px")});var n=document.body.style.paddingRight,i=g(document.body).css("padding-right");g(document.body).data("padding-right",n).css("padding-right",parseFloat(i)+this._scrollbarWidth+"px")}g(document.body).addClass(ce)},t._resetScrollbar=function(){var t=[].slice.call(document.querySelectorAll(me));g(t).each(function(t,e){var n=g(e).data("padding-right");g(e).removeData("padding-right"),e.style.paddingRight=n||""});var e=[].slice.call(document.querySelectorAll(""+pe));g(e).each(function(t,e){var n=g(e).data("margin-right");"undefined"!=typeof n&&g(e).css("margin-right",n).removeData("margin-right")});var n=g(document.body).data("padding-right");g(document.body).removeData("padding-right"),document.body.style.paddingRight=n||""},t._getScrollbarWidth=function(){var t=document.createElement("div");t.className=ae,document.body.appendChild(t);var e=t.getBoundingClientRect().width-t.clientWidth;return document.body.removeChild(t),e},o._jQueryInterface=function(n,i){return this.each(function(){var t=g(this).data(te),e=l({},ie,g(this).data(),"object"==typeof n&&n?n:{});if(t||(t=new o(this,e),g(this).data(te,t)),"string"==typeof n){if("undefined"==typeof t[n])throw new TypeError('No method named "'+n+'"');t[n](i)}else e.show&&t.show(i)})},s(o,null,[{key:"VERSION",get:function(){return"4.3.1"}},{key:"Default",get:function(){return ie}}]),o}();g(document).on(re.CLICK_DATA_API,ge,function(t){var e,n=this,i=_.getSelectorFromElement(this);i&&(e=document.querySelector(i));var o=g(e).data(te)?"toggle":l({},g(e).data(),g(this).data());"A"!==this.tagName&&"AREA"!==this.tagName||t.preventDefault();var r=g(e).one(re.SHOW,function(t){t.isDefaultPrevented()||r.one(re.HIDDEN,function(){g(n).is(":visible")&&n.focus()})});ve._jQueryInterface.call(g(e),o,this)}),g.fn[Zt]=ve._jQueryInterface,g.fn[Zt].Constructor=ve,g.fn[Zt].noConflict=function(){return g.fn[Zt]=ne,ve._jQueryInterface};var ye=["background","cite","href","itemtype","longdesc","poster","src","xlink:href"],Ee={"*":["class","dir","id","lang","role",/^aria-[\w-]*$/i],a:["target","href","title","rel"],area:[],b:[],br:[],col:[],code:[],div:[],em:[],hr:[],h1:[],h2:[],h3:[],h4:[],h5:[],h6:[],i:[],img:["src","alt","title","width","height"],li:[],ol:[],p:[],pre:[],s:[],small:[],span:[],sub:[],sup:[],strong:[],u:[],ul:[]},Ce=/^(?:(?:https?|mailto|ftp|tel|file):|[^&:/?#]*(?:[/?#]|$))/gi,Te=/^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[a-z0-9+/]+=*$/i;function Se(t,s,e){if(0===t.length)return t;if(e&&"function"==typeof e)return e(t);for(var n=(new window.DOMParser).parseFromString(t,"text/html"),a=Object.keys(s),l=[].slice.call(n.body.querySelectorAll("*")),i=function(t,e){var n=l[t],i=n.nodeName.toLowerCase();if(-1===a.indexOf(n.nodeName.toLowerCase()))return n.parentNode.removeChild(n),"continue";var o=[].slice.call(n.attributes),r=[].concat(s["*"]||[],s[i]||[]);o.forEach(function(t){(function(t,e){var n=t.nodeName.toLowerCase();if(-1!==e.indexOf(n))return-1===ye.indexOf(n)||Boolean(t.nodeValue.match(Ce)||t.nodeValue.match(Te));for(var i=e.filter(function(t){return t instanceof RegExp}),o=0,r=i.length;o<r;o++)if(n.match(i[o]))return!0;return!1})(t,r)||n.removeAttribute(t.nodeName)})},o=0,r=l.length;o<r;o++)i(o);return n.body.innerHTML}var be="tooltip",Ie="bs.tooltip",De="."+Ie,we=g.fn[be],Ae="bs-tooltip",Ne=new RegExp("(^|\\s)"+Ae+"\\S+","g"),Oe=["sanitize","whiteList","sanitizeFn"],ke={animation:"boolean",template:"string",title:"(string|element|function)",trigger:"string",delay:"(number|object)",html:"boolean",selector:"(string|boolean)",placement:"(string|function)",offset:"(number|string|function)",container:"(string|element|boolean)",fallbackPlacement:"(string|array)",boundary:"(string|element)",sanitize:"boolean",sanitizeFn:"(null|function)",whiteList:"object"},Pe={AUTO:"auto",TOP:"top",RIGHT:"right",BOTTOM:"bottom",LEFT:"left"},Le={animation:!0,template:'<div class="tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,selector:!1,placement:"top",offset:0,container:!1,fallbackPlacement:"flip",boundary:"scrollParent",sanitize:!0,sanitizeFn:null,whiteList:Ee},je="show",He="out",Re={HIDE:"hide"+De,HIDDEN:"hidden"+De,SHOW:"show"+De,SHOWN:"shown"+De,INSERTED:"inserted"+De,CLICK:"click"+De,FOCUSIN:"focusin"+De,FOCUSOUT:"focusout"+De,MOUSEENTER:"mouseenter"+De,MOUSELEAVE:"mouseleave"+De},xe="fade",Fe="show",Ue=".tooltip-inner",We=".arrow",qe="hover",Me="focus",Ke="click",Qe="manual",Be=function(){function i(t,e){if("undefined"==typeof u)throw new TypeError("Bootstrap's tooltips require Popper.js (https://popper.js.org/)");this._isEnabled=!0,this._timeout=0,this._hoverState="",this._activeTrigger={},this._popper=null,this.element=t,this.config=this._getConfig(e),this.tip=null,this._setListeners()}var t=i.prototype;return t.enable=function(){this._isEnabled=!0},t.disable=function(){this._isEnabled=!1},t.toggleEnabled=function(){this._isEnabled=!this._isEnabled},t.toggle=function(t){if(this._isEnabled)if(t){var e=this.constructor.DATA_KEY,n=g(t.currentTarget).data(e);n||(n=new this.constructor(t.currentTarget,this._getDelegateConfig()),g(t.currentTarget).data(e,n)),n._activeTrigger.click=!n._activeTrigger.click,n._isWithActiveTrigger()?n._enter(null,n):n._leave(null,n)}else{if(g(this.getTipElement()).hasClass(Fe))return void this._leave(null,this);this._enter(null,this)}},t.dispose=function(){clearTimeout(this._timeout),g.removeData(this.element,this.constructor.DATA_KEY),g(this.element).off(this.constructor.EVENT_KEY),g(this.element).closest(".modal").off("hide.bs.modal"),this.tip&&g(this.tip).remove(),this._isEnabled=null,this._timeout=null,this._hoverState=null,(this._activeTrigger=null)!==this._popper&&this._popper.destroy(),this._popper=null,this.element=null,this.config=null,this.tip=null},t.show=function(){var e=this;if("none"===g(this.element).css("display"))throw new Error("Please use show on visible elements");var t=g.Event(this.constructor.Event.SHOW);if(this.isWithContent()&&this._isEnabled){g(this.element).trigger(t);var n=_.findShadowRoot(this.element),i=g.contains(null!==n?n:this.element.ownerDocument.documentElement,this.element);if(t.isDefaultPrevented()||!i)return;var o=this.getTipElement(),r=_.getUID(this.constructor.NAME);o.setAttribute("id",r),this.element.setAttribute("aria-describedby",r),this.setContent(),this.config.animation&&g(o).addClass(xe);var s="function"==typeof this.config.placement?this.config.placement.call(this,o,this.element):this.config.placement,a=this._getAttachment(s);this.addAttachmentClass(a);var l=this._getContainer();g(o).data(this.constructor.DATA_KEY,this),g.contains(this.element.ownerDocument.documentElement,this.tip)||g(o).appendTo(l),g(this.element).trigger(this.constructor.Event.INSERTED),this._popper=new u(this.element,o,{placement:a,modifiers:{offset:this._getOffset(),flip:{behavior:this.config.fallbackPlacement},arrow:{element:We},preventOverflow:{boundariesElement:this.config.boundary}},onCreate:function(t){t.originalPlacement!==t.placement&&e._handlePopperPlacementChange(t)},onUpdate:function(t){return e._handlePopperPlacementChange(t)}}),g(o).addClass(Fe),"ontouchstart"in document.documentElement&&g(document.body).children().on("mouseover",null,g.noop);var c=function(){e.config.animation&&e._fixTransition();var t=e._hoverState;e._hoverState=null,g(e.element).trigger(e.constructor.Event.SHOWN),t===He&&e._leave(null,e)};if(g(this.tip).hasClass(xe)){var h=_.getTransitionDurationFromElement(this.tip);g(this.tip).one(_.TRANSITION_END,c).emulateTransitionEnd(h)}else c()}},t.hide=function(t){var e=this,n=this.getTipElement(),i=g.Event(this.constructor.Event.HIDE),o=function(){e._hoverState!==je&&n.parentNode&&n.parentNode.removeChild(n),e._cleanTipClass(),e.element.removeAttribute("aria-describedby"),g(e.element).trigger(e.constructor.Event.HIDDEN),null!==e._popper&&e._popper.destroy(),t&&t()};if(g(this.element).trigger(i),!i.isDefaultPrevented()){if(g(n).removeClass(Fe),"ontouchstart"in document.documentElement&&g(document.body).children().off("mouseover",null,g.noop),this._activeTrigger[Ke]=!1,this._activeTrigger[Me]=!1,this._activeTrigger[qe]=!1,g(this.tip).hasClass(xe)){var r=_.getTransitionDurationFromElement(n);g(n).one(_.TRANSITION_END,o).emulateTransitionEnd(r)}else o();this._hoverState=""}},t.update=function(){null!==this._popper&&this._popper.scheduleUpdate()},t.isWithContent=function(){return Boolean(this.getTitle())},t.addAttachmentClass=function(t){g(this.getTipElement()).addClass(Ae+"-"+t)},t.getTipElement=function(){return this.tip=this.tip||g(this.config.template)[0],this.tip},t.setContent=function(){var t=this.getTipElement();this.setElementContent(g(t.querySelectorAll(Ue)),this.getTitle()),g(t).removeClass(xe+" "+Fe)},t.setElementContent=function(t,e){"object"!=typeof e||!e.nodeType&&!e.jquery?this.config.html?(this.config.sanitize&&(e=Se(e,this.config.whiteList,this.config.sanitizeFn)),t.html(e)):t.text(e):this.config.html?g(e).parent().is(t)||t.empty().append(e):t.text(g(e).text())},t.getTitle=function(){var t=this.element.getAttribute("data-original-title");return t||(t="function"==typeof this.config.title?this.config.title.call(this.element):this.config.title),t},t._getOffset=function(){var e=this,t={};return"function"==typeof this.config.offset?t.fn=function(t){return t.offsets=l({},t.offsets,e.config.offset(t.offsets,e.element)||{}),t}:t.offset=this.config.offset,t},t._getContainer=function(){return!1===this.config.container?document.body:_.isElement(this.config.container)?g(this.config.container):g(document).find(this.config.container)},t._getAttachment=function(t){return Pe[t.toUpperCase()]},t._setListeners=function(){var i=this;this.config.trigger.split(" ").forEach(function(t){if("click"===t)g(i.element).on(i.constructor.Event.CLICK,i.config.selector,function(t){return i.toggle(t)});else if(t!==Qe){var e=t===qe?i.constructor.Event.MOUSEENTER:i.constructor.Event.FOCUSIN,n=t===qe?i.constructor.Event.MOUSELEAVE:i.constructor.Event.FOCUSOUT;g(i.element).on(e,i.config.selector,function(t){return i._enter(t)}).on(n,i.config.selector,function(t){return i._leave(t)})}}),g(this.element).closest(".modal").on("hide.bs.modal",function(){i.element&&i.hide()}),this.config.selector?this.config=l({},this.config,{trigger:"manual",selector:""}):this._fixTitle()},t._fixTitle=function(){var t=typeof this.element.getAttribute("data-original-title");(this.element.getAttribute("title")||"string"!==t)&&(this.element.setAttribute("data-original-title",this.element.getAttribute("title")||""),this.element.setAttribute("title",""))},t._enter=function(t,e){var n=this.constructor.DATA_KEY;(e=e||g(t.currentTarget).data(n))||(e=new this.constructor(t.currentTarget,this._getDelegateConfig()),g(t.currentTarget).data(n,e)),t&&(e._activeTrigger["focusin"===t.type?Me:qe]=!0),g(e.getTipElement()).hasClass(Fe)||e._hoverState===je?e._hoverState=je:(clearTimeout(e._timeout),e._hoverState=je,e.config.delay&&e.config.delay.show?e._timeout=setTimeout(function(){e._hoverState===je&&e.show()},e.config.delay.show):e.show())},t._leave=function(t,e){var n=this.constructor.DATA_KEY;(e=e||g(t.currentTarget).data(n))||(e=new this.constructor(t.currentTarget,this._getDelegateConfig()),g(t.currentTarget).data(n,e)),t&&(e._activeTrigger["focusout"===t.type?Me:qe]=!1),e._isWithActiveTrigger()||(clearTimeout(e._timeout),e._hoverState=He,e.config.delay&&e.config.delay.hide?e._timeout=setTimeout(function(){e._hoverState===He&&e.hide()},e.config.delay.hide):e.hide())},t._isWithActiveTrigger=function(){for(var t in this._activeTrigger)if(this._activeTrigger[t])return!0;return!1},t._getConfig=function(t){var e=g(this.element).data();return Object.keys(e).forEach(function(t){-1!==Oe.indexOf(t)&&delete e[t]}),"number"==typeof(t=l({},this.constructor.Default,e,"object"==typeof t&&t?t:{})).delay&&(t.delay={show:t.delay,hide:t.delay}),"number"==typeof t.title&&(t.title=t.title.toString()),"number"==typeof t.content&&(t.content=t.content.toString()),_.typeCheckConfig(be,t,this.constructor.DefaultType),t.sanitize&&(t.template=Se(t.template,t.whiteList,t.sanitizeFn)),t},t._getDelegateConfig=function(){var t={};if(this.config)for(var e in this.config)this.constructor.Default[e]!==this.config[e]&&(t[e]=this.config[e]);return t},t._cleanTipClass=function(){var t=g(this.getTipElement()),e=t.attr("class").match(Ne);null!==e&&e.length&&t.removeClass(e.join(""))},t._handlePopperPlacementChange=function(t){var e=t.instance;this.tip=e.popper,this._cleanTipClass(),this.addAttachmentClass(this._getAttachment(t.placement))},t._fixTransition=function(){var t=this.getTipElement(),e=this.config.animation;null===t.getAttribute("x-placement")&&(g(t).removeClass(xe),this.config.animation=!1,this.hide(),this.show(),this.config.animation=e)},i._jQueryInterface=function(n){return this.each(function(){var t=g(this).data(Ie),e="object"==typeof n&&n;if((t||!/dispose|hide/.test(n))&&(t||(t=new i(this,e),g(this).data(Ie,t)),"string"==typeof n)){if("undefined"==typeof t[n])throw new TypeError('No method named "'+n+'"');t[n]()}})},s(i,null,[{key:"VERSION",get:function(){return"4.3.1"}},{key:"Default",get:function(){return Le}},{key:"NAME",get:function(){return be}},{key:"DATA_KEY",get:function(){return Ie}},{key:"Event",get:function(){return Re}},{key:"EVENT_KEY",get:function(){return De}},{key:"DefaultType",get:function(){return ke}}]),i}();g.fn[be]=Be._jQueryInterface,g.fn[be].Constructor=Be,g.fn[be].noConflict=function(){return g.fn[be]=we,Be._jQueryInterface};var Ve="popover",Ye="bs.popover",ze="."+Ye,Xe=g.fn[Ve],$e="bs-popover",Ge=new RegExp("(^|\\s)"+$e+"\\S+","g"),Je=l({},Be.Default,{placement:"right",trigger:"click",content:"",template:'<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>'}),Ze=l({},Be.DefaultType,{content:"(string|element|function)"}),tn="fade",en="show",nn=".popover-header",on=".popover-body",rn={HIDE:"hide"+ze,HIDDEN:"hidden"+ze,SHOW:"show"+ze,SHOWN:"shown"+ze,INSERTED:"inserted"+ze,CLICK:"click"+ze,FOCUSIN:"focusin"+ze,FOCUSOUT:"focusout"+ze,MOUSEENTER:"mouseenter"+ze,MOUSELEAVE:"mouseleave"+ze},sn=function(t){var e,n;function i(){return t.apply(this,arguments)||this}n=t,(e=i).prototype=Object.create(n.prototype),(e.prototype.constructor=e).__proto__=n;var o=i.prototype;return o.isWithContent=function(){return this.getTitle()||this._getContent()},o.addAttachmentClass=function(t){g(this.getTipElement()).addClass($e+"-"+t)},o.getTipElement=function(){return this.tip=this.tip||g(this.config.template)[0],this.tip},o.setContent=function(){var t=g(this.getTipElement());this.setElementContent(t.find(nn),this.getTitle());var e=this._getContent();"function"==typeof e&&(e=e.call(this.element)),this.setElementContent(t.find(on),e),t.removeClass(tn+" "+en)},o._getContent=function(){return this.element.getAttribute("data-content")||this.config.content},o._cleanTipClass=function(){var t=g(this.getTipElement()),e=t.attr("class").match(Ge);null!==e&&0<e.length&&t.removeClass(e.join(""))},i._jQueryInterface=function(n){return this.each(function(){var t=g(this).data(Ye),e="object"==typeof n?n:null;if((t||!/dispose|hide/.test(n))&&(t||(t=new i(this,e),g(this).data(Ye,t)),"string"==typeof n)){if("undefined"==typeof t[n])throw new TypeError('No method named "'+n+'"');t[n]()}})},s(i,null,[{key:"VERSION",get:function(){return"4.3.1"}},{key:"Default",get:function(){return Je}},{key:"NAME",get:function(){return Ve}},{key:"DATA_KEY",get:function(){return Ye}},{key:"Event",get:function(){return rn}},{key:"EVENT_KEY",get:function(){return ze}},{key:"DefaultType",get:function(){return Ze}}]),i}(Be);g.fn[Ve]=sn._jQueryInterface,g.fn[Ve].Constructor=sn,g.fn[Ve].noConflict=function(){return g.fn[Ve]=Xe,sn._jQueryInterface};var an="scrollspy",ln="bs.scrollspy",cn="."+ln,hn=g.fn[an],un={offset:10,method:"auto",target:""},fn={offset:"number",method:"string",target:"(string|element)"},dn={ACTIVATE:"activate"+cn,SCROLL:"scroll"+cn,LOAD_DATA_API:"load"+cn+".data-api"},gn="dropdown-item",_n="active",mn='[data-spy="scroll"]',pn=".nav, .list-group",vn=".nav-link",yn=".nav-item",En=".list-group-item",Cn=".dropdown",Tn=".dropdown-item",Sn=".dropdown-toggle",bn="offset",In="position",Dn=function(){function n(t,e){var n=this;this._element=t,this._scrollElement="BODY"===t.tagName?window:t,this._config=this._getConfig(e),this._selector=this._config.target+" "+vn+","+this._config.target+" "+En+","+this._config.target+" "+Tn,this._offsets=[],this._targets=[],this._activeTarget=null,this._scrollHeight=0,g(this._scrollElement).on(dn.SCROLL,function(t){return n._process(t)}),this.refresh(),this._process()}var t=n.prototype;return t.refresh=function(){var e=this,t=this._scrollElement===this._scrollElement.window?bn:In,o="auto"===this._config.method?t:this._config.method,r=o===In?this._getScrollTop():0;this._offsets=[],this._targets=[],this._scrollHeight=this._getScrollHeight(),[].slice.call(document.querySelectorAll(this._selector)).map(function(t){var e,n=_.getSelectorFromElement(t);if(n&&(e=document.querySelector(n)),e){var i=e.getBoundingClientRect();if(i.width||i.height)return[g(e)[o]().top+r,n]}return null}).filter(function(t){return t}).sort(function(t,e){return t[0]-e[0]}).forEach(function(t){e._offsets.push(t[0]),e._targets.push(t[1])})},t.dispose=function(){g.removeData(this._element,ln),g(this._scrollElement).off(cn),this._element=null,this._scrollElement=null,this._config=null,this._selector=null,this._offsets=null,this._targets=null,this._activeTarget=null,this._scrollHeight=null},t._getConfig=function(t){if("string"!=typeof(t=l({},un,"object"==typeof t&&t?t:{})).target){var e=g(t.target).attr("id");e||(e=_.getUID(an),g(t.target).attr("id",e)),t.target="#"+e}return _.typeCheckConfig(an,t,fn),t},t._getScrollTop=function(){return this._scrollElement===window?this._scrollElement.pageYOffset:this._scrollElement.scrollTop},t._getScrollHeight=function(){return this._scrollElement.scrollHeight||Math.max(document.body.scrollHeight,document.documentElement.scrollHeight)},t._getOffsetHeight=function(){return this._scrollElement===window?window.innerHeight:this._scrollElement.getBoundingClientRect().height},t._process=function(){var t=this._getScrollTop()+this._config.offset,e=this._getScrollHeight(),n=this._config.offset+e-this._getOffsetHeight();if(this._scrollHeight!==e&&this.refresh(),n<=t){var i=this._targets[this._targets.length-1];this._activeTarget!==i&&this._activate(i)}else{if(this._activeTarget&&t<this._offsets[0]&&0<this._offsets[0])return this._activeTarget=null,void this._clear();for(var o=this._offsets.length;o--;){this._activeTarget!==this._targets[o]&&t>=this._offsets[o]&&("undefined"==typeof this._offsets[o+1]||t<this._offsets[o+1])&&this._activate(this._targets[o])}}},t._activate=function(e){this._activeTarget=e,this._clear();var t=this._selector.split(",").map(function(t){return t+'[data-target="'+e+'"],'+t+'[href="'+e+'"]'}),n=g([].slice.call(document.querySelectorAll(t.join(","))));n.hasClass(gn)?(n.closest(Cn).find(Sn).addClass(_n),n.addClass(_n)):(n.addClass(_n),n.parents(pn).prev(vn+", "+En).addClass(_n),n.parents(pn).prev(yn).children(vn).addClass(_n)),g(this._scrollElement).trigger(dn.ACTIVATE,{relatedTarget:e})},t._clear=function(){[].slice.call(document.querySelectorAll(this._selector)).filter(function(t){return t.classList.contains(_n)}).forEach(function(t){return t.classList.remove(_n)})},n._jQueryInterface=function(e){return this.each(function(){var t=g(this).data(ln);if(t||(t=new n(this,"object"==typeof e&&e),g(this).data(ln,t)),"string"==typeof e){if("undefined"==typeof t[e])throw new TypeError('No method named "'+e+'"');t[e]()}})},s(n,null,[{key:"VERSION",get:function(){return"4.3.1"}},{key:"Default",get:function(){return un}}]),n}();g(window).on(dn.LOAD_DATA_API,function(){for(var t=[].slice.call(document.querySelectorAll(mn)),e=t.length;e--;){var n=g(t[e]);Dn._jQueryInterface.call(n,n.data())}}),g.fn[an]=Dn._jQueryInterface,g.fn[an].Constructor=Dn,g.fn[an].noConflict=function(){return g.fn[an]=hn,Dn._jQueryInterface};var wn="bs.tab",An="."+wn,Nn=g.fn.tab,On={HIDE:"hide"+An,HIDDEN:"hidden"+An,SHOW:"show"+An,SHOWN:"shown"+An,CLICK_DATA_API:"click"+An+".data-api"},kn="dropdown-menu",Pn="active",Ln="disabled",jn="fade",Hn="show",Rn=".dropdown",xn=".nav, .list-group",Fn=".active",Un="> li > .active",Wn='[data-toggle="tab"], [data-toggle="pill"], [data-toggle="list"]',qn=".dropdown-toggle",Mn="> .dropdown-menu .active",Kn=function(){function i(t){this._element=t}var t=i.prototype;return t.show=function(){var n=this;if(!(this._element.parentNode&&this._element.parentNode.nodeType===Node.ELEMENT_NODE&&g(this._element).hasClass(Pn)||g(this._element).hasClass(Ln))){var t,i,e=g(this._element).closest(xn)[0],o=_.getSelectorFromElement(this._element);if(e){var r="UL"===e.nodeName||"OL"===e.nodeName?Un:Fn;i=(i=g.makeArray(g(e).find(r)))[i.length-1]}var s=g.Event(On.HIDE,{relatedTarget:this._element}),a=g.Event(On.SHOW,{relatedTarget:i});if(i&&g(i).trigger(s),g(this._element).trigger(a),!a.isDefaultPrevented()&&!s.isDefaultPrevented()){o&&(t=document.querySelector(o)),this._activate(this._element,e);var l=function(){var t=g.Event(On.HIDDEN,{relatedTarget:n._element}),e=g.Event(On.SHOWN,{relatedTarget:i});g(i).trigger(t),g(n._element).trigger(e)};t?this._activate(t,t.parentNode,l):l()}}},t.dispose=function(){g.removeData(this._element,wn),this._element=null},t._activate=function(t,e,n){var i=this,o=(!e||"UL"!==e.nodeName&&"OL"!==e.nodeName?g(e).children(Fn):g(e).find(Un))[0],r=n&&o&&g(o).hasClass(jn),s=function(){return i._transitionComplete(t,o,n)};if(o&&r){var a=_.getTransitionDurationFromElement(o);g(o).removeClass(Hn).one(_.TRANSITION_END,s).emulateTransitionEnd(a)}else s()},t._transitionComplete=function(t,e,n){if(e){g(e).removeClass(Pn);var i=g(e.parentNode).find(Mn)[0];i&&g(i).removeClass(Pn),"tab"===e.getAttribute("role")&&e.setAttribute("aria-selected",!1)}if(g(t).addClass(Pn),"tab"===t.getAttribute("role")&&t.setAttribute("aria-selected",!0),_.reflow(t),t.classList.contains(jn)&&t.classList.add(Hn),t.parentNode&&g(t.parentNode).hasClass(kn)){var o=g(t).closest(Rn)[0];if(o){var r=[].slice.call(o.querySelectorAll(qn));g(r).addClass(Pn)}t.setAttribute("aria-expanded",!0)}n&&n()},i._jQueryInterface=function(n){return this.each(function(){var t=g(this),e=t.data(wn);if(e||(e=new i(this),t.data(wn,e)),"string"==typeof n){if("undefined"==typeof e[n])throw new TypeError('No method named "'+n+'"');e[n]()}})},s(i,null,[{key:"VERSION",get:function(){return"4.3.1"}}]),i}();g(document).on(On.CLICK_DATA_API,Wn,function(t){t.preventDefault(),Kn._jQueryInterface.call(g(this),"show")}),g.fn.tab=Kn._jQueryInterface,g.fn.tab.Constructor=Kn,g.fn.tab.noConflict=function(){return g.fn.tab=Nn,Kn._jQueryInterface};var Qn="toast",Bn="bs.toast",Vn="."+Bn,Yn=g.fn[Qn],zn={CLICK_DISMISS:"click.dismiss"+Vn,HIDE:"hide"+Vn,HIDDEN:"hidden"+Vn,SHOW:"show"+Vn,SHOWN:"shown"+Vn},Xn="fade",$n="hide",Gn="show",Jn="showing",Zn={animation:"boolean",autohide:"boolean",delay:"number"},ti={animation:!0,autohide:!0,delay:500},ei='[data-dismiss="toast"]',ni=function(){function i(t,e){this._element=t,this._config=this._getConfig(e),this._timeout=null,this._setListeners()}var t=i.prototype;return t.show=function(){var t=this;g(this._element).trigger(zn.SHOW),this._config.animation&&this._element.classList.add(Xn);var e=function(){t._element.classList.remove(Jn),t._element.classList.add(Gn),g(t._element).trigger(zn.SHOWN),t._config.autohide&&t.hide()};if(this._element.classList.remove($n),this._element.classList.add(Jn),this._config.animation){var n=_.getTransitionDurationFromElement(this._element);g(this._element).one(_.TRANSITION_END,e).emulateTransitionEnd(n)}else e()},t.hide=function(t){var e=this;this._element.classList.contains(Gn)&&(g(this._element).trigger(zn.HIDE),t?this._close():this._timeout=setTimeout(function(){e._close()},this._config.delay))},t.dispose=function(){clearTimeout(this._timeout),this._timeout=null,this._element.classList.contains(Gn)&&this._element.classList.remove(Gn),g(this._element).off(zn.CLICK_DISMISS),g.removeData(this._element,Bn),this._element=null,this._config=null},t._getConfig=function(t){return t=l({},ti,g(this._element).data(),"object"==typeof t&&t?t:{}),_.typeCheckConfig(Qn,t,this.constructor.DefaultType),t},t._setListeners=function(){var t=this;g(this._element).on(zn.CLICK_DISMISS,ei,function(){return t.hide(!0)})},t._close=function(){var t=this,e=function(){t._element.classList.add($n),g(t._element).trigger(zn.HIDDEN)};if(this._element.classList.remove(Gn),this._config.animation){var n=_.getTransitionDurationFromElement(this._element);g(this._element).one(_.TRANSITION_END,e).emulateTransitionEnd(n)}else e()},i._jQueryInterface=function(n){return this.each(function(){var t=g(this),e=t.data(Bn);if(e||(e=new i(this,"object"==typeof n&&n),t.data(Bn,e)),"string"==typeof n){if("undefined"==typeof e[n])throw new TypeError('No method named "'+n+'"');e[n](this)}})},s(i,null,[{key:"VERSION",get:function(){return"4.3.1"}},{key:"DefaultType",get:function(){return Zn}},{key:"Default",get:function(){return ti}}]),i}();g.fn[Qn]=ni._jQueryInterface,g.fn[Qn].Constructor=ni,g.fn[Qn].noConflict=function(){return g.fn[Qn]=Yn,ni._jQueryInterface},function(){if("undefined"==typeof g)throw new TypeError("Bootstrap's JavaScript requires jQuery. jQuery must be included before Bootstrap's JavaScript.");var t=g.fn.jquery.split(" ")[0].split(".");if(t[0]<2&&t[1]<9||1===t[0]&&9===t[1]&&t[2]<1||4<=t[0])throw new Error("Bootstrap's JavaScript requires at least jQuery v1.9.1 but less than v4.0.0")}(),t.Util=_,t.Alert=p,t.Button=P,t.Carousel=lt,t.Collapse=bt,t.Dropdown=Jt,t.Modal=ve,t.Popover=sn,t.Scrollspy=Dn,t.Tab=Kn,t.Toast=ni,t.Tooltip=Be,Object.defineProperty(t,"__esModule",{value:!0})});

}
    O46Core.installed.vendors = true;
};

/* apiservice: shared by main, cat, item, vue. */
O46Core.apiservice = O46Core.apiservice || function () {
    if (O46Core.installed.apiservice) return;
(function () {
    
    eGuardians.apiservice = new function () {
        /**
         * 
         * @param {string} url
         * @param {string} method
         * @param {string} params
         * @param {function} callback
         */

        var callApi = function(url, method, params, callback, dataType, timeoutMs){
            dataType = dataType || "json";
            $.ajax({
                url: url,
                method: method,
                timeout: timeoutMs,
                data: params,
                dataType: dataType,
                contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                statusCode: {
                    404: function () {
                        console.error('404');
                    },
                    400: function (jqXHR, textStatus, errorThrown) {
                        console.error('Error 400');
                    },
                    412: function (jqXHR, textStatus, errorThrown) {
                        console.error('Error 412');
                    },
                    401: function () {
                        console.error('Error 401');
                    },
                    403: function () {
                        console.error('Error 403');
                    },
                    500: function (jqXHR, textStatus, errorThrown) {
                        console.error('Error 500');
                    }
                },
                success: function (response, textStatus, xhr) {
                    if (typeof callback === 'function') callback(response, xhr.status);
                },
                error: function (xhr) {
                    var response;
                    try {
                        response = xhr.responseText ? JSON.parse(xhr.responseText) : {};
                    } catch (_) {
                        response = xhr;
                    }
                    if (typeof callback === 'function') callback(response, xhr.status);
                }
            });
        };
          /**
           * 
           * @param {string} url
           * @param {string} data
           * @param {function} callback
           */
          this.post = function(url, data, callback, dataType, timeoutMs) {
            callApi(url, 'POST', data, callback, dataType, timeoutMs);
          };
          this.get = function(url, data, callback, dataType, timeoutMs) {
            callApi(url, 'GET', data, callback, dataType, timeoutMs);
          };
          this.put = function(url, data){
            this.callApi(url,'PUT',data);
          };
          this.delete = function( url, data, callback, dataType){
            dataType = dataType | "json"; 
            //this.callApi(url,'DELETE',data);
            callApi(url,'DELETE',data,function(response){
                if(typeof callback === 'function') {
                    callback(response);
                }
            }, dataType);
          };
      }  
})(eGuardians);
    O46Core.installed.apiservice = true;
};


/* ui: shared by main, cat, vue. */
O46Core.ui = O46Core.ui || function (messageDuration) {
    if (O46Core.installed.ui) return;
(function () {
    eGuardians.ui = new function () {
        this.modal = {
            show: function(content, title){

            },
            modalRestContent: function(route,data,title,modalType,languageMessage){
                $('.dynamicModal .loader-basket').addClass('load-rotate');
                modalType = modalType || "";
                $('.dynamicModal').find('.modal-dialog').addClass(modalType);
                $('.dynamicModal').modal();
                
                eGuardians.apiservice.get(route, data, function(response){
                    $('.dynamicModal').find('.modal-title').html(title);
                    if(response.data.hasOwnProperty("description1")){
                        $('.dynamicModal').find('.modal-body').html(response.data["description1"]);
                    }else{
                        $('.dynamicModal').find('.modal-body').html(response.data);
                    }
                    
                    if(typeof callback === 'function') {
                        callback(response);
                    }
                    if (languageMessage !== undefined) {
                        eGuardians.ui.modal.languageLinks(document.querySelector('.dynamicModal'), languageMessage);
                    }
                    eGuardians.events.bindEvents('.dynamicModal [data-eg-event]');
                });
            },
            // The existing modal owns language links on every page. IO already emitted
            // the routes in the head; facets supply state only, never another route map.
            languageLinks: function(modal, unavailable){
                if (!modal) return;
                const routes = new Map();
                document.head.querySelectorAll('link[rel="alternate"][hreflang], meta[name="o46-language-route"][lang]').forEach(link => {
                    const code = (link.getAttribute('hreflang') || link.lang).toLowerCase().split('-')[0];
                    if (code !== 'x') routes.set(code, link.dataset.egLanguageUrl || link.getAttribute('content') || link.href);
                });
                const current = new URL(location.href);
                const item = [...document.querySelectorAll('article.single[data-item]')].find(node => !node.closest('.modal'));
                const positiveId = value => /^[1-9][0-9]*$/.test(String(value || ''));
                let selectedVariation = null;
                if (item) {
                    const variations = item.querySelector('[data-eg-variations]');
                    const preview = item.querySelector('[data-eg-size-matrix]')?.dataset.egPreviewVid;
                    const legacy = variations ? $(variations).data('activeVariationId') : null;
                    const direct = current.pathname.match(/(?:\/|_)([0-9]+)_([0-9]+)\/?$/);
                    const selected = preview || legacy || (direct && direct[1] === item.dataset.mainitemid ? direct[2] : null);
                    if (positiveId(item.dataset.mainitemid) && positiveId(selected) && variations) {
                        try {
                            if (JSON.parse(variations.dataset.egVariations).some(v => String(v.variationId) === String(selected))) selectedVariation = String(selected);
                        } catch (_) { /* An invalid map must never fabricate a variation route. */ }
                    }
                }
                for (const link of modal.querySelectorAll('a[href]')) {
                    const path = new URL(link.getAttribute('href'), location.href).pathname;
                    const match = path.match(/^\/(de|en|fr|it|es)?\/?$/);
                    const code = link.dataset.egFacetLanguage || (match ? match[1] || 'de' : null);
                    if (!code) continue;
                    link.dataset.egFacetLanguage = code;
                    const target = routes.get(code);
                    let url = target ? new URL(target, location.href) : null;
                    if (url && !/^https?:$/.test(url.protocol)) url = null;
                    if (url) {
                        if (!item && window.egFacets) url = window.egFacets.languageURL(url.href) || url;
                        if (item && selectedVariation) {
                            // IO's registered itemId_variationId route accepts both IDs.
                            // Reuse the prefix actually present in IO's target, not a guessed default language.
                            const prefix = url.pathname.startsWith('/' + code + '/') ? '/' + code + '/' : '/';
                            url.pathname = prefix + item.dataset.mainitemid + '_' + selectedVariation;
                        }
                        // Only supported explicit checkout context crosses languages.
                        // Never carry Lang, quickViewItem, arbitrary variationId, tracking or search parameters onto a PDP.
                        const currency = current.searchParams.get('currency') || current.searchParams.get('Currency');
                        const country = current.searchParams.get('ShipToCountry');
                        if (currency && /^[A-Z]{3}$/.test(currency.toUpperCase())) url.searchParams.set('currency', currency.toUpperCase());
                        if (positiveId(country)) url.searchParams.set('ShipToCountry', country);
                        link.href = url.href;
                        link.removeAttribute('aria-disabled');
                        link.removeAttribute('title');
                    } else {
                        link.setAttribute('aria-disabled', 'true');
                        link.title = unavailable;
                    }
                    if (!link.dataset.egLanguageBound) {
                        link.dataset.egLanguageBound = 'true';
                        link.addEventListener('click', event => {
                            if (link.getAttribute('aria-disabled') !== 'true') return;
                            event.preventDefault(); event.stopImmediatePropagation();
                            let notice = modal.querySelector('.facet-language-status');
                            if (!notice) {
                                notice = document.createElement('p'); notice.className = 'facet-language-status';
                                notice.setAttribute('role', 'status'); modal.querySelector('.modal-body').append(notice);
                            }
                            notice.textContent = unavailable;
                        });
                    }
                }
            }
        };
        this.message = new function(){
            var showMessage = function(msgType, msg, msgTitle, insertElement, closeTimer, customSelector, customClass){
                msgTitle = msgTitle || "";
                closeTimer = closeTimer || messageDuration;
                customSelector = customSelector || "";
                customClass = customClass || "";
                
                var msgClass = "alert-success";
               
                if(msgType==1){
                    msgClass = "alert-warning";
                }
                if(msgType==2){
                    msgClass = "alert-danger";
                }
                var msgHtml = '<div class="alert '+msgClass+' alert-dismissable fade show '+customClass+'" data-eg-item-errormsg>';
                msgHtml += '<button class="close" data-dismiss="alert" aria-label="close">&times;</button>';
                if(msgTitle!=""){
                   msgHtml += '<strong>'+msgTitle+'</strong>'; 
                }
                msgHtml += '<span>'+msg+'</span>'; 
                msgHtml += '</div>';
                
                var msgElement = $(msgHtml).insertBefore(insertElement);
                if(closeTimer>0){
                    setTimeout(function(){ 
                        if(customSelector!=""){
                            $(customSelector).alert('close'); 
                        }else{
                            $(msgElement).alert('close'); 
                        }
                    }, closeTimer);
                }
            }
            this.success = {
                show: function(msgArg){
                    showMessage(0, msgArg.message, msgArg.title, msgArg.insertElement, msgArg.closeTimer, msgArg.selector, msgArg.customClass);
                },
                hide: function(customSelector){
                    $(customSelector).alert('close');
                }
            },
            this.warning = {
                show: function(msgArg){
                    showMessage(1, msgArg.message, msgArg.title, msgArg.insertElement, msgArg.closeTimer, msgArg.selector, msgArg.customClass);
                },
                hide: function(customClass){
                    $(customSelector).alert('close');
                }
            },
            this.error = {
                show: function(msgArg){
                    showMessage(2, msgArg.message, msgArg.title, msgArg.insertElement, msgArg.closeTimer, msgArg.selector, msgArg.customClass);
                },
                hide: function(customSelector){
                   $(customSelector).alert('close'); 
                }
            }
        }
    };
})(eGuardians);
    O46Core.installed.ui = true;
};

/* Only the header summary travels between tabs. Ceres owns the basket and checkout. */
O46Core.basketHeader = O46Core.basketHeader || (function () {
    const key = 'basketCache_header_v2';
    const scopeKey = 'o46-basket-scope';
    const ttl = 30 * 60 * 1000;
    let started = false, generation = 0, request = null, scope = '', change = '';
    let lastIdentity = '', hashPromise = null, current = null, initialCeres = false;
    let rejectedRecord, writeVersion = 0, invalidating = false;
    const published = new WeakSet();

    function storage(name, method, ...args) {
        try { return window[name][method](...args); } catch (_) { return null; }
    }
    function compact(basket) {
        if (!basket || !Number.isFinite(basket.itemQuantity) || basket.itemQuantity < 0 ||
            !Number.isFinite(basket.itemSum) || !/^[A-Z]{3}$/.test(basket.currency) ||
            !Number.isSafeInteger(basket.shippingCountryId) || basket.shippingCountryId < 0 ||
            !Array.isArray(basket.itemWishListIds)) return null;
        return { itemQuantity: basket.itemQuantity, itemSum: basket.itemSum, currency: basket.currency,
            shippingCountryId: basket.shippingCountryId, itemWishListIds: basket.itemWishListIds.filter(id => /^\d+$/.test(id)) };
    }
    function record() {
        try { return JSON.parse(storage('localStorage', 'getItem', key)); } catch (_) { return null; }
    }
    function matchesContext(basket) {
        const header = document.getElementById('page-header')?.dataset;
        return (!header?.egBasketCurrency || header.egBasketCurrency === basket.currency) &&
            (!header?.egBasketCountry || header.egBasketCountry === String(basket.shippingCountryId));
    }
    function valid(entry) {
        return entry && scope && entry.scope === scope && typeof entry.change === 'string' &&
            Number.isFinite(entry.timestamp) && entry.timestamp <= Date.now() && entry.timestamp > Date.now() - ttl;
    }
    function render(basket) {
        current = basket;
        window.egSessionData = { basket };
        document.querySelectorAll('[data-eg-basket-quantity]').forEach(el => {
            el.textContent = String(basket.itemQuantity);
            el.dataset.egBasketQuantity = el.textContent;
            if (el.matches('.header-quant-info,.header-quant-info2')) {
                el.classList.toggle('header-quant-info', basket.itemQuantity < 10);
                el.classList.toggle('header-quant-info2', basket.itemQuantity >= 10);
            }
        });
        document.querySelectorAll('[data-basket-sum]').forEach(el => { el.textContent = basket.itemSum.toFixed(2).replace('.', ','); });
        document.querySelectorAll('.wishlist-link').forEach(el => el.classList.toggle('noWishListItems', !basket.itemWishListIds.length));
        document.querySelectorAll('.single[data-item]').forEach(el => {
            const selected = basket.itemWishListIds.some(id => String(id) === el.dataset.egActiveVariation);
            el.querySelectorAll('.btn-watch').forEach(btn => btn.classList.toggle('item-in-wishlist', selected));
        });
    }
    function identity(basket) {
        if (!basket.sessionId || !window.crypto?.subtle) return '';
        const input = JSON.stringify([String(basket.sessionId), String(basket.customerId || 0)]);
        if (lastIdentity !== input) {
            lastIdentity = input;
            hashPromise = crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
                .then(hash => Array.from(new Uint8Array(hash), value => value.toString(16).padStart(2, '0')).join(''))
                .catch(() => '');
        }
        return hashPromise;
    }
    async function accept(basket, changed = true) {
        const summary = compact(basket);
        if (!summary) return false;
        if (changed && published.has(basket)) return true;
        if (changed) published.add(basket);
        const ticket = ++generation;
        // A digest lets another verified tab recognise the session without persisting a session or contact ID.
        const verified = await identity(basket);
        if (ticket !== generation) return true;
        scope = verified;
        render(summary);
        if (!scope) {
            lastIdentity = '';
            hashPromise = null;
            storage('sessionStorage', 'removeItem', scopeKey);
            return true;
        }
        const prior = record();
        storage('sessionStorage', 'setItem', scopeKey, scope);
        // Only confirmed writes signal peers. A read must never echo their write back to them.
        change = changed ? Date.now() + '-' + Math.random().toString(36).slice(2) : (prior?.scope === scope && prior.change || '');
        const next = { scope, change, timestamp: Date.now(), basket: summary };
        storage('localStorage', 'setItem', key, JSON.stringify(next));
        return true;
    }
    function refresh() {
        if (request) return request;
        const ticket = generation;
        const write = writeVersion;
        const pending = fetch('/rest/io/basket/', { credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' } })
            .then(response => response.ok ? response.json() : null)
            .then(json => {
                if (ticket !== generation) return false;
                return accept(json?.data, write !== 0);
            })
            .catch(() => false)
            .finally(() => {
                if (request === pending) request = null;
                if (writeVersion === write) writeVersion = 0;
            });
        request = pending;
        return pending;
    }
    function refreshAfterWrite() {
        generation++;
        writeVersion = generation;
        return request ? request.then(() => writeVersion && refresh()) : refresh();
    }
    function invalidate() {
        if (invalidating) return request;
        invalidating = true;
        generation++;
        scope = ''; change = ''; current = null; writeVersion = 0; lastIdentity = ''; hashPromise = null;
        storage('sessionStorage', 'removeItem', scopeKey);
        storage('localStorage', 'removeItem', key);
        const pending = request ? request.then(refresh) : refresh();
        return pending.finally(() => { invalidating = false; });
    }
    function receive(entry, notify) {
        if (!valid(entry)) return false;
        const summary = compact(entry.basket);
        if (!summary || !matchesContext(summary)) return false;
        const modified = change !== entry.change;
        if (modified) {
            generation++;
            writeVersion = 0;
        }
        change = entry.change;
        render(summary);
        if (notify && modified) window.dispatchEvent(new Event('o46:basket-invalidated'));
        return true;
    }
    function check() {
        if (initialCeres) return;
        if (!receive(record(), true)) {
            if (document.body.hasAttribute('data-o46-basket-sync')) {
                window.dispatchEvent(new Event('o46:basket-invalidated'));
            } else {
                return refresh();
            }
        }
    }
    function start() {
        if (started) return;
        started = true;
        scope = storage('sessionStorage', 'getItem', scopeKey) || '';
        // Retire old full-basket records once, including their raw session identifiers.
        try {
            Object.keys(localStorage).filter(k => (k.startsWith('basketCache_') && k !== key) || k === 'basketCache')
                .forEach(k => localStorage.removeItem(k));
        } catch (_) {}
        window.addEventListener('storage', event => {
            if (event.key !== key && event.key !== null) return;
            if (invalidating || initialCeres || !scope) return;
            const entry = record();
            if (receive(entry, true)) {
                rejectedRecord = undefined;
                return;
            }
            // A read by a different verified session/currency/country is not a notification for this tab.
            if (entry && (entry.scope !== scope || (compact(entry.basket) && !matchesContext(entry.basket)))) return;
            const raw = storage('localStorage', 'getItem', key);
            if (rejectedRecord === raw) return;
            rejectedRecord = raw;
            if (document.body.hasAttribute('data-o46-basket-sync')) window.dispatchEvent(new Event('o46:basket-invalidated'));
            else refresh();
        });
        window.addEventListener('pageshow', event => { if (event.persisted) check(); });
        document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
        const store = window.ceresStore;
        if (store && store.state.basket) {
            // Ceres already reads the session on every Vue bootstrap.
            initialCeres = !store.state.basket.isBasketInitiallyLoaded;
            store.subscribe((mutation, state) => {
                if (mutation.type === 'setBasket' && !initialCeres) accept(state.basket.data, false);
                if (mutation.type === 'setIsBasketInitiallyLoaded') {
                    initialCeres = false;
                    accept(state.basket.data, false);
                }
            });
            if (!initialCeres) accept(store.state.basket.data, false);
            // Ceres commits the IO event synchronously in its ajaxComplete callback.
            // A GET (including a peer's reconciliation) must never be published as a write.
            if (window.jQuery) window.jQuery(document).on('ajaxComplete.o46BasketHeader', (event, xhr, settings) => {
                if (!/^(POST|PUT|PATCH|DELETE)$/i.test(settings.type) || xhr.status < 200 || xhr.status >= 300) return;
                const url = new URL(settings.url, location.href);
                const changed = xhr.responseJSON?.events?.AfterBasketChanged?.basket;
                if (url.origin !== location.origin || !url.pathname.startsWith('/rest/io/') || !changed) return;
                if (published.has(changed)) return;
                // ApiService parses its own copy of xhr.responseJSON in the same completion cycle.
                if (changed !== store.state.basket.data && store.state.basket.data) published.add(store.state.basket.data);
                accept(changed);
            });
            for (const name of ['afterBasketItemQuantityUpdated', 'afterBasketItemRemoved', 'afterBasketItemAdded']) {
                document.addEventListener(name, () => accept(store.state.basket.data));
            }
            return;
        }
        if (!receive(record(), false)) return refresh();
    }
    return { start, accept, refresh, refreshAfterWrite, invalidate };
})();

// IO BasketItemResource::store confirms a completed write with HTTP 201 and data:true.
O46Core.basketAddError = function(response, status) {
    if (status === 201 && response?.data === true) return null;
    const code = response?.data?.exceptionCode;
    return (typeof code === 'number' || typeof code === 'string') && /^\d+$/.test(String(code)) ? String(code) : '0';
};

/* basket: shared by main, cat, item, vue. */
O46Core.basket = O46Core.basket || function () {
    if (O46Core.installed.basket) return;
(function () {
    eGuardians.basket = new function () {

this.addItem = function(variationId, quantity, callback) {
    quantity = (typeof quantity === 'number' && quantity >= 1) ? quantity : 1;

    const data = {
        variationId: variationId,
        quantity: quantity
    };

    eGuardians.apiservice.post('/rest/io/basket/items/', data, function(response, status) {
        const error = O46Core.basketAddError(response, status);
        const basket = response?.events?.AfterBasketChanged?.basket;
        if (basket) O46Core.basketHeader.accept(basket);
        else O46Core.basketHeader.refreshAfterWrite();
        if (typeof callback === 'function') callback(response, error);
    });
};
        this.openBasketPreviewSmall = function(callback) {
            const target = document.querySelector('.basket-prev-small-data');
            const template = document.getElementById('o46-basket-toast');
            if (!target || !template) return;
            target.replaceChildren(template.content.cloneNode(true));
            const toast = target.querySelector('#wkb-toast');
            setTimeout(() => toast?.classList.remove('show'), 3000);
            if (typeof callback === 'function') callback({ data: target.innerHTML });
        };
        this.closeBasketPreview = function(){
            $('.loading-basket-prev-wrap').show();
            $('html').removeClass('basket-preview-open');
            $('[data-eg-basket-preview]').find('.basket-prev-data').html('');
        }
       
        
    }
})(eGuardians);
    O46Core.installed.basket = true;
};

/* user: shared by main, cat, item. */
O46Core.user = O46Core.user || function () {
    if (O46Core.installed.user) return;
(function () {
    eGuardians.user = new function () {
       this.login = function(userMail, userPassword, callback){
            var loginParams = {
                email: userMail,
                password: userPassword
            };

            eGuardians.apiservice.post('/rest/io/customer/login/', loginParams, function(response) {
                if (response?.events?.AfterAccountAuthentication?.isSuccess) {
                    O46Core.basketHeader.invalidate();
                }

                if (typeof callback === 'function') {
                    callback(response);
                }
            });
        };

        this.logout = function(callback){
            eGuardians.apiservice.post('/rest/io/customer/logout/', '', function(response) {
                O46Core.basketHeader.invalidate();

                if (typeof callback === 'function') {
                    callback(response);
                }
            });
        };

    }
})(eGuardians);
    O46Core.installed.user = true;
};

/* validator: shared by main, cat, item, vue. */
O46Core.validator = O46Core.validator || function () {
    if (O46Core.installed.validator) return;
(function () {
    eGuardians.validator = new function () {
        var isInputEmpty = function(inputValue){
             if($.trim(inputValue).length<=0){
                 return false;
             }else{
                 return true;
             }
        }
        var isValidMail = function(inputValue){
            var emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return emailReg.test(inputValue);
        }
        this.checkInputs = function(inputs, errorClass){
            var allInputsValid = true;
            $(inputs).each(function(i,singleInput){
      
               if(!isInputEmpty($(singleInput).val())){
                   allInputsValid = false;
                  $(singleInput).addClass('input-error');
               }else{
                   $(singleInput).removeClass('input-error');
                    if($(singleInput).attr("type")=="email"){
                 
                        if(!isValidMail($(singleInput).val())){
                            allInputsValid = false;
                            $(singleInput).addClass('input-error');
                        }else{
                            $(singleInput).removeClass('input-error');
                        }
                    }
               }
               
            });
            return allInputsValid;
        }
           
    }
})(eGuardians);
    O46Core.installed.validator = true;
};

/* helper: shared by main, cat, item, vue. */
O46Core.helper = O46Core.helper || function () {
    if (O46Core.installed.helper) return;
(function () {
    eGuardians.helper = new function () {
        
        this.btnShowLoader = function(btnElem){
            $(btnElem).addClass('btn-load');
            $(btnElem).attr('disabled','disabled');
        }
        this.btnHideLoader = function(btnElem){
            $(btnElem).removeClass('btn-load');
            $(btnElem).removeAttr('disabled','disabled');
        }
        this.autoCompleteReg = function ($input, label) {
            const $span = $('<span>');
            const query = $input.val();
            if (!query) return $span.text(label);

            const literal = query.replace(/[$.*+?^{}()|[\]\\]/g, '\\$&');
            const match = new RegExp(literal, 'i').exec(label);
            if (!match) return $span.text(label);

            return $span.append(
                document.createTextNode(label.slice(0, match.index)),
                $('<strong>').text(match[0]),
                document.createTextNode(label.slice(match.index + match[0].length))
            );
        };
    }
})(eGuardians);
    O46Core.installed.helper = true;
};

/*! lozad.js - v1.16.0 - 2020-09-06
* https://github.com/ApoorvSaxena/lozad.js
* Copyright (c) 2020 Apoorv Saxena; Licensed MIT */
/* lazyImages: shared by main, cat, item, vue. */
O46Core.lazyImages = O46Core.lazyImages || function () {
    if (O46Core.installed.lazyImages) return;
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):t.lozad=e()}(this,function(){"use strict";
/**
   * Detect IE browser
   * @const {boolean}
   * @private
   */var g="undefined"!=typeof document&&document.documentMode,f={rootMargin:"0px",threshold:0,load:function(t){if("picture"===t.nodeName.toLowerCase()){var e=t.querySelector("img"),r=!1;null===e&&(e=document.createElement("img"),r=!0),g&&t.getAttribute("data-iesrc")&&(e.src=t.getAttribute("data-iesrc")),t.getAttribute("data-alt")&&(e.alt=t.getAttribute("data-alt")),r&&t.append(e)}if("video"===t.nodeName.toLowerCase()&&!t.getAttribute("data-src")&&t.children){for(var a=t.children,o=void 0,i=0;i<=a.length-1;i++)(o=a[i].getAttribute("data-src"))&&(a[i].src=o);t.load()}t.getAttribute("data-poster")&&(t.poster=t.getAttribute("data-poster")),t.getAttribute("data-src")&&(t.src=t.getAttribute("data-src")),t.getAttribute("data-srcset")&&t.setAttribute("srcset",t.getAttribute("data-srcset"));var n=",";if(t.getAttribute("data-background-delimiter")&&(n=t.getAttribute("data-background-delimiter")),t.getAttribute("data-background-image"))t.style.backgroundImage="url('"+t.getAttribute("data-background-image").split(n).join("'),url('")+"')";else if(t.getAttribute("data-background-image-set")){var d=t.getAttribute("data-background-image-set").split(n),u=d[0].substr(0,d[0].indexOf(" "))||d[0];// Substring before ... 1x
u=-1===u.indexOf("url(")?"url("+u+")":u,1===d.length?t.style.backgroundImage=u:t.setAttribute("style",(t.getAttribute("style")||"")+"background-image: "+u+"; background-image: -webkit-image-set("+d+"); background-image: image-set("+d+")")}t.getAttribute("data-toggle-class")&&t.classList.toggle(t.getAttribute("data-toggle-class"))},loaded:function(){}};function A(t){t.setAttribute("data-loaded",!0)}var m=function(t){return"true"===t.getAttribute("data-loaded")},v=function(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:document;return t instanceof Element?[t]:t instanceof NodeList?t:e.querySelectorAll(t)};return function(){var r,a,o=0<arguments.length&&void 0!==arguments[0]?arguments[0]:".lozad",t=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{},e=Object.assign({},f,t),i=e.root,n=e.rootMargin,d=e.threshold,u=e.load,g=e.loaded,s=void 0;"undefined"!=typeof window&&window.IntersectionObserver&&(s=new IntersectionObserver((r=u,a=g,function(t,e){t.forEach(function(t){(0<t.intersectionRatio||t.isIntersecting)&&(e.unobserve(t.target),m(t.target)||(r(t.target),A(t.target),a(t.target)))})}),{root:i,rootMargin:n,threshold:d}));for(var c,l=v(o,i),b=0;b<l.length;b++)(c=l[b]).getAttribute("data-placeholder-background")&&(c.style.background=c.getAttribute("data-placeholder-background"));return{observe:function(){for(var t=v(o,i),e=0;e<t.length;e++)m(t[e])||(s?s.observe(t[e]):(u(t[e]),A(t[e]),g(t[e])))},triggerLoad:function(t){m(t)||(u(t),A(t),g(t))},observer:s}}});
    O46Core.installed.lazyImages = true;
};

/* newsletter: shared by main, cat, item, vue. */
O46Core.newsletter = O46Core.newsletter || function () {
    if (O46Core.installed.newsletter) return;
$(document).ready(function () {
    const popup = document.getElementById('o46-b2b-newsletter');
    if (!popup || popup.dataset.initialized) return;
    popup.dataset.initialized = '1';

    const cookieName = 'o46_b2b_newsletter_dismissed';
    const scrollLimit = 2000;
    const cookieLifetime = 7 * 24 * 60 * 60;
    const controls = document.querySelectorAll('#page-header, #page-header2, .top-top-bar, .filter-container, .btnfilter-mobile');
    const lowerControls = document.querySelectorAll('#o46-b2b-contact-widget, #totop');
    let reachedScrollLimit = false;
    let dismissed = false;
    let frame = 0;

    function consentReady() {
        return typeof ConsentManager !== 'undefined'
            ? ConsentManager.hasResponse()
            : popup.dataset.consentRequired !== '1';
    }

    function wasDismissed() {
        try {
            return document.cookie.split(';').some(cookie => cookie.trim() === cookieName + '=1');
        } catch {
            return false;
        }
    }

    function update() {
        frame = 0;
        if (dismissed || !reachedScrollLimit || !consentReady() || wasDismissed()) {
            popup.hidden = true;
            return;
        }

        let top = 12;
        for (const control of controls) {
            const rect = control.getBoundingClientRect();
            if (rect.width && rect.height && rect.right > 0 && rect.left < window.innerWidth
                && rect.bottom > 0 && rect.top < window.innerHeight / 3) {
                top = Math.max(top, Math.ceil(rect.bottom) + 12);
            }
        }
        let bottom = window.innerHeight - 12;
        for (const control of lowerControls) {
            if (control.getClientRects().length) {
                const controlTop = control.getBoundingClientRect().top;
                if (controlTop > 0) bottom = Math.min(bottom, controlTop - 12);
            }
        }
        const availableHeight = Math.floor(bottom - top);
        popup.style.setProperty('--o46-newsletter-top', top + 'px');
        popup.style.setProperty('--o46-newsletter-height', availableHeight + 'px');
        popup.hidden = availableHeight < 132;
    }

    function scheduleUpdate() {
        if (reachedScrollLimit && !dismissed && !frame) frame = window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', function () {
        reachedScrollLimit = reachedScrollLimit || window.scrollY >= scrollLimit;
        scheduleUpdate();
    }, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('pageshow', scheduleUpdate);
    document.addEventListener('consent-change', scheduleUpdate);

    popup.querySelector('.o46-b2b-newsletter-close').addEventListener('click', function () {
        dismissed = true;
        popup.hidden = true;
        if (consentReady()) {
            try {
                // Host-only preference written only when the visitor dismisses the card.
                document.cookie = cookieName + '=1; Max-Age=' + cookieLifetime + '; Path=/; SameSite=Lax; Secure';
            } catch {
                // The card stays closed in this document when the browser blocks cookies.
            }
        }
    });
});
    O46Core.installed.newsletter = true;
};

/* shopMode: shared by main, cat, item, vue. */
O46Core.shopMode = O46Core.shopMode || function () {
    if (O46Core.installed.shopMode) return;
(function(){
  const HOST_B2B = 'b2b.outlet46.de';
  const URL_B2C  = 'https://www.outlet46.de';
  const COOKIE   = 'o46_shop_mode';
  const DAYS     = 30; // Ablauf in 30 Tagen
  const isBot    = /bot|crawl|spider|slurp|bingpreview|monitoring/i.test(navigator.userAgent||'');

  function getCookie(n){ 
    return document.cookie.split('; ').find(x=>x.startsWith(n+'='))?.split('=')[1]; 
  }
  function setCookie(n,v,days,domain){
    const d=new Date(); 
    d.setTime(d.getTime()+days*864e5);
    document.cookie=`${n}=${v};expires=${d.toUTCString()};path=/;domain=${domain};SameSite=Lax`;
  }

    if(location.hostname===HOST_B2B && !isBot){
      const pref = getCookie(COOKIE);
      if(pref !== 'b2b'){
        const modal = document.getElementById('shop-mode-modal');
        const b2b = document.getElementById('smm-b2b');
        const b2c = document.getElementById('smm-b2c');
        if (!modal || !b2b || !b2c) return;

        // Keep the existing two-second opening delay.
        const openTimer = setTimeout(() => {
          modal.classList.remove('smm-hidden');
          modal.setAttribute('aria-hidden','false');
        }, 2000);

        function closeModal() {
          clearTimeout(openTimer);
          document.removeEventListener('keydown', onKeydown);
          modal.remove();
        }
        function onKeydown(event) {
          if (event.key === 'Escape') closeModal();
        }

        b2b.addEventListener('click',()=>{
          setCookie(COOKIE, 'b2b', DAYS, '.outlet46.de');
          closeModal();
        });
        b2c.addEventListener('click',()=>{
          closeModal();
          location.href = URL_B2C;
        });

        modal.addEventListener('click',(e)=>{ if(e.target===modal) closeModal(); });
        document.addEventListener('keydown', onKeydown);
      }
    }

})();
    O46Core.installed.shopMode = true;
};

/* matrix: shared by main, cat, item, vue. */
O46Core.matrix = O46Core.matrix || function () {
    if (O46Core.installed.matrix) return;
(function () {
  // === SETTINGS ===
  var STOCK_CAP = 200;                  // Anzeige + Kauf/Clamp Maximum
  var FETCH_TIMEOUT_MS = 6000;          // Fallback for one variation
  var BATCH_TIMEOUT_MS = 30000;         // Transport timeout for the more expensive multi-search
  var BATCH_MAX_IDS = 300;              // VariationBatchResource limit per request
  var CONCURRENCY = 6;                  // nur für Fallback-Einzelcalls bei Varianten-Daten

  // Add-to-basket: EIN Batch-POST statt mehrere Einzel-POSTs
  var ADD_TIMEOUT_MS = 90000;           // max. Wartezeit auf den Batch-Add
  var BASKET_BATCH_ENDPOINT = "/rest/io/basket/items/";

  // Vorprüfung + Fehlerfall-Absicherung
  var BASKET_GET_TIMEOUT_MS = 12000;

  // Notice Box
  var EG_NOTICE_FORCE = true;
  var EG_NOTICE_TTL_MS = 6000;
  var EG_NOTICE_OFFSET_Y = 10;
  var EG_NOTICE_GAP_Y = 10;
  var EG_NOTICE_MAX = 3;

  // === PERF SAFETY: Script nur 1x laden ===
  if (window.__egSizeMatrixLoaded) return;
  window.__egSizeMatrixLoaded = true;

  // One observer per loaded matrix module, not per row or quickview opening.
  var matrixStickyFrame = null;
  function updateMatrixStickyOffset() {
    if (matrixStickyFrame != null) return;
    matrixStickyFrame = window.requestAnimationFrame(function () {
      matrixStickyFrame = null;
      var header = document.querySelector(".stickyhead");
      var offset = 0;
      if (header) {
        var style = window.getComputedStyle(header);
        if (style.position === "sticky" || style.position === "fixed") {
          offset = Math.ceil(header.getBoundingClientRect().height) + Math.max(0, parseFloat(style.top) || 0);
        }
      }
      var value = offset + "px";
      if (document.documentElement.style.getPropertyValue("--eg-matrix-sticky-top") !== value) {
        document.documentElement.style.setProperty("--eg-matrix-sticky-top", value);
      }
    });
  }
  updateMatrixStickyOffset();
  window.addEventListener("resize", updateMatrixStickyOffset, { passive: true });
  var matrixStickyHeader = document.querySelector(".stickyhead");
  if (matrixStickyHeader && window.ResizeObserver) {
    new ResizeObserver(updateMatrixStickyOffset).observe(matrixStickyHeader);
  }

  // One shared observer fits headings to their actual cells, without row listeners.
  function fitMatrixHeadingLabels(head) {
    if (!head || !head.isConnected || !head.getBoundingClientRect().width) return;
    var choices = [];
    var cells = head.querySelectorAll("[data-eg-col]");
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      if (!cell.clientWidth) continue;
      var full = cell.querySelector(".eg-label-full");
      if (!full) continue;
      var style = window.getComputedStyle(cell);
      var available = cell.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      // Resolved CSS widths share clientWidth's coordinate space, including CSS zoom.
      var fullWidth = parseFloat(window.getComputedStyle(full).width);
      choices.push({ cell: cell, short: fullWidth > available + 0.25 });
    }
    choices.forEach(function (choice) {
      choice.cell.classList.toggle("eg-use-short-label", choice.short);
    });
    head.setAttribute("data-eg-labels-ready", "");
  }
  function refreshMatrixHeadingLabels() {
    document.querySelectorAll(".eg-size-matrix-head").forEach(fitMatrixHeadingLabels);
  }
  var matrixHeadingObserver = window.ResizeObserver ? new ResizeObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.target.isConnected) matrixHeadingObserver.unobserve(entry.target);
      else fitMatrixHeadingLabels(entry.target);
    });
  }) : null;
  function initMatrixHeadingLabels(matrix) {
    var head = matrix.querySelector(".eg-size-matrix-head");
    if (!head) return;
    if (matrixHeadingObserver) matrixHeadingObserver.observe(head);
    fitMatrixHeadingLabels(head);
  }
  function releaseMatrixHeadingLabels(root) {
    if (!matrixHeadingObserver || !root || root.nodeType !== 1 || root.isConnected) return;
    if (root.matches(".eg-size-matrix-head")) matrixHeadingObserver.unobserve(root);
    root.querySelectorAll(".eg-size-matrix-head").forEach(function (head) { matrixHeadingObserver.unobserve(head); });
  }
  if (!matrixHeadingObserver) window.addEventListener("resize", refreshMatrixHeadingLabels, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshMatrixHeadingLabels);

  // === CURRENCY / LOCALE ===
  function detectLocale() {
    var l = (document.documentElement.getAttribute("lang") || "").trim();
    if (!l) return "de-DE";
    if (l.indexOf("-") !== -1) return l;
    if (l === "de") return "de-DE";
    if (l === "en") return "en-US";
    if (l === "fr") return "fr-FR";
    if (l === "it") return "it-IT";
    if (l === "es") return "es-ES";
    return l;
  }

  function detectLangShort() {
    var l = (document.documentElement.getAttribute("lang") || "").trim().toLowerCase();
    if (!l) return "de";
    if (l.indexOf("-") !== -1) l = l.split("-")[0];
    if (l === "de" || l === "en" || l === "fr" || l === "it" || l === "es") return l;
    return "de";
  }

  function extractCurrencySymbol(text) {
    text = (text == null) ? "" : String(text);
    text = text.replace(/\s+/g, " ").trim();
    if (!text) return "";

    var m = text.match(/[€$£¥₺₽₩₪₹₫฿₴₦]/);
    if (m && m[0]) return m[0];

    var iso = text.toUpperCase().match(/\b([A-Z]{3})\b/);
    if (iso && iso[1]) {
      var map = {
        EUR: "€",
        USD: "$",
        GBP: "£",
        JPY: "¥",
        CNY: "¥",
        CHF: "CHF",
        PLN: "PLN",
        SEK: "SEK",
        NOK: "NOK",
        DKK: "DKK"
      };
      return map[iso[1]] || iso[1];
    }

    return "";
  }

  function detectCurrencySymbolFromHeader() {
    var selectors = [
      '[data-eg-title="Currency"]',
      '[data-eg-handler="modalContent"][data-eg-title="Currency"]',
      '[data-title="Currency"]',
      '[data-eg-currency]',
      '[data-currency]'
    ];

    for (var i = 0; i < selectors.length; i++) {
      var btn = document.querySelector(selectors[i]);
      if (!btn) continue;

      var sym = extractCurrencySymbol(btn.textContent || "");
      if (sym) return sym;
    }

    return "";
  }

  function detectCurrencySymbolFromAnyPrice() {
    var el =
      document.querySelector(".single-item-price") ||
      document.querySelector("[data-eg-item-price]") ||
      document.querySelector("[itemprop='price']") ||
      document.querySelector("[data-price]");

    if (!el) return "";

    var txt = "";
    try {
      txt = (el.closest && el.closest(".single-item-price") ? el.closest(".single-item-price").textContent : el.textContent) || "";
    } catch (e) {
      txt = el.textContent || "";
    }

    return extractCurrencySymbol(txt);
  }

  var EG_LOCALE = detectLocale();
  var EG_LANG = detectLangShort();
  var EG_CURRENCY_SYMBOL = detectCurrencySymbolFromHeader() || detectCurrencySymbolFromAnyPrice() || "€";

  var EG_NUMBER_FORMAT = new Intl.NumberFormat(EG_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  function maybeRefreshCurrencySymbol() {
    var s = detectCurrencySymbolFromHeader() || detectCurrencySymbolFromAnyPrice();
    if (s) EG_CURRENCY_SYMBOL = s;
  }

  // === I18N ===
  var EG_I18N = {
    de: {
      add_start: "Wird hinzugefügt...Bitte warten",
      add_uncertain: "Warenkorb bitte vor dem erneuten Hinzufügen prüfen.",
      added_ok: "Hinzugefügt ✓",
      not_addable: "Nicht verfügbar",
      err_add_fallback: "Fehler beim Hinzufügen.",
      info_some_limited: "Einige Mengen wurden an Bestand/Maximalmenge angepasst.",
      info_nothing_addable: "Nichts hinzugefügt – die gewünschte Menge ist bereits im Warenkorb oder aktuell nicht verfügbar."
    },
    en: {
      add_start: "Adding...Please wait",
      add_uncertain: "Please check your basket before adding again.",
      added_ok: "Added ✓",
      not_addable: "Not available",
      err_add_fallback: "Error adding item.",
      info_some_limited: "Some quantities were adjusted to stock/order limits.",
      info_nothing_addable: "Nothing added – the requested quantity is already in the basket or currently unavailable."
    },
    fr: {
      add_start: "Ajout en cours...Veuillez patienter",
      add_uncertain: "Veuillez vérifier votre panier avant un nouvel ajout.",
      added_ok: "Ajouté ✓",
      not_addable: "Indisponible",
      err_add_fallback: "Erreur lors de l'ajout.",
      info_some_limited: "Certaines quantités ont été ajustées selon le stock/les limites.",
      info_nothing_addable: "Rien n’a été ajouté – la quantité demandée est déjà dans le panier ou indisponible."
    },
    it: {
      add_start: "Aggiunta in corso...attendere",
      add_uncertain: "Controlla il carrello prima di aggiungere di nuovo.",
      added_ok: "Aggiunto ✓",
      not_addable: "Non disponibile",
      err_add_fallback: "Errore durante l'aggiunta.",
      info_some_limited: "Alcune quantità sono state adattate a stock/limiti.",
      info_nothing_addable: "Niente aggiunto – la quantità richiesta è già nel carrello o non disponibile."
    },
    es: {
      add_start: "Añadiendo...Espere",
      add_uncertain: "Comprueba la cesta antes de volver a añadir.",
      added_ok: "Añadido ✓",
      not_addable: "No disponible",
      err_add_fallback: "Error al añadir.",
      info_some_limited: "Algunas cantidades se ajustaron a stock/límites.",
      info_nothing_addable: "No se añadió nada – la cantidad solicitada ya está en el carrito o no está disponible."
    }
  };

  function t(key) {
    var pack = EG_I18N[EG_LANG] || EG_I18N.de;
    return (pack && pack[key]) ? pack[key] : (EG_I18N.de[key] || key);
  }

  (function watchCurrencySymbol() {
    if (!window.MutationObserver) return;

    var btn = document.querySelector('[data-eg-title="Currency"]') ||
              document.querySelector('[data-eg-handler="modalContent"][data-eg-title="Currency"]');

    if (!btn) return;

    var mo = new MutationObserver(function () {
      var sym = extractCurrencySymbol(btn.textContent || "");
      if (sym) EG_CURRENCY_SYMBOL = sym;
    });

    mo.observe(btn, { childList: true, subtree: true, characterData: true });
  })();

  // === HELPERS ===
  function formatEuro(n) {
    n = (typeof n === "number" && isFinite(n)) ? n : 0;
    return EG_NUMBER_FORMAT.format(n) + " " + EG_CURRENCY_SYMBOL;
  }

  function toInt(v) {
    var n = parseInt(v, 10);
    return isFinite(n) ? n : 0;
  }

  function getVariationsJson(matrix) {
    var wrap = matrix.closest("[data-item-variation][data-eg-variations]");
    if (!wrap) return null;

    var raw = wrap.getAttribute("data-eg-variations");
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function safeParseJsonAttr(el, attrName, fallback) {
    fallback = fallback || [];
    if (!el) return fallback;

    var raw = el.getAttribute(attrName);
    if (!raw) return fallback;

    try {
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function getAttrValueId(v, attrId) {
    if (!v || !v.attributes) return null;

    for (var i = 0; i < v.attributes.length; i++) {
      var a = v.attributes[i];
      if (String(a.attributeId) === String(attrId)) {
        return a.attributeValueId != null ? String(a.attributeValueId) : null;
      }
    }

    return null;
  }

  function buildValueNameMap(values) {
    var map = {};

    (values || []).forEach(function (v) {
      var id = v && (v.attributeValueId != null ? v.attributeValueId : v.id);
      if (id == null) return;

      map[String(id)] = v.name != null ? String(v.name) : "";
    });

    return map;
  }

  function buildValueImageMap(values) {
    var map = {};

    (values || []).forEach(function (v) {
      var id = v && (v.attributeValueId != null ? v.attributeValueId : v.id);
      if (id == null) return;

      map[String(id)] = v.imageUrl != null ? String(v.imageUrl) : "";
    });

    return map;
  }

  function normalizeImgUrl(u) {
    u = (u == null) ? "" : String(u);
    u = u.trim();
    if (!u) return "";

    u = u.replace(/\\/g, "/");

    if (/^https?:\/\//i.test(u)) return u;

    if (u.charAt(0) !== "/") u = "/" + u;
    u = u.replace(/\/{2,}/g, "/");

    return u;
  }

  function buildOrderMap(values) {
    var map = {};

    (values || []).forEach(function (v, idx) {
      var id = v && (v.attributeValueId != null ? v.attributeValueId : v.id);
      if (id == null) return;

      map[String(id)] = idx;
    });

    return map;
  }

  function capStockNumber(n) {
    n = (typeof n === "number" && isFinite(n)) ? n : 0;
    if (n < 0) n = 0;
    if (n > STOCK_CAP) return STOCK_CAP;
    return n;
  }

  function isQtyInput(el) {
    return !!(el && el.matches && el.matches("[data-eg-qty]"));
  }

  function selectQtyInput(el) {
    if (!el) return;

    setTimeout(function () {
      try {
        el.focus({ preventScroll: true });
      } catch (e0) {}

      try {
        el.select();
      } catch (e1) {}

      try {
        var v = String(el.value || "");
        el.setSelectionRange(0, v.length);
      } catch (e2) {}
    }, 0);
  }

  // === NOTICE BOX ===
  function egResolveInsertEl(insertSelector) {
    try {
      if (!insertSelector) return document.querySelector("[data-eg-size-matrix]") || document.body;
      if (insertSelector && insertSelector.nodeType === 1) return insertSelector;
      if (typeof insertSelector === "string") {
        return document.querySelector(insertSelector) || document.querySelector("[data-eg-size-matrix]") || document.body;
      }
    } catch (e) {}

    return document.body;
  }

  function egEnsureNoticeRoot() {
    var id = "eg-matrix-notice-root";
    var root = document.getElementById(id);

    if (root) return root;

    root = document.createElement("div");
    root.id = id;
    root.style.position = "fixed";
    root.style.left = "0";
    root.style.top = "0";
    root.style.width = "0";
    root.style.height = "0";
    root.style.zIndex = "2147483647";
    root.style.pointerEvents = "none";

    (document.body || document.documentElement).appendChild(root);

    return root;
  }

  function egCreateNoticeEl(type, message) {
    type = (type || "warning").toLowerCase();
    if (type !== "success" && type !== "error") type = "warning";

    var el = document.createElement("div");
    el.className = "eg-notice eg-notice--" + type;

    try { el.style.all = "initial"; } catch (e0) {}

    el.style.position = "fixed";
    el.style.boxSizing = "border-box";
    el.style.display = "flex";
    el.style.alignItems = "flex-start";
    el.style.gap = "10px";
    el.style.padding = "10px 12px";
    el.style.borderRadius = "10px";
    el.style.background = "#fff";
    el.style.color = "#111";
    el.style.fontFamily = "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif";
    el.style.fontSize = "14px";
    el.style.lineHeight = "1.35";
    el.style.boxShadow = "0 10px 28px rgba(0,0,0,0.18)";
    el.style.border = "1px solid rgba(0,0,0,0.18)";
    el.style.pointerEvents = "auto";
    el.style.maxWidth = "520px";
    el.style.width = "auto";
    el.style.zIndex = "2147483647";

    var bar = "#f0b429";
    if (type === "success") bar = "#1f9d55";
    if (type === "error") bar = "#d64545";

    el.style.borderLeft = "4px solid " + bar;

    var icon = document.createElement("div");
    try { icon.style.all = "initial"; } catch (e1) {}

    icon.style.marginTop = "1px";
    icon.style.flex = "0 0 auto";
    icon.style.width = "18px";
    icon.style.height = "18px";
    icon.style.borderRadius = "50%";
    icon.style.display = "inline-flex";
    icon.style.alignItems = "center";
    icon.style.justifyContent = "center";
    icon.style.fontFamily = "inherit";
    icon.style.fontSize = "12px";
    icon.style.lineHeight = "1";
    icon.style.color = "#fff";
    icon.style.background = bar;
    icon.textContent = type === "success" ? "✓" : (type === "error" ? "!" : "i");

    el.appendChild(icon);

    var txt = document.createElement("div");
    try { txt.style.all = "initial"; } catch (e2) {}

    txt.style.fontFamily = "inherit";
    txt.style.fontSize = "inherit";
    txt.style.lineHeight = "inherit";
    txt.style.color = "inherit";
    txt.style.flex = "1 1 auto";
    txt.textContent = String(message || "");

    el.appendChild(txt);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", "Close");

    try { btn.style.all = "initial"; } catch (e3) {}

    btn.style.cursor = "pointer";
    btn.style.flex = "0 0 auto";
    btn.style.width = "22px";
    btn.style.height = "22px";
    btn.style.lineHeight = "22px";
    btn.style.textAlign = "center";
    btn.style.borderRadius = "6px";
    btn.style.border = "1px solid rgba(0,0,0,0.18)";
    btn.style.background = "transparent";
    btn.style.color = "#333";
    btn.style.fontFamily = "inherit";
    btn.style.fontSize = "14px";
    btn.textContent = "×";

    btn.addEventListener("click", function () {
      try {
        el.remove();
      } catch (e) {
        if (el.parentNode) el.parentNode.removeChild(el);
      }

      egRelayoutNotices((el && el.__egAnchorEl) ? el.__egAnchorEl : null);
    });

    el.appendChild(btn);

    return el;
  }

  function egRelayoutNotices(anchorEl) {
    var root = egEnsureNoticeRoot();
    var anchor = anchorEl || root.__egLastAnchorEl || document.querySelector("[data-eg-size-matrix]") || document.body;

    var rect = null;

    try {
      rect = anchor.getBoundingClientRect();
    } catch (e) {
      rect = null;
    }

    if (!rect) {
      rect = {
        top: 12,
        left: 12,
        bottom: 12,
        width: (window.innerWidth || 1024) - 24,
        height: 0
      };
    }

    var vw = window.innerWidth || 1024;
    var vh = window.innerHeight || 768;

    var maxW = Math.min(520, Math.max(260, vw - 24));
    var left = Math.round(rect.left + (rect.width / 2) - (maxW / 2));

    left = Math.max(12, Math.min(left, vw - maxW - 12));

    var nodes = root.querySelectorAll(".eg-notice");
    if (!nodes || !nodes.length) return;

    for (var i = 0; i < nodes.length; i++) {
      nodes[i].style.maxWidth = maxW + "px";
      nodes[i].style.left = left + "px";
    }

    var totalH = 0;

    for (var j = 0; j < nodes.length; j++) {
      totalH += (nodes[j].offsetHeight || 0) + (j ? EG_NOTICE_GAP_Y : 0);
    }

    var baseBottomTop = Math.round(rect.bottom + EG_NOTICE_OFFSET_Y);
    var preferBottom = (baseBottomTop + totalH <= vh - 12);

    var y = preferBottom
      ? baseBottomTop
      : Math.round(rect.top - EG_NOTICE_OFFSET_Y - totalH);

    if (y < 12) y = 12;

    var curY = y;

    for (var k = 0; k < nodes.length; k++) {
      var n = nodes[k];
      n.style.top = curY + "px";
      curY += (n.offsetHeight || 0) + EG_NOTICE_GAP_Y;
    }
  }

  function egShowNotice(type, message, insertSelector, ttlMs) {
    ttlMs = toInt(ttlMs) || EG_NOTICE_TTL_MS;

    var root = egEnsureNoticeRoot();
    var anchorEl = egResolveInsertEl(insertSelector);

    root.__egLastAnchorEl = anchorEl;

    try {
      var existing = root.querySelectorAll(".eg-notice");
      if (existing && existing.length >= EG_NOTICE_MAX) {
        try {
          existing[0].remove();
        } catch (e0) {
          if (existing[0] && existing[0].parentNode) existing[0].parentNode.removeChild(existing[0]);
        }
      }
    } catch (e1) {}

    var el = egCreateNoticeEl(type, message);
    el.__egAnchorEl = anchorEl;

    root.appendChild(el);
    egRelayoutNotices(anchorEl);

    try {
      if (!root.__egBound) {
        root.__egBound = true;

        window.addEventListener("resize", function () {
          egRelayoutNotices(root.__egLastAnchorEl || null);
        }, { passive: true });

        window.addEventListener("scroll", function () {
          egRelayoutNotices(root.__egLastAnchorEl || null);
        }, { passive: true });
      }
    } catch (e2) {}

    if (ttlMs > 0) {
      setTimeout(function () {
        if (!el || !el.parentNode) return;

        try {
          el.remove();
        } catch (e) {
          if (el.parentNode) el.parentNode.removeChild(el);
        }

        egRelayoutNotices(anchorEl);
      }, ttlMs);
    }

    return el;
  }

  function showInfoToast(message, insertSelector, msgType) {
    insertSelector = insertSelector || "[data-eg-size-matrix]";
    msgType = (msgType == null) ? 1 : toInt(msgType);

    var type = "warning";
    if (msgType === 0) type = "success";
    else if (msgType === 2) type = "error";

    if (!EG_NOTICE_FORCE) {
      try {
        var ui = (window.eGuardians && eGuardians.ui && eGuardians.ui.message) ? eGuardians.ui.message : null;
        var insertEl = egResolveInsertEl(insertSelector);
        var target = ui ? ((type === "success") ? ui.success : ((type === "error") ? ui.error : ui.warning)) : null;

        if (target && target.show) {
          target.show({
            message: message,
            insertElement: insertEl
          });
          return;
        }
      } catch (e0) {}
    }

    egShowNotice(type, message, insertSelector, EG_NOTICE_TTL_MS);
  }

  function showErrorToast(message, insertSelector) {
    insertSelector = insertSelector || "[data-eg-size-matrix]";

    try {
      var ui = (window.eGuardians && eGuardians.ui && eGuardians.ui.message) ? eGuardians.ui.message : null;
      var insertEl = egResolveInsertEl(insertSelector);

      if (ui && ui.error && typeof ui.error.show === "function") {
        ui.error.show({
          message: message || t("err_add_fallback"),
          insertElement: insertEl
        });
        return;
      }
    } catch (e) {}

    showInfoToast(message || t("err_add_fallback"), insertSelector, 2);
  }

  // === ORDER MAX HELPERS ===
  function extractOrderMaxFromObj(obj) {
    try {
      if (!obj) return null;

      var candidates = [
        obj.maximumOrderQuantity,
        obj.maxOrderQuantity,
        obj.orderMaxQuantity,
        obj.orderMax,
        obj.maxOrder,
        obj.orderQuantityMaximum,
        obj.orderQuantityMax
      ];

      if (obj.variation) {
        candidates.push(
          obj.variation.maximumOrderQuantity,
          obj.variation.maxOrderQuantity,
          obj.variation.orderMaxQuantity,
          obj.variation.orderMax,
          obj.variation.maxOrder,
          obj.variation.orderQuantityMaximum,
          obj.variation.orderQuantityMax
        );
      }

      if (obj.data && obj.data.variation) {
        candidates.push(
          obj.data.variation.maximumOrderQuantity,
          obj.data.variation.maxOrderQuantity,
          obj.data.variation.orderMaxQuantity,
          obj.data.variation.orderMax,
          obj.data.variation.maxOrder
        );
      }

      if (obj.variation && obj.variation.data && obj.variation.data.variation) {
        var vv = obj.variation.data.variation;
        candidates.push(
          vv.maximumOrderQuantity,
          vv.maxOrderQuantity,
          vv.orderMaxQuantity,
          vv.orderMax,
          vv.maxOrder,
          vv.orderQuantityMaximum,
          vv.orderQuantityMax
        );
      }

      for (var i = 0; i < candidates.length; i++) {
        var v = candidates[i];
        if (v == null) continue;

        var n = parseInt(v, 10);
        if (isFinite(n) && n > 0) return n;
      }
    } catch (e) {}

    return null;
  }

  // === REQUEST CACHE ===
  var vCache = {};
  var vInflight = {};
  var vBatchInflight = {};

  function pickEanFromBarcodes(barcodes) {
    if (!barcodes || !barcodes.length) return null;

    for (var i = 0; i < barcodes.length; i++) {
      var b = barcodes[i];
      if (!b) continue;

      var code = b.code != null ? String(b.code) : "";
      if (!code) continue;

      var txt = "";
      if (b.type != null) txt += " " + String(b.type);
      if (b.barcodeType != null) txt += " " + String(b.barcodeType);
      if (b.name != null) txt += " " + String(b.name);
      if (b.barcode != null) txt += " " + String(b.barcode);

      txt = txt.toLowerCase();

      if (txt.indexOf("ean") !== -1 || [b.type, b.barcodeType].some(function (type) {
        return /^gtin_(?:8|13|14|128)$/i.test(String(type ?? "").trim());
      })) return code;
    }

    for (var j = 0; j < barcodes.length; j++) {
      var bb = barcodes[j];
      if (bb && bb.code) return String(bb.code);
    }

    return null;
  }

  function pickImages(images) {
    if (!images) return [];

    var arr = (images.variation && images.variation.length)
      ? images.variation
      : (images.all && images.all.length ? images.all : []);

    if (!arr || !arr.length) return [];

    var out = [];

    for (var i = 0; i < arr.length; i++) {
      var im = arr[i];
      if (!im) continue;

      out.push({
        url: im.url || im.urlLarge || null,
        urlMiddle: im.urlMiddle || im.url || null,
        urlPreview: im.urlPreview || im.urlMiddle || im.url || null,
        position: (typeof im.position === "number") ? im.position : 9999
      });
    }

    out.sort(function (a, b) {
      return a.position - b.position;
    });

    return out;
  }

  function fetchVariationsBatch(variationIds, cb) {
    cb = cb || function () {};

    variationIds = Array.from(new Set((variationIds || []).map(toInt).filter(Boolean)));

    var missingIds = [];

    for (var i = 0; i < variationIds.length; i++) {
      var id = variationIds[i];

      if (!Object.prototype.hasOwnProperty.call(vCache, id)) {
        missingIds.push(id);
      }
    }

    if (!missingIds.length) return cb();

    missingIds.sort(function (a, b) {
      return a - b;
    });

    if (!window.eGuardians || !eGuardians.apiservice || !eGuardians.apiservice.get) return cb();

    // Process at most one chunk at a time. Missing rows in completed chunks
    // retain the usual bounded single-item fallback after all chunks finish.
    var offset = 0;
    function nextChunk() {
      if (offset >= missingIds.length) return cb();
      var ids = missingIds.slice(offset, offset + BATCH_MAX_IDS);
      offset += ids.length;
      fetchVariationChunk(ids.join(","), nextChunk);
    }
    nextChunk();
  }

  function fetchVariationChunk(key, cb) {
    if (vBatchInflight[key]) {
      vBatchInflight[key].push(cb);
      return;
    }

    var callbacks = [cb];
    vBatchInflight[key] = callbacks;

    // Success and transport errors both complete this request. Starting the
    // single-row fallback from a separate timer races a still-running batch.
    eGuardians.apiservice.get("/rest/io/variations/batch", { ids: key }, function (response) {
      if (vBatchInflight[key] !== callbacks) return;

      try {
        var top = response && response.data ? response.data : null;
        var payload = (top && top.data && typeof top.data === "object") ? top.data : top;

        var items = (payload && payload.items && typeof payload.items === "object") ? payload.items : {};
        var missing = (payload && Array.isArray(payload.missing)) ? payload.missing : [];

        Object.keys(items).forEach(function (k) {
          var id = toInt(k);
          if (!id) return;

          try {
            var om = extractOrderMaxFromObj(items[k]);
            if (om != null && !items[k].orderMax) {
              items[k].orderMax = om;
            }
          } catch (e0) {}

          vCache[id] = items[k];
        });

        for (var mi = 0; mi < missing.length; mi++) {
          var mid = toInt(missing[mi]);
          if (!mid) continue;

          if (!Object.prototype.hasOwnProperty.call(vCache, mid)) {
            vCache[mid] = null;
          }
        }
      } catch (e) {}

      delete vBatchInflight[key];

      for (var x = 0; x < callbacks.length; x++) callbacks[x]();
    }, "json", BATCH_TIMEOUT_MS);
  }

  function fetchVariationDetailsSingle(variationId, cb) {
    variationId = toInt(variationId);
    if (!variationId) return cb(null);

    if (Object.prototype.hasOwnProperty.call(vCache, variationId)) {
      return cb(vCache[variationId]);
    }

    if (vInflight[variationId]) {
      vInflight[variationId].push(cb);
      return;
    }

    vInflight[variationId] = [cb];

    if (!window.eGuardians || !eGuardians.apiservice || !eGuardians.apiservice.get) {
      vCache[variationId] = null;

      var list0 = vInflight[variationId] || [];
      delete vInflight[variationId];

      for (var k0 = 0; k0 < list0.length; k0++) list0[k0](null);
      return;
    }

    var params = {
      template: encodeURI("Ceres::Item.SingleItem")
    };

    eGuardians.apiservice.get("/rest/io/variations/" + variationId, params, function (response) {
      var out = null;

      try {
        var d = response &&
          response.data &&
          response.data.documents &&
          response.data.documents[0] &&
          response.data.documents[0].data;

        if (d) {
          var orderMax = extractOrderMaxFromObj(d);

          out = {
            id: variationId,
            stock: (d.stock && typeof d.stock.net !== "undefined") ? d.stock.net : null,
            price: (d.prices && d.prices.default && d.prices.default.unitPrice && typeof d.prices.default.unitPrice.value !== "undefined")
              ? d.prices.default.unitPrice.value
              : null,
            ean: pickEanFromBarcodes(d.barcodes),
            images: pickImages(d.images),
            orderMax: orderMax
          };
        }
      } catch (e) {
        out = null;
      }

      vCache[variationId] = out;

      var list = vInflight[variationId] || [];
      delete vInflight[variationId];

      for (var k = 0; k < list.length; k++) list[k](out);
    }, "json", FETCH_TIMEOUT_MS);
  }

  function fetchVariationDetails(variationId, cb) {
    variationId = toInt(variationId);
    if (!variationId) return cb(null);

    if (Object.prototype.hasOwnProperty.call(vCache, variationId)) {
      return cb(vCache[variationId]);
    }

    return fetchVariationDetailsSingle(variationId, cb);
  }

  function runQueue(tasks, concurrency, done) {
    concurrency = concurrency || 4;

    var i = 0;
    var running = 0;
    var finished = 0;

    function next() {
      if (finished >= tasks.length) {
        if (done) done();
        return;
      }

      while (running < concurrency && i < tasks.length) {
        (function (task) {
          running++;

          task(function () {
            running--;
            finished++;
            next();
          });
        })(tasks[i++]);
      }
    }

    next();
  }

  // === ROW / QTY / TOTALS ===
  function setRowStock(row, rawStock, allowFallback) {
    var stockEl = row._egStockEl || (row._egStockEl = row.querySelector("[data-eg-stock]"));
    if (!stockEl) return;

    if (rawStock == null || !isFinite(rawStock)) {
      stockEl.textContent = "–";
      stockEl.removeAttribute("data-eg-stock-net");

      if (allowFallback) {
        stockEl.setAttribute("data-eg-stock-raw", String(STOCK_CAP));
      } else {
        stockEl.removeAttribute("data-eg-stock-raw");
      }

      return;
    }

    rawStock = parseInt(rawStock, 10);
    if (!isFinite(rawStock)) rawStock = 0;
    if (rawStock < 0) rawStock = 0;

    stockEl.setAttribute("data-eg-stock-net", String(rawStock));

    var capped = capStockNumber(rawStock);
    stockEl.setAttribute("data-eg-stock-raw", String(capped));
    stockEl.textContent = (rawStock > STOCK_CAP) ? ("+" + STOCK_CAP) : String(capped);
  }

  function getRowStockCap(row) {
    var stockEl = row._egStockEl || (row._egStockEl = row.querySelector("[data-eg-stock]"));

    var stock = STOCK_CAP;

    if (stockEl) {
      var raw = stockEl.getAttribute("data-eg-stock-raw");

      if (raw != null && raw !== "") {
        stock = parseInt(raw, 10);
        if (!isFinite(stock) || stock < 0) stock = 0;
      } else {
        var txt = (stockEl.textContent || "").trim();

        if (txt.indexOf("+") === 0) {
          stock = STOCK_CAP;
        } else {
          var parsed = parseInt(txt.replace(/[^\d-]/g, ""), 10);
          stock = (isFinite(parsed) && parsed >= 0) ? parsed : STOCK_CAP;
        }
      }
    }

    return capStockNumber(stock);
  }

  function getRowStockNet(row) {
    if (!row) return null;

    var stockEl = row._egStockEl || (row._egStockEl = row.querySelector("[data-eg-stock]"));
    if (!stockEl) return null;

    var raw = stockEl.getAttribute("data-eg-stock-net");
    if (raw != null && raw !== "") {
      var n = parseInt(raw, 10);
      if (isFinite(n)) return n;
    }

    return null;
  }

  function getRowStockNetForVid(matrix, vid) {
    try {
      if (!matrix) return null;

      var row = matrix.querySelector('.eg-row[data-eg-variation-id="' + String(vid) + '"]');
      if (!row) return null;

      return getRowStockNet(row);
    } catch (e) {}

    return null;
  }

  function getRowOrderMaxReal(row) {
    if (!row) return null;

    var raw = row.getAttribute("data-eg-ordermax-raw");
    if (raw != null && raw !== "") {
      var n = parseInt(raw, 10);
      if (isFinite(n) && n > 0) return n;
    }

    return null;
  }

  function getRowOrderMaxRealForVid(matrix, vid) {
    try {
      if (!matrix) return null;

      var row = matrix.querySelector('.eg-row[data-eg-variation-id="' + String(vid) + '"]');
      if (!row) return null;

      return getRowOrderMaxReal(row);
    } catch (e) {}

    return null;
  }

  function setQtyByVariationId(matrix, variationId, qty) {
    if (!matrix) return;

    try {
      var row = matrix.querySelector('.eg-row[data-eg-variation-id="' + String(variationId) + '"]');
      if (!row) return;

      var qtyEl = row._egQtyEl || (row._egQtyEl = row.querySelector("[data-eg-qty]"));
      if (!qtyEl) return;

      qtyEl.value = String(Math.max(0, toInt(qty)));
      clampQtyToStock(row);
    } catch (e) {}
  }

  function preClampItemsAgainstBasket(items, basketQtyMap, matrix) {
    basketQtyMap = basketQtyMap || {};

    var out = [];
    var adjusted = 0;
    var blocked = 0;
    var requested = 0;

    for (var i = 0; i < (items || []).length; i++) {
      var it = items[i];
      if (!it) continue;

      var vid = String(toInt(it.variationId));
      if (!vid || vid === "0") continue;

      var want = toInt(it.quantity);
      if (!isFinite(want) || want <= 0) continue;

      requested++;

      var inBasket = toInt(basketQtyMap[vid] || 0);
      if (!isFinite(inBasket) || inBasket < 0) inBasket = 0;

      var stockNet = getRowStockNetForVid(matrix, vid);
      var orderMaxReal = getRowOrderMaxRealForVid(matrix, vid);

      var remainingStock = Infinity;
      if (typeof stockNet === "number" && isFinite(stockNet)) {
        remainingStock = stockNet - inBasket;
        if (!isFinite(remainingStock) || remainingStock < 0) remainingStock = 0;
      }

      var remainingOrder = Infinity;
      if (typeof orderMaxReal === "number" && isFinite(orderMaxReal)) {
        remainingOrder = orderMaxReal - inBasket;
        if (!isFinite(remainingOrder) || remainingOrder < 0) remainingOrder = 0;
      }

      var allowed = Math.min(STOCK_CAP, remainingStock, remainingOrder);

      if (!isFinite(allowed) || allowed < 0) allowed = 0;
      allowed = capStockNumber(allowed);

      if (allowed <= 0) {
        blocked++;
        setQtyByVariationId(matrix, vid, 0);
        it.quantity = 0;
        continue;
      }

      if (want > allowed) {
        adjusted++;
        want = allowed;
      }

      it.quantity = want;
      setQtyByVariationId(matrix, vid, want);

      out.push({
        variationId: vid,
        quantity: want
      });
    }

    return {
      items: out,
      adjusted: adjusted,
      blocked: blocked,
      requested: requested
    };
  }

  function clampQtyToStock(row) {
    var qtyEl = row._egQtyEl || (row._egQtyEl = row.querySelector("[data-eg-qty]"));
    if (!qtyEl) return;

    var stock = getRowStockCap(row);
    var orderMaxReal = getRowOrderMaxReal(row);

    var limit = STOCK_CAP;

    if (isFinite(stock)) limit = Math.min(limit, stock);
    if (orderMaxReal != null && isFinite(orderMaxReal)) limit = Math.min(limit, orderMaxReal);

    limit = capStockNumber(limit);

    qtyEl.max = String(limit);

    var rawVal = (qtyEl.value == null) ? "" : String(qtyEl.value);
    var cleaned = rawVal.replace(/[^\d]/g, "");

    if (cleaned !== rawVal) {
      qtyEl.value = cleaned;
      rawVal = cleaned;
    }

    // Leer erlauben, damit Backspace sauber funktioniert
    if (rawVal === "") return;

    var q = toInt(rawVal);

    if (q > limit) q = limit;
    if (q < 0) q = 0;

    qtyEl.value = String(q);
  }

  function scheduleRecalc(matrix) {
    if (!matrix) return;
    if (matrix._egRecalcScheduled) return;

    matrix._egRecalcScheduled = true;

    (window.requestAnimationFrame || function (fn) {
      return setTimeout(fn, 16);
    })(function () {
      matrix._egRecalcScheduled = false;
      recalcMatrixTotals(matrix);
    });
  }

  function recalcMatrixTotals(matrix) {
    maybeRefreshCurrencySymbol();
    var totalQty = 0;
    var totalSum = 0;

    var rows = matrix.querySelectorAll(".eg-row");

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];

      clampQtyToStock(row);

      var qtyEl = row._egQtyEl || (row._egQtyEl = row.querySelector("[data-eg-qty]"));
      var q = qtyEl ? toInt(qtyEl.value) : 0;

      var priceEl = row._egPriceEl || (row._egPriceEl = row.querySelector("[data-eg-price]"));
      var pv = priceEl ? parseFloat(priceEl.getAttribute("data-eg-price-value") || "0") : 0;
      if (!isFinite(pv)) pv = 0;

      var sub = q * pv;

      var subEl = row._egSubEl || (row._egSubEl = row.querySelector("[data-eg-subtotal]"));
      if (subEl) subEl.textContent = formatEuro(sub);

      totalQty += q;
      totalSum += sub;
    }

    var tq = matrix.querySelector("[data-eg-total-qty]");
    var ts = matrix.querySelector("[data-eg-total-sum]");

    if (tq) tq.textContent = String(totalQty);
    if (ts) ts.textContent = formatEuro(totalSum);
  }

  // === BASKET UI ===
  function addItemsToBasketBatch(items) {
    var basketItems = items.map(function (item) {
      return { variationId: toInt(item.variationId), quantity: toInt(item.quantity) };
    });
    return new Promise(function (resolve, reject) {
      eGuardians.apiservice.post(BASKET_BATCH_ENDPOINT, { basketItems: basketItems }, function (response, status) {
        var error = O46Core.basketAddError(response, status);
        if (error === null) return resolve(response);
        var failure = new Error(error);
        // IO can reject a row after other rows/bundle components have been added.
        if (status === 400 && /^(110|111|112|113|114)$/.test(error)) {
          var reason = window.messageServiceTranslations?.[error];
          var stock = response?.data?.placeholder?.stock;
          if (reason && reason.includes(":stock")) {
            reason = (typeof stock === "number" || typeof stock === "string") && /^\d+(?:\.\d+)?$/.test(String(stock))
              ? reason.replace(":stock", String(stock)) : "";
          }
          failure.basketReason = reason;
        }
        reject(failure);
      }, "json", ADD_TIMEOUT_MS);
    });
  }

  // === BASKET SNAPSHOT / DELTA CHECK ===
  function getBasketSnapshot() {
    return new Promise(function (resolve, reject) {
      function receive(response, status) {
        var rows = response?.data?.data ?? response?.data ?? response;
        if ((status != null && (status < 200 || status >= 300)) || !Array.isArray(rows)) {
          return reject(new Error("Invalid basket items response"));
        }

        var qtyMap = {};
        for (var row of rows) {
          var id = row?.variationId ?? row?.variation?.data?.variation?.id;
          var quantity = row?.quantity;
          if (id == null || !/^\d+$/.test(String(id)) || !Number.isSafeInteger(Number(id)) ||
              (typeof quantity !== "number" && typeof quantity !== "string") ||
              String(quantity).trim() === "" || !Number.isFinite(Number(quantity)) || Number(quantity) < 0) {
            return reject(new Error("Invalid basket item"));
          }
          if (Number(id) > 0) qtyMap[id] = (qtyMap[id] || 0) + Number(quantity);
        }
        resolve({ qtyMap: qtyMap });
      }
      if (window.eGuardians?.apiservice?.get) {
        eGuardians.apiservice.get(BASKET_BATCH_ENDPOINT, {}, receive, "json", BASKET_GET_TIMEOUT_MS);
        return;
      }
      var controller = new AbortController();
      var timer = setTimeout(function () { controller.abort(); }, BASKET_GET_TIMEOUT_MS);
      fetch(BASKET_BATCH_ENDPOINT, { credentials: "same-origin", cache: "no-store", signal: controller.signal })
        .then(async function (response) { receive(await response.json(), response.status); })
        .catch(reject)
        .finally(function () { clearTimeout(timer); });
    });
  }

  // === MAGICZOOM / PREVIEW ===
  function getZoomContextFromMatrix(matrix) {
    var inModal = false;

    try {
      inModal = !!(matrix && matrix.closest && matrix.closest(".modal-cross.show"));
    } catch (e) {
      inModal = false;
    }

    return {
      zoomId: inModal ? "ItemImgZoom2" : "ItemImgZoom",
      inModal: inModal
    };
  }

  function escapeHtml(s) {
    s = (s == null) ? "" : String(s);

    return s.replace(/[&<>"']/g, function (ch) {
      return ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[ch];
    });
  }

  function getProductTitleForGallery(matrix) {
    var scope = matrix && matrix.closest("article");
    var h1 = (scope || document).querySelector("h1");
    var t2 = (h1 && h1.textContent) ? h1.textContent : document.title;
    return String(t2 || "").trim();
  }

  function normalizeThumbUrl(u) {
    u = (u == null) ? "" : String(u);

    if (u.indexOf("/preview/") > -1) {
      u = u.replace("/preview/", "/secondPreview/");
    }

    return u;
  }

  function ensureZoomAnchor(zoomId) {
    var a = document.getElementById(zoomId);
    if (!a) return null;

    if (!a.id) a.id = zoomId;

    if (a.classList && !a.classList.contains("MagicZoom")) {
      a.classList.add("MagicZoom");
    }

    return a;
  }

  function setMainImageNow(zoomId, full, middle, title) {
    var a = ensureZoomAnchor(zoomId);
    if (!a) return;

    a.setAttribute("href", full);
    a.setAttribute("title", title || "");
    a.setAttribute("data-image", middle);
    a.setAttribute("data-zoom-image", full);

    var img = a.querySelector("img");

    if (img) {
      img.setAttribute("src", middle);
      img.setAttribute("alt", title || "");
      img.setAttribute("title", title || "");
    }
  }

  // One readiness callback for the existing vendor instance, never one per opening.
  var matrixZoomCallbacksReady = false;
  function initMatrixZoomCallbacks() {
    if (matrixZoomCallbacksReady) return true;
    if (!window.MagicZoom || typeof MagicZoom.registerCallback !== "function") return false;
    MagicZoom.registerCallback("onZoomReady", function (id) {
      var anchor = document.getElementById(id);
      var pending = anchor && anchor._egMatrixExpand;
      if (!pending) return;
      if (!pending.matrix.isConnected || !anchor.isConnected) return;
      var modal = pending.matrix.closest(".modal-cross");
      if (modal && !modal.classList.contains("show")) return;
      // v5.3.5 cannot safely stop an instance during its asynchronous image setup.
      // Coalesce taps until readiness, then build only the most recent gallery.
      var next = anchor._egMatrixNext;
      anchor._egMatrixNext = null;
      if (next) {
        updateMagicZoomWithGallery(next.matrix, id, next.images, next);
        return;
      }
      anchor._egMatrixExpand = null;
      if (toInt(pending.matrix.getAttribute("data-eg-preview-token")) !== pending.token) return;
      anchor._egMatrixExpanded = true;
      MagicZoom.expand(anchor);
    });
    MagicZoom.registerCallback("onExpandClose", function (id) {
      var anchor = document.getElementById(id);
      if (anchor) anchor._egMatrixExpanded = false;
    });
    matrixZoomCallbacksReady = true;
    return true;
  }

  function releaseMatrixZoom(root) {
    if (!root || root.nodeType !== 1) return;
    var matrices = root.matches("[data-eg-size-matrix]") ? [root] : root.querySelectorAll("[data-eg-size-matrix]");
    for (var i = 0; i < matrices.length; i++) {
      var anchor = matrices[i]._egMatrixZoomAnchor;
      if (!anchor) continue;
      anchor._egMatrixExpand = null;
      anchor._egMatrixNext = null;
      anchor._egMatrixExpanded = false;
      if (window.MagicZoom) MagicZoom.stop(anchor);
      matrices[i]._egMatrixZoomAnchor = null;
    }
  }

  function ensureQuickviewZoom(matrix) {
    var modal = matrix.closest(".modal-cross.show");
    var article = matrix.closest("article");
    if (!modal || !article) return;
    if (!article.querySelector("#ItemImgZoom2")) {
      // Quickview omits the PDP gallery markup. Keep one native gallery source
      // outside the matrix layout; the vendor renders its dialog on document.body.
      var host = document.createElement("div");
      host.className = "sr-only";
      host.setAttribute("aria-hidden", "true");
      host.innerHTML = '<a id="ItemImgZoom2" class="MagicZoom" tabindex="-1" data-options="zoomMode: off; transitionEffect: false; lazyZoom: true; cssClass: white-bg; hint: off;"><img width="44" height="36"></a><div class="single-prev-images"></div>';
      article.appendChild(host);
    }
    var jq = window.jQuery || window.$;
    if (jq && !modal._egMatrixZoomBound) {
      modal._egMatrixZoomBound = true;
      jq(modal).on("hide.bs.modal.egMatrixZoom", function () { releaseMatrixZoom(modal); });
    }
  }

  function updateMagicZoomWithGallery(matrix, zoomId, images, expandRequest) {
    if (!zoomId || !images || !images.length) return;
    if (!document.getElementById(zoomId)) return;
    if (!window.MagicZoom) return;

    var a = ensureZoomAnchor(zoomId);
    if (!a) return;

    var first = images[0] || null;
    if (!first) return;

    var firstFull = first.url || first.urlLarge || first.urlMiddle || first.urlPreview || null;
    var firstMiddle = first.urlMiddle || first.url || first.urlLarge || first.urlPreview || null;

    if (!firstFull || !firstMiddle) return;

    var scope = matrix.closest("article") || document;
    var prev = scope.querySelector(".single-prev-images");

    // Dispose selector handlers before replacing their elements.
    a._egMatrixExpand = null;
    MagicZoom.stop(zoomId);

    var ttl = getProductTitleForGallery(matrix);
    var ttlEsc = escapeHtml(ttl);

    if (prev) {
      var html = "";

      for (var i = 0; i < images.length; i++) {
        var im = images[i];
        if (!im) continue;

        var full = im.url || im.urlLarge || im.urlMiddle || im.urlPreview || null;
        var mid = im.urlMiddle || im.url || im.urlLarge || im.urlPreview || null;
        var th = im.urlPreview || im.urlMiddle || im.url || im.urlLarge || null;

        if (!full || !mid || !th) continue;

        th = normalizeThumbUrl(th);

        var cls = "white-bg mz-thumb" + (i === 0 ? " mz-thumb-selected" : "");

        html += '<a href="' + escapeHtml(full) + '" rel="zoom-id:' + escapeHtml(zoomId) + '" data-image="' + escapeHtml(mid) + '" title="' + ttlEsc + '" data-stepindex="' + String(i) + '" class="' + cls + '">'
          + '<img src="' + escapeHtml(th) + '" data-src="' + escapeHtml(th) + '" alt="' + ttlEsc + '" title="' + ttlEsc + '" class="lozad" width="100%" height="100%" data-loaded="true" />'
          + "</a>";
      }

      if (html) prev.innerHTML = html;
      if (prev.closest('[aria-hidden="true"]')) {
        prev.querySelectorAll("a").forEach(function (selector) { selector.tabIndex = -1; });
      }
    }

    setMainImageNow(zoomId, firstFull, firstMiddle, ttl);

    // Rebuild this gallery from the current anchor and selectors without a click.
    a._egMatrixExpand = expandRequest || null;
    matrix._egMatrixZoomAnchor = a;
    var options = a.getAttribute("data-options");
    // v5.3.5's lazy readiness only covers the small image. For an explicit
    // expansion request load the selected large image, then use onZoomReady.
    if (expandRequest) a.setAttribute("data-options", (options || "").replace(/lazyZoom\s*:[^;]*/gi, "") + "; lazyZoom: false;");
    try {
      MagicZoom.start(zoomId);
    } finally {
      if (expandRequest) {
        if (options == null) a.removeAttribute("data-options");
        else a.setAttribute("data-options", options);
      }
    }
  }

  function setActiveRow(matrix, row) {
    if (!matrix || !row) return;

    var old = matrix.querySelector(".eg-row.eg-active");

    if (old && old !== row) {
      old.classList.remove("eg-active");
    }

    row.classList.add("eg-active");
  }

  function previewVariationFromRow(matrix, row, force, expand) {
    if (!matrix || !row) return;

    var vid = row.getAttribute("data-eg-variation-id");
    if (!vid) return;

    // The row already obtained these images from the existing variation batch.
    // A tap must not trigger a new detail/image service request or show an old image.
    var cached = expand && vCache[toInt(vid)];
    if (expand && (!cached || !cached.images || !cached.images.length || !initMatrixZoomCallbacks())) return;
    var ctx = getZoomContextFromMatrix(matrix);
    var anchor = document.getElementById(ctx.zoomId);
    if (expand && anchor && anchor._egMatrixExpanded) return;

    if (!force) {
      var last = matrix.getAttribute("data-eg-preview-vid");
      if (last && String(last) === String(vid)) return;
    }

    matrix.setAttribute("data-eg-preview-vid", String(vid));

    var token = (toInt(matrix.getAttribute("data-eg-preview-token")) || 0) + 1;
    matrix.setAttribute("data-eg-preview-token", String(token));

    if (expand) {
      if (ctx.inModal) ensureQuickviewZoom(matrix);
      anchor = document.getElementById(ctx.zoomId);
      var request = { matrix: matrix, token: token, images: cached.images };
      if (anchor && anchor._egMatrixExpand) anchor._egMatrixNext = request;
      else updateMagicZoomWithGallery(matrix, ctx.zoomId, cached.images, request);
      return;
    }

    fetchVariationDetails(vid, function (v) {
      var cur = toInt(matrix.getAttribute("data-eg-preview-token"));
      if (cur !== token) return;

      function useImages(imgs) {
        if (!matrix.isConnected || toInt(matrix.getAttribute("data-eg-preview-token")) !== token) return;
        if (!imgs || !imgs.length) return;
        updateMagicZoomWithGallery(matrix, ctx.zoomId, imgs);
      }

      if (!v || !v.images || !v.images.length) {
        fetchVariationDetailsSingle(vid, function (v2) {
          var cur2 = toInt(matrix.getAttribute("data-eg-preview-token"));
          if (cur2 !== token) return;
          if (!v2 || !v2.images || !v2.images.length) return;

          useImages(v2.images);
        });

        return;
      }

      useImages(v.images);
    });
  }

  // === ROW BUILDING ===
  function buildZoomSpan() {
    var z = document.createElement("span");

    z.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="s-icon s-icon-icon-zoom-in" viewBox="0 0 16 16">' +
      '<path fill-rule="evenodd" d="m14.473 13.526-2.453-2.453a5.975 5.975 0 0 0 1.314-3.74 6 6 0 1 0-6 6 5.975 5.975 0 0 0 3.74-1.313l2.453 2.453c.26.26.687.26.947 0a.672.672 0 0 0 0-.947ZM2.668 7.333a4.663 4.663 0 0 1 4.667-4.667A4.663 4.663 0 0 1 12 7.333a4.673 4.673 0 0 1-1.34 3.273.142.142 0 0 1-.033.02l-.007.007c-.006.007-.013.02-.02.027a4.663 4.663 0 0 1-7.933-3.327Zm7.333 0A.67.67 0 0 1 9.334 8H8v1.333C8 9.7 7.7 10 7.333 10a.669.669 0 0 1-.666-.667V8H5.334a.669.669 0 0 1-.667-.667c0-.367.3-.667.667-.667h1.333V5.333c0-.367.3-.667.667-.667.366 0 .666.3.666.667v1.333h1.334c.366 0 .666.3.666.667Z"></path>' +
      "</svg>";

    return z;
  }

  function buildColorLink(textFallback, imgUrl) {
    var span = document.createElement("span");

    span.className = "eg-color-link";
    span.setAttribute("data-eg-color-preview", "1");
    span.title = textFallback || "";

    if (imgUrl) {
      var img = document.createElement("img");
      img.src = imgUrl;
      img.alt = textFallback || "";
      img.loading = "lazy";
      img.decoding = "async";

      span.appendChild(img);
      span.appendChild(buildZoomSpan());
    } else {
      span.textContent = textFallback || "–";
    }

    return span;
  }

  function createRow(matrix, mode, labelA, labelB, colorImgUrl) {
    var row = document.createElement("div");
    row.className = "col-12 eg-row";

    function cell(text, colKey) {
      var d = document.createElement("div");
      d.className = "eg-cell";
      d.textContent = text;

      if (colKey) {
        d.setAttribute("data-eg-col", colKey);
        var heading = matrix.querySelector('.eg-size-matrix-head [data-eg-col="' + colKey + '"]');
        d.setAttribute("data-eg-label", heading ? (heading.getAttribute("data-eg-label") || heading.textContent.trim()) : colKey);
      }

      return d;
    }

    if (mode === "size_color") {
      row.appendChild(cell(labelA || "–", "size"));

      var colorCell = document.createElement("div");
      colorCell.className = "eg-cell";
      colorCell.setAttribute("data-eg-col", "color");
      colorCell.appendChild(buildColorLink(labelB || "–", colorImgUrl || ""));
      row.appendChild(colorCell);
    } else if (mode === "size") {
      row.appendChild(cell(labelA || "–", "size"));
    } else if (mode === "color") {
      var onlyColorCell = document.createElement("div");
      onlyColorCell.className = "eg-cell";
      onlyColorCell.setAttribute("data-eg-col", "color");
      onlyColorCell.appendChild(buildColorLink(labelA || "–", colorImgUrl || ""));
      row.appendChild(onlyColorCell);
    }

    var stockCell = cell("–", "stock");
    stockCell.setAttribute("data-eg-stock", "");
    row.appendChild(stockCell);

    var priceCell = cell("–", "price");
    priceCell.setAttribute("data-eg-price", "");
    priceCell.setAttribute("data-eg-price-value", "0");
    row.appendChild(priceCell);

    var details = document.createElement("div");
    details.className = "eg-row-details";
    var eanCell = cell("", "ean");
    var eanValue = document.createElement("span");
    eanValue.setAttribute("data-eg-ean", "");
    eanValue.textContent = "–";
    eanCell.appendChild(eanValue);
    details.appendChild(eanCell);
    var subCell = cell(formatEuro(0), "sub");
    subCell.setAttribute("data-eg-subtotal", "");
    details.appendChild(subCell);
    row.appendChild(details);

    var qtyWrap = document.createElement("div");
    qtyWrap.className = "eg-cell eg-qty-wrap";
    var qtyHeading = matrix.querySelector('.eg-size-matrix-head [data-eg-col="qty"]');
    var qtyLabel = qtyHeading ? (qtyHeading.getAttribute("data-eg-label") || qtyHeading.textContent.trim()) : "Quantity";
    qtyWrap.setAttribute("data-eg-label", qtyLabel);
    qtyWrap.setAttribute("data-eg-col", "qty");

    var qty = document.createElement("input");
    qty.type = "text";
    qty.setAttribute("pattern", "[0-9]*");
    qty.setAttribute("autocomplete", "off");
    qty.setAttribute("min", "0");
    qty.setAttribute("max", String(STOCK_CAP));
    qty.setAttribute("step", "1");
    qty.value = "0";
    qty.setAttribute("data-eg-qty", "");
    qty.setAttribute("inputmode", "numeric");
    qty.setAttribute("aria-label", qtyLabel + " " + [labelA, labelB].filter(Boolean).join(" / "));

    qtyWrap.appendChild(qty);
    row.appendChild(qtyWrap);

    return row;
  }

  function buildRows(matrix, variations) {
    var body = matrix.querySelector(".eg-size-matrix-body");
    if (!body) return [];
    maybeRefreshCurrencySymbol();

    body.innerHTML = "";

    var mode = (matrix.getAttribute("data-eg-mode") || "none").trim();
    var sizeAttrId = (matrix.getAttribute("data-eg-size-attribute-id") || "").trim();
    var colorAttrId = (matrix.getAttribute("data-eg-color-attribute-id") || "").trim();

    var sizeValues = safeParseJsonAttr(matrix, "data-eg-size-values", []);
    var colorValues = safeParseJsonAttr(matrix, "data-eg-color-values", []);

    var sizeName = buildValueNameMap(sizeValues);
    var colorName = buildValueNameMap(colorValues);

    var colorImg = buildValueImageMap(colorValues);

    var sizeOrder = buildOrderMap(sizeValues);
    var colorOrder = buildOrderMap(colorValues);

    var items = [];

    (variations || []).forEach(function (v) {
      if (!v || !v.variationId) return;

      var sId = sizeAttrId ? getAttrValueId(v, sizeAttrId) : null;
      var cId = colorAttrId ? getAttrValueId(v, colorAttrId) : null;

      items.push({
        variationId: String(v.variationId),
        sizeId: sId,
        colorId: cId,
        sizeLabel: sId && sizeName[sId] ? sizeName[sId] : (mode === "size" || mode === "size_color" ? "–" : ""),
        colorLabel: cId && colorName[cId] ? colorName[cId] : (mode === "color" || mode === "size_color" ? "–" : ""),
        colorImgUrl: (cId && colorImg[cId]) ? normalizeImgUrl(colorImg[cId]) : "",
        so: (sId != null && sizeOrder[String(sId)] != null) ? sizeOrder[String(sId)] : 9999,
        co: (cId != null && colorOrder[String(cId)] != null) ? colorOrder[String(cId)] : 9999
      });
    });

    if (mode === "size_color") {
      items.sort(function (a, b) {
        if (a.co !== b.co) return a.co - b.co;
        if (a.so !== b.so) return a.so - b.so;
        return toInt(a.variationId) - toInt(b.variationId);
      });
    } else if (mode === "size") {
      items.sort(function (a, b) {
        if (a.so !== b.so) return a.so - b.so;
        return toInt(a.variationId) - toInt(b.variationId);
      });
    } else if (mode === "color") {
      items.sort(function (a, b) {
        if (a.co !== b.co) return a.co - b.co;
        return toInt(a.variationId) - toInt(b.variationId);
      });
    }

    var rows = [];

    items.forEach(function (it) {
      var r;

      if (mode === "size_color") {
        r = createRow(matrix, mode, it.sizeLabel, it.colorLabel, it.colorImgUrl);
      } else if (mode === "size") {
        r = createRow(matrix, mode, it.sizeLabel, null, "");
      } else if (mode === "color") {
        r = createRow(matrix, mode, it.colorLabel, null, it.colorImgUrl);
      } else {
        r = createRow(matrix, "none", null, null, "");
      }

      r.setAttribute("data-eg-variation-id", it.variationId);

      body.appendChild(r);

      r._egStockEl = r.querySelector("[data-eg-stock]");
      r._egPriceEl = r.querySelector("[data-eg-price]");
      r._egEanEl = r.querySelector("[data-eg-ean]");
      r._egSubEl = r.querySelector("[data-eg-subtotal]");
      r._egQtyEl = r.querySelector("[data-eg-qty]");

      rows.push(r);
    });

    return rows;
  }

  // === INIT ===
  function initMatrix(matrix) {
    if (matrix) initMatrixHeadingLabels(matrix);
    if (!matrix || matrix.getAttribute("data-eg-matrix-initialized") === "1") return;

    matrix.setAttribute("data-eg-matrix-initialized", "1");

    var variations = getVariationsJson(matrix);
    var rows = buildRows(matrix, Array.isArray(variations) ? variations : []);
    var status = matrix.querySelector("[data-eg-matrix-status]");
    var table = matrix.querySelector(".eg-size-matrix-table");
    if (!rows.length) {
      if (table) table.setAttribute("aria-busy", "false");
      if (status) status.textContent = status.dataset.unavailable;
      return;
    }
    var unavailableRows = 0;

    var ids = [];

    for (var i = 0; i < rows.length; i++) {
      var vid = toInt(rows[i].getAttribute("data-eg-variation-id"));
      if (vid) ids.push(vid);
    }

    fetchVariationsBatch(ids, function () {
      maybeRefreshCurrencySymbol();
      var tasks = [];

      for (var r = 0; r < rows.length; r++) {
        (function (row) {
          var vid2 = toInt(row.getAttribute("data-eg-variation-id"));
          var priceEl2 = row._egPriceEl;
          var eanEl2 = row._egEanEl;

          function apply(v2) {
            if (!v2) {
              unavailableRows++;
              if (priceEl2) {
                priceEl2.textContent = "–";
                priceEl2.setAttribute("data-eg-price-value", "0");
              }

              if (eanEl2) eanEl2.textContent = "–";

              row.removeAttribute("data-eg-ordermax-raw");

              setRowStock(row, null, true);
              clampQtyToStock(row);
              return;
            }

            var rawStock2 = (typeof v2.stock === "number" && isFinite(v2.stock)) ? v2.stock : null;

            if (rawStock2 == null && v2.stock && typeof v2.stock.net !== "undefined") {
              var sn = parseInt(v2.stock.net, 10);
              if (isFinite(sn)) rawStock2 = sn;
            }

            setRowStock(row, rawStock2, true);

            if (priceEl2) {
              if (typeof v2.price === "number" && isFinite(v2.price)) {
                priceEl2.textContent = formatEuro(v2.price);
                priceEl2.setAttribute("data-eg-price-value", String(v2.price));
              } else if (v2.prices && v2.prices.default && v2.prices.default.unitPrice && typeof v2.prices.default.unitPrice.value !== "undefined") {
                var pv2 = parseFloat(v2.prices.default.unitPrice.value);
                if (isFinite(pv2)) {
                  priceEl2.textContent = formatEuro(pv2);
                  priceEl2.setAttribute("data-eg-price-value", String(pv2));
                } else {
                  priceEl2.textContent = "–";
                  priceEl2.setAttribute("data-eg-price-value", "0");
                }
              } else {
                priceEl2.textContent = "–";
                priceEl2.setAttribute("data-eg-price-value", "0");
              }
            }

            if (eanEl2) {
              var ean = v2.ean == null ? "" : String(v2.ean).trim();
              eanEl2.textContent = ean || "–";
            }

            var maxO = null;

            try {
              if (v2.orderMax != null) maxO = toInt(v2.orderMax);
              if (!maxO) {
                var om2 = extractOrderMaxFromObj(v2);
                if (om2 != null) maxO = toInt(om2);
              }
            } catch (e0) {
              maxO = null;
            }

            if (maxO && isFinite(maxO) && maxO > 0) {
              row.setAttribute("data-eg-ordermax-raw", String(maxO));
            } else {
              row.removeAttribute("data-eg-ordermax-raw");
            }

            clampQtyToStock(row);
          }

          if (vid2 && Object.prototype.hasOwnProperty.call(vCache, vid2)) {
            apply(vCache[vid2]);
          } else if (vid2) {
            tasks.push(function (done) {
              fetchVariationDetailsSingle(vid2, function (vx) {
                maybeRefreshCurrencySymbol();
                apply(vx);
                done();
              });
            });
          } else {
            apply(null);
          }
        })(rows[r]);
      }

      runQueue(tasks, CONCURRENCY, function () {
        recalcMatrixTotals(matrix);
        if (table) table.setAttribute("aria-busy", "false");
        if (status) {
          status.textContent = unavailableRows === 0 ? "" :
            unavailableRows === rows.length ? status.dataset.unavailable : status.dataset.partial;
        }

        var firstRow = matrix.querySelector(".eg-row");
        if (firstRow) setActiveRow(matrix, firstRow);
      });
    });

    matrix.addEventListener("click", function (e) {
      var link = e.target && e.target.closest ? e.target.closest("[data-eg-color-preview]") : null;
      if (!link || !matrix.contains(link)) return;

      e.preventDefault();
      e.stopPropagation();

      var row = link.closest(".eg-row");
      if (!row) return;

      var touch = window.matchMedia && window.matchMedia("(max-width: 991px)").matches &&
        (e.pointerType === "touch" || window.matchMedia("(hover: none) and (pointer: coarse)").matches);
      if (!touch) setActiveRow(matrix, row);
      previewVariationFromRow(matrix, row, true, touch);
    }, true);

    matrix.addEventListener("pointerdown", function (e) {
      if (!isQtyInput(e.target)) return;
      selectQtyInput(e.target);
    }, true);

    matrix.addEventListener("focusin", function (e) {
      if (!e.target) return;

      if (isQtyInput(e.target)) {
        var row0 = e.target.closest(".eg-row");
        if (row0) setActiveRow(matrix, row0);

        selectQtyInput(e.target);
      }
    }, true);

    matrix.addEventListener("input", function (e) {
      if (e.target && e.target.matches && e.target.matches("[data-eg-qty]")) {
        e.stopPropagation();

        var row = e.target.closest(".eg-row");
        if (row) clampQtyToStock(row);

        scheduleRecalc(matrix);
      }
    }, true);

    matrix.addEventListener("change", function (e) {
      if (e.target && e.target.matches && e.target.matches("[data-eg-qty]")) {
        e.stopPropagation();

        var row = e.target.closest(".eg-row");
        if (row) clampQtyToStock(row);

        scheduleRecalc(matrix);
      }
    }, true);

    matrix.addEventListener("click", function (e) {
      var btn = e.target && e.target.closest ? e.target.closest("[data-eg-matrix-add]") : null;
      if (!btn || btn.disabled) return;

      if (!btn.getAttribute("data-eg-base-text")) {
        btn.setAttribute("data-eg-base-text", btn.textContent || "");
      }

      var baseText = btn.getAttribute("data-eg-base-text") || (btn.textContent || "");

      var items = [];
      var allRows = matrix.querySelectorAll(".eg-row");

      for (var i = 0; i < allRows.length; i++) {
        var row = allRows[i];

        var qtyEl = row._egQtyEl || row.querySelector("[data-eg-qty]");
        var q = qtyEl ? toInt(qtyEl.value) : 0;

        if (q <= 0) continue;

        clampQtyToStock(row);

        q = qtyEl ? toInt(qtyEl.value) : 0;
        if (q <= 0) continue;

        var vId = row.getAttribute("data-eg-variation-id");
        if (!vId) continue;

        if (q > STOCK_CAP) q = STOCK_CAP;

        items.push({
          variationId: vId,
          quantity: q
        });
      }

      if (!items.length) return;

      // The pre-clamp and the POST operate on this selection. Do not let a
      // later edit be cleared as if it had been included in the same write.
      var writeInputs = matrix.querySelectorAll('[data-eg-qty]:not(:disabled)');
      writeInputs.forEach(function (input) { input.disabled = true; });
      btn.disabled = true;
      btn.setAttribute("aria-busy", "true");
      btn.setAttribute("data-eg-busy", "1");
      btn.textContent = t("add_start");

      (async function () {
        var snapBefore = null;
        var hadAdjustments = false;

        try {
          try {
            snapBefore = await getBasketSnapshot();
          } catch (eBefore) {
            snapBefore = null;
          }

          // Vor dem eigentlichen Add prüfen, was schon im Warenkorb liegt.
          // Mengen, die nicht mehr addbar sind, werden vorher auf 0 gesetzt und nicht gepostet.
          if (snapBefore && snapBefore.qtyMap) {
            var pre = preClampItemsAgainstBasket(items, snapBefore.qtyMap || {}, matrix);
            items = pre.items || [];
            hadAdjustments = !!(pre && (pre.adjusted > 0 || pre.blocked > 0));
            recalcMatrixTotals(matrix);
          }

          if (!items.length) {
            showInfoToast(t("info_nothing_addable"), "[data-eg-size-matrix]", 1);

            btn.textContent = t("not_addable");

            setTimeout(function () {
              btn.textContent = baseText;
              btn.disabled = false;
              btn.removeAttribute("aria-busy");
              btn.removeAttribute("data-eg-busy");
            }, 1200);

            return;
          }

          // Normalfall: genau EIN Batch-POST.
          var response = await addItemsToBasketBatch(items);

          var basket = response?.events?.AfterBasketChanged?.basket || response?.data?.basket;
          // A confirmed write is complete even if the separate header GET stalls.
          O46Core.basketHeader.accept(basket).then(function (accepted) {
            if (!accepted) return O46Core.basketHeader.refreshAfterWrite();
          });

          var qInputs = matrix.querySelectorAll("[data-eg-qty]");
          for (var j = 0; j < qInputs.length; j++) {
            qInputs[j].value = "0";
          }

          recalcMatrixTotals(matrix);

          if (hadAdjustments) {
            showInfoToast(t("info_some_limited"), "[data-eg-size-matrix]", 1);
          }

          btn.textContent = t("added_ok");
          btn.disabled = false;
          btn.removeAttribute("aria-busy");
          btn.removeAttribute("data-eg-busy");

          if (window.eGuardians && eGuardians.basket && typeof eGuardians.basket.openBasketPreviewSmall === "function") {
            eGuardians.basket.openBasketPreviewSmall(function () {
              var $jq = window.jQuery || window.$;

              if ($jq) {
                $jq("html").addClass("basket-prev-small-open");

                setTimeout(function () {
                  $jq("html").removeClass("basket-prev-small-open");
                }, 3000);
              }
            });
          }

          return;
        } catch (err) {
          // Bundles can partially add other variation IDs, and another tab can
          // change quantities. A later basket snapshot cannot identify this write.
          O46Core.basketHeader.refreshAfterWrite();
          showErrorToast((err?.basketReason ? err.basketReason + " " : "") + t("add_uncertain"), matrix);
          btn.textContent = t("add_uncertain");
          btn.disabled = false;
          btn.removeAttribute("aria-busy");
          btn.removeAttribute("data-eg-busy");
        } finally {
          writeInputs.forEach(function (input) { input.disabled = false; });
        }
      })();
    });
  }

  window.egInitSizeMatrices = function (root) {
    root = root || document;

    var matrices = root.matches && root.matches("[data-eg-size-matrix]") ? [root] : root.querySelectorAll("[data-eg-size-matrix]");
    if (!matrices || !matrices.length) return;

    for (var i = 0; i < matrices.length; i++) {
      initMatrix(matrices[i]);
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    window.egInitSizeMatrices(document);
  });

  document.addEventListener("shown.bs.modal", function (e) {
    window.egInitSizeMatrices(e.target);
  });

  // MutationObserver throttled
  if (!window.MutationObserver) return;

  var moScheduled = false;
  var moScanRoots = [];

  function scheduleMoScan() {
    if (moScheduled) return;

    moScheduled = true;

    (window.requestAnimationFrame || function (fn) {
      return setTimeout(fn, 16);
    })(function () {
      moScheduled = false;

      for (var i = 0; i < moScanRoots.length; i++) {
        window.egInitSizeMatrices(moScanRoots[i]);
      }

      moScanRoots.length = 0;
    });
  }

  var mo = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var m = mutations[i];
      if (m.removedNodes) m.removedNodes.forEach(function (node) {
        releaseMatrixHeadingLabels(node);
        if (!node.isConnected) releaseMatrixZoom(node);
      });

      if (!m.addedNodes || !m.addedNodes.length) continue;

      for (var j = 0; j < m.addedNodes.length; j++) {
        var node = m.addedNodes[j];

        if (!node || node.nodeType !== 1) continue;

        if (node.matches && node.matches("[data-eg-size-matrix]")) {
          moScanRoots.push(node);
          scheduleMoScan();
          continue;
        }

        if (node.querySelector && node.querySelector("[data-eg-size-matrix]")) {
          moScanRoots.push(node);
          scheduleMoScan();
        }
      }
    }
  });

  mo.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
    O46Core.installed.matrix = true;
};
