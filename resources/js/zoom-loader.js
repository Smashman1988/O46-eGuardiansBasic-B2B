/* Gallery asset lifecycle shared by PDPs and Quickviews. Included in core.js by the build. */
O46Core.magicZoomUrl = O46Core.magicZoomUrl || (document.currentScript && document.currentScript.getAttribute('data-eg-magiczoom-src'));
O46Core.ensureMagicZoom = function () {
    if (O46Core.zoomPromise) return O46Core.zoomPromise;
    if (window.MagicZoom) return new Promise(function (resolve) {
        if (document.jAddEvent) document.jAddEvent('domready', function () { setTimeout(function () { resolve(window.MagicZoom); }, 0); }, 100);
        else resolve(window.MagicZoom);
    });
    O46Core.zoomPromise = new Promise(function (resolve, reject) {
        var script = document.querySelector('script[data-eg-magiczoom]');
        var created = !script;
        if (!script) {
            script = document.createElement('script');
            script.setAttribute('data-eg-magiczoom', '');
            script.src = O46Core.magicZoomUrl;
        }
        var timer;
        function finish(error) {
            clearTimeout(timer);
            script.removeEventListener('load', loaded);
            script.removeEventListener('error', failed);
            if (error) {
                script.remove();
                reject(error);
            } else resolve(window.MagicZoom);
        }
        function loaded() {
            if (!window.MagicZoom || !document.jAddEvent) return finish(new Error('MagicZoom did not initialize'));
            // The shipped vendor schedules its own domready initialization even
            // when loaded after window.load. Its script load event is too early.
            document.jAddEvent('domready', function () {
                setTimeout(function () { finish(null); }, 0);
            }, 100);
        }
        function failed() { finish(new Error('MagicZoom could not be loaded')); }
        script.addEventListener('load', loaded);
        script.addEventListener('error', failed);
        timer = setTimeout(failed, 15000);
        if (created) {
            if (!O46Core.magicZoomUrl) failed();
            else document.head.appendChild(script);
        }
    }).catch(function (error) {
        O46Core.zoomPromise = null; // A later interaction may retry a failed download.
        throw error;
    });
    return O46Core.zoomPromise;
};

O46Core.startInitialGallery = function () {
    // Stored content can contain a gallery outside a PDP. Keep that extension
    // boundary working without downloading zoom on pages that have no gallery.
    if (document.querySelector('script[data-eg-magiczoom]') || !document.querySelector('.MagicZoom, .MagicZoomPlus')) return;
    O46Core.ensureMagicZoom().catch(function (error) {
        // The original image link remains usable if the optional asset fails.
        console.warn('Gallery zoom unavailable; image links remain available.', error);
    });
};

O46Core.openQuickview = function (trigger, bindDelay) {
    var url = new URL($(trigger).data('href'), window.location.href);
    url.searchParams.set('quickViewItem', 'true');
    var sequence = O46Core.quickviewSequence = (O46Core.quickviewSequence || 0) + 1;
    var html = new Promise(function (resolve, reject) {
        eGuardians.apiservice.get(url.href, '', function (response) {
            if (typeof response === 'string' && response.trim()) resolve(response);
            else reject(new Error('Quickview response is empty or invalid'));
        }, 'html');
    });
    // Fetch the existing HTML and the zoom library concurrently. Insert only when
    // both are ready, so matrix observers never encounter a half-ready gallery.
    Promise.all([html, O46Core.ensureMagicZoom()]).then(function (results) {
        if (sequence !== O46Core.quickviewSequence) return;
        $('.modal-cross .modal-body').html(results[0]);
        MagicZoom.start();
        $('.modal-cross').modal();
        setTimeout(function () {
            if (sequence === O46Core.quickviewSequence) eGuardians.events.bindEvents('.modal-cross [data-eg-event]');
        }, bindDelay);
    }).catch(function (error) {
        if (sequence !== O46Core.quickviewSequence) return;
        console.warn('Quickview unavailable; opening the product page.', error);
        // Keep the product reachable after a failed asset or HTML request.
        url.searchParams.delete('quickViewItem');
        window.location.assign(url.href);
    });
    return false;
};
