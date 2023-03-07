# WatchingObject

When there is a change to the record, WatchingObject will notify you with a notification and update the affected tab,
plus it helps you navigate by taking you directly to the tab of the record among the dozens of tabs you have open!


# Security and Privacy

The WatchingObject browser extension/plugin communicates directly between the user's web browser and the Salesforce servers.
No data is sent to other parties and no data is persisted outside of Salesforce servers after the user leaves the Salesforce pages.

The WatchingObject communicates via the official Salesforce webservice APIs on behalf of the currently logged in user.
This means the WatchingObject will be capable of accessing nothing but the data and features the user has been granted access to in Salesforce.

All Salesforce API calls from the WatchingObject re-uses the access token/session used by the browser to access Salesforce.
To acquire this access token the Salesforce Inspector requires permission to read browser cookie information for Salesforce domains.

To validate the accuracy of this description, inspect the source code, monitor the network traffic in your browser or take my word.
