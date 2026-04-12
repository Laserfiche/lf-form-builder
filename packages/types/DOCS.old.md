# The LFForm Object

## Introduction

- **Overview:** The LFForm object provides a global interface for accessing Laserfiche form elements and events using JavaScript. Through simple functions, you can find a specific field, retrieve the field values, and update field contents. You also have access to events both at the individual field level as well as the form submission event.
    - **Note:** the LFForm object cannot be used with the classic designer.
- **Usage**: The LFForm object provides various methods and properties to interact with form fields and events with JavaScript in the Laserfiche form designer. Here are some key functionalities:
    - **Accessing Form Fields:** Use methods like `getFieldValues` to retrieve the values of specific fields. You can identify fields using the IdentificationObject, which can be specified as a single object or an array to target multiple fields.
    - **Manipulating Form Data:** Update form fields dynamically using methods like setFieldValues. This allows you to programmatically change field values based on certain conditions or user inputs.
    - **Handling Form Events:** Attach event listeners to form elements to execute custom JavaScript code in response to user actions, such as clicking a button or changing a field value.
    - **Customizing Form Behavior:** Enhance the user experience by adding custom validation, conditional logic, and dynamic content updates based on form data and user interactions.
- **Using this Guide:**
    - The examples in this guide using `await` are intended to be run within an `async ` business logic function as shown in the best practice example.
    - All functions that modify the forms state (i.e., setting a value or toggling a fields visibility) return promises. Promises should be awaited to ensure proper execution order.
        - For example, you must `await LFForm.addRow(. . .)` before you `await LFForm.setFieldValues(. . .)` so the rows you want to set exist before attempting to set them.

### Best Practice Example

```jsx
// Store fields you use at the top of your script to easily update them if anything changes
const formFields = {
  // Use variable name over field id when finding fields
  firstName: { variableName: "First_Name" },
  lastName: { variableName: "Last_Name" },
  fullNameFormatted: { variableName: "Full_Name" },
};

// Declare helper functions
const setFullName = async () => {
  const firstName = LFForm.getFieldValues(formFields.firstName);
  const lastName = LFForm.getFieldValues(formFields.lastName);

  if (firstName === "" || lastName === "") return;
  const fullName = `${lastName}, ${firstName}`;
  await LFForm.setFieldValues(formFields.fullNameFormatted, fullName);
};

// Register event handlers
LFForm.onFieldChange(formFields.firstName, setFullName);
LFForm.onFieldChange(formFields.lastName, setFullName);

// Wrap business logic in an async function to properly handle promises
const main = async () => {
  // Ensure proper order of execution by using async and await
  await setFullName();
};

// Make sure to invoke your business logic and handle errors
main().catch(console.warn);
```

## Shared Types

### Identification Objects

- **Description:** Identification objects are objects containing information identifying which fields the interface methods should act on. Identification objects can have any or all the properties fieldId, variableName, variableId, index.
    - **Note:** In all LFForm interfaces, you can specify an array of identification objects instead of just one object to target multiple fields.
- **Usage of the index property with tables and collections:**
    - A form stores the definition for each row or set as a template. These templates are used to generate the row or set whenever they are added. Some of the interfaces in the LFForm object can affect the template of the field, with the ability to apply changes to future rows or sets.
    - For these interfaces, when your ID object specifies an index (for example {fieldId: 3, index: 1}), the change will only be applied to the field at the specified index. If your ID object does not specify an index (for example {fieldId: 3}), the change will be applied to the template and will be applied to all existing and future rows or sets.

### Type

interface LFFormIdentificationObject {

fieldId?: number;

variableName?: string;

variableId?: string;

index?: number

}

### Properties

### fieldId

- **Type:** number
- **Description:** The field ID of a field.
- **Example:** { fieldId: 10 }

### variableName

- **Type:** string
- **Description:** The name of the variable associated with the field. This value should never contain spaces or special characters.
- **Example:** { variableName: "First_Name" }

### variableId

- **Type:** string
- **Description:** The id of the variable associated with the field. This value should be a guid.
- **Example:** { variableId: "e7c9e10c-eeb0-4ce2-b3c6-26264c7fe655" }

### index

- **Type:** number
- **Description:** If the field is in a collection or table, you can specify the *index* to get the exact field in that row. This number starts at 0.
- **Example:** { fieldId: 2, index: 2 }

*Examples*

// Get fields values with the Identification Object

const firstNameFieldByFieldId = LFForm.getFieldValues({ fieldId: 10 });

const firstNameFieldByVariableName = LFForm.getFieldValues({ fieldName: "First_Name" });

const firstNameFieldByVariableId = LFForm.getFieldValues({ variableId: "text" });

// Change multiple field settings at once by passing an array of Identification Objects

const formFields = {

firstName: { fieldId: 10 },

lastName: { fieldId: 11 },

};

const changeSuccess = await LFForm.changeFieldSettings([formFields.firstName, formFields.lastName], {

textAbove: 'Enter your name here'

})

## LFForm Object

- **Object Name:** LFForm
- **Description**: Represents the Laserfiche form interface for accessing and manipulating form elements and events.

### Properties

The LFForm object contains the following properties that describe the current process information at runtime. They can be used to conditionally perform actions in JavaScript code. For example only run code in certain steps, or not setting field values when any of isPrint/isDisabled/isReadonly is true.

### step

- **Type:** {id: string, name: string} | null
- **Description:** The current step name of the process with any tokens processed or null if it does not exist, and the id of that step as a guid.
- **Example:** A step named "{/dataset/approver_name} Approval Task" would be:
    
    { id: " b046013b-a10b-4a66-84f7-f3daa80d8696", name: "John Doe Approval Task" }
    

### stage

- **Type:** {id: string, name: string} | null
- **Description:** The current stage name as defined in the process diagram or null if it does not exist.
- **Example:** { id: "b046013b-a10b-4a66-84f7-f3daa80d8696", name: "Initial Review" }

### language

- **Type:** string | null
- **Description:** The language selected in the user’s Laserfiche account or null if it does not exist.
- **Example:** "en"

### locale

- **Type:** string | null
- **Description:** The locale selected in the user’s Laserfiche account or null if it does not exist.
- **Example:** "en-US"

### isCloud

- **Type:** boolean
- **Description:** Whether or not the form is hosted in a Laserfiche Cloud environment.
- **Example:** true

### isPreview

- **Type:** boolean
- **Description:** Whether or not the form was opened in preview mode.
- **Example:** false

### isReadonly

- **Type:** boolean
- **Description:** Whether or not the form is set to read-only. For instance, the user task step was configured to display the form as read-only.
- **Example:** true

### isDisabled

- **Type:** Boolean
- **Description:** Whether or not the form was opened from an unassigned task or by a user not assigned to the task.
- **Example:** false

### isPrint

- **Type:** boolean
- **Description:** Whether or not the form is being rendered as a PDF or raster image for a save to repository activity, an email task, or is being downloaded by a user.
- **Example:** true

### isAnonymousUser

- **Type:** boolean
- **Description:** Whether or not the form is public and currently being accessed by an unknown user.
- **Example:** false

### isDraft

- **Type:** boolean
- **Description:** If the form was saved as a draft and has been reopened this will be true, otherwise this will be false.
- **Example:** false

### pageURL

- **Type:** string
- **Description:** The current active URL of the loaded form.
- **Example:** " https://app.laserfiche.com/forms/ExampleForm?customParam=custom"

### Methods

### getFieldValues

- **Description:** Retrieves the value of the specified fields.
    - **Note:** A table column with a single row returns a single value, not an array
- **Signature:** LFForm.getFieldValues(id): LFFormGetFieldValue | LFFormGetFieldValue[]
- **Parameters**:
    - **id**
        - **Type:** IdentificationObject | IdentificationObject[]
        - **Description:** An identification object or array of identification objects that have the desired fields.
        - **Example:** { fieldId: 10 } or [{ fieldId: 10 }, { variableName: "Last_Name" }]
- **Returns:**
    - **Type:** LFFormGetFieldValue | LFFormGetFieldValue[]
    - **Description:** The data of the specified field(s). If multiple fields exist, like fields with multiple rows in a table or collection, it returns an array of data. The return type for the field depend on its type:
        - **SingleLine:** string
        - **MultiLine:** string
        - **Dropdown:** string
        - **RichText:** string
        - **Signature:** string
        - **Number:** number
        - **Checkbox:** { value: string[], otherChoiceValue?: string }
            - **Example:**
                
                { value: ["Choice_1", "Choice_3"] }
                
                { value: ["Choice_1", "_other"], otherChoiceValue: "Hello" }
                
        - **Radio:** { value: string, otherChoiceValue?: string }
            - **Example:**
                
                { value: "Choice 2" }
                
                { value: "_other", otherChoiceValue: "Hi" }
                
        - **Geolocation**: { latidude: number, longitude: number }
            - **Example:** { latidude: 12, longitude: 34 }
        - **Address**: { address?: string, address2?: string, city?: string, country?: string, province?: string, zipcode?: string }
            - **Example:**
                
                {address1: "3545 Long Beach Blvd", city: "Long Beach", province: "California"}
                
        - **DateTime:** { dateStr: string, timeStr?: string }
            - **Note:** The dateStr property must match the formatting of the date field
            - **Example:** { dateStr: "2021-11-19", timeStr: "10:30:00 AM" }
        - **Time:** { timeStr: string }
            - **Example:** { timeStr: "11:30:25 PM" }
        - **Collection:** Not supported
        - **Table:** Not supported
        - **FileUpload:** Not supported
        - **Fileset:** Not supported
    - **Example:** A getting the value single line text field returns
        
        "Hello" or ["Hello", "World"]
        

### Examples

// Retrieve the value of a single line field with a field ID of 10 and the current value of "Hello":

const fieldValue = LFForm.getFieldValues({ fieldId: 10 }); // Output: "Hello"

// Retrieve the value of a field in a table or collection with field ID of 12 that has 3 rows

const columnValues = LFForm.getFieldValues({ fieldId: 12 }); // Output: ["a", "b", "c"]

const firstRowValue = LFForm.getFieldValues({ fieldId: 12, index: 0 }); // Output: "a"

### setFieldValues

- **Description:** Sets the value of the specified fields.
- **Signature:** LFForm.setFieldValues(id, value): Promise<LFFormPromiseResponse>
- **Parameters:**
    - **id**
        - **Type:** IdentificationObject | IdentificationObject[]
        - **Description:** An identification object or array of identification objects.
        - **Example:** { fieldId: 10 } or [{ fieldId: 10 }, { variableName: "Last_Name" }]
    - **value**
        - **Type:** LFFormSetFieldValue
        - **Description:** The value or array of values to set for the specified fields. The accepted types for the value depend on the field type:
            - **SingleLine:** string
            - **MultiLine:** string
            - **Dropdown:** string
            - **RichText:** string
            - **Signature:** string
            - **Number:** number
            - **Checkbox:** { value: string[], otherChoiceValue?: string }
                - **Example:**
                    
                    { value: ["Choice_1", "Choice_3"] }
                    
                    { value: ["Choice_1", "_other"], otherChoiceValue: "Hello" }
                    
            - **Radio:** { value: string, otherChoiceValue?: string }
                - **Example:**
                    
                    { value: "Choice 2" }
                    
                    { value: "_other", otherChoiceValue: "Hi" }
                    
            - **Geolocation**: { latidude: number, longitude: number }
                - **Example:** { latidude: 12, longitude: 34 }
            - **Address**: { address?: string, address2?: string, city?: string, country?: string, province?: string, zipcode?: string }
                - **Example:**
                    
                    {address1: "3545 Long Beach Blvd", city: "Long Beach", province: "California"}
                    
            - **DateTime:** { dateStr: string, timeStr?: string }
                - **Note:** The dateStr property must match the formatting of the date field
                - **Example:** { dateStr: "2021-11-19", timeStr: "10:30:00 AM" }
            - **Time:** { timeStr: string }
                - **Example:** { timeStr: "11:30:25 PM" }
            - **Collection:** Not supported
            - **Table:** Not supported
            - **FileUpload:** Not supported
            - **Fileset:** Not supported
        - **Example:** "Jane" or ["Jane", "Doe"]
- **Returns:**
    - **Type:** Promise<LFFormPromiseResponse>
    - **Description:** A promise that resolves when the values are set or errors are returned.
- **Throws:**
    - If a field is set as read only, its value cannot be changed.
    - If a field value does not match the expected type for the field
    - If a field value does not match the expected format of a date or time field

### Examples

// Set the value of a single line with field ID 10

await LFForm.setFieldValues({ fieldId: 10 }, "hello"); // will set the field to "hello".

// Set the value of a checkbox field

await LFForm.setFieldValues({ fieldId: 15 }, { value: ["Option1", "Option2"] })

// Set the value a field in a table or collection with 3 rows, where each row has a single line with field ID 10

// Sets every row to "a"

LFForm.setFieldValues({fieldId: 10}, "a");

// Sets the first row to "hello"

LFForm.setFieldValues({fieldId: 10, index: 0}, "hello");

// Sets the first row to "1", second row to "2" and third row to "3"

LFForm.setFieldValues({fieldId: 10}, ["1", "2", "3"]);

### showFields

- **Description:** Shows the specified fields. This function can affect [table/collection row/set templates](https://doc.laserfiche.com/laserfiche.documentation/en-us/Subsystems/ProcessAutomation/Content/Forms-Current/Javascript-and-CSS/TheLFFormObject.htm#Table/Co).
- **Signature:** LFForm.showFields(id): Promise<LFFormPromiseResponse>
- **Parameters:**
    - **id**
        - **Type:** IdentificationObject | IdentificationObject[] | …IdentificationObject
        - **Description:** The field identification object or array of identification objects to display. This can be a single identification object, an array of identification objects, or multiple identification object parameters
        - **Example:**
            
            { variableName: "First_Name" }
            
            [{ variableName: "First_Name" }, { variableName: "Last_Name" }]
            
- **Returns:**
    - **Type:** Promise<LFFormPromiseResponse>
    - **Description:** A promise that resolves after the fields are displayed or errors are returned.

### Examples

// Show a single field with an ID of 10

await LFForm.showFields({ fieldId: 10 });

// Show the second and fourth rows or sets in the table or collection with an array

await LFForm.showFields([{ fieldId: 3, index: 1 }, { fieldId: 3, index: 3 }]);

// Show multiple fields using multiple parameters

await LFForm.showFields({ fieldId: 3, index: 1 }, { fieldId: 3, index: 3 });

### hideFields

- **Description:** Hides the specified fields. This function can affect [table/collection row/set templates](https://doc.laserfiche.com/laserfiche.documentation/en-us/Subsystems/ProcessAutomation/Content/Forms-Current/Javascript-and-CSS/TheLFFormObject.htm#Table/Co).
- **Signature:** LFForm.hideFields(id): Promise<LFFormPromiseResponse>
- **Parameters**:
    - **id**
        - **Type:** IdentificationObject | IdentificationObject[] | …IdentificationObject
        - **Description:** An identification object or array of identification objects. You can specify multiple objects for this function.
- **Returns:**
    - **Type:** Promise<LFFormPromiseResponse>
    - **Description:** A promise that resolves after the fields are hidden or errors are returned.

### Examples

// Hide a single field with an ID of 10

LFForm.hideFields({ fieldId: 10 });

// Hide the second and fourth rows or sets in the table or collection with an array

LFForm.hideFields([{ fieldId: 3, index: 1 }, { fieldId: 3, index: 3 }]);

// Hide multiple fields using multiple parameters

LFForm.hideFields({ fieldId: 3, index: 1 }, { fieldId: 3, index: 3 });

disableFields

Disables the specified fields. This function can affect [table/collection row/set templates](https://doc.laserfiche.com/laserfiche.documentation/en-us/Subsystems/ProcessAutomation/Content/Forms-Current/Javascript-and-CSS/TheLFFormObject.htm#Table/Co).

- Signature: LFForm.disableFields(id (, id2, id3...))
- Input:
    - id: An identification object or array of identification objects. You can specify multiple objects for this function.
- Output:
    - A promise that resolves after fields are disabled or errors are returned.

Examples:

- LFForm.disableFields({fieldId: 10});
- LFForm.disableFields([{fieldId: 3, index: 1}, {fieldId: 3, index: 3}]);
- LFForm.disableFields({fieldId: 3, index: 1}, {fieldId: 3, index: 3});

enableFields

Enables the specified fields. This function can affect [table/collection row/set templates](https://doc.laserfiche.com/laserfiche.documentation/en-us/Subsystems/ProcessAutomation/Content/Forms-Current/Javascript-and-CSS/TheLFFormObject.htm#Table/Co).

- Signature: LFForm.enableFields(id (, id2, id3...))
- Input:
    - id: An identification object or array of identification objects. You can specify multiple objects for this function.
- Output:
    - A promise that resolves after fields are enabled or errors are returned.

Examples:

- LFForm.enableFields({fieldId: 10});
- LFForm.enableFields([{fieldId: 3, index: 1}, {fieldId: 3, index: 3}]);
- LFForm.enableFields({fieldId: 3, index: 1}, {fieldId: 3, index: 3});

changeFieldSettings

Changes settings on the specified fields. This function can affect [table/collection row/set templates](https://doc.laserfiche.com/laserfiche.documentation/en-us/Subsystems/ProcessAutomation/Content/Forms-Current/Javascript-and-CSS/TheLFFormObject.htm#Table/Co).

- Signature: LFForm.changeFieldSettings(id, settingChanges)
- Input:
    - id: An identification object or array of identification objects.
    - settingChanges: An object with the property to change as the key and the value to change to as the value.

Currently supported properties (keys):

- label: Change the field label. Accepts a string. Also supports table column labels and page names.
- description (alias: textAbove): Change the field description. Accepts a string.
- subtext (alias: textBelow): Change the field subtext. Accepts a string.
- tooltip: Change the field tooltip. Accepts a string.
- placeholder: Change the field placeholder. Accept a string.
- autoCompleteValues: Only for Single Line fields. Change the auto complete dropdown options. Accepts an array of strings.
- content (alias: default, HTMLContent): Only for Custom HTML fields. Change the content of custom HTML. Accepts a string.
- CSSClasses (alias: cssClasses, classNames): Change the field CSS classes. Accepts a string or an array of strings. You can specify multiple CSS classes with a space-separated string.
- buttonLabel (alias: signButtonLabel, uploadButtonLabel): Only for File Upload and Signature fields. Change the button label. Accepts a string
- rowLabels (alias: addButtonLabel, addRowButtonLabel, addSetButtonLabel): Only for Table fields. Changes the row labels. If fixed row count, accepts an array of strings. If dynamic row count, Accepts a string.
- addButtonLabel (alias: addRowButtonLabel, addSetButtonLabel): Only for Table and Collection fields. Changes the add row/set label. Accepts a string. Still supports {n} dynamic numbering
- prevButton: Only for Page fields. Changes the previous button label. Accepts a string.
- nextButton: Only for Page fields. Changes the next button label. Accepts a string.
- addressOptions: Only for Address fields. Changes the address sub labels and its visibility. Accepts an array of object with this format: {subField: "address1", label: "New Label", show: true}

Note: subField expects a string with "address1", "address2", "city", "country", "province" and/or "zipcode" properties.

- Output:
    - A promise that resolves after settings changes have been applied or errors are returned

Examples:

- LFForm.changeFieldSettings( {fieldId: 10}, {label: "New Label", description: "New Description", subtext: "New Subtext", tooltip: "New Tooltip", placeholder: "New Placeholder"} );
- LFForm.changeFieldSettings( [{variableName: "Single_Line"}, {variableName: "Single_Line_1"}], {autoCompleteValues: ["one", "two", "three"]} );
- LFForm.changeFieldSettings( {fieldId: 12}, {content: "<a src='https://www.laserfiche.com'>Laserfiche</a>"} );
- LFForm.changeFieldSettings({fieldId: 10}, {CSSClasses: "red solidBorder"});
- LFForm.changeFieldSettings({fieldId: 10}, {CSSClasses: ["blue", "noBorder"]});
- LFForm.changeFieldSettings( {fieldId: 10}, {buttonLabel: "Upload"} );
- LFForm.changeFieldSettings( {fieldId: 10}, {rowLabels: ["First {n}", "Second {n}", "Third {n}"]} );
- LFForm.changeFieldSettings( {fieldId: 10}, {rowLabels: "Row {n}"} );
- LFForm.changeFieldSettings( {fieldId: 10}, {addButtonLabel: "+ Add Row"} );
- LFForm.changeFieldSettings( {fieldId: 10}, {label: "First Page", prevButton: "Back", nextButton: "Forward"} );
- LFForm.changeFieldSettings( {fieldId: 10}, {addressOptions: [{subField: "address1", label: "Address"}, {subField: "address2", show: false}, {subField: "city", label: "City"}, {subField: "province", label: "State"}, {subField: "zipcode", label: "Zip Code", show: true}, {subField: "country", show: false}]} );

changeFormSettings

Change the settings on the form.

- Signature: LFForm.changeFormSettings(changes)
- Input:
    - changes: An object with the property to change as the key and the value to change to as value.

Currently supported properties (keys):

- title: Change the form title. Accepts a string.
- description: Change the form description. Accepts a string.
- pagination: Change the page label and previous/next button labels. Accepts an array of objects in the following format { pageId: 1, label: "First Page", prevButton: "Back", nextButton: "Forward" }
- Output:
    - A promise that resolves after the form settings changes have been applied or errors are returned.

Examples:

- LFForm.changeFormSettings({title: "New Form Title", description: "New Form Description"});
- LFForm.changeFormSettings({pagination: [{pageId: 1, label: "First Page"}, {pageId: 2, label: "Second Page", prevButton: "Back", nextButton: "Forward"}]});

changeActionButton

Change the label of a single action button. Buttons include the Submit, Approve, and Reject submission actions, the Save as Draft button, and user defined custom submission action buttons on forms used by message start events and user tasks.

- Signature: LFForm.changeActionButton(button, changes)
- Input:
    - button: A string that identifies the button by the Button CSS Class defined in the [user task settings](https://doc.laserfiche.com/laserfiche.documentation/en-us/Subsystems/ProcessAutomation/Content/Forms-Current/User-Tasks.htm) Form tab.

Currently supported class names:

- Submit
- Approve
- Reject
- SaveAsDraft
- User defined submission action button class names
- changes: An object with attributes to change.

Currently supported properties (keys):

- label: Option label. Accepts a string.
- Output:
    - A promise that resolves after the change to the action button has been applied or errors are returned.

Example:

- LFForm.changeActionButton("Submit", {label: "New Submit"});

changeActionButtons

Change the label of a list of action buttons. Buttons include the Submit, Approve, and Reject submission actions, the Save as Draft button, and user defined custom submission action buttons on forms used by message start events and user tasks.

- Signature: LFForm.changeActionButtons(changes)
- Input:
    - changes: An array of objects with attributes to change.

Currently supported keys:

- action: A string that identifies the button by the Button CSS Class defined in the [user task settings](https://doc.laserfiche.com/laserfiche.documentation/en-us/Subsystems/ProcessAutomation/Content/Forms-Current/User-Tasks.htm) Form tab.

Currently supported class names:

- Submit
- Approve
- Reject
- SaveAsDraft
- User defined submission action button class names
- label: Option label. Accepts a string.
- Output:
    - A promise that resolves after the changes to action buttons have been applied or errors are returned.

Example:

- LFForm.changeActionButtons([{action: "Submit", label: "New Submit"}, {action: "Approve", label: "New Approve"}]);

addRow, addSet

Adds new rows or sets to a table or collection.

- Signature: LFForm.addRow(id, count); LFForm.addSet(id, count);
- Input:
    - id: An identification object or array of identification objects. Only tables or collections can be targetted for these APIs.
    - count: The number of rows or sets to add.
- Output:
    - A promise that resolves after the rows or sets have been added.

Examples:

- LFForm.addRow({variableName: "Expense_Table"}, 3);
- LFForm.addSet({variableName: "Info_Collection"}, 2);

deleteRow, deleteSet

Deletes the specified rows or sets from a table or collection.

- Signature: LFForm.deleteRow(id, index (, index2, index3...)); LFForm.deleteSet(id, index (, index2, index3...));
- Input:
    - id: An identification object or array of identification objects. Only tables or collections can be targetted for these APIs.
    - index: The index of the row or set to remove. The index starts at 0. You can specify multiple indices.
- Output:
    - A promise that resolves after the rows or sets have been deleted.

Examples:

- LFForm.deleteRow({variableName: "Expense_Table"}, 0); // Deletes the first row of Expense_Table.
- LFForm.deleteSet({variableName: "Info_Collection"}, 0, 1, 2); // Deletes the first 3 sets of the Info_Collection.

addCSSClasses

Adds CSS classes to the specified fields. This function can affect [table/collection row/set templates](https://doc.laserfiche.com/laserfiche.documentation/en-us/Subsystems/ProcessAutomation/Content/Forms-Current/Javascript-and-CSS/TheLFFormObject.htm#Table/Co).

- Signature: LFForm.addCSSClasses(id, CSSClasses)
- Input:
    - id: An identification object or array of identification objects.
    - CSSClasses: The CSS classes to add. Can be a string or an array of strings. You can specify multiple CSS Classes with a space-separated string.
- Output:
    - A promise that resolves after the CSSClasses have been added.

Examples:

- LFForm.addCSSClasses({fieldId: 1}, "red"); // adds class "red" to fields with fieldId 1.
- LFForm.addCSSClasses([{fieldId: 1}, {fieldId: 2}], "red solidBorder"); // adds classes "red" and "solidBorder" to fields with fieldId 1 and 2.
- LFForm.addCSSClasses([{fieldId: 1}, {fieldId: 2}], ["red", "solidBorder"]); // adds classes "red" and "solidBorder" to fields with fieldId 1 and 2.

Note: Adding CSS classes that were already on the field will not add duplicate classes.

removeCSSClasses

Removes the specified CSS classes from the specified fields. This function can affect [table/collection row/set templates](https://doc.laserfiche.com/laserfiche.documentation/en-us/Subsystems/ProcessAutomation/Content/Forms-Current/Javascript-and-CSS/TheLFFormObject.htm#Table/Co).

- Signature: LFForm.removeCSSClasses(id, CSSClasses)
- Input:
    - id: An identification object or array of identification objects.
    - CSSClasses: The CSS classes to remove. Can be a string or an array of strings. You can specify multiple CSS Classes with a space-separated string.
- Output:
    - A promise that resolves after CSSClasses have been removed.

Examples:

- LFForm.removeCSSClasses({fieldId: 1}, "red"); // removes class "red" from fields with fieldId 1.
- LFForm.removeCSSClasses([{fieldId: 1}, {fieldId: 2}], "red solidBorder"); // removes classes "red" and "solidBorder" from fields with fieldId 1 and 2.
- LFForm.removeCSSClasses([{fieldId: 1}, {fieldId: 2}], ["red", "solidBorder"]); // removes classes "red" and "solidBorder" from fields with fieldId 1 and 2.

Note: Attempting to remove CSS classes that were not on the field will be ignored.

findFields

Finds any fields that satisfy the specified arbitrary conditions.

- Signature: LFForm.findFields(predicate)
- Input:
    - predicate: A function that takes in the field State and should return true for fields you want to find, and false for fields you don't want to find.
- Output:
    - An array of fields that satisfy the predicate.

Examples:

- LFForm.findFields(f => f.settings.label === "First Name"); // Finds all fields whose label is "First Name".
- LFForm.findFields(f => f.settings.required); // Finds all required fields.

findFieldsByClassName

Finds fields with the specified CSS class.

- Signature: LFForm.findFieldsByClassName(className)
- Input:
    - className: The CSS class that is assigned to the fields you want to find.
- Output:
    - An array of fields with the specified CSS class.

Example:

LFForm.findFieldsByClassName("blue");

findFieldsByFieldId

Finds the fields with the specified field ID.

- Signature: LFForm.findFieldsByFieldId(fieldId)
- Input:
    - fieldId: The field ID of the fields you want to find.
- Output:
    - An array of fields with specified field ID.

Example:

LFForm.findFieldsByFieldId(2);

findFieldsByVariableName

Finds the fields with the specified variable name.

- Signature: LFForm.findFieldsByVariableName(variableName)
- Input:
    - variableName: The variable name of the fields you want to find.
- Output:
    - An array of fields with the specified variable name.

Example:

LFForm.findFieldsByVariableName("Single_Line");

findFieldsByVariableId

Finds the fields with the specified variable ID.

- Signature: LFForm.findFieldsByVariableId(variableId)
- Input:
    - variableId: The variable ID of the fields you want to find.
- Output:
    - An array of fields with the specified variable ID.

Example:

LFForm.findFieldsByVariableId("90e0b201-5268-4ace-9f65-8ac32d12b58a");

subscribe

Subscribe to an event for a specific field.

- Signature: LFForm.subscribe(eventName, handler, options)
- Input:
    - eventName: The name of the event. Currently supports "formSubmission", "fieldChange", "fieldBlur", "lookupTrigger", and "lookupDone" events.
    - handler: The function to call when events are triggered.
    - options: An identification object to identify the field to subscribe to. You could also add "handlerName" in the object to more easily identify the handler.
- Output: none

Examples:

- LFForm.subscribe("fieldChange", () => { console.log("change"); }, {variableName: "Single_Line"});
- LFForm.subscribe("formSubmission", () => { console.log("submitting"); }, {handlerName: "printSubmission"})

unsubscribe

Unsubscribe from events.

- Signature: LFForm.unsubscribe(eventName, options)
- Input:
    - eventName: The name of the event. Currently supports "formSubmission", "fieldChange", "fieldBlur", "lookupTrigger", and "lookupDone" events.
    - options: An identification object to identify the handler.
- Output: none

Examples:

- LFForm.unsubscribe("fieldChange", {variableName: "Single_Line"});
- LFForm.subscribe("formSubmission", {handlerName: "printSubmission"});

onFormSubmission

Subscribe to the formSubmission event.

- Signature: LFForm.onFormSubmission(handler, options)
- Input:
    - handler: The function to call when a submission is triggered. To block a submission, return an object with an error property describing the error message. This function can optionally return a promise that resolves with the error object. The promise will be awaited before submission automatically.
        - The handler takes in an event argument that contains the user’s intended submission action in the data.action property.
    - options: Optional. Can be used to specify the handler name. For example, {handlerName: "submissionHandler1"}
- Output: none

Examples:

- LFForm.onFormSubmission(function () {
    
    if (LFForm.getFieldValues({fieldId: 3}) === "ERROR") {
    
    return {error: "Please fix the error before submitting."};
    
    }
    
    });
    
- LFForm.onFormSubmission(async function (event) {
    
    // Get the value of the clicked submission button
    
    const userAction = event.data.action.value;
    
    const approvalComments = LFForm.getFieldValues({ fieldId: 2});
    
    if (userAction === "Reject" && approvalComments === "") {
    
    await LFForm.showFields({ fieldId: 2 });
    
    return {error: "Please add comments in order to approve."};
    
    } else {
    
    await LFForm.hideFields({ fieldId: 2 });
    
    }
    
    });
    

Note: If the handler returns an object with an "error" property (for example {error: "There is something wrong on the form. Cannot submit."}), the submission is stopped and the error will be displayed as a popup message on the page.

onFieldChange

Subscribe to the change event for the specified fields.

- Signature: LFForm.onFieldChange(handler, options)
- Input:
    - handler: The function to call when a specific field changes.
    - options: An object that identifies the field to subscribe to and to specify the handlerName if needed.
- Output: none

Example:

LFForm.onFieldChange(() => console.log("change"), {variableName: "Single_Line"});

onFieldBlur

Subscribe to the blur event for the specified fields.

- Signature: LFForm.onFieldBlur(handler, options);
- Input:
    - handler: The function to call when a specific field blurs.
    - options: An object that identifies the field to subscribe to and to specify the handlerName if needed.
- Output: none

Example:

LFForm.onFieldBlur(() => console.log("blur"), {variableName: "Single_Line"});

onLookupTrigger

Subscribe to a lookup trigger event.

- Signature: LFForm.onLookupTrigger(handler, options)
- Input:
    - handler: The function to call when a lookup is triggered.
    - options: An object that identifies which lookup rule this handler would be called for and to specify the handlerName if needed.
- Output: none

Example:

LFForm.onLookupTrigger(function () {

if (LFForm.getFieldValues({variableName: "TriggerField"}) === "NoCall") {

return {cancelLookup: true};

}

}, {lookupRuleId: 3}); // When lookup rule 3 is triggered,

// if field with variable name "TriggerField" has value of "NoCall",

// cancel the lookup call.

Note: if the handler returns an object with the "cancelLookup" property set to true, the lookup call will be canceled.

onLookupDone

Subscribe to the lookup done event.

- Signature: LFForm.onLookupDone(handler, options)
- Input:
    - handler: The function to call when a lookup is triggered.
    - options: An object that identifies which rule this handler would be called for and to specify the handlerName if needed.
- Output: none

Example:

LFForm.onLookupDone(function () {

if (LFForm.getFieldValues({variableName: "Lookup_Target"}) === "Hello") {

LFForm.setFieldValues({variableName: "Lookup_Target_AutoComplete"}, "World!");

}

}, {lookupRuleId: 2}); // after lookup rule 2 is done, check for Lookup_Target value.

// If it is "Hello", set the Lookup_Target_AutoComplete to "World!"

Note: The rule ID refers to the rule's number in the Rules pane. For instance, "Rule 1" has an ID of 1, "Rule 2" has an ID of 2.