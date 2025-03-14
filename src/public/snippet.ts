const root = document.getElementById('snippet_body');
const btnBackup = document.getElementById('btnBackupSnippets');
const btnRestore = document.getElementById('btnRestoreSnippets') as HTMLInputElement;
const btnRestoreSpan = document.getElementById('btnRestoreSnippetsSpan');
const btnAddSnippet = document.getElementById('btnAddSnippet');
const btnCloseCS = document.getElementById('btnCloseCS');
const nButton: {
	doc: HTMLElement;
	payload: any;
	id: string;
}[] = [];
let dialog = document.getElementById('dialog');
let mapValue = new Map();
const snippetsBackup: { name: string; code: any; ivcFound: any; }[] = [];

document.addEventListener("DOMContentLoaded", async () =>
{
	btnCloseCS.innerText = '❌';
	btnCloseCS.addEventListener('click', (e) =>
	{
		closeWindow();
	})

	btnAddSnippet.innerText = 'New ➕';
	btnAddSnippet.addEventListener('click', (e) =>
	{
		handler_addNewSnippet();
	});

	btnBackup.innerText = 'BACKUP 💾';
	btnBackup.addEventListener('click', async (e) =>
	{
		const _myArray = JSON.stringify(snippetsBackup, null, 4);
		const vLink = document.createElement('a'),
			vBlob = new Blob([_myArray], { type: "application/json" }),
			vName = 'snippets_BACKUP.json',
			vUrl = window.URL.createObjectURL(vBlob);
		vLink.setAttribute('href', vUrl);
		vLink.setAttribute('download', vName);
		vLink.click();
	});

	btnRestoreSpan.innerText = 'RESTORE 📄';
	btnRestore.addEventListener("change", function ()
	{
		if (this.files && this.files[0])
		{
			const myFile = this.files[0];
			const reader = new FileReader();

			reader.addEventListener('load', function (e)
			{
				const payloadRestore = JSON.parse(e.target.result as string);
				//console.log(payloadRestore);

				const checkValidJSON = Object.keys(payloadRestore[0]);
				if (checkValidJSON[0] != 'name' || checkValidJSON[1] != 'code' || checkValidJSON[2] != 'ivcFound')
				{
					console.log('[CODE SNIPPET] : CANT RESTORE, NOT VALID JSON')
					return;
				}

				payloadRestore.forEach((p: { name: string | number | (string | number)[] | Partial<{ [key: string]: any; }>; code: any; ivcFound: any; }) =>
				{
					chrome.storage.sync.get(p.name, async (items) =>
					{
						if (!Object.keys(await items)[0])
						{
							chrome.storage.sync.set({
								[p.name as string]: {
									code: p.code,
									ivcFound: p.ivcFound
								}
							});
						}
					});
				});
			});

			reader.readAsText(myFile);
		}
	});
});

chrome.storage.onChanged.addListener(async (changes, namespace) =>
{
	//console.log(Object.entries(changes)[0])
	const obj = Object.entries(changes)[0]
	if (/* namespace == 'local' &&  */obj[0].includes('snippet_'))
	{
		let obj_item: any = {};
		obj_item[obj[0]] = obj[1].newValue;
		//console.log('RESULT OBJ ', obj_item)
		await creatorElementList(obj_item);

	}
});

chrome.runtime.onMessage.addListener((obj, sender, response) =>
{
	//console.log('ARRIVED SNIPPET', obj);
	if (obj.response && obj.response.includes('snippet_'))
	{
		switch (obj.response)
		{
			case 'snippet_resetDialog':
				hideHandlerDialogInfo();
				break;
			case 'snippet_showErrorDialog':
				//console.log(obj.payload);
				showHandlerDialogError(obj.payload);
				break;
		}
	}
});


const createObjectList = () =>
{
	chrome.storage.sync.get(null, async (items) =>
	{
		if (await items)
		{
			console.log('ITEMS ', items);
			creatorElementList(items);
		}
	});
}

const closeWindow = () =>
{
	chrome.runtime.sendMessage({
		type: 'WO_CODESNIPPET_close'
	});
}

const creatorElementList = async (items: IsnippetFromStorage) =>
{
	//console.log('CREATOR : ', items);
	const listUL = document.getElementById('list');
	Object.keys(items).forEach((k, i) =>
	{
		if (k.includes('snippet_'))
		{
			let li = document.createElement('li');
			li.id = k;

			let div = document.createElement('div');
			div.className = 'row';
			div.setAttribute('style', "display: flex; margin-top: 1%");

			let btnRun = document.createElement('button');
			btnRun.innerText = 'Run 🚀';
			btnRun.setAttribute('style', items[k].ivcFound ?
				"background-color: darkorange;margin-left: auto;margin-right: 1%;size: unset;max-height: 25px;" :
				"margin-left: auto;margin-right: 1%;size: unset;max-height: 25px;");

			btnRun.id = k + '-run';
			btnRun.title = items[k].ivcFound ?
				'Run the code now!\n--⚠️-- WARNING --⚠️--\n You will insert variables before the actual execution!' :
				'Run the code now!'
			btnRun.className = 'slds-button slds-button_success';

			let loader = document.createElement('div');
			loader.id = k + '-loader'
			loader.className = 'loader';

			let btnMod = document.createElement('button');
			btnMod.innerText = '💾';
			btnMod.id = k + '-mod';
			btnMod.title = 'Copy the code!'
			btnMod.className = 'slds-button slds-button_outline-brand';
			btnMod.setAttribute('style', 'max-height: 25px;');

			let btnRemove = document.createElement('button');
			btnRemove.innerText = '🚽';
			btnRemove.id = k + '-del';
			btnRemove.title = 'Trash the code!'
			btnRemove.className = 'slds-button slds-button_outline-brand';
			btnRemove.setAttribute('style', 'max-height: 25px;');

			let span = document.createElement('span');
			span.innerText = k.replace('snippet_', '');
			span.setAttribute('style', "margin-left: 1%;");
			span.title = items[k].code;
			span.id = k + '-span';

			div.appendChild(span);
			div.appendChild(loader);
			div.appendChild(btnRun);
			div.appendChild(btnMod);
			div.appendChild(btnRemove);
			li.appendChild(div);


			let hr = document.createElement('hr');
			hr.setAttribute('style', "margin-bottom: -0.2%;margin-top: 0.6%;");
			hr.id = k;
			listUL.appendChild(div);
			listUL.appendChild(hr);


			snippetsBackup.push({ "name": k, "code": items[k].code, "ivcFound": items[k].ivcFound });
			nButton.push({ doc: document.getElementById(k + '-run'), payload: items[k], id: k });
			nButton.push({ doc: document.getElementById(k + '-mod'), payload: items[k], id: k });
			nButton.push({ doc: document.getElementById(k + '-del'), payload: null, id: k });
		}
	});

	nButton.forEach(btnIdx =>
	{
		let id = String(btnIdx.doc.id).split('-')
		switch (id[1])
		{
			case 'run':
				//console.log(id[0], 'RUN');
				btnIdx.doc.addEventListener('click', () =>
				{
					document.getElementById(btnIdx.id + '-loader').style.display = 'inline';
					handler_run(btnIdx.doc, btnIdx.payload, btnIdx.id);
				});
				break;
			case 'mod':
				//console.log(id[0], 'MOD');
				btnIdx.doc.addEventListener('click', () =>
				{
					handler_mod(document.getElementById(btnIdx.id + '-span').title);
				});
				break;
			case 'del':
				//console.log(id[0], 'DEL');
				btnIdx.doc.addEventListener('click', () =>
				{
					handler_del(btnIdx.id);
				});
				break;
		}
	});
}

let intervalHideErrorDIalog: string | number | NodeJS.Timeout;
let secAutoClose = 5;
let divErrorDialog = document.createElement('div');
const showHandlerDialogError = (textObj: string) =>
{
	//initDialog();
	console.log('TESTO ERRORE DIALOG', textObj);
	divErrorDialog.id = 'divErrorDialog';
	divErrorDialog.className = 'column';
	divErrorDialog.setAttribute('style', "-webkit-text-stroke-width: medium;text-align-last: center;");
	let span = document.createElement('span');
	span.innerText = textObj;
	let btn = document.createElement('button');
	btn.className = 'slds-button slds-button_brand';


	btn.addEventListener('click', () =>
	{
		hideHandlerDialogError();
		chrome.runtime.sendMessage({
			type: 'WO_CODESNIPPET_forceResetDialog'
		});
	});

	intervalHideErrorDIalog = setInterval(() =>
	{
		if (secAutoClose <= 1)
		{
			hideHandlerDialogError();
		}
		secAutoClose--;
		btn.innerText = `Ok ...${secAutoClose}`;
	}, 1000);

	divErrorDialog.appendChild(span);
	divErrorDialog.appendChild(document.createElement('br'));
	divErrorDialog.appendChild(btn);

	dialog.innerText = 'ERROR: ';
	dialog.appendChild(divErrorDialog);
	dialog.setAttribute('open', '');
}

const hideHandlerDialogError = () =>
{
	try
	{
		clearInterval(intervalHideErrorDIalog);
	} catch (e) { }
	secAutoClose = 5;

	dialog.innerHTML = '';
	hideHandlerDialogInfo();
}

const showHandlerDialogInfo = (textDialog: string, p0: any[]) =>
{
	dialog.setAttribute('z-index', '2000000000000000000');
	dialog.innerText = textDialog;
	dialog.setAttribute('open', '');

	nButton.forEach(btn =>
	{
		btn.doc.setAttribute('disabled', '');
	});
}

const hideHandlerDialogInfo = () =>
{
	dialog.innerText = '';
	dialog.removeAttribute('open');
	nButton.forEach(btn =>
	{
		btn.doc.removeAttribute('disabled');
	});
}

const handler_run = (doc: { id: any; }, payload: { ivcFound: any[]; code: string; }, id: any) =>
{
	//console.log('HANDLING RUN BUTTON', payload);
	showHandlerDialogInfo('Snippet in RUN...Waiting!', [doc.id]);

	if (payload.ivcFound != null && payload.ivcFound.length > 0)
	{
		payload.ivcFound.forEach((ivc: string) =>
		{
			//console.log(ivc);
			if (ivc.includes('@ID'))
			{
				let name = ivc.replace('@ID', '');
				!mapValue.has(name) ?
					mapValue.set(name, {
						type: 'ID',
						name: name,
						ivc: ivc
					}) :
					null;

			} else if (ivc.includes('@NMB'))
			{
				let name = ivc.replace('@NMB', '');
				!mapValue.has(name) ?
					mapValue.set(name, {
						type: 'NMB',
						name: name,
						ivc: ivc
					}) :
					null;
			} else if (ivc.includes('@BOL'))
			{
				let name = ivc.replace('@BOL', '');
				!mapValue.has(name) ?
					mapValue.set(name, {
						type: 'BOL',
						name: name,
						ivc: ivc
					}) :
					null;
			} else if (ivc.includes('@STR'))
			{
				let name = ivc.replace('@STR', '');

				!mapValue.has(name) ?
					mapValue.set(name, {
						type: 'STR',
						name: name,
						ivc: ivc
					}) :
					null;
			} else if (ivc.includes('@V'))
			{
				let name = ivc.replace('@V', '');
				!mapValue.has(name) ?
					mapValue.set(name, {
						type: 'V',
						name: name,
						ivc: ivc
					}) :
					null;
			}
		});
		//console.log('CHECK 1', mapValue);
		chrome.runtime.sendMessage({
			type: 'WO_CODESNIPPET_openDialogVar',
			payload: [Object.fromEntries(mapValue), payload.code, id]

		});
		/*
				console.log('CHECK 2', mapValue.values());
				mapValue.forEach(k =>
				{
					console.log('CHECK 3', k);
					while (payload.code.includes(k.ivc))
					{
						let splitted = [];

						if (k.type == 'V')
						{
							splitted = payload.code.split(k.ivc);
						} else
						{
							splitted = payload.code.split("'" + k.ivc + "'");
						}
						console.log('QUI', splitted)
						payload.code = String(splitted[0] +
							(k.type == 'STR' || k.type == 'ID' ?
								("'" + k.value + "'") :
								k.value)
							+ splitted[1]);

					}
				});
				console.log('FINAL ', payload.code);
				payload.code = payload.code.replaceAll('\n', ''); */
	} else
	{
		chrome.runtime.sendMessage({
			type: 'WO_CODESNIPPET_run',
			payload: payload.code.replaceAll('\n', ''),
			resetTimeoutDialogTime: secAutoClose
		});
	}

}

const handler_mod = (args: string) =>
{
	//console.log('HANDLING MOD BUTTON', args);
	chrome.runtime.sendMessage({
		type: 'WO_CODESNIPPET_edit',
		payload: args
	});
}

const handler_del = (args: any) =>
{
	chrome.runtime.sendMessage({
		type: 'WO_CODESNIPPET_delConfirm',
		payload: args
	});
}

const handler_addNewSnippet = () =>
{
	chrome.runtime.sendMessage({
		type: 'WO_CODESNIPPET_addNewSnippet'
	});
}
createObjectList();

