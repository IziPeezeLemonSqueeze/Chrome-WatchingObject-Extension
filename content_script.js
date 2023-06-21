(() =>
{
    let salesforceBody;

    let developerConsoleBody;

    let windowAnonymCode;
    let consoleIntervalSearch;
    let btnCodeSnippet;
    let codeSnippetOpen = false;
    let dialogVarOpen = false;
    let frameSnippet = null;
    let windowApexCode;
    let divDCTOOL;

    let currentObject = {};
    let watchingBtn;
    let woToolBtn;
    let toolOpen = false;

    chrome.runtime.onMessage.addListener((obj, sender, response) =>
    {
        console.log('ARRIVED CS ', obj);
        if (obj.response)
        {
            // GESTIONE RESPONSE FROM BACKGROUND.JS
            switch (obj.response)
            {
                case 'resetNewWatch':
                    setTimeout(() =>
                    {
                        watchingBtn.removeAttribute('disabled');
                        watchingBtn.className = 'watching-btn slds-button slds-button_brand';
                        watchingBtn.innerText = `Aggiungi ${currentObject.title.split('|')[0]} alla Watchlist`;
                    }, 1000);
                    break;
                case 'devConsole':
                    consoleIntervalSearch = setInterval(() =>
                    {
                        devConsoleTool();
                    }, 2000);
                    break;
                case 'popupNameSnippet':
                    makeSnippet(obj.payload);
                    break;
                case 'copyApexSnippet':
                    copyApexSnippet(obj.payload);
                    hideCS(windowApexCode);
                    break;

                case 'openDialogVar':
                    if (!dialogVarOpen)
                    {
                        openDialogVar(obj.payload);
                    }
                    break;



                case 'resetCodeSnippet':
                    console.log('RESET')
                    hideCS(windowApexCode);
                    showCS(divDCTOOL, windowApexCode);
                    break;


            }
        } else
        {
            const { tab, title, sObject, Id } = obj;
            if (sObject)
            {
                try
                {
                    currentObject = {
                        tab: tab,
                        title: title,
                        sObject: sObject,
                        Id: Id
                    };
                    newWatching();

                } catch (e)
                {
                    console.log(e);
                }
            } else
            {
                removeFromWatchingList();
            }
        }
        newDock();
    });

    const newWatching = () =>
    {
        const watchingBtnExist = document.getElementsByClassName('watching-btn slds-button slds-button_brand')[0];

        if (!watchingBtnExist)
        {
            watchingBtn = document.createElement('button');
            //watchingBtn.type = 'button';
            watchingBtn.className = 'watching-btn slds-button slds-button_brand';
            watchingBtn.innerText = `Aggiungi ${currentObject.title.split('|')[0]} alla Watchlist`;
            watchingBtn.style = 'bottom: 10px; position: fixed; right: 30px; z-index:10;';

            /*  salesforceBody = document.getElementsByClassName('slds-global-header')[0]; slds-context-bar */
            setTimeout(() =>
            {
                salesforceBody = document.getElementsByClassName('desktop')[0];
                //console.log('BODY TO ATTACH', salesforceBody);
                salesforceBody.appendChild(watchingBtn);
                watchingBtn.addEventListener('click', addToWatchList);
            }, 1000);

        }
    }

    const devConsoleTool = () => 
    {
        try
        {
            windowAnonymCode = document.getElementById('executeHighlightedButton').parentElement;
            //console.log('START DEV CONSOLE TOOL: ', windowAnonymCode);

            if (windowAnonymCode)
            {
                clearInterval(consoleIntervalSearch);
                if (!document.getElementsByClassName('DCSnippet')[0])
                {
                    btnCodeSnippet = document.createElement('button');
                    btnCodeSnippet.className = 'DCSnippet x-btn x-box-item x-toolbar-item x-btn-default-toolbar-small x-noicon x-btn-noicon x-btn-default-toolbar-small-noicon';
                    btnCodeSnippet.innerText = 'Code Snippet';
                    btnCodeSnippet.style = 'height: 22px';

                    windowAnonymCode.appendChild(btnCodeSnippet);

                    btnCodeSnippet.addEventListener('click', showHideCodeSnippet);
                }
            }
        } catch (e) { console.log(e) }
    }

    const showHideCodeSnippet = () => 
    {
        divDCTOOL = document.createElement('div');
        divDCTOOL.id = 'DCTOOL';
        divDCTOOL.style =
            'z-index: 1000;display: flex;position: relative;bottom: 137px;left: 77px;';

        windowApexCode = windowAnonymCode.parentElement.parentElement.parentElement.parentElement.parentElement;
        if (!codeSnippetOpen)
        {
            showCS(divDCTOOL, windowApexCode);
        } else
        {
            hideCS(windowApexCode);
        }
    }

    const showCS = (div, windowApexCode) =>
    {
        codeSnippetOpen = true;
        frameSnippet = document.createElement('iframe');
        frameSnippet.src = chrome.runtime.getURL('snippet.html');
        frameSnippet.style = 'width: 600px; height: 285px; border: 0; ';
        div.appendChild(frameSnippet);
        windowApexCode.appendChild(div);
    }

    const hideCS = (windowApexCode) =>
    {
        codeSnippetOpen = false;
        console.log('WINDOW', windowApexCode)
        divDCTOOL = document.createElement('div');
        divDCTOOL.id = 'DCTOOL';
        divDCTOOL.style =
            'z-index: 1000;display: flex;position: relative;bottom: 137px;left: 77px;';
        windowApexCode.removeChild(document.getElementById('DCTOOL'));
    }

    // indentifierVariabileOnCode + ivc

    const makeSnippet = (payload) =>
    {
        const name = prompt('Nome Snippet?');
        // TODO CONTORLLO SUI DUPLICATI
        const regexIVC = /@\b[\@V\@ID\@INT\@BOL\@STR]\w+(?='*)/g;
        const countIVC = String(payload).match(regexIVC);
        console.log(countIVC);

        chrome.storage.local.set({
            ['snippet_' + name]: {
                code: payload,
                ivcFound: countIVC
            }
        });
    }

    const copyApexSnippet = (codeTxt) =>
    {
        copyToClipboard(codeTxt);
    }

    const openDialogVar = ([mapValue, code, id]) =>
    {
        const nomeSnippet = id;
        dialogVarOpen = true;
        try
        {
            developerConsoleBody = document.getElementById('ext-gen1361');
        } catch (e) { console.error('DEVELOPER_CONSOLE_BODY NOT FOUND >>>'); }

        developerConsoleBody ?
            null :
            developerConsoleBody = document.getElementsByClassName('ApexCSIPage')[0];

        let dialog = document.createElement('dialog');
        dialog.id = 'dialogvar';
        let title = document.createElement('h4');
        title.innerText = 'CODE SNIPPET - Assegnazione valori!\nNOME SNIPPET: ' + id.replace('snippet_', '');

        dialog.setAttribute('open', '');
        dialog.style = "background-color: rgba(255, 255, 255, 0.8);border-color: grey;border-radius: 10px;border-width: 1px;margin: 5%;min-width: -webkit-fill-available;position: absolute;z-index: 1000000000;top: 1%;box-shadow: rgba(0, 0, 0, 0.11) 0px 0 7px 9px;height: 506px;"

        let list = document.createElement('ul');
        list.style = "min-height: 130px; overflow-y: scroll";
        list.className = "slds-has-block-links_space";
        list.id = 'list-dialogvar';

        let div = document.createElement('div');
        div.className = 'row';
        div.style = "margin-top: 3%;min-height: 400px;height: 400px;display: flex;flex-flow: row nowrap;justify-content: space-evenly;align-items: flex-start;flex-wrap: nowrap;flex-direction: row;"

        let divRight = document.createElement('div');
        divRight.style = "height: -webkit-fill-available;display: flex;flex-wrap: nowrap;align-items: center;flex-direction: column;";
        divRight.className = 'col-4';

        let divCenter = document.createElement('div');
        divCenter.style = "background-color: rgba(255,255,255);height: -webkit-fill-available;display: flex;flex-direction: column-reverse;place-content: center space-between;"

        divCenter.className = 'col-4';


        let divCenterContent = document.createElement('div');
        divCenterContent.className = 'col';

        let divCenterActions = document.createElement('div');
        divCenterActions.className = 'col-4';
        divCenterActions.style = "margin-top: 5%;display: flex;align-items: flex-start;flex-direction: row;justify-content: space-around;"

        div.appendChild(divCenter);
        divCenter.appendChild(divCenterActions);
        divCenter.appendChild(divCenterContent);
        div.appendChild(divRight);
        const mapType = new Map(
            [
                ['ID', 'ID, qui puoi mettere solo ID, c\'è il controllo dei 18 caratteri!.\nNIENTE VIRGOLETTE O APICI'],
                ['NMB', 'Numero, qui puoi mettere solo numeri, rappresenta qualsiasi tipo di numero: Int, Float, Decimal ecc...\nNIENTE VIRGOLETTE O APICI'],
                ['STR', 'Stringa, qui puoi mettere solo del testo.\nNIENTE VIRGOLETTE O APICI'],
                ['BOL', 'Boolean, qui puoi mettere true o false\nNIENTE VIRGOLETTE O APICI'],
                ['V', 'Any, qui puoi mettere qualsiasi cosa. QUI LE VIRGOLETTE SONO AMMESSE, dipende dai casi. Utile nella concatenazione di Stringhe'],
            ]);
        console.log('mapValue', mapValue);

        let lastValueInserted = new Map();
        let codeModified = code;

        Object.entries(mapValue).forEach((elem, idx) =>
        {
            let el = elem[1];
            console.log(el, idx);
            let spanTestoTipo = document.createElement('p');
            spanTestoTipo.id = 'spantestotipo';
            let nameVar = document.createElement('h2');
            nameVar.innerText = el.name;
            spanTestoTipo.innerText =
                'Inserisci il valore per la variabile: ';
            spanTestoTipo.appendChild(nameVar);

            let spanTestoVarName = document.createElement('p');
            spanTestoVarName.id = 'spantestovarname';
            spanTestoVarName.innerText =
                `La variabile è di tipo: ${mapType.get(el.type) ? el.type : 'UNDEFINED'}
                Descrizione Tipo: ${mapType.get(el.type)}
                `;

            let isInvalidField = false;
            let input = document.createElement('input');
            input.id = 'input-dialogvar' + id + '_' + el.name;
            input.setAttribute('type', 'text');
            input.className = "dialogerror";
            input.style = "width: -webkit-fill-available;"
            input.placeholder = 'Inserisci qui il valore che vuoi assegnare!';

            input.addEventListener('input', (e) =>
            {
                if (e.target.value == '' || !e.target.value)
                {
                    delete elem[1].value;
                }
            });

            input.addEventListener('focusout', (e) =>
            {
                console.log(e.target.value);
                try
                {
                    if (!input.className.includes('dialoggood'))
                    {
                        input.className = 'dialoggood';
                    }
                    input.className.replace('dialogerror', 'dialoggood');
                    isInvalidField = false;
                } catch (e) { }
                switch (el.type)
                {
                    case 'V':
                        if (e.target.value.length < 1) 
                        {
                            returnInvalid();
                        }
                        if (!isInvalidField)
                        {
                            lastValueInserted.set(el.ivc, e.target.value);
                            if (!codeModified.includes(el.ivc) &&
                                !lastValueInserted.get(el.ivc).includes("'")) 
                            {
                                codeModified = codeModified.replace(lastValueInserted.get(el.ivc), el.ivc);
                                elem[1].value = '';
                            } else if (!codeModified.includes("'" + el.ivc + "'") && lastValueInserted.get(el.ivc).includes("'"))
                            {
                                codeModified = codeModified
                                    .replace(lastValueInserted.get(el.ivc), "'" + el.ivc + "'");
                                elem[1].value = '';
                            }

                            if (codeModified.includes("'" + el.ivc + "'"))
                            {
                                codeModified = codeModified.replace("'" + el.ivc + "'", e.target.value);
                            } else if (codeModified.includes(el.ivc))
                            {
                                codeModified = codeModified.replace(el.ivc, e.target.value);
                            }
                            elem[1].value = e.target.value;
                        } else
                        {
                            codeModified = codeModified.replace(lastValueInserted.get(el.ivc), "'" + el.ivc + "'");
                        }
                        break;
                    case 'ID':
                        if (checkVirgolette(e.target.value))
                        {
                            returnInvalid();
                        }
                        if (input.value.length != 18)
                        {
                            returnInvalid();
                        }
                        if (!isInvalidField)
                        {
                            if (!codeModified.includes(el.ivc))
                            {
                                codeModified = codeModified.replace(lastValueInserted.get(el.ivc), el.ivc);
                                elem[1].value = '';
                            }
                            lastValueInserted.set(el.ivc, e.target.value);
                            codeModified = codeModified.replace(el.ivc, e.target.value);
                            elem[1].value = e.target.value;
                        } else
                        {
                            codeModified = codeModified.replace(lastValueInserted.get(el.ivc), el.ivc);
                        }
                        break;
                    case 'STR':
                        if (checkVirgolette(e.target.value) || e.target.value.length < 1)
                        {
                            returnInvalid();
                        }
                        if (!isInvalidField)
                        {
                            if (!codeModified.includes(el.ivc))
                            {
                                codeModified = codeModified.replace(lastValueInserted.get(el.ivc), el.ivc);
                                elem[1].value = '';
                            }
                            lastValueInserted.set(el.ivc, e.target.value);
                            codeModified = codeModified.replace(el.ivc, e.target.value);
                            elem[1].value = e.target.value;
                        } else
                        {
                            codeModified = codeModified.replace(lastValueInserted.get(el.ivc), el.ivc);
                        }
                        break;
                    case 'BOL':
                        if (checkVirgolette(e.target.value))
                        {
                            returnInvalid();
                        } false
                        if (e.target.value != 'true' && e.target.value != 'false')
                        {
                            returnInvalid();
                        }
                        if (!isInvalidField)
                        {
                            if (!codeModified.includes(el.ivc))
                            {
                                codeModified = codeModified.replace(lastValueInserted.get(el.ivc), "'" + el.ivc + "'");
                                elem[1].value = '';
                            }
                            lastValueInserted.set(el.ivc, e.target.value);
                            codeModified = codeModified.replace("'" + el.ivc + "'", e.target.value);
                            elem[1].value = e.target.value;
                        } else
                        {
                            codeModified = codeModified.replace(lastValueInserted.get(el.ivc), "'" + el.ivc + "'");
                        }
                        break;
                    case 'NMB':
                        if (checkVirgolette(e.target.value))
                        {
                            returnInvalid();
                        }
                        if (!(/^\d+$/.test(e.target.value)))
                        {
                            returnInvalid();
                        }
                        if (!isInvalidField)
                        {
                            if (!codeModified.includes(el.ivc))
                            {
                                codeModified = codeModified.replace(lastValueInserted.get(el.ivc), "'" + el.ivc + "'");
                            }
                            lastValueInserted.set(el.ivc, e.target.value);
                            codeModified = codeModified.replace("'" + el.ivc + "'", e.target.value);
                            elem[1].value = e.target.value;
                        } else
                        {
                            codeModified = codeModified.replace(lastValueInserted.get(el.ivc), "'" + el.ivc + "'");
                        }
                        break;
                }

                function checkVirgolette(value)
                {
                    if (value.includes("'") || value.includes('"'))
                    {
                        return true;
                    }
                    return false;
                }
                function returnInvalid()
                {
                    isInvalidField = true;
                    if (input.className.includes('dialoggood') && !input.className.includes('dialogerror'))
                    {
                        input.className = 'dialogerror';
                    }
                }
                console.log(lastValueInserted)
                textArea.innerText = codeModified;
            });

            let li = document.createElement('li');
            li.id = 'elemlist';
            li.appendChild(spanTestoTipo);
            li.appendChild(spanTestoVarName);
            li.appendChild(input);
            list.appendChild(li);
        });

        divCenter.appendChild(list);
        let spanTextArea = document.createElement('span');
        spanTextArea.id = 'spantextarea-dialogvar';
        spanTextArea.innerText = 'Codice risultante';
        let textArea = document.createElement('textarea');
        textArea.id = 'textarea-dialogvar';
        textArea.setAttribute('row', 50);
        textArea.setAttribute('col', 100);
        textArea.setAttribute('readonly', true);
        textArea.innerText = code;
        textArea.className = "textarea";
        textArea.style = "resize: none;min-height: 400px;min-width: 550px;width: 585px;height: 413px;";


        divRight.appendChild(spanTextArea);
        divRight.appendChild(textArea);



        let btnRun = document.createElement('button');
        btnRun.id = 'btnRun-dialogvar';
        btnRun.innerText = 'RUN 🚀';
        btnRun.className = 'x-btn-inner';

        btnRun.addEventListener('click', (e) =>
        {
            let allValue = false;
            Object.entries(mapValue).forEach((v, id) =>
            {
                let elemlist_input = document.getElementById('input-dialogvar' + nomeSnippet + '_' + v[1].name);
                console.log(elemlist_input);
                let elemlist = elemlist_input.parentElement;
                console.log(v[1]);
                if ((v[1].value != null || v[1].value != undefined) &&
                    (
                        !v[1].value.includes('@STR') &&
                        !v[1].value.includes('@NMB') &&
                        !v[1].value.includes('@ID') &&
                        !v[1].value.includes('@V') &&
                        !v[1].value.includes('@BOL')))
                {
                    allValue = true;
                    elemlist.style = '';
                    elemlist.title = '';
                } else
                {
                    allValue = false;
                    elemlist.style = 'border-color: red;';
                    elemlist.title = 'Qua c\'è un problema... ';
                }
            });

            if (allValue)
            {
                console.log(codeModified);
                chrome.runtime.sendMessage({
                    type: 'WO_CODESNIPPET_run',
                    payload: codeModified.replaceAll('\n', ''),
                    resetTimeoutDialogTime: 5
                });
            }
        });

        let btnRunClose = document.createElement('button');
        btnRunClose.innerText = 'RUN & CLOSE 🚀';
        btnRunClose.id = 'btnRunClose-dialogvar';
        btnRunClose.className = 'x-btn-inner';
        btnRunClose.addEventListener('click', (e) =>
        {
            let allValue = false;
            Object.entries(mapValue).forEach((v, id) =>
            {
                let elemlist_input = document.getElementById('input-dialogvar' + nomeSnippet + '_' + v[1].name);
                console.log(elemlist_input);
                let elemlist = elemlist_input.parentElement;
                console.log(v[1]);
                if ((v[1].value != null || v[1].value != undefined) &&
                    (
                        !v[1].value.includes('@STR') &&
                        !v[1].value.includes('@NMB') &&
                        !v[1].value.includes('@ID') &&
                        !v[1].value.includes('@V') &&
                        !v[1].value.includes('@BOL')))
                {
                    allValue = true;
                    elemlist.style = '';
                    elemlist.title = '';
                } else
                {
                    allValue = false;
                    elemlist.style = 'border-color: red;';
                    elemlist.title = 'Qua c\'è un problema... ';
                }
            });

            if (allValue)
            {
                console.log(codeModified);
                chrome.runtime.sendMessage({
                    type: 'WO_CODESNIPPET_run',
                    payload: codeModified.replaceAll('\n', ''),
                    resetTimeoutDialogTime: 5
                });
                Object.entries(mapValue).forEach((v, id) =>
                {
                    delete v[1].value;
                });
                developerConsoleBody.removeChild(document.getElementById('dialogvar'));
                dialogVarOpen = false;
                chrome.runtime.sendMessage({
                    type: 'WO_CODESNIPPET_forceResetDialog'
                });
            }
        });

        let btnAnnulla = document.createElement('button');
        btnAnnulla.innerText = 'ANNULLA ❌';
        btnAnnulla.id = 'btnAnnulla-dialogvar';
        btnAnnulla.className = 'x-btn-inner';
        btnAnnulla.addEventListener('click', (e) =>
        {
            Object.entries(mapValue).forEach((v, id) =>
            {
                delete v[1].value;
            });
            developerConsoleBody.removeChild(document.getElementById('dialogvar'));
            dialogVarOpen = false;
            chrome.runtime.sendMessage({
                type: 'WO_CODESNIPPET_forceResetDialog'
            });
        });

        divCenterActions.appendChild(btnRun);
        divCenterActions.appendChild(btnRunClose);
        divCenterActions.appendChild(btnAnnulla);

        dialog.appendChild(title);
        dialog.appendChild(div);
        developerConsoleBody.appendChild(dialog);

    }

    const newDock = () =>
    {
        try
        {
            salesforceBody = document.getElementsByClassName('desktop')[0];
            if (!document.getElementsByClassName('WOtool-btn slds-button slds-button_brand')[0])
            {
                woToolBtn = document.createElement('button');
                woToolBtn.className = 'WOtool-btn slds-button slds-button_brand';
                woToolBtn.innerText = '🛠️';
                woToolBtn.style = 'bottom: 11px; position: fixed; right: -12px; z-index:9; height: 30px';
                woToolBtn.addEventListener('click', showHideWOTools);

                salesforceBody.appendChild(woToolBtn);
            }
            if (toolOpen)
            {
                console.log('CHECK WOTOOL', document.getElementById('WOTOOL'));
                if (!document.getElementById('WOTOOL')) 
                {
                    let div = document.createElement('div');
                    div.id = 'WOTOOL';
                    div.style =
                        'z-index: 1000;display: flex;position: fixed;bottom: 42px;right: 0px;vertical-align: middle;';
                    let frame = document.createElement('iframe');
                    frame.src = chrome.runtime.getURL('dock.html');
                    frame.style = 'width: 275px; height: 285px; border: 0; border-bottom-right-radius: 0px; border-top-right-radius: 15px; border-top-left-radius: 15px; border-bottom-left-radius: 15px;';
                    div.appendChild(frame);

                    salesforceBody.appendChild(div);
                }
            } else
            {
                try
                {
                    salesforceBody.removeChild(document.getElementById('WOTOOL'));
                } catch (e)
                {
                    console.log(e);
                }
            }
        } catch (e)
        {
            console.log(e);
        }
    }

    const showHideWOTools = async () =>
    {
        toolOpen = !toolOpen;
        newDock();
    }

    const removeFromWatchingList = () =>
    {
        try
        {
            salesforceBody.removeChild(watchingBtn);
        } catch (e) { }
    }

    const addToWatchList = async () =>
    {
        watchingBtn.setAttribute('disabled', '');
        watchingBtn.className = 'watching-btn slds-button slds-button_outline-brand';
        watchingBtn.innerText = 'In Watching! 🔍';

        chrome.storage.session.set({
            [currentObject.Id]: null
        });

        chrome.storage.session.get([currentObject.Id], (obj) =>
        {
            console.log('GET STORAGE', obj);
        });

        chrome.storage.session.get(null, function (items)
        {
            console.log(items);
            var allKeys = Object.keys(items);
            console.log(allKeys);
        });

        await chrome.runtime.sendMessage({
            type: 'newWatch',
            Id: currentObject.Id,
            sObject: currentObject.sObject,
            tab: currentObject.tab
        });
    }

    document.onmouseup = function ()
    {
        let selectedText = window.getSelection()
        //console.log('SELECTED_TEXT', selectedText);

        if (selectedText.toString().length == 18)
        {
            chrome.runtime.sendMessage({
                type: 'createContextMenu'
            });
        } else if (windowAnonymCode && selectedText.toString().length > 0)
        {

            chrome.runtime.sendMessage({
                type: 'createContextMenuDC'
            });

        } else 
        {
            chrome.runtime.sendMessage({
                type: 'removeContextMenu'
            });
        }

    }


    const copyToClipboard = (textToCopy) =>
    {
        const t = document.createElement('textarea');
        t.value = textToCopy;
        t.setAttribute('readonly', '');
        t.style.position = 'absolute';
        t.style.left = '-9999px';
        document.body.appendChild(t);
        t.select();
        document.execCommand('copy');
        document.body.removeChild(t);
    }


    const addCSS = (css) =>
    {
        let link = document.createElement("link");
        link.setAttribute('type', 'text/css');
        link.setAttribute('rel', 'stylesheet');

        link.href = css

        document.head.appendChild(link);
    }
    addCSS(chrome.runtime.getURL('./snippet.css'));
})();