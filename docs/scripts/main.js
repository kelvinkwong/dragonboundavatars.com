async function onload(){
    console.log('onload: start');
    add_options();
    add_tables();
    console.log('onload: end');
}
//https://stackoverflow.com/a/9899701
document.addEventListener('DOMContentLoaded', onload, false);

function onclick_filter_currency(state, name){
    let xcolumn = Util.get_thead_index(document.getElementsByTagName('table')[0], name) + 1;
    let xpath = `//div[@id="tables"]//tbody/tr/td[${xcolumn}][text() = "0"]`;

    for (td of Util.getElementByXpath(xpath, document)){
        td.hidden = !state;
    }

    table_hide_rows(document);
}

function onclick_filters_gender(state, name, header){
    let xcolumn = Util.get_thead_index(document.getElementsByTagName('table')[0], header) + 1;
    let xpath = `//div[@id="tables"]//tbody/tr/td[${xcolumn}][text() = "${name}"]`;

    for (td of Util.getElementByXpath(xpath, document)){
        td.hidden = !state;
    }

    table_hide_rows(document);
}

function onclick_sum_stat(myself, checkboxes){
    console.log('get onclick sum stat');
    myself.disabled = true;
    let stats_selected = [];
    let table = document.getElementsByTagName('table')[0];
    checkboxes = Util.getElementByXpath('.//input', checkboxes);
    for (checkbox of checkboxes){
        if (checkbox.checked == true){
            stats_selected.push(Util.get_thead_index(table, checkbox.value));
//            console.log(stats_selected, checkbox.value, checkbox.checked);
        }
    }

    let sum_column = Util.get_thead_index(table, 'sum_stat');

    for (tr of Util.getElementByXpath(`//div[@id="tables"]//tbody/tr`, document)){
        let sum = 0;

        for (selected of stats_selected){
            sum += Number(tr.children[selected].innerText);
        }

        td = tr.children[sum_column];
        td.innerText = sum;
        td.setAttribute('sorttable_customkey', String(sum).padStart(2, '0'));
    }

    for (sum_stat of Util.getElementByXpath('//div[@id="tables"]//thead/tr/th[text() = "sum_stat"]', document)){
        console.log(sum_stat);
        // Order by ascending
        sum_stat.click();
        // Order by descending
        sum_stat.click();
    }
    myself.disabled = false;
}

function add_options(){
    parent = document.getElementById('options');
    form = document.createElement('form');
    parent.append(form);

    add_option_for_currency(form);
    add_option_for_genders(form);
    add_option_for_sum_stat(form);
}

function add_option_for_currency(parent){
    let label = 'Currencies: ';
    let options = [{innerText: 'cash', value: 'gold', checked: true},
                   {innerText: 'gold', value: 'cash', checked: true}];
    for (option of options){
        option.type = 'checkbox';
        option.onclick = 'onclick_filter_currency(this.checked, this.value)';
        option.id = `${option.type}-${option.innerText}`;
    }
    add_option_template(parent, label, options);
}

function add_option_for_sum_stat(parent){
    let label = 'Sum stats: ';
    let options = [{innerText: 'popularity', checked: true},
                   {innerText: 'shot delay', checked: false, value: 'speed'},
                   {innerText: 'attack', checked: true},
                   {innerText: 'defense', checked: true},
                   {innerText: 'HP', checked: true},
                   {innerText: 'item delay', checked: false},
                   {innerText: 'dig', checked: false},
                   {innerText: 'shield regen', checked: false}];
    for (option of options){
        option.type = 'checkbox';
        option.value = option.value ? option.value : option.innerText;
        option.id = `${option.type}-${option.value}`;
    }
    add_option_template(parent, label, options);

    button = document.createElement('button');
    button.type = 'button';
    button.innerText = 'Calculate';
    button.id = `${button.type}-${button.innerText}`
    button.setAttribute('onclick', 'onclick_sum_stat(this, this.parentElement)');
    parent.children[parent.children.length-1].append(button);
}

function add_option_for_genders(parent){
    let label = 'Gender: ';
    let options = [{innerText: 'female', checked: true},
                   {innerText: 'male', checked: true},
                   {innerText: 'any', checked: true}];
    for (option of options){
        option.type = 'checkbox';
        option.value = option.innerText.charAt(0);
        option.onclick = 'onclick_filters_gender(this.checked, this.value, "gender")';
        option.id = `${option.type}-${option.value}`;
    }
    add_option_template(parent, label, options);
}

function add_option_template(parent, label, options){
    div = document.createElement('div');
    div.innerText = label;
    parent.append(div);

    for (option of options){
        let input = document.createElement('input');
        let label = document.createElement('label');
        for (const [key, value] of Object.entries(option)){
            if ('innerText' == key) continue;
            else if ('checked' == key){
                input.checked = value;
            }
            else{
                input.setAttribute(key, value);
            }
        }
        label.innerText = option.innerText;
        label.setAttribute('for', option.id);
        div.append(input);
        div.append(label);
    }
}

async function add_tables(){
    let parent = document.getElementById('tables');
    parent.classList.add('row');

    for (url of URLS){
        await get_table(url, parent);
    }

    let checkboxes = ['//*[@id="checkbox-f"]', '//*[@id="checkbox-cash"]', '//*[@id="button-Calculate"]'];
    for (checkbox of checkboxes){
        option = Util.getElementByXpath(checkbox)[0];
        option.checked = true;
        option.click();
    }

    table_tr_add_event(document);
}

async function get_table(url, parent){
    let doc = await Util.fetch_html(url);
    let table = '//table';
    table = await Util.getElementByXpath(table, doc)[0];
    table.id = url;

    Util.table_delete_column(table, null, 0);
//    Util.table_delete_column(table, 'page number');
//    Util.table_insert_column(table, 'sum_stat');
    Util.table_replace_column(table, 'page number', 'sum_stat');

    add_selected_table(table.getElementsByTagName('thead')[0].cloneNode(true));

    //https://www.kryogenix.org/code/browser/sorttable/#ajaxtables
    sorttable.makeSortable(table);

    div = document.createElement('div');
    div.classList.add('column');
    div.append(table);
    parent.append(div);
}

function table_hide_rows(table){
    for (tr of Util.getElementByXpath('.//table/tbody/tr[td[@hidden]]', table)){
        tr.hidden = true;
    }

    for (tr of Util.getElementByXpath('.//table/tbody/tr[@hidden]', table)){
        if (-1 == tr.innerHTML.indexOf('hidden'))
            tr.hidden = false;
    }
}

function table_tr_add_event(table){
    for (tr of Util.getElementByXpath('.//div[@id="tables"]//tbody/tr', table))
        tr.setAttribute('onclick', 'onclick_tr_selected(this, this.parentElement.parentElement)');
}

function onclick_tr_selected(tr, table){
    for (previous of table.getElementsByClassName(ID_SELECTED_ROW))
        previous.classList.remove(ID_SELECTED_ROW);
    tr.classList.add(ID_SELECTED_ROW);

    let new_selected_row = tr.cloneNode(true);
    new_selected_row.removeAttribute('onclick');
    new_selected_row.id = ID_SELECTED_TABLE + table.id;

    let selected_row = document.getElementById(ID_SELECTED_TABLE + table.id);
    selected_row.replaceWith(new_selected_row);

    columns = ['cash price', 'gold price', 'sum_stat', 'popularity', 'speed', 'attack', 'defense', 'HP', 'item delay', 'dig', 'shield regen'];
    sum_columns(document.getElementById(ID_SELECTED_TABLE), columns);
}

function add_selected_table(thead){
    if (document.getElementById(ID_SELECTED_TABLE))
        return;


    parent = document.getElementById('options');
    let table = document.createElement('table');
    let tbody = document.createElement('tbody');
    let tfoot = document.createElement('tfoot');
    let tfoot_tr = document.createElement('tr');
    tfoot.append(tfoot_tr);
    table.append(thead);
    table.append(tbody);
    table.append(tfoot);
    parent.append(table);

    table.id = ID_SELECTED_TABLE;

    for (type of URLS){
        tr = document.createElement('tr');
        tr.id = ID_SELECTED_TABLE + type;
        tbody.append(tr);
    }
    for (cell of thead.getElementsByTagName('th'))
        tfoot_tr.append(document.createElement('td'));
}

function sum_columns(table, columns){
    let xcolumns = [];
    for (column of columns){
        xcolumns.push(Util.get_thead_index(table, column) + 1);
    }

    for (xcolumn of xcolumns){
        let sum = 0;
        for (column of Util.getElementByXpath(`.//tbody/tr/td[${xcolumn}]`, table)){
            sum += Number(column.innerText);
        }
        tfoot = Util.getElementByXpath(`.//tfoot/tr/td[${xcolumn}]`, table)[0];
        tfoot.innerText = sum;
    }
}