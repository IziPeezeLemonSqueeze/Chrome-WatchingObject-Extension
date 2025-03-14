
class SnippetObject_mdl
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

class handleResultVarText
{
	private OUTprefix: string;
	private OUTname: string;
	private OUTvalue: string;
	private OUTsuffix: string;

	constructor() { }

	setPrefix(prefix: string)
	{
		this.OUTprefix = prefix;
	}
	setNameText(name: string)
	{
		this.OUTname = name;
	}
	setValueText(value: string)
	{
		this.OUTvalue = value;
	}
	setSuffix(suffix: string)
	{
		this.OUTsuffix = suffix;
	}
	handleEditPCK()
	{
		return `${this.OUTprefix}(${this.OUTname})[${this.OUTvalue}]${this.OUTsuffix}`;
	}
	handleEditClassicDefault()
	{
		return `${this.OUTprefix}${this.OUTname}:${this.OUTvalue}${this.OUTsuffix}`;
	}
	handleEditClassic()
	{
		return `${this.OUTprefix}${this.OUTname}${this.OUTsuffix}`;
	}
	getName()
	{
		return this.OUTname;
	}
	getValueText()
	{
		return this.OUTvalue;
	}

}

let handleResultVar: handleResultVarText;
const btnCloseModalFooter = document.getElementById('closeModalFooter');

const btnChipVariableClose = document.querySelectorAll('.chip-close');

const btnNVClassicNMB = document.getElementById('btnnvclassicnmb');
const btnNVClassicBOL = document.getElementById('btnnvclassicbol');
const btnNVClassicID = document.getElementById('btnnvclassicid');
const btnNVClassicV = document.getElementById('btnnvclassicv');

/* str */
const btnNVClassicSTR = document.getElementById('btnnvclassicstr');
const strInputName = document.getElementById('strinputname') as HTMLInputElement;
const strInputDefaultValue = document.getElementById('strinputdefaultvalue') as HTMLInputElement;
const strSaveBtn = document.getElementById('strsavebtn') as HTMLButtonElement;
/* nmb */
/* bol */
/* id */
/* v */
/* pck */
const btnNVPCK = document.getElementById('btnnvpck') as HTMLButtonElement;
const pckInputName = document.getElementById('pckinputname') as HTMLInputElement;
const pckTextArea = document.getElementById('pcktextarea') as HTMLTextAreaElement;
const pckSaveBtn = document.getElementById('pcksavebtn') as HTMLButtonElement;


let snippetObject_modal_ref: SnippetObject;



document.addEventListener('DOMContentLoaded', async () =>
{
	window.addEventListener('message', (e: any) =>
	{
		console.log('message window mdl', e);
		if (e.data)
		{
			switch (e.data.type)
			{
				case 'MDCS_init_snippetObject':
					snippetObject_modal_ref = new SnippetObject_mdl(null, null);
					Object.assign(snippetObject_modal_ref, e.data.payload);
					console.log('from snippet object', e.data.payload);
					console.log('snippet object', snippetObject_modal_ref);
					_triggerReloadInitVarDIV();
					break;
			}
		}
	});

	btnCloseModalFooter.addEventListener('click', async () =>
	{
		window.parent.postMessage({ type: 'DCS_close_modal', payload: snippetObject_modal_ref.getVariables() }, '*');
	});

	const divNV = {
		strDiv: document.getElementById('nvstring'),
		nmbDiv: document.getElementById('nvnumber'),
		bolDiv: document.getElementById('nvboolean'),
		idDiv: document.getElementById('nvid'),
		vDiv: document.getElementById('nvv'),
		vPck: document.getElementById('nvpck'),
	}
	btnNVClassicNMB.addEventListener('click', () =>
	{
		_classNVToggler(divNV, divNV.nmbDiv);
	});
	btnNVClassicBOL.addEventListener('click', () =>
	{
		_classNVToggler(divNV, divNV.bolDiv);
	});
	btnNVClassicID.addEventListener('click', () =>
	{
		_classNVToggler(divNV, divNV.idDiv);
	});
	btnNVClassicV.addEventListener('click', () =>
	{
		_classNVToggler(divNV, divNV.vDiv);
	});
	initSTR(divNV);
	initPCK(divNV);

})

/**
 * inizializza la struttura per creare un pck
 * @param divNV
 */
const initSTR = (divNV: IdivNV) =>
{
	btnNVClassicSTR.addEventListener('click', () =>
	{
		handleResultVar = new handleResultVarText();
		_classNVToggler(divNV, divNV.strDiv);
		_createNewSTR();
	});

	function _createNewSTR()
	{
		let inputValid = false;
		let inputDefaultValid = false;


		handleResultVar.setNameText(snippetObject_modal_ref.generateRandomName());
		handleResultVar.setPrefix(__PREFIX_CODE_SNIPPET__.STR);
		handleResultVar.setSuffix('}');

		strInputName.addEventListener('input', (e) =>
		{
			inputValid = handleInputNameForNewVariable(e);
			_checkOkShowBtnSaveNewVariable(strSaveBtn, [inputValid, inputDefaultValid]);

		});

		strInputDefaultValue.addEventListener('input', (e) =>
		{
			const target = (<HTMLInputElement>e.target);
			const safeInputRegex: RegExp = /^(?!.*(\/\/|\/\*|\*\/|<!--|-->|#))(?!.*(-->.*<!--))[A-Za-z0-9\s\.,?!;:'"()\-_]+$/;
			inputDefaultValid;
			if (safeInputRegex.test(target.value.toString()))
			{
				inputDefaultValid = true;
				_applyNVValidNVInvalidToTarget(target, inputDefaultValid);
				handleResultVar.setValueText(target.value.toString());
				return;
			}
			inputDefaultValid = false;
			_applyNVValidNVInvalidToTarget(target, inputDefaultValid);
			_checkOkShowBtnSaveNewVariable(strSaveBtn, [inputValid, inputDefaultValid]);
		});

		strSaveBtn.addEventListener('click', () =>
		{
			snippetObject_modal_ref.getVariables().push({
				active: false,
				choosable: false,
				code: !handleResultVar.getValueText() ? handleResultVar.handleEditClassic() : handleResultVar.handleEditClassicDefault(),
				name: handleResultVar.getName(),
				defaultValue: handleResultVar.getValueText()
			});

			if (snippetObject_modal_ref.getVariables().length > 0 && snippetObject_modal_ref.getVariables().filter((v: Ivariable) => v.name == handleResultVar.getName()).length === 1)
			{
				strSaveBtn.innerText = 'saved!';

				setTimeout(() =>
				{
					strInputDefaultValue.value = null;
					strInputDefaultValue.classList.toggle('nvinvalid');
					strInputDefaultValue.classList.toggle('nvvalid');
					strInputName.value = null;
					strInputName.classList.toggle('nvinvalid');
					strInputName.classList.toggle('nvvalid');
					strSaveBtn.innerText = 'save';
					inputDefaultValid = false;
					inputValid = false;
					strSaveBtn.parentElement.classList.remove('active');
					_triggerReloadInitVarDIV();
				}, 500)
			}
		});
	}
}

/**
 * inizializza la struttura per creare un pck
 * @param divNV
 */
const initPCK = (divNV: IdivNV) =>
{
	btnNVPCK.addEventListener('click', () =>
	{
		handleResultVar = new handleResultVarText();
		_classNVToggler(divNV, divNV.vPck);
		_createNewPCK();
	});

	pckTextArea.setAttribute('placeholder', `(foo:foovalue)\n(bar:barvalue)`);

	function _createNewPCK()
	{
		let inputValid = false;
		let textareaValid = false;
		let defaultValue: { [key: string]: {} } = {};

		handleResultVar.setNameText(snippetObject_modal_ref.generateRandomName());
		handleResultVar.setPrefix(__PREFIX_CODE_SNIPPET__.PCK);
		handleResultVar.setSuffix('}');

		pckInputName.addEventListener('input', (e) =>
		{
			inputValid = handleInputNameForNewVariable(e);
			_checkOkShowBtnSaveNewVariable(pckSaveBtn, [inputValid, textareaValid]);

		});

		pckTextArea.addEventListener('input', (e) =>
		{
			const target = (<HTMLTextAreaElement>e.target);
			const values = target.value.split('\n');

			/*
			/^\$\{\$PCK\([A-Za-z0-9_]+\)\[(?:\((?:[A-Za-z0-9_]+|\$\{\$(?:STR|NMB|BOL|ID|V)?[A-Za-z0-9_]+\}):(?:[A-Za-z0-9_]+|\$\{\$(?:STR|NMB|BOL|ID|V)?[A-Za-z0-9_]+\})\))(?:,(?:\((?:[A-Za-z0-9_]+|\$\{\$(?:STR|NMB|BOL|ID|V)?[A-Za-z0-9_]+\}):(?:[A-Za-z0-9_]+|\$\{\$(?:STR|NMB|BOL|ID|V)?[A-Za-z0-9_]+\})\)))*\]\}$/
			*/
			const checkRegex: RegExp = /\((?:[A-Za-z0-9_]+|\$\{\$(?:STR|NMB|BOL|ID|V)?[A-Za-z0-9_]+\}):(?:[A-Za-z0-9_]+|\$\{\$(?:STR|NMB|BOL|ID|V)?[A-Za-z0-9_]+\})\)/;
			const countValid = values.filter(v => v.match(checkRegex));
			console.log('COUNT VVALID', countValid);
			if (countValid.length == values.length)
			{
				textareaValid = true;
				target.classList.add('nvvalid');
				target.classList.remove('nvinvalid');
			} else
			{
				textareaValid = false;
				target.classList.add('nvinvalid');
				target.classList.remove('nvvalid');
			}
			console.log('textareavalid', textareaValid)
			_checkOkShowBtnSaveNewVariable(pckSaveBtn, [inputValid, textareaValid]);

			handleResultVar.setValueText(values.reduce((acc, act) =>
			{
				const [k, v] = act.substring(1, act.length).split(';');
				defaultValue[k] = v;

				acc += ',' + act;
				return acc;
			}));
		});


		pckSaveBtn.addEventListener('click', () =>
		{
			snippetObject_modal_ref.getVariables().push({
				active: false,
				choosable: false,
				code: handleResultVar.handleEditPCK(),
				name: handleResultVar.getName(),
				defaultValue: defaultValue
			});

			if (snippetObject_modal_ref.getVariables().length > 0 && snippetObject_modal_ref.getVariables().filter((v: { name: string; }) => v.name == handleResultVar.getName()).length === 1)
			{
				pckSaveBtn.innerText = 'saved!';

				setTimeout(() =>
				{
					pckTextArea.value = null;
					pckTextArea.classList.toggle('nvinvalid');
					pckTextArea.classList.toggle('nvvalid');
					pckInputName.value = null;
					pckInputName.classList.toggle('nvinvalid');
					pckInputName.classList.toggle('nvvalid');
					pckSaveBtn.innerText = 'save';
					textareaValid = false;
					inputValid = false;
					pckSaveBtn.parentElement.classList.remove('active');
					_triggerReloadInitVarDIV();
				}, 500)
			}
		});
	}
}




/* ------------------------UTILS------------------------ */

const handleInputNameForNewVariable = (e: Event) =>
{
	let inputValid;
	const target = (<HTMLInputElement>e.target);

	if (snippetObject_modal_ref.getVariables().length > 0 && snippetObject_modal_ref.getVariables().filter((v: { name: string; }) => v.name == target.value).length == 1)
	{
		inputValid = false;
		_applyNVValidNVInvalidToTarget(target, inputValid);
		return;
	}

	inputValid = target.value.trim().length == 0;
	_applyNVValidNVInvalidToTarget(target, inputValid);
	const finalText = target.value.replace(' ', '_');
	handleResultVar.setNameText(finalText);
	return inputValid;
}

const _applyNVValidNVInvalidToTarget = (target: HTMLElement, isValid: boolean) =>
{
	if (!isValid)
	{
		target.classList.add('nvvalid');
		target.classList.remove('nvinvalid');
	} else
	{
		target.classList.add('nvinvalid');
		target.classList.remove('nvvalid');
	}
}

const _classNVToggler = (divNV: { strDiv: HTMLElement; nmbDiv: HTMLElement; bolDiv: HTMLElement; idDiv: HTMLElement; vDiv: HTMLElement; vPck: HTMLElement; }, nameActive: HTMLElement) =>
{
	Object.entries(divNV).forEach(([name, value]) =>
	{
		if (value.id != nameActive.id)
		{
			value.classList.remove('active');
			return;
		}
		value.classList.add('active');
	});
}

const __PREFIX_CODE_SNIPPET__ =
{
	STR: '${$STR',
	NMB: '${$NMB',
	BOL: '${$BOL',
	ID: '${$ID',
	V: '${$V',
	PCK: '${$PCK',
}


const _checkOkShowBtnSaveNewVariable = (btn: HTMLButtonElement, [...check]: Boolean[]) =>
{
	const isOk = check.every(b => b === true);
	if (!isOk)
	{
		btn.parentElement.classList.remove('active');
		return;
	}
	btn.parentElement.classList.add('active');
}

const chipContainerDiv = document.getElementById('chips-container');
let chipVariable: NodeListOf<Element>;
const _triggerReloadInitVarDIV = () =>
{
	if (!snippetObject_modal_ref || !snippetObject_modal_ref.getVariables() || snippetObject_modal_ref.getVariables().length == 0)
	{
		return;
	}

	const chipToDelete = document.querySelectorAll('.chip');
	chipToDelete.forEach(el => el.remove());

	const chips: HTMLDivElement[] = []; //TODO SE NON SERVE RIMUOVERE!!
	snippetObject_modal_ref.getVariables().forEach((v: Ivariable) =>
	{
		const chip = document.createElement('div');
		chip.id = `chip_${v.name}`;
		chip.classList.add('chip');

		if (v.choosable)
		{
			chip.classList.add('selected');
		}

		if (v.active)
		{
			chip.classList.add('active');
		}

		const span = document.createElement('span');
		span.classList.add('chip-label');
		span.innerText = v.name;

		const btnDelete = document.createElement('button');
		btnDelete.classList.add('chip-close');
		btnDelete.title = 'Delete Variable';
		btnDelete.innerText = 'x';

		chip.appendChild(span);
		chip.appendChild(btnDelete);

		chips.push(chip);

		chipContainerDiv.appendChild(chip);

	});
	chipVariable = document.querySelectorAll('.chip');
	chipVariable.forEach(chip =>
	{
		chip.addEventListener('click', function (e)
		{
			// Se il clic è sull'icona di chiusura, non attivare la selezione
			if ((<HTMLDivElement>e.target).classList.contains('chip-close'))
			{
				return;
			}
			chip.classList.toggle('selected');
			snippetObject_modal_ref.getVariables().forEach(v =>
			{

				if (v.name != chip.id.split('_')[1])
				{
					return;
				}
				if (chip.classList.contains('selected'))
				{
					v.choosable = true;
				} else
				{
					v.choosable = false;
				}
			})
		});
	});

	btnChipVariableClose.forEach(button =>
	{
		button.addEventListener('click', function (e)
		{
			e.stopPropagation(); // Impedisce al clic di propagarsi al chip
			button.parentElement.remove();
		});
	});
}
