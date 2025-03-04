const btnMinimize = document.getElementById('snippetminimize');
const divHeader = document.getElementById('snippetheader');

document.addEventListener('DOMContentLoaded', async () =>
{

	btnMinimize.innerText = '➖';

	btnMinimize.addEventListener('click', async () =>
	{
		changeHeightCS();
	});
});

const changeHeightCS = () =>
{
	if (btnMinimize.innerText == '➖')
	{
		btnMinimize.innerText = '➕';
	} else
	{
		btnMinimize.innerText = '➖';
	}
	chrome.runtime.sendMessage({
		type: 'DCS_changeHeight'
	});
}
