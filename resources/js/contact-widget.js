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

        function closePanel(restoreFocus) {
            var focusInPanel = panel.contains(document.activeElement);
            panel.hidden = true;
            toggle.setAttribute('aria-expanded', 'false');
            if (restoreFocus || focusInPanel) {
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
