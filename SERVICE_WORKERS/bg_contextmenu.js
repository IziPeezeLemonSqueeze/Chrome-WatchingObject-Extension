export var Pocess = (function (Utils)
{

    chrome.contextMenus.onClicked.addListener((info, tab) =>
    {
        console.log('CONTEXT_MENU_CLICKED', info, tab);
        if (info.selectionText.length == 18 && info.selectionText) 
        {
            let urlToGo = Utils.getCurrentUrl(tab).customDomainHttps;
            chrome.tabs.create({
                active: true,
                url: urlToGo + '/' + info.selectionText
            });

        } else
        {
            let formattedSnippet = info.selectionText.toString().replaceAll(';', ';\n');
            let snippet = '';
            let rows = formattedSnippet.split('\n');
            rows.forEach((row) =>
            {
                snippet += (row.trim() + '\n');
            });

            console.log(snippet);

            chrome.tabs.sendMessage(tab.id, {
                response: 'popupNameSnippet',
                payload: snippet
            });
        }
    });


    chrome.notifications.onButtonClicked.addListener((notifId, btnIdx) =>
    {
        notificationID.forEach((not, idx) =>
        {
            console.log('NOTIFICATION TAB INFO', not);
            if (not.notifId == notifId)
            {
                if (btnIdx === 0)
                {
                    chrome.tabs.update(not.tabId, { highlighted: true, active: true });
                    notificationID.splice(idx, 1);
                }
            }
        })
    });

    chrome.runtime.onMessage.addListener(async (obj, sender, response) =>
    {
        console.log('ARRIVED BE_CONTEXTMENU', obj);

        switch (obj.type)
        {
            case 'createContextMenu':
                chrome.contextMenus.create({
                    title: "Apri in una nuova tab \"%s\"",
                    contexts: ["selection"],
                    id: "1",
                    documentUrlPatterns: [
                        "https://*.force.com/*",
                        "https://*.salesforce.com/*"
                    ]
                });
                break;

            case 'createContextMenuDC':
                chrome.contextMenus.create({
                    title: "Salva selezione come CodeSnippet",
                    contexts: ["selection"],
                    id: "10",
                    documentUrlPatterns: [
                        "https://*.force.com/*",
                        "https://*.salesforce.com/*"
                    ]
                });
                break;

            case 'removeContextMenu':
                chrome.contextMenus.removeAll();
                break;
        }
    });
});