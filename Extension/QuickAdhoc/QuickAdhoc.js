define( ['./js/qsocks.bundle','js/qlik','./properties','./js/measures','./js/dimensions','css!./css/interface.css'],
function ( qsocks, qlik, extension_properties ) {

	return {
		definition: extension_properties,
		snapshot : { canTakeSnapshot : false },
		paint: function ($element, layout) {
			var object_id = layout.qInfo.qId;
			var sheet_id = '';
			var visualization_id = '';

			var split_url = window.location.pathname.split('/');
			// console.log("broken url: ", split_url);
			for(var i = 0; i != split_url.length; i++){
				if(split_url[i] == 'sheet') sheet_id = split_url[i+1];
			}

			var config = {
				host: window.location.hostname,
				port: window.location.port,
				appname: encodeURIComponent(qlik.currApp().id),
				isSecure: window.location.protocol === "https:"
			};

			renderExtension();

			function renderExtension(){
				qsocks.Connect(config).then(function(global) {
					global.openDoc(qlik.currApp().id).then(function(app){
						app.getAllInfos().then(function(appInfos){
							var dimensions_list = [];
				            appInfos.qInfos.forEach(function(document_infos){
					            if(document_infos.qType=='dimension'){
					                dimensions_list.push(document_infos.qId)
					            	}
					            });//dimensions
				            var measures_list = [];
				            appInfos.qInfos.forEach(function(document_infos){
								if(document_infos.qType=='measure'){
									measures_list.push(document_infos.qId)
								}
				            })//measures list
					        var dim_tmp_list = [];
					        var msr_tmp_list = [];

				            if(dimensions_list.length>0){
				            	getDimensionDetails(dimensions_list, dim_tmp_list).then(function(the_one){console.log(2)})
		          			}

		          			function getDimensionDetails(dimensions_list, dim_tmp_list){
		          				if(dimensions_list.length>0){
		          				 	var first_dimension = dimensions_list.shift();
		               				app.getDimension(first_dimension).then(function(dim){
		               					dim.getLayout().then(function(dim_layout){
		               						var dim_data = {
		 				                      qInfo: dim_layout.qInfo,
		 				                      qMeta: dim_layout.qMeta,
		 				                      qDim: dim_layout.qDim,
		 				                      selected: false
		 				                    }
		 				                    dim_tmp_list.push(dim_data);

		 				                    getDimensionDetails(dimensions_list, dim_tmp_list);
		               				 	});//get layout dim
		               				});//get dimension
		          				}//has dimensions to get info
		          				else{
		          					//sorting the dimensions
		          					var sorter = [];
 				                    dim_tmp_list.forEach(function(dim_tmp){
 				                    	sorter.push(dim_tmp.qDim.title);
 				                    })
 				                    sorter.sort();
 				                    var sorted_dim_list = [];
 				                    sorter.forEach(function(ranked_title){
 				                    	dim_tmp_list.forEach(function(dimension){
 				                    		if(ranked_title==dimension.qDim.title)
 				                    			sorted_dim_list.push(dimension)
 				                    	})
 				                    })
		          					getMeasures(sorted_dim_list, measures_list, msr_tmp_list);
		          				}
		          			}

		          			function getMeasures(all_dimensions, measures_list, msr_tmp_list){
		          				if(measures_list.length>0){
		          					var first_measure = measures_list.shift();
		          					app.getMeasure(first_measure).then(function(msr){
		          						msr.getLayout().then(function(msr_layout){
		          							var msr_data = {
		          								qInfo: msr_layout.qInfo,
		          								qMeta: msr_layout.qMeta,
		          								qMeasure: msr_layout.qMeasure,
		          								selected: false
		          							};
		          							msr_tmp_list.push(msr_data);
		          							getMeasures(all_dimensions, measures_list, msr_tmp_list);
		          						});//get measure layout
		          					});//get measure
		          				}//has measures to get info
		          				else{
		          					//sorting the measures
		          					var sorter = [];
 				                    msr_tmp_list.forEach(function(msr_tmp){
 				                    	sorter.push(msr_tmp.qMeta.title);
 				                    })
 				                    sorter.sort();
 				                    var sorted_msr_list = [];
 				                    sorter.forEach(function(ranked_title){
 				                    	msr_tmp_list.forEach(function(measure){
 				                    		if(ranked_title==measure.qMeta.title)
 				                    			sorted_msr_list.push(measure)
 				                    	})
 				                    })
		          					getSheetObjects(all_dimensions,sorted_msr_list);
		          				}
		          			}//measures
		          			function getSheetObjects(all_dimensions, all_measures){
		          				//manual object identification
		          				if(layout.properties.targetVisualization.specified && layout.properties.targetVisualization.objectId != ""){
		          					visualization_id = layout.properties.targetVisualization.objectId;
		          					app.getObject(layout.properties.targetVisualization.objectId).then(function(obj){
		          						obj.getFullPropertyTree().then(function(obj_full_props){
		          							var object = [{
						                    				objectId: layout.properties.targetVisualization.objectId,
						                    				visualization: obj_full_props.qProperty.visualization,
						                    				title: obj_full_props.qProperty.title,
						                    				qDimensions: obj_full_props.qProperty.qHyperCubeDef.qDimensions,
						                    				qMeasures: obj_full_props.qProperty.qHyperCubeDef.qMeasures
						                    			}];
						                    paintOptions(all_dimensions, all_measures, object, app);
		          						});//get object properties
		          					});//getObject
		          				}
		          				//not fully configured for single object identification
		          				else if(layout.properties.targetVisualization.specified && layout.properties.targetVisualization.objectId == ""){
		          					$element.html("Please make sure you specify the intended Object Id");
		          				}
		          				//user selects a sheet object
		          				else{ 
		          					app.getObject(sheet_id).then(function(sht){
		              					sht.getLayout().then(function(sht_layout){
		              						var sheet_objects_tmp = [];
		              						sht_layout.cells.forEach(function(sheet_object){
		              							if(sheet_object.type == "table")
						                        	{
						                        		sheet_objects_tmp.push({sheet_object_id: sheet_object.name, sheet_object_type: sheet_object.type});
						                        	}
						                    });

						                    if(sheet_objects_tmp.length == 0){
						                    	$element.html("Please make sure the sheet has at least one targetable visualization.");
						                    }

						                    var all_objects = [];

						                    if(visualization_id != '')
						                    {
						                    	app.getObject(visualization_id).then(function(obj){
					          						obj.getFullPropertyTree().then(function(obj_full_props){
					          							var object_selected = {
									                    				objectId: visualization_id,
									                    				visualization: obj_full_props.qProperty.visualization,
									                    				title: obj_full_props.qProperty.title,
									                    				qDimensions: obj_full_props.qProperty.qHyperCubeDef.qDimensions,
									                    				qMeasures: obj_full_props.qProperty.qHyperCubeDef.qMeasures
									                    			};
									                    all_objects.push(object_selected);
									                    getObjectDetails(sheet_objects_tmp);
					          						});//get object properties
					          					});//getObject
					          					
						                    } else{
						                    	getObjectDetails(sheet_objects_tmp);
						                    }

						                    function getObjectDetails(sheet_objects_tmp){
						                    	var first_object = sheet_objects_tmp.shift();
						                    	sht.getChild(first_object.sheet_object_id).then(function(obj){
						                    		obj.getFullPropertyTree().then(function(obj_full_props){
					                    			    all_objects.push({
						                    				objectId: first_object.sheet_object_id,
						                    				visualization: first_object.sheet_object_type,
						                    				title: obj_full_props.qProperty.title,
						                    				qDimensions: obj_full_props.qProperty.qHyperCubeDef.qDimensions,
						                    				qMeasures: obj_full_props.qProperty.qHyperCubeDef.qMeasures
						                    			});
						                    			if(sheet_objects_tmp.length>0)
				                                			getObjectDetails(sheet_objects_tmp);	
				                                		else
								                    		paintOptions(all_dimensions, all_measures, all_objects, app);
								                    });//get fullPropertyTree
						                    	});//sheet object infos
						                    }//getObjectDetails
		              					});//get sheet layout
		              				});//get sheet objects list
		          				}//look for sheet objects
		          			}//getSheetObjects
						});//appInfos
					});//app
				});//global
			} //renderExtension

			function paintOptions(dimensions_list, measures_list, objects_list, app){
				//checking if library contents are in the selected chart
				// if(layout.properties.targetVisualization.specified && layout.properties.targetVisualization.objectId){
				if(visualization_id != ''){
					var selected_dimensions = {qLibraryId: [], qFieldDefs: []};
					var selected_measures = [];
					objects_list[0].qDimensions.forEach(function(dimension){
						if(dimension.qLibraryId)
							selected_dimensions.qLibraryId.push(dimension.qLibraryId);
						else if(dimension.qDef.qFieldDefs[0])
							selected_dimensions.qFieldDefs.push(dimension.qDef.qFieldDefs[0]);
					});
					objects_list[0].qMeasures.forEach(function(measure){
						if(measure.qLibraryId)
							selected_measures.push(measure.qLibraryId);
					});

					//check for "normal" dimensions
					dimensions_list.forEach(function(dimension){
						//via library id
						selected_dimensions.qLibraryId.forEach(function(selected_dim_library){
							if(selected_dim_library == dimension.qInfo.qId)
								dimension.selected = true;
						});

						//via field only
						selected_dimensions.qFieldDefs.forEach(function(selected_dim_field){
							if(selected_dim_field == dimension.qDim.qFieldDefs)
								dimension.selected = true;
						});

						//via all fields of an hierarchy
						if(dimension.qDim.qGrouping=="H"){
							var hierarchy_verifier = [];
							dimension.qDim.qFieldDefs.forEach(function(field){
								hierarchy_verifier.push({field: field, selected: false})
							});

							hierarchy_verifier.forEach(function(selected_hierarchy_field){
								selected_dimensions.qFieldDefs.forEach(function(selected_dim_field){
									if(selected_dim_field == selected_hierarchy_field.field)
										selected_hierarchy_field.selected = true;
								});
							});

							var hierarchy_selected = true;
							hierarchy_verifier.forEach(function(hierarchy_selected_verifier){
								if(hierarchy_selected_verifier.selected == false)
									hierarchy_selected = false;
							});

							dimension.selected = hierarchy_selected;
						}
					});

					measures_list.forEach(function(measure){
						//via library id
						selected_measures.forEach(function(selected_msr_library){
							if(selected_msr_library == measure.qInfo.qId)
								measure.selected = true;
						});
					});
				}

				$element.empty();
				$element.addClass('scrollable');

				paintDimensions($element, dimensions_list, app);

				if(layout.properties.userInterface.showMeasures) paintMeasures($element, measures_list, app);

				if(!layout.properties.targetVisualization.specified) paintChartSelection($element, objects_list);

			} //paintOptions

			//function that controls what dimensions are rendered in the extension
			function paintDimensions(element, dimensions_list, app){
				//app_dimensions selection
				$divAppDimensions = $(document.createElement('div'));
				$divAppDimensions.attr('id','app_dimensions_'+object_id);
				$divAppDimensions.addClass('selection_section');
				element.append($divAppDimensions);

				//Dimensions section title
				$h1Dimensions = $(document.createElement('h1'));
				$h1Dimensions.addClass('add_components-title');
				$h1Dimensions.text('Dimensions');
				$divAppDimensions.append($h1Dimensions);

				var dimension = {};
				for (var i=0; i < dimensions_list.length; i++){
					if(dimensions_list[i].qDim.qGrouping=="H" || !layout.properties.userInterface.drillOnly){
						dimension = dimensions_list[i];
						//dimension container
						$divDimContainer = $(document.createElement('div'));
						$divDimContainer.attr('id', object_id+'_dim_container_'+dimension.qInfo.qId);
						$divDimContainer.addClass('dim_container');
						$divAppDimensions.append($divDimContainer);

						//dimension switch button
						$divDimSwitch = $(document.createElement('div'));
						$divDimSwitch.addClass('onoffswitch');
						$divDimContainer.append($divDimSwitch);

						$chkDimSwitch = $(document.createElement('input'));
						$chkDimSwitch.attr('type', 'checkbox');
						$chkDimSwitch.attr('id', object_id+'_'+dimension.qInfo.qId);
						$chkDimSwitch.attr('name', object_id+'_dimension_'+i+'_'+dimension.qInfo.qId);
						$chkDimSwitch.addClass('onoffswitch-checkbox');
						$chkDimSwitch.attr('checked',dimension.selected);
						$chkDimSwitch.click({dim: dimension, vis: visualization_id, app: app}, toggleDimension);
						$divDimSwitch.append($chkDimSwitch);

						$lblDimSwitch = $(document.createElement('label'));
						$lblDimSwitch.addClass('onoffswitch-label');
						$lblDimSwitch.attr('for', object_id+'_'+dimension.qInfo.qId);
						$divDimSwitch.append($lblDimSwitch);

						$spnDimSwitchInner = $(document.createElement('span'));
						$spnDimSwitchInner.addClass('onoffswitch-inner');
						$lblDimSwitch.append($spnDimSwitchInner);

						$spnDimSwitch = $(document.createElement('span'));
						$spnDimSwitch.addClass('onoffswitch-switch');
						$lblDimSwitch.append($spnDimSwitch);

						//dimension label
						$divDimLabel = $(document.createElement('div'));
						$divDimLabel.addClass('switch_label');
						$divDimLabel.text(dimension.qDim.title);
						$divDimContainer.append($divDimLabel);

						//dimension hierarchy icon
						$divDimIcon = $(document.createElement('div'));
						$divDimIcon.addClass('dim_drill');
						$divDimIcon.addClass(dimensions_list[i].qDim.qGrouping=="H" ? "" : "hidden");
						$divDimContainer.append($divDimIcon);
						$imgDimIcon = $(document.createElement('img'));
						$imgDimIcon.attr('src', '/extensions/quickadhoc/images/drill-icon.png');
						$imgDimIcon.addClass('dim_drill-icon');
						$divDimIcon.append($imgDimIcon);

						dimension = {};
					}//only drill dimensions
				}//cycle through dimensions
			}//paint dimensions

			//function that controls what measures are rendered in the extension
			function paintMeasures(element, measures_list, app){
				//app_measures selection
				$divAppMeasures = $(document.createElement('div'));
				$divAppMeasures.attr('id','app_measures_'+object_id);
				$divAppMeasures.addClass('selection_section');
				element.append($divAppMeasures);

				//Msasures section title
				$h1Measures = $(document.createElement('h1'));
				$h1Measures.addClass('add_components-title');
				$h1Measures.text('Measures');
				$divAppMeasures.append($h1Measures);
				for (var i=0; i < measures_list.length; i++){
					var measure = measures_list[i];
					//measure container
					$divMsrContainer = $(document.createElement('div'));
					$divMsrContainer.attr('id', object_id+'_msr_container_'+measure.qInfo.qId);
					$divMsrContainer.addClass('msr_container');
					$divAppMeasures.append($divMsrContainer);

					//measure switch button
					$divMsrSwitch = $(document.createElement('div'));
					$divMsrSwitch.addClass('onoffswitch');
					$divMsrContainer.append($divMsrSwitch);

					$chkMsrSwitch = $(document.createElement('input'));
					$chkMsrSwitch.attr('type', 'checkbox');
					$chkMsrSwitch.attr('id', object_id+'_'+measure.qInfo.qId);
					$chkMsrSwitch.attr('name', object_id+'_measure_'+i+'_'+measure.qInfo.qId);
					$chkMsrSwitch.addClass('onoffswitch-checkbox');
					$chkMsrSwitch.attr('checked',measure.selected);
					$chkMsrSwitch.click({msr: measure, app: app, vis: visualization_id}, toggleMeasure);
					$divMsrSwitch.append($chkMsrSwitch);

					$lblMsrSwitch = $(document.createElement('label'));
					$lblMsrSwitch.addClass('onoffswitch-label');
					$lblMsrSwitch.attr('for', object_id+'_'+measure.qInfo.qId);
					$divMsrSwitch.append($lblMsrSwitch);

					$spnMsrSwitchInner = $(document.createElement('span'));
					$spnMsrSwitchInner.addClass('onoffswitch-inner');
					$lblMsrSwitch.append($spnMsrSwitchInner);

					$spnMsrSwitch = $(document.createElement('span'));
					$spnMsrSwitch.addClass('onoffswitch-switch');
					$lblMsrSwitch.append($spnMsrSwitch);

					//measure label
					$divMsrLabel = $(document.createElement('div'));
					$divMsrLabel.addClass('switch_label');
					$divMsrLabel.text(measure.qMeta.title);
					$divMsrContainer.append($divMsrLabel);
				}//cycle through measures
			}//paint measures

			//function that controls what chart selection options are rendered in the extension
			function paintChartSelection(element, objects_list){
				//app_charts selection
				$divAppCharts = $(document.createElement('div'));
				$divAppCharts.attr('id','app_charts_'+object_id);
				$divAppCharts.addClass('selection_section');
				element.append($divAppCharts);

				//Charts section title
				$h1Charts = $(document.createElement('h1'));
				$h1Charts.addClass('add_components-title');
				$h1Charts.text('Charts');
				$divAppCharts.append($h1Charts);

				//Chart select
				$ChtSelect = $(document.createElement('select'));
				$ChtSelect.addClass('chrt_select');
				$ChtSelect.change(function(d){
					toggleObject(this.value, objects_list);
					// toggleObject(object);
				});
				$divAppCharts.append($ChtSelect);
				if(visualization_id == ''){
					$ChtSelectOption_default = $(document.createElement('option'));
					$ChtSelectOption_default.attr('value', visualization_id);
					var selected_text = "Please select a chart";
					$ChtSelectOption_default.text(selected_text);
					$ChtSelect.append($ChtSelectOption_default);
				}
				for (var i=0; i<objects_list.length; i++){
					if(visualization_id != '' && i==0)  {
						$ChtSelectOption_default = $(document.createElement('option'));
						$ChtSelectOption_default.attr('value', visualization_id);
						objects_list.forEach(function(object){
							if(object.objectId == visualization_id)
								selected_text = "Selected: " + objects_list[i].title + "<id - "+visualization_id+">";
						});
						$ChtSelectOption_default.text(selected_text);
						$ChtSelect.append($ChtSelectOption_default);
					}else {
						var object = objects_list[i];
						$ChtSelectOption = $(document.createElement('option'));
						$ChtSelectOption.attr('value', object.objectId);
						$ChtSelectOption.text(object.visualization.charAt(0).toUpperCase() + object.visualization.slice(1) +': '+ (objects_list[i].title=="" ? "<no title>" : objects_list[i].title));
						$ChtSelectOption.click(object, toggleObject);
						$ChtSelect.append($ChtSelectOption);
					}
				}//cycle through charts
			}

			//function that changes to the user targeted chart
			function toggleObject(object, objects_list){
				visualization_id = object;
				renderExtension();
			}
		}
	};
} );