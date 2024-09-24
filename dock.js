const btnObjectManager = document.getElementById('btnObjectManager');
const btnMdt = document.getElementById('btnMdt');
const btnApexJobs = document.getElementById('btnApexJobs');
const btnUsers = document.getElementById('btnUsers');
const btnDeploy = document.getElementById('btnDeploy');
const btnApexLog = document.getElementById('btnApexLog');
const btnFlow = document.getElementById('btnFlw');

const btnApiFields = document.getElementById('btnApiFields');
const btnCodeSnippet = document.getElementById('btnFastCodeSnippet');


document.addEventListener("DOMContentLoaded", async () =>
{

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
