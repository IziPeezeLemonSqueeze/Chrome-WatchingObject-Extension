const root = document.getElementById('snippet_body');
let list = root.childNodes[3].childNodes[3]
let nButton = [];
let dialog = document.getElementById('dialog');
let mapValue = new Map();

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

chrome.runtime.onMessage.addListener((obj, sender, response) =>
{
    console.log('ARRIVED SNIPPET', obj);
    if (obj.response && obj.response.includes('snippet_'))
    {
        switch (obj.response)
        {
            case 'snippet_resetDialog':
                hideHandlerDialogInfo();
                break;
            case 'snippet_showErrorDialog':
                console.log(obj.payload);
                showHandlerDialogError(obj.payload);
                break;
        }
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
            btnRun.style = items[k].ivcFound ?
                "background-color: darkorange;margin-left: auto;margin-right: 1%;size: unset;max-height: 25px;" :
                "margin-left: auto;margin-right: 1%;size: unset;max-height: 25px;"

            btnRun.id = k + '-run';
            btnRun.title = items[k].ivcFound ?
                'Esegui subito il codice!\n--⚠️-- ATTENZIONE --⚠️--\n Inserirai delle variabili prima della vera esecuzione!' :
                'Esegui subito il codice!'
            btnRun.className = 'slds-button slds-button_success';

            let btnMod = document.createElement('button');
            btnMod.innerText = '💾';
            btnMod.id = k + '-mod';
            btnMod.title = 'Copia il codice!'
            btnMod.className = 'slds-button slds-button_outline-brand';
            btnMod.style = 'max-height: 25px;';

            let btnRemove = document.createElement('button');
            btnRemove.innerText = '🚽';
            btnRemove.id = k + '-del';
            btnRemove.title = 'Butta il codice!'
            btnRemove.className = 'slds-button slds-button_outline-brand';
            btnRemove.style = 'max-height: 25px;';

            let span = document.createElement('span');
            span.innerText = k.replace('snippet_', '');
            span.title = items[k].code;
            span.id = k + '-span';

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
        console.log(nButton);
        let id = String(btnIdx.doc.id).split('-')
        switch (id[1])
        {
            case 'run':
                console.log(id[0], 'RUN');
                btnIdx.doc.addEventListener('click', () =>
                {
                    handler_run(btnIdx.doc, btnIdx.payload, btnIdx.id);
                });
                break;
            case 'mod':
                console.log(id[0], 'MOD');
                btnIdx.doc.addEventListener('click', () =>
                {
                    handler_mod(document.getElementById(btnIdx.id + '-span').title);
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

let intervalHideErrorDIalog;
let secAutoClose = 5;
let divErrorDialog = document.createElement('div');
const showHandlerDialogError = (textObj) =>
{
    //initDialog();
    console.log('TESTO ERRORE DIALOG', textObj);
    divErrorDialog.id = 'divErrorDialog';
    divErrorDialog.className = 'column';
    divErrorDialog.style = "-webkit-text-stroke-width: medium;text-align-last: center;"
    let span = document.createElement('span');
    span.innerText = textObj;
    let btn = document.createElement('button');
    btn.className = 'slds-button slds-button_brand';


    btn.addEventListener('click', () =>
    {
        hideHandlerDialogError();
        chrome.runtime.sendMessage({
            type: 'WO_CODESNIPPET_forceResetDialog'
        });
    });

    intervalHideErrorDIalog = setInterval(() =>
    {
        if (secAutoClose <= 1)
        {
            hideHandlerDialogError();
        }
        secAutoClose--;
        btn.innerText = `Ok ...${secAutoClose}`;
    }, 1000);

    divErrorDialog.appendChild(span);
    divErrorDialog.appendChild(document.createElement('br'));
    divErrorDialog.appendChild(btn);

    dialog.innerText = 'ERRORE: ';
    dialog.appendChild(divErrorDialog);
    dialog.setAttribute('open', '');
}

const hideHandlerDialogError = () =>
{
    try
    {
        clearInterval(intervalHideErrorDIalog);
    } catch (e) { }
    secAutoClose = 5;

    dialog.innerHTML = '';
    hideHandlerDialogInfo();
}

const showHandlerDialogInfo = (textDialog) =>
{
    dialog.setAttribute('z-index', '2000000000000000000');
    dialog.innerText = textDialog;
    dialog.setAttribute('open', '');

    nButton.forEach(btn =>
    {
        btn.doc.setAttribute('disabled', '');
    });
}

const hideHandlerDialogInfo = () =>
{
    dialog.innerText = '';
    dialog.removeAttribute('open');
    nButton.forEach(btn =>
    {
        btn.doc.removeAttribute('disabled');
    });
}

const handler_run = (doc, payload, id) =>
{
    console.log('HANDLING RUN BUTTON', payload);
    showHandlerDialogInfo('Snippet in RUN...Attendere!', [doc.id]);

    if (payload.ivcFound != null && payload.ivcFound.length > 0)
    {
        payload.ivcFound.forEach((ivc) =>
        {
            console.log(ivc);
            if (ivc.includes('@ID'))
            {
                let name = ivc.replace('@ID', '');
                !mapValue.has(name) ?
                    mapValue.set(name, {
                        type: 'ID',
                        name: name,
                        ivc: ivc
                    }) :
                    null;

            } else if (ivc.includes('@NMB'))
            {
                let name = ivc.replace('@NMB', '');
                !mapValue.has(name) ?
                    mapValue.set(name, {
                        type: 'NMB',
                        name: name,
                        ivc: ivc
                    }) :
                    null;
            } else if (ivc.includes('@BOL'))
            {
                let name = ivc.replace('@BOL', '');
                !mapValue.has(name) ?
                    mapValue.set(name, {
                        type: 'BOL',
                        name: name,
                        ivc: ivc
                    }) :
                    null;
            } else if (ivc.includes('@STR'))
            {
                let name = ivc.replace('@STR', '');

                !mapValue.has(name) ?
                    mapValue.set(name, {
                        type: 'STR',
                        name: name,
                        ivc: ivc
                    }) :
                    null;
            } else if (ivc.includes('@V'))
            {
                let name = ivc.replace('@V', '');
                !mapValue.has(name) ?
                    mapValue.set(name, {
                        type: 'V',
                        name: name,
                        ivc: ivc
                    }) :
                    null;
            }
        });
        console.log('CHECK 1', mapValue);
        chrome.runtime.sendMessage({
            type: 'WO_CODESNIPPET_openDialogVar',
            payload: [Object.fromEntries(mapValue), payload.code, id]

        });
        /* 
                console.log('CHECK 2', mapValue.values());
                mapValue.forEach(k =>
                {
                    console.log('CHECK 3', k);
                    while (payload.code.includes(k.ivc))
                    {
                        let splitted = [];
        
                        if (k.type == 'V')
                        {
                            splitted = payload.code.split(k.ivc);
                        } else
                        {
                            splitted = payload.code.split("'" + k.ivc + "'");
                        }
                        console.log('QUI', splitted)
                        payload.code = String(splitted[0] +
                            (k.type == 'STR' || k.type == 'ID' ?
                                ("'" + k.value + "'") :
                                k.value)
                            + splitted[1]);
        
                    }
                });
                console.log('FINAL ', payload.code);
                payload.code = payload.code.replaceAll('\n', ''); */
    } else
    {
        chrome.runtime.sendMessage({
            type: 'WO_CODESNIPPET_run',
            payload: payload.code.replaceAll('\n', ''),
            resetTimeoutDialogTime: secAutoClose
        });
    }

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