(() =>
{
    let salesforceBody;
    let windowAnonymCode;
    let headerBody;

    let consoleIntervalSearch;
    let btnCodeSnippet;
    let codeSnippetOpen = false;
    let frameSnippet = null;
    let windowApexCode;
    let divDCTOOL;

    let currentObject = {};
    let watchingBtn;
    let woToolBtn;
    let woShowAllDataBtn;
    let toolOpen = false;

    let jsonText;
    let currentLocale =/*  chrome.i18n.getMessage("@@ui_locale") || */ 'en'; // TODO DA SISTEMARE
    const promiseJsonText = fetch(chrome.runtime.getURL('it_en.json'))

    promiseJsonText.then(async (val) =>
    {
        jsonText = JSON.parse(await val.text());
    });
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

                case 'resetCodeSnippet':
                    console.log('RESET')
                    hideCS(windowApexCode);
                    showCS(divDCTOOL, windowApexCode);
                    break;

                case 'newTentativeQueryWO':
                    trySeconds = 60;
                    tryQuery++;
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
                woShowAllDataBtn = document.createElement('button');
                woShowAllDataBtn.className = 'WOShowAllData-btn slds-button slds-button_brand';
                woShowAllDataBtn.innerText = '👁️';
                woShowAllDataBtn.title = 'SHOW ALL DATA!';
                woShowAllDataBtn.style = 'width: 20px;bottom: 51px;position: fixed;right: -3px;z-index: 9;height: 30px;';
                woShowAllDataBtn.addEventListener('click', (e) =>
                {
                    chrome.runtime.sendMessage({
                        type: 'showAllDataRequestData'
                    });
                });

                salesforceBody.appendChild(woShowAllDataBtn);


                salesforceBody = document.body;
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
        frameSnippet.src = chrome.runtime.getURL('CODE_SNIPPET/snippet.html');
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



    const newDock = () =>
    {
        try
        {
            salesforceBody = document.body;
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
                if (document.getElementById('WOTOOL'))
                {
                    salesforceBody.removeChild(document.getElementById('WOTOOL'));
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

    let trySeconds = 60;
    let secondsCounterProcess;
    let tryQuery = 0;
    let maxTry = 60;
    const addToWatchList = async () =>
    {
        headerBody = document.getElementsByClassName('highlights slds-clearfix slds-page-header slds-page-header_record-home fixed-position')[0] || null;

        let tab = document.getElementsByClassName('slds-tabs_card')[0];
        tab.style = 'border-color: #015ea9';

        let div = document.createElement('div');
        div.style = "display: flex;left: 32%;top: 3%;width: 3%;z-index: 1;position: absolute;align-items: center;"

        let img = document.createElement('img');
        img.src = 'https://cdn1.iconfinder.com/data/icons/unicons-line-vol-3/24/eye-512.png';
        img.title = getTextFromLanguage('iconaOcchioWatchingObject');
        img.addEventListener('click', (e) =>
        {
            if (window.confirm(getTextFromLanguage('promptCancellazioneOcchioWatchingObject')))
            {
                clearInterval(secondsCounterProcess);
                chrome.runtime.sendMessage({
                    type: 'stopWatchProcess'
                });
            }
        });
        img.addEventListener('mouseenter', (e) =>
        {
            img.src = 'https://cdn1.iconfinder.com/data/icons/unicons-line-vol-3/24/eye-slash-512.png';
        });
        img.addEventListener('mouseleave', (e) =>
        {
            img.src = 'https://cdn1.iconfinder.com/data/icons/unicons-line-vol-3/24/eye-512.png';
        });


        let secondsSpan = document.createElement('span');
        secondsSpan.style = "margin-left: 20px;min-width: 200px";
        trySeconds = 60;
        secondsCounterProcess = setInterval(() =>
        {
            trySeconds--;
            secondsSpan.innerText = `Sec. to next try:
        -${trySeconds}s
        Try: ${tryQuery} / ${maxTry}`;

            if (tryQuery >= maxTry)
            {
                clearInterval(secondsCounterProcess);
                chrome.runtime.sendMessage({
                    type: 'stopWatchProcess'
                });
            }

            if (trySeconds <= 0)
            {
                trySeconds = 60;
                tryQuery++;
            }

        }, 1000);


        div.appendChild(img);
        div.appendChild(secondsSpan);
        headerBody.appendChild(div);

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

    const getTextFromLanguage = (text) =>
    {

        //console.log(jsonText, text, currentLocale)
        return jsonText[text][currentLocale];
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
    addCSS(chrome.runtime.getURL('./CODE_SNIPPET/snippet.css'));

})();