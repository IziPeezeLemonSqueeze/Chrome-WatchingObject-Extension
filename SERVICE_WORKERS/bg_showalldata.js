
export var Pocess = (function (Utils)
{


    chrome.runtime.onMessage.addListener(async (obj, sender, response) =>
    {
        console.log('ARRIVED BE_SHOWALLDATA', obj);

        switch (obj.type)
        {

            case 'showAllDataRequestData':
                console.log(sender.tab.url)
                const sid_sad = await chrome.cookies.getAll({
                    name: "sid",
                    domain: Utils.getCurrentUrl(sender.tab).customDomain,
                });
                let idObj = String(sender.tab.url).split('/');
                let ObjectType = idObj[idObj.length - 3];
                idObj = idObj[idObj.length - 2];
                var res = null;
                await fetch(Utils.getCurrentUrl(sender.tab).customDomainHttps +
                    "/services/data/v57.0/sobjects/" + ObjectType + "/describe/", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json; charset=UTF-8",
                        Accept: "application/json",
                        Authorization: "Bearer " + sid_sad[0].value
                    }
                })
                    .then(async response => res = await response.json())
                    .then(result => console.log(result))
                    .catch(error => console.log('error', error));

                let fieldsName = '';
                for (let i = 0; i < res.fields.length; i++)
                {
                    if (i == res.fields.length - 1)
                    {
                        fieldsName += res.fields[i].name;
                    } else
                    {
                        fieldsName += res.fields[i].name + ',';
                    }
                }

                let mapPayload = new Map();
                Object.entries(res.fields).forEach(attrs =>
                {
                    let attr = attrs[1];
                    mapPayload.set(attr.name, {
                        autoNumber: attr.autoNumber,
                        calculated: attr.calculated,
                        calculatedFormula: attr.calculatedFormula,
                        custom: attr.custom,
                        defaultValue: attr.defaultValue,
                        defaultValueFormula: attr.defaultValueFormula,
                        dependentPicklist: attr.dependentPicklist,
                        digits: attr.digits,
                        externalId: attr.externalId,
                        idLookup: attr.idLookup,
                        label: attr.label,
                        length: attr['length'],
                        name: attr.name,
                        picklistValues: attr.picklistValues,
                        precision: attr.precision,
                        scale: attr.scale,
                        type: attr.type,
                        value: null
                    });
                });

                let resValue = { records: [{}] };
                let request = [];
                if (res.fields.length > 200)
                {
                    let chunkComposite = [];
                    for (let c = 0; c < res.fields.length; c += 200)
                    {
                        chunkComposite.push(res.fields.slice(c, c + 200));
                    }
                    chunkComposite.forEach(async (chunk) =>
                    {
                        request.push(new Promise(async (resolve) =>
                        {
                            let composite = Utils.getCurrentUrl(sender.tab).customDomainHttps +
                                "/services/data/v57.0/query/?q=SELECT+";
                            chunk.forEach(field =>
                            {
                                composite += field.name + ',';
                            });
                            composite = composite.slice(0, composite.length - 1);
                            composite += "+FROM+" + res.name + "+WHERE+Id+=+'" + idObj + "'";

                            await fetch(composite, {
                                method: 'GET',
                                headers: {
                                    "Content-Type": "application/json; charset=UTF-8",
                                    Accept: "application/json",
                                    Authorization: "Bearer " + sid_sad[0].value
                                }
                            }).then(async response =>
                            {
                                let res = await response.json();
                                resValue.records[0] =
                                    Object.assign(resValue.records[0], res.records[0]);
                                resolve();

                            })
                                .then(result => null)
                                .catch(error => console.log('error', error));
                        }));
                    });
                } else
                {
                    request.push(new Promise(async (resolve) =>
                    {
                        console.log(fieldsName)
                        await fetch(
                            Utils.getCurrentUrl(sender.tab).customDomainHttps +
                            "/services/data/v57.0/query/?q=SELECT+" + fieldsName + "+FROM+" + res.name + "+WHERE+Id+=+'" + idObj + "'", {
                            method: "GET",
                            headers: {
                                Authorization: "Bearer " + sid_sad[0].value,
                                "Content-Type": "application/json",
                            }
                        })
                            .then(async response =>
                            {
                                resValue = await response.json();
                                resolve();
                            })
                            .then(result => console.log(result))
                            .catch(error => console.log('error', error));
                        console.log(resValue)
                    }));
                    //let map = Object.entries(resValue.records[0]);
                }
                Promise.all(request).then(() =>
                {
                    console.log('resValue', resValue)
                    mapPayload.forEach((v, k) =>
                    {
                        mapPayload.get(k).value = resValue.records[0][k];
                    });
                    console.log(mapPayload);
                    chrome.tabs.sendMessage(sender.tab.id, {
                        response: 'openShowAllData',
                        payload: Object.fromEntries(mapPayload)
                    });
                });
                break;


        }
    });

});