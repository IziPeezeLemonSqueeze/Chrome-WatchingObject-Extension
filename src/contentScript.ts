import { DOCK } from './utils_content/dockUtils';
import { APIFIELD } from './utils_content/apiFields';
import { SNIPPET } from './utils_content/snippet';
'use strict';
let spanShowIds: string[] = [];

const copyToClipboard = (textToCopy: string) =>
{
	const t = document.createElement('textarea');
	//console.log('textToCopy', textToCopy)
	t.value = textToCopy;
	t.setAttribute('readonly', '');
	t.style.position = 'absolute';
	t.style.left = '-9999px';
	document.body.appendChild(t);
	t.select();
	document.execCommand('copy');
	document.body.removeChild(t);
}

const snippet = new SNIPPET(copyToClipboard);
let salesforceBody = snippet.getSalesforceBody();
let windowAnonymCode = snippet.getWindowAnonymCode();

const Dock = new DOCK(salesforceBody);
Dock.newDock();
try
{
	Dock.woToolBtn.addEventListener('click', () =>
	{
		Dock.showHideWOTools();
	});
} catch (err) { }

const apiField = new APIFIELD(copyToClipboard);

(() =>
{
	chrome.runtime.onMessage.addListener((obj, sender, response) =>
	{
		//console.log('ARRIVED CS ', obj);
		if (obj.response)
		{
			// GESTIONE RESPONSE FROM BACKGROUND.JS
			switch (obj.response)
			{
				case 'devConsole':
					snippet.consoleIntervalSearch = setInterval(() =>
					{
						snippet.devConsoleTool();
					}, 2000);
					break;

				case 'openTextAreaNewSnippet':
					if (!snippet.textAreaNewSnippetOpen)
					{
						snippet.openTextAreaNewSnippet();
					}
					break;

				case 'copyApexSnippet':
					snippet.copyApexSnippet(obj.payload);
					snippet.hideCS();
					break;

				case 'closeCodeSnippetByBtn':
					snippet.hideCS();
					break;

				case 'confirmDeleteSnippet':
					snippet.confirmDeleteSnippet(obj.payload);
					break;

				case 'openDialogVar':
					if (!snippet.getDialogVarOpen())
					{
						snippet.openDialogVar(obj.payload);
					}
					break;

				case 'resetCodeSnippet':
					snippet.hideCS();
					if (snippet.divFastDCTOOL)
					{
						setTimeout(() =>
						{
							snippet.showFastCS();
						}, 505);
					} else
					{
						setTimeout(() =>
						{
							snippet.showCS();
						}, 505);
					}
					break;

				case 'getPageFields':
					if (apiField.apiFieldExist.length > 0)
					{
						apiField.removeApiNameToFields();
						return;
					}
					apiField.pageFields = document.getElementsByClassName('test-id__field-label').length > 0 ? document.getElementsByClassName('test-id__field-label') : null;
					if (!apiField.pageFields)
					{
						return;
					}
					const fields = [];
					for (let elem of apiField.pageFields)
					{
						fields.push(elem.innerText);
					};
					response(fields);
					break;

				case 'setApiToField':
					if (apiField.apiFieldExist.length === 0)
					{
						try
						{
							apiField.setApiNameToFields(obj.payload);
						} catch (err) { }
					}
					break;

				case 'resetApiFieldArray':
					apiField.removeApiNameToFields();
					break;

				case 'openFastCodeSnippet':
					snippet.showFastCS();
					break;

				case 'showIdOnPage':
					//console.log('showIdOnPage', obj.payload)
					if (obj.payload)
					{
						showIdOnPage();
					} else
					{
						deleteShowIdOnPage();
					}
					break;
			}
		} else
		{
			const { tab, title, sObject, Id } = obj;
			if (sObject)
			{
				try
				{
					let currentObject = {
						tab: tab,
						title: title,
						sObject: sObject,
						Id: Id
					};
				} catch (e)
				{
					console.log(e);
				}
			}
		}
	});


	const deleteShowIdOnPage = () =>
	{
		spanShowIds.forEach(s =>
		{
			const spanId = document.getElementById(s);
			//console.log(spanId);
			if (spanId)
			{
				spanId.remove();
			}
		});
		spanShowIds = [];
	}

	const showIdOnPage = () =>
	{
		const forceLookupElements = document.querySelectorAll('force-lookup');

		Array.from(forceLookupElements)
			.map(element =>
			{
				const aElements = element.querySelectorAll('a');
				return Array.from(aElements).map(aElement =>
				{
					const href = aElement.href;
					const match = href.match(/\/lightning\/r\/[^\/]+\/([a-zA-Z0-9]{15,18})\/view/);
					if (match)
					{
						const span = document.createElement('span');
						span.id = `alwayshowid-${match[1]}`;
						span.setAttribute('style', 'font-size: smaller;display: inline-table;background-color: rgb(1, 118, 211);padding: 5px;border-radius: 3px;color: rgb(255, 255, 255);-webkit-text-stroke: thin rgb(0, 0, 0);font-weight: bold;cursor: pointer;width: fit-content;');
						span.innerText = match[1];
						element.appendChild(span);

						spanShowIds.push(span.id);
					}
				});
			});
	}
	// indentifierVariabileOnCode + ivc

	document.onmouseup = function ()
	{
		let selectedText = window.getSelection()
		//console.log('SELECTED_TEXT', selectedText);

		if (selectedText && selectedText.toString().length == 18)
		{
			chrome.runtime.sendMessage({
				type: 'createContextMenu'
			});
		} else if (selectedText && windowAnonymCode && selectedText.toString().length > 0)
		{

			chrome.runtime.sendMessage({
				type: 'createContextMenuDC'
			});

		} else
		{
			chrome.runtime.sendMessage({
				type: 'removeContextMenu'
			});
		}

	}




	const addCSS = (css: string) =>
	{
		let link = document.createElement("link");
		link.setAttribute('type', 'text/css');
		link.setAttribute('rel', 'stylesheet');

		link.href = css

		document.head.appendChild(link);
	}
	addCSS(chrome.runtime.getURL('./snippet.css'));
})();
