
class SnippetObject
{
	snippet: IsnippetObject;
	isNew: boolean;
	isEditing: boolean;

	constructor(isNewer: boolean, isEditing: boolean)
	{
		this.isNew = isNewer;
		this.snippet = {
			name: this.isNew ? this.generateRandomName() : null,
			ivcFound: null,
			variables: new Array<Ivariable>
		}
		this.isEditing = isEditing;
	}

	setName(name: string)
	{
		this.snippet.name = name;
	}

	getName()
	{
		return this.snippet.name;
	}

	setIVCFound(ivcFound: TivcFound)
	{
		this.snippet.ivcFound = ivcFound;
	}

	getIVCFound()
	{
		return this.snippet.ivcFound;
	}

	setVariables(variables: Ivariable[])
	{
		this.snippet.variables = variables;
	}

	getVariables()
	{
		return this.snippet.variables;
	}

	generateRandomName(): string
	{
		return (Math.random() * 999).toString().replace('.', '');
	}
}

let snippetsBackupDEV: { name: string; code: any; ivcFound: any; }[] = [];
let nButtonDEV: { doc: HTMLElement; payload: any; id: string; }[] = [];
const snippetStorage = {
	get: (cb: (arg0: { [key: string]: any; }) => void) =>
	{
		chrome.storage.sync.get(null, (result) =>
		{
			console.log(result);
			cb(result);
		});
	},
	set: (value: { name: string; code: any; countIVC: any; }, cb: () => void) =>
	{
		chrome.storage.sync.set(
			{
				['snippet_' + value.name]: {
					code: value.code,
					ivcFound: value.countIVC
				}
			},
			() =>
			{
				cb();
			}
		);
	},
};

/* EDITOR */
let editorImported: any = null;
const snippetlistobj = document.getElementById('snippetlistobj');
const oldEditor = document.getElementById('editor') as HTMLTextAreaElement;
const btnSnippetAddVariable = document.getElementById('snippetaddvariable');
const modalOverlay = document.getElementById('modalOverlay') as HTMLDivElement;

/* NEW SNIPPET */

let snippetObject: SnippetObject = null;

const btnSnippetNewCode = document.getElementById('snippetnewcode');
const inputSnippetNewName = document.getElementById('snippetnewname') as HTMLInputElement;

let mdl: HTMLIFrameElement;

chrome.runtime.onMessage.addListener((obj, sender, response) =>
{
	console.log('DEV LISTENER', obj)
	if (obj.response)
	{
		switch (obj.response)
		{
			case 'initEditorDoneDCS':
				editorImported = obj.payload;
				break;
		}
	}
});

window.addEventListener('message', (e: any) =>
{
	console.log('message window dcs', e);
	if (e.data)
	{
		switch (e.data.type)
		{
			case 'DCS_close_modal':
				snippetObject.setVariables(e.data.payload);
				modalOverlay.classList.remove('active');
				setTimeout(() =>
				{
					mdl.remove();
				}, 300);
				break;
		}
	}
});

document.addEventListener('DOMContentLoaded', async () =>
{
	snippetStorage.get((snippet: any) =>
	{
		creatorElementListDEV(snippet);
	});

	/* editor.addEventListener('selectionchange', () =>
	{
		console.log(editor.selectionStart);
	}); */

	initButtonEventListener();
	initCMistance();

	chrome.runtime.sendMessage({
		type: 'DCS_initEditor'
	});


});


const initButtonEventListener = () =>
{
	btnSnippetNewCode.addEventListener('click', () =>
	{
		createNewSnippetCodeEditor();
	});

	btnSnippetAddVariable.addEventListener('click', () =>
	{
		openCloseModalVariable();
	});

	inputSnippetNewName.addEventListener('change', (e) =>
	{
		const ghostname = document.getElementById('ghostname');
		const target = (<HTMLInputElement>e.target);
		if (!target.value || target.value.length == 0)
		{
			ghostname.classList.remove('active');
			inputSnippetNewName.classList.add('empty');
			return;
		}
		ghostname.classList.add('active');
		inputSnippetNewName.classList.remove('empty');

	});


}




const createNewSnippetCodeEditor = () =>
{
	const editorElement = document.getElementsByClassName('editor')[0] as HTMLDivElement;
	const editorCloseElement = document.getElementsByClassName('editorclose')[0] as HTMLDivElement;

	editorCloseElement.classList.add('deactive');
	editorElement.classList.add('active');

	snippetObject = new SnippetObject(true, false);

	inputSnippetNewName.value = snippetObject.getName();
	const ghostname = document.getElementById('ghostname');
	ghostname.classList.add('active');

}

const openCloseModalVariable = () =>
{
	snippetStorage.get((snippet: IsnippetFromStorage) =>
	{
		if (!snippet)
		{
			return;
		}
		Object.keys(snippet).forEach((k, i) =>
		{
			if (!k.includes('snippet_'))
			{
				return;
			} //TODO DA FINIRE


		});
	});

	mdl = document.createElement('iframe');
	mdl.src = chrome.runtime.getURL('DVCS/MODAL/mdl.html');
	mdl.setAttribute('style', 'left: 24%;z-index: 200;position: fixed;height: 100%;width: 57%;overflow-clip-margin: unset;overflow: unset;border: 0px;background: transparent;')

	modalOverlay.appendChild(mdl);
	setTimeout(() =>
	{
		mdl.contentWindow.postMessage({ type: 'MDCS_init_snippetObject', payload: { ...snippetObject } }, '*');
	}, 500);

	modalOverlay.classList.add('active');


}

const initCMistance = () =>
{
	// @ts-expect-error
	editorImported = CodeMirror.fromTextArea(oldEditor, {
		mode: 'text/apexsnippet',
		tabSize: 4,
		lineNumbers: true,
		indentWithTabs: true
	});

}

const creatorElementListDEV = async (items: IsnippetFromStorage) =>
{
	console.log('CREATOR DEV : ', items);
	Object.keys(items).forEach((k, i) =>
	{
		if (!k.includes('snippet_'))
		{
			return;
		}
		const li = document.createElement('li');
		li.id = k;

		const divObjectItem = document.createElement('div');
		divObjectItem.setAttribute('class', 'object-item');
		divObjectItem.id = k + '-div';

		const divObjectButton = document.createElement('div');
		divObjectButton.setAttribute('class', 'object-buttons');

		const btnRun = document.createElement('button');
		btnRun.innerText = 'Run 🚀';
		items[k].ivcFound ? btnRun.setAttribute('class', 'runalt-btn') : btnRun.setAttribute('class', 'run-btn');

		btnRun.id = k + '-run';
		btnRun.title = items[k].ivcFound ?
			'Run the code now!\n--⚠️-- WARNING --⚠️--\n You will insert variables before the actual execution!' :
			'Run the code now!'

		const btnMod = document.createElement('button');
		btnMod.innerText = '✒️';
		btnMod.id = k + '-mod';
		btnMod.title = 'Edit the code!'
		btnMod.setAttribute('class', 'copy-btn');
		btnMod.setAttribute('style', 'margin-left: 1%');

		const btnRemove = document.createElement('button');
		btnRemove.innerText = '🚽';
		btnRemove.id = k + '-del';
		btnRemove.title = 'Trash the code!'
		btnRemove.setAttribute('class', 'delete-btn');
		btnRemove.setAttribute('style', 'margin-left: 1%');

		const divCol = document.createElement('div');
		divCol.setAttribute('class', 'columnSpanLoader');

		const span = document.createElement('span');
		span.innerText = k.replace('snippet_', '');
		span.title = items[k].code;
		span.id = k + '-span';
		span.setAttribute('class', 'titleGrid');

		const postSpanLoader = document.createElement('div');
		postSpanLoader.id = k + '-loader';
		postSpanLoader.setAttribute('class', 'loader');

		const loader = document.createElement('div');
		loader.setAttribute('class', 'module-border-wrap');

		const moduleOnLoader = document.createElement('div');
		moduleOnLoader.setAttribute('class', 'module')

		loader.appendChild(moduleOnLoader);
		postSpanLoader.appendChild(loader);

		divCol.appendChild(span);
		divCol.appendChild(postSpanLoader);

		divObjectButton.appendChild(btnRun);
		divObjectButton.appendChild(btnMod);
		divObjectButton.appendChild(btnRemove);

		divObjectItem.appendChild(divCol);
		divObjectItem.appendChild(divObjectButton);
		li.appendChild(divObjectItem);

		snippetlistobj.appendChild(divObjectItem);

		snippetsBackupDEV.push({ "name": k, "code": items[k].code, "ivcFound": items[k].ivcFound });
		nButtonDEV.push({ doc: document.getElementById(k + '-run'), payload: items[k], id: k });
		nButtonDEV.push({ doc: document.getElementById(k + '-mod'), payload: items[k], id: k });
		nButtonDEV.push({ doc: document.getElementById(k + '-del'), payload: null, id: k });

	});

	nButtonDEV.forEach(btnIdx =>
	{
		let id = String(btnIdx.doc.id).split('-')
		switch (id[1])
		{
			case 'run':
				//console.log(id[0], 'RUN');
				btnIdx.doc.addEventListener('click', (e) =>
				{
					document.getElementById(btnIdx.id + '-loader').removeAttribute('class');
					handler_runDEV(btnIdx.doc, btnIdx.payload, btnIdx.id);
					e.stopPropagation();
				});
				break;
			case 'mod':
				//console.log(id[0], 'MOD');
				btnIdx.doc.addEventListener('click', (e) =>
				{
					//handler_mod(document.getElementById(btnIdx.id + '-span').title);
					e.stopPropagation();
				});
				break;
			case 'del':
				//console.log(id[0], 'DEL');
				btnIdx.doc.addEventListener('click', (e) =>
				{
					//handler_del(btnIdx.id);
					e.stopPropagation();
				});
				break;
		}
	});
}


/* ------------------------HANDLER------------------------ */
const handler_runDEV = (doc: HTMLElement, payload: any, id: string) =>
{
	console.log(doc, payload, id);
}








