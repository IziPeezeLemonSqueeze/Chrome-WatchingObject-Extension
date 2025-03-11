interface MAPVALUE
{

	type: string,
	name: string,
	ivc: string,
	value: string | null,

}

interface resApexLog
{
	done: boolean,
	records: chunkCompositeApexLog[],
	totalSize: number
}

interface chunkCompositeApexLog
{
	errors: [],
	id: string,
	success: boolean
}

interface snippetFromStorage
{
	[key: string]:
	{
		code: string,
		ivcFound: string[],
		variables: Ivariable[]
	}
}

interface Ivariable
{
	code: string,
	choosable: boolean,
	active: boolean,
}
