(() =>
{
    let salesforceBody;
    let currentObject = {};
    let watchingBtn;
    chrome.runtime.onMessage.addListener((obj, sender, response) =>
    {
        //console.log('ARRIVED CS', obj);
        if (obj.response)
        {
            // GERSTIONE RESPONSE FROM BACKGROUND.JS
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
            watchingBtn.style = 'bottom: 10px; position: fixed; right: 10px; z-index:10;';

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

    const removeFromWatchingList = () =>
    {
        salesforceBody.removeChild(watchingBtn);
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

    //newWatching();
})();