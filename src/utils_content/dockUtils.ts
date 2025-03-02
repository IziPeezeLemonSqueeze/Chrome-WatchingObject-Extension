export class DOCK
{
	woToolBtn = null;
	toolOpen = false;

	salesforceBody;

	constructor(salesforceBody)
	{
		this.salesforceBody = salesforceBody;
	}

	newDock()
	{
		if (!this.salesforceBody)
		{
			return;
		}
		try
		{
			if (!document.getElementsByClassName('WOtool-btn slds-button slds-button_brand')[0])
			{
				this.woToolBtn = document.createElement('button');
				this.woToolBtn.className = 'WOtool-btn slds-button slds-button_brand';
				this.woToolBtn.innerText = '🛠️';
				this.woToolBtn.style = 'width: 10px;bottom: 11px;position: fixed;right: -5px;z-index: 9;height: 30px;background: linear-gradient(145deg, rgb(74 87 255) 0%, rgb(89 100 255) 70%, rgb(86 98 255) 0%, rgb(96, 189, 255) 90%, rgb(255, 255, 255) 96%, rgb(255, 255, 255) 96%);';

				console.log('@')
				chrome.storage.sync.get(['firstGO'], async (isFirstGo) =>
				{
					console.log('@@', await isFirstGo)
					if (await isFirstGo.firstGO)
					{
						console.log('@@@')
						const welcomeDiv = document.createElement('div');
						welcomeDiv.id = 'WOtool-btn-welcome';
						welcomeDiv.innerText = 'Here\'s Salesforce Enhancer!';
						welcomeDiv.style = 'color: white;font-style: oblique;font-weight: bold;align-content: center;font-size: x-large;font-family: system-ui;width: 335px;bottom: 36px;position: fixed;right: 22px;z-index: 9;height: 60px;border: 2px solid #ffffff;border-radius: 5px;background: linear-gradient(145deg, rgb(74 87 255) 0%, rgb(89 100 255) 70%, rgb(86 98 255) 0%, rgb(96, 189, 255) 90%, rgb(255, 255, 255) 96%, rgb(255, 255, 255) 96%);text-align: center;';
						this.woToolBtn.addEventListener('mouseenter', () =>
						{
							welcomeDiv.style.display = 'none';
						});
						this.salesforceBody.appendChild(welcomeDiv);
					}
				})

				this.salesforceBody.appendChild(this.woToolBtn);
			}

			if (this.toolOpen)
			{
				//console.log('CHECK WOTOOL', document.getElementById('WOTOOL'));
				if (!document.getElementById('WOTOOL'))
				{
					let div = document.createElement('div');
					div.id = 'WOTOOL';
					div.style = 'z-index: 1000;display: flex;position: fixed;bottom: 42px;right: 0px;vertical-align: middle;';

					let frame = document.createElement('iframe');
					frame.id = 'WOOTOOLframe';
					frame.src = chrome.runtime.getURL('dock.html');
					frame.style = 'border-top-right-radius: 15px;border-bottom-left-radius: 15px;border-top-left-radius: 15px;width: 250px;height: 446px;border: 1px solid rgb(187, 187, 187);box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 8px 0px, rgba(0, 0, 0, 0.19) 0px 6px 20px 0px;z-index: 1000;display: flex;position: fixed;bottom: 42px;right: -265px;vertical-align: middle;';
					frame.animate([
						{ right: '-265px' },
						{ right: '0px' },
					], {
						duration: 500,
						easing: 'ease-in-out',
						iterations: 1,
						fill: 'forwards'
					});
					div.appendChild(frame);

					this.salesforceBody.appendChild(div);
				}
			} else
			{
				try
				{
					let frame = document.getElementById('WOOTOOLframe');
					frame.animate([
						{ right: '0px' },
						{ right: '-265px' },
					], {
						duration: 500,
						easing: 'ease-in-out',
						iterations: 1,
						fill: 'forwards'
					});
					setTimeout(() =>
					{
						this.salesforceBody.removeChild(document.getElementById('WOTOOL'));
					}, 500)
				} catch (e)
				{
					console.log(e);
				}
			}
		} catch (e)
		{
			console.log(e);
		}
	}

	showHideWOTools()
	{
		this.toolOpen = !this.toolOpen;
		this.newDock();
	}

}

