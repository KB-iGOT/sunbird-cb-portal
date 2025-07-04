import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { UserProfileService } from '../../../user-profile/services/user-profile.service';
import _ from 'lodash'
import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'ws-app-custom-fields',
  templateUrl: './custom-fields.component.html',
  styleUrls: ['./custom-fields.component.scss']
})
export class CustomFieldsComponent implements OnDestroy {

  editCustomDetails = false
  customAttrList: any = []
  customAttrForm: any = {}
  customFieldValues: any = []
  customAttrListIds: any = []

  hierarchyFields: { [key: string]: string[] } = {}
  fieldOptions: { [key: string]: { [field: string]: any[] } } = {}
  masterListFormGroups: { [key: string]: FormGroup } = {}

  // For tracking which data structure to use
  useReversedData: { [key: string]: boolean } = {}

  userId: string = ''
  orgId: string = ''
  currentUser: any = {}

  private dropdownSubscriptions: { [key: string]: any } = {}


  constructor(private fb: FormBuilder,
    private userProfileService: UserProfileService,
    private configService: ConfigurationsService,
    private matSnackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.currentUser = this.configService && this.configService.userProfile
    console.log('Current User', this.currentUser)
    this.userId = this.currentUser.userId || ''
    this.orgId = this.currentUser.rootOrgId || ''
    //this.orgId = "0140788510336040962"

    this.getOrgDetails()

  }

  getOrgDetails() {
    const request = {
      request: { organisationId: this.orgId },
    }
    this.userProfileService.readOrgData(request).subscribe((res: any) => {
      this.customAttrListIds = _.get(res, 'result.response.customfieldsdata.customFieldIds', [])
      if (this.customAttrListIds && this.customAttrListIds.length) {
        this.getCustomAttributes()
      }
    }, error => {
      console.error('Error fetching organization details', error)
    })
  }

  getCustomAttributes(): void {
    let payload = {
      filterCriteriaMap: {
        organisationId: this.orgId,
        //organisationId: "0140788510336040962",
        isEnabled: true,
        customFieldId: this.customAttrListIds,
      },

      pageNumber: 0,
      pageSize: 50,
      orderDirection: "DESC",
      orderBy: 'updatedOn',
      facets: []
    }
    this.userProfileService.fetchCustomFields(payload).subscribe((res: any) => {
      this.customAttrList = _.get(res, 'result.searchResults.data', [])
      if (this.customAttrList && this.customAttrList.length > 0) {
        this.readCustomattributeDetails()
      }
    }, error => {
      console.log('Error', error)
    })

  }


  readCustomattributeDetails() {
    this.userProfileService.readCustomattributeDetails(this.userId, this.orgId).subscribe((res: any) => {
      this.customFieldValues = _.get(res, 'result.response.customFieldValues', [])
    }, error => {
      console.log('Error', error)
    })
  }

  getValue(attributeName: string) {
    const customField = this.customFieldValues.find((item: any) => item.attributeName === attributeName);
    return customField ? customField.value : '';
  }

  getListItemName(arryListItem: any, listItem: any) {
    const customField = this.customFieldValues.find((_filed: any) => _filed.attributeName === arryListItem.attributeName)
    if (customField && customField.values && customField.values.length) {
      const _item = customField.values.find((_filed: any) => _filed.attributeName.toLocaleLowerCase() === listItem.name.toLocaleLowerCase())
      return _item ? _item.value : ''
    }
    return ''
  }

  getName(attributeName: string) {
    return this.customAttrList.find((item: any) => item.attributeName === attributeName)?.name || attributeName;
  }

  cancelCustomFormRequest() {
    this.editCustomDetails = false;

    // Clear all fields properly
    Object.keys(this.hierarchyFields).forEach(fieldName => {
      this.resetField(fieldName);
    });

    this.customAttrForm.reset();
  }

  buildDynamicForm() {
    // Clear previous form state
    if (this.customAttrForm) {
      // Remove all controls from previous form
      Object.keys(this.masterListFormGroups).forEach(fieldName => {
        this.customAttrForm.removeControl(`${fieldName}_group`);
      });
    }

    const formControls: { [key: string]: any } = {};
    const activeFields = this.customAttrList.filter((field: any) => field.isActive);

    // Reset tracking objects
    this.hierarchyFields = {};
    this.fieldOptions = {};
    this.masterListFormGroups = {};
    this.useReversedData = {};

    activeFields.forEach((field: any) => {
      const validators = [];
      if (field.isMandatory) {
        validators.push(Validators.required);
      }
      if (field.validation) {
        validators.push(Validators.pattern(new RegExp(field.validation)));
      }

      if (field.type === 'text') {
        // Simple text field
        formControls[field.attributeName] = ['', validators];
      } else if (field.type === 'masterList') {
        // For masterList fields, create a nested FormGroup with controls for each level
        const nestedFormControls: { [key: string]: any } = {};

        // Determine whether to use regular or reversed data
        this.useReversedData[field.attributeName] = this.shouldUseReversedData(field);
        const dataSource = this.getDataSource(field);

        if (dataSource && dataSource.length > 0) {
          // Extract hierarchy fields (e.g., country, state, city)
          const hierarchy = this.extractHierarchyFields(dataSource, this.useReversedData[field.attributeName]);

          // Check for duplicates
          const uniqueItems = new Set(hierarchy);
          if (uniqueItems.size !== hierarchy.length) {
            console.warn(`Duplicate fields detected in hierarchy for ${field.attributeName}:`, hierarchy);
            // Remove duplicates
            this.hierarchyFields[field.attributeName] = Array.from(uniqueItems);
          } else {
            this.hierarchyFields[field.attributeName] = hierarchy;
          }

          // Initialize options map for this field
          this.fieldOptions[field.attributeName] = {};

          // Set top-level options
          if (hierarchy.length > 0) {
            const topField = hierarchy[0];
            this.fieldOptions[field.attributeName][topField] =
              this.extractOptionsForField(dataSource, topField, this.useReversedData[field.attributeName]);
          }

          // Create form controls for each level in the hierarchy
          hierarchy.forEach(hierarchyField => {
            nestedFormControls[hierarchyField] = ['', field.isMandatory ? [Validators.required] : []];
          });

          // Create the nested form group
          const nestedGroup = this.fb.group(nestedFormControls);
          this.masterListFormGroups[field.attributeName] = nestedGroup;

          // Add a control for the main field to store combined value
          formControls[field.attributeName] = ['', validators];
        } else {
          // Fallback if no custom data is available
          formControls[field.attributeName] = ['', validators];
        }
      }
    });

    this.customAttrForm = this.fb.group(formControls);

    // Add the nested form groups to the main form
    Object.keys(this.masterListFormGroups).forEach(fieldName => {
      const nestedGroup = this.masterListFormGroups[fieldName];
      this.customAttrForm.addControl(`${fieldName}_group`, nestedGroup);

      // Set up change listeners for cascading dropdowns
      this.setupCascadingDropdownListeners(fieldName);
    });

    // After setting up the form and listeners
    Object.keys(this.hierarchyFields).forEach(fieldName => {
      // Load all options
      this.loadAllOptions(fieldName);
    });

    // Debug form structure
    console.log("Form controls:", Object.keys(this.customAttrForm.controls));
    Object.keys(this.hierarchyFields).forEach(fieldName => {
      console.log(`Hierarchy for ${fieldName}:`, this.hierarchyFields[fieldName]);
      console.log(`Form group controls for ${fieldName}:`,
        Object.keys(this.customAttrForm.get(`${fieldName}_group`).controls));
    });
  }

  // Determine whether to use reversed data
  shouldUseReversedData(field: any): boolean {
    // Add null check
    if (!field) return false;

    // Check if reversedOrderCustomFieldData exists and has items
    if (field.reversedOrderCustomFieldData && field.reversedOrderCustomFieldData.length > 0) {
      return true;
    }
    return false;
  }

  // Get the appropriate data source for a field
  getDataSource(field: any): any[] {
    // Add null check
    if (!field) return [];

    if (this.shouldUseReversedData(field)) {
      return field.reversedOrderCustomFieldData || [];
    } else {
      return field.customFieldData || [];
    }
  }

  // Extract the hierarchy fields from the data structure to support 5 levels
  extractHierarchyFields(data: any[], isReversed: boolean): string[] {
    if (!data || data.length === 0) return [];

    // Use a Set to ensure uniqueness
    const hierarchySet = new Set<string>();
    const firstItem = data[0];

    if (isReversed) {
      // For reversed data (bottom-up), extract recursively
      const extractReversedFields = (item: any, currentDepth: number) => {
        if (!item || currentDepth > 5) return;

        if (item.fieldName) {
          hierarchySet.add(item.fieldName);
        }

        if (item.fieldValues && item.fieldValues.length > 0) {
          extractReversedFields(item.fieldValues[0], currentDepth + 1);

          // Also check second level of parents if it exists
          if (item.fieldValues[0].fieldValues && item.fieldValues[0].fieldValues.length > 0) {
            extractReversedFields(item.fieldValues[0].fieldValues[0], currentDepth + 2);
          }
        }
      };

      extractReversedFields(firstItem, 1);
      // Convert set to array and reverse to get correct order
      const hierarchy = Array.from(hierarchySet);
      return hierarchy.reverse();
    } else {
      // For regular data (top-down)
      const extractForwardFields = (item: any, currentDepth: number) => {
        if (!item || currentDepth > 5) return;

        if (item.fieldName) {
          hierarchySet.add(item.fieldName);
        }

        if (item.fieldValues && item.fieldValues.length > 0) {
          extractForwardFields(item.fieldValues[0], currentDepth + 1);
        }
      };

      extractForwardFields(firstItem, 1);
      return Array.from(hierarchySet);
    }
  }

  // Extract unique options for a specific field
  extractOptionsForField(data: any[], fieldName: string, isReversed: boolean): any[] {
    const uniqueOptions = new Map();

    if (isReversed) {
      // For reversed data, the top level will be the highest parent (e.g., country)
      // We need to find all unique countries by traversing up from each city
      data.forEach(item => {
        this.extractOptionsFromReversedData(item, fieldName, uniqueOptions);
      });
    } else {
      // For regular data, just extract the top-level field values
      data.forEach(item => {
        if (item.fieldName === fieldName) {
          uniqueOptions.set(item.fieldValue, {
            value: item.fieldValue,
            label: item.fieldValue,
            data: item
          });
        }
      });
    }

    return Array.from(uniqueOptions.values());
  }

  // Extract options from reversed data by traversing up the hierarchy
  extractOptionsFromReversedData(item: any, targetFieldName: string, uniqueOptions: Map<string, any>) {
    // Check if this item is the target field
    if (item.fieldName === targetFieldName) {
      uniqueOptions.set(item.fieldValue, {
        value: item.fieldValue,
        label: item.fieldValue,
        data: item
      });
      return;
    }

    // If not, check its parent fields
    if (item.fieldValues && item.fieldValues.length > 0) {
      item.fieldValues.forEach((parentItem: any) => {
        this.extractOptionsFromReversedData(parentItem, targetFieldName, uniqueOptions);

        // Also check the parent's parents
        if (parentItem.fieldValues && parentItem.fieldValues.length > 0) {
          parentItem.fieldValues.forEach((grandparentItem: any) => {
            this.extractOptionsFromReversedData(grandparentItem, targetFieldName, uniqueOptions);
          });
        }
      });
    }
  }

  // Set up listeners for cascading dropdowns (up to 5 levels)
  setupCascadingDropdownListeners(fieldName: string) {
    const hierarchy = this.hierarchyFields[fieldName];
    const formGroup = this.masterListFormGroups[fieldName];
    const isReversed = this.useReversedData[fieldName];

    if (!hierarchy || !formGroup) return;

    // Handle special case for single-level dropdown
    if (hierarchy.length === 1) {
      const singleField = hierarchy[0];
      formGroup.get(singleField)?.valueChanges.subscribe(value => {
        console.log(`Single field ${singleField} changed to ${value}`);
        // Just update the combined value for single fields
        this.updateCombinedValue(fieldName);
      });
      return; // Exit early for single fields
    }

    console.log(`Setting up cascade listeners for ${fieldName}, levels: ${hierarchy.length}`);

    // For each level except the last one
    for (let i = 0; i < hierarchy.length - 1; i++) {
      const parentField = hierarchy[i];
      const childField = hierarchy[i + 1];

      // Listen to changes on the parent field to update child options
      formGroup.get(parentField)?.valueChanges.subscribe(value => {
        if (value) {
          console.log(`${parentField} changed to ${value}, updating ${childField} options`);
          // Update options for the child field
          this.updateChildOptions(fieldName, parentField, value, childField, isReversed);

          // Important: Clear all fields below this one
          for (let j = i + 2; j < hierarchy.length; j++) {
            const grandchildField = hierarchy[j];
            console.log(`Clearing ${grandchildField} due to ${parentField} change`);
            formGroup.get(grandchildField)?.setValue('');
            this.fieldOptions[fieldName][grandchildField] = [];
          }
        } else {
          // Reset child field and its options
          formGroup.get(childField)?.setValue('');
          this.fieldOptions[fieldName][childField] = [];

          // Also reset all fields below this one
          for (let j = i + 2; j < hierarchy.length; j++) {
            const grandchildField = hierarchy[j];
            formGroup.get(grandchildField)?.setValue('');
            this.fieldOptions[fieldName][grandchildField] = [];
          }
        }

        // Update the combined value
        this.updateCombinedValue(fieldName);
      });
    }

    // For the last field, just update combined value when it changes
    const lastField = hierarchy[hierarchy.length - 1];
    formGroup.get(lastField)?.valueChanges.subscribe(() => {
      this.updateCombinedValue(fieldName);
    });
  }

  // Update options for a child field based on parent selection
  updateChildOptions(fieldName: string, parentField: string, parentValue: string, childField: string, isReversed: boolean) {
    const field = this.customAttrList.find((f: any) => f.attributeName === fieldName);
    if (!field) {
      console.warn(`Field not found: ${fieldName}`);
      return;
    }

    const dataSource = this.getDataSource(field);
    if (!dataSource || dataSource.length === 0) {
      console.warn(`No data source for field: ${fieldName}`);
      return;
    }

    // Reset the child field
    const formGroup = this.masterListFormGroups[fieldName];
    if (!formGroup) {
      console.warn(`No form group for field: ${fieldName}`);
      return;
    }

    // Verify child field exists in form
    if (!formGroup.get(childField)) {
      console.warn(`Child field control not found: ${childField} in ${fieldName}`);
      return;
    }

    // Reset child field value
    formGroup.get(childField)?.setValue('', { emitEvent: false });

    console.log(`Finding options for ${childField} based on ${parentField}=${parentValue}`);

    // Find child options based on parent selection
    const options = isReversed ?
      this.findChildOptionsFromReversedData(dataSource, parentField, parentValue, childField) :
      this.findChildOptions(dataSource, parentField, parentValue, childField);

    console.log(`Found ${options.length} options for ${childField}`);

    // Store the options
    this.fieldOptions[fieldName][childField] = options;

    // Also reset any grandchild fields
    const hierarchy = this.hierarchyFields[fieldName];
    const childIndex = hierarchy.indexOf(childField);

    if (childIndex >= 0 && childIndex < hierarchy.length - 1) {
      const grandchildField = hierarchy[childIndex + 1];
      formGroup.get(grandchildField)?.setValue('', { emitEvent: false });
      this.fieldOptions[fieldName][grandchildField] = [];
    }
  }

  // Find child options based on parent selection (for regular data)
  findChildOptions(data: any[], parentField: string, parentValue: string, childField: string): any[] {
    const options = new Map();

    // For top-level parent (e.g., country)
    data.forEach(item => {
      if (item.fieldName === parentField && item.fieldValue === parentValue && item.fieldValues) {
        // This is the parent, extract its children
        item.fieldValues.forEach((childItem: any) => {
          if (childItem.fieldName === childField) {
            options.set(childItem.fieldValue, {
              value: childItem.fieldValue,
              label: childItem.fieldValue,
              data: childItem
            });
          }
        });
      }
    });

    return Array.from(options.values());
  }

  // Find child options based on parent selection (for reversed data)
  findChildOptionsFromReversedData(data: any[], parentField: string, parentValue: string, childField: string): any[] {
    const options = new Map();

    // For reversed data, we need a different approach
    data.forEach(item => {
      // Look for items whose parent matches our criteria
      if (item.parentFieldName === parentField && item.parentFieldValue === parentValue &&
        item.fieldName === childField) {
        options.set(item.fieldValue, {
          value: item.fieldValue,
          label: item.fieldValue,
          data: item
        });
      }

      // Also search through the item's hierarchy
      if (item.fieldValues) {
        this.searchNestedItemsForChildOptions(
          item.fieldValues, parentField, parentValue, childField, options
        );
      }
    });

    return Array.from(options.values());
  }

  // Search through nested items for child options
  searchNestedItemsForChildOptions(
    items: any[],
    parentField: string,
    parentValue: string,
    childField: string,
    options: Map<string, any>
  ) {
    items.forEach(item => {
      // Check if this item is the child we're looking for
      if (item.parentFieldName === parentField &&
        item.parentFieldValue === parentValue &&
        item.fieldName === childField) {
        options.set(item.fieldValue, {
          value: item.fieldValue,
          label: item.fieldValue,
          data: item
        });
      }

      // Continue searching in nested items
      if (item.fieldValues) {
        this.searchNestedItemsForChildOptions(
          item.fieldValues, parentField, parentValue, childField, options
        );
      }
    });
  }

  // Update the combined value in the main form control
  updateCombinedValue(fieldName: string) {
    const field = this.customAttrList.find((f: any) => f.attributeName === fieldName);
    const formGroup = this.masterListFormGroups[fieldName];
    const hierarchy = this.hierarchyFields[fieldName];

    if (!field || !formGroup || !hierarchy) return;

    // Collect selected values
    const selectedValues: { [key: string]: string } = {};
    const displayValues: string[] = [];

    hierarchy.forEach(hierarchyField => {
      const value = formGroup.get(hierarchyField)?.value;
      if (value) {
        selectedValues[hierarchyField] = value;
        displayValues.push(value);
      }
    });

    // Update the main form control with combined value
    const combinedValue = displayValues.join(', ');
    this.customAttrForm.get(fieldName)?.setValue(combinedValue);

    // Store the structured data for later use
    field.selectedValues = selectedValues;
  }

  // Handle edit mode - populating existing values
  populateFormWithExistingValues() {
    // First, create a map for quick lookup
    const customFieldMap: { [attributeName: string]: any } = {};
    this.customFieldValues.forEach((item: any) => {
      customFieldMap[item.attributeName] = item;
    });

    this.customAttrList.forEach((field: any) => {
      const customField = customFieldMap[field.attributeName];

      if (!customField) {
        console.log(`No custom field value found for ${field.attributeName}`);
        return;
      }

      if (field.type === 'text') {
        // For text fields, just set the value directly
        field.value = customField.value; // Store for reference
        this.customAttrForm.get(field.attributeName)?.setValue(customField.value);

      } else if (field.type === 'masterList' && customField.values && customField.values.length > 0) {
        // For masterList fields, extract the values from the hierarchy levels
        const selectedValues: { [key: string]: string } = {};

        // Convert the array of values to a map for easier access
        const valuesByAttr: { [attributeName: string]: string } = {};
        customField.values.forEach((val: any) => {
          valuesByAttr[val.attributeName] = val.value;
        });

        // Map these to the hierarchy fields
        const hierarchy = this.hierarchyFields[field.attributeName];
        if (hierarchy) {
          hierarchy.forEach(hierarchyField => {
            if (valuesByAttr[hierarchyField]) {
              selectedValues[hierarchyField] = valuesByAttr[hierarchyField];
            }
          });

          // Store selected values on the field for later use
          field.selectedValues = selectedValues;

          // Now populate the form controls with these values
          this.populateHierarchicalValues(field);
        }
      }
    });
  }

  // Enhanced to handle up to 5 levels when populating values
  populateHierarchicalValues(field: any) {
    const hierarchy = this.hierarchyFields[field.attributeName];
    const formGroup = this.masterListFormGroups[field.attributeName];
    const isReversed = this.useReversedData[field.attributeName];

    if (!hierarchy || !formGroup || !field.selectedValues) {
      console.log(`Cannot populate values for ${field.attributeName}: missing data`);
      return;
    }

    // Temporarily disable ALL listeners to prevent cascade effects
    const subscriptions = this.disableValueChangeListeners(field.attributeName);

    try {
      // STEP 1: Pre-load all options for all levels first
      for (let i = 0; i < hierarchy.length; i++) {
        const currentField = hierarchy[i];

        if (i === 0) {
          // Top level already has options loaded
          continue;
        }

        // For each level, we need the parent level's selected value to load options
        const parentField = hierarchy[i - 1];
        const parentValue = field.selectedValues[parentField];

        if (parentValue) {

          // Load options for this level based on parent
          this.fieldOptions[field.attributeName][currentField] = isReversed
            ? this.findChildOptionsFromReversedData(this.getDataSource(field), parentField, parentValue, currentField)
            : this.findChildOptions(this.getDataSource(field), parentField, parentValue, currentField);
        } else {
          // If no parent value, load all possible options
          console.log(`Loading all options for ${currentField} (no parent value)`);
          this.fieldOptions[field.attributeName][currentField] =
            this.extractAllOptionsForField(this.getDataSource(field), currentField, isReversed);
        }
      }

      // STEP 2: Now set values in order from parent to child
      for (let i = 0; i < hierarchy.length; i++) {
        const currentField = hierarchy[i];
        const currentValue = field.selectedValues[currentField];

        if (currentValue) {
          formGroup.get(currentField)?.setValue(currentValue, { emitEvent: false });

          // After setting value, load options for next level if needed
          if (i < hierarchy.length - 1) {
            const nextField = hierarchy[i + 1];
            this.fieldOptions[field.attributeName][nextField] = isReversed
              ? this.findChildOptionsFromReversedData(this.getDataSource(field), currentField, currentValue, nextField)
              : this.findChildOptions(this.getDataSource(field), currentField, currentValue, nextField);
          }
        }
      }

      // STEP 3: Update combined value
      this.updateCombinedValue(field.attributeName);

    } catch (error) {
      console.error('Error populating hierarchical values:', error);
    } finally {
      // Re-enable listeners
      setTimeout(() => {
        this.restoreValueChangeListeners(field.attributeName, subscriptions);
      }, 200);
    }
  }

  // Handle form submission
  handleSaveCustomForm() {
    if (this.customAttrForm.invalid) {
      // Mark all form controls as touched to show validation errors
      Object.keys(this.customAttrForm.controls).forEach(key => {
        const control = this.customAttrForm.get(key);
        if (control instanceof FormGroup) {
          Object.keys(control.controls).forEach(nestedKey => {
            control.get(nestedKey)?.markAsTouched();
          });
        } else {
          control?.markAsTouched()
        }
      })
      return
    }
    let payload: any = []
    this.customAttrList.forEach((field: any) => {
      let data: any = {
        customFieldId: field.customFieldId,
        type: field.type,
        attributeName: field.attributeName
      }
      if (field.type === 'text') {
        data['value'] = this.customAttrForm.get(field.attributeName)?.value,
          payload.push(data)
      } else if (field.type === 'masterList') {
        let values: any = []
        this.hierarchyFields[field.attributeName].forEach((hierarchyField: any, index) => {
          values.push({
            attributeName: hierarchyField,
            value: field.selectedValues[hierarchyField],
            level: index + 1
          })
        })
        data['values'] = values
        payload.push(data)
      }
    })
    let requestPalyoud: any = {
      userId: this.userId,
      organisationId: this.orgId,
      customFieldValues: payload
    }
    this.userProfileService.updateCustomFields(requestPalyoud).subscribe((res: any) => {
      if (res && res.result && res.result.response && res.result.response === "success") {
        this.editCustomDetails = false
        this.customAttrForm.reset()
        this.getCustomAttributes()
        this.matSnackBar.open("Custom fields saved successfully")
      }
    }, error => {
      this.matSnackBar.open(error.error.params.errMsg)
      console.error('Error saving custom fields:', error.error.params.errMsg);
    })
  }

  // Update handleEditCustomDetails to build the form and populate values
  handleEditCustomDetails() {
    this.editCustomDetails = true
    this.buildDynamicForm();
    this.customAttrList.forEach((field: any) => {
      if (field.type === 'masterList') {
        field.selectedValues = {}; // Reset any previously stored values
      } else {
        field.value = ''; // Reset text field values
      }
    });
    this.populateFormWithExistingValues()
  }

  // Add this method to handle dropdown changes
  onDropdownChange(fieldName: string, hierarchyField: string, value: string, index: number) {
    if (!value) return;

    const hierarchy = this.hierarchyFields[fieldName];
    if (!hierarchy) return;

    const field = this.customAttrList.find((f: any) => f.attributeName === fieldName);
    if (!field) return;

    // Always update selected values first
    field.selectedValues = field.selectedValues || {};
    field.selectedValues[hierarchyField] = value;

    const isLastField = index === hierarchy.length - 1;
    const isSingleField = hierarchy.length === 1;

    console.log(`Dropdown changed: ${fieldName}, field: ${hierarchyField}, value: ${value}, index: ${index}, isLast: ${isLastField}`);

    // For single field dropdowns
    if (isSingleField) {
      this.updateCombinedValue(fieldName);
      return;
    }

    // For parent fields: update child options
    if (!isLastField) {
      const childField = hierarchy[index + 1];
      const isReversed = this.useReversedData[fieldName];

      // Update options for the immediate child
      this.updateChildOptions(fieldName, hierarchyField, value, childField, isReversed);

      // Clear all fields below the immediate child
      const formGroup = this.masterListFormGroups[fieldName];
      for (let i = index + 2; i < hierarchy.length; i++) {
        const grandchildField = hierarchy[i];
        formGroup.get(grandchildField)?.setValue('', { emitEvent: false });
        field.selectedValues[grandchildField] = '';
        this.fieldOptions[fieldName][grandchildField] = [];
      }
    }
    // For leaf fields: try to set parents
    else if (isLastField && index > 0) {
      this.setParentValuesFromChild(fieldName, hierarchyField, value);
    }

    // Always update combined value
    this.updateCombinedValue(fieldName);
  }

  // Method to set parent values when a child is selected
  setParentValuesFromChild(fieldName: string, childField: string, childValue: string) {
    console.log(`Setting parent values for ${fieldName}, child: ${childField}, value: ${childValue}`);

    // Find the field by attributeName
    const field = this.customAttrList.find((f: any) => f.attributeName === fieldName);
    if (!field) {
      console.warn('Field not found');
      return;
    }

    const dataSource = this.getDataSource(field);
    if (!dataSource || !Array.isArray(dataSource) || dataSource.length === 0) {
      console.warn('Data source not found or empty');
      return;
    }

    const hierarchy = this.hierarchyFields[fieldName];
    const formGroup = this.masterListFormGroups[fieldName];
    const isReversed = this.useReversedData[fieldName];

    console.log(`Hierarchy: ${JSON.stringify(hierarchy)}, isReversed: ${isReversed}`);

    // Clone the data to avoid mutation issues
    const dataSourceClone = JSON.parse(JSON.stringify(dataSource));

    // Find the selected child item in the data source
    const childItem = this.findItemByFieldAndValue(dataSourceClone, childField, childValue, isReversed);

    if (!childItem) {
      console.warn(`Child item not found in data source for ${childField}=${childValue}`);
      return;
    }

    // Add attributeName to child item
    childItem.attributeName = fieldName;

    // Now try to set parent values by traversing up the hierarchy
    const parentValues = this.findParentValues(childItem, hierarchy, childField, isReversed, field);

    console.log('Parent values found:', parentValues);

    if (Object.keys(parentValues).length === 0) {
      console.warn('No parent values found');
      return;
    }

    // Important: Store current values to restore if necessary
    const savedValues: { [key: string]: string } = {};
    hierarchy.forEach(field => {
      savedValues[field] = formGroup.get(field)?.value || '';
    });

    // Ensure we keep the selected child value
    savedValues[childField] = childValue;

    // Temporarily disable ALL valueChanges subscriptions
    const subscriptions = this.disableValueChangeListeners(fieldName);

    try {
      // Set values in hierarchy order (from top to bottom)
      const sortedParentFields = Object.keys(parentValues).sort((a, b) => {
        return hierarchy.indexOf(a) - hierarchy.indexOf(b);
      });

      // First update the field.selectedValues object
      field.selectedValues = field.selectedValues || {};

      // Set all parent values
      sortedParentFields.forEach(parentField => {
        console.log(`Setting ${parentField} = ${parentValues[parentField]}`);
        formGroup.get(parentField)?.setValue(parentValues[parentField], { emitEvent: false });
        field.selectedValues[parentField] = parentValues[parentField];
      });

      // Make sure child field value is set
      formGroup.get(childField)?.setValue(childValue, { emitEvent: false });
      field.selectedValues[childField] = childValue;

      // Update the combined value
      this.updateCombinedValue(fieldName);
    } catch (error) {
      console.error('Error setting parent values:', error);
      // Restore saved values if something goes wrong
      Object.keys(savedValues).forEach(field => {
        if (savedValues[field]) {
          formGroup.get(field)?.setValue(savedValues[field], { emitEvent: false });
        }
      });
    } finally {
      // Re-enable the value change listeners
      setTimeout(() => {
        this.restoreValueChangeListeners(fieldName, subscriptions);
      }, 100);
    }
  }

  // Find an item in the data source by field name and value
  findItemByFieldAndValue(data: any[], fieldName: string, fieldValue: string, isReversed: boolean): any {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('No data to search through');
      return null;
    }

    console.log(`Searching for item with ${fieldName}=${fieldValue} in data with ${data.length} items`);

    // Try to find a direct match
    const directMatch = data.find(item =>
      item && item.fieldName === fieldName && item.fieldValue === fieldValue
    );

    if (directMatch) {
      console.log('Found direct match:', directMatch);
      return directMatch;
    }

    // If not found, search recursively
    for (const item of data) {
      if (item && item.fieldValues && Array.isArray(item.fieldValues) && item.fieldValues.length > 0) {
        const nestedMatch = this.findItemByFieldAndValue(
          item.fieldValues, fieldName, fieldValue, isReversed
        );
        if (nestedMatch) {
          console.log('Found nested match:', nestedMatch);
          return nestedMatch;
        }
      }
    }

    console.log(`No match found for ${fieldName}=${fieldValue}`);
    return null;
  }

  // Find parent values from a child item (up to 5 levels)
  findParentValues(item: any, hierarchy: string[], childField: string, isReversed: boolean, field: any): any {
    const parentValues: { [key: string]: string } = {};
    console.log(childField);
    // Skip if the item is null or missing required data
    if (!item) {
      console.warn('Cannot find parent values: item is null');
      return parentValues;
    }

    console.log('Finding parent values for item:', item);

    if (isReversed) {
      // For reversed data structure
      if (item.parentFieldName && item.parentFieldValue && hierarchy.includes(item.parentFieldName)) {
        // Add direct parent
        parentValues[item.parentFieldName] = item.parentFieldValue;

        // Find parent item to continue traversal
        const dataSource = this.getDataSource(field);
        const parentItem = this.findItemByNameAndValueInData(
          item.parentFieldName,
          item.parentFieldValue,
          dataSource
        );

        // Recursively find parent's parents
        if (parentItem) {
          const grandparentValues = this.findParentValues(
            parentItem,
            hierarchy,
            item.parentFieldName,
            isReversed,
            field
          );

          // Merge grandparent values
          Object.assign(parentValues, grandparentValues);
        }
      }
    } else {
      // For regular data structure
      // The logic is similar to reversed, just the traversal is different
      if (item.parentFieldName && item.parentFieldValue && hierarchy.includes(item.parentFieldName)) {
        // Add direct parent
        parentValues[item.parentFieldName] = item.parentFieldValue;

        // Find parent item
        const dataSource = this.getDataSource(field);
        const parentItem = this.findItemByNameAndValueInData(
          item.parentFieldName,
          item.parentFieldValue,
          dataSource
        );

        // Recursively find parent's parents
        if (parentItem) {
          const grandparentValues = this.findParentValues(
            parentItem,
            hierarchy,
            item.parentFieldName,
            isReversed,
            field
          );

          // Merge grandparent values
          Object.assign(parentValues, grandparentValues);
        }
      }
    }

    return parentValues;
  }

  // Helper to find an item by name and value in a data source
  findItemByNameAndValueInData(fieldName: string, fieldValue: string, data: any[]): any {
    if (!data) return null;

    for (const item of data) {
      if (item.fieldName === fieldName && item.fieldValue === fieldValue) {
        return item;
      }

      if (item.fieldValues && item.fieldValues.length > 0) {
        const found = this.findItemByNameAndValueInData(fieldName, fieldValue, item.fieldValues);
        if (found) return found;
      }
    }

    return null;
  }

  // Temporarily disable value change listeners
  disableValueChangeListeners(fieldName: string): any {
    const hierarchy = this.hierarchyFields[fieldName];
    if (!hierarchy) return {};

    const savedSubscriptions: any = {};

    // If we have setup listeners before, we need to reset them
    const formGroup = this.masterListFormGroups[fieldName];
    if (formGroup) {
      hierarchy.forEach(hierarchyField => {
        const control = formGroup.get(hierarchyField);
        if (control) {
          // Save any existing subscriptions
          // @ts-ignore: We need to access private members
          if (control._valueChanges && control._valueChanges.observers) {
            // @ts-ignore: Property '_valueChanges' is private
            savedSubscriptions[hierarchyField] = [...control._valueChanges.observers];
            // @ts-ignore: Property '_valueChanges' is private
            control._valueChanges.observers = [];
          }
        }
      });
    }

    return savedSubscriptions;
  }

  // Add this method to load all options for all fields
  loadAllOptions(fieldName: string) {
    const field = this.customAttrList.find((f: any) => f.attributeName === fieldName);
    if (!field) return;

    const dataSource = this.getDataSource(field);
    if (!dataSource) return;

    const hierarchy = this.hierarchyFields[fieldName];
    const isReversed = this.useReversedData[fieldName];

    // First level is already loaded in this.extractOptionsForField

    // Load options for all other levels
    hierarchy.forEach((hierarchyField, index) => {
      if (index === 0) return; // Skip first level, it's already loaded

      // Load all possible options for this field
      this.fieldOptions[fieldName][hierarchyField] = this.extractAllOptionsForField(
        dataSource, hierarchyField, isReversed
      );
    });
  }

  // Extract all possible options for a field regardless of parent selection
  extractAllOptionsForField(data: any[], fieldName: string, isReversed: boolean = false): any[] {
    const uniqueOptions = new Map();

    if (isReversed) {
      // For reversed data, we need to handle differently
      data.forEach(item => {
        this.extractOptionsFromReversedData(item, fieldName, uniqueOptions);
      });
    } else {
      // Helper function to extract options recursively for standard data
      const extractRecursively = (items: any[]) => {
        items.forEach(item => {
          if (item.fieldName === fieldName) {
            uniqueOptions.set(item.fieldValue, {
              value: item.fieldValue,
              label: item.fieldValue,
              data: item
            });
          }

          // Also check in fieldValues
          if (item.fieldValues && item.fieldValues.length > 0) {
            extractRecursively(item.fieldValues);
          }
        });
      };

      extractRecursively(data);
    }

    return Array.from(uniqueOptions.values());
  }

  // Restore value change listeners with saved subscriptions
  restoreValueChangeListeners(fieldName: string, savedSubscriptions: any) {
    console.log(savedSubscriptions)
    // Clean up any existing subscriptions first
    if (this.dropdownSubscriptions[fieldName]) {
      const subs = this.dropdownSubscriptions[fieldName];
      Object.values(subs).forEach((sub: any) => {
        if (sub && typeof sub.unsubscribe === 'function') {
          sub.unsubscribe();
        }
      });
      delete this.dropdownSubscriptions[fieldName];
    }

    // Create new subscriptions
    this.dropdownSubscriptions[fieldName] = {};

    // Re-setup the listeners
    const hierarchy = this.hierarchyFields[fieldName];
    const formGroup = this.masterListFormGroups[fieldName];
    const isReversed = this.useReversedData[fieldName];

    // Special case for single field
    if (hierarchy.length === 1) {
      const singleField = hierarchy[0];
      this.dropdownSubscriptions[fieldName][singleField] =
        formGroup.get(singleField)?.valueChanges.subscribe(() => {
          this.updateCombinedValue(fieldName);
        });
      return;
    }

    // For each level except the last one
    for (let i = 0; i < hierarchy.length - 1; i++) {
      const parentField = hierarchy[i];
      const childField = hierarchy[i + 1];

      // Set up the subscription and save it for later cleanup
      this.dropdownSubscriptions[fieldName][parentField] =
        formGroup.get(parentField)?.valueChanges.subscribe(value => {
          // Update options for the child field
          this.updateChildOptions(fieldName, parentField, value, childField, isReversed);

          // Important: Clear all fields below this one
          for (let j = i + 2; j < hierarchy.length; j++) {
            const grandchildField = hierarchy[j];
            formGroup.get(grandchildField)?.setValue('');
            this.fieldOptions[fieldName][grandchildField] = [];
          }

          // Update the combined value
          this.updateCombinedValue(fieldName);
        });
    }

    // Also set up subscription for last field
    const lastField = hierarchy[hierarchy.length - 1];
    this.dropdownSubscriptions[fieldName][lastField] =
      formGroup.get(lastField)?.valueChanges.subscribe(() => {
        this.updateCombinedValue(fieldName);
      });
  }

  // Helper to log nested data structure
  logDataStructure(item: any, depth: number, isReversed: boolean) {
    const indent = '  '.repeat(depth);
    console.log(`${indent}Field: ${item.fieldName}, Value: ${item.fieldValue}`);

    if (item.parentFieldName) {
      console.log(`${indent}Parent: ${item.parentFieldName} = ${item.parentFieldValue}`);
    }

    if (item.fieldValues && item.fieldValues.length > 0) {
      console.log(`${indent}Children:`);
      item.fieldValues.forEach((child: any) => {
        this.logDataStructure(child, depth + 1, isReversed);
      });
    }
  }

  // Debug helper to log the current state of the form
  logFormValues(fieldName: string) {
    const hierarchy = this.hierarchyFields[fieldName];
    const formGroup = this.masterListFormGroups[fieldName];

    if (!hierarchy || !formGroup) return;

    console.log(`==== Form Values for ${fieldName} ====`);
    hierarchy.forEach(field => {
      const value = formGroup.get(field)?.value;
      console.log(`${field}: ${value || 'not set'}`);

      // Log available options
      const options = this.fieldOptions[fieldName][field];
      console.log(`  Options (${options?.length || 0}): ${options?.map(o => o.value).join(', ') || 'none'}`);
    });
    console.log('============================');
  }

  // Pre-load all possible options for all levels before setting values
  preloadAllLevelOptions(fieldName: string) {
    const field = this.customAttrList.find((f: any) => f.attributeName === fieldName);
    if (!field) return;

    const dataSource = this.getDataSource(field);
    if (!dataSource || !dataSource.length) return;

    const hierarchy = this.hierarchyFields[fieldName];
    const isReversed = this.useReversedData[fieldName];

    // For each level in the hierarchy
    hierarchy.forEach((hierarchyField, index) => {
      if (index === 0) {
        // First level already has options loaded in buildDynamicForm
        return;
      }

      console.log(`Pre-loading all options for ${fieldName} > ${hierarchyField}`);

      // Extract all possible options for this field
      this.fieldOptions[fieldName][hierarchyField] =
        this.extractAllOptionsForField(dataSource, hierarchyField, isReversed);
    });
  }

  // Properly reset a field's form and data structures
  resetField(fieldName: string) {
    const field = this.customAttrList.find((f: any) => f.attributeName === fieldName);
    if (!field) return;

    // Reset the selectedValues
    field.selectedValues = {};

    // Reset the form controls
    const formGroup = this.masterListFormGroups[fieldName];
    const hierarchy = this.hierarchyFields[fieldName];

    if (formGroup && hierarchy) {
      // Disable event emission temporarily
      const subscriptions = this.disableValueChangeListeners(fieldName);

      try {
        // Clear all values in the form group
        hierarchy.forEach(hierarchyField => {
          formGroup.get(hierarchyField)?.setValue('', { emitEvent: false });
        });

        // Clear the main form control
        this.customAttrForm.get(fieldName)?.setValue('', { emitEvent: false });

        // For all levels except the first, clear options
        for (let i = 1; i < hierarchy.length; i++) {
          this.fieldOptions[fieldName][hierarchy[i]] = [];
        }
      } finally {
        // Restore listeners
        this.restoreValueChangeListeners(fieldName, subscriptions);
      }
    }
  }

  ngOnDestroy() {
    // Clean up all subscriptions
    Object.keys(this.dropdownSubscriptions).forEach(fieldName => {
      const fieldSubs = this.dropdownSubscriptions[fieldName];
      Object.values(fieldSubs).forEach((sub: any) => {
        if (sub && typeof sub.unsubscribe === 'function') {
          sub.unsubscribe();
        }
      });
    });
    this.dropdownSubscriptions = {};
  }
}
