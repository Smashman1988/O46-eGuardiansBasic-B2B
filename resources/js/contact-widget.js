(function () {
    'use strict';

    function initContactWidget() {
        var widget = document.getElementById('o46-b2b-contact-widget');
        if (!widget || widget.dataset.o46B2bContactReady === 'true') {
            return;
        }

        var toggle = widget.querySelector('.o46-b2b-contact-toggle');
        var panel = widget.querySelector('.o46-b2b-contact-panel');
        var close = widget.querySelector('.o46-b2b-contact-close');
        if (!toggle || !panel || !close) {
            return;
        }
        widget.dataset.o46B2bContactReady = 'true';

        var obstructed = false;
        function updateLauncher() {
            widget.classList.toggle('o46-b2b-contact-obstructed', panel.hidden && obstructed);
        }

        // Watch the launcher's actual footprint, including its translated label.
        // visibility:hidden preserves that footprint, so hiding cannot cause flicker.
        // IntersectionObserver also respects clipping inside the Quickview scroller.
        if (window.IntersectionObserver && window.ResizeObserver) {
            var mobile = window.matchMedia('(max-width: 991.98px)');
            var selector = '[data-eg-size-matrix], .basket-list-item';
            var targets = new Map();
            var intersection = null;
            var frame = 0;

            function updateObstruction() {
                obstructed = Array.from(targets.values()).some(Boolean);
                updateLauncher();
            }

            function observeTargets(root) {
                if (!intersection || root.nodeType !== 1) return;
                var elements = Array.from(root.querySelectorAll(selector));
                if (root.matches(selector)) elements.push(root);
                elements.forEach(function (element) {
                    if (!targets.has(element)) {
                        targets.set(element, false);
                        intersection.observe(element);
                    }
                });
            }

            var mutations = new MutationObserver(function (records) {
                records.forEach(function (record) {
                    record.addedNodes.forEach(observeTargets);
                });
                targets.forEach(function (_, element) {
                    if (!element.isConnected) {
                        intersection.unobserve(element);
                        targets.delete(element);
                    }
                });
                updateObstruction();
            });

            function rebuildIntersection() {
                frame = 0;
                if (intersection) intersection.disconnect();
                mutations.disconnect();
                targets.clear();
                intersection = null;
                obstructed = false;
                if (mobile.matches) {
                    var rect = toggle.getBoundingClientRect();
                    var width = document.documentElement.clientWidth;
                    var height = document.documentElement.clientHeight;
                    var left = Math.max(0, rect.left), top = Math.max(0, rect.top);
                    var right = Math.min(width, rect.right), bottom = Math.min(height, rect.bottom);
                    if (right > left && bottom > top) {
                        intersection = new IntersectionObserver(function (entries, observer) {
                            if (observer !== intersection) return;
                            entries.forEach(function (entry) {
                                if (targets.has(entry.target)) {
                                    targets.set(entry.target, entry.isIntersecting &&
                                        entry.intersectionRect.width > 0 && entry.intersectionRect.height > 0);
                                }
                            });
                            updateObstruction();
                        }, { rootMargin: -top + 'px ' + (right - width) + 'px ' +
                            (bottom - height) + 'px ' + -left + 'px', threshold: 0 });
                        observeTargets(document.body);
                        mutations.observe(document.body, { childList: true, subtree: true });
                    }
                }
                updateLauncher();
            }

            function scheduleIntersection() {
                if (!frame) frame = window.requestAnimationFrame(rebuildIntersection);
            }

            new ResizeObserver(scheduleIntersection).observe(toggle);
            window.addEventListener('resize', scheduleIntersection);
            mobile.addEventListener('change', scheduleIntersection);
            scheduleIntersection();
        }

        function closePanel(restoreFocus) {
            var focusInPanel = panel.contains(document.activeElement);
            panel.hidden = true;
            toggle.setAttribute('aria-expanded', 'false');
            updateLauncher();
            if ((restoreFocus || focusInPanel) && !obstructed) {
                toggle.focus({ preventScroll: true });
            }
        }

        toggle.addEventListener('click', function () {
            if (!panel.hidden) {
                closePanel(true);
                return;
            }
            panel.hidden = false;
            toggle.setAttribute('aria-expanded', 'true');
            updateLauncher();
            close.focus({ preventScroll: true });
        });

        close.addEventListener('click', function () {
            closePanel(true);
        });

        // Non-modal: keep the shop usable and let Tab leave the widget normally.
        widget.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && !panel.hidden) {
                event.preventDefault();
                event.stopPropagation();
                closePanel(true);
            }
        });

        widget.addEventListener('focusout', function (event) {
            if (!panel.hidden && event.relatedTarget && !widget.contains(event.relatedTarget)) {
                closePanel(false);
            }
        });

        document.addEventListener('click', function (event) {
            if (!panel.hidden && !widget.contains(event.target)) {
                closePanel(false);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initContactWidget, { once: true });
    } else {
        initContactWidget();
    }
}());
