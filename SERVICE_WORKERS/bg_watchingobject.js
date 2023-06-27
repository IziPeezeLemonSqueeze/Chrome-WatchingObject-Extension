export var Pocess = (function (Utils)
{

    chrome.runtime.onMessage.addListener(async (obj, sender, response) =>
    {
        console.log('ARRIVED BE_SHOWALLDATA', obj);

        switch (obj.type)
        {
            case 'newWatch':
                chrome.storage.session.get([obj.Id], async data =>
                {
                    if (data[obj.Id] == null)  
                    {
                        let domains = Utils.getCurrentUrl(obj.tab);
                        console.log(domains);

                        /*                 let matches = getCurrentSObjectNameAndID(tab);
                                        console.log(matches);
                         */
                        const sid = await chrome.cookies.getAll({
                            name: "sid",
                            domain: domains.customDomain,
                        });
                        console.log("SID", sid);

                        let resultQueryGetLastModifiedTime = await Utils.login(
                            domains.customDomainHttps,
                            sid[0].value,
                            obj.sObject,
                            obj.Id
                        );
                        console.log("RESULT INSPECT", resultQueryGetLastModifiedTime);

                        chrome.storage.session.set({
                            [obj.Id]: [resultQueryGetLastModifiedTime, obj.tab, {
                                domain: domains.customDomainHttps,
                                sid: sid[0].value
                            }]
                        });

                        startWatchingProcess(obj.tab.id);
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
        }
    });


    var notificationID = [];
    function startWatchingProcess(tabID)
    {
        if (!watchingP)
        {
            watchingP = setInterval(() =>
            {
                chrome.tabs.sendMessage(tabID, {
                    response: 'newTentativeQueryWO'
                });
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
                                    data[k][2].domain + "/services/data/v57.0/query/?q=SELECT+LastModifiedDate+FROM+" + data[k][0].attributes.type + "+WHERE+id+=+'" + data[k][0].Id + "'",
                                    {
                                        method: "GET",
                                        headers: {
                                            Authorization: "Bearer " + data[k][2].sid,
                                            "Content-Type": "application/json",
                                        }
                                    }
                                )
                                    .then((response) => response.json())
                                    .then((res) => (result = res))
                                    .catch((error) => console.log("error", error));
                                console.log('RESULT QUERY', result, data[k][2]);

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
                                    });
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

});
