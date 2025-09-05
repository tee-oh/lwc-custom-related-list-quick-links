public class CustomQuickLinksController {

	@AuraEnabled(cacheable=true)
	public static List<Custom_Quick_Link__mdt> getCustomQuickLinks(String recordId, String objectApiName, String recordTypeDevName) {
		List<Custom_Quick_Link__mdt> quickLinks = new List<Custom_Quick_Link__mdt>();
		List<Custom_Quick_Link_Group__mdt> quickLinkGrps = new List<Custom_Quick_Link_Group__mdt>([SELECT Id, Display_Record_Types__c, Object_Type__c
																									FROM Custom_Quick_Link_Group__mdt
																									WHERE Object_Type__c = :objectApiName]);
		if (quickLinkGrps.size() > 0) {
			// Evaluate and remove any quick link group records that that are unavailable to this record type.
			for (Integer i = quickLinkGrps.size()-1; i >= 0; i--) { // NOTE: Loop backwards to account for changing index number when a value is identified and removed.
				Boolean matchingRecordType = false;
				List<String> splitObjectType = quickLinkGrps[i]?.Display_Record_Types__c?.split(', ');
				if (splitObjectType.contains(recordTypeDevName)) {
					matchingRecordType = true;
				}
				if (!matchingRecordType) {
					quickLinkGrps.remove(i);
				}
			}
			if (quickLinkGrps.size() > 0) { // Only one quick link group should remain for each object/record type combo (although there is no way to enforce this with a CMT validation rule)...
				Custom_Quick_Link_Group__mdt cqlg = quickLinkGrps[0]; //...so always assume the first is that only one.
				quickLinks = [SELECT Id, Appearance_Order__c, Custom_Quick_Link_Group__c, Display_Record_Count__c, Icon__c, Label,
								List_Name__c, Record_Count_SOQL__c, Title__c, Type__c, URL__c
								FROM Custom_Quick_Link__mdt
								WHERE Custom_Quick_Link_Group__c = :cqlg.Id
								ORDER BY Appearance_Order__c];
			}
		}
		return quickLinks;
	}

	@AuraEnabled(cacheable=true)
	public static Integer getCustomQuickLinkRecordCount(String queryString) {
		List<sObject> records = Database.query(queryString);
		Integer recordCount = records.size();
		return recordCount;
	}
}