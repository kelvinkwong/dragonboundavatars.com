Util = {};

Util.getElementByXpath = function (path, parent) {
    //https://stackoverflow.com/a/68216786/14689102
    //https://stackoverflow.com/a/42600459
    snapshot = document.evaluate(path, parent || document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    return [...Array(snapshot.snapshotLength)]
        .map((_, i) => snapshot.snapshotItem(i));
}

Util.fetch_html = async function (url){
    //https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
    const response = await fetch(url);

    //https://stackoverflow.com/a/50812705
    let parser = new DOMParser();
    let doc = parser.parseFromString(await response.text(), "text/html");

    return doc;
}

Util.get_thead_index = function (table, name){
    let thead = Util.getElementByXpath('.//thead/tr/th', table);
    for (const [index, th] of thead.entries()){
//        console.log(index, th, th.innerText.indexOf(name));
        if (th.innerText.indexOf(name) >= 0)
            return index;
    }
}

Util.table_insert_column = function (table, name){
//    console.log('enter table_insert_column');
    let thead = Util.getElementByXpath('.//thead/tr', table)[0];
    let th = document.createElement('th');
    th.innerText = name;
    thead.append(th);

    for (tr of Util.getElementByXpath('.//tbody/tr', table))
        tr.append(document.createElement('td'));
}

Util.table_delete_column = function (table, name, column){
    if (column == null)
        column = Util.get_thead_index(table, name);

    for (tr of Util.getElementByXpath('.//tr', table))
        tr.removeChild(tr.children[column]);
}

Util.table_replace_column = function (table, old_name, new_name){
    let xcolumn = Util.get_thead_index(table, old_name) + 1;

    for (th of Util.getElementByXpath(`//table/thead/tr/th[${xcolumn}]`, table))
        th.innerText = new_name;

    for (td of Util.getElementByXpath(`//table/tbody/tr/td[${xcolumn}]`, table))
        td.innerText = '';
}