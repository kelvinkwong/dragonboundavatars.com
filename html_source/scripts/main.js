async function onload(){
    console.log('onload: start');
    await get_table();
    add_options();
    console.log('onload: end');
}
onload();

function add_column(table){
    Util.table_insert_column(table, 'sum_stat');
}

function onclick_filter_currency(state, name){
    let column = Util.get_thead_index(document.getElementsByTagName('table')[0], name);
    let xpath = `//*[@id="myTable"]/tbody/tr/td[${column}][text() = "0"]`;
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
            }
        }
    }
}

function add_options(){
    parent = document.getElementById('options');

    add_option_for_currency(parent);
    add_option_for_genders(parent);
    add_option_for_sum_stat(parent);
}

function add_option_for_currency(parent){
    let label = 'Currencies: ';
    let options = [{value: 'cash', checked: false},
                   {value: 'gold', checked: true}];
    for (option of options){
        option.type = 'checkbox';
        option.onclick = 'onclick_filter_currency(this.checked, this.value)';
        option.id = `${option.type}-${option.value}`;
    }
    add_option_template(parent, label, options);
}

function add_option_for_sum_stat(parent){
    let label = 'Sum stats: ';
    let options = [{value: 'popularity', checked: true},
                   {value: 'speed', checked: false},
                   {value: 'attack', checked: true},
                   {value: 'defense', checked: true},
                   {value: 'HP', checked: true},
                   {value: 'item delay', checked: false},
                   {value: 'dig', checked: false},
                   {value: 'shield regen', checked: false}];
    for (option of options){
        option.type = 'checkbox';
        option.onclick = 'onclick_sum_stat(this.parentElement)';
        option.id = `${option.type}-${option.value}`;
    }
    add_option_template(parent, label, options);
}

function add_option_for_genders(parent){
    let label = 'Gender: ';
    let options = [{value: 'female', checked: false},
                   {value: 'male', checked: true}];
    for (option of options){
        option.type = 'checkbox';
        option.onclick = 'onclick_filters_gender(this.checked, this.value.charAt(0), "gender")';
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
            if ('checked' == key){
                input.checked = value;
            }
            else{
                input.setAttribute(key, value);
            }
        }
        label.innerText = option.value;
        label.setAttribute('for', option.id);
        div.append(input);
        div.append(label);
    }
}

async function get_table(){
    let doc = await Util.fetch_html('./body.html');
    let table = '//table';

    table = Util.getElementByXpath(table, doc);
    table = table[0];
    //https://www.kryogenix.org/code/browser/sorttable/#ajaxtables
    add_column(table);
    sorttable.makeSortable(table);

    div = document.getElementById('table');
    div.append(table);

    return table;
}