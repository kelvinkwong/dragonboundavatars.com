async function onload(){
    console.log('onload: start');
    await get_table();
    add_options();
    console.log('onload: end');
}
onload();

function onclick_filter_currency(state, name){
    let column = Util.get_thead_index(name);
    let xpath = `//*[@id="myTable"]/tbody/tr/td[${column}][text() = "0"]`;
    let tbody = Util.getElementByXpath(xpath, document);
    for (td of tbody){
        tr = td.parentElement;
        tr.hidden = !state;
    }
}

function onclick_filters_gender(state, name, header){
    let column = Util.get_thead_index(header);
    let xpath = `//*[@id="table"]/table/tbody/tr/td[${column}][text() = "${name}"]`
    let tbody = Util.getElementByXpath(xpath, document);

    for (td of tbody){
        tr = td.parentElement;
        //https://stackoverflow.com/a/51187875/14689102
        //tr.style.display = state ? '' : 'none';
        tr.hidden = !state;
    }
}

function onclick_sum_stat(object){


    return;
    let xpath = `//*[@id="table"]/table/tbody/tr/td[13][text() = "${name}"]`
    let tbody = Util.getElementByXpath(xpath, document);

    for (td of tbody){
        tr = td.parentElement;
        //https://stackoverflow.com/a/51187875/14689102
        //tr.style.display = state ? '' : 'none';
        tr.hidden = !state;
    }
}

function add_options(){
    parent = document.getElementById('options');

    add_option_for_currency(parent);
    add_option_for_genders(parent);
    add_option_for_sum_stat(parent);
}

function add_option_for_currency(parent){
    div = document.createElement('div');
    div.innerText = 'Currencies: ';
    parent.append(div);
    currencies = ['cash', 'gold'];
    for (currency of currencies){
        input = document.createElement('input');
        input.type = 'checkbox';
        input.id = currency;
        input.value = currency;
        input.checked = true;
        input.setAttribute('onclick', 'onclick_filter_currency(this.checked, this.value)');
        label = document.createElement('label');
        label.innerText = currency;
        label.setAttribute('for', currency);
        div.append(input);
        div.append(label);
    }
}

function add_option_for_genders(parent){
    div = document.createElement('div');
    div.innerText = 'Gender: ';
    parent.append(div);
    currencies = ['female', 'male'];
    for (currency of currencies){
        input = document.createElement('input');
        input.type = 'checkbox';
        input.id = currency;
        input.value = currency;
        input.checked = true;
        input.setAttribute('onclick', 'onclick_filters_gender(this.checked, this.value.charAt(0), "gender")');
        label = document.createElement('label');
        label.innerText = currency;
        label.setAttribute('for', currency);
        div.append(input);
        div.append(label);
    }
}

function add_option_for_sum_stat(parent){
    div = document.createElement('div');
    div.innerText = 'Sum stats: ';
    parent.append(div);
    currencies = ['popularity', 'speed', 'attack', 'defense', 'HP', 'item delay', 'dig', 'shield regen'];
    for (currency of currencies){
        input = document.createElement('input');
        input.type = 'checkbox';
        input.id = currency;
        input.value = currency;
        input.checked = true;
        input.setAttribute('onclick', 'onclick_sum_stat(this)');
        label = document.createElement('label');
        label.innerText = currency;
        label.setAttribute('for', currency);
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
    sorttable.makeSortable(table);

    div = document.getElementById('table');
    div.append(table);

    return table;
}