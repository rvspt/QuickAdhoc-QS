# QuickAdhoc-QS
Qlik Sense extension that allows a user to arbitrarily choose what library dimensions (field or drill) and measures to display in a Qlik Sense native table object. This allows the user to quickly create Ad-hoc listings, even withing Mashups with minimum effort.

The extension object will read the application's Library items and allow the following interactions:
  * Add or remove a dimension from the table
  * Add or remove a measure from the table
  * Add or remove all the fields related to a drill-down dimension with a single click

The target table can be specified by 'Single Object ID' (easy to find with Dev-Hub's single object configurator) or a dropdown will list all the tables within a sheet, which can be used for quick side-by-side comparisons.

Tested with Qlik Sense 3.0. Should be compatible with 2.0+.

An example and tutorial app can be found in the 'App Example' folder.

In action:
![alt text](./Screenshots/AnimatedExample.gif?raw=true) 

Side by side comparison:
![alt text](./Screenshots/MultipleTables.png?raw=true) 

### Release History
 * v1 - Initial relase of the extension

### Future releases
It is my intension to add support to Qlik Sense's native pivot-table in the near future.
 
