//-- DOM Elements --//
const root = document.documentElement;

//Menus
const content_sidebar = document.querySelector('.content-sidebar');
const sidebar_menu = content_sidebar.querySelector('.sidebar-menu');
const menu_items = [];
const sidebar_collapse = [];
const list_items = [];

let prev_radio = null;

//Cache JSON Data
const cacheKey = "menus_v19"; // bump version when JSON changes

//Schedule
const schedule_grid = document.querySelector('.schedule-grid')

//Dragging + Resizing Inputs
let dragged_el = null;
let resize_span = null;

//Interaction Btns
const interact_help = document.querySelector('.interact-help')
const interact_result = document.querySelector('.interact-result')
const interact_clear = document.querySelector('.interact-clear')

//Popups
const main_results = document.querySelector('.main-results')
const main_help = document.querySelector('.main-help')

const results_close = main_results.querySelector('.results-close');
const help_close = main_help.querySelector('.results-close');

//-- Populate Data --//

const attributes = await fetch('data/attributs.json').then(r => r.json());
const units = await fetch('data/unites.json').then(r => r.json());

async function load_menus_cached(){
    //If cached
    const cached = localStorage.getItem(cacheKey);
    if(cached){
        return JSON.parse(cached);
    }

    //Fetch normally
    const menu_list = await fetch('data/menu.json').then(r => r.json());

    const menus = await Promise.all(
        menu_list.menu.map(file => fetch(`data/${file}.json`).then(r => r.json()))
    );

    //Save to cache
    localStorage.setItem(cacheKey, JSON.stringify(menus));

    return menus;
}

//Load JSON Data
const menus = await load_menus_cached();

//Create Fragments
const menu_fragment = document.createDocumentFragment();
const collapse_fragment = document.createDocumentFragment();

//Check radio on reload
const saved_radio = localStorage.getItem("selected_menu");

menus.forEach(menu => {
    //Build Sidebar menu
    const menu_item = build_menu_item(menu.nom, menu.couleur);
    menu_fragment.append(menu_item);
    menu_items.push(menu_item);

    //Build Collapsible Sidebars
    const collapse = build_collapsible(menu.nom, menu.couleur);
    collapse_fragment.append(collapse);
    sidebar_collapse.push(collapse);

    //Close Collapsible
    const heading_close = collapse.querySelector('.heading-close');

    heading_close.addEventListener('click', () => {
        collapse.classList.remove('not-collapsed');

        const radio = menu_item.querySelector('input[type="radio"]');

        if(radio.checked){
            radio.checked = false;
            localStorage.setItem("selected_menu", null);
        }
    });

    //If a Menu is Checked
    const radio = menu_item.querySelector('input[type="radio"]');
    
    //If Radio is the Saved Radio
    if(radio.value == saved_radio){
        radio.checked = true;
        prev_radio = radio;

        collapse.classList.add('not-collapsed'); //Show collapsible
    }
    
    radio.addEventListener('change', event => {
        localStorage.setItem("selected_menu", event.target.value);

        const prev_sidebar_collapse = content_sidebar.querySelector(`#${prev_radio?.value}`);
        
        if(prev_radio){
            prev_sidebar_collapse.classList.remove('not-collapsed'); //Hide collapsible
        }
        
        prev_radio = radio;
        
        collapse.classList.add('not-collapsed'); //Show collapsible
    });
    
    const collapse_list = collapse.querySelector('.collapse-list')
    const list_fragment = document.createDocumentFragment();
    
    menu.items.forEach(item => {        
        const list_item = build_list_item(item.nom, menu.couleur, menu.nom);
        list_fragment.append(list_item);
        list_items.push(list_item);

        //Set drag start event
        list_item.addEventListener('dragstart', event => {
            event.dataTransfer.effectAllowed = 'copy';
            const item_clone = list_item.cloneNode(true);
            dragged_el = item_clone;
            
            const input_number = Array.from(item_clone.querySelectorAll('.attribute-number'));
            
            input_number.forEach(input => {
                input.disabled = false;
                
                input.addEventListener('input', () => {
                    const min = Number(input.min);
                    const max = Number(input.max);
                    const value = Number(input.value);
                    
                    if(Number.isNaN(value)) return;
                    
                    input.value = Math.min(max, Math.max(min, value));
                    auto_size_input(input);
                });
            });
            
            const input_select = Array.from(item_clone.querySelectorAll('.attribute-select'));
            
            input_select.forEach(input => {
                input.disabled = false;

                input.addEventListener('change', () => {
                    const option = input.selectedOptions[0];

                    const icon = input.previousElementSibling;
                    icon.src = `svg/${option.dataset.name}.svg`
                });
            });
            
            item_clone.addEventListener('dragstart', () => {
                dragged_el = item_clone;
            });

            item_clone.addEventListener('dragend', event => {
                if(event.dataTransfer.dropEffect === 'none'){
                    item_clone.remove();
                }
            });
        }); 
        
        const attribute_list = list_item.querySelector('.item-attribute')
        const attribute_fragment = document.createDocumentFragment();

        item.attributs.forEach(attribute_name => {
            const attribute_data = attributes[attribute_name];

            const attribute = build_attribute_entry(attribute_name, attribute_data);
            
            const input = attribute.querySelector('input, select')
            if(attribute_data.type == "number") auto_size_input(input);
            input.disabled = true

            attribute_fragment.append(attribute);
        });

        attribute_list.append(attribute_fragment);
    });

    collapse_list.append(list_fragment);
});

sidebar_menu.append(menu_fragment);
content_sidebar.append(collapse_fragment);

function auto_size_input(input){
    if(!resize_span){
        resize_span = document.createElement('span');
        resize_span.style.visibility = 'hidden';
        resize_span.style.position = 'absolute';
        resize_span.style.whiteSpace = 'pre';
        document.body.appendChild(resize_span);    
    }
    
    const resize = () => {
        resize_span.style.font = getComputedStyle(input).font;
        resize_span.textContent = input.value || input.placeholder || '0';
        input.style.width = resize_span.offsetWidth + 2 + 'px'; //Get width
    };

    input.addEventListener('input', resize);
    resize();
}

schedule_grid.addEventListener('dragover', event => {
    event.preventDefault();

    event.dataTransfer.dropEffect = 'copy'
});

schedule_grid.addEventListener('drop', event => {
    event.preventDefault();

    let drop_row = event.target.closest('.grid-row');
    if(!drop_row || !drop_row.classList.contains('grid-row')){
        const rows = Array.from(schedule_grid.querySelectorAll('.grid-row'));
        if(!rows.length) return;

        const grid_rect = schedule_grid.getBoundingClientRect();
        const drop_y = event.clientY - grid_rect.top;

        drop_row = rows[0];
        let min_distance = Math.abs(drop_y - (rows[0].offsetTop - grid_rect.top + rows[0].offsetHeight / 2));

        for(let i = 1; i < rows.length; i++){
            const row = rows[i];
            const row_center = (row.offsetTop - grid_rect.top) + row.offsetHeight / 2;
            const dist = Math.abs(drop_y - row_center);
            if (dist < min_distance) {
                drop_row = row;
                min_distance = dist;
            }
        }
    }

    if(!dragged_el) return;
    const list_item = dragged_el;

    drop_row.append(list_item);
});

//-- Help Btn --//
/*
help_close.addEventListener('click', () => {
    main_help.style.pointerEvents = 'none';
    main_help.style.opacity = 0;
});

interact_help.addEventListener('click', () => {
    main_help.style.pointerEvents = 'all';
    main_help.style.opacity = 1;
    main_help.focus();
});

main_help.addEventListener('blur', () => {
    main_help.style.pointerEvents = 'none';
    main_help.style.opacity = 0;
});
*/
//-- Results Btn --//

results_close.addEventListener('click', () => {
    main_results.style.pointerEvents = 'none';
    main_results.style.opacity = 0;
});

main_results.addEventListener('blur', () => {
    main_results.style.pointerEvents = 'none';
    main_results.style.opacity = 0;
});

interact_result.addEventListener('click', () => {
    let total_carbon_impact = 0;
    let total_per_category = {};

    Array.from(schedule_grid.children).forEach(row => {
        row.querySelectorAll('.list-item').forEach(list_item => {
            const category = list_item.dataset.category || 'autres';
            
            const name = list_item.querySelector('.item-title').textContent.trim().toLowerCase();
            const item = find_item_by_name(name);
            console.log(name)
            
            let values = {};
            
            const attributes = Array.from(list_item.querySelectorAll('.attribute-entry'));
            attributes.forEach(attribute => {
                const value = attribute.querySelector('input, select').value.trim();
                values[attribute.dataset.name] = value;
            });
            
            const emission = calculate_emissions(item, values);
            
            total_carbon_impact += emission;

            if(!total_per_category[category]){
                const category_color = getComputedStyle(list_item).getPropertyValue('--color').trim();
                total_per_category[category] = { emission: 0, color: category_color };
            };
            total_per_category[category]['emission'] += emission;
        });
    });

    draw_category_pie_chart(total_per_category);

    draw_normal_distribution(total_carbon_impact);
    const percentile = normalCDF(total_carbon_impact, MEAN, STD_DEV) * 100;
    
    main_results.querySelector('.percentile-ranking').querySelector('.percentile').innerText = `${(100 - percentile).toFixed(1)}%`;
    main_results.querySelector('h1').querySelector('.emission').innerText = total_carbon_impact.toFixed(1);
    
    main_results.style.pointerEvents = 'all';
    main_results.style.opacity = 1;
    main_results.focus();
});

//-- Clear Btn --//

interact_clear.addEventListener('click', () => {
    Array.from(schedule_grid.children).forEach(row => {
        row.querySelectorAll('.list-item').forEach(item => {
            item.style.opacity = 0;
            setTimeout(() => { item.remove() }, 50);
        });
    });
});

//NORMAL DISTRIBUTION GRAPH
const MEAN = 20;     // kgCO2e/day
const STD_DEV = 7;   // kgCO2e/day

function normalPDF(x, mean, stdDev) {
    const a = 1 / (stdDev * Math.sqrt(2 * Math.PI));
    const b = Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
    return a * b;
}

function draw_normal_distribution(userValue) {
    const ctx = document.getElementById('chart-distribution');

    //Generate X and Y values
    const xs = [];
    const ys = [];

    for(let x = 0; x <= 45; x += 1) {   // 0–60 kg/day covers all realistic values
        xs.push(x);
        ys.push(normalPDF(x, MEAN, STD_DEV));
    }

    //Destroy previous chart if it exists
    if(window.distributionChart) {
        window.distributionChart.destroy();
    }

    window.distributionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xs,
            datasets: [
                {
                    label: 'Population',
                    data: ys,
                    borderColor: '#000000',
                    borderWidth: 4,
                    tension: 0.4,
                    pointRadius: 0
                },
                {
                    label: 'You',
                    data: xs.map(x => x === Math.round(userValue) ? normalPDF(x, MEAN, STD_DEV) : null),
                    borderColor: '#E07474',
                    pointBackgroundColor: '#E07474',
                    pointRadius: 6,
                    type: 'scatter'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: { display: true, text: '' },
                    grid: { display: false },
                    border: { display: false }
                },
                y: {
                    grid: { display: false },
                    border: { display: false },
                    display: false
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function normalCDF(x, mean, stdDev) {
    return 0.5 * (1 + erf((x - mean) / (stdDev * Math.sqrt(2))));
}

function erf(x) {
    // Numerical approximation of the error function
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const t = 1 / (1 + p * x);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
}

function draw_category_pie_chart(total_per_category) {
    const ctx = document.getElementById('pie-category');

    if(window.categoryChart) {
        window.categoryChart.destroy();
    }

    const categories = Object.keys(total_per_category);
    const allZero = categories.every(cat => total_per_category[cat].emission === 0);

    // Fallback: empty chart → black full circle
    if(categories.length === 0 || allZero) {
        window.categoryChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ["Aucune donnée"],
                datasets: [{
                    data: [1],
                    backgroundColor: ["#000000"]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        return;
    }

    // Normal dynamic chart
    const labels = categories;
    const data = categories.map(cat => total_per_category[cat].emission);
    const colors = categories.map(cat => total_per_category[cat].color);

    window.categoryChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 1,
                borderColor: "#fff"
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function find_item_by_name(name){
    for(const menu of Object.values(menus)){
        const item = menu.items.find(i => i.nom.toLowerCase() === name.toLowerCase());
        if(item) return item;
    }
    return null;
}

//Function to Calculate Emission Rate Based on Formula + Variables
function calculate_emissions(item, values){
    const formula = item?.formule;

    if(!formula) return 0;

    const fn = new Function(...Object.keys(values), `return ${formula};`);

    return fn(...Object.values(values));
}

//-- Building Dynamic Menus --//

function build_collapsible(name, color){
    const aside = document.createElement('aside');

    aside.id = name;
    aside.className = "sidebar-collapse";
    aside.style.setProperty('--color', color);

    aside.innerHTML = `
        <header class="collapse-heading">
            <h3 class="heading-title">${name.charAt(0).toUpperCase() + name.slice(1)}</h3>

            <button class="heading-close">
                <img draggable="false" class="close-icon" src="svg/arrow_back.svg">
            </button>
        </header>

        <ul class="sidebar-list collapse-list"></ul>
    `;

    return aside;
}

function build_menu_item(name, color){
    const label = document.createElement('label');

    label.className = "menu-item";
    label.style.setProperty('--color', color);

    label.innerHTML = `
        <input name="sidebar-menu" type="radio" value="${name}" style="display: none;">

        <img draggable="false" class="item-icon" src="svg/${name}.svg">
    `;

    return label;
}

function build_list_item(name, color, category){
    const li = document.createElement('li');
    
    li.draggable = "true";
    li.dataset.category = category;
    li.className = "list-item";
    li.style.setProperty('--color', color);
    
    li.innerHTML = `
        <!-- ${name} -->
        <h5 class="item-title">${name.charAt(0).toUpperCase() + name.slice(1)}</h5> 

        <ul class="item-attribute">
        </ul>
    `;
    
    return li;
}

function build_attribute_entry(name, attribute){    
    const li = document.createElement('li');
    li.className = `attribute-entry`;
    li.dataset.name = name;
    let html = null;

    switch(attribute.type){
        case "number":
            const unit = units[attribute.unite];
            
            let html_unit = null; 
            
            switch(unit.type){
                case "texte":
                    html_unit = `<h6 class="attribute-header">${unit.valeur}</h6>`;
                    break;
                    
                    case "svg":
                        html_unit = `<img draggable="false" class="attribute-icon" src="${unit.valeur}">`;
                    break;

                default:
                    break;
            }

            html = `
                <!-- ${name} -->
                <label>
                    <input class="attribute-input attribute-number" type="number" value="${attribute.valeur}" min="${attribute.min}" max="${attribute.max}">
                    ${html_unit}
                </label>
            `
            break;

        case "select":
            let html_options = "";

            Object.entries(attribute.valeur).forEach(([key, value]) => {
                html_options += `<option value="${value}" data-name="${name}_${key}">${key.charAt(0).toUpperCase() + key.slice(1)}</option>`;
            });

            html = `
                <!-- ${name} -->
                <label>
                    <img draggable="false" class="attribute-icon" src="svg/${name}_${Object.entries(attribute.valeur)[0][0]}.svg">
                    
                    <select class="attribute-input attribute-select">
                        ${html_options}
                    </select>
                </label>
            `
            break;
    }
    
    li.innerHTML = html;
    
    return li;
}