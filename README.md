# Salesforce Enhancer
Salesforce Enhancer is a chrome extension to aid in development and helps keep track of records that are waiting for a change, updating the affected tab only the moment there is a change to the record, whether due to an integration or something else, so that you don't have to be always hitting F5 to refresh the page.

When there is a change to the record, Salesforce Enhancer will notify you with a notification and update the affected tab, plus it helps you navigate by taking you directly to the tab of the record among the dozens of tabs you have open!


# Security and Privacy

The Salesforce Enhancer browser extension/plugin communicates directly between the user's web browser and the Salesforce servers.
No data is sent to other parties and no data is persisted outside of Salesforce servers after the user leaves the Salesforce pages.

The Salesforce Enhancer communicates via the official Salesforce webservice APIs on behalf of the currently logged in user.
This means the Salesforce Enhancer will be capable of accessing nothing but the data and features the user has been granted access to in Salesforce.

All Salesforce API calls from the Salesforce Enhancer re-uses the access token/session used by the browser to access Salesforce.
To acquire this access token the Salesforce Enhancer requires permission to read browser cookie information for Salesforce domains.

To validate the accuracy of this description, inspect the source code, monitor the network traffic in your browser or take my word.

About
-----
By Stefano Pastore

License
-----
MIT
