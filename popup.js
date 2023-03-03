const container = document.getElementsByClassName('container')[0];

const btnStopWatching = document.createElement('input');
btnStopWatching.type = 'button';
btnStopWatching.className = 'slds-button slds-button_destructive';
btnStopWatching.style = 'margin:5%';
btnStopWatching.value = 'STOP WATCHING PROCESS';


document.addEventListener("DOMContentLoaded", async () =>
{
    btnStopWatching.addEventListener('click', stopWatchingProcess);
    initWatchingList();
});

const initWatchingList = async () =>
{
    await chrome.storage.session.get(null, async (items) =>
    {
        console.log('STORAGE', Object.keys(await items));
        if (Object.keys(await items).length != 0)
        {
            container.innerHTML = '<div class="title" style="font-weight: bold;">Oggetti in watching:</div>'
            const hr = document.createElement('hr');
            hr.style = 'margin-top: 0.5em; margin - bottom: 0.5em; '
            container.appendChild(hr);
            const list = document.createElement('list');
            list.className = 'slds-list_dotted';
            list.style = 'margin: 5%; list-style-type: none;';
            Object.keys(await items).forEach(k =>
            {
                chrome.storage.session.get([k], async data =>
                {
                    const colonnaLi = document.createElement('div');
                    const element = document.createElement('li');

                    const rowText = document.createElement('div');
                    const rowBtns = document.createElement('div');

                    rowText.innerText = data[k][0].Id + ' - ' + data[k][0].attributes.type;

                    const btnGoToTab = document.createElement('input');
                    btnGoToTab.type = 'button'
                    btnGoToTab.value = 'GOTO'
                    btnGoToTab.addEventListener('click', () =>
                    {
                        chrome.tabs.update(data[k][1].id, { highlighted: true, active: true })
                    });

                    const btnRemove = document.createElement('input');
                    btnRemove.type = 'button'
                    btnRemove.value = 'Rimuovi da watchlist'
                    btnRemove.addEventListener('click', () =>
                    {
                        removeFromWatchingList({ idx: k, data: data[k] });
                    });

                    btnGoToTab.className = 'slds-button slds-button_brand';
                    btnRemove.className = 'slds-button slds-button_destructive';

                    const hrObj = document.createElement('hr');
                    hrObj.style = 'margin-top: 1em; margin - bottom: 1em;'

                    element.appendChild(colonnaLi);

                    colonnaLi.appendChild(rowText);
                    colonnaLi.appendChild(rowBtns);

                    rowBtns.appendChild(btnGoToTab);
                    rowBtns.appendChild(btnRemove);
                    colonnaLi.appendChild(hrObj);
                    list.appendChild(element);
                });
            });

            container.appendChild(list);
            container.appendChild(btnStopWatching);
        } else
        {
            container.innerHTML = '<div class="title"  style="font-weight: bold;">Nessun oggetto in Watching!</div>'
            //container.removeChild(btnStopWatching);
        }
    });

}

const stopWatchingProcess = async () =>
{

    container.innerHTML = '<div class="title"  style="font-weight: bold;">Rimossi tutti gli oggetti in Watching!</div>'
    console.log('clicked stop')
    await chrome.runtime.sendMessage({
        type: 'stopWatchProcess'
    }, async (e) =>
    {
        console.log('@DEBUG RES STOPWATCHING', e);
        await initWatchingList();
    });
}


const removeFromWatchingList = async e =>
{
    console.log('REMOVE', e);
    await chrome.storage.session.remove([e.idx]);
    await chrome.tabs.sendMessage(e.data[1].id, {
        response: 'resetNewWatch'
    });
    await chrome.runtime.sendMessage({
        type: 'updatePopup'
    }, async (e) =>
    {
        console.log('@DEBUG RES REMOVEWATCHING', e);
        await initWatchingList();
    });

}

/* chrome.runtime.onMessage.addListener(async (obj, sender, response) =>
{
    if (obj.popup)
    {
        switch (obj.popup)
        {
            case 'reset':
                await initWatchingList();
                break;
        }
    }
}); */
