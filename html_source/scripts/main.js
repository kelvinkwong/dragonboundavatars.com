async function onload(){
    console.log('onload: start');
    add_options();
    trigger_equipment_selection();
    console.log('onload: end');
}
//https://stackoverflow.com/a/9899701
document.addEventListener('DOMContentLoaded', onload, false);

function onclick_filter_currency(state, name){
    let column = Util.get_thead_index(document.getElementsByTagName('table')[0], name);
    let xpath = `//*[@id="myTable"]/tbody/tr/td[${column}][text() > "0"]`;
    let tbody = Util.getElementByXpath(xpath, document);
    for (td of tbody){
        tr = td.parentElement;
        tr.hidden = !state;
    }
}

function onclick_filters_gender(state, name, header){
    let column = Util.get_thead_index(document.getElementsByTagName('table')[0], header);
    let xpath = `//*[@id="table"]/table/tbody/tr/td[${column}][text() = "${name}"]`
    let tbody = Util.getElementByXpath(xpath, document);

    for (td of tbody){
        tr = td.parentElement;
        //https://stackoverflow.com/a/51187875/14689102
        //tr.style.display = state ? '' : 'none';
        tr.hidden = !state;
    }
}

function onclick_sum_stat(checkboxes){
    console.log('get onclick sum stat');
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
    console.log(sum_column);

    let xpath = `//*[@id="table"]/table/tbody/tr`;
    let tbody = Util.getElementByXpath(xpath, document);

    for (tr of tbody){
        let sum = 0;
        for (const [index, td] of tr.childNodes.entries()){
            let real_index = (index-1)/2;
            if (stats_selected.indexOf(real_index) >= 0){
                sum += Number(td.innerText);
            }
        }
        for (const [index, td] of tr.childNodes.entries()){
            let real_index = (index-1)/2;
            if (real_index == sum_column){
                td.innerText = sum;
                td.setAttribute('sorttable_customkey', String(sum).padStart(2, '0'));
            }
        }
    }
}

function onclick_equipment_type(url){
    console.log('onclick_equipment_type', url);
    table = document.getElementById('table');
    table.innerHTML = '';
    get_table(url);
}

function add_options(){
    parent = document.getElementById('options');
    form = document.createElement('form');
    parent.append(form);

    add_option_for_equipment_type(form);
    add_option_for_currency(form);
    add_option_for_genders(form);
    add_option_for_sum_stat(form);
}

function add_option_for_equipment_type(parent){
    let label = 'Equipment: ';
    let options = [{innerText: 'body', checked: true},
                   {innerText: 'flags', checked: false},
                   {innerText: 'glasses', checked: false},
                   {innerText: 'hats', checked: false}];
    for (option of options){
        option.type = 'radio';
        option.value = `${option.innerText}.html`
        option.name = `${option.type}-equipment`;
        option.onclick = 'onclick_equipment_type(this.value)';
        option.id = `${option.type}-${option.value}`;
    }
    add_option_template(parent, label, options);
}

function add_option_for_currency(parent){
    let label = 'Currencies: ';
    let options = [{innerText: 'cash', checked: true},
                   {innerText: 'gold', checked: true}];
    for (option of options){
        option.type = 'checkbox';
        option.value = option.innerText;
        option.onclick = 'onclick_filter_currency(this.checked, this.value)';
        option.id = `${option.type}-${option.value}`;
    }
    add_option_template(parent, label, options);
}

function add_option_for_sum_stat(parent){
    let label = 'Sum stats: ';
    let options = [{innerText: 'popularity', checked: false},
                   {innerText: 'shot delay', checked: false},
                   {innerText: 'attack', checked: true},
                   {innerText: 'defense', checked: true},
                   {innerText: 'HP', checked: true},
                   {innerText: 'item delay', checked: false},
                   {innerText: 'dig', checked: false},
                   {innerText: 'shield regen', checked: false}];
    for (option of options){
        option.type = 'checkbox';
        option.value = option.innerText;
        option.onclick = 'onclick_sum_stat(this.parentElement)';
        option.id = `${option.type}-${option.value}`;
    }
    add_option_template(parent, label, options);
}

function add_option_for_genders(parent){
    let label = 'Gender: ';
    let options = [{innerText: 'female', checked: true},
                   {innerText: 'male', checked: true}];
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
            if ('checked' == key){
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

async function trigger_equipment_selection(){
    let xpath = '//*[@id="radio-body.html"]';
    option = Util.getElementByXpath(xpath)[0];
    await option.click();
}

async function get_table(url){
    let doc = await Util.fetch_html(url);
    let table = '//table';

    table = Util.getElementByXpath(table, doc)[0];
    //https://www.kryogenix.org/code/browser/sorttable/#ajaxtables

//    Util.table_delete_column(table, null, 1);
//    Util.table_delete_column(table, 'page number');
    Util.table_insert_column(table, 'sum_stat');

    sorttable.makeSortable(table);

    div = document.getElementById('table');
    div.append(table);

    let checkboxes = ['//*[@id="checkbox-f"]', '//*[@id="checkbox-cash"]', '//*[@id="checkbox-popularity"]'];
    for (checkbox of checkboxes){
        option = Util.getElementByXpath(checkbox)[0];
        option.click();
    }

    return table;
}