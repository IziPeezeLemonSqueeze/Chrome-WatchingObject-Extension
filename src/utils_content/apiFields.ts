export class APIFIELD
{

	copyToClipboard;

	pageFields: any = null;
	apiFieldExist: string[] = [];

	constructor(copyToClipboard: Function)
	{
		this.copyToClipboard = copyToClipboard;
	}


	removeApiNameToFields()
	{
		if (!this.apiFieldExist || this.apiFieldExist.length === 0)
		{
			return;
		}

		this.apiFieldExist.forEach(id =>
		{
			try
			{
				const el = document.getElementById(id);
				if (el)
				{
					el.remove();
				}
			} catch (err) { }

		});

		this.apiFieldExist = [];

		location.reload();
	}

	setApiNameToFields(api: { objectInfo: any; recordTypeFound: any; recordTypeName: any; apiField: { layouts: { detailLayoutSections: any[]; }[]; detailLayoutSections: any[]; }; })
	{
		const pageFieldsCopy = [...this.pageFields];
		let newElementObjectInfoOnHTML = document.createElement('span');
		newElementObjectInfoOnHTML.id = 'showapi-objectInfo';
		newElementObjectInfoOnHTML.setAttribute('style', 'background-color: rgb(1, 118, 211);margin-left: 5px;display: inline-block;padding: 5px;border-radius: 3px;color: rgb(255, 255, 255);-webkit-text-stroke: thin rgb(0, 0, 0);font-weight: bold;');
		newElementObjectInfoOnHTML.innerText = `${api.objectInfo}  :  ${(api.recordTypeFound ? api.recordTypeName : "NO RECORDTYPE")}`;
		const headerObject = document.getElementsByClassName('entityNameTitle')[0];
		headerObject.appendChild(newElementObjectInfoOnHTML);
		this.apiFieldExist.push('showapi-objectInfo');
		//console.log('ENTITY NAME TITLE', headerObject)
		if (!api.recordTypeFound)
		{
			api.apiField.layouts[0].detailLayoutSections.forEach((section, sectionIndex) =>
			{
				section.layoutRows.forEach((row: { layoutItems: any[]; }, rowIndex: string | number) =>
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
									api.apiField.detailLayoutSections[sectionIndex].layoutRows[rowIndex].layoutItems = api.apiField.detailLayoutSections[sectionIndex].layoutRows[rowIndex].layoutItems.filter((li: { label: any; }) => li.label != elem.innerText);
									pageFieldsCopy.splice(pageFieldsCopy.indexOf(elem), 1);
									this.createElementHTMLForApiFields(elem, item);
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
				section.layoutRows.forEach((row: { layoutItems: any[]; }, rowIndex: string | number) =>
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
									api.apiField.detailLayoutSections[sectionIndex].layoutRows[rowIndex].layoutItems = api.apiField.detailLayoutSections[sectionIndex].layoutRows[rowIndex].layoutItems.filter((li: { label: any; }) => li.label != elem.innerText);
									pageFieldsCopy.splice(pageFieldsCopy.indexOf(elem), 1);
									this.createElementHTMLForApiFields(elem, item);
								}
							};
						}
					});
				});
			});
		}

		//console.log('API FIELD INSERTED', apiFieldExist, apiFieldExist.length)
	}

	createElementHTMLForApiFields(elem: any, item: any)
	{
		const newElemementOnHTML = document.createElement('span');
		newElemementOnHTML.id = `showapi-${item.layoutComponents[0].value}`;
		newElemementOnHTML.setAttribute('style', 'background-color: rgb(1, 118, 211);margin-top: 2px;margin-bottom: 5px;display: block;padding: 5px;border-radius: 3px;color: rgb(255, 255, 255);-webkit-text-stroke: thin rgb(0, 0, 0);font-weight: bold;cursor: pointer;');
		newElemementOnHTML.innerText = item.layoutComponents[0].value;
		newElemementOnHTML.title = 'click to copy on clipboard';
		newElemementOnHTML.addEventListener('click', (e) =>
		{
			this.copyToClipboard(item.layoutComponents[0].value);
		});
		elem.parentNode.appendChild(newElemementOnHTML);

		newElemementOnHTML.style.width = 'fit-content';
		if (item.layoutComponents[0].details.calculatedFormula)
		{
			newElemementOnHTML.style.width = '110%';
			const newElementOnHTMLFormula = document.createElement('span');
			newElementOnHTMLFormula.id = `showapiformula-${item.layoutComponents[0].value}`
			newElementOnHTMLFormula.title = item.layoutComponents[0].details.calculatedFormula;
			newElementOnHTMLFormula.innerText = '{√x}²';
			newElementOnHTMLFormula.setAttribute('style', 'background-color: rgb(1, 118, 211);padding: 6px;color: rgb(255, 255, 255);-webkit-text-stroke: thin rgb(0, 0, 0);font-weight: bold;cursor: help;border-left: dashed;margin-left: 9%;');

			newElemementOnHTML.appendChild(newElementOnHTMLFormula);

			//apiFieldExist.push(newElementOnHTMLFormula.id);
		}
		this.apiFieldExist.push(newElemementOnHTML.id);
	}

}
