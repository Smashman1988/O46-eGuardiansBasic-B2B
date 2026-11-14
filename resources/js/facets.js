/* Compact presentation of the existing IO facets. No persisted/customer-shared state. */
(function () {
    'use strict';
    if (window.egFacets) return;
    const states = new WeakMap();
    const roots = () => [...document.querySelectorAll('[data-eg-compact-facets]')];
    const validId = value => /^[1-9][0-9]*$/.test(String(value));
    const create = (tag, cls, text) => {
        const node = document.createElement(tag);
        if (cls) node.className = cls;
        if (text !== undefined) node.textContent = text;
        return node;
    };
    function urlFor(root, target, languageChange) {
        const state = root ? states.get(root) : null, url = new URL(target, location.href);
        const current = new URL(location.href);
        if (languageChange) {
            url.search = '';
            for (const key of ['query', 'sorting', 'itemsPerPage', 'page', 'currency', 'ShipToCountry']) {
                if (current.searchParams.has(key)) url.searchParams.set(key, current.searchParams.get(key));
            }
        }
        const query = root.dataset.egSearchstring;
        if (query) url.searchParams.set('query', query);
        if (state.selected.size) url.searchParams.set('facets', [...state.selected].join(','));
        else url.searchParams.delete('facets');
        for (const key of ['priceMin', 'priceMax']) {
            const input = root.querySelector('.facet-input-price-' + (key === 'priceMin' ? 'min' : 'max'));
            const value = input ? input.value : current.searchParams.get(key);
            if (value !== null && value !== '' && Number(value) >= 0) url.searchParams.set(key, value);
            else url.searchParams.delete(key);
        }
        if (!languageChange || state.dirty) url.searchParams.delete('page');
        return url;
    }
    function renderGroup(root, group) {
        const state = states.get(root), id = group.dataset.egFacetGroup;
        if (id === '8') return;
        const rows = state.values[id] || [], list = group.querySelector('ul');
        const color = list.classList.contains('facet-color');
        const existing = new Map([...list.children].map(li => [li.querySelector('input').dataset.egFacetvalueid, li]));
        const fragment = document.createDocumentFragment();
        for (const [valueId, name, count] of rows) {
            let li = existing.get(String(valueId));
            if (!li) {
                li = create('li');
                const input = create('input', 'facet-item-value-chk');
                input.type = 'checkbox'; input.id = 'facet-item-' + valueId;
                input.dataset.egFacetvalueid = valueId;
                const label = create('label', 'facet-item-value'); label.htmlFor = input.id;
                if (color) label.append(create('span', '', name));
                else {
                    const box = create('span', 'chk-box');
                    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    svg.setAttribute('viewBox', '0,0,50,50'); svg.setAttribute('aria-hidden', 'true');
                    const path = document.createElementNS(svg.namespaceURI, 'path');
                    path.setAttribute('d', 'M5 30 L 20 45 L 45 5'); svg.append(path); box.append(svg);
                    label.append(box, document.createTextNode(name), create('span', 'chk-count'));
                }
                li.append(input, label); fragment.append(li);
            }
            const input = li.querySelector('input');
            input.checked = state.selected.has(String(valueId));
            li.classList.toggle('eg-facet-selected', input.checked);
            const nameNode = color ? li.querySelector('label span') : [...li.querySelector('label').childNodes].find(node => node.nodeType === 3);
            if (nameNode) nameNode.textContent = name;
            input.setAttribute('aria-label', name + ' (' + count + ')');
            li.dataset.egFacetItemcount = count;
            const countNode = li.querySelector('.chk-count');
            if (countNode) countNode.textContent = count;
        }
        list.append(fragment);
        group.dataset.egFacetRendered = 'true';
    }
    function toggle(root, group, open) {
        const dropdown = group.querySelector('.eg-dropdown'), header = group.querySelector('[data-eg-facet-toggle]');
        if (open && !group.dataset.egFacetRendered) renderGroup(root, group);
        dropdown.classList.toggle('isOpen', open);
        header.setAttribute('aria-expanded', String(open));
    }
    function buttons(root, loading, count, target) {
        const state = states.get(root);
        for (const button of root.querySelectorAll('[data-eg-btnfilter]')) {
            button.style.display = 'inline-block'; button.classList.remove('display-none');
            button.classList.toggle('btn-load', loading); button.disabled = loading || !target;
            button.textContent = loading ? state.texts.loading : state.texts.result.replace('{count}', count);
            if (target) button.dataset.egTargeturl = target;
            else delete button.dataset.egTargeturl;
        }
    }
    function invalidate(root) {
        const state = states.get(root);
        state.dirty = true;
        root.setAttribute('aria-busy', 'true');
        clearTimeout(state.timer); state.sequence++;
        if (state.controller) state.controller.abort();
        buttons(root, true);
        root.querySelector('.facet-status').textContent = '';
    }
    function updateValues(root, facets) {
        const state = states.get(root);
        // Keep zero-count/selected values and their original ordering; add newly available values.
        for (const rows of Object.values(state.values)) for (const row of rows) row[2] = 0;
        for (const facet of facets) {
            const id = String(facet.id);
            if (!validId(id)) continue;
            if (!state.values[id]) state.values[id] = [];
            const rows = state.values[id], byId = new Map(rows.map(row => [String(row[0]), row]));
            for (const value of facet.values || []) {
                if (!validId(value.id)) continue;
                const key = String(value.id), row = byId.get(key);
                if (row) { row[1] = value.name; row[2] = Number(value.count) || 0; }
                else { const added = [key, value.name, Number(value.count) || 0]; rows.push(added); byId.set(key, added); }
            }
            if (!root.querySelector('[data-eg-facet-group="' + id + '"]') && validId(id) && id !== '8') {
                const group = create('div', 'col-12 colFilter ' + (facet.cssClass || '') + ' facet-' + id);
                group.dataset.egFacetGroup = id;
                const dropdown = create('div', 'cat-facet eg-dropdown');
                const header = create('div', 'btn-primary cat-facet-name eg-dropdown-value', facet.name);
                header.dataset.egFacetToggle = ''; header.tabIndex = 0; header.setAttribute('role', 'button'); header.setAttribute('aria-expanded', 'false');
                header.append(create('span', 'icon-down-open-big'));
                const content = create('div', 'eg-dropdown-content');
                content.append(create('ul', 'list-no-style facetgroup-' + id + (id === '2' ? ' facet-color d-flex' : '')));
                dropdown.append(header, content); group.append(dropdown); root.querySelector('.rowFilter').append(group);
            }
        }
        for (const group of root.querySelectorAll('[data-eg-facet-rendered]')) renderGroup(root, group);
    }
    async function request(root, navigate) {
        const state = states.get(root), sequence = state.sequence;
        state.timer = null;
        const target = urlFor(root, location.href, false);
        const params = new URLSearchParams({query: root.dataset.egSearchstring || '', facets: [...state.selected].join(','),
            priceMin: target.searchParams.get('priceMin') || '', priceMax: target.searchParams.get('priceMax') || '', categoryId: root.dataset.egCatid || '', countsOnly: '1'});
        const controller = new AbortController(); state.controller = controller;
        try {
            const response = await fetch('/rest/io/facet/?' + params, {credentials: 'same-origin', signal: controller.signal, headers: {Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest'}});
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const result = (await response.json()).data;
            if (sequence !== state.sequence) return;
            if (!result || !Array.isArray(result.facets) || !Number.isFinite(Number(result.itemList?.total))) throw new Error('Invalid facet response');
            updateValues(root, result.facets);
            root.setAttribute('aria-busy', 'false');
            buttons(root, false, result.itemList.total, target.pathname + target.search);
            state.controller = null;
            if (navigate) location.assign(target.pathname + target.search);
        } catch (error) {
            if (error.name === 'AbortError' || sequence !== state.sequence) return;
            state.controller = null;
            // Never present a network failure as a successful zero-result response.
            root.setAttribute('aria-busy', 'false');
            root.querySelector('.facet-status').textContent = state.texts.error;
            buttons(root, false, 'â€“', null);
        }
    }
    function filter(root, navigate) {
        invalidate(root);
        const state = states.get(root);
        state.timer = setTimeout(() => request(root, navigate), 300);
    }
    function init(root) {
        if (states.has(root)) return;
        const data = JSON.parse(root.querySelector('[data-eg-facet-data]').textContent);
        const state = {...data, selected: new Set(data.selected.map(String)), sequence: 0, timer: null, controller: null, dirty: false};
        states.set(root, state);
        // Capture prevents the old theme dropdown/handler bindings from running a second time.
        root.addEventListener('click', event => {
            const header = event.target.closest('[data-eg-facet-toggle]');
            if (header) {
                event.preventDefault(); event.stopImmediatePropagation();
                toggle(root, header.closest('[data-eg-facet-group]'), header.getAttribute('aria-expanded') !== 'true'); return;
            }
            const apply = event.target.closest('[data-eg-btnfilter]');
            if (apply) {
                event.preventDefault(); event.stopImmediatePropagation();
                if (!apply.disabled && apply.dataset.egTargeturl) location.assign(apply.dataset.egTargeturl);
            }
            if (event.target.closest('.pricefilter')) {
                event.preventDefault(); event.stopImmediatePropagation(); filter(root, true);
            }
        }, true);
        root.addEventListener('change', event => {
            if (event.target.matches('.facet-item-value-chk')) {
                event.stopImmediatePropagation();
                const id = event.target.dataset.egFacetvalueid;
                if (event.target.checked) state.selected.add(id); else state.selected.delete(id);
                filter(root, false);
            }
        }, true);
        root.addEventListener('input', event => {
            if (event.target.matches('.facet-input-price-min, .facet-input-price-max')) {
                // Preserve the explicit price Apply action: typing alone must not search IO.
                invalidate(root);
                root.setAttribute('aria-busy', 'false');
                for (const button of root.querySelectorAll('[data-eg-btnfilter]')) button.style.display = 'none';
            }
        });
        root.addEventListener('keydown', event => {
            const header = event.target.closest('[data-eg-facet-toggle]');
            if (header && ['Enter', ' '].includes(event.key)) { event.preventDefault(); header.click(); }
            if (event.key === 'Escape') {
                const group = event.target.closest('[data-eg-facet-group]');
                if (group) { toggle(root, group, false); group.querySelector('[data-eg-facet-toggle]').focus(); }
            }
            if (event.key === 'Enter' && event.target.matches('.facet-input-price-min, .facet-input-price-max')) { event.preventDefault(); filter(root, true); }
        });
    }
    const signature = () => {
        const params = new URLSearchParams(location.search);
        return ['facets', 'priceMin', 'priceMax', 'query', 'sorting'].map(key => params.get(key)).join('|');
    };
    const initialSignature = signature();
    window.addEventListener('popstate', () => { if (roots().length && signature() !== initialSignature) location.reload(); });
    // Browser form restoration must not disagree with the server URL after back/forward.
    window.addEventListener('pageshow', event => {
        if (!event.persisted) return;
        for (const root of roots()) {
            const state = states.get(root);
            if (state?.dirty) location.reload();
        }
    });
    window.addEventListener('pagehide', () => {
        for (const root of roots()) {
            const state = states.get(root); if (!state) continue;
            clearTimeout(state.timer); state.sequence++; if (state.controller) state.controller.abort();
        }
    });
    window.egFacets = {
        init: () => roots().forEach(init),
        languageURL: target => {
            const root = roots()[0];
            return root && states.has(root) ? urlFor(root, target, true) : null;
        }
    };
    window.egFacets.init();
})();
