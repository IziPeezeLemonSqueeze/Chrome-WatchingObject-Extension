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
                console.log(matches);
                if (matches[1] && matches[2])
                {
                    chrome.tabs.sendMessage(tabId, {
                        tab: tab,
                        title: changeInfo.title,
                        sObject: matches[1],
                        Id: matches[2]
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

let watchingP;
function clearWatchingProcess()
{
    console.log('STOP WATCHING JOB');
    clearInterval(watchingP);
    watchingP = null;
}

chrome.runtime.onMessage.addListener(async (obj, sender, response) =>
{
    console.log('ARRIVED BE', obj);

    switch (obj.type)
    {
        case 'newWatch':
            chrome.storage.session.get([obj.Id], async data =>
            {
                if (data[obj.Id] == null)  
                {
                    let domains = getCurrentUrl(obj.tab);
                    console.log(domains);

                    /*                 let matches = getCurrentSObjectNameAndID(tab);
                                    console.log(matches);
                     */
                    const sid = await chrome.cookies.getAll({
                        name: "sid",
                        domain: domains.customDomain,
                    });
                    console.log("SID", sid);

                    let resInspect = await login(
                        domains.customDomainHttps,
                        sid[0].value,
                        obj.sObject,
                        obj.Id
                    );
                    console.log("RESULT INSPECT", resInspect);

                    try
                    {
                        await initStorageCache;
                    } catch (e) { }

                    chrome.storage.session.set({
                        [obj.Id]: [resInspect, obj.tab]
                    });

                    startWatchingProcess(domains.customDomainHttps, sid[0].value);
                }

            });
            break;

        case 'stopWatchProcess':
            if (watchingP)
            {
                clearWatchingProcess();
                chrome.storage.session.get(null, async (items) =>
                {
                    if (await items)
                    {
                        Object.keys(await items).forEach(k =>
                        {

                            chrome.storage.session.get([k], async data =>
                            {
                                chrome.tabs.reload(data[k][1].id);
                                chrome.storage.session.remove([k]);
                            });
                        });
                    }
                }).then(async () =>
                {
                    await chrome.storage.session.clear();
                    response('res');
                });

            }
            /* chrome.runtime.sendMessage({
                popup: 'reset'
            }); */
            break;

        case 'updatePopup':
            response('res');
            break;

    }

});

var notificationID = [];
function startWatchingProcess(domain, sid)
{
    if (!watchingP)
    {
        watchingP = setInterval(() =>
        {
            console.log('WATCHING PROCESS');

            chrome.storage.session.get(null, async (items) =>
            {
                if (await items)
                {
                    Object.keys(await items).forEach(k =>
                    {

                        chrome.storage.session.get([k], async data =>
                        {

                            let result = null;
                            await fetch(
                                domain + "/services/data/v57.0/query/?q=SELECT+LastModifiedDate+FROM+" + data[k][0].attributes.type + "+WHERE+id+=+'" + data[k][0].Id + "'",
                                {
                                    method: "GET",
                                    headers: {
                                        Authorization: "Bearer " + sid,
                                        "Content-Type": "application/json",
                                    }
                                }
                            )
                                .then((response) => response.json())
                                .then((res) => (result = res))
                                .catch((error) => console.log("error", error));
                            console.log('RESULT QUERY', result);

                            console.log('RES_QUERY', result.records[0], 'DATA_', data[k][0].LastModifiedDate);
                            if (result.records[0].LastModifiedDate != data[k][0].LastModifiedDate)
                            {
                                console.log('TAB TO RELOAD', data[k][1].id);
                                chrome.tabs.reload(data[k][1].id);
                                chrome.tabs.sendMessage(data[k][1].id, {
                                    response: 'resetNewWatch'
                                });
                                chrome.storage.session.remove([k]);
                                chrome.notifications.create(
                                    '',
                                    {
                                        type: 'basic',
                                        title: data[k][0].Id + ' - ' + data[k][0].attributes.type + ' AGGIORNATO!',
                                        message: 'Ho appena aggiornato la tab di questo oggetto!',
                                        iconUrl: 'images/icon.png',
                                        buttons: [{ title: 'GOTO TAB' }]
                                    }, (id) =>
                                {
                                    notificationID.push({
                                        notifId: id, tabId: data[k][1].id
                                    });
                                }
                                );
                            }


                        });
                    });
                }

                if (Object.keys(await items).length === 0)
                {
                    clearWatchingProcess();
                }
                console.log(await items);
            });
        }, 60000);
    }

}

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


/**
 *
 * @param {*} tab  URL
 * @returns 0 URL | 1 SObject | 2 ID
 */
function getCurrentSObjectNameAndID(tab)
{
    return tab.url.match(/\/lightning\/r\/(\w+)\/(\w+)\W*/);
}

function getCurrentUrl(tab)
{
    console.log("CURRENT URL", tab.url);
    let url = tab.url;
    let domain = tab.url.substring(
        0,
        tab.url.indexOf(".lightning.force.com")
    );
    let customDomain = domain.replace("https://", "") + ".my.salesforce.com";
    let customDomainHttps = domain + ".my.salesforce.com";

    return {
        url: url,
        domain: domain,
        customDomain: customDomain,
        customDomainHttps: customDomainHttps,
    };
}

async function login(domain, sid, SObject, ID)
{
    console.log(SObject, ID);

    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + sid);/* 
    myHeaders.append("Cookie", "BrowserId=o4dZ97ErEe2I8nW07bR1ww; CookieConsentPolicy=0:0; LSKey-c$CookieConsentPolicy=0:0"); */

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    var res = null;

    await fetch(domain + "/services/data/v57.0/sobjects/" + SObject + "/" + ID + "?fields=LastModifiedDate", requestOptions)
        .then(response => res = response.json())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));

    return res;

    /* 
        return await fetch(
            domain + "/services/data/v57.0/sobjects/" + SObject + "/" + ID,
            {
                method: "GET",
                headers: {
                    Authorization: "Bearer " + sid,
                    "Content-Type": "application/json",
                },
                redirect: 'follow'
            }
        )
            .then((response) => { return response.json() })
            .then((res) => (result = res))
            .catch((error) => console.log("error", error));
      */
}




/* chrome.contextMenus.onClicked.addListener((info, tab) =>
{
    console.log(info, tab);
    if ('test' === info.menuItemId)
    {
        login(info.selectionText);
    }
}); */
