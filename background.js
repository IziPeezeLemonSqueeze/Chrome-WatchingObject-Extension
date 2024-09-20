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


chrome.contextMenus.onClicked.addListener((info, tab) =>
{
	console.log('CONTEXT_MENU_CLICKED', info, tab);
	if (info.selectionText.length == 18 && info.selectionText) 
	{
		let urlToGo = getCurrentUrl(tab).customDomainHttps;
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
	console.log('ARRIVED BE', obj);

	switch (obj.type)
	{
		/* 		case 'newWatch':
					chrome.storage.session.get([obj.Id], async data =>
					{
						if (data[obj.Id] == null)  
						{
							let domains = getCurrentUrl(obj.tab);
							console.log(domains);
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
								[obj.Id]: [resInspect, obj.tab, {
									domain: domains.customDomainHttps,
									sid: sid[0].value
								}]
							});
		
							startWatchingProcess();
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
					
					break;
			*/

		case 'updatePopup':
			response('res');
			break;

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

		case 'WO_TOOL_goToObjectManager':
			chrome.tabs.create({
				active: true,
				url: getCurrentUrl(sender.tab).customDomainHttps + '/lightning/setup/ObjectManager/home'
			});
			break;

		case 'WO_TOOL_goToCustomMetadata':
			chrome.tabs.create({
				active: true,
				url: getCurrentUrl(sender.tab).customDomainHttps + '/lightning/setup/CustomMetadata/home'
			});
			break;

		case 'WO_TOOL_goToApexJobs':
			chrome.tabs.create({
				active: true,
				url: getCurrentUrl(sender.tab).customDomainHttps + '/lightning/setup/AsyncApexJobs/home'
			});
			break;

		case 'WO_TOOL_goToUsers':
			chrome.tabs.create({
				active: true,
				url: getCurrentUrl(sender.tab).customDomainHttps + '/lightning/setup/ManageUsers/home'
			});
			break;

		case 'WO_TOOL_goToDeploy':
			chrome.tabs.create({
				active: true,
				url: getCurrentUrl(sender.tab).customDomainHttps + '/lightning/setup/DeployStatus/home'
			});
			break;

		case 'WO_TOOL_goToFlow':
			chrome.tabs.create({
				active: true,
				url: getCurrentUrl(sender.tab).customDomainHttps + '/lightning/setup/Flows/home'
			});
			break;

		case 'WO_TOOL_goToApexLog':
			const sid = await chrome.cookies.getAll({
				name: "sid",
				domain: getCurrentUrl(sender.tab).customDomain,
			});
			var res = null;
			await fetch(
				getCurrentUrl(sender.tab).customDomainHttps +
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
				const urlToSendDelete = getCurrentUrl(sender.tab).customDomainHttps + '/services/data/v57.0/composite/sobjects?ids=';

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

		case 'WO_CODESNIPPET_delConfirm':
			chrome.tabs.sendMessage(sender.tab.id, {
				response: 'confirmDeleteSnippet',
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

		case 'WO_CODESNIPPET_okDeleteSnippet':
			chrome.storage.local.remove([obj.payload])
			clearTimeout(timeoutFORCEResetDialog);
			chrome.tabs.sendMessage(sender.tab.id, {
				response: 'resetCodeSnippet'
			});
			break;



	}

});

var notificationID = [];

/**
 * DISMESSO
 */
/* function startWatchingProcess()
{
	if (!watchingP)
	{
		watchingP = setInterval(() =>
		{
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
 */

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
	myHeaders.append("Authorization", "Bearer " + sid);
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
}


