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
    var view = O46Core.quickview;
    if (!view) {
        var modal = $('.modal-cross');
        var opener;
        view = O46Core.quickview = { phase: 'hidden', current: null, reads: Object.create(null) };
        view.apply = function () {
            // Bootstrap ignores show/hide during transitions. Reconcile only
            // after its public completion events, including backdrop cleanup.
            if (view.phase === 'opening' || view.phase === 'closing') return;
            var request = view.current;
            if (!request) {
                if (view.phase === 'shown') modal.modal('hide');
                return;
            }
            if (!request.html || request.rendered) return;
            request.rendered = true;
            opener = request.trigger;
            $('.modal-cross .modal-body').html(request.html);
            MagicZoom.start();
            modal.modal('show', opener);
            setTimeout(function () {
                if (view.current === request) eGuardians.events.bindEvents('.modal-cross [data-eg-event]');
            }, request.bindDelay);
        };
        function cancel() { view.current = null; }
        modal.on('show.bs.modal.o46Quickview', function () { view.phase = 'opening'; })
            .on('shown.bs.modal.o46Quickview', function () { view.phase = 'shown'; view.apply(); })
            .on('hide.bs.modal.o46Quickview', function () { view.phase = 'closing'; cancel(); })
            .on('hidden.bs.modal.o46Quickview', function () {
                view.phase = 'hidden';
                if (!view.current && opener && opener.isConnected &&
                    (document.activeElement === document.body || this.contains(document.activeElement))) {
                    opener.focus({ preventScroll: true });
                }
                opener = null;
                view.apply();
            })
            // A dismiss click during opening is ignored by Bootstrap too.
            // Remember it even when no hide event is emitted; shown will hide.
            .on('click.o46Quickview', '[data-dismiss="modal"]', cancel)
            .on('click.o46Quickview', function (event) {
                if (event.target === this && view.phase === 'opening') cancel();
            });
        $(document).on('keydown.o46Quickview', function (event) {
            if (event.which === 27 && (view.phase === 'opening' || view.phase === 'hidden')) cancel();
        });
    }
    var url = new URL($(trigger).data('href'), window.location.href);
    url.searchParams.set('quickViewItem', 'true');
    if (view.current && view.current.url === url.href) return false;
    var request = view.current = { url: url.href, bindDelay: bindDelay, trigger: trigger };
    // Share only in-flight reads, including a close/reopen before the response.
    // Completed HTML is not cached across openings or language changes.
    var html = view.reads[url.href];
    if (!html) {
        html = view.reads[url.href] = new Promise(function (resolve, reject) {
            // Backend-rendered HTML gets the same budget as the variation batch.
            // Ready assets must not leave a stalled read waiting indefinitely.
            eGuardians.apiservice.get(url.href, '', function (response) {
                if (typeof response === 'string' && response.trim()) resolve(response);
                else reject(new Error('Quickview response is empty or invalid'));
            }, 'html', 30000);
        });
        var forget = function () { delete view.reads[url.href]; };
        html.then(forget, forget);
    }
    // Fetch HTML and both product modules concurrently. The existing matrix
    // observer must be installed before the Quickview markup is inserted.
    Promise.all([html, O46Core.ensureMagicZoom(), O46Core.ensureMatrix()]).then(function (results) {
        if (view.current !== request) return;
        request.html = results[0];
        view.apply();
    }).catch(function (error) {
        if (view.current !== request) return;
        view.current = null;
        console.warn('Quickview unavailable; opening the product page.', error);
        // Keep the product reachable after a failed asset or HTML request.
        url.searchParams.delete('quickViewItem');
        window.location.assign(url.href);
    });
    return false;
};
