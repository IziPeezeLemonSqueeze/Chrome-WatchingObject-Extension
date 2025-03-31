
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
			variables: new Array<Ivariable>,
			code: null,
			initBlock: false
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

	getCode(): string
	{
		return this.snippet.code;
	}

	setCode(value: string)
	{
		this.snippet.code = value;
		console.log('COUNTIVC: ', this.snippet.ivcFound);
	}

	setInitBlock(value: boolean)
	{
		this.snippet.initBlock = value;
	}

	getInitBlock()
	{
		return this.snippet.initBlock;
	}
}

let snippetsBackupDEV: { name: string; code: any; ivcFound: any; }[] = [];
let nButtonDEV: { doc: HTMLElement; payload: any; id: string; }[] = [];
const snippetStorage = {
	get: (cb: (arg0: { [ key: string ]: any; }) => void) =>
	{
		chrome.storage.sync.get(null, (result) =>
		{
			console.log(result);
			cb(result);
		});
	},
	set: (value: SnippetObject, cb: () => void) =>
	{
		chrome.storage.sync.set(
			{
				[ 'snippet_' + value.getName() ]: {
					name: value.getName(),
					code: value.getCode(),
					ivcFound: value.getIVCFound(),
					variables: value.getVariables()
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
let editorImported: CodeMirror.EditorFromTextArea = null;
const snippetlistobj = document.getElementById('snippetlistobj');
const oldEditor = document.getElementById('editor') as HTMLTextAreaElement;
const btnSnippetAddVariable = document.getElementById('snippetaddvariable');
const modalOverlay = document.getElementById('modalOverlay') as HTMLDivElement;
const btnSaveSnippetObject = document.getElementById('btnsavesnippetobject');
let isCursorOnInitBlock = false;
let isCursorOnInvalidPos = false;

const pError = document.getElementById('pError');
const pWarning = document.getElementById('pWarning');
const pErrorIcon = document.getElementById('pErrorIcon');
const pWarningIcon = document.getElementById('pWarningIcon');


let errorsOnCode: ImsgInfoCode[] = [];
let warningOnCode: ImsgInfoCode[] = [];
/* NEW SNIPPET */

let snippetObject: SnippetObject = null;

const btnSnippetNewCode = document.getElementById('snippetnewcode');
const inputSnippetNewName = document.getElementById('snippetnewname') as HTMLInputElement;

let editorElement: HTMLElement;
let editorCloseElement: HTMLElement;

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
				initRightPanelVariables();
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
	pErrorIcon.textContent = '🛑';
	pWarningIcon.textContent = '⚠️';

	snippetStorage.get((snippet: any) =>
	{
		creatorElementListDEV(snippet);
	});

	initButtonEventListener();
	initCMistance();
	/*
		chrome.runtime.sendMessage({
			type: 'DCS_initEditor'
		}); */


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
			errorsOnCode.push({ label: __MSGINFOCODE.SNIPPETNAME, body: 'Missing Snippet name.' });
			return;
		}
		ghostname.classList.add('active');
		inputSnippetNewName.classList.remove('empty');
		errorsOnCode = errorsOnCode.filter(e => e.label != __MSGINFOCODE.SNIPPETNAME);
		warningOnCode = warningOnCode.filter(e => e.label != __MSGINFOCODE.SNIPPETNAME);
	});

	btnSaveSnippetObject.addEventListener('click', () =>
	{
		saveSnippetObject();
	});
}

const createNewSnippetCodeEditor = () =>
{
	editorElement = document.getElementsByClassName('editor')[ 0 ] as HTMLDivElement;
	editorCloseElement = document.getElementsByClassName('editorclose')[ 0 ] as HTMLDivElement;

	editorCloseElement.classList.add('deactive');
	editorElement.classList.add('active');

	snippetObject = new SnippetObject(true, false);

	inputSnippetNewName.value = snippetObject.getName();
	const ghostname = document.getElementById('ghostname');
	ghostname.classList.add('active');

	editorImported.setValue('/*INIT_BLOCK_{\n	\n}_INIT_BLOCK*/\n\n');

	warningOnCode.push({ label: __MSGINFOCODE.SNIPPETNAME, body: 'Rename Snippet.' });
}

const openCloseModalVariable = () =>
{
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

	editorImported = CodeMirror.fromTextArea(oldEditor, {
		mode: 'text/apexsnippet',
		tabSize: 4,
		lineNumbers: true,
		indentWithTabs: true
	});

	editorImported.on('change', (cm, changeObj) =>
	{
		console.log("Il contenuto è cambiato:", cm.getValue());
		console.log("Dettagli del cambiamento:", changeObj);
		if (isCursorOnInvalidPos)
		{
			return;
		}

		//console.log(snippetObject)


	});

	editorImported.on('cursorActivity', (cm) =>
	{
		snippetObject.setCode(cm.getValue());

		editorImported.getAllMarks().forEach(m => m.clear());

		enum __STANDARD__
		{
			STARTBLOCK = '/*INIT_BLOCK_{',
			ENDBLOCK = '}_INIT_BLOCK*/',
		}
		//console.log('CURSOR ACTIVITY', cm)
		console.log('CURSOR POS', cm.getCursor());
		const cursor = cm.getCursor();
		const text = cm.getValue();
		//console.log('CHECK', text)

		let infoInitBlock: {
			startBlockPos: { from: { line: number; ch: number; }, to: { line: number; ch: number; } },
			endBlockPos: { from: { line: number; ch: number; }, to: { line: number; ch: number; } },
		} = { startBlockPos: null, endBlockPos: null };
		let textInitBlock = '';

		const isInitBlock = text.includes(__STANDARD__.STARTBLOCK) && text.includes(__STANDARD__.ENDBLOCK);
		if (isInitBlock)
		{
			const sSB = (<any>editorImported).getSearchCursor(__STANDARD__.STARTBLOCK, 0);
			const sB = sSB.findNext() ? sSB : null;
			infoInitBlock.startBlockPos = { from: sB.from(), to: sB.to() };
			//console.log('infoInitBlock.startBlockPos', infoInitBlock.startBlockPos);

			const sEB = (<any>editorImported).getSearchCursor(__STANDARD__.ENDBLOCK, 0);
			const eB = sEB.findNext() ? sEB : null;
			infoInitBlock.endBlockPos = { from: eB.from(), to: eB.to() };
			//console.log('infoInitBlock.endBlockPos', infoInitBlock.endBlockPos);


			editorImported.markText(
				{ // FROM
					line: infoInitBlock.startBlockPos.from.line,
					ch: infoInitBlock.startBlockPos.from.ch
				},
				{ // TO
					line: infoInitBlock.endBlockPos.to.line,
					ch: infoInitBlock.endBlockPos.to.ch
				},
				{
					className: 'cm-custom-markInitBlock'
				}
			);

			textInitBlock = editorImported.getRange(infoInitBlock.startBlockPos.to, infoInitBlock.endBlockPos.from);

			if (cursor.line > infoInitBlock.startBlockPos.to.line &&
				cursor.line < infoInitBlock.endBlockPos.from.line)
			{
				isCursorOnInitBlock = true;
			} else
			{
				isCursorOnInitBlock = false;
			}

			if (cursor.line == infoInitBlock.startBlockPos.to.line ||
				cursor.line == infoInitBlock.endBlockPos.to.line)
			{
				isCursorOnInvalidPos = true;
				cm.getLineHandle(infoInitBlock.startBlockPos.to.line).text = __STANDARD__.STARTBLOCK;
				cm.getLineHandle(infoInitBlock.endBlockPos.to.line).text = __STANDARD__.ENDBLOCK;

			} else
			{
				isCursorOnInvalidPos = false;
			}

			console.log('isCursorOnInvalidPos', isCursorOnInvalidPos);
		}
		snippetObject.setInitBlock(isInitBlock);

		/* ---- VALIDATION AND PRE COMPILE ----  */
		snippetObject.setIVCFound(_checkIVC(cm.getValue(), textInitBlock));

		const resultPreCompile = _preCompile();
		console.log('@@@ resultPreCompile', resultPreCompile);

		if (resultPreCompile)
		{
			resultPreCompile.forEach((v, k) =>
			{
				if (!v)
				{
					const f = (<any>editorImported).getSearchCursor(k, 0);
					const fB = f.findNext() ? f : null;
					editorImported.markText(
						{ // FROM
							line: fB.from().line,
							ch: fB.from().ch
						},
						{ // TO
							line: fB.to().line,
							ch: fB.to().ch
						},
						{
							className: 'cm-custom-markInitBlock-error'
						});
				}
			});
		}

		__updateInfoCode();



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
		items[ k ].ivcFound ? btnRun.setAttribute('class', 'runalt-btn') : btnRun.setAttribute('class', 'run-btn');

		btnRun.id = k + '-run';
		btnRun.title = items[ k ].ivcFound ?
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
		span.title = items[ k ].code;
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

		snippetsBackupDEV.push({ "name": k, "code": items[ k ].code, "ivcFound": items[ k ].ivcFound });
		nButtonDEV.push({ doc: document.getElementById(k + '-run'), payload: items[ k ], id: k });
		nButtonDEV.push({ doc: document.getElementById(k + '-mod'), payload: items[ k ], id: k });
		nButtonDEV.push({ doc: document.getElementById(k + '-del'), payload: null, id: k });

	});

	nButtonDEV.forEach(btnIdx =>
	{
		let id = String(btnIdx.doc.id).split('-')
		switch (id[ 1 ])
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

const initRightPanelVariables = () =>
{
	if (!snippetObject)
	{
		return;
	}

	const existingVarInput = document.querySelectorAll('li[id^="inpvar_"]');
	existingVarInput.forEach(ev => ev.remove());

	const listVarInput = document.getElementById('listactivablevar') as HTMLUListElement;
	snippetObject.getVariables().forEach(v =>
	{
		if (v.choosable)
		{
			const li = document.createElement('li');
			li.id = 'inpvar_' + v.name;

			const vinput = document.createElement('input');
			vinput.value = v.name;
			vinput.readOnly = true;
			vinput.classList = 'activated-var';
			vinput.addEventListener('click', () =>
			{
				insertOnCodeMirror(v);
			});

			li.appendChild(vinput);
			listVarInput.appendChild(li);

		}
	});
}

const insertOnCodeMirror = (v: Ivariable) =>
{
	if (isCursorOnInvalidPos)
	{
		return;
	}
	if (isCursorOnInitBlock)
	{
		if (v.defaultValue && v.defaultValue.toString().length > 0)
		{
			editorImported.replaceSelection(v.code, 'start');
		}
		return;
	}
	editorImported.replaceSelection(v.varName, 'start');
}

const saveSnippetObject = () =>
{
	if (snippetObject.isNew)
	{
		if (snippetObject.getCode().length == 0)
		{
			return;
		}

		snippetStorage.set(snippetObject, () =>
		{
			editorCloseElement.classList.remove('deactive');
			editorElement.classList.remove('active');
			snippetObject = null;
		});

		initRightPanelVariables();
	}

	if (snippetObject.isEditing)
	{

	}
}

/* ------------------------HANDLER------------------------ */
const handler_runDEV = (doc: HTMLElement, payload: any, id: string) =>
{
	console.log(doc, payload, id);
}

/* ------------------------HELPERS------------------------ */
const _checkIVC = (text: string, textInitBlock: string) =>
{
	let countIVC: TivcFound = {
		randomNumber: null,
		randomText: null,
		classic: null,
		pck: null,
		init: null
	};

	countIVC.randomNumber = text.match(__REGEX_IVC__.RND);

	countIVC.randomText = text.match(__REGEX_IVC__.RNDSTR);

	countIVC.classic = text.match(__REGEX_IVC__.CLASSIC);

	countIVC.pck = text.match(__REGEX_IVC__.PCK);

	if (snippetObject.getInitBlock())
	{
		try
		{
			countIVC.init = textInitBlock.match(__REGEX_IVC__.PCK_INIT);
			if (countIVC.init)
			{
				countIVC.init.push(...textInitBlock.match(__REGEX_IVC__.CLASSIC_INIT));
			} else
			{
				countIVC.init = textInitBlock.match(__REGEX_IVC__.CLASSIC_INIT);
			}
		} catch (e)
		{
			//TODO COMMENTO L'ERRORE NON IMPORTANTE!
			console.log(e);
		}

	}
	return countIVC;
}

const _preCompile = (): Map<string, boolean> =>
{
	console.log('_preCompile()')
	let mapCheckValues = new Map<string, boolean>();

	if (snippetObject.getIVCFound().init)
	{
		try
		{
			const pckIn = __preCompilePCK_inInit();
			pckIn.forEach((v, k) =>
			{
				mapCheckValues.set(k, v);
			});
		} catch (e)
		{ }
	}

	try
	{
		const pckOut = __preCompilePCK_outInit();
		pckOut.forEach((v, k) =>
		{
			mapCheckValues.set(k, v);
		});
	} catch (e)
	{ }

	errorsOnCode = [];
	mapCheckValues.forEach((v, k) =>
	{
		if (!v)
		{
			errorsOnCode.push({ label: __MSGINFOCODE.ERRORONCODE + k, body: 'Missing initialization variable for: ' + k });
		} else
		{
			errorsOnCode = errorsOnCode.filter(e => e.label != __MSGINFOCODE.ERRORONCODE + k)
		}
	});
	return mapCheckValues;
}

const __preCompilePCK_outInit = (): Map<string, boolean> =>
{
	console.log('@@@ PRECOMPILE OUT')
	const mapCheckValues = new Map<string, boolean>();
	if (!snippetObject.getIVCFound().pck)
	{
		return mapCheckValues;
	}
	snippetObject.getIVCFound().pck.forEach(mv =>
	{
		console.log('@@@MV ', mv);
		const v = mv.substring(0, mv.length - 1);
		console.log('@@@V ', v);

		let founded = false;
		if (snippetObject.getIVCFound().init)
		{
			snippetObject.getIVCFound().init.forEach(vinit =>
			{
				console.log('@@@vinit ', vinit);
				if (vinit.includes(v))
				{
					founded = true;
				}
			});
		}
		if (founded)
		{
			mapCheckValues.set(mv, true);
		} else
		{
			mapCheckValues.set(mv, false);
		}
		console.log('@@@mapCheckValues ', mapCheckValues);
	});
	return mapCheckValues;
}

const __preCompilePCK_inInit = (): Map<string, boolean> =>
{
	const mapCheckValues = new Map<string, boolean>();
	const ivcInitFound: string[] = [];

	snippetObject.getIVCFound().init.forEach(v =>
	{
		const founded = v.match(__REGEX_IVC__.PCK_INIT);
		if (founded)
		{
			ivcInitFound.push(...founded);
		}
	});

	ivcInitFound.forEach(ivc =>
	{
		let prevalues = ivc.substring(ivc.indexOf('[') + 1, ivc.indexOf(']'));
		//console.log('@@@IVC VALUES', prevalues);
		const valuesOnParentesis: string[] = [];
		if (prevalues.includes(','))
		{
			valuesOnParentesis.push(...prevalues.split(','));
		} else
		{
			valuesOnParentesis.push(prevalues);
		}
		//console.log('@@@IVC valuesOnParentesis', valuesOnParentesis);
		const mapValues = new Map<string, string>();
		valuesOnParentesis.forEach(val =>
		{
			const preMap = val.replace('(', '').replace(')', '').split(':');
			mapValues.set(preMap[ 0 ], preMap[ 1 ]);
		});

		//console.log('@@@IVC mapValues', mapValues);

		for (let mv of mapValues.values())
		{
			const v = mv.substring(0, mv.length - 1);
			//console.log('@@@IVC V', v);
			if (!v.includes('${$'))
			{
				continue;
			}

			const foundedInit: string[] = [];
			snippetObject.getIVCFound().init.forEach(vinit =>
			{
				//console.log('@@@IVC vinit', vinit);
				if (!vinit.includes('PCK') && vinit.includes(v) && vinit.includes(':'))
				{
					foundedInit.push(vinit);
				}
			});
			//console.log('@@@IVC foundedInit', foundedInit);

			if (foundedInit && foundedInit.length == 1)
			{
				mapCheckValues.set(mv, true);
			} else
			{
				mapCheckValues.set(mv, false);
			}

			//console.log('@@@IVC mapCheckValues', mapCheckValues);
		}
	});
	return mapCheckValues;
}

const __updateInfoCode = () =>
{
	pError.textContent = '0';
	pError.title = null;
	pWarning.textContent = '0';
	pWarning.title = null;

	if (errorsOnCode.length > 0)
	{
		let errorsString = '';
		pError.textContent = errorsOnCode.length.toString();
		errorsOnCode.forEach(err =>
		{
			errorsString += ` --> ${err.body}\n`;
		});

		pError.title = errorsString;
	}

	if (warningOnCode.length > 0)
	{
		let warningString = '';
		pWarning.textContent = warningOnCode.length.toString();
		warningOnCode.forEach(war =>
		{
			warningString += ` --> ${war.body}\n`;
		});

		pWarning.title = warningString;
	}
}


const __REGEX_IVC__ =
{
	PCK: /\$\{\$PCK\(\s*[a-zA-Z_]\w*\s*\)\}/g,
	PCK_INIT: /\$\{\$PCK\(\s*[a-zA-Z_]\w*\s*\)\s*\[\s*(\([^)]*\)(\s*,\s*\([^)]*\))*)\s*\]\}/g,
	CLASSIC_INIT: /\$\{\$(?:STR|NMB|BOL|ID|V)[A-Za-z]+:[A-Za-z0-9_ ]+\}/g,
	CLASSIC: /\$\{\$(?:STR|NMB|BOL|ID|V)[A-Za-z]+\}/g,
	RNDSTR: /\$\{\$RANDSTR\(\d+\)\}/g,
	RND: /\$\{\$(RAND|RND)\(\d{1,2}\)\}/g
}

enum __MSGINFOCODE
{
	SNIPPETNAME = 'SNIPPETNAME',
	ERRORONCODE = 'ERRORONCODE'

}


