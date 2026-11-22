// Execute the shipped UI module with its request state and only the API/Bootstrap boundary stubbed.
const {parts} = require('../scripts/build-language-assets.cjs');
const {readAsset, eventsOwner, sharedModule} = require('./theme_assets.cjs');
function moduleCode(file) {
    const source = readAsset(file, 'utf8');
    const {modal, modalContent} = parts(source);
    const ui = sharedModule(file, 'ui') || 'eGuardians.ui.modal='+source.slice(modal.start, modal.end)+';';
    return `window.eGuardians={events:{bindEvents(){window.modalBindings=(window.modalBindings||0)+1}},ui:{},
        apiservice:{get(route,data,done){
            window.modalRequests=(window.modalRequests||0)+1;
            const timer=setTimeout(()=>done({data:window.modalFixture||'<a href="/">DE</a> <a href="/en/">EN</a> <a href="/fr/">FR</a> <a href="/it/">IT</a> <a href="/es/">ES</a>'},200),10);
            return {abort(){clearTimeout(timer)}};
        }}};
        $.fn.modal=function(){this.css('display','block');return this};
        ${ui}
        (function(${eventsOwner(source)}){eGuardians.events.modalContent=${source.slice(modalContent.start,modalContent.end)};})(eGuardians);`;
}
module.exports={moduleCode};
