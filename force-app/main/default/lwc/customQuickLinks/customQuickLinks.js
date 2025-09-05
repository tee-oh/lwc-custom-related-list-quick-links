import { LightningElement, api, track, wire} from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import { EnclosingTabId, IsConsoleNavigation, getTabInfo, openTab, openSubtab } from 'lightning/platformWorkspaceApi';
import { getRecord } from 'lightning/uiRecordApi';
import { reduceErrors } from 'c/ldsUtils';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getCustomQuickLinks from '@salesforce/apex/CustomQuickLinksController.getCustomQuickLinks';
import getCustomQuickLinkRecordCount from '@salesforce/apex/CustomQuickLinksController.getCustomQuickLinkRecordCount';

export default class CustomQuickLinks extends NavigationMixin(LightningElement) {
 
	@api flexipageApiName = null;
	@api objectApiName;
	@api recordId;
	
	@track quickLinks = [];
	recordTypeDevName = null;
	showQuickLinks = false;
	fieldsArray = [];

	connectedCallback() {
		// Get base url of instance, i.e. 'https://aruplab.lightning.force.com' of 'https://aruplab--cert.sandbox.lightning.force.com'.
		let sfDomain = 'force.com';
		this.baseUrl = window.location.href.substring(0, window.location.href.indexOf(sfDomain) + sfDomain.length);
		if (this.objectApiName != undefined) this.fieldsArray.push(this.objectApiName + '.RecordType.DeveloperName');
		if (this.objectApiName != undefined) this.fieldsArray.push(this.objectApiName + '.Name');
	}

	/* Begin Wire Functions */
	@wire(IsConsoleNavigation) IsConsoleNavigation;
	@wire(EnclosingTabId) tabId;
	@wire(CurrentPageReference) currentPageReference;

	@wire(getRecord, {recordId: '$recordId', fields: '$fieldsArray'})
	getRecordTypeName(result) {
		const {data, error} = result;
		if (data) {
			this.recordName = data.fields.Name.value;
			this.recordTypeDevName = data.fields.RecordType.value.fields.DeveloperName.value;
		} else if (error) {
			this.dispatchEvent(
				new ShowToastEvent({
					title: 'Error',
					message: 'There was a problem retrieving the record type: ' + reduceErrors(error),
					variant: 'error'
				})
			);
			console.log('There was a problem retrieving the record type: ' + reduceErrors(error));
		}
	}

	@wire(getCustomQuickLinks, {recordId: '$recordId', objectApiName: '$objectApiName', recordTypeDevName: '$recordTypeDevName'})
	wiredLinks(result) {
		const {data, error} = result;
		if (data) {
			this.quickLinks = [];
			this.quickLinks = JSON.parse(JSON.stringify(data));
			let quickLinksCopy = [...this.quickLinks]; // Copy data to edit values.
			if (quickLinksCopy.length > 0) {
				for (let i in quickLinksCopy) {
					let ql = quickLinksCopy[i];
					// Format link url.
					if (ql.Type__c == 'Custom Tab (Page)') {
						let linkCopy = ql.URL__c;
						if (linkCopy.includes('[OBJECT_API_NAME]')) {
							linkCopy = linkCopy.replace('[OBJECT_API_NAME]', this.objectApiName);
						}
						if (linkCopy.includes('[RECORD_ID]')) {
							linkCopy = linkCopy.replace('[RECORD_ID]', this.recordId);
						}
						if (linkCopy.includes('[RECORD_NAME]')) {
							linkCopy = linkCopy.replace('[RECORD_NAME]', this.recordName);
						}
						ql.formattedUrl = linkCopy;
					} else if (ql.Type__c == 'Dynamic Single Related List') {
						ql.formattedUrl = this.baseUrl + '/lightning/cmp/force__dynamicRelatedListViewAll?force__flexipageId=' + this.flexipageApiName
											+ '&force__cmpId=' + ql.List_Name__c + '&force__recordId=' + this.recordId;
					} else if (ql.Type__c == 'External') {
						ql.formattedUrl = ql.URL__c;
					} else if (ql.Type__c == 'Single Related List') {
						ql.formattedUrl = this.baseUrl + '/lightning/r/' + this.objectApiName + '/' + this.recordId + '/related/' + ql.List_Name__c + '/view';
					}
					ql.formattedTitle = ql.Title__c;
					ql.recordCount = '0';
					// Obtain record count, if applicable to link type (i.e. dynamic and single related list).
					if (ql.Display_Record_Count__c == true) {
						if (ql.Record_Count_SOQL__c != null) {
							let soqlCopy = ql.Record_Count_SOQL__c;
							if (soqlCopy.includes('[RECORD_ID]')) {
								soqlCopy = soqlCopy.replace('[RECORD_ID]', this.recordId);
							}
							this.getLinkRecordCount(soqlCopy)
							.then(result => {
								let recordCountInteger = result;
								if (recordCountInteger >= 10) {
									ql.recordCount = '10+';
								} else if (recordCountInteger >= 0 && recordCountInteger < 10) {
									ql.recordCount = recordCountInteger.toString();
								}
								ql.formattedTitle = ql.formattedTitle + ' (' + ql.recordCount + ')';
							})
						}
					}
				}
				this.quickLinks = quickLinksCopy;
				this.showQuickLinks = true;
			}
		} else if (error) {
			this.dispatchEvent(
				new ShowToastEvent({
					title: 'Error',
					message: 'There was a problem retrieving supplemental quick links: ' + reduceErrors(error),
					variant: 'error'
				})
			);
			console.log('There was a problem retrieving supplemental quick links: ' + reduceErrors(error));
		}
	}
	/* End Wire Functions */

	async getLinkRecordCount(soqlQueryString) {
		var recordCount = 0;
		await getCustomQuickLinkRecordCount({queryString: soqlQueryString})
		.then(result => {
			recordCount = result;
		})
		.catch(error => {
			this.dispatchEvent(
				new ShowToastEvent({
					title: 'Error',
					message: 'There was a problem retrieving a supplemental quick link record count: ' + reduceErrors(error),
					variant: 'error'
				})
			);
			console.log('There was a problem retrieving a supplemental quick link record count: ' + reduceErrors(error));
		});
		return recordCount;
	}

	/* Begin UI Functions */
	async navigateToLink(event) {
		let linkUrl = event.target.dataset.url;
		let linkType = event.target.dataset.type;
		if (this.IsConsoleNavigation) { // In console...
			if (linkType == 'Custom Tab (Page)' || linkType == 'Dynamic Single Related List' || linkType == 'Single Related List') { // ...for these link types, open these records as subtabs.
				const tabInfo = await getTabInfo(this.tabId);
				const primaryTabId = tabInfo.isSubtab ? tabInfo.parentTabId : tabInfo.tabId;
				await openSubtab(primaryTabId, { url: linkUrl, focus: true });
			} else if (linkType == 'External') { // Otherwise, for 'external' link types, open as new window tab.
				window.open(linkUrl, '_blank');
			} else { // Otherwise, for other link types, open as primary tabs.
				await openTab({ recordId: this.recordId, focus: true });
			}
		} else { // Otherwise, if not in console, open links in the same window.
			const pageref = {
				type: 'standard__webPage',
				attributes: {url: linkUrl}
			};
			this[NavigationMixin.Navigate](pageref);
		}
	}
	/* End UI Functions */
}