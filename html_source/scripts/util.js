Util = {};

Util.getElementByXpath = function (path, document) {
    //https://stackoverflow.com/a/68216786/14689102
    snapshot = document.evaluate(path, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
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

Util.get_thead_index = function (name){
    let xpath = '//*[@id="myTable"]/thead/tr/th';
    let thead = Util.getElementByXpath(xpath, document);
    let column = null;
    for (const [index, th] of thead.entries()){
        console.log(index, th, th.innerText.indexOf(name));
        if (th.innerText.indexOf(name) >= 0)
            column = index;
    }
    return column;
}