var tseElem =  document.getElementById('isVueView');

//typeof(tseElem) == 'undefined' && 
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
var eGuardians = (function(eGuardians) {

  // Constructor
  function eGuardians() {
    this.initialize();
  }
function _getBasketCacheKey() {
    const sessionData = window.egSessionData || {}; // Annahme: wir speichern die Session-Daten global
    const lang = $('html').attr('lang') || 'de';
    const currency = sessionData.basket?.currency || 'EUR';
    const shippingCountryId = sessionData.basket?.shippingCountryId || 1;
    const customerId = sessionData.basket?.customerId > 0 ? sessionData.basket.customerId : 'guest';
    return `${lang}_${currency}_${shippingCountryId}_${customerId}`;
}
eGuardians.getBasketCacheKey = _getBasketCacheKey;

(function () {
  function updateBasketFromCache() {
    try {
      let basket;
            try {
              basket = JSON.parse(localStorage.getItem('basketCache_' + eGuardians.getBasketCacheKey()))?.data?.basket;
            } catch (e) {
              localStorage.removeItem('basketCache_' + eGuardians.getBasketCacheKey());
            }

      if (!basket) return;

      const elQuantity = document.querySelector('[data-eg-basket-quantity]');
      const elSum = document.querySelector('[data-basket-sum]');

      if (elQuantity) {
        elQuantity.setAttribute('data-eg-basket-quantity', basket.itemQuantity);
        elQuantity.innerHTML = basket.itemQuantity;
      }

      if (elSum) {
        elSum.innerHTML = basket.itemSum.toFixed(2).replace('.', ',');
      }

      if (basket.itemWishListIds?.length > 0) {
        document.querySelector('.wishlist-link')?.classList.remove('noWishListItems');
      }
    } catch (e) {
      // optional: Fehler ignorieren oder Monitoring
    }
  }

  window.addEventListener('pageshow', function () {
    setTimeout(updateBasketFromCache, 100);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      setTimeout(updateBasketFromCache, 100);
    }
  });
})();


 
eGuardians.initialize = function () {
    // 🔁 Event-Bindings aktivieren
    this.events.bindEvents();

    // 🔐 Watchdog prüft initial Cache & Sessiondaten
    this.events.watchdogInit();

    // 📦 Aktuelle URL-Parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlCurrency = urlParams.get('currency')?.toUpperCase() || null;
    const urlLang = $('html').attr('lang')?.toLowerCase() || 'de';

    // 🧹 Cache prüfen
    const cacheKeyPrefix = 'basketCache_';
    const currentCacheKey = Object.keys(localStorage).find(key => key.startsWith(cacheKeyPrefix));

    if (currentCacheKey) {
        const cacheParts = currentCacheKey.replace(cacheKeyPrefix, '').split('_');
        const cachedLang = cacheParts[0]?.toLowerCase() || 'de';
        const cachedCurrency = cacheParts[1]?.toUpperCase() || 'EUR';

        let mustReload = false;

        if (urlCurrency && urlCurrency !== cachedCurrency) mustReload = true;
        if (urlLang !== cachedLang) mustReload = true;

        if (mustReload) {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(cacheKeyPrefix)) localStorage.removeItem(key);
            });
            this.events.initShopData();
        }
    } else {
        this.events.initShopData();
    }

    // 🔄 Lokale Updates via storage-Event
    window.addEventListener('storage', function (event) {
        if (event.key && event.key.startsWith('basketCache_')) {
            try {
                const newData = JSON.parse(event.newValue || '{}');
                const basket = newData?.data?.basket;

                if (basket) {
                    $('[data-eg-basket-quantity]').attr('data-eg-basket-quantity', basket.itemQuantity).html(basket.itemQuantity);
                    $('[data-basket-sum]').html(basket.itemSum.toFixed(2).replace('.', ','));
                    if (basket.currency) $('[data-currency-symbol]').html(basket.currency);
                    if (basket.itemWishListIds?.length > 0) $('.wishlist-link').removeClass('noWishListItems');
                }
            } catch (e) {
                console.error('Error parsing basketCache_ data:', e);
            }
        }
    });

    // 🧠 Zusätzlicher Cache-Watchdog bei Sichtbarkeitswechsel & bfcache
    function recheckBasketCacheIfNeeded() {
        const cacheKey = 'basketCache_' + eGuardians.getBasketCacheKey();
        const cacheRaw = localStorage.getItem(cacheKey);

        if (!cacheRaw) {
            eGuardians.events.initShopData();
            return;
        }

        try {
            const cache = JSON.parse(cacheRaw);
            const now = Date.now();
            const maxAge = 30 * 60 * 1000;
            if (!cache.timestamp || (now - cache.timestamp) > maxAge) {
                eGuardians.events.initShopData();
            }
        } catch (e) {
            eGuardians.events.initShopData();
        }
    }

    window.addEventListener('pageshow', function (event) {
        if (event.persisted || performance.getEntriesByType("navigation")[0]?.type === "back_forward") {
            setTimeout(recheckBasketCacheIfNeeded, 100);
        }
    });

    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') {
            setTimeout(recheckBasketCacheIfNeeded, 100);
        }
    });
};








  eGuardians.events = new function() {
        var events = this;
        var timoutSave = null;
        this.bindEvents = function(bindWrapper){
           
            bindWrapper = bindWrapper || '[data-eg-event]';
            const observer = lozad(); // lazy loads elements with default selector as '.lozad'
            observer.observe();
            
            $(bindWrapper).each(function(){
                var target = this;
                if($(this).attr('data-eg-target')){
                    target = $(this).data('eg-target');
                }
                $(target).unbind($(this).data('eg-event'));
                  if($(this).data('eg-event')=="load"){
                      var extecuteFunction = eGuardians.events[$(this).data('eg-handler')];
                      if (!!extecuteFunction && typeof extecuteFunction == "function" ){
                          extecuteFunction(this);
                      }else{
                          console.error("Undefined function "+$(this).data('eg-handler'))
                      }
                  }else{
              
                      $(target).on($(this).data('eg-event'), function(event){
                          event.stopPropagation();
                          event.preventDefault();
                          var extecuteFunction = eGuardians.events[$(this).data('eg-handler')];

                          if (!!extecuteFunction && typeof extecuteFunction == "function" ){
                              extecuteFunction(this);
                          }else{
                              console.error("Undefined function "+$(this).data('eg-handler'))
                          }
                      });
                  }
            });
           
        }
this.addItemToBasket = function (_this) {
    const $btn = $(_this);

    if ($btn.hasClass('inBasketBtnDisabled')) {
        $('.attribute-box').each(function () {
            if ($(this).find('li[data-selected]').length === 0) {
                $(this).addClass('errorVariationSelect');
            }
        });
        return;
    }

    const $item = $btn.closest('[data-item]');
    const variationId = $item.attr('data-eg-active-variation');
    const $qtyInput = $item.find('[data-item-quantity]');
    const quantity = parseInt($qtyInput.val(), 10);

    eGuardians.helper.btnShowLoader(_this);

    eGuardians.basket.addItem(variationId, quantity, function (response) {
        if (response?.data?.exceptionCode) {
            eGuardians.ui.message.error.show({
                message: messageServiceTranslations[response.data.exceptionCode],
                insertElement: '.item-actions-wrap'
            });
            eGuardians.helper.btnHideLoader(_this);
            return;
        }

        const basket = response?.events?.AfterBasketChanged?.basket;

        if (basket) {
            const $basketQty = $('[data-eg-basket-quantity]');
            const $basketSum = $('[data-basket-sum]');
            const formattedSum = basket.itemSum.toFixed(2).replace('.', ',');

            if ($basketQty.text() !== String(basket.itemQuantity)) {
                $basketQty.attr('data-eg-basket-quantity', basket.itemQuantity).html(basket.itemQuantity);
            }

            if ($basketSum.text() !== formattedSum) {
                $basketSum.html(formattedSum);
            }
        }

        const $modal = $('.modal-cross');
        if ($modal.hasClass('show')) {
            $modal.modal('hide');
        }

        eGuardians.basket.openBasketPreviewSmall(() => {
            $('html').addClass('basket-prev-small-open');
            setTimeout(() => {
                $('html').removeClass('basket-prev-small-open');
            }, 3000);
        });

        eGuardians.helper.btnHideLoader(_this);
    });
};

        this.initVariation = function(_this){
            eGuardians.item.variations.init(_this);

        };
        this.openBasket = function(){
            console.log('open wh')
        };
        this.tgClass = function(_this){
            var arr = $(_this).data('eg-param').split(',');
        
            $(arr[0]).toggleClass(arr[1]);
            if(arr[1]=="search-open"){
                setTimeout(function(){
                    $('.input-ff-search').focus()
                }, 100);
                
            }
        };
        this.closeBackdrop = function(_this){
            $('html').removeClass('menu-open');
            $('html').removeClass('basket-preview-open');
            $('html').removeClass('filter-open');
        };
        this.ddownOpen = function(_this){
            $(_this).closest('.eg-ddown').addClass('ddown-open')
        };
        this.ddownBack = function(_this){
            $(_this).closest('.eg-ddown').removeClass('ddown-open')
        };
        this.modalContent = function(_this){
            eGuardians.ui.modal.modalRestContent($(_this).data('eg-href'),$(_this).data('eg-params'),$(_this).data('eg-title'),$(_this).data('eg-type'));
        };
        this.openBasketPreview = function(_this){
            eGuardians.basket.openBasketPreview()
        };
        this.initBasketPreview = function(_this){
            if($('html').hasClass('mobile-magic')){
                // $(_this).on('click', function(){
                 //   eGuardians.basket.openBasketPreview();
                // }); 
            }else{
                $(_this).on('mouseover', function(){
                    if(!$(_this).hasClass('basketPrevIsLoaded')){
                        eGuardians.basket.openBasketPreviewSmall();
                        $(_this).addClass('basketPrevIsLoaded')
                    }
                }); 
                $(_this).on('mouseleave', function(){
                   $('html').removeClass('basket-prev-small-open');
                });
            }
        };
        this.closeBasketPreview = function(_this){
      
            eGuardians.basket.closeBasketPreview();

        }
this.initShopData = function () {
    if (window._egInitShopDataRunning) return;
    window._egInitShopDataRunning = true;

    setTimeout(() => {
        window._egInitShopDataRunning = false;
    }, 5000);

    const cacheKeyPrefix = 'basketCache_';
    const cacheTTL = 30 * 60 * 1000;
    const now = Date.now();
    const existingCacheKey = Object.keys(localStorage).find(key => key.startsWith(cacheKeyPrefix));

    if (existingCacheKey) {
        const cached = JSON.parse(localStorage.getItem(existingCacheKey) || '{}');
        if (cached.timestamp && now - cached.timestamp < cacheTTL) {
            renderFromData(cached.data);
            window._egInitShopDataRunning = false;
            return;
        }
    }

    const templateData = JSON.parse(document.getElementById('app-data-custom').textContent);
    const searchParams = {
        templateType: templateData.templateType,
        _: Math.floor(Date.now() / 1000)
    };

    eGuardians.apiservice.get('/rest/io/session/', searchParams, function (response) {
        const basket = response.data?.basket || {};

        window.egSessionData = { basket: {
            itemQuantity: basket.itemQuantity,
            itemSum: basket.itemSum,
            currency: basket.currency,
            itemWishListIds: basket.itemWishListIds,
            shippingCountryId: basket.shippingCountryId,
            customerId: basket.customerId
        }};

        Object.keys(localStorage).forEach(function (key) {
            if (key.startsWith(cacheKeyPrefix)) {
                localStorage.removeItem(key);
            }
        });

        localStorage.setItem('basketCache_' + eGuardians.getBasketCacheKey(), JSON.stringify({
            timestamp: Date.now(),
            data: {
                basket: window.egSessionData.basket
            }
        }));

        renderFromData({ basket: window.egSessionData.basket });
        window._egInitShopDataRunning = false;
    });

    function renderFromData(response) {
        const basketData = response.basket;
        const wishlistData = basketData?.itemWishListIds || [];

        $('[data-eg-basket-quantity]')
            .attr('data-eg-basket-quantity', basketData.itemQuantity)
            .html(basketData.itemQuantity);

        $('[data-basket-sum]')
            .html(basketData.itemSum.toFixed(2).replace('.', ','));

        if (wishlistData.length > 0) {
            $('.wishlist-link').removeClass('noWishListItems');
            if ($('.single[data-item]').length > 0) {
                const aktivItemId = $('.single[data-item]').attr('data-eg-active-variation');
                wishlistData.forEach(itemId => {
                    if (aktivItemId == itemId) {
                        $('.btn-watch').addClass('item-in-wishlist');
                    }
                });
            }
        }
    }
};

this.watchdogInit = function () {
    const cacheKey = 'basketCache_' + eGuardians.getBasketCacheKey();
    const cacheRaw = localStorage.getItem(cacheKey);

    if (!window.egSessionData || !cacheRaw) {
        eGuardians.events.initShopData();
        return;
    }

    try {
        const cache = JSON.parse(cacheRaw);
        const now = Date.now();
        const maxAge = 30 * 60 * 1000;
        if (!cache.timestamp || (now - cache.timestamp) > maxAge) {
            eGuardians.events.initShopData();
        }
    } catch (e) {
        eGuardians.events.initShopData();
    }
};


        this.initCustomerLoggedStatus = function(){
            eGuardians.apiservice.get('/rest/io/customer/', '', function(response){
                if(response.data!="null" && response.data!=null){
                   $('.btn-login-open').addClass('isLoggedIn')
                   $('.loggedInName').html(response.data.firstName);
                }
                
            });
            
        }
        this.facetFilter = function(_this){
               
                //var queryUrl = $('[data-eg-facets]').data('eg-queryurl')
                var facetIdParams = "";
                $('[data-eg-facets] input:checked').each(function(index){
                    facetIdParams+=$(this).data('eg-facetvalueid') + ",";
                });
                facetIdParams = facetIdParams.slice(0,-1)
                
                var priceMin = isNaN($('.facet-input-price-min').val()) ? 0 : $('.facet-input-price-min').val();
                var priceMax = isNaN($('.facet-input-price-max').val()) ? 0 : $('.facet-input-price-max').val();
                if($(_this).hasClass('facet-remove-price')){
                    priceMin = 0;
                    priceMax = 0;
                    $('.facet-input-price-min').val('');
                    $('.facet-input-price-max').val('');
                }
                
                var searchParams = {
                    query: $("[data-eg-facets]").data('eg-searchstring'),
                    facets: facetIdParams,
                    priceMin: priceMin,
                    priceMax: priceMax,
                    categoryId: $('[data-eg-facets]').data('eg-catid')
                }
                $('[data-eg-btnfilter]').show().addClass('btn-load');
                $(_this).closest('.eg-dropdown-content').addClass('isLoading');
                if($('.forRemove').length>0){
                        $('.forRemove').remove()
                }
                eGuardians.apiservice.get('/rest/io/facet/', searchParams, function(response){
                    $('.ffix li').attr('data-eg-facet-itemcount', 0)
                    $('.ffix .chk-count').html(0);
                    $(response.data.facets).each(function(i, facetGroup){
                        $(facetGroup.values).each(function(i, facetValue){
                            $('#facet-item-'+facetValue.id).closest('li').attr('data-eg-facet-itemcount',facetValue.count)
                            $('#facet-item-'+facetValue.id).closest('li').find('.chk-count').html(facetValue.count); 
                        })
                    });
                  
                    $('[data-eg-btnfilter] span').html(response.data.itemList.total);
                    
                    
                    var facetUrl = "";
                    var urlParam = {};
                    var priceUrl = "";
                    if(priceMin>0 || priceMax>0){
                        urlParam["priceMin"] = priceMin;
                        urlParam["priceMax"] = priceMax;
                    }
                    if($('[data-eg-searchstring]').length>0){
                        urlParam["query"] = $("[data-eg-facets]").data('eg-searchstring');
                    }
                    if($('[data-eg-facets] input:checked').length>0){
                        urlParam["facets"] = facetIdParams;//encodeURIComponent(facetIdParams);
                    }
                    if($('.eg-dropdown-sort').data('eg-activesorting')!=$('.eg-dropdown-sort').data('eg-defaultsorting')){
                        urlParam["sorting"] = $('.eg-dropdown-sort').data('eg-activesorting');
                    }
                    var targetSearchUrl = ""
                    if($.param(urlParam)!=""){
                        targetSearchUrl = window.location.pathname+'?'+$.param(urlParam);
                    }else{
                        targetSearchUrl = window.location.pathname
                    }
                    $('[data-eg-btnfilter]').attr('onclick',"document.location.href='"+targetSearchUrl+"'");
                    $(_this).closest('.eg-dropdown-content').removeClass('isLoading');
                   
                    $('[data-eg-btnfilter]').removeClass('btn-load');
                    if($(_this).hasClass('pricefilter')){
                        document.location.href = targetSearchUrl;
                    }
                });
            
        }
        this.loginUser = function(_this){
            
            var loginMail = $('#login-mail').val();
            var loginPassword = $('#login-password').val();
            if(eGuardians.validator.checkInputs($('.login-form input'))){
                eGuardians.helper.btnShowLoader(_this);
                eGuardians.user.login(loginMail, loginPassword,function(response){
                    if(response.events.AfterAccountAuthentication.isSuccess){ 
                        
                        eGuardians.ui.message.success.show({
                            'message'        : messageServiceTranslations["login1"]+' '+response.events.AfterAccountAuthentication.accountContact.firstName+' '+messageServiceTranslations["login2"],
                            'insertElement'  : '.login-form-action',
                            'customClass'    : 'alert-login'
                        })
                        setTimeout(function(){ 
                            document.location.reload();
                        }, 3000);
                        
                    }else{
                        var errormsg = "";
                        if(response.error.message=="user is blocked"){
                            errormsg = messageServiceTranslations["banneduser"];
                        }else{
                            errormsg = messageServiceTranslations["wronguserlogindata"];
                        }
                        eGuardians.ui.message.error.show({
                            'message'        : errormsg,
                            'insertElement'  : '.login-form-action',
                            'customClass'    : 'alert-login'
                        })
                    }
                    eGuardians.helper.btnHideLoader(_this);
                });
            }
        }
        this.logoutUser = function(_this){
            
            eGuardians.helper.btnShowLoader(_this);

            eGuardians.user.logout(function(){
                eGuardians.helper.btnHideLoader(_this);
                eGuardians.ui.message.success.show({
                    'message'        : messageServiceTranslations["successlogout"],
                    'insertElement'  : '.loginpreview-register'
                });
                $(_this).removeClass('btn-load');
                setTimeout(function(){ 
                            document.location.href = "https://b2b.outlet46.de";
                }, 3000);
            });
        }
        this.pwdResetUser = function(_this){
            var searchParams = {
                email: $('#pwd-reset-mail').val()
            }
            
            if(eGuardians.validator.checkInputs($('.pwdreset-form input'))){
                eGuardians.helper.btnShowLoader(_this);
                eGuardians.apiservice.post('/rest/io/customer/password_reset/', searchParams, function(response){
                    eGuardians.helper.btnHideLoader(_this);
                    if(response.data==true){
                      eGuardians.ui.message.success.show({
                        'message'        : messageServiceTranslations["successpwdreset"],
                        'insertElement'  : '.pwd-reset-action',
                        'customClass'    : 'alert-login'
                      })  
                    }else{
                        eGuardians.ui.message.error.show({
                            'message'        : messageServiceTranslations["failedpwdreset"],
                            'insertElement'  : '.pwd-reset-action',
                            'customClass'    : 'alert-login'
                        })
                    }
              
                });
            }
        }
        this.openDropDown = function(_this){
            $('.eg-dropdown.isOpen').not($(_this).parents('.eg-dropdown')).removeClass('isOpen');
            $(_this).parents('.eg-dropdown').toggleClass('isOpen');
        }
       
        this.initCatItemEvents = function(){
            
            $('.eg-dropdown-value').click(function(){
                $(this).parents('.eg-dropdown').toggleClass('isOpen');
            });
            $('.eg-dropdown-sort li span').click(function(){
                $('.eg-dropdown-sort').find('.eg-dropdown-value .sort-val').html($(this).html());
                $('.eg-dropdown-sort').removeClass('isOpen');
                document.location.href = $(this).data('eg-href');
            });
            $('body').on('click', '.facet-remove-btn', function(){
                $(this).addClass('forRemove');
            });
        }           
        this.initLiveSearch = function(_this){
            $(document).on('click','.btn-search', function(){
                $('html').toggleClass('search-open');
                  setTimeout(function(){
                    $(".input-ff-search").focus();
                }, 100);
                
            });
            $(document).mouseup(function(e) 
            {
                var container = $("[data-eg-search]");
                if (!container.is(e.target) && container.has(e.target).length === 0) 
                {
                    if($(".row-search-wrap").length>0){
                        $(".row-search-wrap").hide();
                    }
                }
            });
            var currentFocus = -1;
            $(document).on('focus','[data-eg-livesearch]', function(){
                if($(".row-search-wrap").length>0){
                    $(".row-search-wrap").show();
                }
            });
            // Fokusverhalten bleibt gleich
            var currentFocus = -1;
            var useEnglishSearchIndex = activeLang === 'it' || activeLang === 'es';
            $(document).on('focus', '[data-eg-livesearch]', function () {
                if ($(".row-search-wrap").length > 0) {
                    $(".row-search-wrap").show();
                }
            });

            // debounce Funktion (einmal definiert, wiederverwendbar)
            function debounce(func, delay) {
                let timer;
                return function (...args) {
                    const context = this;
                    clearTimeout(timer);
                    timer = setTimeout(() => func.apply(context, args), delay);
                };
            }

            // Input-Handler (ausgelagert)
            function handleLiveSearchInput(event) {
                const $input = $(event.currentTarget);
                const query = $.trim($input.val());

                if (query.length > 3) {
                    $('[data-eg-search]').addClass('search-loading');
                    $('.related-search').hide();

                    const types = ["item", "category", "suggestion"];
                    const searchParams = {
                        template: "Ceres::ItemList.Components.ItemSearch",
                        query: query,
                        types: types,
                        templateType: "home"
                    };

                    const autocompleteUrl = useEnglishSearchIndex
                        ? '/rest/guardiansbasicb2b/item/search/autocomplete/'
                        : '/rest/io/item/search/autocomplete/';
                    eGuardians.apiservice.get(autocompleteUrl, searchParams, function (response) {
                        renderAutocompleteResults(response, $input);
                    });

                } else {
                    $('.list-autocomplete').remove();
                    $('.related-search').show();
                    $('[data-eg-search]').removeClass('search-active-results');
                }
            }

            // Rendering-Funktion (ausgelagert für Performance & Klarheit)
            function renderAutocompleteResults(response, $input) {
                $('.row-search-wrap').remove();

                const $row = $("<div />").addClass('row row-search-wrap');
                const $left = $("<div />").addClass('col-12 col-md-7 item-suggestion');
                const $right = $("<div />").addClass('col-12 col-md-5 cat-suggestion');

                $right.append('<p class="h3" style="margin-top: 0.2rem;margin-bottom: 0.2rem;">' + messageServiceTranslations["searchexample"] + '</p>');
                const $ulSuggestion = $("<ul/>").addClass('list-autocomplete-suggestion list-no-style');

                let suggestionCount = 0;
                $(response.data.suggestion).each(function (key, suggestion) {
                    if (suggestionCount === 5) return false;
                    const label = String(suggestion?.label ?? '');
                    if (!label) return;

                    const $link = $('<a>').attr({
                        href: $input[0].form.action + '?query=' + encodeURIComponent(label),
                        title: label
                    });
                    $link.append(eGuardians.helper.autoCompleteReg($input, label));
                    $ulSuggestion.append($('<li>').append($link));
                    suggestionCount++;
                });
                $right.append($ulSuggestion);

                const $ulItem = $("<ul/>").addClass('list-autocomplete list-no-style');
                $(response.data.item).each(function (key, item) {
                    const label = String(item?.label ?? '');
                    if (!label) return;

                    const $link = $('<a>').attr({ href: item.url, title: label });
                    const $image = $('<img>').attr({ src: item.image || '', alt: label });
                    $link.append($('<span>').append($image), eGuardians.helper.autoCompleteReg($input, label));
                    $ulItem.append($('<li>').append($link));
                });
                $left.append($ulItem);

                $row.append($left).append($right);
                $input.closest('[data-eg-search], .searchbox-404').find('.search-wrap, [data-eg-search]').first().append($row).ready(function () {
                    console.log("APPEND READY");
                });

                $('[data-eg-search]').toggleClass('search-active-results', suggestionCount > 0 || $ulItem.children().length > 0);
                $('[data-eg-search]').removeClass('search-loading');
            }

            // Jetzt debounce aktivieren
            const loadSuggestions = debounce(handleLiveSearchInput, 400);
            $(_this).on('input', function (event) {
                currentFocus = -1;
                $(this).closest('[data-eg-search], .searchbox-404').find('.autocomplete-active').removeClass('autocomplete-active');
                loadSuggestions.call(this, event);
            });
            
            $(_this).keydown(function(e){
                var x = $(this).closest('[data-eg-search], .searchbox-404').find('.list-autocomplete li').get();
                if (e.keyCode == 40 || e.keyCode == 38) {
                    if (!x.length) return;
                    currentFocus += e.keyCode == 40 ? 1 : -1;
                    addAutocompleteItemActive(x);
                    $(this).val($(x[currentFocus]).find('a').attr('title'));
                } else if (e.keyCode == 13 && useEnglishSearchIndex && $(x).is('.autocomplete-active')) {
                    e.preventDefault();
                    $(x).filter('.autocomplete-active').find('a')[0].click();
                } else if (e.keyCode == 13 && !$(x).is('.autocomplete-active') && $.trim(this.value).length <= 2) {
                    e.preventDefault();
                }
                // Unselected Enter and DE/EN/FR retain their localized GET form behavior.
            });
            var addAutocompleteItemActive = function(x){
                    /*a function to classify an item as "active":*/
                if (!x) return false;
                /*start by removing the "active" class on all items:*/
                removeAutocompleteItemActive(x);
                if (currentFocus >= x.length) currentFocus = 0;
                if (currentFocus < 0) currentFocus = (x.length - 1);
                /*add class "autocomplete-active":*/
                x[currentFocus].classList.add("autocomplete-active");
                
     
                $('.list-autocomplete').scrollTop(0)
                $('.list-autocomplete').scrollTop($('.autocomplete-active').position().top - ($('.list-autocomplete').height()/2))
            }
            var removeAutocompleteItemActive = function(x) {
                /*a function to remove the "active" class from all autocomplete items:*/
                for (var i = 0; i < x.length; i++) {
                  x[i].classList.remove("autocomplete-active");
                }
            }
        }
  };
  
  return eGuardians;

})();
/**
 * @module Helper
 */
(function () {
    eGuardians.helper = new function () {
        this.sort_li = function(a, b){
            return ($(b).data('eg-index')) < ($(a).data('eg-index')) ? 1 : -1;  
        }
    };
})(eGuardians);
/**
 * @module API Service
 */
(function () {
    
    eGuardians.apiservice = new function () {
        /**
         * 
         * @param {string} url
         * @param {string} method
         * @param {string} params
         * @param {function} callback
         */

        var callApi = function(url, method, params, callback, dataType){
            dataType = dataType || "json";
            $.ajax({
                url: url,
                method: method,
                data: params,
                dataType: dataType,
                contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                beforeSend: function () {
                    /* Laderosette oder fade effekte oder so */
                },
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
                complete: function (jqXHR) {
               
                    /* Laderosette oder fade beenden */
                    //callback("complete");
                    //var response = jqXHR.responseText ? $.parseJSON(jqXHR.responseText) : {};
                    //callback(response);
                },
                success: function (jqXHR) {
            
                    //var response = jqXHR.responseText ? $.parseJSON(jqXHR.responseText) : {};
                    if(typeof callback === 'function') {
                        callback(jqXHR);
                    }
                    
                },
                fail: function(jqXHR)
                {
                    console.log("fail")
                    var response = "";
                    try{
                        response = jqXHR.responseText ? $.parseJSON(jqXHR.responseText) : {};
                    }
                    catch(error){
                        response = jqXHR;
                    }
                    
                    if(typeof callback === 'function') {
                        callback(response);
                    }

                },
                error: function (jqXHR, textStatus, errorThrown) {
                   console.log("isError")
                    //var response = jqXHR ? $.parseJSON(jqXHR) : {};
                    var response = "";
                    try{
                        response = jqXHR.responseText ? $.parseJSON(jqXHR.responseText) : {};
                    }
                    catch (error){
                        response = jqXHR;
                    }
                    if(typeof callback === 'function') {
                         callback(response);
                    }
                    //messageServiceTranslations[response.data.exceptionCode]
                },
                always: function()
                {

                }
            });
        };
          /**
           * 
           * @param {string} url
           * @param {string} data
           * @param {function} callback
           */
          this.post = function( url, data, callback, dataType){
            dataType = dataType | "json";  
            callApi(url,'POST',data,function(response){
                if(typeof callback === 'function') {
                    callback(response);
                }
            }, dataType);
          };   
			this.get = function( url, data, callback, dataType){
            dataType = dataType || "json"; 
            callApi(url,'GET',data,function(response){
                if(typeof callback === 'function') {
                    callback(response);
                }
            },dataType);
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

/**
 * @module Item
 */
(function () {
    eGuardians.item = new function () {
        this.variations = new function (){
      
            var attributeList;// = $('[data-eg-attributes]');//.sort(eGuardians.helper.sort_li);
           
            //var itemVariations;// = $('[data-item-variation]').data('eg-variations');//$(attributeList).data('eg-variations'), pressedActiveParent;
            var variations = this;

            this.init = function(mainContainer){
                attributeList = $(mainContainer).find('[data-eg-attributes]');//.sort(eGuardians.helper.sort_li);
                //itemVariations = $(mainContainer).data('eg-variations');
                var itemVariations = $(mainContainer).data('eg-variations');
                variations = this;
                $(attributeList).each(function(){
                    //var variationForObject = [];
                   // var _this = this;
                    var attributeId = $(this).data('eg-attributes');
                    var indexOfAttribute = 0;//DELETE NEED? $(this).data('eg-index');

                    $(this).find('[data-eg-value]').each(function(){
                        var attributesFormat = {'attributeId':attributeId,'attributeValueId':$(this).data('eg-value')};  
                     
                        if(typeof this.variation == "undefined"){
                             this.variation = [];
                        }
        
                        /* Set Variations Data Attribute with infos to Element */
                        $(this).data('variation',variations.findVariation(attributesFormat,indexOfAttribute,mainContainer));
                    });
                });
                /** Bind Events **/


                /*if($('.modal-cross').hasClass('show')){
                    $(mainContainer).on('touchend click','.modal-cross [data-eg-attributes]:not(select) [data-eg-value]:not([data-selected]):not([data-novariations])', selectAttribute);
                }else{
                     
                }*/
                $(mainContainer).on('touchend click','[data-eg-attributes]:not(select) [data-eg-value]:not([data-selected]):not([data-novariations])', selectAttribute); 
            };
            var selectAttribute = function(attributes, searchIndex){
                $(this).closest('.attribute-box').removeClass('errorVariationSelect');
                pressedActiveParent = $(this).parents('[data-eg-attributes]');
                //pressedActiveParent = $(this).parents('[data-item-variation]');
                $(this).parents('[data-eg-attributes]').find('[data-eg-value]').removeAttr('data-selected');
                $(this).attr('data-selected','');
                $(pressedActiveParent).parents('[data-item-variation-select]').find('[data-eg-selected-attribute]').html($(this).data('eg-attrname'));
                variations.setVarition(this);
                
                /*
                
                console.log($(pressedActiveParent));
                $(pressedActiveParent).parents('[data-item-variation-select]').find('[data-eg-selected-attribute]').html($(this).data('eg-attrname'));
                $(this).attr('data-selected','');
                variations.setVarition(this);*/
                //$(pressedActiveParent).hide();
            };         
            /**
             * 
             * @param {type} attributes
             * @param {type} searchIndex
             * @returns {unresolved}
             */
            this.findVariation = function(attributes, searchIndex,_this){
                var foundedVariation = null;
                var selectedVariation = [];
                var itemVariations = $(_this).data('eg-variations');
                $(itemVariations).each(function(key, valVariation){
                        foundedVariation = valVariation.attributes.filter(function (el) { 
                            if(JSON.stringify(attributes) === JSON.stringify(el)){
                                return valVariation;
                            } 
                        }); 
                        /*if(foundedVariation!=null&&foundedVariation.length>0){
                            selectedVariation.push(valVariation);
                        }
                        var reverseAttr = valVariation.attributes.reverse();
                        foundedVariation = reverseAttr.filter(function (el) { 

                            if(JSON.stringify(attributes) === JSON.stringify(el)){
                                return valVariation;
                            } 
                        }); */
                        
                        if(foundedVariation!=null&&foundedVariation.length>0){
                            selectedVariation.push(valVariation);
                            //return false; 
                        }
                    //})
                });
                return selectedVariation;
            };
            this.getVariation = function(attributes,_this){
           
                /*var selectedVariation = itemVariations.filter(function (el) { return JSON.stringify(attributes) === JSON.stringify(el.attributes) }); 
                 Wenn keine Variante gefunden wurde dann drehe array und prüfe erneut 
                if(selectedVariation.length==0){
                    attributes = attributes.reverse();
                    selectedVariation = itemVariations.filter(function (el) { return JSON.stringify(attributes) === JSON.stringify(el.attributes) }); 
                }*/
                var selectedVariation = null;
                var foundLength = 0;
                var hasLength = attributes.length;
                var itemVariations = $(_this).closest('[data-item-variation]').data('eg-variations');
                console.log(_this)
                $(itemVariations).each(function(key, variationVal){
                    foundLength = 0;
                    $(variationVal.attributes).each(function(key, attrVal){
                        $(attributes).each(function(key, selectAttrVal){
                            if(JSON.stringify(selectAttrVal) === JSON.stringify(attrVal)){
                                foundLength++;
                            }
                        })
                        
                    });
                    if(foundLength==hasLength){
                        selectedVariation = variationVal;
                        return true;
                    }
                    
                });
   
                return selectedVariation;
            };
            this.setVarition = function(_this){
                var attributesFormat = [];
                var activeAttributeBox = null;
                $itemElement = $(_this).parents('[data-item]');
                attributeList = $itemElement.find('[data-eg-attributes]');
                
               
                $(attributeList).each(function(){
                    
                    var selectedAttributeValue = 0; 

                    if($("option:selected", this).length>0){
                        /* if element is select box */
                        selectedAttributeValue = $("option:selected", this).val();
                    }else{
                        /* custom elements */
                        selectedAttributeValue = $(this).find('[data-selected]').data('eg-value');
                    }
                    if($(this).attr('data-eg-attributes')) {   
                        /* custom elements */
                        activeAttributeBox = $(this).data('eg-attributes'); 
                        
                    }else{
                       /* if element is select box */
                        activeAttributeBox = $(_this).parentsUntil(attributeList).data('eg-attribute'); 
                    }
                    attributesFormat.push({'attributeId':activeAttributeBox,'attributeValueId':parseInt(selectedAttributeValue)});                             
                });

                //checkVariation(attributesFormat);
                this.findInactiveAttributes(_this);

                var activeVariation = this.getVariation(attributesFormat,_this);
       
                if(activeVariation != null){
                    $itemElement.find('[data-item-tobasket]').removeClass('inBasketBtnDisabled');
                    $itemElement.find('[data-item-tobasket]').tooltip('dispose');
                 
                    /* Get active VariationId and store to variation */
                    $(_this).parents('[data-item]').find('[data-item-variation]').data().activeVariationId = activeVariation.variationId;
                    $(_this).parents('[data-item]').attr('data-eg-active-variation',activeVariation.variationId);
                    /*$.get("/rest/io/variations/" + activeVariation[0].variationId+'?template='+encodeURI('Ceres::Item.SingleItem'), function(response) {
                        var responseData = JSON.parse(response).data;
                        console.log("data");
                        //console.log(getImages(responseData.documents[0].data.images));
                    });*/
                    var searchParams = {
                        template: encodeURI('Ceres::Item.SingleItem')
                    }
                    $('[data-eg-loading-attr]').addClass('isLoading');
                    eGuardians.apiservice.get('/rest/io/variations/' + activeVariation.variationId, searchParams, function(response){    
                      
                        var variationData = response.data.documents[0].data;
                        if(variationData.stock.net<7 && variationData.stock.net>0){
                            $('.data-stock-warn').html(messageServiceTranslations["stockWarn1"]+' '+variationData.stock.net+' '+messageServiceTranslations["stockWarn2"])
                        }else{
                            $('.data-stock-warn').html(messageServiceTranslations["stockWarn3"])
                        }                        
                        const pricenumber = variationData.prices.default.data.unitPrice;
                        const uvpnumber = variationData.prices.rrp.data.unitPrice;
                        $itemElement.find('[data-eg-item-price]').html(new Intl.NumberFormat("de-DE").format(pricenumber));
                        if(variationData.prices.rrp != null){
                            $itemElement.find('[data-eg-item-rrp]').html(new Intl.NumberFormat("de-DE").format(uvpnumber));
                            var rrppercent = (1 - variationData.prices.default.data.unitPrice / variationData.prices.rrp.data.unitPrice ) * -100;
                            $itemElement.find('[data-eg-item-rrp-percent]').html(Math.round(rrppercent).toFixed(0));
                            var rrpspar = (variationData.prices.default.data.unitPrice - variationData.prices.rrp.data.unitPrice );
                            $itemElement.find('[data-eg-item-rrp-spar]').html(new Intl.NumberFormat("de-DE").format(rrpspar));
                        }
                        
                        
                        
                        $itemElement.find('[data-eg-item-nr]').html(variationData.variation.number);
                        
                        $itemElement.find('[data-eg-item-availbility]').html(variationData.variation.availability.names.name).attr('data-availibilityid',variationData.variation.availability.id);
                        if(variationData.variation.availability.id>=7){
                            
                            $itemElement.find('[data-item-tobasket]').attr('title','Der Artikel ist momentan leider vergriffen');
                            $itemElement.find('[data-item-tobasket]').tooltip();
                            $itemElement.find('[data-item-tobasket]').addClass('inBasketBtnDisabled');
                        }else{
                           $itemElement.find('[data-item-tobasket]').removeClass('inBasketBtnDisabled')
                        }
                        var event = document.createEvent("Event");
                        event.initEvent("submit", false, true); 
                        document.dispatchEvent(event,response);
                        //document.dispatchEvent(new CustomEvent("variationChanged",response));
                        $('[data-eg-loading-attr]').removeClass('isLoading');
                        
                        if(variationData.prices.graduatedPrices.length>0){
                            $('.table-gruaded-head').html('');
                            $('.table-gruaded-content').html('');
                            $(variationData.prices.graduatedPrices.reverse()).each(function(i,gruadedData){
                                
                                if(gruadedData.minimumOrderQuantity>1){
                                    $('.table-gruaded-head').append('<div class="table-cell table-head">ab <span>'+gruadedData.minimumOrderQuantity+'</span></div>');
                                    $('.table-gruaded-content').append('<div class="table-cell table-content"> <span class="bold">'+gruadedData.price.formatted+'</span></div>');
                                    /*$('.table-head[data-gruadetquantity="'+gruadedData.minimumOrderQuantity+'"] > span').html(gruadedData.minimumOrderQuantity);
                                    $('.table-content[data-gruadetquantity="'+gruadedData.minimumOrderQuantity+'"] > span').html(gruadedData.price.formatted);*/
                                }
                            })
                        }
                        
                    });
                }else{
                    $itemElement.find('[data-item-tobasket]').addClass('inBasketBtnDisabled');
                    $itemElement.find('[data-item-tobasket]').attr('title','Diese Variante ist leider nicht mehr verfügbar.');
                    //$('[data-item-tobasket]').attr('data-toggle','tooltip');
                    $itemElement.find('[data-item-tobasket]').tooltip();
                }
            };
            this.findInactiveAttributes = function(activeElement){
                /* 
                 * Wählt man ein Attribute finde andere Attribute die nicht zu dem Attribut gehören 
                 * pressedActiveParent ist das Element was gerade angeklickt wurde
                 */
                $itemElement = $(activeElement).parents('[data-item]');
                $itemElement.find('[data-eg-value]').removeClass('disabled');
                var selectedAttributeData = $("[data-selected]", pressedActiveParent).data();
                $itemElement.find('[data-eg-value]').each(function(){
                   
                    if(!$(this).parents('[data-eg-attributes]').is(pressedActiveParent)){
                        var foundaAttribute = false;
                        if($(this).data().variation!=null){
                            $($(this).data().variation).each(function(varKey,varVal){
                                 $(varVal.attributes).each(function(key, attributeValue){
                                    if(attributeValue.attributeValueId==selectedAttributeData.egValue){
                                        foundaAttribute = true;
                                    }
                                });
                                if(!foundaAttribute){
                                    $(varVal.attributes.reverse()).each(function(key, attributeValue){
                                        if(attributeValue.attributeValueId==selectedAttributeData.egValue){
                                            foundaAttribute = true;
                                        }
                                    });
                                }
                            });
                        }
                        if(!foundaAttribute){
                            $(this).addClass('disabled');
                        }
                    }
                });
            };
        };
        this.quantity = {
            change: function(images){
                return images.variation.length>0 ? images.variation : images.all;
            }
        };
    };
})(eGuardians);
/**
 * @module UI
 */
(function () {
    eGuardians.ui = new function () {
        this.modal = {
            show: function(content, title){

            },
            modalRestContent: function(route,data,title,modalType){
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
                    eGuardians.events.bindEvents('.dynamicModal [data-eg-event]');
                });
            }
        };
        this.message = new function(){
            var showMessage = function(msgType, msg, msgTitle, insertElement, closeTimer, customSelector, customClass){
                msgTitle = msgTitle || "";
                closeTimer = closeTimer || 5000;
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
/**
 * @module Basket
 */
(function () {
    eGuardians.basket = new function () {

this.addItem = function(variationId, quantity, callback) {
    quantity = (typeof quantity === 'number' && quantity >= 1) ? quantity : 1;

    const data = {
        variationId: variationId,
        quantity: quantity
    };

    eGuardians.apiservice.post('/rest/io/basket/items/', data, function(response) {
        const basket = response?.events?.AfterBasketChanged?.basket;

        if (basket) {
            // Vorher alte basketCache_ Einträge löschen
            Object.keys(localStorage).forEach(function (key) {
                if (key.startsWith('basketCache_')) {
                    localStorage.removeItem(key);
                }
            });

            // Dynamisch CacheKey direkt aus aktuellem Basket berechnen
            const lang = $('html').attr('lang') || 'de';
            const currency = basket.currency || 'EUR';
            const shippingCountryId = basket.shippingCountryId || 1;
            const customerId = basket.customerId > 0 ? basket.customerId : 'guest';
            const dynamicCacheKey = `${lang}_${currency}_${shippingCountryId}_${customerId}`;

            // Neuen Cache schreiben
            localStorage.setItem('basketCache_' + dynamicCacheKey, JSON.stringify({
                timestamp: Date.now(),
                data: { basket }
            }));
        }

        if (typeof callback === 'function') {
            callback(response);
        }
    });
};
        this.openBasketPreviewSmall = function(callback) {
            const version = 'v2'; // <<< Bei Template-Änderung erhöhen
            const lang = activeLang2;
            const storageKey = `basketPreviewSmall:${lang}:${version}`;

            // Alte Versionen löschen
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(`basketPreviewSmall:${lang}:`) && key !== storageKey) {
                    localStorage.removeItem(key);
                }
            });

            const handleResponse = (data) => {
                $('.basket-prev-small-data').html(data);
                eGuardians.events.bindEvents('.basket-prev-small [data-eg-event]');

                // >>> Auto-Hide des Toasts nach 3 Sekunden
                setTimeout(() => {
                    $('#wkb-toast').removeClass('show'); // oder: .fadeOut(), .addClass('hide') etc.
                }, 3000);
            };

            const cachedData = localStorage.getItem(storageKey);
            if (cachedData) {
                handleResponse(cachedData);
                if (typeof callback === 'function') callback({ data: cachedData });
                return;
            }

            const url = `${lang}/basketPreviewSmall/`;

            eGuardians.apiservice.get(url, '', response => {
                localStorage.setItem(storageKey, response.data);
                handleResponse(response.data);
                if (typeof callback === 'function') callback(response);
            });
        };
        this.closeBasketPreview = function(){
            $('.loading-basket-prev-wrap').show();
            $('html').removeClass('basket-preview-open');
            $('[data-eg-basket-preview]').find('.basket-prev-data').html('');
        }
       
        
    }
})(eGuardians);

/**
 * @module User
 */
(function () {
    eGuardians.user = new function () {
       this.login = function(userMail, userPassword, callback){
            var loginParams = {
                email: userMail,
                password: userPassword
            };

            eGuardians.apiservice.post('/rest/io/customer/login/', loginParams, function(response) {
                if (response?.events?.AfterAccountAuthentication?.isSuccess) {
                    // 🧹 Cache löschen, Basket neu laden
                    Object.keys(localStorage).forEach(function (key) {
                        if (key.startsWith('basketCache_')) {
                            localStorage.removeItem(key);
                        }
                    });
                    eGuardians.events.initShopData();
                }

                if (typeof callback === 'function') {
                    callback(response);
                }
            });
        };

        this.logout = function(callback){
            eGuardians.apiservice.post('/rest/io/customer/logout/', '', function(response) {
                // 🧹 Cache löschen, Basket neu laden
                Object.keys(localStorage).forEach(function (key) {
                    if (key.startsWith('basketCache_')) {
                        localStorage.removeItem(key);
                    }
                });
                eGuardians.events.initShopData();

                if (typeof callback === 'function') {
                    callback(response);
                }
            });
        };

    }
})(eGuardians);
/**
 * @module Validator
 */
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
/**
 * @module Helper
 */
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
 // return eGuardians = new eGuardians();

/** CUSTOM JS */
var loadJS = function(url, implementationCode, location){
    //url is URL of external file, implementationCode is the code
    //to be called from the file, location is the location to 
    //insert the <script> element
    var scriptTag = document.createElement('script');
    scriptTag.src = url;

    scriptTag.onload = implementationCode;
    scriptTag.onreadystatechange = implementationCode;

    location.appendChild(scriptTag);
};                                                                                               

$(document).on('click', '.related-search button', function(event){   
    if($(this).hasClass('directlink')){
        document.location.href = $(this).data('searchtxt');
    }else{
        document.location.href= "/search/?query="+$(this).data('searchtxt');
    }
});
$(document).on('click', '.mobile-magic .top-menu > .eg-ddown > a', function(event){ 
    $('.top-menu > .eg-ddown').not($(this).closest('.eg-ddown')).removeClass('isOpen');
    if($(window).width()>=992 && !$(this).closest('.eg-ddown').hasClass('isOpen')){
        $(this).closest('.eg-ddown').addClass('isOpen');
        return false;
    }
    
});

$(document).on('click touchend', '.menuShowAll', function(e){   
    e.stopPropagation(); 
    e.preventDefault();
    document.location.href = $(this).closest('.eg-ddown').find('a').first().attr('href');
});

$('body :not(.checkout) [data-toggle="tooltip"]').tooltip();


/*! lozad.js - v1.16.0 - 2020-09-06
* https://github.com/ApoorvSaxena/lozad.js
* Copyright (c) 2020 Apoorv Saxena; Licensed MIT */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):t.lozad=e()}(this,function(){"use strict";
/**
   * Detect IE browser
   * @const {boolean}
   * @private
   */var g="undefined"!=typeof document&&document.documentMode,f={rootMargin:"0px",threshold:0,load:function(t){if("picture"===t.nodeName.toLowerCase()){var e=t.querySelector("img"),r=!1;null===e&&(e=document.createElement("img"),r=!0),g&&t.getAttribute("data-iesrc")&&(e.src=t.getAttribute("data-iesrc")),t.getAttribute("data-alt")&&(e.alt=t.getAttribute("data-alt")),r&&t.append(e)}if("video"===t.nodeName.toLowerCase()&&!t.getAttribute("data-src")&&t.children){for(var a=t.children,o=void 0,i=0;i<=a.length-1;i++)(o=a[i].getAttribute("data-src"))&&(a[i].src=o);t.load()}t.getAttribute("data-poster")&&(t.poster=t.getAttribute("data-poster")),t.getAttribute("data-src")&&(t.src=t.getAttribute("data-src")),t.getAttribute("data-srcset")&&t.setAttribute("srcset",t.getAttribute("data-srcset"));var n=",";if(t.getAttribute("data-background-delimiter")&&(n=t.getAttribute("data-background-delimiter")),t.getAttribute("data-background-image"))t.style.backgroundImage="url('"+t.getAttribute("data-background-image").split(n).join("'),url('")+"')";else if(t.getAttribute("data-background-image-set")){var d=t.getAttribute("data-background-image-set").split(n),u=d[0].substr(0,d[0].indexOf(" "))||d[0];// Substring before ... 1x
u=-1===u.indexOf("url(")?"url("+u+")":u,1===d.length?t.style.backgroundImage=u:t.setAttribute("style",(t.getAttribute("style")||"")+"background-image: "+u+"; background-image: -webkit-image-set("+d+"); background-image: image-set("+d+")")}t.getAttribute("data-toggle-class")&&t.classList.toggle(t.getAttribute("data-toggle-class"))},loaded:function(){}};function A(t){t.setAttribute("data-loaded",!0)}var m=function(t){return"true"===t.getAttribute("data-loaded")},v=function(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:document;return t instanceof Element?[t]:t instanceof NodeList?t:e.querySelectorAll(t)};return function(){var r,a,o=0<arguments.length&&void 0!==arguments[0]?arguments[0]:".lozad",t=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{},e=Object.assign({},f,t),i=e.root,n=e.rootMargin,d=e.threshold,u=e.load,g=e.loaded,s=void 0;"undefined"!=typeof window&&window.IntersectionObserver&&(s=new IntersectionObserver((r=u,a=g,function(t,e){t.forEach(function(t){(0<t.intersectionRatio||t.isIntersecting)&&(e.unobserve(t.target),m(t.target)||(r(t.target),A(t.target),a(t.target)))})}),{root:i,rootMargin:n,threshold:d}));for(var c,l=v(o,i),b=0;b<l.length;b++)(c=l[b]).getAttribute("data-placeholder-background")&&(c.style.background=c.getAttribute("data-placeholder-background"));return{observe:function(){for(var t=v(o,i),e=0;e<t.length;e++)m(t[e])||(s?s.observe(t[e]):(u(t[e]),A(t[e]),g(t[e])))},triggerLoad:function(t){m(t)||(u(t),A(t),g(t))},observer:s}}});

/*


   Magic Zoom Plus v5.3.5 
   Copyright 2020 Magic Toolbox
   Buy a license: https://www.magictoolbox.com/magiczoomplus/
   License agreement: https://www.magictoolbox.com/license/


*/
eval(function(m,a,g,i,c,k){c=function(e){return(e<a?'':c(parseInt(e/a)))+((e=e%a)>35?String.fromCharCode(e+29):e.toString(36))};if(!''.replace(/^/,String)){while(g--){k[c(g)]=i[g]||c(g)}i=[function(e){return k[e]}];c=function(){return'\\w+'};g=1};while(g--){if(i[g]){m=m.replace(new RegExp('\\b'+c(g)+'\\b','g'),i[g])}}return m}('1n.b2=(17(){1a B,q;B=q=(17(){1a W={4J:"jd.3.4",et:0,9f:{},$cy:17(aa){1b(aa.$6J||(aa.$6J=++Q.et))},9s:17(aa){1b(Q.9f[aa]||(Q.9f[aa]={}))},$F:17(){},$1k:17(){1b 1k},$1s:17(){1b 1s},eT:"fK-"+1q.4V(1q.6n()*1v cG().fz()),3F:17(aa){1b(2G!=aa)},bI:17(ab,aa){1b(2G!=ab)?ab:aa},9t:17(aa){1b!!(aa)},1V:17(aa){if(!Q.3F(aa)){1b 1k}if(aa.$5a){1b aa.$5a}if(!!aa.6y){if(1==aa.6y){1b"6t"}if(3==aa.6y){1b"gi"}}if(aa.1I&&aa.ex){1b"gs"}if(aa.1I&&aa.9v){1b"2h"}if((aa 3Y 1n.74||aa 3Y 1n.bQ)&&aa.5t===Q.3V){1b"4d"}if(aa 3Y 1n.4Z){1b"4v"}if(aa 3Y 1n.bQ){1b"17"}if(aa 3Y 1n.6L){1b"1S"}if(Q.1f.5g){if(Q.3F(aa.g3)){1b"1t"}}1j{if(aa===1n.1t||aa.5t==1n.1u||aa.5t==1n.ec||aa.5t==1n.e0||aa.5t==1n.gt||aa.5t==1n.gu){1b"1t"}}if(aa 3Y 1n.cG){1b"ge"}if(aa 3Y 1n.dn){1b"gv"}if(aa===1n){1b"1n"}if(aa===1p){1b"1p"}1b 9n(aa)},2e:17(af,ae){if(!(af 3Y 1n.4Z)){af=[af]}if(!ae){1b af[0]}1U(1a ad=0,ab=af.1I;ad<ab;ad++){if(!Q.3F(af)){92}1U(1a ac in ae){if(!74.2t.4l.2g(ae,ac)){92}3c{af[ad][ac]=ae[ac]}3x(aa){}}}1b af[0]},9Z:17(ae,ad){if(!(ae 3Y 1n.4Z)){ae=[ae]}1U(1a ac=0,aa=ae.1I;ac<aa;ac++){if(!Q.3F(ae[ac])){92}if(!ae[ac].2t){92}1U(1a ab in(ad||{})){if(!ae[ac].2t[ab]){ae[ac].2t[ab]=ad[ab]}}}1b ae[0]},fu:17(ac,ab){if(!Q.3F(ac)){1b ac}1U(1a aa in(ab||{})){if(!ac[aa]){ac[aa]=ab[aa]}}1b ac},$3c:17(){1U(1a ab=0,aa=2h.1I;ab<aa;ab++){3c{1b 2h[ab]()}3x(ac){}}1b 1h},$A:17(ac){if(!Q.3F(ac)){1b Q.$([])}if(ac.d8){1b Q.$(ac.d8())}if(ac.ex){1a ab=ac.1I||0,aa=1v 4Z(ab);5R(ab--){aa[ab]=ac[ab]}1b Q.$(aa)}1b Q.$(4Z.2t.8n.2g(ac))},6e:17(){1b 1v cG().fz()},3E:17(ae){1a ac;4B(Q.1V(ae)){1D"8Q":ac={};1U(1a ad in ae){ac[ad]=Q.3E(ae[ad])}1J;1D"4v":ac=[];1U(1a ab=0,aa=ae.1I;ab<aa;ab++){ac[ab]=Q.3E(ae[ab])}1J;1T:1b ae}1b Q.$(ac)},$:17(ac){1a aa=1s;if(!Q.3F(ac)){1b 1h}if(ac.$cE){1b ac}4B(Q.1V(ac)){1D"4v":ac=Q.fu(ac,Q.2e(Q.4Z,{$cE:Q.$F}));ac.3d=ac.9D;ac.4u=Q.4Z.4u;1b ac;1J;1D"1S":1a ab=1p.dT(ac);if(Q.3F(ab)){1b Q.$(ab)}1b 1h;1J;1D"1n":1D"1p":Q.$cy(ac);ac=Q.2e(ac,Q.3H);1J;1D"6t":Q.$cy(ac);ac=Q.2e(ac,Q.4g);1J;1D"1t":ac=Q.2e(ac,Q.1u);1J;1D"gi":1D"17":1D"4v":1D"ge":1T:aa=1k;1J}if(aa){1b Q.2e(ac,{$cE:Q.$F})}1j{1b ac}},$1v:17(aa,ac,ab){1b Q.$(Q.8i.8Z(aa)).8K(ac||{}).1z(ab||{})},5O:17(ad,ae,ab){1a aa,ag,ac,ai=[],ah=-1;ab||(ab=Q.eT);aa=Q.$(ab)||Q.$1v("2m",{id:ab,1x:"aJ/5c"}).2b((1p.gy||1p.3n),"1H");ag=aa.fk||aa.fm;if("1S"!=Q.1V(ae)){1U(1a ac in ae){ai.2Z(ac+":"+ae[ac])}ae=ai.7c(";")}if(ag.f4){ah=ag.f4(ad+" {"+ae+"}",ag.gz.1I)}1j{3c{ah=ag.gA(ad,ae,ag.gB.1I)}3x(af){}}1b ah},gC:17(ad,aa){1a ac,ab;ac=Q.$(ad);if("6t"!==Q.1V(ac)){1b}ab=ac.fk||ac.fm;if(ab.eJ){ab.eJ(aa)}1j{if(ab.fq){ab.fq(aa)}}},gD:17(){1b"gE-gF-gr-gX-gQ".4y(/[gW]/g,17(ac){1a ab=1q.6n()*16|0,aa=ac=="x"?ab:(ab&3|8);1b aa.8L(16)}).89()},6K:(17(){1a aa;1b 17(ab){if(!aa){aa=1p.8Z("a")}aa.3k("7k",ab);1b("!!"+aa.7k).4y("!!","")}})(),gV:17(ac){1a ad=0,aa=ac.1I;1U(1a ab=0;ab<aa;++ab){ad=31*ad+ac.fX(ab);ad%=gU}1b ad}};1a Q=W;1a R=W.$;if(!1n.ft){1n.ft=W;1n.$fK=W.$}Q.4Z={$5a:"4v",51:17(ad,ae){1a aa=13.1I;1U(1a ab=13.1I,ac=(ae<0)?1q.26(0,ab+ae):ae||0;ac<ab;ac++){if(13[ac]===ad){1b ac}}1b-1},4u:17(aa,ab){1b 13.51(aa,ab)!=-1},9D:17(aa,ad){1U(1a ac=0,ab=13.1I;ac<ab;ac++){if(ac in 13){aa.2g(ad,13[ac],ac,13)}}},3a:17(aa,af){1a ae=[];1U(1a ad=0,ab=13.1I;ad<ab;ad++){if(ad in 13){1a ac=13[ad];if(aa.2g(af,13[ad],ad,13)){ae.2Z(ac)}}}1b ae},gT:17(aa,ae){1a ad=[];1U(1a ac=0,ab=13.1I;ac<ab;ac++){if(ac in 13){ad[ac]=aa.2g(ae,13[ac],ac,13)}}1b ad}};Q.9Z(6L,{$5a:"1S",5e:17(){1b 13.4y(/^\\s+|\\s+$/g,"")},eq:17(aa,ab){1b(ab||1k)?(13.8L()===aa.8L()):(13.5d().8L()===aa.5d().8L())},5Q:17(){1b 13.4y(/-\\D/g,17(aa){1b aa.9w(1).89()})},9E:17(){1b 13.4y(/[A-Z]/g,17(aa){1b("-"+aa.9w(0).5d())})},gS:17(aa){1b 6j(13,aa||10)},gR:17(){1b 2A(13)},ev:17(){1b!13.4y(/1s/i,"").5e()},3o:17(ab,aa){aa=aa||"";1b(aa+13+aa).51(aa+ab+aa)>-1}});W.9Z(bQ,{$5a:"17",1E:17(){1a ab=Q.$A(2h),aa=13,ac=ab.7e();1b 17(){1b aa.6X(ac||1h,ab.5X(Q.$A(2h)))}},2K:17(){1a ab=Q.$A(2h),aa=13,ac=ab.7e();1b 17(ad){1b aa.6X(ac||1h,Q.$([ad||(Q.1f.2L?1n.1t:1h)]).5X(ab))}},2F:17(){1a ab=Q.$A(2h),aa=13,ac=ab.7e();1b 1n.4K(17(){1b aa.6X(aa,ab)},ac||0)},fY:17(){1a ab=Q.$A(2h),aa=13;1b 17(){1b aa.2F.6X(aa,ab)}},dq:17(){1a ab=Q.$A(2h),aa=13,ac=ab.7e();1b 1n.eF(17(){1b aa.6X(aa,ab)},ac||0)}});1a X={};1a P=3P.gP.5d();1a O=P.3N(/(3Z|7b|5g|bh)\\/(\\d+\\.?\\d*)/i);1a T=P.3N(/(gI|bo)\\/(\\d+\\.?\\d*)/i)||P.3N(/(fi|6l|aL|ff|7n|bo)\\/(\\d+\\.?\\d*)/i);1a V=P.3N(/4J\\/(\\d+\\.?\\d*)/i);1a K=1p.4P.2m;17 L(ab){1a aa=ab.9w(0).89()+ab.8n(1);1b ab in K||("fd"+aa)in K||("fo"+aa)in K||("6r"+aa)in K||("O"+aa)in K}Q.1f={2N:{gN:!!(1p.gK),gq:!!(1n.9u),by:!!(1p.cS),5p:!!(1p.gn||1p.go||1p.9I||1p.fW||1p.i5||1p.ii||1p.iE||1p.gY||1p.iF),fV:!!(1n.jb)&&!!(1n.ja)&&(1n.a4&&"j9"in 1v a4),2a:L("2a"),2o:L("2o"),9q:L("9q"),cU:L("cU"),5q:1k,g0:1k,9i:1k,6d:1k,8b:(17(){1b 1p.j6.j5("cf://cd.cc.cb/j4/j3/j1#j0","1.1")}())},9N:(17(){1b"iW"in 1n||(1n.dr&&1p 3Y dr)||(3P.iH>0)||(3P.iR>0)}()),2I:!!P.3N(/(8a|bb\\d+|iQ).+|iO|iN\\/|iM|iL|iK|i3|hq|he|h0|ip(dR|eu|ad)|hd|hc|hb |h9|h8|h7|2I.+ff|h5|7n m(h4|in)i|h2( h1)?|fw|p(hf|hv)\\/|hN|i1|hY|hX(4|6)0|hW|hU|hS\\.(1f|3R)|hR|hQ|hP (ce|fw)|hx|hL/),6m:(O&&O[1])?O[1].5d():(1n.7n)?"bh":!!(1n.hJ)?"5g":(1p.hI!==2G||1n.hD!==1h)?"7b":(1n.hC!==1h||!3P.hB)?"3Z":"hA",4J:(O&&O[2])?2A(O[2]):0,4E:(T&&T[1])?T[1].5d():"",7r:(T&&T[2])?2A(T[2]):0,9b:"",ch:"",5r:"",2L:0,4w:P.3N(/ip(?:ad|eu|dR)/)?"7z":(P.3N(/(?:gp|8a)/)||3P.4w.3N(/eD|9K|hy/i)||["hz"])[0].5d(),eB:1p.9B&&1p.9B.5d()==="e8",g7:0,4n:17(){1b(1p.9B&&1p.9B.5d()==="e8")?1p.3n:1p.4P},5q:1n.5q||1n.hE||1n.hF||1n.hG||1n.hH||2G,9Y:1n.9Y||1n.dj||1n.dj||1n.hK||1n.hM||1n.hO||2G,2p:1k,7X:17(){if(Q.1f.2p){1b}1a ad;1a ac;Q.1f.2p=1s;Q.3n=Q.$(1p.3n);Q.9K=Q.$(1n);3c{1a ab=Q.$1v("36").1z({1e:2M,1g:2M,7F:"6q",2n:"5S",1H:-hT}).2b(1p.3n);Q.1f.g7=ab.ej-ab.dL;ab.2T()}3x(aa){}3c{ad=Q.$1v("36");ac=ad.2m;ac.fj="fG:1Y(cM://),1Y(cM://),hV 1Y(cM://)";Q.1f.2N.g0=(/(1Y\\s*\\(.*?){3}/).3z(ac.fG);ac=1h;ad=1h}3x(aa){}if(!Q.1f.7V){Q.1f.7V=Q.9F("2o").9E()}3c{ad=Q.$1v("36");ad.2m.fj=Q.9F("3a").9E()+":5G(hZ);";Q.1f.2N.9i=!!ad.2m.1I&&(!Q.1f.2L||Q.1f.2L>9);ad=1h}3x(aa){}if(!Q.1f.2N.9i){Q.$(1p.4P).1B("6o-i0-2R")}3c{Q.1f.2N.6d=(17(){1a ae=Q.$1v("6d");1b!!(ae.f3&&ae.f3("2d"))}())}3x(aa){}if(1n.hu===2G&&1n.h3!==2G){X.2S="h6"}Q.3H.34.2g(Q.$(1p),"aS")}};(17(){1a ab=[],ae,ad,af;17 aa(){1b!!(2h.9v.c7)}4B(Q.1f.6m){1D"5g":if(!Q.1f.4J){Q.1f.4J=!!(1n.a4)?3:2}1J;1D"7b":Q.1f.4J=(T&&T[2])?2A(T[2]):0;1J}Q.1f[Q.1f.6m]=1s;if(T&&T[1]==="fi"){Q.1f.4E="6l"}if(!!1n.6l){Q.1f.6l=1s}if(T&&T[1]==="bo"){Q.1f.4E="7n";Q.1f.7n=1s}if(Q.1f.4E==="aL"&&(V&&V[1])){Q.1f.7r=2A(V[1])}if(Q.1f.4w==="8a"&&Q.1f.3Z&&(V&&V[1])){Q.1f.8G=1s}ae=({7b:["-fp-","fo","fp"],3Z:["-3Z-","fd","3Z"],5g:["-6r-","6r","6r"],bh:["-o-","O","o"]})[Q.1f.6m]||["","",""];Q.1f.9b=ae[0];Q.1f.ch=ae[1];Q.1f.5r=ae[2];Q.1f.2L=!Q.1f.5g?2G:(1p.eA)?1p.eA:(17(){1a ag=0;if(Q.1f.eB){1b 5}4B(Q.1f.4J){1D 2:ag=6;1J;1D 3:ag=7;1J}1b ag}());if(!Q.1f.2I&&Q.1f.4w==="eD"&&Q.1f.9N){Q.1f.2I=1s;Q.1f.4w="7z"}ab.2Z(Q.1f.4w+"-2R");if(Q.1f.2I){ab.2Z("2I-2R")}if(Q.1f.8G){ab.2Z("8a-1f-2R")}if(Q.1f.2L){Q.1f.4E="ie";Q.1f.7r=Q.1f.2L;ab.2Z("ie"+Q.1f.2L+"-2R");1U(ad=11;ad>Q.1f.2L;ad--){ab.2Z("lt-ie"+ad+"-2R")}}if(Q.1f.3Z&&Q.1f.4J<ha){Q.1f.2N.5p=1k}if(Q.1f.5q){Q.1f.5q.2g(1n,17(){Q.1f.2N.5q=1s})}if(Q.1f.2N.8b){ab.2Z("8b-2R")}1j{ab.2Z("6o-8b-2R")}af=(1p.4P.6I||"").3N(/\\S+/g)||[];1p.4P.6I=Q.$(af).5X(ab).7c(" ");3c{1p.4P.3k("3j-2R-eQ",Q.1f.4E);1p.4P.3k("3j-2R-eQ-eR",Q.1f.7r);1p.4P.3k("3j-2R-6m",Q.1f.6m);1p.4P.3k("3j-2R-6m-eR",Q.1f.4J)}3x(ac){}if(Q.1f.2L&&Q.1f.2L<9){1p.8Z("5K");1p.8Z("dD")}if(!1n.3P.78){Q.$(["hg","hh","hi","hj","hk"]).3d(17(ag){X["hl"+ag.5d()]=1n.3P.8p?"hm"+ag:-1})}}());(17(){Q.1f.5p={aH:Q.1f.2N.5p,4Y:17(){1b!!(1p.hn||1p[Q.1f.5r+"ho"]||1p.5p||1p.hp||1p[Q.1f.5r+"hr"])},cH:17(aa,ab){if(!ab){ab={}}if(13.aH){Q.$(1p).1C(13.bc,13.gh=17(ac){if(13.4Y()){if(ab.cF){ab.cF()}}1j{Q.$(1p).1O(13.bc,13.gh);if(ab.cN){ab.cN()}}}.2K(13));Q.$(1p).1C(13.b9,13.6U=17(ac){if(ab.9m){ab.9m()}Q.$(1p).1O(13.b9,13.6U)}.2K(13));(aa.hs||aa[Q.1f.5r+"ht"]||aa[Q.1f.5r+"i2"]||17(){}).2g(aa)}1j{if(ab.9m){ab.9m()}}},fE:(1p.9I||1p.fW||1p[Q.1f.5r+"hw"]||1p[Q.1f.5r+"iG"]||17(){}).1E(1p),bc:1p.fI?"iI":(1p.9I?"":Q.1f.5r)+"iJ",b9:1p.fI?"iP":(1p.9I?"":Q.1f.5r)+"iS",iT:Q.1f.5r,iU:1h}}());1a Z=/\\S+/g,N=/^(40(d2|d0|dm|du)iV)|((7C|9l)(d2|d0|dm|du))$/,S={"iY":("2G"===9n(K.db))?"iZ":"db"},U={fZ:1s,g9:1s,2u:1s,gd:1s,1l:1s},M=(1n.dh)?17(ac,aa){1a ab=1n.dh(ac,1h);1b ab?ab.jc(aa)||ab[aa]:1h}:17(ad,ab){1a ac=ad.j2,aa=1h;aa=ac?ac[ab]:1h;if(1h==aa&&ad.2m&&ad.2m[ab]){aa=ad.2m[ab]}1b aa};17 Y(ac){1a aa,ab;ab=(Q.1f.3Z&&"3a"==ac)?1k:(ac in K);if(!ab){aa=Q.1f.ch+ac.9w(0).89()+ac.8n(1);if(aa in K){1b aa}}1b ac}Q.9F=Y;Q.4g={d1:17(aa){1b!(aa||"").3o(" ")&&(13.6I||"").3o(aa," ")},1B:17(ae){1a ab=(13.6I||"").3N(Z)||[],ad=(ae||"").3N(Z)||[],aa=ad.1I,ac=0;1U(;ac<aa;ac++){if(!Q.$(ab).4u(ad[ac])){ab.2Z(ad[ac])}}13.6I=ab.7c(" ");1b 13},1R:17(af){1a ab=(13.6I||"").3N(Z)||[],ae=(af||"").3N(Z)||[],aa=ae.1I,ad=0,ac;1U(;ad<aa;ad++){if((ac=Q.$(ab).51(ae[ad]))>-1){ab.8y(ac,1)}}13.6I=af?ab.7c(" "):"";1b 13},j7:17(aa){1b 13.d1(aa)?13.1R(aa):13.1B(aa)},3B:17(ab){1a ac=ab.5Q(),aa=1h;ab=S[ac]||(S[ac]=Y(ac));aa=M(13,ab);if("2B"===aa){aa=1h}if(1h!==aa){if("2u"==ab){1b Q.3F(aa)?2A(aa):1}if(N.3z(ab)){aa=6j(aa,10)?aa:"6G"}}1b aa},3X:17(ab,aa){1a ad=ab.5Q();3c{if("2u"==ab){13.d4(aa);1b 13}ab=S[ad]||(S[ad]=Y(ad));13.2m[ab]=aa+(("6Z"==Q.1V(aa)&&!U[ad])?"2D":"")}3x(ac){}1b 13},1z:17(ab){1U(1a aa in ab){13.3X(aa,ab[aa])}1b 13},j8:17(){1a aa={};Q.$A(2h).3d(17(ab){aa[ab]=13.3B(ab)},13);1b aa},d4:17(ac,aa){1a ab;aa=aa||1k;13.2m.2u=ac;ac=6j(2A(ac)*2M);if(aa){if(0===ac){if("3r"!=13.2m.5b){13.2m.5b="3r"}}1j{if("5u"!=13.2m.5b){13.2m.5b="5u"}}}if(Q.1f.2L&&Q.1f.2L<9){if(!9M(ac)){if(!~13.2m.3a.51("bO")){13.2m.3a+=" d9:dd.e4.bO(a3="+ac+")"}1j{13.2m.3a=13.2m.3a.4y(/a3=\\d*/i,"a3="+ac)}}1j{13.2m.3a=13.2m.3a.4y(/d9:dd.e4.bO\\(a3=\\d*\\)/i,"").5e();if(""===13.2m.3a){13.2m.5i("3a")}}}1b 13},8K:17(aa){1U(1a ab in aa){if("4d"===ab){13.1B(""+aa[ab])}1j{13.3k(ab,""+aa[ab])}}1b 13},iX:17(){1a ab=0,aa=0;ab=13.3B("2a-5J");aa=13.3B("2a-cL");ab=ab.51("6r")>-1?2A(ab):ab.51("s")>-1?2A(ab)*cg:0;aa=aa.51("6r")>-1?2A(aa):aa.51("s")>-1?2A(aa)*cg:0;1b ab+aa},49:17(){1b 13.1z({6P:"38",5b:"3r"})},5z:17(){1b 13.1z({6P:"",5b:"5u"})},1F:17(){1b{1e:13.ej,1g:13.io}},9g:17(ab){1a aa=13.1F();aa.1e-=(2A(13.3B("40-1P-1e")||0)+2A(13.3B("40-2Q-1e")||0));aa.1g-=(2A(13.3B("40-1H-1e")||0)+2A(13.3B("40-2P-1e")||0));if(!ab){aa.1e-=(2A(13.3B("7C-1P")||0)+2A(13.3B("7C-2Q")||0));aa.1g-=(2A(13.3B("7C-1H")||0)+2A(13.3B("7C-2P")||0))}1b aa},79:17(){1b{1H:13.8X,1P:13.8P}},i6:17(){1a aa=13,ab={1H:0,1P:0};do{ab.1P+=aa.8P||0;ab.1H+=aa.8X||0;aa=aa.4c}5R(aa);1b ab},9e:17(){1a ae=13,ab=0,ad=0;if(Q.3F(1p.4P.6N)){1a aa=13.6N(),ac=Q.$(1p).79(),af=Q.1f.4n();1b{1H:aa.1H+ac.y-af.i7,1P:aa.1P+ac.x-af.i8}}do{ab+=ae.i9||0;ad+=ae.ia||0;ae=ae.ib}5R(ae&&!(/^(?:3n|co)$/i).3z(ae.9x));1b{1H:ad,1P:ab}},8c:17(){1a ab=13.9e();1a aa=13.1F();1b{1H:ab.1H,2P:ab.1H+aa.1g,1P:ab.1P,2Q:ab.1P+aa.1e}},5Z:17(ab){3c{13.ic=ab}3x(aa){13.ig=ab}1b 13},2T:17(){1b(13.4c)?13.4c.bX(13):13},5k:17(){Q.$A(13.ih).3d(17(aa){if(3==aa.6y||8==aa.6y){1b}Q.$(aa).5k()});13.2T();13.cP();if(13.$6J){Q.9f[13.$6J]=1h;4W Q.9f[13.$6J]}1b 1h},3b:17(ac,ab){ab=ab||"2P";1a aa=13.4C;("1H"==ab&&aa)?13.ij(ac,aa):13.bw(ac);1b 13},2b:17(ac,ab){1a aa=Q.$(ac).3b(13,ab);1b 13},fg:17(aa){13.3b(aa.4c.7R(13,aa));1b 13},aC:17(aa){if("6t"!==Q.1V("1S"==Q.1V(aa)?aa=1p.dT(aa):aa)){1b 1k}1b(13==aa)?1k:(13.4u&&!(Q.1f.dB))?(13.4u(aa)):(13.dV)?!!(13.dV(aa)&16):Q.$A(13.8O(aa.9x)).4u(aa)}};Q.4g.ik=Q.4g.3B;Q.4g.il=Q.4g.1z;if(!1n.4g){1n.4g=Q.$F;if(Q.1f.6m.3Z){1n.1p.8Z("im")}1n.4g.2t=(Q.1f.6m.3Z)?1n["[[iq.2t]]"]:{}}Q.9Z(1n.4g,{$5a:"6t"});Q.3H={1F:17(){if(Q.1f.9N||Q.1f.ir||Q.1f.dB){1b{1e:1n.5H,1g:1n.4M}}1b{1e:Q.1f.4n().dL,1g:Q.1f.4n().is}},79:17(){1b{x:1n.it||Q.1f.4n().8P,y:1n.iu||Q.1f.4n().8X}},iv:17(){1a aa=13.1F();1b{1e:1q.26(Q.1f.4n().iw,aa.1e),1g:1q.26(Q.1f.4n().ix,aa.1g)}}};Q.2e(1p,{$5a:"1p"});Q.2e(1n,{$5a:"1n"});Q.2e([Q.4g,Q.3H],{1Q:17(ad,ab){1a aa=Q.9s(13.$6J),ac=aa[ad];if(2G!==ab&&2G===ac){ac=aa[ad]=ab}1b(Q.3F(ac)?ac:1h)},2O:17(ac,ab){1a aa=Q.9s(13.$6J);aa[ac]=ab;1b 13},2z:17(ab){1a aa=Q.9s(13.$6J);4W aa[ab];1b 13}});if(!(1n.b4&&1n.b4.2t&&1n.b4.2t.b6)){Q.2e([Q.4g,Q.3H],{b6:17(aa){1b Q.$A(13.aP("*")).3a(17(ac){3c{1b(1==ac.6y&&ac.6I.3o(aa," "))}3x(ab){}})}})}Q.2e([Q.4g,Q.3H],{aQ:17(){1b 13.b6(2h[0])},8O:17(){1b 13.aP(2h[0])}});if(Q.1f.5p.aH&&!1p.gc){Q.4g.gc=17(){Q.1f.5p.cH(13)}}Q.1u={$5a:"1t",6H:Q.$1k,2i:17(){1b 13.5L().56()},5L:17(){if(13.g4){13.g4()}1j{13.g3=1s}1b 13},56:17(){if(13.f0){13.f0()}1j{13.iy=1k}1b 13},4q:17(){13.6H=Q.$1s;1b 13},7P:17(){1a aa=(/3p/i).3z(13.1x)?13.4X[0]:13;1b!Q.3F(aa)?{x:0,y:0}:{x:aa.3C,y:aa.3A}},5V:17(){1a aa=(/3p/i).3z(13.1x)?13.4X[0]:13;1b!Q.3F(aa)?{x:0,y:0}:{x:aa.3M||aa.3C+Q.1f.4n().8P,y:aa.3L||aa.3A+Q.1f.4n().8X}},cA:17(){1a aa=13.3W||13.iz;5R(aa&&aa.6y===3){aa=aa.4c}1b aa},8s:17(){1a ab=1h;4B(13.1x){1D"7M":1D"iA":1D"iB":ab=13.9O||13.iC;1J;1D"9c":1D"cT":1D"eo":ab=13.9O||13.iD;1J;1T:1b ab}3c{5R(ab&&ab.6y===3){ab=ab.4c}}3x(aa){ab=1h}1b ab},7p:17(){if(!13.eb&&13.2v!==2G){1b(13.2v&1?1:(13.2v&2?3:(13.2v&4?2:0)))}1b 13.eb},6A:17(){1b(13.2r&&(13.2r==="3p"||13.2r===13.6D))||(/3p/i).3z(13.1x)},5n:17(){if(13.2r){1b(13.2r==="3p"||13.6D===13.2r)&&13.7L}1j{if(13 3Y 1n.7N){1b 13.4X.1I===1&&(13.6C.1I?13.6C.1I===1&&13.6C[0].6g===13.4X[0].6g:1s)}}1b 1k},6Q:17(){if(13.2r){1b 13.7L&&(13.2r==="3p"||13.6D===13.2r)?13:1h}1j{if(13 3Y 1n.7N){1b 13.4X[0]}}1b 1h},8F:17(){if(13.2r){1b 13.7L&&(13.2r==="3p"||13.6D===13.2r)?13.4f:1h}1j{if(13 3Y 1n.7N){1b 13.4X[0].6g}}1b 1h}};Q.ck="gl";Q.bV="i4";Q.9V="";if(!1p.gl){Q.ck="gZ";Q.bV="gG";Q.9V="8M"}Q.1u.1w={1x:"",x:1h,y:1h,2W:1h,2v:1h,3W:1h,9O:1h,$5a:"1t.4x",6H:Q.$1k,6w:Q.$([]),4z:17(aa){1a ab=aa;13.6w.2Z(ab)},2i:17(){1b 13.5L().56()},5L:17(){13.6w.3d(17(ab){3c{ab.5L()}3x(aa){}});1b 13},56:17(){13.6w.3d(17(ab){3c{ab.56()}3x(aa){}});1b 13},4q:17(){13.6H=Q.$1s;1b 13},7P:17(){1b{x:13.3C,y:13.3A}},5V:17(){1b{x:13.x,y:13.y}},cA:17(){1b 13.3W},8s:17(){1b 13.9O},7p:17(){1b 13.2v},dw:17(){1b 13.6w.1I>0?13.6w[0].cA():2G},6A:17(){1b(13.2r&&(13.2r==="3p"||13.2r===13.6D))||(/3p/i).3z(13.1x)},5n:17(){if(13.2r){1b(13.2r==="3p"||13.6D===13.2r)&&13.7L}1j{if(13 3Y 1n.7N){1b 13.4X.1I===1&&(13.6C.1I?13.6C[0].6g===13.4X[0].6g:1s)}}1b 1k},6Q:17(){if(13.2r){1b 13.7L&&(13.2r==="3p"||13.6D===13.2r)?13:1h}1j{if(13 3Y 1n.7N){1b 13.4X[0]}}1b 1h},8F:17(){if(13.2r){1b 13.7L&&(13.2r==="3p"||13.6D===13.2r)?13.4f:1h}1j{if(13 3Y 1n.7N){1b 13.4X[0].6g}}1b 1h}};Q.2e([Q.4g,Q.3H],{1C:17(ac,ae,af,ai){1a ah,aa,ad,ag,ab;if(Q.1V(ac)==="1S"){ab=ac.93(" ");if(ab.1I>1){ac=ab}}if(Q.1V(ac)==="4v"){Q.$(ac).3d(13.1C.2K(13,ae,af,ai));1b 13}ac=X[ac]||ac;if(!ac||!ae||Q.1V(ac)!=="1S"||Q.1V(ae)!=="17"){1b 13}if(ac==="aS"&&Q.1f.2p){ae.2g(13);1b 13}af=6j(af||50,10);if(!ae.$9S){ae.$9S=1q.4V(1q.6n()*Q.6e())}ah=Q.3H.1Q.2g(13,"9o",{});aa=ah[ac];if(!aa){ah[ac]=aa=Q.$([]);ad=13;if(Q.1u.1w[ac]){Q.1u.1w[ac].1L.67.2g(13,ai)}1j{aa.3w=17(aj){aj=Q.2e(aj||1n.e,{$5a:"1t"});Q.3H.34.2g(ad,ac,Q.$(aj))};13[Q.ck](Q.9V+ac,aa.3w,1k)}}ag={1x:ac,fn:ae,bT:af,dP:ae.$9S};aa.2Z(ag);aa.gm(17(ak,aj){1b ak.bT-aj.bT});1b 13},1O:17(ag){1a ae=Q.3H.1Q.2g(13,"9o",{});1a ac;1a aa;1a ab;1a ah;1a af;1a ad;af=2h.1I>1?2h[1]:-2M;if(Q.1V(ag)==="1S"){ad=ag.93(" ");if(ad.1I>1){ag=ad}}if(Q.1V(ag)==="4v"){Q.$(ag).3d(13.1O.2K(13,af));1b 13}ag=X[ag]||ag;if(!ag||Q.1V(ag)!=="1S"||!ae||!ae[ag]){1b 13}ac=ae[ag]||[];1U(ab=0;ab<ac.1I;ab++){aa=ac[ab];if(af===-2M||!!af&&af.$9S===aa.dP){ah=ac.8y(ab--,1)}}if(ac.1I===0){if(Q.1u.1w[ag]){Q.1u.1w[ag].1L.2T.2g(13)}1j{13[Q.bV](Q.9V+ag,ac.3w,1k)}4W ae[ag]}1b 13},34:17(ad,af){1a ac=Q.3H.1Q.2g(13,"9o",{});1a ab;1a aa;ad=X[ad]||ad;if(!ad||Q.1V(ad)!=="1S"||!ac||!ac[ad]){1b 13}3c{af=Q.2e(af||{},{1x:ad})}3x(ae){}if(af.2W===2G){af.2W=Q.6e()}ab=ac[ad]||[];1U(aa=0;aa<ab.1I&&!(af.6H&&af.6H());aa++){ab[aa].fn.2g(13,af)}},bR:17(ab,aa){1a ae=(ab!=="aS");1a ad=13;1a ac;ab=X[ab]||ab;if(!ae){Q.3H.34.2g(13,ab);1b 13}if(ad===1p&&1p.a9&&!ad.bq){ad=1p.4P}if(1p.a9){ac=1p.a9(ab);ac.5h(aa,1s,1s)}1j{ac=1p.gH();ac.9p=ab}if(1p.a9){ad.bq(ac)}1j{ad.gJ("8M"+aa,ac)}1b ac},cP:17(){1a ab=Q.3H.1Q.2g(13,"9o");if(!ab){1b 13}1U(1a aa in ab){Q.3H.1O.2g(13,aa)}Q.3H.2z.2g(13,"9o");1b 13}});(17(aa){if(1p.8E==="8H"){1b aa.1f.7X.2F(1)}if(aa.1f.3Z&&aa.1f.4J<gL){(17(){if(aa.$(["2j","8H"]).4u(1p.8E)){aa.1f.7X()}1j{2h.9v.2F(50)}}())}1j{if(aa.1f.5g&&aa.1f.2L<9&&1n===1H){(17(){if(aa.$3c(17(){aa.1f.4n().gM("1P");1b 1s})){aa.1f.7X()}1j{2h.9v.2F(50)}}())}1j{aa.3H.1C.2g(aa.$(1p),"gO",aa.1f.7X);aa.3H.1C.2g(aa.$(1n),"5F",aa.1f.7X)}}}(W));Q.3V=17(){1a ae=1h,ab=Q.$A(2h);if("4d"==Q.1V(ab[0])){ae=ab.7e()}1a aa=17(){1U(1a ah in 13){13[ah]=Q.3E(13[ah])}if(13.5t.$3S){13.$3S={};1a aj=13.5t.$3S;1U(1a ai in aj){1a ag=aj[ai];4B(Q.1V(ag)){1D"17":13.$3S[ai]=Q.3V.dl(13,ag);1J;1D"8Q":13.$3S[ai]=Q.3E(ag);1J;1D"4v":13.$3S[ai]=Q.3E(ag);1J}}}1a af=(13.3T)?13.3T.6X(13,2h):13;4W 13.c7;1b af};if(!aa.2t.3T){aa.2t.3T=Q.$F}if(ae){1a ad=17(){};ad.2t=ae.2t;aa.2t=1v ad;aa.$3S={};1U(1a ac in ae.2t){aa.$3S[ac]=ae.2t[ac]}}1j{aa.$3S=1h}aa.5t=Q.3V;aa.2t.5t=aa;Q.2e(aa.2t,ab[0]);Q.2e(aa,{$5a:"4d"});1b aa};W.3V.dl=17(aa,ab){1b 17(){1a ad=13.c7;1a ac=ab.6X(aa,2h);1b ac}};(17(ad){1a ac=ad.$;1a aa=5,ab=c1;ad.1u.1w.1W=1v ad.3V(ad.2e(ad.1u.1w,{1x:"1W",3T:17(ag,af){1a ae=af.5V();13.x=ae.x;13.y=ae.y;13.3C=af.3C;13.3A=af.3A;13.2W=af.2W;13.2v=af.7p();13.3W=ag;13.4z(af)}}));ad.1u.1w.1W.1L={1y:{8m:ab,2v:1},67:17(ae){13.2O("1t:1W:1y",ad.2e(ad.3E(ad.1u.1w.1W.1L.1y),ae||{}));13.1C("73",ad.1u.1w.1W.1L.3w,1);13.1C("6W",ad.1u.1w.1W.1L.3w,1);13.1C("2J",ad.1u.1w.1W.1L.c2,1);if(ad.1f.5g&&ad.1f.2L<9){13.1C("9P",ad.1u.1w.1W.1L.3w,1)}},2T:17(){13.1O("73",ad.1u.1w.1W.1L.3w);13.1O("6W",ad.1u.1w.1W.1L.3w);13.1O("2J",ad.1u.1w.1W.1L.c2);if(ad.1f.5g&&ad.1f.2L<9){13.1O("9P",ad.1u.1w.1W.1L.3w)}},c2:17(ae){ae.56()},3w:17(ah){1a ag,ae,af;ae=13.1Q("1t:1W:1y");if(ah.1x!="9P"&&ah.7p()!=ae.2v){1b}if(13.1Q("1t:1W:bf")){13.2z("1t:1W:bf");1b}if("73"==ah.1x){ag=1v ad.1u.1w.1W(13,ah);13.2O("1t:1W:a5",ag)}1j{if("6W"==ah.1x){ag=13.1Q("1t:1W:a5");if(!ag){1b}af=ah.5V();13.2z("1t:1W:a5");ag.4z(ah);if(ah.2W-ag.2W<=ae.8m&&1q.9y(1q.5x(af.x-ag.x,2)+1q.5x(af.y-ag.y,2))<=aa){13.34("1W",ag)}1p.34("6W",ah)}1j{if(ah.1x=="9P"){ag=1v ad.1u.1w.1W(13,ah);13.34("1W",ag)}}}}}})(W);(17(ab){1a aa=ab.$;ab.1u.1w.2Y=1v ab.3V(ab.2e(ab.1u.1w,{1x:"2Y",2c:"41",5y:1k,3T:17(af,ae,ad){1a ac=ae.5V();13.x=ac.x;13.y=ac.y;13.3C=ae.3C;13.3A=ae.3A;13.2W=ae.2W;13.2v=ae.7p();13.3W=af;13.4z(ae);13.2c=ad}}));ab.1u.1w.2Y.1L={67:17(){1a ad=ab.1u.1w.2Y.1L.gj.2K(13);1a ac=ab.1u.1w.2Y.1L.9U.2K(13);13.1C("73",ab.1u.1w.2Y.1L.b8,1);13.1C("6W",ab.1u.1w.2Y.1L.9U,1);1p.1C("72",ad,1);1p.1C("6W",ac,1);13.2O("1t:2Y:3g:1p:69",ad);13.2O("1t:2Y:3g:1p:8g",ac)},2T:17(){13.1O("73",ab.1u.1w.2Y.1L.b8);13.1O("6W",ab.1u.1w.2Y.1L.9U);aa(1p).1O("72",13.1Q("1t:2Y:3g:1p:69")||ab.$F);aa(1p).1O("6W",13.1Q("1t:2Y:3g:1p:8g")||ab.$F);13.2z("1t:2Y:3g:1p:69");13.2z("1t:2Y:3g:1p:8g")},b8:17(ad){1a ac;if(ad.7p()!==1){1b}ac=1v ab.1u.1w.2Y(13,ad,"41");13.2O("1t:2Y:41",ac)},9U:17(ad){1a ac;ac=13.1Q("1t:2Y:41");if(!ac){1b}if(ac.5y){ad.56()}ac=1v ab.1u.1w.2Y(13,ad,"aW");13.2z("1t:2Y:41");13.34("2Y",ac)},gj:17(ad){1a ac;ac=13.1Q("1t:2Y:41");if(!ac){1b}ad.56();if(!ac.5y){ac.5y=1s;13.34("2Y",ac)}ac=1v ab.1u.1w.2Y(13,ad,"g5");13.34("2Y",ac)}}})(W);(17(ab){1a aa=ab.$;ab.1u.1w.4o=1v ab.3V(ab.2e(ab.1u.1w,{1x:"4o",8h:1k,8j:1h,3T:17(ae,ad){1a ac=ad.5V();13.x=ac.x;13.y=ac.y;13.3C=ad.3C;13.3A=ad.3A;13.2W=ad.2W;13.2v=ad.7p();13.3W=ae;13.4z(ad)}}));ab.1u.1w.4o.1L={1y:{8m:7J},67:17(ac){13.2O("1t:4o:1y",ab.2e(ab.3E(ab.1u.1w.4o.1L.1y),ac||{}));13.1C("1W",ab.1u.1w.4o.1L.3w,1)},2T:17(){13.1O("1W",ab.1u.1w.4o.1L.3w)},3w:17(ae){1a ad,ac;ad=13.1Q("1t:4o:1t");ac=13.1Q("1t:4o:1y");if(!ad){ad=1v ab.1u.1w.4o(13,ae);ad.8j=4K(17(){ad.8h=1s;ae.6H=ab.$1k;13.34("1W",ae);13.2z("1t:4o:1t")}.1E(13),ac.8m+10);13.2O("1t:4o:1t",ad);ae.4q()}1j{3q(ad.8j);13.2z("1t:4o:1t");if(!ad.8h){ad.4z(ae);ae.4q().2i();13.34("4o",ad)}1j{}}}}})(W);(17(ad){1a ac=ad.$;1a aa=10;1a ab=7J;ad.1u.1w.29=1v ad.3V(ad.2e(ad.1u.1w,{1x:"29",id:1h,3T:17(af,ae){1a ag=ae.6Q();13.id=ag.4f||ag.6g;13.x=ag.3M;13.y=ag.3L;13.3M=ag.3M;13.3L=ag.3L;13.3C=ag.3C;13.3A=ag.3A;13.2W=ae.2W;13.2v=0;13.3W=af;13.4z(ae)}}));ad.1u.1w.29.1L={67:17(ae){13.1C(["5D","6c"],ad.1u.1w.29.1L.5U,1);13.1C(["4h","4j"],ad.1u.1w.29.1L.5f,1);13.1C("2J",ad.1u.1w.29.1L.8f,1)},2T:17(){13.1O(["5D","6c"],ad.1u.1w.29.1L.5U);13.1O(["4h","4j"],ad.1u.1w.29.1L.5f);13.1O("2J",ad.1u.1w.29.1L.8f)},8f:17(ae){ae.56()},5U:17(ae){if(!ae.5n()){13.2z("1t:29:1t");1b}13.2O("1t:29:1t",1v ad.1u.1w.29(13,ae));13.2O("1t:1W:bf",1s)},5f:17(ah){1a af=ad.6e();1a ag=13.1Q("1t:29:1t");1a ae=13.1Q("1t:29:1y");if(!ag||!ah.5n()){1b}13.2z("1t:29:1t");if(ag.id===ah.8F()&&ah.2W-ag.2W<=ab&&1q.9y(1q.5x(ah.6Q().3M-ag.x,2)+1q.5x(ah.6Q().3L-ag.y,2))<=aa){13.2z("1t:1W:a5");ah.2i();ag.4z(ah);13.34("29",ag)}}}}(W));Q.1u.1w.3G=1v Q.3V(Q.2e(Q.1u.1w,{1x:"3G",8h:1k,8j:1h,3T:17(ab,aa){13.x=aa.x;13.y=aa.y;13.3C=aa.3C;13.3A=aa.3A;13.2W=aa.2W;13.2v=0;13.3W=ab;13.4z(aa)}}));Q.1u.1w.3G.1L={1y:{8m:c1},67:17(aa){13.2O("1t:3G:1y",Q.2e(Q.3E(Q.1u.1w.3G.1L.1y),aa||{}));13.1C("29",Q.1u.1w.3G.1L.3w,1)},2T:17(){13.1O("29",Q.1u.1w.3G.1L.3w)},3w:17(ac){1a ab,aa;ab=13.1Q("1t:3G:1t");aa=13.1Q("1t:3G:1y");if(!ab){ab=1v Q.1u.1w.3G(13,ac);ab.8j=4K(17(){ab.8h=1s;ac.6H=Q.$1k;13.34("29",ac)}.1E(13),aa.8m+10);13.2O("1t:3G:1t",ab);ac.4q()}1j{3q(ab.8j);13.2z("1t:3G:1t");if(!ab.8h){ab.4z(ac);ac.4q().2i();13.34("3G",ab)}1j{}}}};(17(ac){1a ab=ac.$;1a aa=10;ac.1u.1w.2y=1v ac.3V(ac.2e(ac.1u.1w,{1x:"2y",2c:"41",id:1h,5y:1k,3T:17(af,ae,ad){1a ag=ae.6Q();13.id=ag.4f||ag.6g;13.3C=ag.3C;13.3A=ag.3A;13.3M=ag.3M;13.3L=ag.3L;13.x=ag.3M;13.y=ag.3L;13.2W=ae.2W;13.2v=0;13.3W=af;13.4z(ae);13.2c=ad}}));ac.1u.1w.2y.1L={67:17(){1a ae=ac.1u.1w.2y.1L.6V.1E(13);1a ad=ac.1u.1w.2y.1L.5f.1E(13);13.1C(["5D","6c"],ac.1u.1w.2y.1L.5U,1);13.1C(["4h","4j"],ac.1u.1w.2y.1L.5f,1);13.1C(["6F","4D"],ac.1u.1w.2y.1L.6V,1);13.2O("1t:2y:3g:1p:69",ae);13.2O("1t:2y:3g:1p:8g",ad);ab(1p).1C("4D",ae,1);ab(1p).1C("4j",ad,1)},2T:17(){13.1O(["5D","6c"],ac.1u.1w.2y.1L.5U);13.1O(["4h","4j"],ac.1u.1w.2y.1L.5f);13.1O(["6F","4D"],ac.1u.1w.2y.1L.6V);ab(1p).1O("4D",13.1Q("1t:2y:3g:1p:69")||ac.$F,1);ab(1p).1O("4j",13.1Q("1t:2y:3g:1p:8g")||ac.$F,1);13.2z("1t:2y:3g:1p:69");13.2z("1t:2y:3g:1p:8g")},5U:17(ae){1a ad;if(!ae.5n()){1b}ad=1v ac.1u.1w.2y(13,ae,"41");13.2O("1t:2y:41",ad)},5f:17(ae){1a ad;ad=13.1Q("1t:2y:41");if(!ad||!ad.5y||ad.id!==ae.8F()){1b}ad=1v ac.1u.1w.2y(13,ae,"aW");13.2z("1t:2y:41");13.34("2y",ad)},6V:17(ae){1a ad;ad=13.1Q("1t:2y:41");if(!ad||!ae.5n()){1b}if(ad.id!==ae.8F()){13.2z("1t:2y:41");1b}if(!ad.5y&&1q.9y(1q.5x(ae.6Q().3M-ad.x,2)+1q.5x(ae.6Q().3L-ad.y,2))>aa){ad.5y=1s;13.34("2y",ad)}if(!ad.5y){1b}ad=1v ac.1u.1w.2y(13,ae,"g5");13.34("2y",ad)}}}(W));(17(ad){1a ah=ad.$;1a ae=1h;17 aa(aq,ap){1a ao=ap.x-aq.x;1a ar=ap.y-aq.y;1b 1q.9y(ao*ao+ar*ar)}17 aj(av,aw){1a au=4Z.2t.8n.2g(av);1a at=1q.3e(au[1].3M-au[0].3M);1a aq=1q.3e(au[1].3L-au[0].3L);1a ar=1q.2f(au[1].3M,au[0].3M)+at/2;1a ap=1q.2f(au[1].3L,au[0].3L)+aq/2;1a ao=0;aw.6O=[au[0],au[1]];ao=1q.5x(aa({x:au[0].3M,y:au[0].3L},{x:au[1].3M,y:au[1].3L}),2);aw.6z={x:ar,y:ap};aw.x=aw.6z.x;aw.y=aw.6z.y;1b ao}17 am(ao){1b ao/ae}17 ab(aq,ap){1a ao;if(aq.6C&&aq.4X){if(aq.6C){ao=aq.6C}1j{ao=aq.4X}ao=4Z.2t.8n.2g(ao)}1j{ao=[];if(ap){ap.9D(17(ar){ao.2Z(ar)})}}1b ao}17 ac(ar,aq,ap){1a ao=1k;if(ar.4f&&ar.2r==="3p"&&(!ap||aq.3o(ar.4f))){aq.76(ar.4f,ar);ao=1s}1b ao}17 ai(ap,ao){if(ap.4f&&ap.2r==="3p"&&ao&&ao.3o(ap.4f)){ao["4W"](ap.4f)}}17 al(ap){1a ao;if(ap.4f&&ap.2r==="3p"){ao=ap.4f}1j{ao=ap.6g}1b ao}17 ag(ar,ap){1a aq;1a at;1a ao=1k;1U(aq=0;aq<ar.1I;aq++){if(ap.1I===2){1J}1j{at=al(ar[aq]);if(!ap.4u(at)){ap.2Z(at);ao=1s}}}1b ao}17 ak(ap){1a ao=ah([]);ap.9D(17(aq){ao.2Z(al(aq))});1b ao}17 an(at,ap){1a aq;1a ar;1a ao=1k;if(ap){ar=ak(at);1U(aq=0;aq<ap.1I;aq++){if(!ar.4u(ap[aq])){ap.8y(aq,1);ao=1s;1J}}}1b ao}17 af(ar,ap){1a aq;1a ao=ah([]);1U(aq=0;aq<ar.1I;aq++){if(ap.4u(al(ar[aq]))){ao.2Z(ar[aq]);if(ao.1I===2){1J}}}1b ao}ad.1u.1w.1N=1v ad.3V(ad.2e(ad.1u.1w,{1x:"1N",2c:"6b",3T:17(aq,ap,ao,ar){13.3W=aq;13.2c=ao;13.x=ar.x;13.y=ar.y;13.2W=ap.2W;13.3Q=ar.3Q;13.5s=ar.5s;13.1l=ar.1l;13.2c=ao;13.6z=ar.6z;13.6O=ar.6O;13.4z(ap)}}));ad.1u.1w.1N.1L={62:{x:0,y:0,5s:0,3Q:1,1l:0,cR:0,gx:1,ay:1k,5y:1k,6O:[],6z:{x:0,y:0}},67:17(aq){if(!ae){ae=(17(){1a ar=ah(1n).1F();ar.1e=1q.2f(ar.1e,ar.1g);ar.1g=ar.1e;1b 1q.5x(aa({x:0,y:0},{x:ar.1e,y:ar.1g}),2)})()}1a ap=ad.1u.1w.1N.1L.6V.1E(13);1a ao=ad.1u.1w.1N.1L.5f.1E(13);13.1C(["2J","29"],ad.1u.1w.1N.1L.8f,1);13.1C(["5D","6c"],ad.1u.1w.1N.1L.5U,1);13.1C(["4h","4j"],ad.1u.1w.1N.1L.5f,1);13.1C(["6F","4D"],ad.1u.1w.1N.1L.6V,1);13.2O("1t:1N:3g:6F",ap);13.2O("1t:1N:3g:4h",ao);ad.8i.1C("4D",ap,1);ad.8i.1C("4j",ao,1)},2T:17(){13.1O(["2J","29"],ad.1u.1w.1N.1L.8f);13.1O(["5D","6c"],ad.1u.1w.1N.1L.5U);13.1O(["4h","4j"],ad.1u.1w.1N.1L.5f);13.1O(["6F","4D"],ad.1u.1w.1N.1L.6V);ad.8i.1O("4D",13.1Q("1t:1N:3g:6F"));ad.8i.1O("4j",13.1Q("1t:1N:3g:4h"));13.2z("1t:1N:3g:6F");13.2z("1t:1N:3g:4h");13.2z("1t:1N:6b");13.2z("1t:1N:62");13.2z("1t:1N:7U");1a ao=13.1Q("1t:1N:7y");if(ao){ao.en()}13.2z("1t:1N:7y")},8f:17(ao){ao.2i()},9H:17(ap,aq){1a ao=aq.5s;if(ap.1I>1){aq.5s=aj(ap,aq);if(!aq.cR){aq.cR=aq.5s}if(ao>aq.5s){aq.1l=-1}1j{if(ao<aq.5s){aq.1l=1}1j{aq.1l=0}}aq.3Q=am(aq.5s)}1j{aq.6O=4Z.2t.8n.2g(ap,0,2)}},6V:17(aq){1a ap;1a ao=13.1Q("1t:1N:7y");1a at=13.1Q("1t:1N:62")||ad.2e({},ad.1u.1w.1N.1L.62);1a ar=13.1Q("1t:1N:7U");if(at.ay){if(aq.4f&&!ac(aq,ao,1s)){1b}aq.2i();ad.1u.1w.1N.1L.9H(af(ab(aq,ao),ar),at);ap=1v ad.1u.1w.1N(13,aq,"eI",at);13.34("1N",ap)}},5U:17(ar){1a ap;1a au;1a aq;1a ao=13.1Q("1t:1N:7y");1a at=13.1Q("1t:1N:7U");if(ar.2r==="dZ"){1b}if(!at){at=ah([]);13.2O("1t:1N:7U",at)}if(!at.1I){ah(ar.3W).1C(["4h","4j"],13.1Q("1t:1N:3g:4h"),1)}if(!ao){ao=1v gw();13.2O("1t:1N:7y",ao)}ac(ar,ao);aq=ab(ar,ao);ag(aq,at);if(aq.1I===2){ap=13.1Q("1t:1N:6b");au=13.1Q("1t:1N:62")||ad.2e({},ad.1u.1w.1N.1L.62);ad.1u.1w.1N.1L.9H(af(aq,at),au);if(!ap){ap=1v ad.1u.1w.1N(13,ar,"6b",au);13.2O("1t:1N:6b",ap);13.2O("1t:1N:62",au);ae=au.5s;13.34("1N",ap);au.ay=1s}}},5f:17(au){1a at;1a ar;1a aw;1a ap;1a aq=13.1Q("1t:1N:7y");1a av;1a ao;if(au.2r==="dZ"||au.4f&&(!aq||!aq.3o(au.4f))){1b}ar=13.1Q("1t:1N:6b");aw=13.1Q("1t:1N:62");av=13.1Q("1t:1N:7U");at=ab(au,aq);ai(au,aq);ao=an(at,av);if(!ar||!aw||!aw.ay||!ao||!av){1b}if(ao){ag(at,av)}ap="eE";if(at.1I>1){ap="eG"}1j{au.3W.1O(["4h","4j"],13.1Q("1t:1N:3g:4h"));if(aq){aq.en()}13.2z("1t:1N:6b");13.2z("1t:1N:62");13.2z("1t:1N:7y");13.2z("1t:1N:7U")}ad.1u.1w.1N.1L.9H(af(at,av),aw);ar=1v ad.1u.1w.1N(13,au,ap,aw);13.34("1N",ar)}}}(W));(17(af){1a ad=af.$;af.1u.1w.4T=1v af.3V(af.2e(af.1u.1w,{1x:"4T",3T:17(al,ak,an,ah,ag,am,ai){1a aj=ak.5V();13.x=aj.x;13.y=aj.y;13.2W=ak.2W;13.3W=al;13.kg=an||0;13.cl=ah||0;13.8z=ag||0;13.lf=am||0;13.lg=ai||0;13.bk=ak.bk||0;13.c9=1k;13.4z(ak)}}));1a ae,ab;17 aa(){ae=1h}17 ac(ag,ah){1b(ag>50)||(1===ah&&!("9K"==af.1f.4w&&ag<1))||(0===ag%12)||(0==ag%4.lj)}af.1u.1w.4T.1L={9p:"lk"in 1p||af.1f.2L>8?"ll":"lm",67:17(){13.1C(af.1u.1w.4T.1L.9p,af.1u.1w.4T.1L.3w,1)},2T:17(){13.1O(af.1u.1w.4T.1L.9p,af.1u.1w.4T.1L.3w,1)},3w:17(al){1a am=0,aj=0,ah=0,ag=0,ak,ai;if(al.fa){ah=al.fa*-1}if(al.f8!==2G){ah=al.f8}if(al.fQ!==2G){ah=al.fQ}if(al.f2!==2G){aj=al.f2*-1}if(al.8z){ah=-1*al.8z}if(al.cl){aj=al.cl}if(0===ah&&0===aj){1b}am=0===ah?aj:ah;ag=1q.26(1q.3e(ah),1q.3e(aj));if(!ae||ag<ae){ae=ag}ak=am>0?"4V":"4k";am=1q[ak](am/ae);aj=1q[ak](aj/ae);ah=1q[ak](ah/ae);if(ab){3q(ab)}ab=4K(aa,7J);ai=1v af.1u.1w.4T(13,al,am,aj,ah,0,ae);ai.c9=ac(ae,al.bk||0);13.34("4T",ai)}}})(W);Q.9K=Q.$(1n);Q.8i=Q.$(1p);1b W})();(17(M){if(!M){6a"7t 6i 7u"}1a L=M.$;1a K=1n.ln||1n.lo||1h;B.bm=1v M.3V({24:1h,2p:1k,1y:{a6:M.$F,6x:M.$F,bx:M.$F,6U:M.$F,7K:M.$F,ga:M.$F,9R:1k,eN:1s},1A:1h,8v:1h,bv:0,7I:{a6:17(N){if(N.3W&&(7J===N.3W.a1||gb===N.3W.a1)&&N.le){13.1y.a6.1E(1h,(N.2j-(13.1y.eN?13.bv:0))/N.lp).2F(1);13.bv=N.2j}},6x:17(N){if(N){L(N).2i()}13.8D();if(13.2p){1b}13.2p=1s;13.8o();!13.1y.9R&&13.1y.a6.1E(1h,1).2F(1);13.1y.6x.1E(1h,13).2F(1);13.1y.7K.1E(1h,13).2F(1)},bx:17(N){if(N){L(N).2i()}13.8D();13.2p=1k;13.8o();13.1y.bx.1E(1h,13).2F(1);13.1y.7K.1E(1h,13).2F(1)},6U:17(N){if(N){L(N).2i()}13.8D();13.2p=1k;13.8o();13.1y.6U.1E(1h,13).2F(1);13.1y.7K.1E(1h,13).2F(1)}},9Q:17(){L(["5F","br","g2"]).3d(17(N){13.24.1C(N,13.7I["8M"+N].2K(13).fY(1))},13)},8D:17(){if(13.8v){3c{3q(13.8v)}3x(N){}13.8v=1h}L(["5F","br","g2"]).3d(17(O){13.24.1O(O)},13)},8o:17(){13.1F();if(13.24.1Q("1v")){1a N=13.24.4c;13.24.2T().2z("1v").1z({2n:"lr",1H:"2B"});N.5k()}},fv:17(O){1a P=1v a4(),N;L(["br","ls"]).3d(17(Q){P["8M"+Q]=L(17(R){13.7I["8M"+Q].2g(13,R)}).1E(13)},13);P.6U=L(17(){13.1y.ga.1E(1h,13).2F(1);13.1y.9R=1k;13.9Q();13.24.1Z=O}).1E(13);P.6x=L(17(){if(7J!==P.a1&&gb!==P.a1){13.7I.6U.2g(13);1b}N=P.lu;13.9Q();if(K&&!M.1f.5g&&!("7z"===M.1f.4w&&M.1f.4J<lv)){13.24.3k("1Z",K.lw(N))}1j{13.24.1Z=O}}).1E(13);P.8I("lx",O);P.ly="lz";P.lA()},3T:17(O,N){13.1y=M.2e(13.1y,N);13.24=L(O)||M.$1v("24",{},{"26-1e":"38","26-1g":"38"}).2b(M.$1v("36").1B("2R-75-24").1z({2n:"5S",1H:-ez,1e:10,1g:10,7F:"3r"}).2b(1p.3n)).2O("1v",1s);if(M.1f.2N.fV&&13.1y.9R&&"1S"==M.1V(O)){13.fv(O);1b}1a P=17(){if(13.fN()){13.7I.6x.2g(13)}1j{13.7I.6U.2g(13)}P=1h}.1E(13);13.9Q();if("1S"==M.1V(O)){13.24.1Z=O}1j{if(M.1f.5g&&5==M.1f.4J&&M.1f.2L<9){13.24.fF=17(){if(/2j|8H/.3z(13.24.8E)){13.24.fF=1h;P&&P()}}.1E(13)}13.24.1Z=O.2q("1Z")}13.24&&13.24.8H&&P&&(13.8v=P.2F(2M))},lq:17(){13.8D();13.8o();13.2p=1k;1b 13},fN:17(){1a N=13.24;1b(N.9r)?(N.9r>0):(N.8E)?("8H"==N.8E):N.1e>0},1F:17(){1b 13.1A||(13.1A={1e:13.24.9r||13.24.1e,1g:13.24.dv||13.24.1g})}})})(B);(17(L){if(!L){6a"7t 6i 7u"}if(L.6k){1b}1a K=L.$;L.6k=1v L.3V({3T:17(N,M){1a O;13.el=L.$(N);13.1y=L.2e(13.1y,M);13.65=1k;13.7Y=13.bC;O=L.6k.8R[13.1y.2a]||13.1y.2a;if("17"===L.1V(O)){13.7Y=O}1j{13.5Y=13.8q(O)||13.8q("6v")}if("1S"==L.1V(13.1y.7Q)){13.1y.7Q="lc"===13.1y.7Q?6h:6j(13.1y.7Q)||1}},1y:{dc:60,5J:b3,2a:"6v",7Q:1,5m:"l1",dg:L.$F,81:L.$F,cD:L.$F,dO:L.$F,a7:1k,lb:1k},4O:1h,5Y:1h,7Y:1h,kS:17(M){13.1y.2a=M;M=L.6k.8R[13.1y.2a]||13.1y.2a;if("17"===L.1V(M)){13.7Y=M}1j{13.7Y=13.bC;13.5Y=13.8q(M)||13.8q("6v")}},4G:17(O){1a M=/\\%$/,N;13.4O=O||{};13.bK=0;13.2c=0;13.kT=0;13.ax={};13.7B="7B"===13.1y.5m||"7B-4S"===13.1y.5m;13.80="80"===13.1y.5m||"80-4S"===13.1y.5m;1U(N in 13.4O){M.3z(13.4O[N][0])&&(13.ax[N]=1s);if("4S"===13.1y.5m||"7B-4S"===13.1y.5m||"80-4S"===13.1y.5m){13.4O[N].4S()}}13.cj=L.6e();13.d3=13.cj+13.1y.5J;13.1y.dg.2g();if(0===13.1y.5J){13.7q(1);13.1y.81.2g()}1j{13.a8=13.da.1E(13);if(!13.1y.a7&&L.1f.2N.5q){13.65=L.1f.5q.2g(1n,13.a8)}1j{13.65=13.a8.dq(1q.5A(cg/13.1y.dc))}}1b 13},bG:17(){if(13.65){if(!13.1y.a7&&L.1f.2N.5q&&L.1f.9Y){L.1f.9Y.2g(1n,13.65)}1j{fC(13.65)}13.65=1k}},2i:17(M){M=L.3F(M)?M:1k;13.bG();if(M){13.7q(1);13.1y.81.2F(10)}1b 13},bS:17(O,N,M){O=2A(O);N=2A(N);1b(N-O)*M+O},da:17(){1a N=L.6e(),M=(N-13.cj)/13.1y.5J,O=1q.4V(M);if(N>=13.d3&&O>=13.1y.7Q){13.bG();13.7q(1);13.1y.81.2F(10);1b 13}if(13.7B&&13.bK<O){1U(1a P in 13.4O){13.4O[P].4S()}}13.bK=O;if(!13.1y.a7&&L.1f.2N.5q){13.65=L.1f.5q.2g(1n,13.a8)}13.7q((13.80?O:0)+13.7Y(M%1))},7q:17(M){1a N={},P=M;1U(1a O in 13.4O){if("2u"===O){N[O]=1q.5A(13.bS(13.4O[O][0],13.4O[O][1],M)*2M)/2M}1j{N[O]=13.bS(13.4O[O][0],13.4O[O][1],M);13.ax[O]&&(N[O]+="%")}}13.1y.cD(N,13.el);13.76(N);13.1y.dO(N,13.el)},76:17(M){1b 13.el.1z(M)},8q:17(M){1a N,O=1h;if("1S"!==L.1V(M)){1b 1h}4B(M){1D"9X":O=K([0,0,1,1]);1J;1D"6v":O=K([0.25,0.1,0.25,1]);1J;1D"6v-in":O=K([0.42,0,1,1]);1J;1D"6v-dF":O=K([0,0,0.58,1]);1J;1D"6v-in-dF":O=K([0.42,0,0.58,1]);1J;1D"dU":O=K([0.47,0,0.kV,0.kW]);1J;1D"dS":O=K([0.39,0.kX,0.kY,1]);1J;1D"kZ":O=K([0.lC,0.bn,0.55,0.95]);1J;1D"dM":O=K([0.55,0.l0,0.68,0.53]);1J;1D"dK":O=K([0.25,0.46,0.45,0.94]);1J;1D"l2":O=K([0.l3,0.em,0.l4,0.l5]);1J;1D"dJ":O=K([0.55,0.l6,0.l7,0.19]);1J;1D"dI":O=K([0.l8,0.61,0.cX,1]);1J;1D"l9":O=K([0.la,0.c6,0.cX,1]);1J;1D"lB":O=K([0.fH,0.em,0.fL,0.22]);1J;1D"ld":O=K([0.dH,0.84,0.44,1]);1J;1D"lD":O=K([0.77,0,0.aO,1]);1J;1D"m1":O=K([0.m0,0.bn,0.m3,0.lZ]);1J;1D"lO":O=K([0.23,1,0.32,1]);1J;1D"lF":O=K([0.86,0,0.lG,1]);1J;1D"dQ":O=K([0.95,0.bn,0.lI,0.lJ]);1J;1D"dN":O=K([0.19,1,0.22,1]);1J;1D"lK":O=K([1,0,0,1]);1J;1D"lL":O=K([0.6,0.lM,0.98,0.lY]);1J;1D"lN":O=K([0.lP,0.82,0.dH,1]);1J;1D"lQ":O=K([0.lR,0.lS,0.15,0.86]);1J;1D"dG":O=K([0.6,-0.28,0.d6,0.c6]);1J;1D"dE":O=K([0.aO,0.c8,0.32,1.lU]);1J;1D"lV":O=K([0.68,-0.55,0.lW,1.55]);1J;1T:M=M.4y(/\\s/g,"");if(M.3N(/^6f-5W\\((?:-?[0-9\\.]{0,}[0-9]{1,},){3}(?:-?[0-9\\.]{0,}[0-9]{1,})\\)$/)){O=M.4y(/^6f-5W\\s*\\(|\\)$/g,"").93(",");1U(N=O.1I-1;N>=0;N--){O[N]=2A(O[N])}}}1b K(O)},bC:17(Y){1a M=0,X=0,U=0,Z=0,W=0,S=0,T=13.1y.5J;17 R(aa){1b((M*aa+X)*aa+U)*aa}17 Q(aa){1b((Z*aa+W)*aa+S)*aa}17 O(aa){1b(3*M*aa+2*X)*aa+U}17 V(aa){1b 1/(7J*aa)}17 N(aa,ab){1b Q(P(aa,ab))}17 P(ah,ai){1a ag,af,ae,ab,aa,ad;17 ac(aj){if(aj>=0){1b aj}1j{1b 0-aj}}1U(ae=ah,ad=0;ad<8;ad++){ab=R(ae)-ah;if(ac(ab)<ai){1b ae}aa=O(ae);if(ac(aa)<0.cO){1J}ae=ae-ab/aa}ag=0;af=1;ae=ah;if(ae<ag){1b ag}if(ae>af){1b af}5R(ag<af){ab=R(ae);if(ac(ab-ah)<ai){1b ae}if(ah>ab){ag=ae}1j{af=ae}ae=(af-ag)*0.5+ag}1b ae}U=3*13.5Y[0];X=3*(13.5Y[2]-13.5Y[0])-U;M=1-U-X;S=3*13.5Y[1];W=3*(13.5Y[3]-13.5Y[1])-S;Z=1-S-W;1b N(Y,V(T))}});L.6k.8R={9X:"9X",kQ:"dU",k2:"dS",kO:"dQ",jF:"dN",jG:"dM",jH:"dK",jI:"dJ",jJ:"dI",jK:"dG",jL:"dE",dC:17(N,M){M=M||[];1b 1q.5x(2,10*--N)*1q.fR(20*N*1q.fP*(M[0]||1)/3)},jM:17(N,M){1b 1-L.6k.8R.dC(1-N,M)},eg:17(O){1U(1a N=0,M=1;1;N+=M,M/=2){if(O>=(7-4*N)/11){1b M*M-1q.5x((11-6*N-11*O)/4,2)}}},jN:17(M){1b 1-L.6k.8R.eg(1-M)},38:17(M){1b 0}}})(B);(17(L){if(!L){6a"7t 6i 7u"}if(L.9W){1b}1a K=L.$;L.9W=1v L.3V(L.6k,{3T:17(M,N){13.bN=M;13.1y=L.2e(13.1y,N);13.65=1k;13.$3S.3T()},4G:17(Q){1a M=/\\%$/,P,O,N=Q.1I;13.bE=Q;13.a2=1v 4Z(N);1U(O=0;O<N;O++){13.a2[O]={};1U(P in Q[O]){M.3z(Q[O][P][0])&&(13.a2[O][P]=1s);if("4S"===13.1y.5m||"7B-4S"===13.1y.5m||"80-4S"===13.1y.5m){13.bE[O][P].4S()}}}13.$3S.4G({});1b 13},7q:17(M){1U(1a N=0;N<13.bN.1I;N++){13.el=L.$(13.bN[N]);13.4O=13.bE[N];13.ax=13.a2[N];13.$3S.7q(M)}}})})(B);(17(L){if(!L){6a"7t 6i 7u";1b}if(L.bL){1b}1a K=L.$;L.bL=17(N,O){1a M=13.87=L.$1v("36",1h,{2n:"5S","z-8w":ef}).1B("jE");L.$(N).1C("7M",17(){M.2b(1p.3n)});L.$(N).1C("9c",17(){M.2T()});L.$(N).1C("72",17(T){1a V=20,S=L.$(T).5V(),R=M.1F(),Q=L.$(1n).1F(),U=L.$(1n).79();17 P(Y,W,X){1b(X<(Y-W)/2)?X:((X>(Y+W)/2)?(X-W):(Y-W)/2)}M.1z({1P:U.x+P(Q.1e,R.1e+2*V,S.x-U.x)+V,1H:U.y+P(Q.1g,R.1g+2*V,S.y-U.y)+V})});13.aJ(O)};L.bL.2t.aJ=17(M){13.87.4C&&13.87.bX(13.87.4C);13.87.3b(1p.9C(M))}})(B);(17(L){if(!L){6a"7t 6i 7u";1b}if(L.jO){1b}1a K=L.$;L.9L=17(P,O,N,M){13.as=1h;13.5v=L.$1v("cw",1h,{2n:"5S","z-8w":ef,5b:"3r",2u:0.8}).1B(M||"").2b(N||1p.3n);13.ea(P);13.5z(O)};L.9L.2t.5z=17(M){13.5v.5z();13.as=13.49.1E(13).2F(L.bI(M,jQ))};L.9L.2t.49=17(M){3q(13.as);13.as=1h;if(13.5v&&!13.bH){13.bH=1v B.6k(13.5v,{5J:L.bI(M,bZ),81:17(){13.5v.5k();4W 13.5v;13.bH=1h}.1E(13)}).4G({2u:[13.5v.3B("2u"),0]})}};L.9L.2t.ea=17(M){13.5v.4C&&13.87.bX(13.5v.4C);13.5v.3b(1p.9C(M))}})(B);(17(L){if(!L){6a"7t 6i 7u"}if(L.8e){1b}1a O=L.$,K=1h,S={"3i":1,4v:2,6Z:3,"17":4,1S:2M},M={"3i":17(V,U,T){if("3i"!=L.1V(U)){if(T||"1S"!=L.1V(U)){1b 1k}1j{if(!/^(1s|1k)$/.3z(U)){1b 1k}1j{U=U.ev()}}}if(V.4l("2H")&&!O(V["2H"]).4u(U)){1b 1k}K=U;1b 1s},1S:17(V,U,T){if("1S"!==L.1V(U)){1b 1k}1j{if(V.4l("2H")&&!O(V["2H"]).4u(U)){1b 1k}1j{K=""+U;1b 1s}}},6Z:17(W,V,U){1a T=1k,Y=/%$/,X=(L.1V(V)=="1S"&&Y.3z(V));if(U&&!"6Z"==9n V){1b 1k}V=2A(V);if(9M(V)){1b 1k}if(9M(W.8d)){W.8d=e5.jR}if(9M(W.ca)){W.ca=e5.kP}if(W.4l("2H")&&!O(W["2H"]).4u(V)){1b 1k}if(W.8d>V||V>W.ca){1b 1k}K=X?(V+"%"):V;1b 1s},4v:17(W,U,T){if("1S"===L.1V(U)){3c{U=1n.jS.jT(U)}3x(V){1b 1k}}if(L.1V(U)==="4v"){K=U;1b 1s}1j{1b 1k}},"17":17(V,U,T){if(L.1V(U)==="17"){K=U;1b 1s}1j{1b 1k}}},N=17(Y,X,U){1a W;W=Y.4l("3h")?Y.3h:[Y];if("4v"!=L.1V(W)){1b 1k}1U(1a V=0,T=W.1I-1;V<=T;V++){if(M[W[V].1x](W[V],X,U)){1b 1s}}1b 1k},Q=17(Y){1a W,V,X,T,U;if(Y.4l("3h")){T=Y.3h.1I;1U(W=0;W<T;W++){1U(V=W+1;V<T;V++){if(S[Y.3h[W]["1x"]]>S[Y.3h[V].1x]){U=Y.3h[W];Y.3h[W]=Y.3h[V];Y.3h[V]=U}}}}1b Y},R=17(W){1a V;V=W.4l("3h")?W.3h:[W];if("4v"!=L.1V(V)){1b 1k}1U(1a U=V.1I-1;U>=0;U--){if(!V[U].1x||!S.4l(V[U].1x)){1b 1k}if(L.3F(V[U]["2H"])){if("4v"!==L.1V(V[U]["2H"])){1b 1k}1U(1a T=V[U]["2H"].1I-1;T>=0;T--){if(!M[V[U].1x]({1x:V[U].1x},V[U]["2H"][T],1s)){1b 1k}}}}if(W.4l("1T")&&!N(W,W["1T"],1s)){1b 1k}1b 1s},P=17(T){13.4Q={};13.1y={};13.d7(T)};L.2e(P.2t,{d7:17(V){1a U,T,W;1U(U in V){if(!V.4l(U)){92}T=(U+"").5e().5Q();if(!13.4Q.4l(T)){13.4Q[T]=Q(V[U]);if(!R(13.4Q[T])){6a"jU jV jW jX \'"+U+"\' jY in "+V}13.1y[T]=2G}}},76:17(U,T){U=(U+"").5e().5Q();if(L.1V(T)=="1S"){T=T.5e()}if(13.4Q.4l(U)){K=T;if(N(13.4Q[U],T)){13.1y[U]=K}K=1h}},f9:17(T){T=(T+"").5e().5Q();if(13.4Q.4l(T)){1b L.3F(13.1y[T])?13.1y[T]:13.4Q[T]["1T"]}},9j:17(U){1U(1a T in U){13.76(T,U[T])}},f5:17(){1a U=L.2e({},13.1y);1U(1a T in U){if(2G===U[T]&&2G!==13.4Q[T]["1T"]){U[T]=13.4Q[T]["1T"]}}1b U},a0:17(T){O(T.93(";")).3d(O(17(U){U=U.93(":");13.76(U.7e().5e(),U.7c(":"))}).1E(13))},9t:17(T){T=(T+"").5e().5Q();1b 13.4Q.4l(T)},jZ:17(T){T=(T+"").5e().5Q();1b 13.9t(T)&&L.3F(13.1y[T])},2T:17(T){T=(T+"").5e().5Q();if(13.9t(T)){4W 13.1y[T];4W 13.4Q[T]}}});L.8e=P})(B);(17(O){if(!O){6a"7t 6i 7u";1b}1a N=O.$;if(O.aT){1b}1a M="cf://cd.cc.cb/jP/8b",L="cf://cd.cc.cb/jC/jq";1a K=17(P){13.7x={};13.88=N(P);13.6d=N(1p.9z(M,"8b"));13.6d.3k("1e",13.88.9r||13.88.1e);13.6d.3k("1g",13.88.dv||13.88.1g);13.1i=N(1p.9z(M,"1i"));13.1i.jB(L,"7k",13.88.2q("1Z"));13.1i.3k("1e","2M%");13.1i.3k("1g","2M%");13.1i.2b(13.6d)};K.2t.7l=17(){1b 13.6d};K.2t.5G=17(P){if(1q.5A(P)<1){1b}if(!13.7x.5G){13.7x.5G=N(1p.9z(M,"3a"));13.7x.5G.3k("id","dp");13.7x.5G.bw(N(1p.9z(M,"jg")).8K({"in":"jh",dt:P}));13.7x.5G.2b(13.6d);13.1i.3k("3a","1Y(#dp)")}1j{13.7x.5G.4C.3k("dt",P)}1b 13};O.aT=K}(B));1a E=(17(M){1a L=M.$;1a K=17(O,N){13.3t={9b:"2R",3K:"8N",2n:"2P",1A:{ji:"2D",1e:"2B",1g:"2B"},jj:["1g","1e"]};13.3S=O;13.59=1h;13.7v=1h;13.2V=1h;13.2w={};13.d5=[];13.6u=1h;13.c5=1h;13.63=1h;13.3t=M.2e(13.3t,N);13.3v=13.3t.9b+"-b7";13.9d=13.3t.9b+"-7a";13.cY()};K.2t={cY:17(){13.59=M.$1v("36").1B(13.3v).1B(13.3v+"-"+13.3t.3K).1z({5b:"3r"});13.7v=M.$1v("36").1B(13.3v+"-7v").2b(13.59);13.59.2b(13.3S);L(["4t","4p"]).3d(17(N){13.2w[N]=M.$1v("2v").1B(13.3v+"-2v").1B(13.3v+"-2v-"+N).2b(13.59).1C("1W 29",(17(P,O){L(P).6w[0].2i().4q();L(P).5L();13.6q(O)}).2K(13,N))}.1E(13));13.2w.4t.1B(13.3v+"-2v-43");13.2V=M.$1v("jk").1C("1W 29",17(N){N.2i()})},fT:17(O){1a N=M.$1v("li").1B(13.9d).3b(O).2b(13.2V);1v M.bm(O,{7K:13.9J.1E(13)});13.d5.2Z(N);1b N},eh:17(O){1a N=13.6u||13.2V.aQ(13.9d+"-7f")[0];if(N){L(N).1R(13.9d+"-7f")}13.6u=L(O);if(!13.6u){1b}13.6u.1B(13.9d+"-7f");13.6q(13.6u)},bY:17(){if(13.7v!==13.2V.4c){L(13.2V).2b(13.7v);13.eZ();L(1n).1C("7o",13.63=13.9J.1E(13));13.bY.1E(13).2F(1);1b}1a N=13.3S.1F();if(N.1g>0&&N.1g>N.1e){13.9h("5l")}1j{13.9h("8N")}13.9J();13.59.1z({5b:""})},2i:17(){if(13.63){L(1n).1O("7o",13.63)}13.59.5k()},6q:17(aa,Q){1a S={x:0,y:0},ad="5l"==13.3t.3K?"1H":"1P",V="5l"==13.3t.3K?"1g":"1e",R="5l"==13.3t.3K?"y":"x",Z=13.2V.4c.1F()[V],W=13.2V.4c.9e(),P=13.2V.1F()[V],Y,N,ac,T,O,X,U,ab=[];if(13.c5){13.c5.2i()}1j{13.2V.1z("2a",M.1f.7V+6L.83(32)+"aY")}if(2G===Q){Q=b3}Y=13.2V.9e();if("1S"==M.1V(aa)){S[R]=("4p"==aa)?1q.26(Y[ad]-W[ad]-Z,Z-P):1q.2f(Y[ad]-W[ad]+Z,0)}1j{if("6t"==M.1V(aa)){N=aa.1F();ac=aa.9e();S[R]=1q.2f(0,1q.26(Z-P,Y[ad]+Z/2-ac[ad]-N[V]/2))}1j{1b}}if(M.1f.7b&&"8a"==M.1f.4w||M.1f.2L&&M.1f.2L<10){if("1S"==M.1V(aa)&&S[R]==Y[ad]-W[ad]){Y[ad]+=0===Y[ad]-W[ad]?30:-30}S["9l-"+ad]=[((P<=Z)?0:(Y[ad]-W[ad])),S[R]];4W S.x;4W S.y;if(!13.c3){13.c3=1v M.9W([13.2V],{5J:bZ})}ab.2Z(S);13.c3.4G(ab);U=S["9l-"+ad][1]}1j{13.2V.1z({2a:M.1f.7V+6L.83(32)+Q+"6r 6v",2o:"4F("+S.x+"2D, "+S.y+"2D, 0)"});U=S[R]}if(U>=0){13.2w.4t.1B(13.3v+"-2v-43");13.2w.4t.43=1s}1j{13.2w.4t.1R(13.3v+"-2v-43");13.2w.4t.43=1k}if(U<=Z-P){13.2w.4p.1B(13.3v+"-2v-43");13.2w.4p.43=1s}1j{13.2w.4p.1R(13.3v+"-2v-43");13.2w.4p.43=1k}U=1h},eZ:17(){1a P,O,Q,X,W,Z,R,V,U,Y,ae,ab,ac,aa={x:0,y:0},N,T,S=c1,ad=17(ah){1a ag,af=0;1U(ag=1.5;ag<=90;ag+=1.5){af+=(ah*1q.fR(ag/1q.fP/2))}(X<0)&&(af*=(-1));1b af};W=L(17(af){aa={x:0,y:0};N="5l"==13.3t.3K?"1H":"1P";T="5l"==13.3t.3K?"1g":"1e";P="5l"==13.3t.3K?"y":"x";ab=13.2V.4c.1F()[T];ae=13.2V.1F()[T];Q=ab-ae;if(Q>=0){1b}if(af.2c=="41"){if(2G===ac){ac=0}13.2V.3X("2a",M.1f.7V+6L.83(32)+"e1");Z=af[P];U=af.y;V=af.x;Y=1k}1j{if("aW"==af.2c){if(Y){1b}R=ad(1q.3e(X));ac+=R;(ac<=Q)&&(ac=Q);(ac>=0)&&(ac=0);aa[P]=ac;13.2V.3X("2a",M.1f.7V+6L.83(32)+S+"6r  6f-5W(.0, .0, .0, 1)");13.2V.3X("2o","4F("+aa.x+"2D, "+aa.y+"2D, 6G)");X=0}1j{if(Y){1b}if("8N"==13.3t.3K&&1q.3e(af.x-V)>1q.3e(af.y-U)||"5l"==13.3t.3K&&1q.3e(af.x-V)<1q.3e(af.y-U)){af.2i();X=af[P]-Z;ac+=X;aa[P]=ac;13.2V.3X("2o","4F("+aa.x+"2D, "+aa.y+"2D, 6G)");if(ac>=0){13.2w.4t.1B(13.3v+"-2v-43")}1j{13.2w.4t.1R(13.3v+"-2v-43")}if(ac<=Q){13.2w.4p.1B(13.3v+"-2v-43")}1j{13.2w.4p.1R(13.3v+"-2v-43")}}1j{Y=1s}}Z=af[P]}}).1E(13);13.2V.1C("2y",W)},9J:17(){1a Q,P,N,O=13.3S.1F();if(O.1g>0&&O.1g>O.1e){13.9h("5l")}1j{13.9h("8N")}Q="5l"==13.3t.3K?"1g":"1e";P=13.2V.1F()[Q];N=13.59.1F()[Q];if(P<=N){13.59.1B("6o-2w");13.2V.3X("2a","").1F();13.2V.3X("2o","4F(0,0,0)");13.2w.4t.1B(13.3v+"-2v-43");13.2w.4p.1R(13.3v+"-2v-43")}1j{13.59.1R("6o-2w")}if(13.6u){13.6q(13.6u,0)}},9h:17(N){if("5l"!==N&&"8N"!==N||N==13.3t.3K){1b}13.59.1R(13.3v+"-"+13.3t.3K);13.3t.3K=N;13.59.1B(13.3v+"-"+13.3t.3K);13.2V.3X("2a","38").1F();13.2V.3X("2o","").3X("9l","")}};1b K})(B);1a v=q.$;if(9n 74.be!=="17"){74.be=17(N){if(N==1h){6a 1v jm("jn jo 2G ba 1h 6Y 8Q")}N=74(N);1U(1a K=1;K<2h.1I;K++){1a M=2h[K];if(M!=1h){1U(1a L in M){if(74.2t.4l.2g(M,L)){N[L]=M[L]}}}}1b N}}if(!q.1f.aN){q.1f.aN=q.9F("2o").9E()}1a b={4A:{1x:"1S","2H":["2J","8l"],"1T":"8l"},4m:{3h:[{1x:"1S","2H":["1l","2C","4H","4a"],"1T":"1l"},{1x:"3i","2H":[1k]}],"1T":"1l"},fM:{3h:[{1x:"1S","2H":["2B"]},{1x:"6Z",8d:1}],"1T":"2B"},ew:{3h:[{1x:"1S","2H":["2B"]},{1x:"6Z",8d:1}],"1T":"2B"},cC:{1x:"1S","1T":"2Q"},jf:{1x:"6Z",8d:0,"1T":15},8A:{3h:[{1x:"1S","2H":["2P","1H","4a"],"1T":"4a"},{1x:"3i","2H":[1k]}],"1T":"4a"},2k:{3h:[{1x:"1S","2H":["1n","gg","4a"]},{1x:"3i","2H":[1k]}],"1T":"1n"},57:{3h:[{1x:"1S","2H":["1l","2C","4a"],"1T":"1l"},{1x:"3i","2H":[1k]}],"1T":"1l"},3l:{1x:"1S","2H":["2J","2X"],"1T":"2J"},3U:{1x:"3i","1T":1s},df:{1x:"3i","1T":1s},5o:{1x:"3i","1T":1s},3m:{3h:[{1x:"1S","2H":["c4","2X","4a"]},{1x:"3i","2H":[1k]}],"1T":"c4"},fS:{1x:"3i","1T":1s},dY:{1x:"3i","1T":1s},e9:{1x:"3i","1T":1k},7O:{1x:"3i","1T":1k},b5:{1x:"3i","1T":1s},fh:{1x:"3i","1T":1k},e2:{1x:"3i","1T":1s},bd:{1x:"1S","2H":["2J","8l"],"1T":"2J"},5P:{1x:"1S"},aD:{1x:"3i","1T":1k},cx:{1x:"1S","1T":"jp 6Y 1l"},aF:{1x:"1S","1T":"gf 6Y 1l"},jr:{1x:"1S","1T":"js"},jt:{1x:"1S","1T":"ju"},jv:{1x:"1S","1T":"jw"},9A:{1x:"1S","1T":"gf 6Y 2k"}};1a D={4m:{3h:[{1x:"1S","2H":["1l","2C","4a"],"1T":"1l"},{1x:"3i","2H":[1k]}],"1T":"1l"},3l:{1x:"1S","2H":["2J","2X"],"1T":"2J"},9A:{1x:"1S","1T":"jx ba 1N 6Y 2k"},cx:{1x:"1S","1T":"jy 6Y 1l"},aF:{1x:"1S","1T":"jz 29 ba 1N 6Y 1l"}};1a a="b2";1a j="1m";1a k=20;1a u=["cp","de","bt","cV","ek","dW"];1a w=b3;1a x=1.1;1a c=0.5;1a e;1a F={};1a t=v([]);1a r;1a f=1n.jA||1;1a p;1a l=1s;1a d=q.1f.2N.9q?"4F(":"az(";1a C=q.1f.2N.9q?",0)":")";1a h=1h;1a G;1a H=(17(){1a L,O,N,M,K;1b K})();1a y=17(){1b"k0$je"+"p".89()+" jD$"+"fJ.3.5".4y("v","")+" k1$"+"c".89()+((1n.cm$bz&&q.1V(1n.cm$bz)==="1S")?" kr$"+1n.cm$bz.5d():"")};17 i(M){1a L,K;L="";1U(K=0;K<M.1I;K++){L+=6L.83(14^M.fX(K))}1b L}17 n(M){1a L=[],K=1h;(M&&(K=v(M)))&&(L=t.3a(17(N){1b N.3O===K}));1b L.1I?L[0]:1h}17 s(M){1a L=v(1n).1F();1a K=v(1n).79();M=M||0;1b{1P:M,2Q:L.1e-M,1H:M,2P:L.1g-M,x:K.x,y:K.y}}17 m(K){1b 74.be({},K,{1x:K.1x,3M:K.3M,3L:K.3L,eW:K.eW,eV:K.eV,3C:K.3C,3A:K.3A,fl:1s})}17 I(){1a M=q.$A(2h);1a L=M.7e();1a K=F[L];if(K){1U(1a N=0;N<K.1I;N++){K[N].6X(1h,M)}}}17 g(){1a O=2h[0],K,N,L=[];3c{do{N=O.9x;if(/^[A-bu-z]*$/.3z(N)){if(K=O.2q("id")){if(/^[A-bu-z][-A-bu-kt-ku]*/.3z(K)){N+="#"+K}}L.2Z(N)}O=O.4c}5R(O&&O!==1p.4P);L=L.4S();q.5O(L.7c(" ")+"> .1m-5K > 24",{2a:"38",2o:"38"},"1m-9u-5c",1s);q.5O(L.7c(" ")+":6i(.1m-6o-eK-1e-5c)> .1m-5K:6i(.1m-6o-eK-1e-5c) > 24",{1e:"2M% !2l;"},"1m-9u-5c",1s)}3x(M){}}17 J(){1a L=1h,M=1h,K=17(){1n.kv(1p.3n.8P,1p.3n.8X);1n.bq(1v 1u("7o"))};M=eF(17(){1a P=1n.3K===90||1n.3K===-90;1a O=1n.4M;1a N=(P?eC.kw:eC.kx)*0.85;if((L===1h||L===1k)&&((P&&O<N)||(!P&&O<N))){L=1s;K()}1j{if((L===1h||L===1s)&&((P&&O>N)||(!P&&O>N))){L=1k;K()}}},ky);1b M}17 A(){q.5O(".2R-3r-7v, .2R-75-24",{6P:"eL !2l","2f-1g":"0 !2l","2f-1e":"0 !2l","26-1g":"38 !2l","26-1e":"38 !2l",1e:"eX !2l",1g:"eX !2l",2n:"5S !2l",1H:"-cK !2l",1P:"0 !2l",7F:"3r !2l","-3Z-2o":"38 !2l",2o:"38 !2l","-3Z-2a":"38 !2l",2a:"38 !2l"},"8V-8S-5c");q.5O(".2R-75-24 24, .2R-75-24 bp",{6P:"ct-eL !2l",40:"0 !2l",7C:"0 !2l","2f-1g":"0 !2l","2f-1e":"0 !2l","26-1g":"38 !2l","26-1e":"38 !2l","-3Z-2o":"38 !2l",2o:"38 !2l","-3Z-2a":"38 !2l",2a:"38 !2l"},"8V-8S-5c");q.5O(".2R-75-24 bp, .2R-75-24 bp > 24",{1e:"2B !2l",1g:"2B !2l"},"8V-8S-5c");if(q.1f.8G){q.5O(".2I-2R .1m-2k .1m-2k-bg",{6P:"38 !2l"},"8V-8S-5c")}if(q.1f.8G&&(q.1f.4E!=="6l"||q.1f.7r===44)){q.5O(".2I-2R .1m-1l-1n.1m-2C, .2I-2R .1m-1l-1n.1m-2C:kz",{"40-kA":"0 !2l"},"8V-8S-5c")}}1a o=17(N,O,L,M,K){13.1M={1Z:1h,1Y:1h,6E:1,1d:1h,2c:0,1A:{1e:0,1g:0},2j:1k};13.1l={1Z:1h,1Y:1h,6E:1,1d:1h,2c:0,1A:{1e:0,1g:0},2j:1k};if(q.1V(N)==="8Q"){13.1M=N}1j{if(q.1V(N)==="1S"){13.1M.1Y=q.6K(N)}}if(q.1V(O)==="8Q"){13.1l=O}1j{if(q.1V(O)==="1S"){13.1l.1Y=q.6K(O)}}13.3I="";13.3y=L;13.1y=M;13.4I=K;13.7A=1h;13.3R=1h;13.1d=1h};o.2t={aG:17(M,L,K){1a N=M.8O("24")[0];if(K){13.1M.1d=N||q.$1v("24").2b(M)}if(f>1){13.1M.1Y=M.2q("3j-1i-2x");if(13.1M.1Y){13.1M.6E=2}13.1l.1Y=M.2q("3j-1l-1i-2x");if(13.1l.1Y){13.1l.6E=2}}13.1M.1Z=M.2q("3j-1i")||M.2q("ks")||(N?N.7G||N.2q("1Z"):1h);if(13.1M.1Z){13.1M.1Z=q.6K(13.1M.1Z)}13.1M.1Y=13.1M.1Y||13.1M.1Z;if(13.1M.1Y){13.1M.1Y=q.6K(13.1M.1Y)}13.1l.1Z=M.2q("3j-1l-1i")||M.2q("7k");if(13.1l.1Z){13.1l.1Z=q.6K(13.1l.1Z)}13.1l.1Y=13.1l.1Y||13.1l.1Z;if(13.1l.1Y){13.1l.1Y=q.6K(13.1l.1Y)}13.3y=M.2q("3j-3y")||M.2q("7s")||L;13.3R=M.2q("3j-3R");13.4I=M;if(N){13.3I=N.2q("3I")||""}1b 13},bl:17(K){1a L=1h;if(2h.1I>1&&q.1V(2h[1])==="17"){L=2h[1]}if(13[K].2c!==0){if(13[K].2j){13.6x(L)}1b}if(13[K].1Y&&13[K].1d&&!13[K].1d.2q("1Z")&&!13[K].1d.2q("bB")){13[K].1d.3k("1Z",13[K].1Y)}13[K].2c=1;1v q.bm(13[K].1d||13[K].1Y,{7K:v(17(M){13[K].2j=1s;13[K].2c=M.2p?2:-1;if(M.2p){if(13[K].1A.1e===0&&13[K].1A.1g===0){13[K].1A=M.1F()}if(!13[K].1d){13[K].1d=v(M.24);13[K].1d.2q("2m");13[K].1d.5i("2m");13[K].1d.3I=13.3I;13[K].1A.1e/=13[K].6E;13[K].1A.1g/=13[K].6E}1j{13[K].1d.1z({5T:13[K].1A.1e,71:13[K].1A.1g});if(13[K].1d.7G&&13[K].1d.7G!==13[K].1d.1Z){13[K].1Y=13[K].1d.7G}1j{if(q.6K(13[K].1d.2q("1Z")||"")!==13[K].1Y){13[K].1d.3k("1Z",13[K].1Y)}}}}13.6x(L)}).1E(13)})},8u:17(){13.bl("1M",2h[0])},cz:17(){13.bl("1l",2h[0])},5F:17(){13.7A=1h;if(2h.1I>0&&q.1V(2h[0])==="17"){13.7A=2h[0]}13.8u();13.cz()},6x:17(K){if(K){K.2g(1h,13)}if(13.7A&&13.1M.2j&&13.1l.2j){13.7A.2g(1h,13);13.7A=1h;1b}},2j:17(){1b(13.1M.2j&&13.1l.2j)},2p:17(){1b(13.1M.2c===2&&13.1l.2c===2)},6B:17(L){1a K=L==="1M"?"1l":"1M";if(!13[L].2j||(13[L].2j&&13[L].2c===2)){1b 13[L].1Y}1j{if(!13[K].2j||(13[K].2j&&13[K].2c===2)){1b 13[K].1Y}}1b 1h},7l:17(L){1a K=L==="1M"?"1l":"1M";if(!13[L].2j||(13[L].2j&&13[L].2c===2)){1b 13[L].1d}1j{if(!13[K].2j||(13[K].2j&&13[K].2c===2)){1b 13[K].1d}}1b 1h},1F:17(L){1a K=L==="1M"?"1l":"1M";if(!13[L].2j||(13[L].2j&&13[L].2c===2)){1b 13[L].1A}1j{if(!13[K].2j||(13[K].2j&&13[K].2c===2)){1b 13[K].1A}}1b{1e:0,1g:0}},66:17(L,K){13[L].1A=K},bD:17(L){1a K=L==="1M"?"1l":"1M";if(!13[L].2j||(13[L].2j&&13[L].2c===2)){1b 13[L].6E}1j{if(!13[K].2j||(13[K].2j&&13[K].2c===2)){1b 13[K].6E}}1b 1},7j:17(K){13.1d=13.7l(K)}};1a z=17(L,K){13.1y=1v q.8e(b);13.1o=v(17(){if(2h.1I>1){1b 13.76(2h[0],2h[1])}1b 13.f9(2h[0])}).1E(13.1y);13.f6=1v q.8e(D);13.3D=[];13.1i=1h;13.7g=1h;13.3O=v(L).1C("41 kC 2J",17(M){M.2i()});13.id=1h;13.1d=1h;13.8C=1h;13.48=1h;13.8t=1h;13.7d=1h;13.7W={1e:0,1g:0};13.1A={1e:0,1g:0};13.1K={1e:0,1g:0};13.3u={1e:0,1g:0};13.21={1H:0,1P:0,2P:0,2Q:0};13.2p=1k;13.1G=1k;13.64=1h;13.bi=1h;13.63=v(17(){if(13.1G){if(G){13.3f.1z({1g:1n.4M,1H:1q.3e(G.6N().1H)})}13.1i.1d.1z({"26-1g":1q.2f(13.1i.1F("1l").1g,13.7m())});13.1i.1d.1z({"26-1e":1q.2f(13.1i.1F("1l").1e,13.7T())})}13.8k(2h[0])}).1E(13);13.cI=v(17(M){3q(13.bi);13.bi=v(13.63).2F(10,M.1x==="6q")}).2K(13);13.cB=v(17(M){if(!M.2c&&13.1G){13.52()}if(M.2c&&M.2c.aB===13.id&&!13.1G){13.2k()}}).2K(13);if(y){r.3b(q.$1v("36",{},{6P:"38",5b:"3r"}).3b(1p.9C(y)));y=2G}13.1r=1h;13.1c=1h;13.3m=1h;13.cs=1h;13.6R=0;13.91=1s;13.6T=1h;13.5j=1h;13.7a=1h;13.3f=1h;13.4e=1h;13.3U=1h;13.5M=1h;13.6M=1h;13.5C=1h;13.7Z=1h;13.5w=1h;13.4L=1h;13.4U=[];13.2w={};13.9G=0;13.cn=1h;13.4G(K)};z.2t={dz:17(K){13.1y.9j(1n[j+"8e"]||{});13.1y.a0(13.3O.2q("3j-1y")||"");if(!q.1f.9N){13.1o("aD",1k)}if(q.1f.2I||13.1o("aD")){13.1y.9j(13.f6.f5());13.1y.9j(1n[j+"kE"]||{});13.1y.a0(13.3O.2q("3j-2I-1y")||"")}if(q.1V(K)==="1S"){13.1y.a0(K||"")}1j{13.1y.9j(K||{})}if(13.1o("5P")){13.1o("5P",13.1o("5P").4y(","," "))}if(13.1o("8A")===1k){13.1o("8A","4a")}if(13.1o("3m")===1k){13.1o("3m","4a")}4B(13.1o("3m")){1D"4a":13.6R=0;1J;1D"2X":13.6R=6h;1J;1D"c4":1T:13.6R=2;1J}if(13.1o("4m")==="4a"){13.1o("4m",1k)}if(13.1o("2k")==="4a"){13.1o("2k",1k)}if(13.1o("57")==="4a"){13.1o("57",1k)}if(q.1f.2I&&13.1o("4m")==="1l"&&13.1o("cC")==="2E"){if(13.1o("2k")){13.1o("4m",1k)}1j{13.1o("4A","2J")}}},4G:17(N){1a L;1a K=13;1a M;if(13.9G<1){13.dz(N);if(l&&!13.1o("b5")){1b}13.48=13.3O.cS("24");13.8t=13.48?13.48.2q("1Z"):1h;13.7d=v(13.3O).2q("7s");v(13.3O).5i("7s");if(13.48&&13.48.4c.9x==="kF"){13.8t=1h;1a R=q.$1v("36").1B("2R-75-24").2b(1p.3n);1a P=13.48.4c.bW(1s);P.2q("2m");P.5i("2m");1a O=P.cS("24");O.2q("2m");O.5i("2m");v(O).1C("5F",17(){K.1A=v(O).1F();R.5k();1a S=K.48.bW(1k);v(S).1z({5T:K.1A.1e,71:K.1A.1g}).3k("1Z",K.48.7G||K.48.1Z);K.48=K.3O.7R(S,K.48.4c);K.4G()});R.3b(P);++13.9G;1b}}M=1v o().aG(13.3O,13.7d,1s);M.66("1M",13.1A);if(!M.1M.1Y){if(++13.9G<=w){13.cn=4K(17(){K.4G()},2M)}1b}13.7g=M;13.1i=13.7g;g(13.3O);13.id=13.3O.2q("id")||"1m-"+1q.4V(1q.6n()*q.6e());13.3O.3k("id",13.id);13.1d=q.$1v("5K").1B("1m-5K");13.1d.fg(13.1i.1M.1d).1B(13.1o("5P"));if(13.1o("fh")!==1s){13.1d.1C("kG",17(S){S.2i();1b 1k})}13.1d.1B("1m-"+13.1o("4A")+"-1l");if(!13.1o("2k")){13.1d.1B("1m-6o-2k")}13.1r={1d:q.$1v("36",{"4d":"1m-1r"},{1H:0}).2b(13.1d),1i:q.$1v("24",{1Z:"3j:1i/eH;eM,eO/eP="},{2n:"5S",1H:0,1P:0}),1e:0,1g:0,33:{x:0,y:0},4b:{x:0,y:0},1A:{1e:0,1g:0},40:{x:0,y:0},dx:0,dy:0,5N:1k,49:17(){if(q.1f.2N.2o){13.1d.1z({2o:"az(-cK, -cK)"})}1j{13.1d.1z({1H:-ez})}}};13.1r.49();13.1r.1d.3b(13.1r.1i);13.1c={1d:q.$1v("36",{"4d":"1m-1l-1n"},{1H:-eU}).1B(13.1o("5P")).2b(r),1i:q.$1v("24",{1Z:"3j:1i/eH;eM,eO/eP="},{2n:"5S"}),cq:0,1e:0,1g:0,5H:0,4M:0,1A:{1e:"2B",7h:"2D",1g:"2B",7w:"2D"},1X:13.1o("4m"),2n:13.1o("cC"),7H:13.1o("4A"),4x:1k,2s:1k,2U:1k,4Y:1k,6S:v(17(){13.1c.4Y=2h[0]!==1k;13.1d[13.1c.4Y?"1R":"1B"]("1m-6o-1l")}).1E(13),49:v(17(){1a S=v(13.1d).1Q("cr");13.1c.1d.1O("2S");13.1c.1d.1z({1H:-eU}).2b(r);13.1c.1d.1R("1m-8Y 1m-p-"+(13.1c.1X==="1l"?13.1c.2n:13.1c.1X));if(!13.1G&&S){S.2T()}13.1c.1i.2q("2m");13.1c.1i.5i("2m")}).1E(13),b0:v(17(S){13.1d[S===1k?"1B":"1R"]("1m-6o-1l");13.1d[S==="2C"?"1B":"1R"]("1m-2C-1l");13.1c.1d[S==="2C"?"1B":"1R"]("1m-2C");13.1c.1d[S==="4H"?"1B":"1R"]("1m-4H");if(S!=="1l"){13.1d.1R("1m-2E-1l");13.1c.1d.1R("1m-2E")}13.1c.1X=S;if(S===1k){13.1c.6S(1k)}}).1E(13)};13.1c.1d.3b(13.1c.1i);13.1c.b0(13.1o("4m"));13.1c.1i.5i("1e");13.1c.1i.5i("1g");if(9n(H)!=="2G"){1a Q=1q.4V(1q.6n()*q.6e());v(13.1d).2O("cr",q.$1v(((1q.4V(1q.6n()*bF)+1)%2)?"cw":"36").8K({id:"8r"+Q}).1z({6P:"ct",7F:"3r",5b:"5u",fx:H[1],kH:H[2],fZ:H[3],kI:"kJ-kK",2n:"5S",1H:8,1P:8,9l:"2B",1e:"2B",kL:"2Q",g9:"kM",gd:fB}).5Z(i(H[0])));if(v(v(13.1d).1Q("cr")).8O("a")[0]){v(v(v(13.1d).1Q("cr")).8O("a")[0]).1C("29 1W",17(S){S.5L();1n.8I(13.7k)}).8K({id:"cu"+Q})}q.5O("#"+13.id+" > 5K.1m-5K > #"+("8r"+Q)+",#"+13.id+" > 5K.1m-5K > #"+("8r"+Q)+" > #"+("cu"+Q)+",co 3n .1m-2k > #"+("8r"+Q)+",co 3n .1m-2k > #"+("8r"+Q)+" > #"+("cu"+Q),{6P:"ct !2l;",5b:"5u !2l;",fx:H[1]+" !2l;","kN-1A":H[2]+"2D !2l;","z-8w":"fB !2l;"},"1m-9u-5c",1s)}if((L=(""+13.1o("fM")).3N(/^([0-9]+)?(2D|%)?$/))){13.1c.1A.7h=L[2]||"2D";13.1c.1A.1e=(2A(L[1])||"2B")}if((L=(""+13.1o("ew")).3N(/^([0-9]+)?(2D|%)?$/))){13.1c.1A.7w=L[2]||"2D";13.1c.1A.1g=(2A(L[1])||"2B")}if(13.1c.1X==="2C"){13.1d.1B("1m-2C-1l");13.1c.1d.1B("1m-2C");if(13.1c.1A.1e==="2B"){13.1c.1A.7h="%";13.1c.1A.1e=70}if(13.1c.1A.1g==="2B"){13.1c.1A.7w="%"}}1j{if(13.1o("1l-2n").3N(/^#/)){if(13.1c.4x=v(13.1o("1l-2n").4y(/^#/,""))){if(v(13.1c.4x).1F().1g>50){if(13.1c.1A.1e==="2B"){13.1c.1A.7h="%";13.1c.1A.1e=2M}if(13.1c.1A.1g==="2B"){13.1c.1A.7w="%";13.1c.1A.1g=2M}}}1j{13.1o("1l-2n","2Q")}}if(13.1c.1X==="4H"){if(13.1c.1A.1e==="2B"){13.1c.1A.7h="2D"}if(13.1c.1A.1g==="2B"){13.1c.1A.7w="2D"}}if(13.1c.1X==="1l"){if(13.1c.1A.1e==="2B"||13.1o("1l-2n")==="2E"){13.1c.1A.7h="%";13.1c.1A.1e=2M}if(13.1c.1A.1g==="2B"||13.1o("1l-2n")==="2E"){13.1c.1A.7w="%";13.1c.1A.1g=2M}}if(13.1o("1l-2n")==="2E"){13.1d.1B("1m-2E-1l")}}13.1c.2n=13.1c.4x?"4x":13.1o("1l-2n");13.1r.40.x=2A(13.1r.1d.3B("40-1P-1e")||"0");13.1r.40.y=2A(13.1r.1d.3B("40-1H-1e")||"0");13.1i.8u(17(){if(13.1i.1M.2c!==2){1b}13.1i.7j("1M");13.1A=13.1i.1d.1F();13.e3();13.2p=1s;if(13.1o("7O")===1s){I("cp",13.id);if(q.1f.2I){13.8k()}1j{13.5I()}}}.1E(13));if(13.1o("7O")!==1s||13.1o("4A")==="2X"){13.1i.5F(v(17(S){13.7i(S,1s)}).1E(13));13.5j=v(13.7E).1E(13).2F(9a)}13.dk();13.eS()},2i:17(){3q(13.cn);13.dA();if(13.1c){13.1c.1d.5k()}if(13.4L){13.4L.2i();13.4L=1h}if(13.3f){13.3f.5k()}if(13.1G){v(q.1f.4n()).1z({7F:""})}v(13.3D).3d(17(K){v(K.4I).1R("1m-7a-7f").1R(13.1o("5P")||"1m-$kD-5c-4d-6Y-2T$")},13);if(13.48){13.3O.3b(13.48);if(13.8t){13.48.3k("1Z",13.8t)}}if(13.7d){13.3O.3k("7s",13.7d)}if(13.1d){13.1d.5k()}},7i:17(L,M){1a K=13.1i;if(L.1l.2c!==2){13.1i=L;13.2p=1s;13.1c.6S(1k);1b}13.1i=L;13.1i.7j(13.1G?"1l":"1M");13.1c.1i.1Z=13.1i.6B("1l");13.1c.1i.3I=13.1i.3I;13.1c.1d.1R("1m-4H");13.1c.1i.2q("2m");13.1c.1i.5i("2m");13.1c.1d.1F();4K(v(17(){1a O=13.1c.1i.1F();1a N;13.3u=13.1i.1F("1l");if(O.1e*O.1g>1&&O.1e*O.1g<13.3u.1e*13.3u.1g){13.3u=O}13.1K=q.3E(13.3u);if(13.1c.1X==="4H"){13.1c.1d.1B("1m-4H")}13.ei();13.1r.1i.1Z=13.1i.1d.7G||13.1i.1d.1Z;13.1r.1i.3I=13.1i.3I;13.1c.6S(13.1c.1X&&!(13.1G&&13.1c.1X==="4H"));13.2p=1s;13.64=1h;13.63();13.1d.1B("1m-2p");13.cQ();if(K!==13.1i){I("de",13.id,K.4I,13.1i.4I);if(13.9T){N=13.9T;13.9T=1h;13.4N(N.1i,N.cW)}}1j{if(!!M){I("cp",13.id)}}if(13.5h){13.1d.34(13.5h.1x,13.5h)}1j{if(13.1G&&13.1o("3l")==="2X"){13.4R()}1j{if(!!M){13.5I()}}}}).1E(13),kq)},dk:17(){1a L=13.id;1a K;1a M;M=1v dn("1l\\\\-id(\\\\s+)?:(\\\\s+)?"+L+"($|;)");if(q.1f.2N.by){K=q.$A(1p.bA(\'[3j-1l-id="\'+13.id+\'"]\'));K=v(K).5X(q.$A(1p.bA(\'[cv*="1l-id"]\')).3a(17(N){1b M.3z(N.2q("cv")||"")}))}1j{K=q.$A(1p.aP("A")).3a(17(N){1b L===N.2q("3j-1l-id")||M.3z(N.2q("cv")||"")})}v(K).3d(17(O){1a N;1a P;v(O).1C("2J",17(Q){Q.56()});N=1v o().aG(O,13.7d);if((13.1i.1l.1Z.3o(N.1l.1Y)||13.1i.1l.1Y.3o(N.1l.1Y))&&(13.1i.1M.1Z.3o(N.1M.1Y)||13.1i.1M.1Y.3o(N.1M.1Y))){v(N.4I).1B("1m-7a-7f");N=13.1i;N.4I=O}if(!N.3R&&13.1i.3R){N.3R=13.1i.3R}P=v(17(){13.4N(N)}).1E(13);v(O).1C("73",17(Q){if("ds"in Q){Q.ds()}},5);v(O).1C("29 "+(13.1o("bd")==="8l"?"7M 9c":"1W"),v(17(R,Q){if(13.6p){3q(13.6p)}13.6p=1k;if(R.1x==="7M"){13.6p=v(P).2F(Q)}1j{if(R.1x==="29"||R.1x==="1W"){P()}}}).2K(13,60)).1B(13.1o("5P")).1B("1m-7a");if(13.1o("7O")!==1s){N.8u();N.cz()}13.3D.2Z(N)},13)},4N:17(K,M){if(!13.2p){13.9T={1i:K,cW:M};1b}if(!K||K===13.1i){1b 1k}13.4i(1h,1s);13.2p=1k;13.1d.1R("1m-2p");13.5j=v(13.7E).1E(13).2F(9a);1a L=v(17(T){1a N,U,S,P,O,R,Q=(q.1f.2L<10)?"1F":"6N";13.cQ();T.7j("1M");if(!T.1d){13.2p=1s;13.1d.1B("1m-2p");1b}13.aI(T);N=13.1i.1d[Q]();if(13.1G){T.7j("1l");S=q.$1v("36").1B("1m-2k-bg");if(q.1f.2N.9i||q.1f.2L<10){S.3b(q.$1v("24",{bB:T.6B("1l")+" "+T.bD("1l")+"x",1Z:T.6B("1l"),3I:T.3I}).1z({2u:0}))}1j{S.3b(1v q.aT(T.1d).5G(k).7l().1z({2u:0}))}v(S).1z({"z-8w":-99}).2b(13.3f)}if(13.1G&&13.1c.1X==="1l"&&13.1o("3l")==="2X"){v(T.1d).1z({2u:0}).2b(13.1d);U=N;O=[T.1d,13.1i.1d];R=[{2u:[0,1]},{2u:[1,0]}];v(T.1d).1z({"26-1e":1q.2f(T.1F("1l").1e,13.7T()),"26-1g":1q.2f(T.1F("1l").1g,13.7m())})}1j{13.1d.1z({1g:13.1d[Q]().1g});13.1i.1d.1z({2n:"5S",1H:0,1P:0,2P:0,2Q:0,1e:"2M%",1g:"2M%","26-1e":"","26-1g":""});v(T.1d).1z({"26-1e":1q.2f(T.1F(13.1G?"1l":"1M").1e,13.1G?13.7T():6h),"26-1g":1q.2f(T.1F(13.1G?"1l":"1M").1g,13.1G?13.7m():6h),2n:"kp",1H:0,1P:0,2u:0,2o:""}).2b(13.1d);U=v(T.1d)[Q]();if(!M){v(T.1d).1z({"2f-1e":N.1e,1g:N.1g,"26-1e":N.1e,"26-1g":""})}13.1d.1z({1g:"",7F:""}).1F();v(T.1d).1F();O=[T.1d,13.1i.1d];R=[q.2e({2u:[0,1]},M?{3Q:[0.6,1]}:{"2f-1e":[N.1e,U.1e],"26-1e":[N.1e,U.1e],1g:[N.1g,U.1g]}),{2u:[1,0]}]}if(13.1G){if(13.4e.4C&&S.4C){P=v(13.4e.4C).3B("2u");if(q.1f.7b){O=O.5X([S.4C]);R=R.5X([{2u:[0.cJ,P]}])}1j{O=O.5X([S.4C,13.4e.4C]);R=R.5X([{2u:[0.cJ,P]},{2u:[P,0.cJ]}])}}}1v q.9W(O,{5J:(M||13.1o("e2"))?M?k4:k5:0,2a:M?"6f-5W(0.aO, 0.c8, 0.di, 1)":(N.1e===U.1e)?"9X":"6f-5W(0.25, .1, .1, 1)",81:v(17(){13.1i.1d.2T().2q("2m");13.1i.1d.5i("2m");v(T.1d).1z(13.1G?{1e:"2B",1g:"2B"}:{1e:"",1g:""}).1z({"2f-1e":"","2f-1g":"",2u:"","26-1e":1q.2f(T.1F(13.1G?"1l":"1M").1e,13.1G?13.7T():6h),"26-1g":1q.2f(T.1F(13.1G?"1l":"1M").1g,13.1G?13.7m():6h)});if(13.1G){13.4e.2T();13.4e=2G;13.4e=S.3X("z-8w",-2M);v(13.4e.4C).1z({2u:""});if(13.3U){if(T.3y){if(T.3R){13.3U.5Z("").3b(q.$1v("a",{7k:T.3R}).1C("29 1W",13.aU.1E(13)).5Z(T.3y))}1j{13.3U.5Z(T.3y).1B("1m-5z")}}1j{13.3U.1R("1m-5z")}}}13.7i(T)}).1E(13),cD:v(17(V,W){if(2G!==V.3Q){W.3X("2o","3Q("+V.3Q+")")}})}).4G(R)}).1E(13);if(13.1G){K.5F(L)}1j{K.8u(L)}},aI:17(L){1a K=1k;v(13.3D).3d(17(M){v(M.4I).1R("1m-7a-7f");if(M===L){K=1s}});if(K&&L.4I){v(L.4I).1B("1m-7a-7f")}if(13.4L){13.4L.eh(L.fU)}},ei:17(K){if(13.1i.3y&&13.1o("8A")!=="4a"&&13.1c.1X!=="2C"){if(!13.1c.3y){13.1c.3y=q.$1v("36",{"4d":"1m-3y"}).2b(13.1c.1d.1B("3y-"+13.1o("8A")))}13.1c.3y.5Z(13.1i.3y)}},5I:17(K,N,L){1a M;if(!13.1G){if(13.6R<=0){1b}if(L!==1s){13.6R--}}if(N===2G||N===1h){if(!13.1c.2s&&!13.1c.2U){if(13.1o("4m")&&(13.1c.4Y||!13.1i.2j())&&!(q.1f.2I&&13.1o("2k")&&13.1c.1X==="1l"&&13.1c.2n==="2E")){if(13.1c.7H==="8l"){N=13.1o("cx")}1j{if(13.1c.7H==="2J"){N=13.1o("aF")}}}1j{N=13.1o("2k")?13.1o("9A"):""}}1j{N=13.1o("2k")?13.1o("9A"):""}}if(!N){13.c0();1b}M=13.1d;if(!13.3m){13.3m=q.$1v("36",{"4d":"1m-3m"});13.cs=q.$1v("cw",{"4d":"1m-3m-k7"}).3b(1p.9C(N)).2b(13.3m);v(13.3m).2b(13.1d)}1j{v(13.cs).5Z(N)}13.3m.1z({"2a-cL":""}).1R("1m-3m-3r");if(13.1G){M=13.5C}1j{if((13.1c.2s||13.1c.2U)&&13.1c.1X!=="2C"&&13.1c.2n==="2E"){M=13.1c.1d}}if(K===1s){4K(v(17(){13.3m.1B("1m-3m-3r")}).1E(13),16)}13.3m.2b(M)},c0:17(){if(13.3m){13.3m.1z({"2a-cL":"e1"}).1B("1m-3m-3r")}},7E:17(){if(!13.6T){13.6T=q.$1v("36",{"4d":"1m-k8"});13.1d.3b(13.6T);13.6T.1F()}13.6T.1B("dX")},cQ:17(){3q(13.5j);13.5j=1h;if(13.6T){v(13.6T).1R("dX")}},66:17(M,Q){1a P=q.3E(13.1c.1A),O=(!13.1G&&13.1c.4x)?v(13.1c.4x).1F():{1e:0,1g:0},L,K,N=13.1A,R={x:0,y:0};Q=Q||13.1c.2n;13.7W=13.1i.1d.1F();13.1A=13.1i.1d.1F();13.21=13.1i.1d.6N();if(!O.1g){O=13.1A}if(13.1o("dY")===1k||13.1c.1X===1k||13.1c.1X==="4H"){M=1k}if(13.1c.1X==="4H"){if(P.1e==="2B"){P.1e=13.3u.1e}if(P.1g==="2B"){P.1g=13.3u.1g}}if(13.1G&&13.1c.1X==="2C"){P.1e=70;P.1g="2B"}if(13.1c.1X==="2C"&&P.1g==="2B"){13.1c.1e=2A(P.1e/2M)*1q.2f(O.1e,O.1g);13.1c.1g=13.1c.1e}1j{if(13.1c.1X==="1l"&&Q==="2E"){13.1A=13.1d.1F();O=13.1A;13.21=13.1d.6N();13.1c.1e=O.1e;13.1c.1g=O.1g}1j{13.1c.1e=(P.7h==="%")?2A(P.1e/2M)*O.1e:6j(P.1e);13.1c.1g=(P.7w==="%")?2A(P.1g/2M)*O.1g:6j(P.1g)}}if(13.1c.1X==="4H"){K=1q.2f(1q.2f(13.1c.1e/13.3u.1e,13.1c.1g/13.3u.1g),1);13.1c.1e=13.3u.1e*K;13.1c.1g=13.3u.1g*K}13.1c.1e=1q.4k(13.1c.1e);13.1c.1g=1q.4k(13.1c.1g);13.1c.cq=13.1c.1e/13.1c.1g;13.1c.1d.1z({1e:13.1c.1e,1g:13.1c.1g});if(M){O=13.1G?13.3f.1F():13.1c.1d.1F();if(!13.1G&&(13.7W.1e*13.7W.1g)/(13.3u.1e*13.3u.1g)>0.8){13.1K.1e=1.5*13.3u.1e;13.1K.1g=1.5*13.3u.1g}1j{13.1K=q.3E(13.3u)}}if(13.1c.1X!==1k&&!13.1c.2s&&!(13.1G&&13.1o("3l")==="2X")){if((13.7W.1e*13.7W.1g)/(13.1K.1e*13.1K.1g)>0.8){13.1K=q.3E(13.3u);13.1c.6S(1k)}1j{13.1c.6S(1s)}}13.1c.1i.1z({1e:13.1K.1e,1g:13.1K.1g});13.1K.5T=13.1K.1e;13.1K.71=13.1K.1g;L=13.1c.1d.9g();13.1c.5H=1q.4k(L.1e);13.1c.4M=1q.4k(L.1g);13.1r.1e=1q.4k(13.1c.5H/(13.1K.1e/13.1A.1e));13.1r.1g=1q.4k(13.1c.4M/(13.1K.1g/13.1A.1g));13.1r.1d.1z({1e:13.1r.1e,1g:13.1r.1g});13.1r.1i.1z(13.1A);q.2e(13.1r,13.1r.1d.1F());if(13.1c.2s){3q(13.3J);13.3J=1h;if(13.1r.5N){13.1r.33.x*=(13.1A.1e/N.1e);13.1r.33.y*=(13.1A.1g/N.1g);R.x=13.1r.4b.x;R.y=13.1r.4b.y}1j{R.x=13.21.1P+13.1r.1e/2+(13.1r.33.x*(13.1A.1e/N.1e));R.y=13.21.1H+13.1r.1g/2+(13.1r.33.y*(13.1A.1g/N.1g))}13.5E(1h,R)}},8k:17(O){1a R;1a Q;1a K;1a P;1a N;1a M;1a L=v(13.1d).1Q("cr");K=s(5);N=13.1c.2n;P=13.1G?"2E":13.1c.4x?"4x":13.1o("1l-2n");M=13.1G&&13.1c.1X==="1l"?13.6M:1p.3n;if(13.1G){K.y=0;K.x=0}if(!O){13.66(1s,P)}R=13.21.1H;if(13.1c.1X!=="2C"){if(O){13.66(1k);1b}4B(P){1D"2E":1D"4x":R=0;Q=0;1J;1D"1H":R=13.21.1H-13.1c.1g-13.1o("1l-5B");if(K.1H>R){R=13.21.2P+13.1o("1l-5B");P="2P"}Q=13.21.1P;1J;1D"2P":R=13.21.2P+13.1o("1l-5B");if(K.2P<R+13.1c.1g){R=13.21.1H-13.1c.1g-13.1o("1l-5B");P="1H"}Q=13.21.1P;1J;1D"1P":Q=13.21.1P-13.1c.1e-13.1o("1l-5B");if(K.1P>Q&&K.2Q>=13.21.2Q+13.1o("1l-5B")+13.1c.1e){Q=13.21.2Q+13.1o("1l-5B");P="2Q"}1J;1D"2Q":1T:Q=13.21.2Q+13.1o("1l-5B");if(K.2Q<Q+13.1c.1e&&K.1P<=13.21.1P-13.1c.1e-13.1o("1l-5B")){Q=13.21.1P-13.1c.1e-13.1o("1l-5B");P="1P"}1J}4B(13.1o("1l-2n")){1D"1H":1D"2P":if(K.1H>R||K.2P<R+13.1c.1g){P="2E"}1J;1D"1P":1D"2Q":if(K.1P>Q||K.2Q<Q+13.1c.1e){P="2E"}1J;1T:}13.1c.2n=P;if(!13.1c.2U&&!13.1c.2s){if(q.1f.2I&&!13.1G&&(13.1c.1X==="1l"||13.1c.1X===1k&&13.1o("2k"))){if(13.1o("2k")){13.1c.6S(P!=="2E")}1j{if(13.1o("4A")!=="2J"){13.1c.7H=P==="2E"?"2J":13.1o("4A");13.b1();13.aZ();13.8U(13.1c.7H==="2J");13.8T(13.1c.7H==="2J"&&!13.1o("2k"))}}13.5I(1k,1h,!(13.1o("7O")&&13.1i.2j()))}1b}13.66(1k);if(O){1b}if(P==="4x"){M=13.1c.4x;K.y=0;K.x=0}if(P==="2E"){if(13.1c.1X!=="4H"){13.1c.1d.1B("1m-2E");13.1d.1B("1m-2E-1l")}13.1r.49();R=13.21.1H+K.y;Q=13.21.1P+K.x;R=0;Q=0;if(!13.1G){M=13.1d}}1j{R+=K.y;Q+=K.x;13.1d.1R("1m-2E-1l");13.1c.1d.1R("1m-2E")}13.1c.1d.1z({1H:R,1P:Q})}1j{13.66(1k);M=13.1d;if(q.1f.2I&&!13.1G&&!13.1c.2U&&!13.1c.2s){13.5I(1k,1h,!(13.1o("7O")&&13.1i.2j()))}}13.1c.1d[13.1G?"1B":"1R"]("1m-1G");if(!13.1G&&L){L.2b(13.1c.1X==="1l"&&P==="2E"?13.1c.1d:13.1d,((1q.4V(1q.6n()*bF)+1)%2)?"1H":"2P")}13.1c.1d.2b(M)},e7:17(Q){1a M;1a K;1a O;1a N;1a P=1k;1a L=Q.c9?5:3/54;if(!13.1c.2s){1b}v(Q).2i();L=(2M+L*1q.3e(Q.8z))/2M;if(Q.8z<0){L=1/L}if(13.1c.1X==="2C"){K=1q.26(2M,1q.5A(13.1c.1e*L));K=1q.2f(K,13.1A.1e*0.9);O=K/13.1c.cq;13.1c.1e=1q.4k(K);13.1c.1g=1q.4k(O);13.1c.1d.1z({1e:13.1c.1e,1g:13.1c.1g});M=13.1c.1d.9g();13.1c.5H=1q.4k(M.1e);13.1c.4M=1q.4k(M.1g);P=1s}1j{if(!13.1G&&13.1c.1X==="1l"){K=1q.26(13.1A.1e,1q.5A(13.1K.1e*L));K=1q.2f(K,13.1K.5T);O=K/(13.1K.5T/13.1K.71);13.1K.1e=1q.4k(K);13.1K.1g=1q.4k(O)}1j{1b}}N=v(1n).79();13.1r.1e=(13.1c.5H/(13.1K.1e/13.1A.1e));13.1r.1g=(13.1c.4M/(13.1K.1g/13.1A.1g));13.1r.1d.1z({1e:13.1r.1e,1g:13.1r.1g});q.2e(13.1r,13.1r.1d.1F());if(13.1c.2s){3q(13.3J);13.3J=1h;if(P){13.3J=1s}13.5E(1h,{x:Q.x-N.x,y:Q.y-N.y});if(P){13.3J=1h}}},8U:17(M){1a L;1a K=M?"3G 1W":"5D"+(1n.3P.78?" 6c":1n.3P.8p?" ee":"")+(1n.3P.78?" 4D":1n.3P.8p?" aA":" 72");1a N=13.1d.1Q("1m:4r:4R:fn",(!M)?v(17(O){if(O.6A()&&!O.5n()){1b}if(O&&O.2r==="3p"&&O.1x!=="6c"){1b}L=(q.1f.2L<9)?q.2e({},O):O;if(!13.64){3q(13.64);13.64=4K(v(17(){13.4R(L)}).1E(13),ka)}}).2K(13):v(13.4R).2K(13));13.1d.2O("1m:4r:4R:1t",K).1C(K,N,10)},b1:17(){1a K=13.1d.1Q("1m:4r:4R:1t");1a L=13.1d.1Q("1m:4r:4R:fn");13.1d.1O(K,L);13.1d.2z("1m:4r:4R:fn")},8T:17(L){1a K="4h";if(1n.3P.78){K+=" 4j cT 4D"}1j{if(1n.3P.8p){K+=" ed eo aA"}1j{K+=" 9c 72"}}if(L){if(13.1G||q.1f.2I){K="3G 1W"}1j{K+=" 3G 1W"}}1a M=13.1d.1Q("1m:4r:4i:fn",v(17(O){if(O.6A()&&!O.5n()){1b}if(O&&O.1x==="4j"&&O.2r!=="3p"){1b}if(O&&(O.1x==="4D"||O.1x==="aA"||O.1x==="72")){if(!13.2p||!13.1c.4Y||!13.1c.2s){1b}1a N=O.7P();if(N.x<13.21.1P||N.x>13.21.2Q||N.y<13.21.1H||N.y>13.21.2P){13.4i(O);1b}}1j{if(13.1c.1d!==O.8s()&&!((13.1c.2n==="2E"||13.1c.1X==="2C")&&13.1c.1d.aC(O.8s()))&&!13.1d.aC(O.8s())){13.4i(O);1b}}}).2K(13));13.1d.2O("1m:4r:4i:1t",K).1C(K,M,20)},aZ:17(){1a K=13.1d.1Q("1m:4r:4i:1t");1a L=13.1d.1Q("1m:4r:4i:fn");13.1d.1O(K,L);13.1d.2z("1m:4r:4i:fn")},aM:17(){1a K="6F";if(q.1f.4w!=="8a"){if(1n.3P.78){K+=" 4D"}1j{if(1n.3P.8p){K+=" aA"}1j{K+=" 72"}}}1a L=13.1d.1Q("1m:4r:5E:fn",v(13.5E).2K(13));13.1d.2O("1m:4r:5E:1t",K).1C(K,L)},eY:17(){1a K=13.1d.1Q("1m:4r:5E:1t");1a L=13.1d.1Q("1m:4r:5E:fn");13.1d.1O(K,L)},e3:17(){13.gk=13.69.1E(13);13.1d.1C(["5D",1n.3P.78?"6c":"ee"],v(17(K){if((q.1f.8G)&&13.1o("4m")&&13.1o("4A")!=="2J"&&K.1x==="5D"){K.56();if(q.1f.7b){K.5L()}}if(!13.1c.2s){1b}if(13.1c.2n==="2E"&&K.5n()){13.1r.4b=K.7P()}}).2K(13),10);13.1d.1C(["4h",1n.3P.78?"4j":"ed"],v(17(K){if(K.6A()&&K.5n()){13.1r.7S=1k}}).2K(13),10);13.aM();if(13.1o("4m")){13.8U(13.1o("4A")==="2J");13.8T(13.1o("4A")==="2J")}13.1d.1C("73",17(K){K.5L()},10).1C("1W",v(17(K){13.1d.bR("ec","2J");if(13.1G){13.3f.34("1W",K)}}).1E(13),15);if(13.1o("2k")){13.1d.1C("29 1W",v(13.2k).2K(13),15)}1j{13.1d.1C("29 1W",v(13.aU).2K(13),15)}if(13.3D.1I>1){13.bJ()}if(!q.1f.2I&&13.1o("e9")){13.1d.1C("4T",13.e7.2K(13))}if(q.1f.2I){13.fe()}v(1n).1C(q.1f.2I?"7o":"7o 6q",13.cI);if(13.1o("5o")){v(1n).1C("cZ",13.cB)}},dA:17(){if(13.1d){13.1d.1O("4T")}v(1n).1O("7o 6q",13.cI);if(13.1o("5o")){v(1n).1O("cZ",13.cB)}v(13.3D).3d(17(K){v(K.4I).cP()})},4R:17(Q){1a R;1a P;1a N;1a O;1a K;1a L=0;1a M=0;if(!13.1i.2j()||!13.2p||!13.1c.4Y||13.1c.2s||13.1c.2U){if(!13.1i.2j()&&!13.5h){if(Q){13.5h=m(Q);Q.4q()}13.1i.5F(13.7i.1E(13));if(!13.5j){13.5j=v(13.7E).1E(13).2F(9a)}}1b}if(Q&&Q.1x==="4D"&&Q.2r==="3p"){1b}if(!13.1o("4m")&&13.1o("2k")&&!13.1G){13.1c.2s=1s;1b}13.1c.2U=1s;if(13.1G&&13.1c.1X==="1l"){O=13.1i.1d.8c();13.5M.1B("1m-1l-in");K=13.5C.8c();M=((O.1P+O.2Q)/2-(K.1P+K.2Q)/2);L=((O.1H+O.2P)/2-(K.1H+K.2P)/2)}13.1c.1i.1O("2S");13.1c.1d.1R("1m-8Y").1O("2S");13.1c.1d.1B("1m-2U");13.1d.1B("1m-2U");13.8k();P=(13.1c.1X==="1l")?13.1c.2n:13.1c.1X;if(q.1f.2N.2a&&!(13.1G&&13.1o("3l")==="2X")){if(P==="2E"){N=13.1i.1d.1F();13.1c.1i.1z({2o:"4F(0,"+L+"2D, 0) 3Q("+N.1e/13.1K.1e+", "+N.1g/13.1K.1g+")"}).1F();13.1c.1i.1C("2S",v(17(){13.1c.1i.1O("2S");13.1c.1d.1R("1m-2U 1m-p-"+P);13.1c.2U=1k;13.1c.2s=1s}).1E(13));13.1c.1d.1B("1m-p-"+P).1F();if(!q.1f.2I&&q.1f.6l&&(q.1f.4E==="6l"||q.1f.4E==="7n")){13.1c.2U=1k;13.1c.2s=1s}}1j{13.1c.1d.1C("2S",v(17(){13.1c.1d.1O("2S");13.1c.1d.1R("1m-2U 1m-p-"+P)}).1E(13));13.1c.1d.1z({2a:"38"});13.1c.1d.1B("1m-p-"+P).1F();13.1c.1d.1z({2a:""}).1F();13.1c.1d.1R("1m-p-"+P);13.1c.2U=1k;13.1c.2s=1s}}1j{13.1c.1d.1R("1m-2U");13.1c.2U=1k;13.1c.2s=1s}if(!13.1G){13.5I(1s)}if(Q){Q.2i().4q();R=Q.7P();if(13.1c.1X==="2C"&&(/29/i).3z(Q.1x)){R.y-=13.1c.1g/2+10}if(P==="2E"&&((/29/i).3z(Q.1x)||Q.6A())){13.1r.33={x:0,y:0};R.x=-(R.x-13.21.1P-13.1A.1e/2)*(13.1K.1e/13.1A.1e);R.y=-(R.y-13.21.1H-13.1A.1g/2)*(13.1K.1g/13.1A.1g)}}1j{R={x:13.21.1P+(13.21.2Q-13.21.1P)/2,y:13.21.1H+(13.21.2P-13.21.1H)/2};if(q.1f.2I&&13.1G&&13.1o("3l")==="2X"){13.1r.5N=1s;13.1r.33={x:0,y:0};R.x=-(R.x-13.21.1P-13.1A.1e/2)*(13.1K.1e/13.1A.1e);R.y=-(R.y-13.21.1H-13.1A.1g/2)*(13.1K.1g/13.1A.1g)}}13.1d.1R("1m-2U").1B("1m-2s");R.x+=-M;R.y+=-L;13.1r.4b={x:0,y:0};13.1r.dx=0;13.1r.dy=0;13.5E(Q,R,1s);I("bt",13.id)},4i:17(M,R){1a P;1a N;1a K;1a L;1a O=0;1a Q=0;1a S=13.1c.2s;13.5h=1h;if(!13.2p){1b}if(M&&M.1x==="cT"&&M.2r==="3p"){1b}3q(13.3J);13.3J=1h;3q(13.64);13.64=1h;13.1c.2U=1k;13.1c.2s=1k;if(R!==1s&&!13.1G){if(S){if(q.1f.2I&&!13.1G&&13.1c.1X==="1l"){13.8k()}1j{13.5I()}}}if(!13.1c.4Y){1b}if(M){M.2i()}13.1c.1i.1O("2S");13.1c.1d.1R("1m-2U").1O("2S");if(13.1G){L=13.5C.8c();if(13.1o("3l")!=="2X"){13.5M.1R("1m-1l-in")}13.1i.1d.1z({"26-1g":13.7m()});K=13.1i.1d.8c();Q=((K.1P+K.2Q)/2-(L.1P+L.2Q)/2);O=((K.1H+K.2P)/2-(L.1H+L.2P)/2)}P=(13.1c.1X==="1l")?13.1c.2n:13.1c.1X;if(q.1f.2N.2a&&M&&!(13.1G&&13.1o("3l")==="2X")){if(P==="2E"){13.1c.1i.1C("2S",v(17(){13.1c.1i.1O("2S");13.1d.1R("1m-2s");4K(v(17(){13.1c.49()}).1E(13),32)}).1E(13));N=13.1i.1d.1F();13.1c.1d.1B("1m-8Y 1m-p-"+P).1F();13.1c.1i.1z({2o:"4F(0,"+O+"2D,0) 3Q("+N.1e/13.1K.5T+", "+N.1g/13.1K.71+")"})}1j{13.1c.1d.1C("2S",v(17(){13.1c.49();13.1d.1R("1m-2s")}).1E(13));13.1c.1d.3B("2u");13.1c.1d.1B("1m-8Y 1m-p-"+P);13.1d.1R("1m-2s")}}1j{13.1c.49();13.1d.1R("1m-2s")}13.1r.dx=0;13.1r.dy=0;13.1r.4b={x:0,y:0};13.1r.49();if(S){I("cV",13.id)}},5E:17(U,T,S){1a M=T;1a O;1a N;1a Q=0;1a L;1a P=0;1a K;1a V;1a R=1k;if(!13.1c.2s&&!S){1b}if(U){v(U).56().5L();if(U.6A()&&!U.5n()){1b}R=(/29/i).3z(U.1x)||U.6A();if(R&&!13.1r.7S){13.1r.7S=R}if(!M){M=U.7P()}}if(13.1c.1X==="4H"){1b}if(13.1c.1X==="1l"&&13.1c.2n==="2E"&&(U&&R||!U&&13.1r.5N)){13.1r.5N=1s;O=13.1r.33.x+(M.x-13.1r.4b.x);N=13.1r.33.y+(M.y-13.1r.4b.y);13.1r.4b=M;Q=1q.2f(0,13.1c.5H-13.1K.1e)/2;L=-Q;P=1q.2f(0,13.1c.4M-13.1K.1g)/2;K=-P}1j{13.1r.5N=1k;if(13.1c.1X==="2C"){M.y=1q.26(13.21.1H,1q.2f(M.y,13.21.2P));M.x=1q.26(13.21.1P,1q.2f(M.x,13.21.2Q))}O=M.x-13.21.1P;N=M.y-13.21.1H;L=13.1A.1e-13.1r.1e;K=13.1A.1g-13.1r.1g;O-=13.1r.1e/2;N-=13.1r.1g/2}if(13.1c.1X!=="2C"){O=1q.26(Q,1q.2f(O,L));N=1q.26(P,1q.2f(N,K))}13.1r.33.x=O;13.1r.33.y=N;if(13.1c.1X==="1l"){if(q.1f.2N.2o){13.1r.1d.1z({2o:"az("+13.1r.33.x+"2D,"+13.1r.33.y+"2D)"});13.1r.1i.1z({2o:"az("+-(13.1r.33.x+13.1r.40.x)+"2D, "+-(13.1r.33.y+13.1r.40.y)+"2D)"})}1j{13.1r.1d.1z({1H:13.1r.33.y,1P:13.1r.33.x});13.1r.1i.1z({1H:-(13.1r.33.y+13.1r.40.y),1P:-(13.1r.33.x+13.1r.40.x)})}}if(13.1c.1X==="2C"){if(13.1r.7S&&!(U&&U.1x==="3G")){M.y-=13.1c.1g/2+10}13.1c.1d.1z({1H:M.y-13.21.1H-13.1c.1g/2,1P:M.x-13.21.1P-13.1c.1e/2})}if(!13.3J){13.1r.dx=0;13.1r.dy=0;13.69(1)}},69:17(P){1a N;1a L;1a K;1a Q;1a O;1a M;if(!kc(P)){if(13.1r.5N){P=13.1r.7S?0.4:0.16}1j{P=13.1o("fS")?0.2:13.1r.7S?0.4:0.8}}N=((13.1r.33.x-13.1r.dx)*P);L=((13.1r.33.y-13.1r.dy)*P);13.1r.dx+=N;13.1r.dy+=L;if(!13.3J||1q.3e(N)>0.cO||1q.3e(L)>0.cO){if(13.1r.5N){K=13.1r.dx;Q=13.1r.dy}1j{K=(13.1r.dx*(13.1K.1e/13.1A.1e)-1q.26(0,13.1K.1e-13.1c.5H)/2);Q=(13.1r.dy*(13.1K.1g/13.1A.1g)-1q.26(0,13.1K.1g-13.1c.4M)/2);if(13.1c.1X==="2C"){K=1q.5A(K);Q=1q.5A(Q)}K=-K;Q=-Q}O=13.1K.1e/13.1K.5T;M=13.1K.1g/13.1K.71;13.1c.1i.1z(q.1f.2N.2o?{2o:d+K+"2D,"+Q+"2D"+C+" 3Q("+O+","+M+")"}:{1e:13.1K.1e,1g:13.1K.1g,1P:-(13.1r.dx*(13.1K.1e/13.1A.1e)+1q.2f(0,13.1K.1e-13.1c.5H)/2),1H:-(13.1r.dy*(13.1K.1g/13.1A.1g)+1q.2f(0,13.1K.1g-13.1c.4M)/2)})}if(13.1c.1X==="2C"){1b}13.3J=4K(13.gk,16)},bJ:17(){1a W;1a M;1a R=30;1a O=ki;1a T;1a U="";1a L={};1a K;1a Q;1a V=0;1a X={2a:q.1f.aN+6L.83(32)+"fb 6f-5W(.18,.35,.58,1)"};1a N;1a S;1a P=v(17(Y){if(!13.2p||13.1c.2s){1b}if(Y.2c==="41"){3q(13.64);13.64=1h;V=0;L={x:Y.x,y:Y.y,f7:Y.2W};W=13.1A.1e;M=W/2;13.1i.1d.1O("2S");13.1i.1d.3X("2a","");13.1i.1d.3X("2o","4F(0, 0, 0)");S=1h}1j{K=(Y.x-L.x);Q={x:0,y:0,z:0};if(S===1h){S=(1q.3e(Y.x-L.x)<1q.3e(Y.y-L.y))}if(S){1b}Y.2i();if(Y.2c==="aW"){V=0;N=1h;T=Y.2W-L.f7;if(1q.3e(K)>M||(T<O&&1q.3e(K)>R)){if((U=(K>0)?"f1":(K<=0)?"km":"")){if(U==="f1"){N=13.8x();V+=W*10}1j{N=13.8B();V-=W*10}}}Q.x=V;Q.fc=-90*(Q.x/W);13.1i.1d.1C("2S",v(17(Z){13.1i.1d.1O("2S");13.1i.1d.3X("2a","");if(N){13.1i.1d.1z({2o:"4F("+Q.x+"2D, 6G, 6G)"});13.4N(N,1s)}}).1E(13));13.1i.1d.1z(X);13.1i.1d.1z({"2a-5J":Q.x?"ko":"fb",2u:1-0.2*1q.3e(Q.x/W),2o:"4F("+Q.x+"2D, 6G, 6G)"});K=0;1b}Q.x=K;Q.z=-50*1q.3e(Q.x/M);Q.fc=-60*(Q.x/M);13.1i.1d.1z({2u:1-0.2*1q.3e(Q.x/M),2o:"4F("+Q.x+"2D, 6G, "+Q.z+"2D)"})}}).1E(13);13.1d.1C("2y",P)},fe:17(){1a M={1e:0,1g:0};1a O=1k;1a N;1a L=v(17(T,P,S){1a Q;1a R;if(!13.1c.2s&&!S){1b}1a U=q.3E(13.1K);Q=1q.26(N.1e,1q.5A(M.1e*T));Q=1q.2f(Q,13.1K.5T);R=Q/(13.1K.5T/13.1K.71);13.1K.1e=1q.4V(Q);13.1K.1g=1q.4V(R);13.1r.1e=1q.4k(13.1c.5H/(13.1K.1e/N.1e));13.1r.1g=1q.4k(13.1c.4M/(13.1K.1g/N.1g));13.1r.1d.1z({1e:13.1r.1e,1g:13.1r.1g});q.2e(13.1r,13.1r.1d.1F());3q(13.3J);13.3J=1h;P.x=13.1r.4b.x*(13.1K.1e/U.1e)+(P.x-13.21.1P-13.1A.1e/2)*(1-(13.1K.1e/U.1e));P.y=13.1r.4b.y*(13.1K.1g/U.1g)+(P.y-13.21.1H-13.1A.1g/2)*(1-(13.1K.1g/U.1g));13.1r.4b={x:0,y:0};13.1r.33={x:0,y:0};13.1r.5N=1s;13.5E(1h,{x:P.x,y:P.y});3q(13.3J);13.3J=1h}).1E(13);1a K=v(17(R){if(!O&&R.2c!=="6b"&&!R.fl){1b}R.2i();1a Q=v(1n).79();1a P=1k;1a S={x:R.6z.x-Q.x,y:R.6z.y-Q.y};4B(R.2c){1D"6b":13.eY();M=q.3E(13.1K);if(13.1G){N=13.1i.1d.1F()}1j{N=13.1A}3q(13.3J);13.3J=1h;if(13.1c.2s){13.1r.4b=q.3E(13.1r.33)}O=1s;1J;1D"eE":O=1k;if(13.1c.2s){if(13.1o("3l")!=="2X"&&13.1K.1e<=N.1e&&13.1K.1g<=N.1g){O=1k;13.4i(1h)}1j{if(R.6O.1I>0){13.1r.4b={x:R.6O[0].3C,y:R.6O[0].3A}}}}13.aM();1J;1D"eG":1J;1D"eI":if(13.1G&&R.1l===-1&&(!13.1c.2s||13.1o("3l")==="2X")){if(R.3Q<c){13.52()}}1j{if(13.1G&&R.1l===1&&13.1o("3l")==="2X"){}1j{if(13.1o("2k")&&!13.1G){if(R.3Q>x){O=1k;13.aM();13.2k(R);1b}}1j{if(R.1l===1&&!13.1c.2s){if(!13.1i.2j()||!13.2p||!13.1c.4Y){if(!13.1i.2j()&&!13.5h){if(R){13.5h=m(R);R.4q()}13.1i.5F(13.7i.1E(13));if(!13.5j){13.5j=v(13.7E).1E(13).2F(9a)}}1b}13.1c.2U=1s;if(13.1G&&13.1c.1X==="1l"){13.5M.1B("1m-1l-in")}13.1c.1i.1O("2S");13.1c.1d.1R("1m-8Y").1O("2S");13.1c.1d.1B("1m-2U");13.1d.1B("1m-2U");13.8k();13.1K.1e=N.1e;13.1K.1g=N.1g;13.1c.2U=1k;13.1c.2s=1s;M=q.3E(13.1K);13.1c.1d.1R("1m-2U");13.1d.1R("1m-2U").1B("1m-2s");13.1r.4b={x:0,y:0};13.1r.33={x:0,y:0};P=1s;if(!13.1G){13.5I(1s)}}L(R.3Q,S,P);if(P){I("bt",13.id)}}}}1J}}).1E(13);13.1d.1C("1N",K)},eS:17(){1a K=1p.kn();v(["4t","4p","52"]).3d(17(M){1a L="1m-2v";13.2w[M]=q.$1v("2v",{1x:"2v",7s:13.1o("aJ-kl-"+M)}).1B(L).1B(L+"-"+M);K.bw(13.2w[M]);4B(M){1D"4t":13.2w[M].1C("29 1W",17(N){N.2i();13.4N(13.8x())}.2K(13));1J;1D"4p":13.2w[M].1C("29 1W",17(N){N.2i();13.4N(13.8B())}.2K(13));1J;1D"52":13.2w[M].1C("29 1W",17(N){N.2i();13.52()}.2K(13)).49();1J;1T:}},13);13.aV(13.3D.1I>1);13.7Z=q.$1v("36").1B("1m-kk-bU").3b(K).2b(13.1d)},aV:17(K){if(K){13.2w.4p.5z();13.2w.4t.5z()}1j{13.2w.4p.49();13.2w.4t.49()}},fA:17(){1a L;1a K;if(13.3D.1I){13.4U=13.3D}1j{L=13.3O.2q("3j-aE");if(L){if(q.1f.2N.by){K=q.$A(1p.bA(\'.b2[3j-aE="\'+L+\'"], .aX[3j-aE="\'+L+\'"]\'))}1j{K=q.$A(1p.aP("A")).3a(17(M){1b L===M.2q("3j-aE")})}v(K).3d(17(N){1a M;1a O;M=n(N);if(M&&M.3D.1I>0){1b}if(M){O=1v o(M.1i.1M.1Y,M.1i.1l.1Y,M.1i.3y,1h,M.1i.4I);O.3R=M.1i.3R;O.3I=M.1i.3I}1j{O=1v o().aG(N,M?M.7d:1h)}if((13.1i.1l.1Z.3o(O.1l.1Y)||13.1i.1l.1Y.3o(O.1l.1Y))&&(13.1i.1M.1Z.3o(O.1M.1Y)||13.1i.1M.1Y.3o(O.1M.1Y))){O=13.1i}13.4U.2Z(O)},13);13.7g=13.1i}}if(!13.7D){13.7D=1q.4V(1q.6n()*q.6e())}if(13.4U.1I>1){13.5M.1B("fy-b7");13.5w=q.$1v("36",{"4d":"1m-2k-kj"}).2b(13.5M);13.4L=1v E(13.5w);v(13.4U).3d(17(M){1a N=v(17(O){13.aI(M);13.4N(M)}).1E(13);M.fU=13.4L.fT(q.$1v("24",{1Z:M.6B("1M"),3I:M.3I}).1C("29 1W",17(O){O.2i()}).1C("29 "+(13.1o("bd")==="8l"?"7M 9c":"1W"),v(17(P,O){if(13.6p){3q(13.6p)}13.6p=1k;if(P.1x==="7M"){13.6p=v(N).2F(O)}1j{if(P.1x==="29"||P.1x==="1W"){N()}}}).2K(13,60)))},13)}1j{13.5M.1R("fy-b7")}13.aV(13.4U.1I>1);13.2w.52.5z()},ep:17(){1a K;if(13.4L){13.4L.2i();13.4L=1h}if(13.5w){13.5w.2T();13.5w=1h}13.aV(13.3D.1I>1);13.2w.52.49();if(13.4U.1I>1&&!13.3D.1I){13.1d.1O("2y");13.1i.1d.2T().2q("2m");13.1i.1d.5i("2m");13.7g.1d.2b(13.1d);13.7i(13.7g);5R(K=13.4U.kh()){if(K!==13.7g){if(K.1M.1d){K.1M.1d.5k();K.1M.1d=1h}if(K.1l.1d){K.1l.1d.5k();K.1l.1d=1h}K=1h}}}13.4U=[]},52:17(){if(!13.2p||!13.1G){1b}if(q.1f.4w==="7z"&&q.1f.4E==="aL"&&6j(q.1f.7r)===7){fC(h);h=1h}v(1p).1O("bM",13.aR);13.4i(1h,1s);13.2p=1k;if(q.1f.5p.aH&&q.1f.5p.4Y()){q.1f.5p.fE()}1j{if(q.1f.2N.2a){13.1d.1O("2S").1z({2a:""});13.1d.1C("2S",13.9k);if(q.1f.3Z){4K(v(17(){13.9k()}).1E(13),kf)}13.4e.1O("2S").1z({2a:""});13.4e.1z({2a:"fO 0.6s 6f-5W(0.fH, 0.kd, 0.fL, 0.k3) 0.aY"}).1F();13.1d.1z({2a:"fO .3s 6f-5W(0.b3, 0, 0.d6, 0.c6) aY"}).1F();if(13.1c.1X!==1k&&13.1o("3l")==="2X"&&13.1o("57")!=="2C"){13.1i.1d.1z({"26-1g":13.1i.1F("1l").1g});13.1i.1d.1z({"26-1e":13.1i.1F("1l").1e})}13.4e.1z({2u:0.4});13.1d.1z({2u:0.kb,2o:"3Q(0.4)"})}1j{13.9k()}}},2k:17(L){if(!13.1i.2j()||!13.2p||13.1G){if(!13.1i.2j()&&!13.5h){if(L){13.5h=m(L);L.4q();if(L.1x==="29"){L.6w[1].4q()}}13.1i.5F(13.7i.1E(13));if(!13.5j){13.5j=v(13.7E).1E(13).2F(9a)}}1b}if(L){L.4q()}1a K=v(13.1d).1Q("cr");13.c0();13.6R--;13.4i(1h,1s);13.b1();13.aZ();13.2p=1k;if(!13.3f){13.3f=q.$1v("36").1B("1m-2k").1B(13.1o("5P")).1z({2u:0});13.5M=q.$1v("36").1B("1m-2k-g1").2b(13.3f);13.3f.1C("4T 5D 3G",v(17(M){v(M).2i()}));if(13.1o("df")){13.3f.1C("29 1W",17(O){1a N=O.5V();1a M=v(13.1o("57")==="2C"?13.1c.1d:13.1c.1i).8c();if(13.1o("3l")!=="2X"&&M.1H<=N.y&&N.y<=M.2P&&M.1P<=N.x&&N.x<=M.2Q){O.4q();13.4i(O);1b}if(13.1o("3l")!=="2X"&&13.1d.aC(O.dw())){1b}O.2i();13.52()}.2K(13))}13.aR=v(17(N){1a M=1h;if(N.97!==27&&N.97!==37&&N.97!==39){1b}v(N).2i();if(N.97===27){13.52()}1j{M=(N.97===37)?13.8x():13.8B();if(M){13.4N(M)}}}).2K(13);13.8J=v(17(){1a O;13.1d.1O("2S").1z({2a:"",2o:"4F(0, 0, 0)"});if(13.1G){1b}13.1G=1s;if(13.1o("5o")){3c{1a M="#1m-1G-aK-"+13.7D;if(1n.er.es!==M){if(5o.2c&&5o.2c.ci&&5o.2c.aB){5o.k9({ci:13.7D,aB:13.id},1p.7s,M)}1j{5o.k6({ci:13.7D,aB:13.id},1p.7s,M)}}}3x(N){}}13.3f.1R("1m-2k-ke").1z({2u:1});13.1c.b0(13.1o("57"));13.1K=q.3E(13.3u);13.63();if(13.3U&&13.1i.3y){13.3U.1B("1m-5z")}if(13.1o("3l")!=="2X"){13.8U(1s);13.8T(1s)}13.2p=1s;if(13.1o("3l")==="2X"){if(13.1c.1X!==1k){13.1c.6S(1s)}if(q.1f.2I&&13.91){13.91=1k}13.4R()}if((q.1f.2I||13.1o("aD"))&&13.91&&13.1c.4Y){13.5I(1s,13.1o("aF"));if(13.6R!==6h){13.91=1k}}13.7Z.1R("1m-3r").1B("1m-8W 1m-5u");if(13.5w){13.5w.1R("1m-3r").1B("1m-8W 1m-5u")}if(13.4L){13.4L.bY();13.aI(13.1i)}if(K){K.2b(13.3f,((1q.4V(1q.6n()*bF)+1)%2)?"1H":"2P")}if(13.4U.1I>1&&!13.3D.1I){13.bJ()}v(1p).1C("bM",13.aR);if(q.1f.4w==="7z"&&q.1f.4E==="aL"&&6j(q.1f.7r)===7){h=J()}I("ek",13.id)}).1E(13);13.9k=v(17(){13.1d.1O("2S");if(!13.1G){1b}if(13.1G){v(1p).1O("bM",13.aR);13.4i(1h,1s)}13.66(1s);13.ep();13.1G=1k;if(13.1o("5o")){if(1n.er.es==="#1m-1G-aK-"+13.7D){5o.kB()}}13.1c.b0(13.1o("4m"));13.1d.7R(13.1i.7l("1M"),13.1i.1d);13.1i.7j("1M");v(13.1i.1d).1z({1e:"",1g:"","26-1e":1q.2f(13.1i.1F("1M").1e),"26-1g":1q.2f(13.1i.1F("1M").1g)});13.1r.1i.1Z=13.1i.6B("1M");13.1d.1z({2u:"",2a:""});13.1d.1z({2o:"4F(0, 0, 0)"});v(13.3O).7R(13.1d,13.8C);13.7Z.1R("1m-2k-bU").1R("1m-3r").1B("1m-8W 1m-5u").2b(13.1d);13.66(1s);if(13.3U){13.3U.2T();13.3U=1h}13.b1();13.aZ();if(13.1o("4A")==="2X"){13.4R()}1j{if(13.1o("4m")!==1k){13.8U(13.1o("4A")==="2J");13.8T(13.1o("4A")==="2J")}}13.5I();13.4e.1O("2S");13.3f.2T();13.4e.2T();13.4e=1h;if(G){G.2T()}v(q.1f.4n()).1R("1m-1G-aK-8I");13.2p=1s;if(q.1f.2L<10){13.63()}1j{v(1n).bR("e0","7o")}I("dW",13.id)}).1E(13);13.6M=q.$1v("36",{"4d":"1m-1i-g1"}).2b(13.5M);13.5C=q.$1v("5K").2b(13.6M);13.8C=13.1d.bW(1k)}13.7Z.1B("1m-2k-bU").2b(13.6M);13.fA();if(G){G.2b(1p.3n)}v(q.1f.4n()).1B("1m-1G-aK-8I");v(1p.3n).1F();if(13.1o("2k")==="gg"){13.bj();q.1f.5p.cH(13.3f,{cF:v(17(){13.8J()}).1E(13),cN:13.9k,9m:v(17(){13.bP()}).1E(13)})}1j{4K(v(17(){13.bj();13.bP()}).1E(13),96)}},bj:17(){1a L;1a K;L=q.$1v("24",{bB:13.1i.6B("1l")+" "+13.1i.bD("1l")+"x",1Z:13.1i.6B("1l"),3I:13.1i.3I});13.4e=q.$1v("36").1B("1m-2k-bg").3b((q.1f.2N.9i||q.1f.2L<10)?L:1v q.aT(L).5G(k).7l()).2b(13.3f);if(13.1o("3l")==="2X"&&13.1o("57")!==1k){13.5M.1B("1m-2X-1l"+(13.1o("57")==="1l"?" 1m-1l-in":"")).1F()}K=v(13.1d)[(q.1f.2L<10)?"1F":"6N"]();v(13.8C).1z({1e:K.1e,1g:K.1g});13.1d.7R(13.1i.7l("1l"),13.1i.1d);13.1i.7j("1l");13.3f.2b(1p.3n);if(G){13.3f.1z({1g:1n.4M,71:"fD",1H:1q.3e(G.6N().1H)})}13.7T=17(){1a M=13.6M;if(v(13.5C).1F().1e>50){M=13.5C}1b 17(){1b 13.1o("3l")==="2X"&&13.1o("57")!==1k&&13.1o("57")!=="2C"?6h:1q.5A(v(M).9g().1e)}}.2g(13);13.7m=17(){1a M=13.6M;if(v(13.5C).1F().1g>50){M=13.5C}1b 17(){1b 13.1o("3l")==="2X"&&13.1o("57")!==1k&&13.1o("57")!=="2C"?6h:1q.5A(v(M).9g().1g)}}.2g(13);13.7Z.1R("1m-8W 1m-5u").1B("1m-3r");if(13.5w){13.5w.1R("1m-8W 1m-5u").1B("1m-3r")}if(13.1o("3U")){13.3U=q.$1v("dD",{"4d":"1m-3y"}).2b(13.6M);if(13.3U&&13.1i.3y){if(13.1i.3R){13.3U.3b(q.$1v("a",{7k:13.1i.3R}).1C("29 1W",13.aU.1E(13)).5Z(13.1i.3y))}1j{13.3U.5Z(13.1i.3y)}}}13.1i.1d.1z({"26-1g":1q.2f(13.1i.1F("1l").1g,13.7m())});13.1i.1d.1z({"26-1e":1q.2f(13.1i.1F("1l").1e,13.7T())});13.5C.3b(v(13.3O).7R(13.8C,13.1d))},bP:17(){13.1d.1z({2a:""});13.1d.1z({2o:"3Q(0.6)"}).1F();13.1d.1z({2a:q.1f.aN+" 0.4s 6f-5W(0.aO, 0.c8, 0.di, 1) aY"});if(q.1f.2N.2a){13.1d.1C("2S",13.8J);if(q.1f.6l&&(q.1f.4E==="6l"||q.1f.4E==="7n")){4K(v(17(){13.8J()}).1E(13),bZ)}}1j{13.8J.2F(16,13)}13.3f.1z({2u:1});13.1d.1z({2o:"3Q(1)"})},aU:17(){if(13.1i.3R){1n.8I(13.1i.3R,"jl")}},8B:17(){1a K=(13.1G?13.4U:13.3D).3a(17(N){1b(N.1M.2c!==-1||N.1l.2c!==-1)});1a L=K.1I;1a M=v(K).51(13.1i)+1;1b(L<=1)?1h:K[(M>=L)?0:M]},8x:17(){1a K=(13.1G?13.4U:13.3D).3a(17(N){1b(N.1M.2c!==-1||N.1l.2c!==-1)});1a L=K.1I;1a M=v(K).51(13.1i)-1;1b(L<=1)?1h:K[(M<0)?L-1:M]},g8:17(L,M){1a K=13.3D.3a(17(N){1b((N.1l.1Z.3o(L)||N.1l.1Y.3o(L))&&(N.1M.1Z.3o(M)||N.1M.1Y.3o(M)))})||[];1b K[0]||((M&&L&&q.1V(M)==="1S"&&q.1V(L)==="1S")?1v o(M,L):1h)},bs:17(L){1a K=13.3D.3a(17(M){1b(M.4I===L)})||[];1b K[0]},ey:17(K){1b 13.3D[K]}};e={4J:"fJ.3.5 (kR)",4G:17(N,L){1a M=1h;1a K=[];q.$A((N?[v(N)]:q.$A(1p.aQ("b2")).5X(q.$A(1p.aQ("aX"))))).3d(v(17(O){if(v(O)){if(!n(O)){M=1v z(O,L);if(l&&!M.1o("b5")){M.2i();M=1h}1j{t.2Z(M);K.2Z(M)}}}}).1E(13));1b N?K[0]:K},2i:17(N){1a L,M,K;if(N){(M=n(N))&&(M=t.8y(t.51(M),1))&&M[0].2i()&&(4W M[0]);1b}5R(L=t.1I){M=t.8y(L-1,1);M[0].2i();4W M[0]}},lT:17(K){13.2i(K);1b 13.4G(K)},4N:17(P,O,N,L){1a M=n(P);1a K;if(M){K=q.1V(O)==="6t"?M.bs(O):M.g8(O,N);if(K){M.4N(K)}}},lE:17(N,M){1a L=n(N);1a K;if(L){4B(q.1V(M)){1D"6t":K=L.bs(M);1J;1D"6Z":K=L.ey(M);1J;1T:}if(K){L.4N(K)}}},4t:17(L){1a K;(K=n(L))&&K.4N(K.8x())},4p:17(L){1a K;(K=n(L))&&K.4N(K.8B())},lH:17(L){1a K;(K=n(L))&&K.4R()},lX:17(L){1a K;(K=n(L))&&K.4i()},2k:17(L){1a K;(K=n(L))&&K.2k()},52:17(L){1a K;(K=n(L))&&K.52()},e6:17(K,L){if(!F[K]){F[K]=[]}if(q.1V(L)==="17"){F[K].2Z(L)}},m2:17(K){1b!!n(K)}};v(1p).1C("aS",17(){1a L=1n[j+"8e"]||{};y=y();A();r=q.$1v("36",{"4d":"2R-3r-7v"}).2b(1p.3n);p=(q.1f.2I&&1n.fr&&1n.fr("(26-fs-1e: g6), (26-fs-1g: g6)").kU);if(q.1f.2I){q.2e(b,D)}if(p&&q.1f.4w==="7z"){G=q.$1v("36").1z({2n:"lh",1H:0,1e:0,1g:"fD"})}1U(1a K=0;K<u.1I;K++){if(L[u[K]]&&q.$F!==L[u[K]]){e.e6(u[K],L[u[K]])}}e.4G();l=1k});1n.aX=1n.aX||{};1b e})();',62,1368,'|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||this||||function|||var|return|zoomBox|node|width|browser|height|null|image|else|false|zoom|mz|window|option|document|Math|lens|true|event|Event|new|Custom|type|options|jSetCss|size|jAddClass|jAddEvent|case|jBind|jGetSize|expanded|top|length|break|zoomSize|handler|small|pinch|jRemoveEvent|left|jFetch|jRemoveClass|string|default|for|jTypeOf|btnclick|mode|url|src||boundaries|||img||max|||tap|transition|jAppendTo|state||extend|min|call|arguments|stop|loaded|expand|important|style|position|transform|ready|getAttribute|pointerType|active|prototype|opacity|button|buttons||touchdrag|jDel|parseFloat|auto|magnifier|px|inner|jDelay|undefined|enum|mobile|click|jBindAsEvent|ieMode|100|features|jStore|bottom|right|magic|transitionend|jRemove|activating|context|timeStamp|always|mousedrag|push||||pos|jCallEvent||div||none||filter|append|try|jEach|abs|expandBox|listeners|oneOf|boolean|data|setAttribute|expandZoomOn|hint|body|has|touch|clearTimeout|hidden||settings|zoomSizeOrigin|rootCSS|handle|catch|caption|test|clientY|jGetCss|clientX|additionalImages|detach|defined|dbltap|Doc|alt|moveTimer|orientation|pageY|pageX|match|placeholder|navigator|scale|link|parent|init|expandCaption|Class|target|jSetCssProp|instanceof|webkit|border|dragstart||disabled|||||originalImg|hide|off|spos|parentNode|class|expandBg|pointerId|Element|touchend|deactivate|pointerup|ceil|hasOwnProperty|zoomMode|getDoc|dblbtnclick|next|stopQueue|handlers||prev|contains|array|platform|custom|replace|pushToEvents|zoomOn|switch|firstChild|pointermove|uaName|translate3d|start|preview|origin|version|setTimeout|expandThumbs|innerHeight|update|styles|documentElement|schema|activate|reverse|mousescroll|expandGallery|floor|delete|changedTouches|enabled|Array||indexOf|close||||stopDefaults|expandZoomMode||root|J_TYPE|visibility|css|toLowerCase|jTrim|onTouchEnd|trident|initEvent|removeAttribute|loadTimer|kill|vertical|direction|isPrimaryTouch|history|fullScreen|requestAnimationFrame|domPrefix|space|constructor|visible|messageBox|expandNav|pow|dragged|show|round|distance|expandFigure|touchstart|animate|load|blur|innerWidth|showHint|duration|figure|stopDistribution|expandStage|innertouch|addCSS|cssClass|jCamelize|while|absolute|maxWidth|onTouchStart|jGetPageXY|bezier|concat|cubicBezier|changeContent|||variables|resizeCallback|activateTimer|timer|setSize|add||move|throw|pinchstart|pointerdown|canvas|now|cubic|identifier|Infinity|not|parseInt|FX|chrome|engine|random|no|updateTimer|scroll|ms||element|selectedItem|ease|events|onload|nodeType|centerPoint|isTouchEvent|getURL|targetTouches|MSPOINTER_TYPE_TOUCH|dppx|touchmove|0px|isQueueStopped|className|J_UUID|getAbsoluteURL|String|expandImageStage|getBoundingClientRect|points|display|getPrimaryTouch|hintRuns|enable|loadingBox|onerror|onTouchMove|mouseup|apply|to|number||maxHeight|mousemove|mousedown|Object|temporary|set||pointerEnabled|jGetScroll|thumb|gecko|join|originalTitle|shift|selected|primaryImage|wunits|setupZoom|setCurNode|href|getNode|expandMaxHeight|opera|resize|getButton|render|uaVersion|title|MagicJS|found|wrapper|hunits|filters|cache|ios|callback|alternate|padding|expandedViewId|showLoading|overflow|currentSrc|trigger|_handlers|200|oncomplete|isPrimary|mouseover|TouchEvent|lazyZoom|getClientXY|cycles|replaceChild|touchmovement|expandMaxWidth|activepoints|cssTransformProp|normalSize|onready|easeFn|navControlsLayer|continuous|onComplete||fromCharCode||||tooltip|originalImage|toUpperCase|android|svg|jGetRect|minimum|Options|onClick|end|timedout|doc|tm|reflowZoom|hover|threshold|slice|_cleanup|msPointerEnabled|parseCubicBezier|crMz|getRelated|originalImgSrc|loadSmall|_timer|index|getPrev|splice|deltaY|zoomCaption|getNext|stubNode|_unbind|readyState|getPrimaryTouchId|androidBrowser|complete|open|onExpand|setProps|toString|on|horizontal|byTag|scrollLeft|object|Transition|reset|registerDeactivateEvent|registerActivateEvent|magiczoom|fade|scrollTop|deactivating|createElement||mobileZoomHint|continue|split||||keyCode|||400|cssPrefix|mouseout|itemCSS|jGetPosition|storage|getInnerSize|setOrientation|cssFilters|fromJSON|onClose|margin|fallback|typeof|_EVENTS_|eventType|perspective|naturalWidth|getStorage|exists|runtime|callee|charAt|tagName|sqrt|createElementNS|textExpandHint|compatMode|createTextNode|forEach|dashize|normalizeCSS|startAttempts|setVariables|exitFullscreen|reflow|win|Message|isNaN|touchScreen|relatedTarget|dblclick|_bind|xhr|J_EUID|nextImage|handleMouseUp|_event_prefix_|PFX|linear|cancelAnimationFrame|implement|fromString|status|pStyles_arr|Opacity|XMLHttpRequest|btnclickEvent|onprogress|forceAnimation|loopBind|createEvent|||||||||||||||||||hideTimer|||||pStyles|started|translate|MSPointerMove|mzId|hasChild|forceTouch|gallery|textClickZoomHint|parseNode|capable|setActiveThumb|text|view|safari|registerAnimateEvent|cssTransform|175|getElementsByTagName|byClass|keyboardCallback|domready|SVGImage|openLink|toggleNavButtons|dragend|MagicZoomPlus|0s|unregisterDeactivateEvent|setMode|unregisterActivateEvent|MagicZoom|600|HTMLElement|autostart|getElementsByClassName|thumbs|handleMouseDown|errorEventName|or||changeEventName|selectorTrigger|assign|ignore||presto|resizeTimer|prepareExpandedView|deltaMode|loadImg|ImageLoader|05|opr|picture|dispatchEvent|abort|imageByOrigin|onZoomIn|Za|loadedBytes|appendChild|onabort|query|Pltm|querySelectorAll|srcset|cubicBezierAtTime|getRatio|styles_arr|101|stopAnimation|hideFX|ifndef|swipe|cycle|Tooltip|keydown|el_arr|Alpha|expandToWindow|Function|jRaiseEvent|calc|priority|controls|_event_del_|cloneNode|removeChild|run|500|hideHint|300|onclick|selectorsMoveFX|once|scrollFX|045|caller|885|isMouse|maximum|org|w3|www||http|1000|cssDomPrefix|expandedView|startTime|_event_add_|deltaX|mgctlbx|startTimer|html|onZoomReady|aspectRatio||hintMessage|inline|mzCrA|rel|span|textHoverZoomHint|uuid|loadZoom|getTarget|onHistoryStateChange|zoomPosition|onBeforeRender|J_EXT|onEnter|Date|request|onResize|0001|10000px|delay|https|onExit|000001|jClearEvents|hideLoading|startSpace|querySelector|pointerout|animation|onZoomOut|onswipe|355|setupContent|popstate|Bottom|jHasClass|Top|finishTime|jSetOpacity|items|735|parseSchema|toArray|progid|loop|styleFloat|fps|DXImageTransform|onUpdate|closeOnClickOutside|onStart|getComputedStyle|320|mozCancelAnimationFrame|setupSelectors|wrap|Left|RegExp||filterBlur|interval|DocumentTouch|stopImmediatePropagation|stdDeviation|Right|naturalHeight|getOriginalTarget|||loadOptions|unregisterEvents|webkit419|elasticIn|figcaption|easeOutBack|out|easeInBack|165|easeOutCubic|easeInCubic|easeOutQuad|clientWidth|easeInQuad|easeOutExpo|onAfterRender|euid|easeInExpo|hone|easeOutSine|getElementById|easeInSine|compareDocumentPosition|onExpandClose|shown|upscale|mouse|UIEvent|0ms|transitionEffect|registerEvents|Microsoft|Number|registerCallback|changeZoomLevel|backcompat|variableZoom|setMessage|which|MouseEvent|MSPointerUp|MSPointerDown|999|bounceIn|selectItem|setCaption|offsetWidth|onExpandOpen||03|clear|MSPointerOut|destroyExpandGallery||location|hash|UUID|od|jToBool|zoomHeight|item|imageByIndex|10000|documentMode|backCompat|screen|mac|pinchend|setInterval|pinchresize|gif|pinchmove|deleteRule|rt|block|base64|progressiveLoad|R0lGODlhAQABAAD|ACwAAAAAAQABAAACADs|ua|ver|setupButtons|stylesId|100000|screenY|screenX|10px|unregisterAnimateEvent|initDrag|preventDefault|backward|wheelDeltaX|getContext|insertRule|getJSON|touchOptions|ts|wheelDelta|get|detail|300ms|deg|Webkit|pinchToZoom|firefox|enclose|rightClick|crios|cssText|sheet|cloned|styleSheet||Moz|moz|removeRule|matchMedia|device|magicJS|nativize|loadBlob|phone|color|with|getTime|setupExpandGallery|2147483647|clearInterval|100vh|cancel|onreadystatechange|background|895|msExitFullscreen|v5|mjs|685|zoomWidth|isReady|all|PI|wheelDeltaY|cos|smoothing|addItem|selector|xhr2|cancelFullScreen|charCodeAt|jDefer|fontWeight|multibackground|stage|error|cancelBubble|stopPropagation|dragmove|767px|scrollbarsWidth|imageByURL|lineHeight|onxhrerror|304|requestFullScreen|zIndex|date|Click|fullscreen|onchange|textnode|handleMouseMove|moveBind|addEventListener|sort|fullscreenEnabled|msFullscreenEnabled|webos|air|4xxx|collection|KeyboardEvent|KeyEvent|regexp|Map|startScale|head|cssRules|addRule|rules|removeCSS|generateUUID|xxxxxxxx|xxxx|detachEvent|createEventObject|edge|fireEvent|evaluate|420|doScroll|xpath|DOMContentLoaded|userAgent|xxxxxxxxxxxx|toFloat|jToInt|map|4294967296|getHashCode|xy|yxxx|oCancelFullScreen|attachEvent|iemobile|os|palm|WebKitTransitionEvent|ob|netfront|webkitTransitionEnd|mmp|midp|maemo|536|lge|kindle|iris|hiptop|ixi|Down|Up|Move|Over|Out|pointer|MSPointer|fullscreenElement|FullscreenElement|webkitIsFullScreen|fennec|FullScreen|requestFullscreen|RequestFullscreen|TransitionEvent|re|ExitFullscreen|xda|linux|other|unknown|taintEnabled|WebKitPoint|mozInnerScreenY|mozRequestAnimationFrame|webkitRequestAnimationFrame|oRequestAnimationFrame|msRequestAnimationFrame|getBoxObjectFor|ActiveXObject|oCancelAnimationFrame|xiino|msCancelAnimationFrame|plucker|webkitCancelRequestAnimationFrame|windows|wap|vodafone|up|9999|treo|red|symbian|series|psp|2px|cssfilters|pocket|RequestFullScreen|elaine|removeEventListener|webkitexitFullscreen|jGetFullScroll|clientTop|clientLeft|offsetLeft|offsetTop|offsetParent|innerHTML||||innerText|childNodes|webkitCancelFullScreen|insertBefore|jGetStyle|jSetStyle|iframe||offsetHeight||DOMElement|presto925|clientHeight|pageXOffset|pageYOffset|jGetFullSize|scrollWidth|scrollHeight|returnValue|srcElement|pointerover|MSPointerOver|fromElement|toElement|mozCancelFullScreen|msCancelFullScreen|CancelFullScreen|maxTouchPoints|MSFullscreenChange|fullscreenchange|compal|blazer|blackberry|bada|avantgo|MSFullscreenError|meego|msMaxTouchPoints|fullscreenerror|prefix|activeElement|Width|ontouchstart|jGetTransitionDuration|float|cssFloat|Image|feature|currentStyle|SVG11|TR|hasFeature|implementation|jToggleClass|jGetStyles|withCredentials|FormData|ProgressEvent|getPropertyValue|v3|MZ|zoomDistance|feGaussianBlur|SourceGraphic|units|sides|ul|_self|TypeError|Cannot|convert|Hover|xlink|textBtnNext|Next|textBtnPrev|Previous|textBtnClose|Close|Tap|Touch|Double|devicePixelRatio|setAttributeNS|1999|mgctlbxV|MagicToolboxTooltip|expoOut|quadIn|quadOut|cubicIn|cubicOut|backIn|backOut|elasticOut|bounceOut|MessageBox|2000|5000|NEGATIVE_INFINITY|JSON|parse|Incorrect|definition|of|the|parameter|isset|mgctlbxN|mgctlbxL|sineOut|220|160|350|pushState|message|loading|replaceState|120|01|isFinite|030|opening|260|delta|pop|201|thumbnails|nav|btn|forward|createDocumentFragment|100ms|relative|256|mgctlbxP|rev|z0|9_|scrollTo|availWidth|availHeight|250|before|radius|back|selectstart|dummy|MobileOptions|PICTURE|contextmenu|fontSize|fontFamily|sans|serif|textAlign|2em|font|expoIn|POSITIVE_INFINITY|sineIn|Plus|setTransition|curFrame|matches|745|715|575|565|easeInOutSine|085|normal|easeInOutQuad|455|515|955|055|675|215|easeInOutCubic|645|roundCss|infinite|easeOutQuart|lengthComputable|deltaZ|deltaFactor|fixed||000244140625|onwheel|wheel|mousewheel|URL|webkitURL|total|destroy|static|progress||response|537|createObjectURL|GET|responseType|blob|send|easeInQuart|445|easeInOutQuart|switchTo|easeInOutQuint|07|zoomIn|795|035|easeInOutExpo|easeInCirc|04|easeOutCirc|easeOutQuint|075|easeInOutCirc|785|135|refresh|275|easeInOutBack|265|zoomOut|335|06|755|easeInQuint|running|855'.split('|'),0,{}))

// Global outside click: bind once, independently of refreshed Quickview elements.
$(document).mouseup(function(e) {
    var container = $(".eg-dropdown").not(".cat-facet");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        container.removeClass("isOpen");
    }
});

$(document).on( "click", ".linkabso", function() {
   eGuardians.apiservice.get($(this).data('href')+'','',function(response){
       $('.modal-cross .modal-body').html(response);
       
       MagicZoom.start();
       $('.modal-cross').modal();
       setTimeout(function(){ eGuardians.events.bindEvents('.modal-cross [data-eg-event]'); }, 10);    
   },'html')
   return false;
});
    
//Get the button:
mybutton = document.getElementById("totop");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 2000 || document.documentElement.scrollTop > 2000) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}
// Gutschein/NL Pop-UP
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

        // Popup erst nach 3 Sekunden zeigen
        setTimeout(() => {
          modal.classList.remove('smm-hidden'); 
          modal.setAttribute('aria-hidden','false');
        }, 2000);

        document.getElementById('smm-b2b').addEventListener('click',()=>{
          setCookie(COOKIE, 'b2b', DAYS, '.outlet46.de');
          modal.remove();
        });
        document.getElementById('smm-b2c').addEventListener('click',()=>{
          location.href = URL_B2C;
        });

        modal.addEventListener('click',(e)=>{ if(e.target===modal) modal.remove(); });
        document.addEventListener('keydown',(e)=>{ if(e.key==='Escape') modal.remove(); },{once:true});
      }
    }

})();
// Matrix-EAN-BESTAND Feature
(function () {
  // === SETTINGS ===
  var STOCK_CAP = 200;                  // Anzeige + Kauf/Clamp Maximum
  var FETCH_TIMEOUT_MS = 6000;          // Ausfallsicher: wenn API hängt (Batch + Fallback)
  var CONCURRENCY = 6;                  // nur für Fallback-Einzelcalls bei Varianten-Daten

  // Add-to-basket: EIN Batch-POST statt mehrere Einzel-POSTs
  var ADD_TIMEOUT_MS = 90000;           // max. Wartezeit auf den Batch-Add
  var BASKET_BATCH_ENDPOINT = "/rest/io/basket/items/";

  // Vorprüfung + Fehlerfall-Absicherung
  var BASKET_GET_TIMEOUT_MS = 12000;
  var FINAL_CHECK_GRACE_MS = 500;
  var FINAL_RETRY_GRACE_MS = 700;

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
      add_verify: "Prüfe Warenkorb...Bitte warten",
      add_fix: "Ergänze fehlende Mengen...Bitte warten",
      added_ok: "Hinzugefügt ✓",
      added_partial: "Teilweise erledigt – bitte prüfen",
      not_addable: "Nicht verfügbar",
      err_retry: "Fehler – bitte neu",
      err_add_fallback: "Fehler beim Hinzufügen.",
      err_stock: "Die gewünschte Menge konnte nicht vollständig hinzugefügt werden. Bitte Bestand prüfen.",
      info_some_limited: "Einige Mengen wurden an Bestand/Maximalmenge angepasst.",
      info_nothing_addable: "Nichts hinzugefügt – die gewünschte Menge ist bereits im Warenkorb oder aktuell nicht verfügbar."
    },
    en: {
      add_start: "Adding...Please wait",
      add_verify: "Checking basket...Please wait",
      add_fix: "Adding missing quantities...Please wait",
      added_ok: "Added ✓",
      added_partial: "Partially done – please check",
      not_addable: "Not available",
      err_retry: "Error – try again",
      err_add_fallback: "Error adding item.",
      err_stock: "The requested quantity could not be added completely. Please check stock.",
      info_some_limited: "Some quantities were adjusted to stock/order limits.",
      info_nothing_addable: "Nothing added – the requested quantity is already in the basket or currently unavailable."
    },
    fr: {
      add_start: "Ajout en cours...Veuillez patienter",
      add_verify: "Vérification du panier...Veuillez patienter",
      add_fix: "Ajout des quantités manquantes...Veuillez patienter",
      added_ok: "Ajouté ✓",
      added_partial: "Partiellement terminé – veuillez vérifier",
      not_addable: "Indisponible",
      err_retry: "Erreur – réessayer",
      err_add_fallback: "Erreur lors de l'ajout.",
      err_stock: "La quantité demandée n’a pas pu être ajoutée entièrement. Veuillez vérifier le stock.",
      info_some_limited: "Certaines quantités ont été ajustées selon le stock/les limites.",
      info_nothing_addable: "Rien n’a été ajouté – la quantité demandée est déjà dans le panier ou indisponible."
    },
    it: {
      add_start: "Aggiunta in corso...attendere",
      add_verify: "Controllo carrello...attendere",
      add_fix: "Aggiunta quantità mancanti...attendere",
      added_ok: "Aggiunto ✓",
      added_partial: "Parzialmente fatto – controlla",
      not_addable: "Non disponibile",
      err_retry: "Errore – riprova",
      err_add_fallback: "Errore durante l'aggiunta.",
      err_stock: "La quantità richiesta non è stata aggiunta completamente. Controlla lo stock.",
      info_some_limited: "Alcune quantità sono state adattate a stock/limiti.",
      info_nothing_addable: "Niente aggiunto – la quantità richiesta è già nel carrello o non disponibile."
    },
    es: {
      add_start: "Añadiendo...Espere",
      add_verify: "Comprobando carrito...Espere",
      add_fix: "Añadiendo cantidades pendientes...Espere",
      added_ok: "Añadido ✓",
      added_partial: "Hecho parcialmente – comprueba",
      not_addable: "No disponible",
      err_retry: "Error – inténtalo de nuevo",
      err_add_fallback: "Error al añadir.",
      err_stock: "La cantidad solicitada no se pudo añadir completamente. Comprueba el stock.",
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
    maybeRefreshCurrencySymbol();
    n = (typeof n === "number" && isFinite(n)) ? n : 0;
    return EG_NUMBER_FORMAT.format(n) + " " + EG_CURRENCY_SYMBOL;
  }

  function toInt(v) {
    var n = parseInt(v, 10);
    return isFinite(n) ? n : 0;
  }

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function getVariationsJson(root) {
    root = root || document;

    var wrap = root.querySelector("[data-item-variation][data-eg-variations]");
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

      if (txt.indexOf("ean") !== -1) return code;
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

    variationIds = (variationIds || []).map(toInt).filter(Boolean);
    if (!variationIds.length) return cb();

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

    var key = missingIds.join(",");

    if (vBatchInflight[key]) {
      vBatchInflight[key].callbacks.push(cb);
      return;
    }

    vBatchInflight[key] = {
      callbacks: [cb],
      timer: null
    };

    if (!window.eGuardians || !eGuardians.apiservice || !eGuardians.apiservice.get) {
      var list0 = vBatchInflight[key].callbacks || [];
      delete vBatchInflight[key];

      for (var k0 = 0; k0 < list0.length; k0++) list0[k0]();
      return;
    }

    vBatchInflight[key].timer = setTimeout(function () {
      if (!vBatchInflight[key]) return;

      var listT = vBatchInflight[key].callbacks || [];
      delete vBatchInflight[key];

      for (var kT = 0; kT < listT.length; kT++) listT[kT]();
    }, FETCH_TIMEOUT_MS);

    eGuardians.apiservice.get("/rest/io/variations/batch", { ids: key }, function (response) {
      if (!vBatchInflight[key]) return;

      clearTimeout(vBatchInflight[key].timer);

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

      var list = vBatchInflight[key].callbacks || [];
      delete vBatchInflight[key];

      for (var x = 0; x < list.length; x++) list[x]();
    });
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

    var finished = false;

    var timer = setTimeout(function () {
      if (finished) return;

      finished = true;
      vCache[variationId] = null;

      var listT = vInflight[variationId] || [];
      delete vInflight[variationId];

      for (var kT = 0; kT < listT.length; kT++) listT[kT](null);
    }, FETCH_TIMEOUT_MS);

    var params = {
      template: encodeURI("Ceres::Item.SingleItem")
    };

    eGuardians.apiservice.get("/rest/io/variations/" + variationId, params, function (response) {
      if (finished) return;

      finished = true;
      clearTimeout(timer);

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
    });
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
  function renderHeaderBasketFromValues(quantity, itemSum) {
    var qty = toInt(quantity);
    var sumNum = parseFloat(itemSum || 0);
    if (!isFinite(sumNum)) sumNum = 0;

    var formattedSum = sumNum.toFixed(2).replace(".", ",");

    var $jq = window.jQuery || window.$;

    if ($jq) {
      var $basketQty = $jq("[data-eg-basket-quantity]");
      var $basketSum = $jq("[data-basket-sum]");

      if ($basketQty.length) {
        $basketQty.attr("data-eg-basket-quantity", qty).html(qty);
      }

      if ($basketSum.length) {
        $basketSum.html(formattedSum);
      }
    } else {
      var qtyEls = document.querySelectorAll("[data-eg-basket-quantity]");
      var sumEls = document.querySelectorAll("[data-basket-sum]");

      for (var qi = 0; qi < qtyEls.length; qi++) {
        qtyEls[qi].setAttribute("data-eg-basket-quantity", String(qty));
        qtyEls[qi].innerHTML = String(qty);
      }

      for (var si = 0; si < sumEls.length; si++) {
        sumEls[si].innerHTML = formattedSum;
      }
    }
  }

  function renderHeaderBasketFromBasket(basket) {
    if (!basket) return;

    var qty = basket.itemQuantity != null ? basket.itemQuantity : 0;
    var sum = basket.itemSum != null ? basket.itemSum : 0;

    renderHeaderBasketFromValues(qty, sum);

    try {
      if (basket.itemWishListIds && basket.itemWishListIds.length > 0) {
        var wl = document.querySelector(".wishlist-link");
        if (wl) wl.classList.remove("noWishListItems");
      }
    } catch (e) {}
  }

  function writeBasketCacheFromBasket(basket) {
    if (!basket) return;

    try {
      var cacheKeyPrefix = "basketCache_";

      Object.keys(localStorage).forEach(function (key) {
        if (key.indexOf(cacheKeyPrefix) === 0) {
          localStorage.removeItem(key);
        }
      });

      var lang = document.documentElement.getAttribute("lang") || "de";
      var currency = basket.currency || "EUR";
      var shippingCountryId = basket.shippingCountryId || 1;
      var customerId = basket.customerId > 0 ? basket.customerId : "guest";
      var dynamicCacheKey = lang + "_" + currency + "_" + shippingCountryId + "_" + customerId;

      window.egSessionData = {
        basket: {
          itemQuantity: basket.itemQuantity,
          itemSum: basket.itemSum,
          currency: basket.currency,
          itemWishListIds: basket.itemWishListIds,
          shippingCountryId: basket.shippingCountryId,
          customerId: basket.customerId
        }
      };

      localStorage.setItem("basketCache_" + dynamicCacheKey, JSON.stringify({
        timestamp: Date.now(),
        data: {
          basket: window.egSessionData.basket
        }
      }));
    } catch (e) {}
  }

  function updateBasketUiFromBasketItems(items) {
    if (!items || !items.length) return;

    var totalQty = 0;
    var totalSum = 0;

    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (!it) continue;

      var q = toInt(it.quantity);
      var p = parseFloat(it.price || 0);
      if (!isFinite(p)) p = 0;

      totalQty += q;
      totalSum += q * p;
    }

    renderHeaderBasketFromValues(totalQty, totalSum);
  }

  function extractBasketFromSessionResponse(response) {
    try {
      if (response && response.data && response.data.basket) return response.data.basket;
      if (response && response.basket) return response.basket;
      if (response && response.data && response.data.data && response.data.data.basket) return response.data.data.basket;
    } catch (e) {}

    return null;
  }

  function updateBasketUiFromResponse(response) {
    try {
      var basket = response && response.events && response.events.AfterBasketChanged && response.events.AfterBasketChanged.basket;

      if (basket) {
        renderHeaderBasketFromBasket(basket);
        writeBasketCacheFromBasket(basket);
        return;
      }

      basket = extractBasketFromSessionResponse(response);

      if (basket) {
        renderHeaderBasketFromBasket(basket);
        writeBasketCacheFromBasket(basket);
        return;
      }

      if (response && response.data && Array.isArray(response.data)) {
        updateBasketUiFromBasketItems(response.data);
      }
    } catch (e) {}
  }

  function refreshBasketHeaderFromSession() {
    return new Promise(function (resolve) {
      var searchParams = {
        _: Math.floor(Date.now() / 1000)
      };

      try {
        var appDataEl = document.getElementById("app-data-custom");
        if (appDataEl && appDataEl.textContent) {
          var templateData = JSON.parse(appDataEl.textContent);
          if (templateData && templateData.templateType) {
            searchParams.templateType = templateData.templateType;
          }
        }
      } catch (e0) {}

      function finish(response) {
        try {
          var basket = extractBasketFromSessionResponse(response);

          if (basket) {
            renderHeaderBasketFromBasket(basket);
            writeBasketCacheFromBasket(basket);
          }
        } catch (e1) {}

        resolve(response || null);
      }

      try {
        if (window.eGuardians && eGuardians.apiservice && typeof eGuardians.apiservice.get === "function") {
          eGuardians.apiservice.get("/rest/io/session/", searchParams, function (response) {
            finish(response);
          });
          return;
        }

        if (window.fetch) {
          var qs = "?_=" + encodeURIComponent(String(searchParams._));

          if (searchParams.templateType) {
            qs += "&templateType=" + encodeURIComponent(String(searchParams.templateType));
          }

          fetch("/rest/io/session/" + qs, {
            credentials: "same-origin"
          })
            .then(function (r) {
              if (!r || !r.ok) throw new Error("session_http_" + (r ? r.status : "0"));
              return r.json();
            })
            .then(function (json) {
              finish(json);
            })
            .catch(function () {
              resolve(null);
            });

          return;
        }
      } catch (e2) {}

      resolve(null);
    });
  }

  function extractAddErrorCode(response) {
    try {
      if (response && response.data && response.data.exceptionCode) return String(response.data.exceptionCode);
      if (response && response.exceptionCode) return String(response.exceptionCode);
      if (response && response.data && response.data.code) return String(response.data.code);
      if (response && response.status && toInt(response.status) >= 400) return String(response.status);
      if (response && response.isError) return "add_failed";
    } catch (e) {}

    return "";
  }

  function addItemsToBasketBatch(items, insertSelector, opts) {
    insertSelector = insertSelector || "[data-eg-size-matrix]";
    opts = opts || {};

    return new Promise(function (resolve, reject) {
      if (!items || !items.length) return resolve(null);

      if (!window.eGuardians || !eGuardians.apiservice || !eGuardians.apiservice.post) {
        return reject(new Error("eGuardians.apiservice.post fehlt"));
      }

      var basketItems = [];

      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (!it) continue;

        var vid = toInt(it.variationId);
        var qty = toInt(it.quantity);

        if (!vid || qty <= 0) continue;

        basketItems.push({
          variationId: vid,
          quantity: qty
        });
      }

      if (!basketItems.length) return resolve(null);

      var payload = {
        basketItems: basketItems
      };

      var done = false;

      var timer = setTimeout(function () {
        if (done) return;
        done = true;

        var errT = new Error("EG_BATCH_TIMEOUT");
        errT._egCode = "EG_BATCH_TIMEOUT";
        errT._egResponse = null;
        reject(errT);
      }, ADD_TIMEOUT_MS);

      try {
        eGuardians.apiservice.post(BASKET_BATCH_ENDPOINT, payload, function (response) {
          if (done) return;

          done = true;
          clearTimeout(timer);

          var code = extractAddErrorCode(response);

          if (code) {
            var err = new Error(code);
            err._egCode = code;
            err._egResponse = response;

            if (!opts.silent) {
              showErrorToast(
                (window.messageServiceTranslations && messageServiceTranslations[code]) || t("err_add_fallback"),
                insertSelector
              );
            }

            return reject(err);
          }

          resolve(response);
        });
      } catch (e) {
        if (done) return;

        done = true;
        clearTimeout(timer);

        try {
          e._egCode = e && e.message ? String(e.message) : "add_failed";
        } catch (e2) {}

        reject(e);
      }
    });
  }

  // === BASKET SNAPSHOT / DELTA CHECK ===
  function normalizeBasketItems(resp) {
    try {
      if (resp && Array.isArray(resp.data)) return resp.data;
      if (resp && resp.data && Array.isArray(resp.data.data)) return resp.data.data;
      if (resp && resp.data && Array.isArray(resp.data)) return resp.data;
      if (resp && Array.isArray(resp)) return resp;
    } catch (e) {}

    return [];
  }

  function sumBasketByVariation(itemsArr) {
    var map = {};

    for (var i = 0; i < (itemsArr || []).length; i++) {
      var it = itemsArr[i];
      if (!it) continue;

      var vid = null;

      if (it.variationId != null) {
        vid = toInt(it.variationId);
      }

      if (!vid && it.variation && it.variation.data && it.variation.data.variation && it.variation.data.variation.id != null) {
        vid = toInt(it.variation.data.variation.id);
      }

      if (!vid) continue;

      var q = it.quantity != null ? toInt(it.quantity) : 0;
      if (!isFinite(q) || q < 0) q = 0;

      var key = String(vid);
      map[key] = (map[key] || 0) + q;
    }

    return map;
  }

  function getBasketSnapshot(timeoutMs) {
    timeoutMs = toInt(timeoutMs) || BASKET_GET_TIMEOUT_MS;

    return new Promise(function (resolve, reject) {
      var done = false;

      var timer = setTimeout(function () {
        if (done) return;
        done = true;
        reject(new Error("BASKET_TIMEOUT"));
      }, timeoutMs);

      function finish(raw) {
        if (done) return;
        done = true;
        clearTimeout(timer);

        var arr = normalizeBasketItems(raw);

        resolve({
          raw: raw,
          items: arr,
          qtyMap: sumBasketByVariation(arr)
        });
      }

      try {
        if (window.eGuardians && eGuardians.apiservice && eGuardians.apiservice.get) {
          eGuardians.apiservice.get(BASKET_BATCH_ENDPOINT, {}, function (response) {
            try {
              finish(response && response.data ? response.data : response);
            } catch (e0) {
              reject(e0);
            }
          });
          return;
        }

        if (window.fetch) {
          fetch(BASKET_BATCH_ENDPOINT, { credentials: "same-origin" })
            .then(function (r) {
              if (!r || !r.ok) throw new Error(String(r ? r.status : "basket_http"));
              return r.json();
            })
            .then(function (json) {
              finish(json);
            })
            .catch(function (err) {
              if (done) return;
              done = true;
              clearTimeout(timer);
              reject(err);
            });
          return;
        }

        reject(new Error("basket_get_missing"));
      } catch (e) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        reject(e);
      }
    });
  }

  function buildWantedMap(items) {
    var map = {};

    for (var i = 0; i < (items || []).length; i++) {
      var it = items[i];
      if (!it) continue;

      var vid = String(toInt(it.variationId));
      var qty = toInt(it.quantity);

      if (!vid || vid === "0" || qty <= 0) continue;

      map[vid] = (map[vid] || 0) + qty;
    }

    return map;
  }

  function computeDeltaResult(beforeQtyMap, afterQtyMap, wantedMap) {
    beforeQtyMap = beforeQtyMap || {};
    afterQtyMap = afterQtyMap || {};
    wantedMap = wantedMap || {};

    var missing = [];
    var okMap = {};
    var okCount = 0;
    var totalCount = 0;

    for (var vid in wantedMap) {
      if (!Object.prototype.hasOwnProperty.call(wantedMap, vid)) continue;

      var wanted = toInt(wantedMap[vid]);
      if (!wanted || wanted <= 0) continue;

      totalCount++;

      var before = toInt(beforeQtyMap[vid] || 0);
      var after = toInt(afterQtyMap[vid] || 0);
      var delta = after - before;

      if (!isFinite(delta) || delta < 0) delta = 0;

      if (delta >= wanted) {
        okMap[String(vid)] = true;
        okCount++;
      } else {
        var miss = wanted - delta;
        if (miss > 0) {
          missing.push({
            variationId: String(vid),
            quantity: miss
          });
        }
      }
    }

    return {
      missing: missing,
      okMap: okMap,
      okCount: okCount,
      totalCount: totalCount
    };
  }

  function applyResultToInputs(matrix, wantedMap, result) {
    if (!matrix || !wantedMap || !result) return;

    var missingMap = {};
    var missing = result.missing || [];

    for (var i = 0; i < missing.length; i++) {
      missingMap[String(missing[i].variationId)] = toInt(missing[i].quantity);
    }

    for (var vid in wantedMap) {
      if (!Object.prototype.hasOwnProperty.call(wantedMap, vid)) continue;

      if (result.okMap && result.okMap[String(vid)]) {
        setQtyByVariationId(matrix, vid, 0);
      } else if (missingMap[String(vid)] != null) {
        setQtyByVariationId(matrix, vid, missingMap[String(vid)]);
      }
    }
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
  function initMatrix(matrix, variations) {
    if (matrix) initMatrixHeadingLabels(matrix);
    if (!matrix || matrix.getAttribute("data-eg-matrix-initialized") === "1") return;

    matrix.setAttribute("data-eg-matrix-initialized", "1");

    var rows = buildRows(matrix, variations);

    var ids = [];

    for (var i = 0; i < rows.length; i++) {
      var vid = toInt(rows[i].getAttribute("data-eg-variation-id"));
      if (vid) ids.push(vid);
    }

    fetchVariationsBatch(ids, function () {
      var tasks = [];

      for (var r = 0; r < rows.length; r++) {
        (function (row) {
          var vid2 = toInt(row.getAttribute("data-eg-variation-id"));
          var priceEl2 = row._egPriceEl;
          var eanEl2 = row._egEanEl;

          function apply(v2) {
            if (!v2) {
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
                apply(vx);
                done();
              });
            });
          } else {
            apply(null);
          }
        })(rows[r]);
      }

      if (!tasks.length) {
        recalcMatrixTotals(matrix);

        var firstRow2 = matrix.querySelector(".eg-row");
        if (firstRow2) setActiveRow(matrix, firstRow2);

        return;
      }

      runQueue(tasks, CONCURRENCY, function () {
        recalcMatrixTotals(matrix);

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
      if (!btn) return;

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

      btn.disabled = true;
      btn.setAttribute("aria-busy", "true");
      btn.setAttribute("data-eg-busy", "1");
      btn.textContent = t("add_start");

      (async function () {
        var snapBefore = null;
        var wantedMap = null;
        var hadAdjustments = false;

        try {
          try {
            snapBefore = await getBasketSnapshot(BASKET_GET_TIMEOUT_MS);
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

          wantedMap = buildWantedMap(items);

          // Normalfall: genau EIN Batch-POST.
          var response = await addItemsToBasketBatch(items, "[data-eg-size-matrix]", { silent: true });

          updateBasketUiFromResponse(response);
          await refreshBasketHeaderFromSession();

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
          console.error(err);

          // Fehlerfall: nicht blind nochmal alles senden.
          // Wenn Snapshot vorhanden ist, prüfen wir Delta und senden nur fehlende Mengen 1x nach.
          if (!snapBefore || !wantedMap) {
            showErrorToast(t("err_stock"), "[data-eg-size-matrix]");
            btn.textContent = t("err_retry");

            setTimeout(function () {
              btn.textContent = baseText;
              btn.disabled = false;
              btn.removeAttribute("aria-busy");
              btn.removeAttribute("data-eg-busy");
            }, 1500);

            return;
          }

          btn.textContent = t("add_verify");
          await sleep(FINAL_CHECK_GRACE_MS);

          var snapAfterFirst = null;

          try {
            snapAfterFirst = await getBasketSnapshot(BASKET_GET_TIMEOUT_MS);
          } catch (eAfterFirst) {
            snapAfterFirst = null;
          }

          if (!snapAfterFirst) {
            showErrorToast(t("err_stock"), "[data-eg-size-matrix]");
            btn.textContent = t("err_retry");

            setTimeout(function () {
              btn.textContent = baseText;
              btn.disabled = false;
              btn.removeAttribute("aria-busy");
              btn.removeAttribute("data-eg-busy");
            }, 1500);

            return;
          }

          var resultFirst = computeDeltaResult(
            (snapBefore && snapBefore.qtyMap) || {},
            (snapAfterFirst && snapAfterFirst.qtyMap) || {},
            wantedMap
          );

          if (!resultFirst.missing || !resultFirst.missing.length) {
            applyResultToInputs(matrix, wantedMap, resultFirst);
            recalcMatrixTotals(matrix);

            await refreshBasketHeaderFromSession();

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
          }

          // Vor Recovery nochmal gegen den aktuellen Warenkorb pre-clampen.
          // Dadurch wird auch im Fehlerfall nicht blind zu viel nachgeschoben.
          var preRetry = preClampItemsAgainstBasket(resultFirst.missing, (snapAfterFirst && snapAfterFirst.qtyMap) || {}, matrix);
          var retryItems = preRetry.items || [];

          if (preRetry && (preRetry.adjusted > 0 || preRetry.blocked > 0)) {
            hadAdjustments = true;
          }

          recalcMatrixTotals(matrix);

          if (retryItems.length > 0) {
            btn.textContent = t("add_fix");

            try {
              await addItemsToBasketBatch(retryItems, "[data-eg-size-matrix]", { silent: true });
            } catch (eRetry) {
              console.error(eRetry);
            }

            await sleep(FINAL_RETRY_GRACE_MS);
          }

          var snapAfterRetry = null;

          try {
            snapAfterRetry = await getBasketSnapshot(BASKET_GET_TIMEOUT_MS);
          } catch (eAfterRetry) {
            snapAfterRetry = snapAfterFirst;
          }

          var resultFinal = computeDeltaResult(
            (snapBefore && snapBefore.qtyMap) || {},
            (snapAfterRetry && snapAfterRetry.qtyMap) || {},
            wantedMap
          );

          applyResultToInputs(matrix, wantedMap, resultFinal);
          recalcMatrixTotals(matrix);

          if (resultFinal.okCount > 0) {
            await refreshBasketHeaderFromSession();
          }

          var somethingAdded = resultFinal.okCount > 0;
          var everythingAdded = resultFinal.okCount >= resultFinal.totalCount && resultFinal.totalCount > 0;

          if (hadAdjustments) {
            showInfoToast(t("info_some_limited"), "[data-eg-size-matrix]", 1);
          }

          if (window.eGuardians && eGuardians.basket && typeof eGuardians.basket.openBasketPreviewSmall === "function" && somethingAdded) {
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

          if (everythingAdded) {
            btn.textContent = t("added_ok");
          } else {
            btn.textContent = t("added_partial");
            showErrorToast(t("err_stock"), "[data-eg-size-matrix]");
          }

          btn.disabled = false;
          btn.removeAttribute("aria-busy");
          btn.removeAttribute("data-eg-busy");
        }
      })();
    });
  }

  window.egInitSizeMatrices = function (root) {
    root = root || document;

    var variations = getVariationsJson(root) || getVariationsJson(document);
    if (!variations) return;

    var matrices = root.querySelectorAll("[data-eg-size-matrix]");
    if (!matrices || !matrices.length) return;

    for (var i = 0; i < matrices.length; i++) {
      initMatrix(matrices[i], variations);
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