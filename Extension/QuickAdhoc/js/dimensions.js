function toggleDimension(event){
	if(event.data.dim.selected)
	{	//remove dimension
		event.data.dim.selected = false;
		
		event.data.app.getObject(event.data.vis).then(function(obj){
			obj.getProperties().then(function(obj_properties){

				if(event.data.dim.qDim.qGrouping=="N"){ //normal library dimension
					var eligible_to_remove = !eligibleDimToAdd(obj_properties.qHyperCubeDef.qDimensions, event.data.dim, '');
					if(eligible_to_remove){
						var remove_index = -1;
						obj_properties.qHyperCubeDef.qDimensions.forEach(function(qDimension, index){
							if(qDimension.qLibraryId == event.data.dim.qInfo.qId)
								remove_index = index;
							else if(qDimension.qDef.qFieldDefs[0] == event.data.dim.qDim.qFieldDefs[0])
								remove_index = index;
						});

						var remove_array = [];

						if(remove_index != -1){
							remove_array.push(remove_index);
						}

						removeDimension(obj_properties, remove_array);

						obj.setProperties(obj_properties).then(function(properties_set){
							// console.log("Info: New properties are set.");
						});
					}
				}
				else if(event.data.dim.qDim.qGrouping=="H"){ //drill library dimension
					var remove_array = [];
					for(var i = 0; i< event.data.dim.qDim.qFieldDefs.length; i++){
						var field = event.data.dim.qDim.qFieldDefs[i];
						var eligible_to_remove = !eligibleDimToAdd(obj_properties.qHyperCubeDef.qDimensions, event.data.dim, field);
						if(eligible_to_remove){
							var remove_index = -1;
							obj_properties.qHyperCubeDef.qDimensions.forEach(function(qDimension, index){
								if(qDimension.qDef.qFieldDefs[0] == field)
									remove_array.push(index);
							});
						}
					}//each field

					removeDimension(obj_properties, remove_array);

					obj.setProperties(obj_properties).then(function(properties_set){
						// console.log("Info: New properties are set.");
					});
				}
				else{ //unknown type of dimension
					console.log("Warning: Unkown type of dimension to add!");
				}
				console.groupEnd();//removing the dimension
			}); //getProperties
		});//getObject
	}
	else
	{	//add dimension (s)
		event.data.dim.selected = true;
		
		event.data.app.getObject(event.data.vis).then(function(obj){
			obj.getProperties().then(function(obj_properties){
				if(event.data.dim.qDim.qGrouping=="N"){ //normal library dimension
					var eligible_to_add = eligibleDimToAdd(obj_properties.qHyperCubeDef.qDimensions, event.data.dim, '');
					if(eligible_to_add){

						var new_obj_properties = newDimensionFromLibrary(obj_properties, event.data.dim);

						obj.setProperties(new_obj_properties).then(function(properties_set){
							// console.log("Info: New properties are set.");
						});
					}
				}
				else if(event.data.dim.qDim.qGrouping=="H"){ //drill library dimension
					var new_qDimensions = [];
					var new_properties = false;
					for(var i = 0; i< event.data.dim.qDim.qFieldDefs.length; i++){
						var field = event.data.dim.qDim.qFieldDefs[i];
						var eligible_to_add = eligibleDimToAdd(obj_properties.qHyperCubeDef.qDimensions, event.data.dim, event.data.dim.qDim.qFieldDefs[i]);
						if(eligible_to_add){
							new_properties = true;
							new_qDimensions.push({
								"qDef": {
									"qGrouping": "N",
									"qFieldDefs": [
										field
									],
									"qFieldLabels": [
										""
									],
									"qSortCriterias": [
										{
											"qSortByAscii": 1,
											"qSortByLoadOrder": 1,
											"qExpression": {}
										}
									],
									"qNumberPresentations": [],
									"qActiveField": 0,
									"autoSort": true,
									"cId": randomCidDim(),
									"othersLabel": "Others",
									"textAlign": {
										"auto": true,
										"align": "left"
									},
									"representation": {
										"type": "text",
										"urlLabel": ""
									}
								},
								"qOtherTotalSpec": {
									"qOtherMode": "OTHER_OFF",
									"qOtherCounted": {
										"qv": "10"
									},
									"qOtherLimit": {
										"qv": "0"
									},
									"qOtherLimitMode": "OTHER_GE_LIMIT",
									"qForceBadValueKeeping": true,
									"qApplyEvenWhenPossiblyWrongResult": true,
									"qOtherSortMode": "OTHER_SORT_DESCENDING",
									"qTotalMode": "TOTAL_OFF",
									"qReferencedExpression": {}
								},
								"qOtherLabel": {
									"qv": "Others"
								},
								"qTotalLabel": {},
								"qCalcCond": {},
								"qAttributeExpressions": [],
								"qAttributeDimensions": []
							});

							obj_properties.qHyperCubeDef.columnOrder.push(obj_properties.qHyperCubeDef.columnOrder.length);
							obj_properties.qHyperCubeDef.columnWidths.push(-1);
							obj_properties.qHyperCubeDef.qInterColumnSortOrder.push(obj_properties.qHyperCubeDef.qInterColumnSortOrder.length);

						}
					}

					obj_properties.qHyperCubeDef.qDimensions=obj_properties.qHyperCubeDef.qDimensions.concat(new_qDimensions);

					if(new_properties){
						obj.setProperties(obj_properties).then(function(properties_set){
							// console.log("Info: New properties are set.");
						});
					}
				}else{ //unknown type of dimension
					console.log("Warning: Unkown type of dimension to add!");
				}
			});//object properties
		})//get object
	}

	
}


//check if dimension is eligible to add
function eligibleDimToAdd(qDimensions, new_dimension, field){
	var eligible_to_add = true;
	if(new_dimension.qDim.qGrouping=="N"){
		qDimensions.forEach(function(qDimension){
			if(qDimension.qLibraryId == new_dimension.qInfo.qId)
				eligible_to_add = false;
			if(qDimension.qDef.qFieldDefs[0] == new_dimension.qDim.qFieldDefs[0])
				eligible_to_add = false;
		});
	} else if(new_dimension.qDim.qGrouping=="H"){
		qDimensions.forEach(function(qDimension){
			if(qDimension.qDef.qFieldDefs[0] == field)
				eligible_to_add = false;
		});
	} else{
		console.log("Warning: Unkown type of dimension to add!");
		eligible_to_add = false;
	}
	return eligible_to_add;
}

//removes the dimension
function removeDimension(obj_properties, remove_array){
	var qDimensions = obj_properties.qHyperCubeDef.qDimensions;
	var columnOrder = obj_properties.qHyperCubeDef.columnOrder;
	var columnWidths = obj_properties.qHyperCubeDef.columnWidths;
	var qInterColumnSortOrder = obj_properties.qHyperCubeDef.qInterColumnSortOrder;

	remove_array.sort();

	if(remove_array.length>0){
		for (var i = remove_array.length-1; i >= 0 ; i--){
			qDimensions.splice(remove_array[i],1);

			//rearrangeing column order
			columnOrder.splice(remove_array[i],1);
			for(var j = 0; j < columnOrder.length; j++)
				if(columnOrder[j]>remove_array[i])
					columnOrder[j]--;

			//assuring column width (table)
			columnWidths.splice(remove_array[i],1);//TODO REVIEW

			//assuring sort order
			var sort_index = -1;
			var sort_max_allowed = qInterColumnSortOrder.length-1;
			for(var j = 0; j < qInterColumnSortOrder.length; j++)
			{
				if(qInterColumnSortOrder[j] == remove_array[i]){
					sort_index = j;
				}	
			}

			if(qInterColumnSortOrder.length==2){
				qInterColumnSortOrder[0]=0;
				qInterColumnSortOrder.pop();
			} else if(remove_array[i] == sort_max_allowed){
				qInterColumnSortOrder.splice(sort_index,1);
			} else {
				for(var j = 0; j < qInterColumnSortOrder.length; j++){
					if((qInterColumnSortOrder[j]-1)>=remove_array[i]){
						qInterColumnSortOrder[j]--;
					}
				}
				qInterColumnSortOrder.splice(sort_index,1);
			}
		}
	}	

	obj_properties.qHyperCubeDef.qDimensions = qDimensions;
	obj_properties.qHyperCubeDef.columnOrder = columnOrder;
	obj_properties.qHyperCubeDef.columnWidths = columnWidths;
	obj_properties.qHyperCubeDef.qInterColumnSortOrder = qInterColumnSortOrder;

	return obj_properties;
}

//prepares the new dimension to add based on a template for a library dimension
function newDimensionFromLibrary(obj_properties, selected_dimension){
	var new_dimension = {
					"qLibraryId": "update_here",
					"qDef": {
						"qGrouping": "N",
						"qFieldDefs": [],
						"qFieldLabels": [],
						"qSortCriterias": [
							{
								"qSortByAscii": 1,
								"qSortByLoadOrder": 1,
								"qExpression": {}
							}
						],
						"qNumberPresentations": [],
						"qActiveField": 0,
						"autoSort": true,
						"cId": "random_here",
						"othersLabel": "Others",
						"textAlign": {
							"auto": true,
							"align": "left"
						},
						"representation": {
							"type": "text",
							"urlLabel": ""
						}
					},
					"qOtherTotalSpec": {
						"qOtherMode": "OTHER_OFF",
						"qOtherCounted": {
							"qv": "10"
						},
						"qOtherLimit": {
							"qv": "0"
						},
						"qOtherLimitMode": "OTHER_GE_LIMIT",
						"qForceBadValueKeeping": true,
						"qApplyEvenWhenPossiblyWrongResult": true,
						"qOtherSortMode": "OTHER_SORT_DESCENDING",
						"qTotalMode": "TOTAL_OFF",
						"qReferencedExpression": {}
					},
					"qOtherLabel": {
						"qv": "Others"
					},
					"qTotalLabel": {},
					"qCalcCond": {},
					"qAttributeExpressions": [],
					"qAttributeDimensions": []
				};
	new_dimension.qLibraryId = selected_dimension.qInfo.qId;
	new_dimension.qDef.cId = randomCidDim();

	obj_properties.qHyperCubeDef.qDimensions.push(new_dimension);
	obj_properties.qHyperCubeDef.columnOrder.push(obj_properties.qHyperCubeDef.columnOrder.length);
	obj_properties.qHyperCubeDef.columnWidths.push(-1);
	obj_properties.qHyperCubeDef.qInterColumnSortOrder.push(obj_properties.qHyperCubeDef.qInterColumnSortOrder.length);

	return obj_properties;
}

//random cId generator for Measures
function randomCidDim(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 7; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}