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
					chrome.tabs.sendMessage(tab.id, {
						response: 'resetApiFieldArray',
					});
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
	//console.log('CONTEXT_MENU_CLICKED', info, tab);
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

		case 'WO_TOOL_requestFields':
			console.log('WO_TOOL_requestFields ARRIVED');
			chrome.tabs.sendMessage(sender.tab.id, {
				response: 'getPageFields',
			}).then(async (HTMLFieldFound) =>
			{
				if (!HTMLFieldFound)
				{
					return;
				}
				const sidApiField = await chrome.cookies.getAll({
					name: "sid",
					domain: getCurrentUrl(sender.tab).customDomain,
				});
				const idObjSplitted = String(sender.tab.url).split('/');
				const ObjectType = idObjSplitted[idObjSplitted.length - 3];

				let recordTypeFounded = null;
				let recordTypeDeveloperName = null;
				await fetch(
					getCurrentUrl(sender.tab).customDomainHttps +
					`/services/data/v57.0/query/?q=SELECT+RecordTypeId+,+RecordType.DeveloperName+FROM+${ObjectType}+WHERE+Id='${idObjSplitted[idObjSplitted.length - 2]}'`,
					{
						method: "GET",
						headers: {
							Authorization: "Bearer " + sidApiField[0].value,
							"Content-Type": "application/json",
						}
					}).then(async responseRecordType =>
					{
						recordTypeFounded = await responseRecordType.json();

						recordTypeDeveloperName = recordTypeFounded.records[0]['RecordType']['DeveloperName'];
						recordTypeFounded = recordTypeFounded.records[0].RecordTypeId;

					}).catch(noRecordTypeFound =>
					{
						recordTypeFounded = null;
					});

				var resApiName = null;
				const query = !recordTypeFounded ?
					`/services/data/v57.0/sobjects/` + ObjectType + '/describe/layouts/' :
					`/services/data/v57.0/sobjects/` + ObjectType + '/describe/layouts/' + recordTypeFounded;
				await fetch(getCurrentUrl(sender.tab).customDomainHttps + query,
					{
						method: 'GET',
						headers: {
							'Content-Type': 'application/json; charset=UTF-8',
							Accept: 'application/json',
							Authorization: 'Bearer ' + sidApiField[0].value,
						},
					}).then(async responseFetchDescribe =>
					{
						resApiName = await responseFetchDescribe.json();
						console.log(' API FIELD RESP', await resApiName);
						if (resApiName)
						{
							chrome.tabs.sendMessage(sender.tab.id, {
								response: 'setApiToField',
								payload: {
									recordTypeFound: !recordTypeFounded ? false : true,
									apiField: resApiName,
									objectInfo: ObjectType,
									recordTypeName: recordTypeDeveloperName
								}
							});
						}
					}).catch(err =>
					{
						console.error(err);
					});

			})
			/* chrome.tabs.sendMessage(sender.tab.id, {
				response: 'getPageFields',
			}).then(async (responseField) =>
			{
				console.log('BG RESPONSE', responseField);
				if (responseField)
				{
					const sidApiField = await chrome.cookies.getAll({
						name: "sid",
						domain: getCurrentUrl(sender.tab).customDomain,
					});

					const idObjSplitted = String(sender.tab.url).split('/');
					const ObjectType = idObjSplitted[idObjSplitted.length - 3];

					let recordTypeFounded = null;
					let recordTypeDeveloperName = null;

					await fetch(
						getCurrentUrl(sender.tab).customDomainHttps +
						`/services/data/v57.0/query/?q=SELECT+RecordTypeId+,+RecordType.DeveloperName+FROM+${ObjectType}+WHERE+Id='${idObjSplitted[idObjSplitted.length - 2]}'`, {
						method: "GET",
						headers: {
							Authorization: "Bearer " + sidApiField[0].value,
							"Content-Type": "application/json",
						}
					}).then(async respRecordType =>
					{
						recordTypeFounded = await respRecordType.json();
						console.log(recordTypeFounded.records[0])
						try
						{
							if (recordTypeFounded[0].errorCode)
							{
								recordTypeFounded = null;
							}
						} catch (err)
						{
							recordTypeDeveloperName = recordTypeFounded.records[0]['RecordType']['DeveloperName'];
							recordTypeFounded = recordTypeFounded.records[0].RecordTypeId;
						}
						console.log('RECORD TYPE ID ', recordTypeFounded)
					}).catch(err =>
					{
						recordTypeFounded = null;
					});

					var resApiName = null;
					const query = !recordTypeFounded ?
						`/services/data/v57.0/sobjects/` + ObjectType + '/describe/layouts/' :
						`/services/data/v57.0/sobjects/` + ObjectType + '/describe/layouts/' + recordTypeFounded;
					await fetch(
						getCurrentUrl(sender.tab).customDomainHttps + query,
						{
							method: 'GET',
							headers: {
								'Content-Type': 'application/json; charset=UTF-8',
								Accept: 'application/json',
								Authorization: 'Bearer ' + sidApiField[0].value,
							},
						}).then(async responseFetchDescribe =>
						{
							resApiName = await responseFetchDescribe.json();
							console.log(' API FIELD RESP', await resApiName);
							if (resApiName)
							{
								chrome.tabs.sendMessage(sender.tab.id, {
									response: 'setApiToField',
									payload: {
										recordTypeFound: !recordTypeFounded ? false : true,
										apiField: resApiName,
										objectInfo: ObjectType,
										recordTypeName: recordTypeDeveloperName
									}
								});
							}
						});
				}
			}); */
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
						title: 'DELETING APEX LOGS',
						message: await res.totalSize + ' ApexLog deleted!',
						iconUrl: 'images/icon.png'
					});

			} else
			{
				chrome.notifications.create(
					'',
					{
						type: 'basic',
						title: 'DELETING APEX LOGS',
						message: 'There are not enough logs to perform the operation. Found: ' + res.totalSize,
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

			let urlToSendAnonymous = newUrl + '/services/data/v57.0/tooling/executeAnonymous/?anonymousBody=';

			let sid_ = await chrome.cookies.getAll({
				name: "sid",
				domain: newUrl.replace("https://", ""),
			});
			console.log('SID ON SNIPPET RUN', sid_)
			if (sid_.length === 0)
			{
				sid_ = await chrome.cookies.getAll({
					name: "sid",
					domain: getCurrentUrl(sender.tab).customDomain,
				});
				console.log('SID ON SNIPPET RUN SALESFORCE BODY', sid_)
				urlToSendAnonymous = getCurrentUrl(sender.tab).customDomainHttps.split('/lightning')[0] + '/services/data/v57.0/tooling/executeAnonymous/?anonymousBody=';
				console.log('----', urlToSendAnonymous)
			}

			let toSend = urlToSendAnonymous + obj.payload;
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

		case 'WO_TOOL_showCodeSnippet':
			chrome.tabs.sendMessage(sender.tab.id, {
				response: 'openFastCodeSnippet',
			})
			break;


	}

});

var notificationID = [];

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


