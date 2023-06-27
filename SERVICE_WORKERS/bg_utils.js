
export function getCurrentSObjectNameAndID(tab)
{
    return tab.url.match(/\/lightning\/r\/(\w+)\/(\w+)\W*/);
};

export function getCurrentUrl(tab)
{
    console.log("CURRENT URL", tab.url);
    let url = tab.url;
    let domain = tab.url.substring(
        0,
        tab.url.indexOf(".lightning.force.com")
    );
    let customDomain = domain.replace("https://", "") + ".my.salesforce.com";
    let customDomainHttps = domain + ".my.salesforce.com";

    return {
        url: url,
        domain: domain,
        customDomain: customDomain,
        customDomainHttps: customDomainHttps,
    };
};

export async function login(domain, sid, SObject, ID)
{
    console.log(SObject, ID);

    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + sid);
    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    var res = null;

    await fetch(domain + "/services/data/v57.0/sobjects/" + SObject + "/" + ID + "?fields=LastModifiedDate", requestOptions)
        .then(response => res = response.json())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));

    return res;
};


