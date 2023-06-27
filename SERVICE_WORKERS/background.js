import * as WOTOOLProcess from './bg_wotool.js';
import * as ContextMenuProcess from './bg_contextmenu.js';
import * as ShowAllDataProcess from './bg_showalldata.js';
import * as WatchingObjectProcess from './bg_watchingobject.js';
import { getCurrentSObjectNameAndID, getCurrentUrl, login } from './bg_utils.js';

const init = () =>
{
    startModule();

    chrome.runtime.onMessage.addListener(async (obj, sender, response) =>
    {
        console.log('ARRIVED BE_WOTOOL', obj);

        switch (obj.type)
        {
            case 'updatePopup':
                response('res');
                break;



        }
    });
}

const startModule = () =>
{
    WOTOOLProcess.Pocess({ getCurrentSObjectNameAndID, getCurrentUrl, login });
    ContextMenuProcess.Pocess({ getCurrentSObjectNameAndID, getCurrentUrl, login });
    ShowAllDataProcess.Pocess({ getCurrentSObjectNameAndID, getCurrentUrl, login });
    WatchingObjectProcess.Pocess({ getCurrentSObjectNameAndID, getCurrentUrl, login });
}

// START 
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) =>
{
    if (tab.url && tab.url.includes("force.com"))
    {
        console.log('TAB STATUS', changeInfo);

        if (changeInfo.title && !changeInfo.title.includes('Lightning Experience'))
        {

            console.log(changeInfo.title, changeInfo.status);

            if (changeInfo.status == undefined)
            {

                let matches = getCurrentSObjectNameAndID(tab);
                console.log('MATCHES ', matches);
                if (matches && matches[1] && matches[2])
                {
                    chrome.tabs.sendMessage(tabId, {
                        tab: tab,
                        title: changeInfo.title,
                        sObject: matches[1],
                        Id: matches[2]
                    });
                } else if (!matches && changeInfo.title == 'Developer Console')
                {
                    console.log('INIT DEV CONSOLE TOOL');
                    chrome.tabs.sendMessage(tabId, {
                        response: 'devConsole'
                    });
                }
            }
        } else
        {
            chrome.tabs.sendMessage(tabId, {
                tab: tab,
                title: changeInfo.title,
                sObject: null,
                Id: null
            });
        }
        /*     let domains = await chrome.scripting.executeScript({
                      target: { tabId: tab.id, allFrames: true },
                      func: getCurrentUrl,
                      args: [tab]
                  });
               */
        /* 
                chrome.action.onClicked.addListener(async (tab) =>
                {
        
              
                }); */
    }
});
init();


// ------------------------------------------------------------------------
// START DEBUG
chrome.storage.onChanged.addListener((changes, namespace) =>
{
    for (let [key, { oldValue, newValue }] of Object.entries(changes))
    {
        console.log(
            `Storage key "${key}" in namespace "${namespace}" changed.`,
            `Old value was "${oldValue}", new value is "${JSON.stringify(newValue)}".`
        );
    }
});

chrome.runtime.onInstalled.addListener(() =>
{
    chrome.storage.session.clear();
});
// STOP DEBUG
