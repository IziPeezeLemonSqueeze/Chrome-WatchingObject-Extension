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

const divTutorial = document.getElementById('tutorial');
const divStepOne = document.getElementById('stepOneBlock');
const divStepTwo = document.getElementById('stepTwoBlock');
const divStepUpTwo = document.getElementById('stepTwoUpBlock');
const divStepGreetings = document.getElementById('stepGreetings');
const freccia = document.getElementById('freccia');
const btnGoToDOC = document.getElementById('btnGoToDOC');

const tutorialPhases = {
	isOn: false,
}

document.addEventListener("DOMContentLoaded", async () =>
{
	getTutorial(divTutorial);

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

	chrome.storage.sync.get('apiVersion', async (items) =>
	{
		//console.log('apiVersion', items);
		if (!Object.keys(await items)[0])
		{
			requestApiVersions();
		}
	});

	setTimeout(async () =>
	{
		chrome.storage.sync.get('apiVersion', async (items) =>
		{
			if (Object.keys(await items)[0])
			{
				//console.log('DOCK API VERIONS');
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
			}
		});

		chrome.storage.sync.get('apiVersionSelected', async (items) =>
		{
			if (Object.keys(await items)[0])
			{
				//console.log('ALREADY SELECTED API VERSION', await items);
				currentApiSelected.innerText = await items.apiVersionSelected
			}
		});
	}, 1000);

	apiVersionCombobox.addEventListener('change', (e) =>
	{
		chrome.storage.sync.set({ ['apiVersionSelected']: e.target.value });
		currentApiSelected.innerText = e.target.value;
		updateBackgroudWithApiVersion(e.target.value);
	});

	btnSettings.addEventListener('click', () =>
	{
		document.getElementById('main').style.display = 'none';
		if (tutorialPhases.isOn)
		{
			setupStepTwo();
		}
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

	btnGoToDOC.addEventListener('click', () =>
	{
		goToDOC();
	})
});

const goToDOC = () =>
{
	chrome.tabs.create({ url: 'https://github.com/IziPeezeLemonSqueeze/Salesforce-Enhancer_Chrome-Extension_DOC/wiki' });
}

const getTutorial = () =>
{
	divTutorial.style.opacity = 0;
	divStepOne.style.opacity = 0;
	divStepTwo.style.opacity = 0;
	divStepTwo.style.display = 'none';
	divStepUpTwo.style.opacity = 0;
	divStepUpTwo.style.display = 'none';
	divStepGreetings.style.opacity = 0;
	divStepGreetings.style.display = 'none';
	chrome.storage.sync.get(['firstGO'], async (isFirstGo) =>
	{
		const resp = await isFirstGo;
		//console.log('TUT RESP', resp)
		if (!resp.firstGO)
		{
			divTutorial.style.display = 'none';
			return;
		}
		divTutorial.style.display = null;
		setTimeout(() =>
		{
			tutorialPhases.isOn = true;
			divTutorial.style.opacity = 1;
			setupStepOne(divTutorial);
		}, 200);

	});
}

const setupStepOne = () =>
{
	freccia.innerText = '⬇';
	divStepOne.style.opacity = 1;

}

const setupStepTwo = () =>
{
	divStepOne.style.opacity = 0;
	divStepOne.style.display = 'none';
	divStepTwo.style.opacity = 1;
	divStepTwo.style.display = null;
	divStepUpTwo.style.opacity = 1;
	divStepUpTwo.style.display = null;
}

const setupStepGreetings = () =>
{
	divStepTwo.style.opacity = 0;
	divStepTwo.style.display = 'none';
	divStepUpTwo.style.opacity = 0;
	divStepUpTwo.style.display = 'none';
	divStepGreetings.style.opacity = 1;
	divStepGreetings.style.display = null;
	setTimeout(async () =>
	{
		await chrome.storage.sync.set({ firstGO: false });
		tutorialPhases.isOn = false;
		divStepGreetings.style.opacity = 0;
		setTimeout(() =>
		{
			divStepGreetings.style.display = 'none';
		}, 1000)
	}, 1000);

}

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

const requestApiVersions = () =>
{
	chrome.runtime.sendMessage({
		type: 'WO_TOOL_requestApiVersion'
	});
}

const updateBackgroudWithApiVersion = (apiActive) =>
{
	chrome.runtime.sendMessage({
		type: 'WO_TOOL_apiVersion',
		payload: apiActive
	});
	if (tutorialPhases.isOn)
	{
		setupStepGreetings();
	}
}
