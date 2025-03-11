export class DCSNIPPET
{
	consoleIntervalSearch: NodeJS.Timeout | undefined;
	frameSnippet: HTMLIFrameElement;
	divCodeSnippet: HTMLDivElement;
	divMenuBar: HTMLDivElement;
	isFrameClosed: boolean = false;

	devConsoleTool()
	{
		console.log('DEV CONSOLE TOOL')

		const parentDivMenuBar = document.getElementById('toolbar-1043-targetEl');
		this.divMenuBar = document.createElement('div');
		this.divMenuBar.setAttribute('class', "x-btn x-box-item x-toolbar-item x-item-disabled x-btn-default-toolbar-small x-disabled x-btn-disabled x-btn-default-toolbar-small-disabled x-noicon x-btn-noicon x-btn-default-toolbar-small-noicon pulse-button");
		this.divMenuBar.setAttribute('style', "border-width: 1px; left: 332px; top: 2px; margin: 0px; cursor: pointer");
		this.divMenuBar.innerText = 'CODE SNIPPET';

		this.divMenuBar.animate(
			[
				{ boxShadow: '0 0 15px rgba(0, 170, 255, 0.76)' },
				{ boxShadow: '0 0 20px rgba(0, 170, 255, 1)' },
				{ boxShadow: '0 0 5px rgba(0, 170, 255, 0.5)' }
			],
			{
				duration: 2000,
				iterations: Infinity,
				easing: 'ease-in-out'
			}
		);

		this.divMenuBar.addEventListener('click', () =>
		{
			this.startFrame();
		});

		parentDivMenuBar.appendChild(this.divMenuBar);

		this.isFrameClosed = false;
		clearInterval(this.consoleIntervalSearch);
	}

	changeHeight()
	{
		console.log(this.isFrameClosed)
		if (this.isFrameClosed)
		{
			this.frameSnippet.animate([
				{ height: '5%' },
				{ height: '20.5%' },
			], {
				duration: 500,
				easing: 'ease-in-out',
				iterations: 1,
				fill: 'forwards'
			});

			this.divCodeSnippet.animate([
				{ height: '7%' },
				{ height: '30%' },
			], {
				duration: 500,
				easing: 'ease-in-out',
				iterations: 1,
				fill: 'forwards'
			});
			this.isFrameClosed = false;
			console.log('opening')
		} else
		{
			this.frameSnippet.animate([
				{ height: '20.5%' },
				{ height: '5%' },
			], {
				duration: 500,
				easing: 'ease-in-out',
				iterations: 1,
				fill: 'forwards'
			});

			this.divCodeSnippet.animate([
				{ height: '30%' },
				{ height: '7%' },
			], {
				duration: 500,
				easing: 'ease-in-out',
				iterations: 1,
				fill: 'forwards'
			});
			this.isFrameClosed = true;
			console.log('closing')
		}
	}

	startFrame()
	{
		const editorBody = document.getElementById('panel-1136');
		if (!editorBody)
		{
			console.log('editorBody NOT FOUND');
			return;
		}
		const parentElement = editorBody.parentElement;

		this.frameSnippet = document.createElement('iframe');
		this.frameSnippet.id = 'DCSFRAME';
		this.frameSnippet.src = chrome.runtime.getURL('developerConsoleSnippet.html');
		this.frameSnippet.setAttribute('class', 'iframe');
		this.frameSnippet.setAttribute('style', "z-index: 1000;position: absolute;width: 58.5%;height: 512px;top: 5%;left: 21%;border: none !important;outline: none!important;")

		parentElement.appendChild(this.frameSnippet);
	}


	initCompositionSnippet()
	{

		if (!this.divCodeSnippet)
		{
			return;
		}

		const parentElement = this.divCodeSnippet.parentElement;

		const divComposition = document.createElement('div');
		divComposition.id = 'snippetcomposition';
		divComposition.setAttribute('style', 'box-shadow: 0px -5px 9px #ededed;border: 1px #9191913b solid;background: #d5d5d5;z-index: 1000;left: 34%;bottom: 54%;position: relative;height: 300px;width: 450px;');

		parentElement.appendChild(divComposition);
	}

}
