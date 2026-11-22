/* The PDP supplies IO's visible variation map, translated names and saved IDs.
 * The matrix remains the sole owner of availability reads. */
O46Core.wishPicker = (function () {
    let picker;
    function init(heart) {
        const article = heart.closest('article[data-item]');
        const modal = document.getElementById('eg-wish-picker');
        const wrap = article.querySelector('[data-eg-variations]');
        if (!modal || !wrap) return;
        const matrix = wrap.querySelector('[data-eg-size-matrix]');
        const labels = modal.dataset;
        const names = JSON.parse(labels.attributes);
        const units = new Map(Object.values(JSON.parse(labels.units || '[]')));
        const variations = new Map();
        for (const row of Object.values(JSON.parse(wrap.dataset.egVariations))) {
            if (/^[1-9]\d*$/.test(row.variationId)) variations.set(String(row.variationId), Object.values(row.attributes || {}));
        }
        const base = article.dataset.egActiveVariation;
        if (!variations.size && /^[1-9]\d*$/.test(base)) variations.set(base, []);
        const ids = [...variations.keys()];
        const fields = modal.querySelector('[data-wish-choices]');
        const status = modal.querySelector('[data-wish-status]');
        const notice = article.querySelector('[data-wish-notice]');
        const save = modal.querySelector('[data-wish-save]');
        const saved = new Set();
        let selected = '', error = '', pending = false, noticeTimer;
        const filters = new Map();
        let stocks = new Map();
        const dimensions = ['color','size'].map(kind => {
            const id = matrix?.getAttribute('data-eg-' + kind + '-attribute-id');
            const values = JSON.parse(matrix?.getAttribute('data-eg-' + kind + '-values') || '[]');
            return { id, name: names[id]?.name || matrix?.querySelector('[data-eg-col="' + kind + '"]')?.dataset.egLabel,
                values: new Map(Object.values(values).map(v => [String(v.attributeValueId ?? v.id), v.name])) };
        }).filter(d => d.id && d.name);
        function value(id, dim) {
            const attribute = variations.get(id)?.find(a => String(a.attributeId) === dim.id);
            return attribute && String(attribute.attributeValueId);
        }
        // Duplicate tuples (e.g. different packs), extra attributes and incomplete
        // labels use concrete, labelled IDs rather than guessing a combination.
        const tuples = ids.map(id => dimensions.map(d => value(id,d)).join('/'));
        const simple = dimensions.length && new Set(tuples).size === ids.length && ids.every(id =>
            variations.get(id).length === dimensions.length && dimensions.every(d => d.values.get(value(id,d))));
        const filterGroups = simple ? dimensions.slice(0,-1) : dimensions.filter(d =>
            ids.every(id => d.values.get(value(id,d))) && new Set(ids.map(id => value(id,d))).size > 1);
        function variantName(id) {
            const parts = variations.get(id).map(a => {
                const d = dimensions.find(d => d.id === String(a.attributeId));
                const field = names[a.attributeId];
                const name = field?.name || d?.name;
                const label = field?.values?.[a.attributeValueId] || d?.values.get(String(a.attributeValueId));
                return name && label ? name + ' · ' + label : '';
            }).filter(Boolean);
            return [...parts, units.get(id), labels.variant + ' ' + id].filter(Boolean).join(' / ');
        }
        function badges(id) {
            return [stocks.get(id), saved.has(id) && labels.savedLabel].filter(Boolean).join(' · ');
        }
        function updateStatus() {
            for (const button of fields.querySelectorAll('[data-wish-id]')) {
                button.lastElementChild.textContent = badges(button.dataset.wishId);
            }
            status.textContent = error || (selected ? badges(selected) : '');
            save.disabled = pending || !selected || saved.has(selected);
            modal.setAttribute('aria-busy', String(pending));
        }
        function sync(list) {
            saved.clear();
            for (const id of list) saved.add(String(id));
            const marked = ids.some(id => saved.has(id));
            heart.classList.toggle('item-in-wishlist', marked);
            heart.setAttribute('aria-pressed', String(marked));
            updateStatus();
        }
        function readStocks() {
            stocks = new Map();
            for (const row of matrix?.querySelectorAll('[data-eg-variation-id]') || []) {
                if (['missing','unavailable'].includes(row.dataset.egVariationState)) {
                    stocks.set(row.dataset.egVariationId, labels.unavailable);
                }
            }
            updateStatus();
        }
        const observer = new MutationObserver(readStocks);
        function group(title) {
            const field = document.createElement('fieldset');
            const legend = document.createElement('legend');
            legend.textContent = title;
            field.append(legend);
            fields.append(field);
            return field;
        }
        function option(field, text, key, chosen, id, change) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'eg-wish-option';
            button.textContent = text;
            button.dataset.wishKey = key;
            button.setAttribute('aria-pressed', String(chosen));
            if (id) {
                button.dataset.wishId = id;
                button.append(document.createElement('small'));
            }
            button.addEventListener('click', () => {
                if (pending) return;
                error = '';
                change();
                render();
                [...fields.querySelectorAll('button')].find(b => b.dataset.wishKey === key)?.focus({preventScroll:true});
            });
            field.append(button);
        }
        function render() {
            fields.replaceChildren();
            let choices = ids;
            for (const [index,dim] of filterGroups.entries()) {
                if (!choices.length) break;
                const field = group(dim.name);
                for (const key of new Set(choices.map(id => value(id,dim)))) {
                    option(field, dim.values.get(key), dim.id + '-' + key, filters.get(dim) === key, null, () => {
                        if (filters.get(dim) === key) return;
                        selected = '';
                        for (const later of filterGroups.slice(index + 1)) filters.delete(later);
                        filters.set(dim,key);
                    });
                }
                choices = choices.filter(id => value(id,dim) === filters.get(dim));
            }
            if (choices.length) {
                const dim = dimensions[dimensions.length-1];
                const field = group(simple ? dim.name : labels.variant);
                for (const id of choices) {
                    option(field, simple ? dim.values.get(value(id,dim)) : variantName(id),
                        'id-' + id, selected === id, id, () => { selected = id; });
                }
            }
            updateStatus();
        }
        function write(id, remove) {
            if (pending || !variations.has(id) || (!remove && saved.has(id))) return;
            pending = true;
            clearTimeout(noticeTimer);
            error = notice.textContent = '';
            heart.setAttribute('aria-busy','true');
            updateStatus();
            const method = remove ? 'remove' : 'add';
            eGuardians.item.watchList[method](id, (response, code) => {
                pending = false;
                heart.removeAttribute('aria-busy');
                const ok = !response?.error && (remove ? code === 200 && response?.data === true :
                    code === 201 && String(response?.data?.variationId) === id);
                if (ok) {
                    if (remove) saved.delete(id); else saved.add(id);
                    sync([...saved]);
                    notice.textContent = messageServiceTranslations[remove ? 'wishlistminus' : 'wishlistplus'];
                    noticeTimer = setTimeout(() => { notice.textContent = ''; }, 4000);
                    document.querySelectorAll('.wishlist-link').forEach(el => el.classList.toggle('noWishListItems', !saved.size));
                    document.querySelectorAll('.wishlist-count').forEach(el => { el.textContent = String(saved.size); });
                    O46Core.basketHeader.refreshAfterWrite();
                    if (modal.classList.contains('show')) $(modal).modal('hide');
                } else {
                    error = labels.error;
                    if (!modal.classList.contains('show')) notice.textContent = error;
                }
                updateStatus();
            });
        }
        save.addEventListener('click', () => write(selected, false));
        $(modal).on('hidden.bs.modal', () => { observer.disconnect(); });
        if (ids.length > 1) {
            heart.setAttribute('aria-haspopup','dialog');
            heart.setAttribute('aria-controls',modal.id);
        }
        sync(Object.values(JSON.parse(labels.saved)));
        return {sync, open() {
            if (pending) return;
            notice.textContent = error = '';
            if (!ids.length) { notice.textContent = labels.error; return; }
            if (ids.length === 1) { write(ids[0], saved.has(ids[0])); return; }
            const direct = location.pathname.match(/(?:\/|_)([0-9]+)_([0-9]+)\/?$/);
            const linked = direct && direct[1] === article.dataset.mainitemid ? direct[2] : '';
            const active = String(article.dataset.egWishSelection || $(wrap).data('activeVariationId') || linked || '');
            selected = variations.has(active) ? active : '';
            filters.clear();
            if (selected) for (const dim of filterGroups) filters.set(dim,value(selected,dim));
            render();
            readStocks();
            if (matrix) observer.observe(matrix, {subtree:true,childList:true,attributes:true,attributeFilter:['data-eg-variation-state']});
            if (modal.parentElement !== document.body) document.body.append(modal);
            $(modal).modal('show', heart);
        }};
    }
    // Matrix styling also highlights a default row. Only user interaction should
    // supersede the variation that IO selected for the PDP URL.
    function remember(event) {
        const row = event.target.closest?.('[data-eg-color-preview],[data-eg-qty]')?.closest('[data-eg-variation-id]');
        const article = row?.closest('article[data-item]');
        if (article && !article.closest('.modal')) article.dataset.egWishSelection = row.dataset.egVariationId;
    }
    document.addEventListener('click', remember, true);
    document.addEventListener('focusin', remember);
    return {
        open(heart) { picker ||= init(heart); picker?.open(); },
        sync(ids) {
            if (!picker && document.getElementById('eg-wish-picker')?.dataset.saved === JSON.stringify(ids)) return;
            const heart = document.querySelector('article.single [data-eg-handler="watchListTrigger"]');
            if (heart) { picker ||= init(heart); picker?.sync(ids); }
        }
    };
})();
