const root = document.getElementById('snippet_body');
const list = root.childNodes[1].childNodes[3]

let nButton = [];
chrome.storage.onChanged.addListener(async (changes, namespace) =>
{
    console.log(Object.entries(changes)[0])
    const obj = Object.entries(changes)[0]
    if (namespace == 'local' && obj[0].includes('snippet_'))
    {
        let obj_item = {};
        obj_item[obj[0]] = obj[1].newValue;
        console.log('RESULT OBJ ', obj_item)
        await creatorElementList(obj_item);

    }
});

const createObjectList = () =>
{
    chrome.storage.local.get(null, async (items) =>
    {
        if (await items)
        {
            console.log('ITEMS ', items);
            creatorElementList(items);
        }
    });
}

const creatorElementList = async (items) =>
{
    console.log('CREATOR : ', items);
    Object.keys(await items).forEach((k, i) =>
    {
        if (k.includes('snippet_'))
        {
            let li = document.createElement('li');
            li.id = k;

            let div = document.createElement('div');
            div.className = 'row';
            div.style = "display: flex; margin-top: 1%";

            let btnRun = document.createElement('button');
            btnRun.innerText = 'Run 🚀';
            btnRun.style = "margin-left: auto; margin-right: 1%"
            btnRun.id = k + '-run';
            btnRun.title = 'Esegui subito il codice!'

            let btnMod = document.createElement('button');
            btnMod.innerText = '💾';
            btnMod.id = k + '-mod';
            btnMod.title = 'Copia il codice!'

            let btnRemove = document.createElement('button');
            btnRemove.innerText = '🚽';
            btnRemove.id = k + '-del';
            btnRemove.title = 'Butta il codice!'


            let span = document.createElement('span');
            span.innerText = k.replace('snippet_', '');
            span.title = items[k];

            div.appendChild(span);
            div.appendChild(btnRun);
            div.appendChild(btnMod);
            div.appendChild(btnRemove);
            li.appendChild(div);

            list.appendChild(li);
            let hr = document.createElement('hr');
            hr.style = "margin-bottom: -0.2%;margin-top: 0.6%;"
            hr.id = k;
            list.appendChild(hr);


            nButton.push({ doc: document.getElementById(k + '-run'), payload: items[k], id: k });
            nButton.push({ doc: document.getElementById(k + '-mod'), payload: items[k], id: k });
            nButton.push({ doc: document.getElementById(k + '-del'), payload: null, id: k });
        }
    });

    nButton.forEach(btnIdx =>
    {
        //console.log(btnIdx);
        let id = String(btnIdx.doc.id).split('-')
        switch (id[1])
        {
            case 'run':
                console.log(id[0], 'RUN');
                btnIdx.doc.addEventListener('click', () =>
                {
                    handler_run(btnIdx.payload);
                });
                break;
            case 'mod':
                console.log(id[0], 'MOD');
                btnIdx.doc.addEventListener('click', () =>
                {
                    handler_mod(btnIdx.payload);
                });
                break;
            case 'del':
                console.log(id[0], 'DEL');
                btnIdx.doc.addEventListener('click', () =>
                {
                    handler_del(btnIdx.id);
                });
                break;

        }
    });

}

const handler_run = (args) =>
{
    console.log('HANDLING RUN BUTTON', args);
    chrome.runtime.sendMessage({
        type: 'WO_CODESNIPPET_run',
        payload: args
    });
}

const handler_mod = (args) =>
{
    console.log('HANDLING MOD BUTTON', args);
    chrome.runtime.sendMessage({
        type: 'WO_CODESNIPPET_edit',
        payload: args
    });
}

const handler_del = (args) =>
{
    console.log('HANDLING DEL BUTTON', args);
    chrome.storage.local.remove([args]);
    list.removeChild(document.getElementById(args));
    list.removeChild(document.getElementById(args));
    //createObjectList();
}

createObjectList();