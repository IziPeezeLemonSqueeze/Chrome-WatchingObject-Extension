const btnObjectManager = document.getElementById('btnObjectManager');
const btnMdt = document.getElementById('btnMdt');
const btnApexJobs = document.getElementById('btnApexJobs');
const btnUsers = document.getElementById('btnUsers');
const btnApexLog = document.getElementById('btnApexLog');


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
    btnApexLog.addEventListener('click', () =>
    {
        apexLogEvent();
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

const apexLogEvent = () =>
{
    chrome.runtime.sendMessage({
        type: 'WO_TOOL_goToApexLog'
    });
}
