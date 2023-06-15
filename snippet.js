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
            btnRun.style = items[k].ivcFound ?
                "background-color: darkorange;margin-left: auto; margin-right: 1%" :
                "margin-left: auto; margin-right: 1%"

            btnRun.id = k + '-run';
            btnRun.title = items[k].ivcFound ?
                'Esegui subito il codice!\n--⚠️-- ATTENZIONE --⚠️--\n Inserirai delle variabili prima della vera esecuzione!' :
                'Esegui subito il codice!'

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
                    handler_run(btnIdx.payload);
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

const handler_run = (args) =>
{
    console.log('HANDLING RUN BUTTON', args);
    let mapValue = new Map();
    if (args.ivcFound != null && args.ivcFound.length > 0)
    {
        args.ivcFound.forEach((ivc) =>
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

        mapValue.forEach(k =>
        {
            let rows = args.code.split('\n');
            rows.forEach(row =>
            {
                let rowGood = row;
                if (rowGood.includes('//'))
                {
                    rowGood = rowGood.replace('//', '/*')
                    rowGood += '*/'
                }
                if (rowGood.includes(k.ivc))
                {
                    let promptRow = `Inserisci il valore per ${k.name}
                    Tipo: ${k.type == 'STR' ?
                            'STRINGA' :
                            k.type == 'ID' ?
                                'STRINGA' :
                                k.type == 'NMB' ?
                                    'NUMERO' :
                                    k.type == 'BOL' ?
                                        'BOOLEANO' :
                                        k.type == 'V' ?
                                            'QUALSIASI, Variabile senza segno, QUA SI PUOSSONO USARE LE VIRGOLETTE!' :
                                            null
                        }
                    ${k.type != 'V' ?
                            'NON INSERIRE MAI LE VIRGOLETTE  ""' : null} 
                    ------   CODE_LINE_START  ------
                    ${rowGood}  
                    ------   CODE_LINE_STOP   ------`;

                    let vPrompt = '';
                    switch (k.type)
                    {
                        case 'ID':
                            let insertError = false;
                            let okId = false
                            while (!okId)
                            {
                                if (insertError)
                                {
                                    promptRow += '\nInserito ID che non rispetta i 18 caratteri';
                                }
                                vPrompt = prompt(promptRow);
                                vPrompt.length < 18 ?
                                    insertError = true : okId = true;
                            }
                            k.value = vPrompt;
                            break;
                        default:
                            k.value = prompt(promptRow);
                            break;
                    }

                    console.log(mapValue.id)

                }
            })
        });
        console.log('CHECK 2', mapValue.values());
        mapValue.forEach(k =>
        {
            console.log('CHECK 3', k);
            while (args.code.includes(k.ivc))
            {
                let splitted = [];

                if (k.type == 'V')
                {
                    splitted = args.code.split(k.ivc);
                } else
                {
                    splitted = args.code.split("'" + k.ivc + "'");
                }
                console.log('QUI', splitted)
                args.code = String(splitted[0] +
                    (k.type == 'STR' || k.type == 'ID' ?
                        ("'" + k.value + "'") :
                        k.value)
                    + splitted[1]);

            }
        });
        console.log('FINAL ', args.code);
        args.code = args.code.replaceAll('\n', '');
    }

    chrome.runtime.sendMessage({
        type: 'WO_CODESNIPPET_run',
        payload: args.code
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