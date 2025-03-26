interface IMAPVALUE
{

	type: string,
	name: string,
	ivc: string,
	value: string | null,

}

interface IresApexLog
{
	done: boolean,
	records: IchunkCompositeApexLog[],
	totalSize: number
}

interface IchunkCompositeApexLog
{
	errors: [],
	id: string,
	success: boolean
}

interface IsnippetFromStorage
{
	[ key: string ]:
	{
		code: string,
		ivcFound: string[],
		variables: Ivariable[]
	}
}

type TivcFound = {
	randomNumber: RegExpMatchArray,
	randomText: RegExpMatchArray,
	classic: RegExpMatchArray,
	pck: RegExpMatchArray,
	init: RegExpMatchArray,
}

interface IsnippetObject
{
	name: string,
	ivcFound: null | TivcFound
	variables: Ivariable[],
	code: string,
	initBlock: boolean
};

interface Ivariable
{
	code: string,
	defaultValue: string | number | boolean | string[] | { [ key: string ]: {} }
	choosable: boolean,
	active: boolean,
	varName: string,
	name: string
}

interface IdivNV
{
	strDiv: HTMLElement,
	nmbDiv: HTMLElement,
	bolDiv: HTMLElement,
	idDiv: HTMLElement,
	vPck: HTMLElement
}
