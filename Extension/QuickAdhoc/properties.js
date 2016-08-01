define( [], function () {
	'use strict';
	return {
		type: "items",
		component: "accordion",
		items: {
			addConfigs: {
				type: "items",
				component: "expandable-items",
				label: "Configuration",
				items: {
					usrInterface:{
						type: "items",
						label: "User Interface",
						items: {
							drillOnly:{
							ref: "properties.userInterface.drillOnly",
							label: "Use only Drill dimensions",
							type: "boolean",
							component: "switch",
							options: [
								{ value: true, label: "Activated" },
								{ value: false, label: "Deactivated"}
							],
							defaultValue: false
							},//properties.userInterface.drillOnly
							showMeasures:{
								ref: "properties.userInterface.showMeasures",
								label: "Show Measures",
								type: "boolean",
								component: "switch",
								options: [
									{ value: true, label: "Activated" },
									{ value: false, label: "Deactivated"}
								],
								defaultValue: false
							},//properties.userInterface.showMeasures
							switchStyle:{
								ref: "properties.userInterface.switchStyle",
								label: "Switch Style",
								type: "string",
								component: "radiobuttons",
								options: [{
									value: "1",
									label: "Style 1"
								}, {
									value: "2",
									label: "Style 2"
								}, {
									value: "3",
									label: "Style 3"
								}, {
									value: "4",
									label: "Style 4"
								}],
								defaultValue: "1"
							}//properties.userInterface.switchStyle
						}
					},
					targetVisualization:{
						type: "items",
						label: "Target Visualization",
						items: {
							specified:{
							ref: "properties.targetVisualization.specified",
							label: "Manually specify an Object ID",
							type: "boolean",
							component: "switch",
							options: [
								{ value: true, label: "Activated" },
								{ value: false, label: "Deactivated"}
							],
							defaultValue: false
							},//properties.targetVisualization.specified
							objectId:{
							  ref: "properties.targetVisualization.objectId",
							  label: "Object ID",
							  type: "string",
							  expression: "",
							  show: function( data ){ return data.properties.targetVisualization.specified; }
							},//properties.targetVisualization.objectId
							howToObjectId:{
							  label: "Tip: You may use the Single Object in Dev-Hub and place here the value of the URL that belongs to 'obj='",
							  component: "text",
							  show: function( data ){ return data.properties.targetVisualization.specified; }
							},
							howToObjectId2:{
							  label: "About Single Object in Dev-Hub",
							  url: "http://help.qlik.com/en-US/sense-developer/3.0/Subsystems/Dev-Hub/Content/SingleConfigurator/dev-hub-single-configurator.htm",
							  component: "link",
							  show: function( data ){ return data.properties.targetVisualization.specified; }
							}
						}
					}
				}
			},
			settings: {
				uses: "settings"
			}
		}
	};
});