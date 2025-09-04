# lwc-custom-related-list-quick-links

The "Custom Quick Links" Lightning Web Component (LWC) is intended to provide a scalable, alternative (or supplemental) solution to using the standard Salesforce "Related List Quick Links" component on a "Lightning Page" (flexipage). The standard "Related List Quick Links" component currently only provides clickable links to any record's related lists that appear on the page layout assigned to that record's record type. It does not support configuring links to the following, which Salesforce now allows to be added directly to lightning pages, nor links to Salesforce tabs that house custom LWCs or external URLs:

<ul>
<li>Custom LWCs that mimic related lists</li>
<li>Dynamic Single Related Lists</li>
<li>Single Related Lists</li>
</ul>

The "Custom Quick Links" component does support configuring links to all of the following:

<ul>
<li>Custom Tabs (Pages) (which can house custom LWCs that mimic related lists, or other custom components)</li>
<li>Dynamic Single Related Lists</li>
<li>External URLs</li>
<li>Single Related Lists</li>
</ul>

# Basic Setup

For every appearance of the "Custom Quick Links" component on a flexipage, a "Custom Quick Link Group (CQLG)" record must be created that lists the object the component will reference, the flexipage it was placed on, and the record types assigned to that flexipage that should display the component on them. Under this record, "Custom Quick Link (CQL)" records will be created for each link that should show for an object/flexipage/record type combo. The CQL records will hold configuration details specific to the link type selected to be displayed.

Note, when creating a CQLG record, in particular, the flexipage needs to be provided due to the fact that "Dynamic Single Related List" URLs cite their source "related list" records using a standard naming convention in the URL that simply reflects the order in which the dynamic single related lists were dropped on the flexipage, not the relationship they traverse. On one account flexipage, a "Cases" dynamic single related list id maybe "lst_dynamicRelatedList2" because it was the second dynamic single related list placed on the flexipage, whereas, on another account flexipage, the "Cases" dynamic single related list id maybe "lst_dynamicRelatedList5" because it was the fifth dynamic single related list placed on the page. As a result, CQLG records must be stratified by the object/flexipage/record type in order to correctly align CQL dynamic single related list link titles with the correct dynamic single related list id as it appears on the flexipage assigned to that record type and displaying the link.

There should only ever be one CQLG record per object/flexipage/record type instance. That said, there is no mechanism to be able to enforce this on custom metadata type records via apex error or validation rules at this time.

1. Create an "Custom Quick Link Group (CQLG)" custom metadata type record that lists the object the component will reference, the flexipage it was placed on, and the record types assigned to that flexipage that should display the component on them. Examples for two separate Account flexipage configurations are provided below.

[ADD TWO CQLG EXAMPLES HERE]
 
2. For each desired appearance of a link in the "Custom Quick Component", create a "Custom Quick Link (CQL)" custom metadata type record that captures the required information to correctly configure the link. Required information varies by the link "Type" selected. For all CQL configuration records, regardless of "Type", provide the following:
<ul>
<li>Type</li>
<li>Title (this will be displayed as the link text and hover text)</li>
<li>Icon (obtained from the Salesforce Icon Library)</li>
<li>Appearance Order (links will render in this order)</li>
</ul>

Depending on which link "Type" you are configuring, provide additional information to correctly configure the link. Examples of the correct configuration for each possible link "Type" are provided below. 

<ul>
<li>Custom Tab (Page) "Link Type" Configuration
<ul>
<li>If the link "Type" is "Custom Tab (Page)", provide the URL beginning after the Salesforce base URL and include merge fields in the proper syntax (i.e. /lightning/n/Relationships?c__recordId=[RECORD_ID]&c__objectType=[OBJECT_API_NAME]).
NOTE: Supported merge fields are: [RECORD_ID], [RECORD_NAME], [OBJECT_API_NAME].</li>
</ul>
</li>
</ul>

[ADD CUSTOM PAGE CQL EXAMPLE HERE]

<ul>
<li>Dynamic Single Related List Link Type Configuration
<ul>
<li>For "List Name", if the link "Type" is "Dynamic Single Related List", provide the "cmpId" of the dynamic related list obtained from the dynamic single related list URL when the link is clicked on a flexipage (i.e. lst_dynamicRelatedList2, if this was the second dynamic related list that was placed on a flexipage).</li>
<li>If a record count (0-10+) needs to be displayed alongside the link title, check "Display Record Count" and in the "Record Count SOQL" field, provide a SOQL query that matches the related list configuration, returns the same number of records as the related list, and includes merge fields in the proper syntax (i.e. SELECT Id FROM Case WHERE AccountId = '[RECORD_ID]'). </li>
</ul>
</li>
</ul>

 [ADD DYNAMIC CQL EXAMPLE HERE]

<ul>
<li>External URL Link Type Configuration
<ul>
<li>If the link "Type" is "External", provide the full URL of the external site (i.e. https://www.utah.edu).
Supported merge fields are: [RECORD_ID], [RECORD_NAME], [OBJECT_API_NAME].</li>
</ul>
</li>
</ul>

 [ADD EXTERNAL CQL EXAMPLE HERE]

<ul>
<li>Single Related List Link Type Configuration
<ul>
<li>For "List Name", if the link "Type" is "Single Related List", provide the related list name of the single related list obtained from the list URL when the link is clicked on a flexipage (i.e. TLS_Information__r). 
If a record count (0-10+) needs to be displayed alongside the link title, check "Display Record Count" and in the "Record Count SOQL" field, provide a SOQL query that matches the related list configuration, returns the same number of records as the related list, and includes merge fields in the proper syntax (i.e. SELECT Id FROM Case WHERE AccountId = '[RECORD_ID]').</li>
</ul>
</li>
</ul>

 [ADD SINGLE CQL EXAMPLE HERE]


3. Add the "Custom Quick Links" component to the record lightning page (flexipage) that the quick links should be displayed on and set the "Flexipage API Name" property on the component to the API name of the flexipage the component is placed on.

 [ADD FLEXIPAGE EXAMPLE HERE]

# Limitations
<ol>
<li>When hovering over a link in the "Custom Quick Links" component, the full related list being referenced, including detail rows and actions, will not be surfaced in a hover box.</li>
<li>Similar to the standard "Related List Quick Links" component, the "Custom Quick Links" component link total record counts (0-10+) will not update in real time as new related records are added. A full page refresh is required to update total record counts.</li>
<li>"Custom Quick Links" component links cannot display links to single or dynamic related lists that are set to pull from the display record's parental record (i.e. a "Files" dynamic single related list displayed on a Case record is actually the "Files" related list from the parent account with the dynamic single related list's parent relationship field value set to Account, not Case).</li>
<li>For "Custom Quick Links" component links that reference single or dynamic related lists, we can display the total count of records if a SOQL is provided on the back-end "Custom Quick Link" record that matches the related list parameters, however, for links to custom tabs that display LWCs with complex record results, we cannot always display a total count of records because we cannot provide a single SOQL that captures the complexity of the records being selected for display.</li>
</ol>
