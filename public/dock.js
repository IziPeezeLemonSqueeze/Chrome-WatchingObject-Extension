const btnObjectManager = document.getElementById('btnObjectManager');
const btnMdt = document.getElementById('btnMdt');
const btnApexJobs = document.getElementById('btnApexJobs');
const btnUsers = document.getElementById('btnUsers');
const btnDeploy = document.getElementById('btnDeploy');
const btnApexLog = document.getElementById('btnApexLog');
const btnFlow = document.getElementById('btnFlw');
const btnSettings = document.getElementById('btnSettings');
const labelSettings = document.getElementById('labelSettings');
const btnBackToMain = document.getElementById('btnBackToMain');
const apiVersionCombobox = document.getElementById('apiVersionCombobox');
const currentApiSelected = document.getElementById('currentApiSelected');
const btnSyncMetadata = document.getElementById('btnSyncMetadata');
const alwaysShowId = document.getElementById('alwaysShowId');

const btnApiFields = document.getElementById('btnApiFields');
const btnCodeSnippet = document.getElementById('btnFastCodeSnippet');

const optionsApiVersion = [
	'58.0',
	'59.0',
	'60.0',
	'61.0',
];

document.addEventListener("DOMContentLoaded", async () =>
{
	labelSettings.innerText = '⚙️ Settings ';

	alwaysShowId.addEventListener('change', (e) =>
	{
		const checked = e.currentTarget.checked;
		//console.log('CHANGE ALWAYS SHOW ID', checked);
		chrome.runtime.sendMessage({
			type: 'WO_TOOL_alwaysShowId',
			payload: checked
		});
	})

	chrome.storage.local.get('apiVersion', async (items) =>
	{
		if (!Object.keys(await items)[0])
		{
			chrome.storage.local.set({
				['apiVersion']: optionsApiVersion
			});

			optionsApiVersion.forEach(opt =>
			{
				const option = document.createElement('option');
				option.value = opt;
				option.innerText = opt;
				option.id = `opt_${opt}`;
				apiVersionCombobox.appendChild(option);
			});
		}
		try
		{
			await items['apiVersion'].forEach(opt =>
			{
				const option = document.createElement('option');
				option.value = opt;
				option.innerText = opt;
				option.id = `opt_${opt}`;
				apiVersionCombobox.appendChild(option);
			});
		} catch (err) { }
	});

	chrome.storage.local.get('apiVersionSelected', async (items) =>
	{
		//console.log('API VERSION SELECTED', await items);
		if (Object.keys(await items))
		{
			if (!await items.apiVersionSelected)
			{
				currentApiSelected.innerText = optionsApiVersion[0];
				updateBackgroudWithApiVersion(optionsApiVersion[0])
			} else
			{
				currentApiSelected.innerText = await items.apiVersionSelected;
				updateBackgroudWithApiVersion(await items.apiVersionSelected);
			}
		}
	});

	apiVersionCombobox.addEventListener('change', (e) =>
	{
		chrome.storage.local.set({ ['apiVersionSelected']: e.target.value });
		currentApiSelected.innerText = e.target.value;
		updateBackgroudWithApiVersion(e.target.value);
	});

	btnSettings.addEventListener('click', () =>
	{
		document.getElementById('main').style.display = 'none';
	});

	btnBackToMain.addEventListener('click', () =>
	{
		document.getElementById('main').style.display = null;
	});

	btnObjectManager.addEventListener('click', () =>
	{
		objectManagerEvent();
	});

	btnMdt.addEventListener('click', () =>
	{
		customMetadataEvent();
	});

	btnApexJobs.addEventListener('click', () =>
	{
		apexJobsEvent();
	});

	btnUsers.addEventListener('click', () =>
	{
		usersEvent();
	});

	btnDeploy.addEventListener('click', () =>
	{
		deployEvent();
	});

	btnApexLog.addEventListener('click', () =>
	{
		apexLogEvent();
	});

	btnFlow.addEventListener('click', () =>
	{
		flowEvent();
	});

	btnApiFields.addEventListener('click', () =>
	{
		apiFieldsEvent();
	});

	btnCodeSnippet.addEventListener('click', () =>
	{
		codeSnippetEvent();
	});
});

const objectManagerEvent = () =>
{
	chrome.runtime.sendMessage({
		type: 'WO_TOOL_goToObjectManager'
	});
}

const customMetadataEvent = () =>
{
	chrome.runtime.sendMessage({
		type: 'WO_TOOL_goToCustomMetadata'
	});
}

const apexJobsEvent = () =>
{
	chrome.runtime.sendMessage({
		type: 'WO_TOOL_goToApexJobs'
	});
}

const usersEvent = () =>
{
	chrome.runtime.sendMessage({
		type: 'WO_TOOL_goToUsers'
	});
}

const deployEvent = () =>
{
	chrome.runtime.sendMessage({
		type: 'WO_TOOL_goToDeploy'
	});
}

const apexLogEvent = () =>
{
	chrome.runtime.sendMessage({
		type: 'WO_TOOL_goToApexLog'
	});
}

const flowEvent = () =>
{
	chrome.runtime.sendMessage({
		type: 'WO_TOOL_goToFlow'
	});
}

const apiFieldsEvent = () =>
{
	chrome.runtime.sendMessage({ type: 'WO_TOOL_requestFields' });
}

const codeSnippetEvent = () =>
{
	chrome.runtime.sendMessage({
		type: 'WO_TOOL_showCodeSnippet'
	});
}

const updateBackgroudWithApiVersion = (apiActive) =>
{
	chrome.runtime.sendMessage({
		type: 'WO_TOOL_apiVersion',
		payload: apiActive
	});
}
