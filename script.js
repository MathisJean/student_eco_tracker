const root = document.documentElement;

const content_sidebar = document.querySelector('.content-sidebar');
const sidebar_menu = content_sidebar.querySelector('.sidebar-menu');
const menu_items = Array.from(sidebar_menu.querySelectorAll('.menu-item'))
let prev_radio = null;

const sidebar_collapse = Array.from(document.querySelectorAll('.sidebar-collapse'));

const schedule_grid = document.querySelector('.schedule-grid')

menu_items.forEach(menu_item => {
    const radio = menu_item.querySelector('input[type="radio"]');
    const sidebar_collapse = content_sidebar.querySelector(`#${radio?.value}`);
    
    if(radio.checked){
        prev_radio = radio;

        sidebar_collapse.classList.remove('collapsed');
    }
    
    radio.addEventListener('change', () => {
        const prev_sidebar_collapse = content_sidebar.querySelector(`#${prev_radio?.value}`);
        
        if(prev_radio){
            prev_sidebar_collapse.classList.add('collapsed');
        }
        
        prev_radio = radio;
        
        sidebar_collapse.classList.remove('collapsed');
    });

    //Set color dynamically at load
    const color = getComputedStyle(menu_item).getPropertyValue('--color');
    sidebar_collapse.style.setProperty('--color', color);
});

sidebar_collapse.forEach(sidebar => {
    const heading_close = sidebar.querySelector('.heading-close');
    
    heading_close.addEventListener('click', () => {
        sidebar.classList.add('collapsed');

        for(let i = 0; i < menu_items.length; i++){
            const radio = menu_items[i].querySelector('input[type="radio"]');
    
            if(radio.checked){
                radio.checked = false;
                break;
            }
        };
    });

    const list_items = Array.from(sidebar.querySelectorAll('.list-item'));

    list_items.forEach(list_item => {
        //Set color dynamically at load
        const color = getComputedStyle(sidebar).getPropertyValue('--color');
        list_item.style.setProperty('--color', color);

        list_item.addEventListener('dragstart', event => {
            event.dataTransfer.effectAllowed = 'copy';
            event.dataTransfer.setData('text/html', list_item.outerHTML);
        });
    });
});

schedule_grid.addEventListener('dragover', event => {
    event.preventDefault();

    event.dataTransfer.dropEffect = 'copy'
});

schedule_grid.addEventListener('drop', event => {
    event.preventDefault();

    let drop_row = event.target.closest('.grid-row');

    const html = event.dataTransfer.getData('text/html');
    const temp = document.createElement('div');
    temp.innerHTML = html.trim();

    const list_item = temp.firstElementChild;

    list_item.addEventListener('dragstart', event => {
        event.dataTransfer.effectAllowed = 'copy';
        event.dataTransfer.setData('text/html', list_item.outerHTML);
    });

    list_item.addEventListener('dragend', () => {
        list_item.remove();
    });

    if(!drop_row || !drop_row.classList.contains('grid-row')){
        const rows = Array.from(schedule_grid.querySelectorAll('.grid-row'));
        if(!rows.length) return;

        const grid_rect = schedule_grid.getBoundingClientRect();
        const dropY = event.clientY - grid_rect.top;

        drop_row = rows[0];
        let min_distance = Math.abs(dropY - (rows[0].offsetTop - grid_rect.top + rows[0].offsetHeight / 2));

        for(let i = 1; i < rows.length; i++){
            const row = rows[i];
            const row_center = (row.offsetTop - grid_rect.top) + row.offsetHeight / 2;
            const dist = Math.abs(dropY - row_center);
            if (dist < min_distance) {
                drop_row = row;
                min_distance = dist;
            }
        }
    }

    drop_row.append(list_item);
});