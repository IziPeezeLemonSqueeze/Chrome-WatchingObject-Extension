
export var Pocess = (function (Utils)
{

    let watchingP;
    function clearWatchingProcess()
    {
        console.log('STOP WATCHING JOB');
        clearInterval(watchingP);
        watchingP = null;
    }

    let timeoutFORCEResetDialog;
    chrome.runtime.onMessage.addListener(async (obj, sender, response) =>
    {
        console.log('ARRIVED BE_WOTOOL', obj);

        switch (obj.type)
        {
            case 'WO_TOOL_goToObjectManager':
                chrome.tabs.create({
                    active: true,
                    url: Utils.getCurrentUrl(sender.tab).customDomainHttps + '/lightning/setup/ObjectManager/home'
                });
                break;

            case 'WO_TOOL_goToCustomMetadata':
                chrome.tabs.create({
                    active: true,
                    url: Utils.getCurrentUrl(sender.tab).customDomainHttps + '/lightning/setup/CustomMetadata/home'
                });
                break;

            case 'WO_TOOL_goToApexJobs':
                chrome.tabs.create({
                    active: true,
                    url: Utils.getCurrentUrl(sender.tab).customDomainHttps + '/lightning/setup/AsyncApexJobs/home'
                });
                break;

            case 'WO_TOOL_goToUsers':
                chrome.tabs.create({
                    active: true,
                    url: Utils.getCurrentUrl(sender.tab).customDomainHttps + '/lightning/setup/ManageUsers/home'
                });
                break;

            case 'WO_TOOL_goToDeploy':
                chrome.tabs.create({
                    active: true,
                    url: Utils.getCurrentUrl(sender.tab).customDomainHttps + '/lightning/setup/DeployStatus/home'
                });
                break;

            case 'WO_TOOL_goToApexLog':
                const sid = await chrome.cookies.getAll({
                    name: "sid",
                    domain: Utils.getCurrentUrl(sender.tab).customDomain,
                });
                var res = null;
                await fetch(
                    Utils.getCurrentUrl(sender.tab).customDomainHttps +
                    "/services/data/v57.0/query/?q=SELECT+Id+FROM+ApexLog", {
                    method: "GET",
                    headers: {
                        Authorization: "Bearer " + sid[0].value,
                        "Content-Type": "application/json",
                    }
                })
                    .then(async response => res = await response.json())
                    .then(result => console.log(result))
                    .catch(error => console.log('error', error));
                if (await res.totalSize > 0)
                {
                    console.log('APEX LOGS', await res.totalSize);
                    const urlToSendDelete = Utils.getCurrentUrl(sender.tab).customDomainHttps + '/services/data/v57.0/composite/sobjects?ids=';

                    let chunkComposite = [];
                    for (let c = 0; c < res.records.length; c += 200)
                    {
                        chunkComposite.push(res.records.slice(c, c + 200));
                    }
                    chunkComposite.forEach(async (chunk) =>
                    {
                        let composite = urlToSendDelete;
                        chunk.forEach((cId) =>
                        {
                            composite += cId.Id + ',';
                        });
                        composite = composite.slice(0, composite.length - 1);
                        console.log('COMPOSITE', composite);
                        await fetch(composite, {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json; charset=UTF-8",
                                Accept: "application/json",
                                Authorization: "Bearer " + sid[0].value
                            }
                        })
                            .then(async response =>
                            {
                                console.log('COMPOSITE RESPONSE', await response.json());
                            })
                            .then(result => console.log(result))
                            .catch(error => console.log('error', error));

                        setTimeout(() => { console.log(composite) }, 2500);
                        composite = '';
                    });
                    chrome.notifications.create(
                        '',
                        {
                            type: 'basic',
                            title: 'CANCELLAZIONE APEX LOG',
                            message: await res.totalSize + ' ApexLog eliminati!',
                            iconUrl: 'images/icon.png'
                        });

                } else
                {
                    chrome.notifications.create(
                        '',
                        {
                            type: 'basic',
                            title: 'CANCELLAZIONE APEX LOG',
                            message: 'Non ci sono abbastanza log per effettuare l\'operazione. Trovati: ' + res.totalSize,
                            iconUrl: 'images/icon.png'
                        });
                }
                break;

            case 'WO_CODESNIPPET_edit':
                chrome.tabs.sendMessage(sender.tab.id, {
                    response: 'copyApexSnippet',
                    payload: obj.payload
                });
                break;

            case 'WO_CODESNIPPET_run':
                const _URL_ = sender.tab.url.split('salesforce.com')
                newUrl = _URL_[0] + "salesforce.com";
                console.log('----', newUrl.replace("https://", ""))
                const sid_ = await chrome.cookies.getAll({
                    name: "sid",
                    domain: newUrl.replace("https://", ""),
                });
                const urlToSendDelete = newUrl + '/services/data/v57.0/tooling/executeAnonymous/?anonymousBody=';
                let toSend = urlToSendDelete + obj.payload;
                console.log('APEX CALL: ', toSend);
                await fetch(toSend, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json; charset=UTF-8",
                        Accept: "application/json",
                        Authorization: "Bearer " + sid_[0].value
                    }
                }).then(async response =>
                {

                    const resp = await response.json();
                    console.log('APEX ANONYMOUS RESPONSE', resp);
                    if (!resp.success)
                    {
                        chrome.tabs.sendMessage(sender.tab.id, {
                            response: 'snippet_showErrorDialog',
                            payload: resp.compileProblem
                        });
                        timeoutFORCEResetDialog = setTimeout(() =>
                        {
                            chrome.tabs.sendMessage(sender.tab.id, {
                                response: 'resetCodeSnippet'
                            });
                        }, obj.resetTimeoutDialogTime * 1000);
                    } else
                    {
                        chrome.tabs.sendMessage(sender.tab.id, {
                            response: 'resetCodeSnippet'
                        });
                    }
                })
                    .then(result => console.log(result))
                    .catch(error => console.log('error', error));
                break;

            case 'WO_CODESNIPPET_openDialogVar':
                chrome.tabs.sendMessage(sender.tab.id, {
                    response: 'openDialogVar',
                    payload: obj.payload
                });
                break;

            case 'WO_CODESNIPPET_forceResetDialog':
                clearTimeout(timeoutFORCEResetDialog);
                chrome.tabs.sendMessage(sender.tab.id, {
                    response: 'resetCodeSnippet'
                });
                break;
        }

    });




});