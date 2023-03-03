/* module.exports = async (domain, sid, sObject, ID) =>
{
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + sid);
    myHeaders.append("Cookie", "BrowserId=o4dZ97ErEe2I8nW07bR1ww; CookieConsentPolicy=0:0; LSKey-c$CookieConsentPolicy=0:0");

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    await fetch(domain + "/services/data/v57.0/sobjects/" + sObject + "/" + ID, requestOptions)
        .then(response => { return response.json() })
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}
 */