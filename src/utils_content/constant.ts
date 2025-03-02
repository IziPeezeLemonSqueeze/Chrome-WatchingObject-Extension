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
