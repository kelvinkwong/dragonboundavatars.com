Util = {};

Util.getElementByXpath = function (path, parent) {
    //https://stackoverflow.com/a/68216786/14689102
    //https://stackoverflow.com/a/42600459
    snapshot = document.evaluate(path, parent || document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    return [...Array(snapshot.snapshotLength)]
        .map((_, i) => snapshot.snapshotItem(i));
}

//async function fetch_html(url){
Util.fetch_html = async function (url){
    //https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
    const response = await fetch(url);

    //https://stackoverflow.com/a/50812705
    let parser = new DOMParser();
    let doc = parser.parseFromString(await response.text(), "text/html");

    return doc;
}

Util.get_thead_index = function (table, name){
    let thead = Util.getElementByXpath('.//th', table);
    let column = null;
    for (const [index, th] of thead.entries()){
//        console.log(index, th, th.innerText.indexOf(name));
        if (th.innerText.indexOf(name) >= 0)
            column = index;
    }
    return column;
}

Util.table_insert_column = function (table, name){
    console.log('enter table_insert_column');
    let thead = Util.getElementByXpath('.//thead/tr', table)[0];
    let th = document.createElement('th');
    th.innerText = name;
    thead.append(th);

    for (tr of Util.getElementByXpath('.//tbody/tr', table)){
        let td = document.createElement('td');
        tr.append(td)
    }
}

Util.table_delete_column = function (table, name, column){
    if (column == null){
        column = Util.get_thead_index(table, name);
    }

    for (th of Util.getElementByXpath(`.//thead/tr/th[${column}]`, table)){
        console.log(th);
        th.parentElement.removeChild(th);
    }

    for (td of Util.getElementByXpath(`.//tbody/tr/td[${column}]`, table)){
        console.log(td);
        td.parentElement.removeChild(td);
    }
}