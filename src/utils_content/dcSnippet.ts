export class DCSNIPPET
{
	consoleIntervalSearch: NodeJS.Timeout | undefined;
	frameSnippet: HTMLIFrameElement;
	divCodeSnippet: HTMLDivElement;
	isFrameClosed: boolean = false;

	devConsoleTool()
	{
		console.log('DEV CONSOLE TOOL')
		const editorBody = document.getElementById('panel-1136');
		if (!editorBody)
		{
			console.log('editorBody NOT FOUND');
			return;
		}

		const parentElement = editorBody.parentElement;

		this.divCodeSnippet = document.createElement('div');
		this.divCodeSnippet.setAttribute('style', 'left: 0%;bottom: 0%;position: absolute;z-index: 1000;width: -webkit-fill-available;');

		this.frameSnippet = document.createElement('iframe');
		this.frameSnippet.setAttribute('style', 'background: white;position: fixed;bottom: 0%;width: -webkit-fill-available;');
		this.frameSnippet.src = chrome.runtime.getURL('developerConsoleSnippet.html');

		this.divCodeSnippet.appendChild(this.frameSnippet);

		parentElement.appendChild(this.divCodeSnippet);
		this.isFrameClosed = false;
		clearInterval(this.consoleIntervalSearch);

		this.initCompositionSnippet();
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
