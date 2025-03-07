// @ts-nocheck
console.log(window.CodeMirrorBundle)
const { EditorView, basicSetup, javascript } = window.CodeMirrorBundle;

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

let editorImported: any = null;
chrome.runtime.onMessage.addListener((obj, sender, response) =>
{
	console.log('DEV LISTENER', obj)
	if (obj.response)
	{
		switch (obj.response)
		{
			case 'initEditorDoneDCS':
				editorImported = obj.payload;
				initEditorImported();
				break;
		}
	}
});

const snippetlistobj = document.getElementById('snippetlistobj');
//const editor = document.getElementById('editor') as HTMLTextAreaElement;


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


	const view = new EditorView({
		doc: "Start document",
		parent: document.getElementById('editor'),
		extensions: [basicSetup, javascript()]
	})
	chrome.runtime.sendMessage({
		type: 'DCS_initEditor'
	});
});

const creatorElementListDEV = async (items: snippetFromStorage) =>
{
	console.log('CREATOR DEV : ', items);
	Object.keys(items).forEach((k, i) =>
	{
		if (k.includes('snippet_'))
		{
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
		}
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

const initEditorImported = async () =>
{
	console.log(editorImported);
}

const handler_runDEV = (doc: HTMLElement, payload: any, id: string) =>
{
	console.log(doc, payload, id);
}
