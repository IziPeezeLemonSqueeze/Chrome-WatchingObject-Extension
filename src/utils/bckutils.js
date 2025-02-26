
export let apiActive = null;

export function getCurrentUrl(tab)
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

function getCurrentApiActive()
{
	if (!apiActive)
	{
		chrome.storage.sync.get('apiVersionSelected', async (items) =>
		{
			apiActive = await items.apiVersionSelected;
		});
	}
}

export async function snippetRun(obj, sender, response)
{
	getCurrentApiActive();
	const _URL_ = sender.tab.url.split('salesforce.com')
	let newUrl = _URL_[0] + "salesforce.com";
	console.log('----', newUrl.replace("https://", ""))

	let urlToSendAnonymous = newUrl + `/services/data/v${apiActive}/tooling/executeAnonymous/?anonymousBody=`;

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
		urlToSendAnonymous = getCurrentUrl(sender.tab).customDomainHttps.split('/lightning')[0] + `/services/data/v${apiActive}/tooling/executeAnonymous/?anonymousBody=`;
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
}

export function requestFields(obj, sender, response)
{
	getCurrentApiActive();
	console.log('WO_TOOL_requestFields ARRIVED');
	chrome.tabs.sendMessage(sender.tab.id, {
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
				`/services/data/v${apiActive}/query/?q=SELECT+RecordTypeId+,+RecordType.DeveloperName+FROM+${ObjectType}+WHERE+Id='${idObjSplitted[idObjSplitted.length - 2]}'`, {
				method: "GET",
				headers: {
					Authorization: "Bearer " + sidApiField[0].value,
					"Content-Type": "application/json",
				}
			}).then(async responseRecordType =>
			{
				recordTypeFounded = await responseRecordType.json();
				console.log('RECORDTYPE BY QUERY', recordTypeFounded)
				recordTypeDeveloperName = recordTypeFounded.records[0]['RecordType']['DeveloperName'];
				recordTypeFounded = recordTypeFounded.records[0].RecordTypeId;

			}).catch(noRecordTypeFound =>
			{
				recordTypeFounded = '012000000000000AAA';
			});

			var resApiName = null;
			const query = `/services/data/v${apiActive}/sobjects/` + ObjectType + '/describe/layouts/' + recordTypeFounded;
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
		}
	});
}

export async function goToApexLog(obj, sender, response)
{
	getCurrentApiActive();
	const sid = await chrome.cookies.getAll({
		name: "sid",
		domain: getCurrentUrl(sender.tab).customDomain,
	});
	var res = null;
	await fetch(
		getCurrentUrl(sender.tab).customDomainHttps +
		`/services/data/v${apiActive}/query/?q=SELECT+Id+FROM+ApexLog`, {
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
		const urlToSendDelete = getCurrentUrl(sender.tab).customDomainHttps + `/services/data/v${apiActive}/composite/sobjects?ids=`;

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
}

export async function retrieveApiVersions(obj, sender, response)
{
	const sidApiVersion = await chrome.cookies.getAll({
		name: "sid",
		domain: getCurrentUrl(sender.tab).customDomain,
	});

	const queryApiVersions = `/services/data/`;
	await fetch(getCurrentUrl(sender.tab).customDomainHttps + queryApiVersions, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json; charset=UTF-8',
			Accept: 'application/json',
			Authorization: 'Bearer ' + sidApiVersion[0].value,
		},
	}).then(async responseApiVersion =>
	{
		const resp = await responseApiVersion.json();
		const av = resp.reduce((p, c) =>
		{
			p.push(c.version);
			return p;
		}, []);
		chrome.storage.sync.set({
			['apiVersion']: av
		});
		apiActive = av[av.length - 1];
	}).catch(err =>
	{
		console.error(err);
	})
}

