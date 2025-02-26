'use strict';

import { snippetRun, requestFields, goToApexLog, getCurrentUrl, retrieveApiVersions, apiActive as bckApiActive } from "./utils/bckutils";

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) =>
{
	if (tab.url && tab.url.includes("force.com"))
	{
		console.log('TAB STATUS', changeInfo);

		if (changeInfo.title && !changeInfo.title.includes('Lightning Experience'))
		{
			//console.log(changeInfo.title, changeInfo.status);

			if (changeInfo.status == undefined)
			{

				let matches = getCurrentSObjectNameAndID(tab);
				//console.log('MATCHES ', matches);
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


		} else if (changeInfo.status == 'complete')
		{
			chrome.tabs.sendMessage(tabId, {
				response: 'resetApiFieldArray'
			})
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

	chrome.storage.sync.get(['appVersion'], async (version) =>
	{
		let totPrev = 0;
		let totCurr = 0;
		const resp = await version;
		const manifest = await chrome.runtime.getManifest();
		console.log('@@ VERSION', resp)
		if (Object.keys(resp).length == 0)
		{
			chrome.storage.sync.set({
				['appVersion']: {
					previousVersion: '1.6.3.2',
					currentVersion: manifest['version']
				}
			});
			totPrev = 1632;
			totCurr = parseInt(manifest['version'].replace('.', ''));
		} else
		{
			totCurr = parseInt(resp.appVersion.currentVersion.replace('.', ''));
		}

		chrome.storage.sync.get(['firstGO'], async (isFirstGo) =>
		{
			console.log('@@ firstgo', await isFirstGo, Object.keys(await isFirstGo));
			if (Object.keys(await isFirstGo).length == 0)
			{
				await chrome.storage.sync.set({
					firstGO: true
				});
			} else
			{
				if (totPrev < totCurr && Object.keys(await isFirstGo).length == 0)
				{
					chrome.storage.sync.set({
						firstGO: true
					});
				}
			}
		});
	});
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

	}/*  else
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
	} */
});

let apiActive = null;

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
				title: "Open in a new TAB \"%s\"",
				contexts: ["selection"],
				id: "1",
				documentUrlPatterns: [
					"https://*.force.com/*",
					"https://*.salesforce.com/*"
				]
			});
			break;

		/* case 'createContextMenuDC':
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
		  */

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
			requestFields(obj, sender, response);
			break;

		case 'WO_TOOL_goToApexLog':
			goToApexLog(obj, sender, response);
			break;
		/*
				case 'WO_TOOL_apiVersion':
					apiActive = obj.payload;
					console.log('INIT API VERSION', apiActive);
					break;
		 */
		case 'WO_TOOL_requestApiVersion':
			await retrieveApiVersions(obj, sender, response);
			apiActive = bckApiActive;
			break;

		//-------------------------CODE SNIPPET----------------------------------------------

		case 'WO_CODESNIPPET_addNewSnippet':
			chrome.tabs.sendMessage(sender.tab.id, {
				response: 'openTextAreaNewSnippet',
				payload: null
			});
			break

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
			snippetRun(obj, sender, response);
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
			chrome.storage.sync.remove([obj.payload])
			clearTimeout(timeoutFORCEResetDialog);
			chrome.tabs.sendMessage(sender.tab.id, {
				response: 'resetCodeSnippet'
			});
			break;

		case 'WO_CODESNIPPET_close':
			chrome.tabs.sendMessage(sender.tab.id, {
				response: 'closeCodeSnippetByBtn'
			});
			break;

		case 'WO_TOOL_showCodeSnippet':
			chrome.tabs.sendMessage(sender.tab.id, {
				response: 'openFastCodeSnippet',
			})
			break;

		case 'WO_TOOL_alwaysShowId':
			chrome.tabs.sendMessage(sender.tab.id, {
				response: 'showIdOnPage',
				payload: obj.payload
			});
			break;

		case 'CREATE_NOTIFICATION':
			createNotification(obj.payload);
			break;
	}
});


const createNotification = (data) =>
{
	chrome.notifications.create(
		'',
		{
			type: 'basic',
			title: data.title,
			message: data.msg,
			iconUrl: 'images/icon.png'
		});
}

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

	await fetch(domain + "/services/data/v${apiActive}/sobjects/" + SObject + "/" + ID + "?fields=LastModifiedDate", requestOptions)
		.then(response => res = response.json())
		.then(result => console.log(result))
		.catch(error => console.log('error', error));

	return res;
}
