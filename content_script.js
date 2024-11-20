(() =>
{
	let salesforceBody;

	let developerConsoleBody;

	let windowAnonymCode;
	let consoleIntervalSearch;
	let btnCodeSnippet;
	let codeSnippetOpen = false;
	let dialogVarOpen = false;
	let frameSnippet = null;
	let frameFastSnippet = null;
	let windowApexCode;
	let divDCTOOL;
	let divFastDCTOOL;

	let woToolBtn;
	let toolOpen = false;

	let pageFields = null;
	var apiFieldExist = [];

	chrome.runtime.onMessage.addListener((obj, sender, response) =>
	{
		//console.log('ARRIVED CS ', obj);
		newDock();
		if (obj.response)
		{
			// GESTIONE RESPONSE FROM BACKGROUND.JS
			switch (obj.response)
			{
				case 'devConsole':
					consoleIntervalSearch = setInterval(() =>
					{
						devConsoleTool();
					}, 2000);
					break;
				case 'popupNameSnippet':
					makeSnippet(obj.payload);
					break;
				case 'copyApexSnippet':
					copyApexSnippet(obj.payload);
					hideCS(windowApexCode);
					break;

				case 'confirmDeleteSnippet':
					confirmDeleteSnippet(obj.payload);
					break;

				case 'openDialogVar':
					if (!dialogVarOpen)
					{
						openDialogVar(obj.payload);
					}
					break;

				case 'resetCodeSnippet':
					//console.log('RESET')
					hideCS(windowApexCode);
					showCS(divDCTOOL, windowApexCode);
					break;

				case 'getPageFields':
					if (apiFieldExist.length > 0)
					{
						removeApiNameToFields();
						return;
					}
					pageFields = document.getElementsByClassName('test-id__field-label').length > 0 ? document.getElementsByClassName('test-id__field-label') : null;
					if (!pageFields)
					{
						return;
					}
					const fields = [];
					for (let elem of pageFields)
					{
						fields.push(elem.innerText);
					};
					response(fields);
					break;

				case 'setApiToField':
					if (apiFieldExist.length === 0)
					{
						try
						{
							setApiNameToFields(obj.payload);
						} catch (err) { }
					}
					break;

				case 'resetApiFieldArray':
					removeApiNameToFields();
					break;

				case 'openFastCodeSnippet':
					showFastCS();
					break;
			}
		} else
		{
			const { tab, title, sObject, Id } = obj;
			if (sObject)
			{
				try
				{
					currentObject = {
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

	const removeApiNameToFields = () =>
	{
		if (!apiFieldExist || apiFieldExist.length === 0)
		{
			return;
		}

		apiFieldExist.forEach(id =>
		{
			try
			{
				const el = document.getElementById(id);
				el.remove();
			} catch (err) { }

		});

		apiFieldExist = [];

		location.reload();
	}

	const setApiNameToFields = (api) =>
	{
		const pageFieldsCopy = [...pageFields];
		let newElementObjectInfoOnHTML = document.createElement('span');
		newElementObjectInfoOnHTML.id = 'showapi-objectInfo';
		newElementObjectInfoOnHTML.style = 'background-color: rgb(1, 118, 211);margin-left: 5px;display: inline-block;padding: 5px;border-radius: 3px;color: rgb(255, 255, 255);-webkit-text-stroke: thin rgb(0, 0, 0);font-weight: bold;';
		newElementObjectInfoOnHTML.innerText = `${api.objectInfo}  :  ${(api.recordTypeFound ? api.recordTypeName : "NO RECORDTYPE")}`;
		const headerObject = document.getElementsByClassName('entityNameTitle')[0];
		headerObject.appendChild(newElementObjectInfoOnHTML);
		apiFieldExist.push('showapi-objectInfo');
		//console.log('ENTITY NAME TITLE', headerObject)
		if (!api.recordTypeFound)
		{
			api.apiField.layouts[0].detailLayoutSections.forEach((section, sectionIndex) =>
			{
				section.layoutRows.forEach((row, rowIndex) =>
				{
					row.layoutItems.forEach(item =>
					{
						if (item.layoutComponents.length > 0)
						{
							let inserted = false;
							for (let elem of pageFieldsCopy)
							{
								if (elem.innerText == item.label && !inserted)
								{
									inserted = true;
									api.apiField.detailLayoutSections[sectionIndex].layoutRows[rowIndex].layoutItems = api.apiField.detailLayoutSections[sectionIndex].layoutRows[rowIndex].layoutItems.filter(li => li.label != elem.innerText);
									pageFieldsCopy.splice(pageFieldsCopy.indexOf(elem), 1);
									createElementHTMLForApiFields(elem, item);
								}
							};
						}
					});
				});
			});
		} else
		{
			api.apiField.detailLayoutSections.forEach((section, sectionIndex) =>
			{
				section.layoutRows.forEach((row, rowIndex) =>
				{
					row.layoutItems.forEach(item =>
					{
						if (item.layoutComponents.length > 0)
						{
							let inserted = false;
							for (let elem of pageFieldsCopy)
							{
								if (elem.innerText == item.label && !inserted)
								{
									inserted = true;
									api.apiField.detailLayoutSections[sectionIndex].layoutRows[rowIndex].layoutItems = api.apiField.detailLayoutSections[sectionIndex].layoutRows[rowIndex].layoutItems.filter(li => li.label != elem.innerText);
									pageFieldsCopy.splice(pageFieldsCopy.indexOf(elem), 1);
									createElementHTMLForApiFields(elem, item);
								}
							};
						}
					});
				});
			});
		}

		//console.log('API FIELD INSERTED', apiFieldExist, apiFieldExist.length)
	}

	const createElementHTMLForApiFields = (elem, item) =>
	{
		const newElemementOnHTML = document.createElement('span');
		newElemementOnHTML.id = `showapi-${item.layoutComponents[0].value}`;
		newElemementOnHTML.style = 'background-color: rgb(1, 118, 211);margin-top: 2px;margin-bottom: 5px;display: block;padding: 5px;border-radius: 3px;color: rgb(255, 255, 255);-webkit-text-stroke: thin rgb(0, 0, 0);font-weight: bold;cursor: pointer;';
		newElemementOnHTML.innerText = item.layoutComponents[0].value;
		newElemementOnHTML.title = 'click to copy on clipboard';
		newElemementOnHTML.addEventListener('click', (e) =>
		{
			copyToClipboard(item.layoutComponents[0].value);
		});
		elem.parentNode.appendChild(newElemementOnHTML);

		newElemementOnHTML.style.width = '100%';
		if (item.layoutComponents[0].details.calculatedFormula)
		{
			newElemementOnHTML.style.width = '110%';
			const newElementOnHTMLFormula = document.createElement('span');
			newElementOnHTMLFormula.id = `showapiformula-${item.layoutComponents[0].value}`
			newElementOnHTMLFormula.title = item.layoutComponents[0].details.calculatedFormula;
			newElementOnHTMLFormula.innerText = '{√x}²';
			newElementOnHTMLFormula.style = 'background-color: rgb(1, 118, 211);padding: 6px;color: rgb(255, 255, 255);-webkit-text-stroke: thin rgb(0, 0, 0);font-weight: bold;cursor: help;border-left: dashed;margin-left: 9%;';

			newElemementOnHTML.appendChild(newElementOnHTMLFormula);

			//apiFieldExist.push(newElementOnHTMLFormula.id);
		}
		apiFieldExist.push(newElemementOnHTML.id);
	}

	const devConsoleTool = () => 
	{
		try
		{
			windowAnonymCode = document.getElementById('executeHighlightedButton').parentElement;
			//console.log('START DEV CONSOLE TOOL: ', windowAnonymCode);

			if (windowAnonymCode)
			{
				clearInterval(consoleIntervalSearch);
				if (!document.getElementsByClassName('DCSnippet')[0])
				{
					btnCodeSnippet = document.createElement('button');
					btnCodeSnippet.className = 'DCSnippet x-btn x-box-item x-toolbar-item x-btn-default-toolbar-small x-noicon x-btn-noicon x-btn-default-toolbar-small-noicon';
					btnCodeSnippet.innerText = 'Code Snippet';
					btnCodeSnippet.style = 'height: 22px';

					windowAnonymCode.appendChild(btnCodeSnippet);

					btnCodeSnippet.addEventListener('click', showHideCodeSnippet);
				}
			}
		} catch (e) { console.log(e) }
	}

	const showHideCodeSnippet = () => 
	{
		divDCTOOL = document.createElement('div');
		divDCTOOL.id = 'DCTOOL';
		divDCTOOL.style =
			'z-index: 1000;display: flex;position: relative;bottom: 137px;left: 77px;';

		windowApexCode = windowAnonymCode.parentElement.parentElement.parentElement.parentElement.parentElement;
		if (!codeSnippetOpen)
		{
			showCS(divDCTOOL, windowApexCode);
		} else
		{
			hideCS(windowApexCode);
		}
	}

	const showCS = (div, windowApexCode) =>
	{
		const loaders = document.querySelectorAll('[id*=-loader]');
		loaders.forEach(loader =>
		{
			loader.style.display = 'none';
		});

		codeSnippetOpen = true;
		try
		{
			if (document.getElementById('DCTOOL'))
			{
				console.log('RETURN')
				return;
			}

			frameSnippet = document.createElement('iframe');
			frameSnippet.src = chrome.runtime.getURL('snippet.html');
			frameSnippet.style = 'box-shadow: 1px 1px #ffffff;border-radius: 5px;width: 600px;height: 285px;border: 0px;';
			div.appendChild(frameSnippet);
			windowApexCode.appendChild(div);
		} catch (err)
		{
			showFastCS();
		}
	}

	const showFastCS = () =>
	{
		const fastDCTOOL = document.getElementById('fastDCTOOL')
		if (fastDCTOOL)
		{
			fastDCTOOL.remove();
			return;
		}
		divFastDCTOOL = document.createElement('div');
		divFastDCTOOL.id = 'fastDCTOOL';
		divFastDCTOOL.style = 'z-index: 1000;display: flex;position: fixed;bottom: -18px;right: 50%;';
		frameFastSnippet = document.createElement('iframe');
		frameFastSnippet.src = chrome.runtime.getURL('snippet.html');
		frameFastSnippet.style = 'box-shadow: 1px 1px #ffffff;border-radius: 5px;width: 600px;height: 173px;border: 0px;';
		divFastDCTOOL.appendChild(frameFastSnippet);
		salesforceBody.appendChild(divFastDCTOOL);


	}

	const hideCS = (windowApexCode) =>
	{
		codeSnippetOpen = false;
		//console.log('WINDOW', windowApexCode)
		divDCTOOL = document.createElement('div');
		divDCTOOL.id = 'DCTOOL';
		divDCTOOL.style =
			'z-index: 1000;display: flex;position: relative;bottom: 137px;left: 77px;';
		try
		{
			windowApexCode.removeChild(document.getElementById('DCTOOL'));
			//console.log('REMOVED DCTOOL')
		} catch (err)
		{
			salesforceBody.removeChild(document.getElementById('fastDCTOOL'));
		}
	}

	// indentifierVariabileOnCode + ivc

	const makeSnippet = (payload) =>
	{
		const name = prompt('Nome Snippet?');
		// TODO CONTORLLO SUI DUPLICATI
		const regexIVC = /@\b[\@V\@ID\@INT\@BOL\@STR]\w+(?='*)/g;
		const countIVC = String(payload).match(regexIVC);
		//console.log(countIVC);

		chrome.storage.local.set({
			['snippet_' + name]: {
				code: payload,
				ivcFound: countIVC
			}
		});
	}

	const copyApexSnippet = (codeTxt) =>
	{
		copyToClipboard(codeTxt);
	}

	const confirmDeleteSnippet = (payload) =>
	{
		//console.log('divFastDCTOOL', divFastDCTOOL)
		//console.log('divDCTOOL', divDCTOOL)
		let dialogDelete = document.createElement('dialog');
		dialogDelete.id = 'deleteSnippet';
		let titleDelete = document.createElement('h4');
		titleDelete.innerText = `Confirm delete snippet: [${payload.split('_')[1]}]`;

		dialogDelete.setAttribute('open', '');
		dialogDelete.style = "border: 2px solid black;border-radius: 5px;background-color: rgba(155, 142, 142, 0.79);display: flex;flex-flow: column;justify-content: center;align-items: baseline;flex-direction: column;flex-wrap: wrap;align-content: stretch;";

		let okDeleteBtn = document.createElement('buttonOkDelete');
		okDeleteBtn.id = 'okDeleteButton';
		okDeleteBtn.innerText = 'OK 👌';
		okDeleteBtn.style = 'margin-top: 5px;background-color: green;cursor: pointer;size: unset;max-height: 25px; border: 2px solid black; border-radius: 5px;padding:3px';
		okDeleteBtn.className = 'slds-button slds-button_success';
		okDeleteBtn.addEventListener('click', (e) =>
		{
			chrome.runtime.sendMessage({
				type: 'WO_CODESNIPPET_okDeleteSnippet',
				payload: payload
			});
		});
		let denyDeleteBtn = document.createElement('buttonDenyDelete');
		denyDeleteBtn.id = 'denyDeleteButton';
		denyDeleteBtn.style = 'margin-top: 5px;background-color: #bd0000;cursor: pointer;size: unset;max-height: 25px; border: 2px solid black; border-radius: 5px;padding:3px';
		denyDeleteBtn.innerText = 'No 🙂‍';
		denyDeleteBtn.className = 'slds-button slds-button_destructive';
		denyDeleteBtn.addEventListener('click', (e) =>
		{
			chrome.runtime.sendMessage({
				type: 'WO_CODESNIPPET_forceResetDialog'
			});
		});


		dialogDelete.appendChild(titleDelete);
		dialogDelete.appendChild(denyDeleteBtn);
		dialogDelete.appendChild(okDeleteBtn);

		const dialogDeleteAlreadyExist = document.getElementById('deleteSnippet') ? true : false;
		//console.log('dialogDeleteAlreadyExist', dialogDeleteAlreadyExist)
		if (!dialogDeleteAlreadyExist)
		{
			try
			{
				divFastDCTOOL.appendChild(dialogDelete);
			} catch (err)
			{
				divDCTOOL.appendChild(dialogDelete);
				console.log(err)
			}
		}
	}

	const openDialogVar = ([mapValue, code, id]) =>
	{
		const nomeSnippet = id;
		dialogVarOpen = true;
		try
		{
			developerConsoleBody = document.getElementById('ext-gen1361');
		} catch (e) { console.error('DEVELOPER_CONSOLE_BODY NOT FOUND >>>'); }

		developerConsoleBody ?
			null :
			developerConsoleBody = document.getElementsByClassName('ApexCSIPage')[0];

		console.log('DEVCONSOLE', developerConsoleBody);

		let isFastToAttach = !developerConsoleBody;


		console.log('isFastToAttach', isFastToAttach)

		let dialog = document.createElement('div');
		dialog.id = 'dialogvar';
		let title = document.createElement('div');
		title.innerText = 'CODE SNIPPET - Value assignment!\nNAME SNIPPET: ' + id.replace('snippet_', '');
		title.style = 'text-align: center;m;padding: 1%;border-radius: 10px 10px 0px 0px;background-color: rgb(96, 189, 255);font-weight: bold;';
		dialog.setAttribute('open', '');
		/* dialog.style = "background-color: rgba(255, 255, 255, 0.8);border-color: grey;border-radius: 10px;border-width: 1px;margin: 5%;min-width: -webkit-fill-available;position: fixed;z-index: 1000000000;top: 1%;box-shadow: rgba(0, 0, 0, 0.11) 0px 0 7px 9px;height: 520px;" */

		if (isFastToAttach)
		{
			/* dialog.style = "width: 100%;background-color: rgba(238, 244, 255, 0.8);border-color: grey;border-radius: 10px;border-width: 1px;position: absolute;z-index: -1;box-shadow: rgba(0, 0, 0, 0.11) 0px 0px 7px 9px;height: 520px;bottom: 85%;" */
			dialog.style = "width: 600px;background-color: rgba(238, 244, 255, 0.8);border-color: grey;border-radius: 10px;border-width: 7px;position: fixed;z-index: 1;box-shadow: rgba(0, 0, 0, 0.11) 0px 0px 9px 4px;height: 520px;bottom: 14%;right: 50%;"
		} else
		{
			dialog.style = "width: 30%;background-color: rgba(238, 244, 255, 0.8);border-color: grey;border-radius: 10px;border-width: 1px;position: fixed;top: 5%;right: 35%;z-index: 1000000;box-shadow: rgba(0, 0, 0, 0.11) 0px 0px 7px 9px;height: 490px;";
		}

		let list = document.createElement('ul');
		list.style = "min-height: 130px; overflow-y: scroll";
		//list.className = "slds-has-block-links_space";
		list.id = 'list-dialogvar';

		let div = document.createElement('div');
		div.className = 'row';
		div.style = "padding: 1%;margin-top: 5%;min-height: 415px;height: 400px;display: flex;justify-content: space-evenly;align-items: flex-start;flex-flow: row;"

		/* 		RESULTING CODE DIV
		let divRight = document.createElement('div');
		divRight.style = "height: -webkit-fill-available;display: flex;flex-wrap: nowrap;align-items: center;flex-direction: column;";
		divRight.className = 'col-4'; */

		let divCenter = document.createElement('div');
		divCenter.style = "width: 100%;background-color: rgba(238, 244, 255, 0.0);height: -webkit-fill-available;display: flex;flex-direction: column-reverse;place-content: center space-between;"

		divCenter.className = 'col-4';

		let divCenterActions = document.createElement('div');
		divCenterActions.className = 'col-4';
		divCenterActions.style = "margin-top: 2%;display: flex;align-items: flex-start;flex-direction: row;justify-content: space-around;"

		div.appendChild(divCenter);
		divCenter.appendChild(divCenterActions);
		//div.appendChild(divRight);
		const mapType = new Map(
			[
				['ID', 'ID, here you can put only ID, there is the 18-character check!.\nNO SUPERSCRIPTS OR QUOTATION MARKS'],
				['NMB', 'Number, here you can put only numbers, it represents any kind of number: Int, Float, Decimal etc...\nNO SUPERSCRIPTS OR QUOTATION MARKS'],
				['STR', 'String, here you can put only text.\n NO SUPERSCRIPTS OR QUOTATION MARKS'],
				['BOL', 'Boolean, here you can put true or false.'],
				['V', 'Any, here you can put anything. HERE SUPERSCRIPTS OR QUOTATION MARKS ARE ALLOWED, depending on the case. Useful in String concatenation'],

			]);
		//console.log('mapValue', mapValue);

		let lastValueInserted = new Map();
		let codeModified = code;

		Object.entries(mapValue).forEach((elem, idx) =>
		{
			let el = elem[1];
			//console.log(el, idx);
			let spanTestoTipo = document.createElement('p');
			spanTestoTipo.id = 'spantestotipo';
			let nameVar = document.createElement('h2');
			nameVar.innerText = el.name;
			nameVar.style = 'font-weight: bold; text-align: center; text-transform: uppercase;'
			nameVar.title = el.name;
			spanTestoTipo.innerText =
				'Enter the value for the variable: ';
			spanTestoTipo.appendChild(nameVar);

			let spanTestoVarName = document.createElement('p');
			spanTestoVarName.id = 'spantestovarname';
			spanTestoVarName.innerText =
				`The variable is of type: ${mapType.get(el.type) ? el.type : 'UNDEFINED'}
                Description Type: ${mapType.get(el.type)}
                `;

			let isInvalidField = false;

			const divRowInput = document.createElement('div');
			divRowInput.className = 'row';

			let input = document.createElement('input');
			input.id = 'input-dialogvar' + id + '_' + el.name;
			input.setAttribute('type', 'text');
			input.className = "dialogerror";
			input.style = "width: 90%"
			input.placeholder = 'Enter the value you want to assign here!';

			input.addEventListener('input', (e) =>
			{
				if (e.target.value == '' || !e.target.value)
				{
					delete elem[1].value;
				}
			});

			input.addEventListener('focusout', (e) =>
			{
				//console.log(e.target.value);
				try
				{
					if (!input.className.includes('dialoggood'))
					{
						input.className = 'dialoggood';
					}
					input.className.replace('dialogerror', 'dialoggood');
					isInvalidField = false;
				} catch (e) { }
				switch (el.type)
				{
					case 'V':
						if (e.target.value.length < 1) 
						{
							returnInvalid();
						}
						if (!isInvalidField)
						{
							lastValueInserted.set(el.ivc, e.target.value);
							if (!codeModified.includes(el.ivc) &&
								!lastValueInserted.get(el.ivc).includes("'")) 
							{
								codeModified = codeModified.replace(lastValueInserted.get(el.ivc), el.ivc);
								elem[1].value = '';
							} else if (!codeModified.includes("'" + el.ivc + "'") && lastValueInserted.get(el.ivc).includes("'"))
							{
								codeModified = codeModified
									.replace(lastValueInserted.get(el.ivc), "'" + el.ivc + "'");
								elem[1].value = '';
							}

							if (codeModified.includes("'" + el.ivc + "'"))
							{
								codeModified = codeModified.replace("'" + el.ivc + "'", e.target.value);
							} else if (codeModified.includes(el.ivc))
							{
								codeModified = codeModified.replace(el.ivc, e.target.value);
							}
							elem[1].value = e.target.value;
						} else
						{
							codeModified = codeModified.replace(lastValueInserted.get(el.ivc), "'" + el.ivc + "'");
						}
						break;
					case 'ID':
						if (checkVirgolette(e.target.value))
						{
							returnInvalid();
						}
						if (input.value.length != 18)
						{
							returnInvalid();
						}
						if (!isInvalidField)
						{
							if (!codeModified.includes(el.ivc))
							{
								codeModified = codeModified.replace(lastValueInserted.get(el.ivc), el.ivc);
								elem[1].value = '';
							}
							lastValueInserted.set(el.ivc, e.target.value);
							codeModified = codeModified.replace(el.ivc, e.target.value);
							elem[1].value = e.target.value;
						} else
						{
							codeModified = codeModified.replace(lastValueInserted.get(el.ivc), el.ivc);
						}
						break;
					case 'STR':
						if (checkVirgolette(e.target.value) || e.target.value.length < 1)
						{
							returnInvalid();
						}
						if (!isInvalidField)
						{
							if (!codeModified.includes(el.ivc))
							{
								codeModified = codeModified.replace(lastValueInserted.get(el.ivc), el.ivc);
								elem[1].value = '';
							}
							lastValueInserted.set(el.ivc, e.target.value);
							codeModified = codeModified.replace(el.ivc, e.target.value);
							elem[1].value = e.target.value;
						} else
						{
							codeModified = codeModified.replace(lastValueInserted.get(el.ivc), el.ivc);
						}
						break;
					case 'BOL':
						if (checkVirgolette(e.target.value))
						{
							returnInvalid();
						} false
						if (e.target.value != 'true' && e.target.value != 'false')
						{
							returnInvalid();
						}
						if (!isInvalidField)
						{
							if (!codeModified.includes(el.ivc))
							{
								codeModified = codeModified.replace(lastValueInserted.get(el.ivc), "'" + el.ivc + "'");
								elem[1].value = '';
							}
							lastValueInserted.set(el.ivc, e.target.value);
							codeModified = codeModified.replace("'" + el.ivc + "'", e.target.value);
							elem[1].value = e.target.value;
						} else
						{
							codeModified = codeModified.replace(lastValueInserted.get(el.ivc), "'" + el.ivc + "'");
						}
						break;
					case 'NMB':
						if (checkVirgolette(e.target.value))
						{
							returnInvalid();
						}
						if (!(/^\d+$/.test(e.target.value)))
						{
							returnInvalid();
						}
						if (!isInvalidField)
						{
							if (!codeModified.includes(el.ivc))
							{
								codeModified = codeModified.replace(lastValueInserted.get(el.ivc), "'" + el.ivc + "'");
							}
							lastValueInserted.set(el.ivc, e.target.value);
							codeModified = codeModified.replace("'" + el.ivc + "'", e.target.value);
							elem[1].value = e.target.value;
						} else
						{
							codeModified = codeModified.replace(lastValueInserted.get(el.ivc), "'" + el.ivc + "'");
						}
						break;
				}

				function checkVirgolette(value)
				{
					if (value.includes("'") || value.includes('"'))
					{
						return true;
					}
					return false;
				}
				function returnInvalid()
				{
					isInvalidField = true;
					if (input.className.includes('dialoggood') && !input.className.includes('dialogerror'))
					{
						input.className = 'dialogerror';
					}
				}
				//console.log(lastValueInserted)
				//textArea.innerText = codeModified;
			});

			const buttonPageId = document.createElement('button');
			buttonPageId.id = 'btnVar-PageId';
			buttonPageId.className = 'x-btn-inner slds-button slds-button_brand';
			buttonPageId.title = 'Takes the id of the page you are currently on';
			buttonPageId.addEventListener('click', (e) =>
			{
				const idOfPage = window.location.href.split('/');
				const idFounded = idOfPage[idOfPage.length - 2];
				if (idFounded.length === 18)
				{
					input.value = idFounded;
					input.focus();
				}
			});
			buttonPageId.innerText = 'ID';
			buttonPageId.style = 'height: 20px;width: 8%;';

			let li = document.createElement('li');
			li.id = 'elemlist';
			li.appendChild(spanTestoTipo);
			li.appendChild(spanTestoVarName);
			divRowInput.appendChild(input)
			divRowInput.appendChild(buttonPageId);
			li.appendChild(divRowInput);
			list.appendChild(li);
		});

		divCenter.appendChild(list);


		// RESULTING CODE
		/* 		let spanTextArea = document.createElement('span');
				spanTextArea.id = 'spantextarea-dialogvar';
				spanTextArea.innerText = 'Resulting code';
				let textArea = document.createElement('textarea');
				textArea.id = 'textarea-dialogvar';
				textArea.setAttribute('row', 50);
				textArea.setAttribute('col', 100);
				textArea.setAttribute('readonly', true);
				textArea.innerText = code;
				textArea.className = "textarea";
				textArea.style = "resize: none;min-height: 400px;min-width: 550px;width: 585px;height: 413px;";
		
		
				divRight.appendChild(spanTextArea);
				divRight.appendChild(textArea); */

		let btnRun = document.createElement('button');
		btnRun.id = 'btnRun-dialogvar';
		btnRun.innerText = 'RUN 🚀';
		btnRun.className = 'x-btn-inner slds-button slds-button_brand';

		btnRun.addEventListener('click', (e) =>
		{
			let allValue = false;
			Object.entries(mapValue).forEach((v, id) =>
			{
				let elemlist_input = document.getElementById('input-dialogvar' + nomeSnippet + '_' + v[1].name);
				//console.log(elemlist_input);
				let elemlist = elemlist_input.parentElement;
				//console.log(v[1]);
				if ((v[1].value != null || v[1].value != undefined) &&
					(
						!v[1].value.includes('@STR') &&
						!v[1].value.includes('@NMB') &&
						!v[1].value.includes('@ID') &&
						!v[1].value.includes('@V') &&
						!v[1].value.includes('@BOL')))
				{
					allValue = true;
					elemlist.style = '';
					elemlist.title = '';
				} else
				{
					allValue = false;
					elemlist.style = 'border-color: red;';
					elemlist.title = 'Here is a problem... ';
				}
			});

			if (allValue)
			{
				//console.log(codeModified);
				chrome.runtime.sendMessage({
					type: 'WO_CODESNIPPET_run',
					payload: codeModified.replaceAll('\n', ''),
					resetTimeoutDialogTime: 5
				});
			}
		});

		let btnRunClose = document.createElement('button');
		btnRunClose.innerText = 'RUN & CLOSE 🚀';
		btnRunClose.id = 'btnRunClose-dialogvar';
		btnRunClose.className = 'x-btn-inner slds-button slds-button_brand';
		btnRunClose.addEventListener('click', (e) =>
		{
			let allValue = false;
			Object.entries(mapValue).forEach((v, id) =>
			{
				let elemlist_input = document.getElementById('input-dialogvar' + nomeSnippet + '_' + v[1].name);
				//console.log(elemlist_input);
				let elemlist = elemlist_input.parentElement;
				//console.log(v[1]);
				if ((v[1].value != null || v[1].value != undefined) &&
					(
						!v[1].value.includes('@STR') &&
						!v[1].value.includes('@NMB') &&
						!v[1].value.includes('@ID') &&
						!v[1].value.includes('@V') &&
						!v[1].value.includes('@BOL')))
				{
					allValue = true;
					elemlist.style = '';
					elemlist.title = '';
				} else
				{
					allValue = false;
					elemlist.style = 'border-color: red;';
					elemlist.title = 'Here is a problem... ';
				}
			});

			if (allValue)
			{
				//console.log(codeModified);
				chrome.runtime.sendMessage({
					type: 'WO_CODESNIPPET_run',
					payload: codeModified.replaceAll('\n', ''),
					resetTimeoutDialogTime: 5
				});
				Object.entries(mapValue).forEach((v, id) =>
				{
					delete v[1].value;
				});
				try
				{
					developerConsoleBody.removeChild(document.getElementById('dialogvar'));
				} catch (err)
				{
					salesforceBody.removeChild(document.getElementById('dialogvar'));
				}
				dialogVarOpen = false;
				chrome.runtime.sendMessage({
					type: 'WO_CODESNIPPET_forceResetDialog'
				});
			}
		});

		let btnAnnulla = document.createElement('button');
		btnAnnulla.innerText = 'CANCEL ❌';
		btnAnnulla.id = 'btnAnnulla-dialogvar';
		btnAnnulla.className = 'x-btn-inner slds-button slds-button_brand';
		btnAnnulla.addEventListener('click', (e) =>
		{
			Object.entries(mapValue).forEach((v, id) =>
			{
				delete v[1].value;
			});
			try
			{
				developerConsoleBody.removeChild(document.getElementById('dialogvar'));
			} catch (err)
			{
				salesforceBody.removeChild(document.getElementById('dialogvar'));
			}
			dialogVarOpen = false;
			chrome.runtime.sendMessage({
				type: 'WO_CODESNIPPET_forceResetDialog'
			});
		});

		divCenterActions.appendChild(btnRun);
		divCenterActions.appendChild(btnRunClose);
		divCenterActions.appendChild(btnAnnulla);

		dialog.appendChild(title);
		dialog.appendChild(div);
		try
		{
			developerConsoleBody.appendChild(dialog);
		} catch (err)
		{
			salesforceBody.appendChild(dialog);
		}

	}

	const newDock = () =>
	{
		try
		{
			salesforceBody = document.getElementsByClassName('desktop')[0];
			if (!document.getElementsByClassName('WOtool-btn slds-button slds-button_brand')[0])
			{
				woToolBtn = document.createElement('button');
				woToolBtn.className = 'WOtool-btn slds-button slds-button_brand';
				woToolBtn.innerText = '🛠️';
				woToolBtn.style = 'width: 10px;bottom: 11px;position: fixed;right: -5px;z-index: 9;height: 30px;';
				woToolBtn.addEventListener('click', showHideWOTools);

				salesforceBody.appendChild(woToolBtn);
			}
			if (toolOpen)
			{
				//console.log('CHECK WOTOOL', document.getElementById('WOTOOL'));
				if (!document.getElementById('WOTOOL')) 
				{
					let div = document.createElement('div');
					div.id = 'WOTOOL';
					div.style =
						'z-index: 1000;display: flex;position: fixed;bottom: 42px;right: 0px;vertical-align: middle;';
					let frame = document.createElement('iframe');
					frame.src = chrome.runtime.getURL('dock.html');
					frame.style = 'width: 248px; height: 385px; border: 0; border-bottom-right-radius: 0px; border-top-right-radius: 15px; border-top-left-radius: 15px; border-bottom-left-radius: 15px;';
					div.appendChild(frame);

					salesforceBody.appendChild(div);
				}
			} else
			{
				try
				{
					salesforceBody.removeChild(document.getElementById('WOTOOL'));
				} catch (e)
				{
					//console.log(e);
				}
			}
		} catch (e)
		{
			//console.log(e);
		}
	}

	const showHideWOTools = async () =>
	{
		toolOpen = !toolOpen;
		newDock();
	}

	document.onmouseup = function ()
	{
		let selectedText = window.getSelection()
		//console.log('SELECTED_TEXT', selectedText);

		if (selectedText.toString().length == 18)
		{
			chrome.runtime.sendMessage({
				type: 'createContextMenu'
			});
		} else if (windowAnonymCode && selectedText.toString().length > 0)
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


	const copyToClipboard = (textToCopy) =>
	{
		const t = document.createElement('textarea');
		t.value = textToCopy;
		t.setAttribute('readonly', '');
		t.style.position = 'absolute';
		t.style.left = '-9999px';
		document.body.appendChild(t);
		t.select();
		document.execCommand('copy');
		document.body.removeChild(t);
	}


	const addCSS = (css) =>
	{
		let link = document.createElement("link");
		link.setAttribute('type', 'text/css');
		link.setAttribute('rel', 'stylesheet');

		link.href = css

		document.head.appendChild(link);
	}
	addCSS(chrome.runtime.getURL('./snippet.css'));
})();