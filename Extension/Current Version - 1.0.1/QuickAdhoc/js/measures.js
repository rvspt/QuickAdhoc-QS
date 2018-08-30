function toggleMeasure(event){
	if(event.data.msr.selected){ //remove measure - TODO
		event.data.msr.selected = false;

		event.data.app.getObject(event.data.vis).then(function(obj){
			obj.getProperties().then(function(obj_properties){
				var elibible_to_remove = !eligibleMsrToAdd(obj_properties.qHyperCubeDef.qMeasures, event.data.msr.qInfo.qId);
				if(elibible_to_remove){
					var remove_index = -1;
					obj_properties.qHyperCubeDef.qMeasures.forEach(function(qMeasure, index){
						if(qMeasure.qLibraryId == event.data.msr.qInfo.qId)
							remove_index = index;
					});//get remove index

					new_obj_properties = removeMeasure(obj_properties, remove_index);

					obj.setProperties(new_obj_properties).then(function(properties_set){
						// console.log("Info: New properties are set.");
					});
				}//eligible to remove
			});//get object properties
		});//Get obj
	}else{ //add measure
		event.data.msr.selected = true;

		event.data.app.getObject(event.data.vis).then(function(obj){
			obj.getProperties().then(function(obj_properties){
				var elibible_to_add = eligibleMsrToAdd(obj_properties.qHyperCubeDef.qMeasures, event.data.msr.qInfo.qId);
				if(elibible_to_add){
					var new_obj_properties = newMeasureFromLibrary(obj_properties, event.data.msr.qInfo.qId);

					obj.setProperties(new_obj_properties).then(function(properties_set){
						// console.log("Info: New properties are set.");
					});
				}//eligible to add
			});//get obj properties
		});//get obj
	}
}

//verify if the measure is ok to add
function eligibleMsrToAdd(qMeasures, measure_id){
	var elibible_to_add = true;

	qMeasures.forEach(function(measure){
		if(measure.qLibraryId == measure_id)
			elibible_to_add = false;
	});

	return elibible_to_add;
}

//create new object properties that include the new measure
function newMeasureFromLibrary(obj_properties, measure_id){
	var new_measure = {
		"qLibraryId": "update_here",
		"qDef": {
			"qTags": [],
			"qGrouping": "N",
			"qNumFormat": {
				"qType": "U",
				"qnDec": 10,
				"qUseThou": 0
			},
			"qAggrFunc": "Expr",
			"qAccumulate": 0,
			"qActiveExpression": 0,
			"qExpressions": [],
			"autoSort": true,
			"cId": "update_here",
			"numFormatFromTemplate": true,
			"textAlign": {
				"auto": true,
				"align": "left"
			}
		},
		"qSortBy": {
			"qSortByNumeric": -1,
			"qSortByLoadOrder": 1,
			"qExpression": {}
		},
		"qAttributeExpressions": [],
		"qAttributeDimensions": [],
		"qCalcCond": {}
	}

	new_measure.qLibraryId = measure_id;
	new_measure.qDef.cId = randomCidMsr();

	obj_properties.qHyperCubeDef.qMeasures.push(new_measure);
	obj_properties.qHyperCubeDef.columnOrder.push(obj_properties.qHyperCubeDef.columnOrder.length);
	obj_properties.qHyperCubeDef.columnWidths.push(-1);
	obj_properties.qHyperCubeDef.qInterColumnSortOrder.push(obj_properties.qHyperCubeDef.qInterColumnSortOrder.length);

	return obj_properties;
}

//create new object properties that remove the measure
function removeMeasure(obj_properties, remove_index){
	var qMeasures = obj_properties.qHyperCubeDef.qMeasures;
	var columnOrder = obj_properties.qHyperCubeDef.columnOrder;
	var columnWidths = obj_properties.qHyperCubeDef.columnWidths;
	var qInterColumnSortOrder = obj_properties.qHyperCubeDef.qInterColumnSortOrder;

	if(remove_index != -1){
		qMeasures.splice(remove_index,1);

		var column_no = remove_index + obj_properties.qHyperCubeDef.qDimensions.length;
		var column_no_index = -1;

		columnOrder.forEach(function(column_index, index){
			if(column_index>=column_no)
				columnOrder[index]--;
			if(column_index == column_no)
				column_no_index = index;
		})

		columnOrder.splice(column_no_index,1);

		//assuring column width (table)
		columnWidths.splice(column_no_index,1);//TODO REVIEW

		//assuring sort order
		var sort_index = -1;
		var sort_max_allowed = qInterColumnSortOrder.length-1;
		for(var j = 0; j < qInterColumnSortOrder.length; j++)
		{
			if(qInterColumnSortOrder[j] == column_no_index){
				sort_index = j;
			}	
		}

		if(qInterColumnSortOrder.length==2){
			qInterColumnSortOrder.splice(0,1);
			qInterColumnSortOrder[0]=0;			
		} else if(column_no_index == sort_max_allowed){
			qInterColumnSortOrder.splice(sort_index,1);
		} else if(column_no_index == 0){
			qInterColumnSortOrder.splice(sort_index,1);
			for(var j = 0; j < qInterColumnSortOrder.length; j++){
				qInterColumnSortOrder[j]--;
			}
		}else {
			for(var j = 0; j < qInterColumnSortOrder.length; j++){
				if((qInterColumnSortOrder[j]-1)>=column_no_index){
					qInterColumnSortOrder[j]--;
				}
			}
			qInterColumnSortOrder.splice(sort_index,1);
		}
	}

	obj_properties.qHyperCubeDef.qMeasures = qMeasures;
	obj_properties.qHyperCubeDef.columnOrder = columnOrder;
	obj_properties.qHyperCubeDef.columnWidths = columnWidths;
	obj_properties.qHyperCubeDef.qInterColumnSortOrder = qInterColumnSortOrder;

	return obj_properties;

}

//random cId generator for Measures
function randomCidMsr(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 7; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}