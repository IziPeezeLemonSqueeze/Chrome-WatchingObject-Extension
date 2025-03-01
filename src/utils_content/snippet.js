export class SNIPPET
{

	copyToClipboard;

	btnCodeSnippet;
	divDCTOOL;
	divFastDCTOOL;
	codeSnippetOpen = false;
	textAreaNewSnippetOpen = false;
	consoleIntervalSearch;
	frameSnippet = null;
	frameFastSnippet = null;
	dialogVarOpen = false;

	salesforceBody;
	windowAnonymCode;
	developerConsoleBody;
	windowApexCode;

	constructor(copyToClipboard)
	{
		this.copyToClipboard = copyToClipboard;
		this.salesforceBody = document.getElementsByClassName('desktop')[0];
	}

	getSalesforceBody()
	{
		return this.salesforceBody;
	}

	setWindowAnonymCode(window)
	{
		this.windowAnonymCode = window;
	}
	getWindowAnonymCode()
	{
		return this.windowAnonymCode;
	}

	getWindowApexCode()
	{
		return this.windowApexCode;
	}

	getDeveloperConsoleBody()
	{
		return this.developerConsoleBody;
	}

	_initDeveloperConsoleBody()
	{

		try
		{
			this.developerConsoleBody = document.getElementById('ext-gen1361');
		} catch (e) { console.error('DEVELOPER_CONSOLE_BODY NOT FOUND >>>'); }

		this.developerConsoleBody ?
			null :
			this.developerConsoleBody = document.getElementsByClassName('ApexCSIPage')[0];
	}

	devConsoleTool()
	{
		try
		{
			this.setWindowAnonymCode(document.getElementById('executeHighlightedButton').parentElement);
			this.windowApexCode = this.windowAnonymCode.parentElement.parentElement.parentElement.parentElement.parentElement;
			if (this.windowAnonymCode)
			{
				clearInterval(this.consoleIntervalSearch);
				if (!document.getElementsByClassName('DCSnippet')[0])
				{
					this.btnCodeSnippet = document.createElement('button');
					this.btnCodeSnippet.className = 'DCSnippet x-btn x-box-item x-toolbar-item x-btn-default-toolbar-small x-noicon x-btn-noicon x-btn-default-toolbar-small-noicon';
					this.btnCodeSnippet.innerText = 'Code Snippet';
					this.btnCodeSnippet.style = 'height: 22px';

					this.windowAnonymCode.appendChild(this.btnCodeSnippet);

					this.btnCodeSnippet.addEventListener('click', this.showHideCodeSnippet);
				}
			}
		} catch (e)
		{
			//console.log(e)
		}
	}

	showHideCodeSnippet = async () =>
	{
		if (!this.codeSnippetOpen)
		{
			this.showCS();
		} else
		{
			this.hideCS();
		}
	}

	openTextAreaNewSnippet()
	{
		this.textAreaNewSnippetOpen = true;
		this._initDeveloperConsoleBody();

		const divNewSnippet = document.createElement('div');
		divNewSnippet.className = 'col';
		divNewSnippet.id = 'newSnippet';
		divNewSnippet.style = 'z-index:1000;left: 5%;border-radius: 10px 10px 10px 10px;padding: 0.1%;background-color: rgb(96, 189, 255);position: absolute;top: 10%;'

		const titleNewSnippet = document.createElement('div');
		titleNewSnippet.innerText = 'CODE SNIPPET - New Snippet';
		titleNewSnippet.style = 'text-align: center;padding: 1%;border-radius: 10px 10px 0px 0px;background-color: rgb(96, 189, 255);font-weight: bold;';

		const textArea = document.createElement('textarea');
		textArea.id = 'newSnippet-textarea';
		textArea.spellcheck = false;
		textArea.placeholder = 'Paste here your code...';
		textArea.style = 'border-radius: 1%;padding: 5%;resize: none;width: 360px;height: 360px;'

		const seperator = document.createElement('br');
		seperator.style = 'margin-top: 1%; margin-bottom: 1%, padding: .5%';

		const divBottom = document.createElement('div');
		divBottom.className = 'row';
		divBottom.style = 'display: flex;flex-direction: row;flex-wrap: nowrap;align-content: center;justify-content: space-between;align-items: center;'

		const inputNewSnippetName = document.createElement('input');
		inputNewSnippetName.style = 'margin: 1%;border-radius: 1%;';
		inputNewSnippetName.placeholder = 'New Snippet NAME';

		const buttonOkNewSnippet = document.createElement('button');
		buttonOkNewSnippet.id = 'saveOkNewSnippet';
		buttonOkNewSnippet.innerText = 'Save';
		buttonOkNewSnippet.className = 'slds-button slds-button_success';
		buttonOkNewSnippet.style = 'width: 90px;mix-blend-mode: multiply;margin-left: auto;margin-right: 5%;size: unset;max-height: 25px;';
		buttonOkNewSnippet.addEventListener('click', (e) =>
		{
			if (inputNewSnippetName.value && textArea.value)
			{
				this.makeSnippet({ name: inputNewSnippetName.value, code: textArea.value });
				chrome.runtime.sendMessage({
					type: 'CREATE_NOTIFICATION',
					payload: {
						title: 'CODE SNIPPET',
						msg: `New Snippet created: ${inputNewSnippetName.value}`
					}
				});
				textArea.value = null;
				inputNewSnippetName.value = null;
				divNewSnippet.remove();
				this.textAreaNewSnippetOpen = false;
			}
		});

		const buttonKoNewSnippet = document.createElement('button');
		buttonKoNewSnippet.innerText = 'Cancel';
		buttonKoNewSnippet.id = 'saveKoNewSnippet';
		buttonKoNewSnippet.className = 'slds-button slds-button_success';
		buttonKoNewSnippet.style = 'mix-blend-mode: multiply;margin-left: auto;margin-right: 1%;size: unset;max-height: 25px;'
		buttonKoNewSnippet.addEventListener('click', (e) =>
		{
			textArea.value = null;
			inputNewSnippetName.value = null;
			divNewSnippet.remove();
			this.textAreaNewSnippetOpen = false;
		});

		divBottom.appendChild(inputNewSnippetName);
		divBottom.appendChild(buttonOkNewSnippet);
		divBottom.appendChild(buttonKoNewSnippet);

		divNewSnippet.appendChild(titleNewSnippet);
		divNewSnippet.appendChild(textArea);
		divNewSnippet.appendChild(seperator);
		divNewSnippet.appendChild(divBottom);

		try
		{
			this.developerConsoleBody.appendChild(divNewSnippet);
		} catch (err) { }
	}

	makeSnippet(payload)
	{
		// TODO CONTORLLO SUI DUPLICATI
		const regexIVC = /@\b[\@V\@ID\@INT\@BOL\@STR]\w+(?='*)/g;
		const countIVC = String(payload.code).match(regexIVC);
		console.log(payload, countIVC);

		chrome.storage.sync.set({
			['snippet_' + payload.name]: {
				code: payload.code,
				ivcFound: countIVC
			}
		});
	}

	confirmDeleteSnippet(payload)
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
			if (this.divFastDCTOOL)
			{
				try
				{
					this.divFastDCTOOL.appendChild(dialogDelete);
				} catch (err)
				{
					console.log(err);
				}

			}
			if (this.divDCTOOL)
			{
				try
				{
					this.divDCTOOL.appendChild(dialogDelete);
				} catch (err)
				{
					console.log(err);
				}
			}
		}

	}

	copyApexSnippet(codeTxt)
	{
		this.copyToClipboard(codeTxt);
	}

	getDialogVarOpen()
	{
		return this.dialogVarOpen;
	}

	openDialogVar([mapValue, code, id])
	{
		const nomeSnippet = id;
		this.dialogVarOpen = true;

		this._initDeveloperConsoleBody();
		//console.log('DEVCONSOLE', developerConsoleBody);

		let isFastToAttach = !this.developerConsoleBody;


		//console.log('isFastToAttach', isFastToAttach)

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
			dialog.style = "width: 600px;background-color: rgba(238, 244, 255, 0.8);border-color: grey;border-radius: 10px;border-width: 7px;position: fixed;z-index: 1;box-shadow: rgba(0, 0, 0, 0.11) 0px 0px 9px 4px;height: 520px;bottom: -90%;right: 50%;"
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
						}
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
				const matchIdOfPage = window.location.href.match(/\/lightning\/r\/[^\/]+\/([a-zA-Z0-9]{15,18})\/view/);
				if (matchIdOfPage)
				{
					input.value = matchIdOfPage[1];
					input.focus();
				}

				/* const idOfPage = window.location.href.split('/');
				const idFounded = idOfPage[idOfPage.length - 2];
				if (idFounded.length === 18)
				{
				  input.value = idFounded;
				  input.focus();
				} */
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

		let btnRun = document.createElement('button');
		btnRun.id = 'btnRun-dialogvar';
		btnRun.innerText = 'RUN 🚀';
		btnRun.className = 'x-btn-inner slds-button slds-button_brand';
		btnRun.style.display = 'none';

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
		//btnRunClose.innerText = 'RUN & CLOSE 🚀';
		btnRunClose.innerText = 'RUN 🚀';
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
				dialog.animate([
					{ bottom: '14%' },
					{ bottom: '-90%' },
				], {
					duration: 500,
					easing: 'ease-in-out',
					iterations: 1,
					fill: 'forwards'
				});

				if (isFastToAttach)
				{
					setTimeout(() =>
					{
						this.salesforceBody.removeChild(document.getElementById('dialogvar'));
					}, 501);
				} else
				{
					setTimeout(() =>
					{
						this.developerConsoleBody.removeChild(document.getElementById('dialogvar'));
					}, 501);
				}
				this.dialogVarOpen = false;
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
				dialog.animate([
					{ bottom: '14%' },
					{ bottom: '-90%' },
				], {
					duration: 500,
					easing: 'ease-in-out',
					iterations: 1,
					fill: 'forwards'
				});

				if (isFastToAttach)
				{
					setTimeout(() =>
					{
						this.salesforceBody.removeChild(document.getElementById('dialogvar'));
					}, 501);
				} else
				{
					setTimeout(() =>
					{
						this.developerConsoleBody.removeChild(document.getElementById('dialogvar'));
					}, 501);
				}
			} catch (err)
			{ }

			this.dialogVarOpen = false;
			chrome.runtime.sendMessage({
				type: 'WO_CODESNIPPET_forceResetDialog'
			});
		});

		divCenterActions.appendChild(btnRun);
		divCenterActions.appendChild(btnRunClose);
		divCenterActions.appendChild(btnAnnulla);

		dialog.appendChild(title);
		dialog.appendChild(div);

		dialog.animate([
			{ bottom: '-90%' },
			{ bottom: '14%' },
		], {
			duration: 500,
			easing: 'ease-in-out',
			iterations: 1,
			fill: 'forwards'
		});
		try
		{
			this.developerConsoleBody.appendChild(dialog);
		} catch (err)
		{
			this.salesforceBody.appendChild(dialog);
		}

	}

	showCS()
	{
		this.divDCTOOL = document.createElement('div');
		this.divDCTOOL.id = 'DCTOOL';
		this.divDCTOOL.style = 'z-index: 1000;display: flex;position: relative;bottom: -50px;left: 77px;';
		this.divDCTOOL.animate([
			{ bottom: '-50px' },
			{ bottom: '137px' },
		], {
			duration: 500,
			easing: 'ease-in-out',
			iterations: 1,
			fill: 'forwards'
		});

		const loaders = document.querySelectorAll('[id*=-loader]');
		loaders.forEach(loader =>
		{
			loader.style.display = 'none';
		});

		this.codeSnippetOpen = true;
		try
		{
			if (document.getElementById('DCTOOL'))
			{
				//console.log('RETURN')
				return;
			}

			this.frameSnippet = document.createElement('iframe');
			this.frameSnippet.src = chrome.runtime.getURL('snippet.html');
			this.frameSnippet.style = 'box-shadow: 1px 1px #ffffff;border-radius: 5px;width: 600px;height: 285px;border: 0px;';

			this.divDCTOOL.appendChild(this.frameSnippet);

			this.windowApexCode.appendChild(this.divDCTOOL);
		} catch (err)
		{
			//console.log(err)
			this.showFastCS();
		}
	}

	showFastCS()
	{
		const fastDCTOOL = document.getElementById('fastDCTOOL')
		if (fastDCTOOL)
		{
			if (fastDCTOOL)
			{
				fastDCTOOL.animate([
					{ bottom: '-18px' },
					{ bottom: '-180px' },
				], {
					duration: 500,
					easing: 'ease-in-out',
					iterations: 1,
					fill: 'forwards'
				});
			}
			setTimeout(() =>
			{
				fastDCTOOL.remove();
			}, 500);
			return;
		}
		this.divFastDCTOOL = document.createElement('div');
		this.divFastDCTOOL.id = 'fastDCTOOL';
		this.divFastDCTOOL.style = 'z-index: 1000;display: flex;position: fixed;bottom: -18px;right: 50%;';
		this.divFastDCTOOL.animate([
			{ bottom: '-180px' },
			{ bottom: '-18px' },
		], {
			duration: 500,
			easing: 'ease-in-out',
			iterations: 1,
			fill: 'forwards'
		});

		this.frameFastSnippet = document.createElement('iframe');
		this.frameFastSnippet.src = chrome.runtime.getURL('snippet.html');
		this.frameFastSnippet.style = 'box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 8px 0px, rgba(0, 0, 0, 0.19) 0px 6px 20px 0px;border-radius: 5px;width: 600px;height: 173px;border: 1px #80808082 solid;;border-radius: 5px;width: 600px;height: 173px;border: 0px;';

		this.divFastDCTOOL.appendChild(this.frameFastSnippet);
		this.salesforceBody.appendChild(this.divFastDCTOOL);


	}

	hideCS()
	{
		this.codeSnippetOpen = false;


		if (this.divDCTOOL)
		{
			this.divDCTOOL.animate([
				{ bottom: '137px' },
				{ bottom: '-50px' },
			], {
				duration: 500,
				easing: 'ease-in-out',
				iterations: 1,
				fill: 'forwards'
			});
			setTimeout(() =>
			{
				try
				{
					this.windowApexCode.removeChild(document.getElementById('DCTOOL'));
					//console.log('REMOVED DCTOOL')
				} catch (err)
				{
					//console.log(err)
				}
			}, 500);
		}

		if (this.divFastDCTOOL)
		{
			this.divFastDCTOOL.animate([
				{ bottom: '-18px' },
				{ bottom: '-180px' },
			], {
				duration: 500,
				easing: 'ease-in-out',
				iterations: 1,
				fill: 'forwards'
			});
			setTimeout(() =>
			{
				try
				{
					this.salesforceBody.removeChild(document.getElementById('fastDCTOOL'));
					//console.log('REMOVED DCTOOL')
				} catch (err)
				{
					console.log(err)
				}
			}, 500);
		}
	}
}



