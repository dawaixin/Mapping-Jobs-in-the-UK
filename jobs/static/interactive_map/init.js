// function to build a popup and its contents
function buildPopup(feature_code, nutslevel) {
    var count = 0;
    count = c_map_data[nutslevel][feature_code]['count'];
    var stats = c_map_data[nutslevel][feature_code]['dem_stats'];
    var employment_rate, population, unemployment_rate = 'NA';
    if (stats != 'NA') {
        population =  c_map_data[nutslevel][feature_code]['dem_stats']['population'];
        employment_rate = c_map_data[nutslevel][feature_code]['dem_stats']['employmentrate'];
        unemployment_rate = c_map_data[nutslevel][feature_code]['dem_stats']['unemploymentrate'];
    }
    var id = feature_code+'_chart';
    var content =  "<canvas id='"+id+"' style='max-height: 350px !important;'></canvas>" +
        "<br><div><b>POPULATION:  </b>" + population +"</div>"+
        "<br><div><b>EMPLOYMENT RATE:  </b>" + employment_rate +"%</div>"+
        "<br><div><b>UNEMPLOYMENT RATE:  </b>" + unemployment_rate +"%</div>"+
        "<p id='currentSector' class='alert alert-secondary' style='margin-left: 10px'> Current Sector:  "+currentSector+"</p>" +
        "<button type=\"button\" class=\"btn btn-primary btn-sm\" data-toggle=\"tooltip\" data-placement=\"bottom\" " +
        "title=\"Clear Sector Selection\" onclick='clearSectorWrapper()'><i class=\"fa fa-refresh\" aria-hidden=\"true\"></i>\n</button>";
    return content
}

// function to change the map layer with the sector only
function sectorMapLayer(index) {
    nutsLayer1.eachLayer(function (layer) {
        style = getSectorStyle(layer.feature, 'nuts1', layer.feature.properties.nuts118cd, index);
        layer.setStyle(style);
    });

    nutsLayer2.eachLayer(function (layer) {
        style = getSectorStyle(layer.feature, 'nuts2', layer.feature.properties.nuts218cd, index);
        layer.setStyle(style);
    });

    nutsLayer3.eachLayer(function (layer) {
        style = getSectorStyle(layer.feature, 'nuts3', layer.feature.properties.nuts318cd, index);
        layer.setStyle(style);
    });
}

function updateCurrentSector(currentSector) {
    $( "#currentSector" ).html("Current Sector:  "+currentSector);
}

function clearSectorWrapper() {
    lastClicked = 'NA';
    clearSector();
    var grades = capita ? intervals_capita[currentNutsLevel] : intervals[currentNutsLevel];
    //buildLegend(map, grades);
}

function clearSector() {
    currentSector = 'All';
    updateCurrentSector(currentSector);
    nutsLayer1.eachLayer(function (layer) {
        style = getStyle(layer.feature, 'nuts1', layer.feature.properties.nuts118cd);
        layer.setStyle(style);
    });
    nutsLayer2.eachLayer(function (layer) {
        style = getStyle(layer.feature, 'nuts2', layer.feature.properties.nuts218cd);
        layer.setStyle(style)
    });
    nutsLayer3.eachLayer(function (layer) {
        style = getStyle(layer.feature, 'nuts3', layer.feature.properties.nuts318cd);
        layer.setStyle(style)
    });
    if ($( ".leaflet-control-layers-selector" ).children().eq(0).is(':checked')) {
        layer_id = 'nuts1';
    } else if ($( ".leaflet-control-layers-selector" ).children().eq(1).is(':checked')) {
        layer_id = 'nuts2';
    } else {
        layer_id = 'nuts3';
    }
    var grades = capita ? intervals_capita[layer_id] : intervals[layer_id];
    buildLegend(mymap, grades);
}

function toggleCapita() {
    capita = !capita;
    var layer_id;
    if (lastClicked != 'NA') {
        sectorMapLayer(lastClicked);
        if ($( ".leaflet-control-layers-selector" ).children().eq(0).is(':checked')) {
            layer_id = 'nuts1';
        } else if ($( ".leaflet-control-layers-selector" ).children().eq(1).is(':checked')) {
            layer_id = 'nuts2';
        } else {
            layer_id = 'nuts3';
        }
        var grades = capita ? intervals_capita[layer_id] : intervals[layer_id];
        buildLegend(mymap, grades);
    } else {
        clearSector();
    }
    if (dispCapita == 0) {
        $('#capita_toggle').html('Show Absolute');
        dispCapita = 1;
    } else {
        $('#capita_toggle').html("Show Per Capita");
        dispCapita = 0;
    }
}

function toggleLDA() {
    if (c_map_data == map_data) {
        c_map_data = map_data_d2v;
        c_labels = D2V_20_labels;
        $('#lda_toggle').html("Show LDA");
        clearSector();
    } else {
        c_map_data = map_data;
        c_labels = LDA_20_labels;
        $('#lda_toggle').html("Show doc2vec");
        clearSector();
    }
}

// build the chart for a specific feature on the map
function buildChart(nutslevel, feature_code) {
    var ctx = document.getElementById(feature_code+'_chart').getContext('2d');
    var data_spread =  c_map_data[nutslevel][feature_code]['topic_spread'];
    var population =  c_map_data[nutslevel][feature_code]['dem_stats']['population'];
    var data_spread_capita = [];
    data_spread.forEach(function (e) {
        data_spread_capita.push(e/population*1000000);
    } );
    var labels = [];
    var colours = [];
    var colours2 = [];

    j = 0;
    for (i in data_spread) {
        j = j+1;
        labels.push("Sector "+j);
        colours.push('rgba(152, 68, 71, 1)');
        colours2.push('rgba(68, 71, 152, 1)')
    }
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: c_labels,
            datasets: [{
                label: '# of Job Ads',
                data: data_spread,
                backgroundColor: colours
                },
                {label:'# of Job Ads/Million inhabitants',
                 data: data_spread_capita,
                 backgroundColor: colours2
                }]
        },
        options: {
            'onClick' : function (evt, item) {
                try {
                var bar_index = item[0]['index'];
                currentSector = c_labels[bar_index];
                updateCurrentSector(currentSector);
                sectorMapLayer(bar_index);
                lastClicked = bar_index;
                //get current layer and build the legend
                var layer = 'nuts'+(evt.target.id.length - 8);
                var grades = capita ? sector_intervals_capita[layer] : sector_intervals[layer];
                buildLegend(mymap,grades);
                } catch (err) {
                    // do nothing
                }

            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });
    return myChart;
}
// function to obtain the style wanted for the nuts area
function getStyle(feature, nutslevel, feature_code) {
    var count = 0;
    count = c_map_data[nutslevel][feature_code]['count'];
    var interval = intervals[nutslevel];
    var interval_capita = intervals_capita[nutslevel];

    var population =  c_map_data[nutslevel][feature_code]['dem_stats']['population'];
    var count_capita = count/population*1000000;

    var c = 0;
    var hue;
    if (capita === true) {
        for (var val in interval_capita) {
            if (count_capita <= intervals_capita[nutslevel][val]) {
                hue = hues_capita[val];
                break;
            }
            c++;
        }
    }
    if (capita === false) {
        for (var val in interval) {
            if (count <= intervals[nutslevel][val]) {
                hue = hues[val];
                break;
            }
            c++;
        }
    }
    return {fillColor: hue,
        color: 'grey',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8};
}

// function to obtain the style wanted for the nuts area
function getSectorStyle(feature, nutslevel, feature_code, id) {
    var count = c_map_data[nutslevel][feature_code]['topic_spread'][id];
    var interval = sector_intervals[nutslevel];
    var interval_capita = sector_intervals_capita[nutslevel];

    var population =  c_map_data[nutslevel][feature_code]['dem_stats']['population'];
    var data_spread_capita = [];
    c_map_data[nutslevel][feature_code]['topic_spread'].forEach(function (e) {
        data_spread_capita.push(e/population*1000000);
    } );
    var count_capita = data_spread_capita[id];


    var c = 0;
    var hue;
    if (capita === true) {
        for (var val in interval_capita) {
            if (count_capita <= sector_intervals_capita[nutslevel][val]) {
                hue = hues_capita[val];
                break;
            }
            c++;
        }
    }
    if (capita === false) {
        for (var val in interval) {
            if (count <= sector_intervals[nutslevel][val]) {
                hue = hues[val];
                break;
            }
            c++;
        }
    }
    // return the sector styling
    return {fillColor: hue,
        color: 'grey',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8};
}

function buildLayers(mymap) {
    // BUILD NUTS1 AREAS
    var nutsLayer1 = L.geoJSON(nuts1_boundaries, {

        onEachFeature: function(feature, layer) {
            var content = "<b>"+feature.properties.nuts118nm+"</b> - <b>"+feature.properties.nuts118cd+"</b>";
            layer.bindPopup(content+"<br>"+buildPopup(feature.properties.nuts118cd, 'nuts1'));
            layer.bindTooltip(content);
        }
    });

    nutsLayer1.eachLayer(function (layer) {
        style = getStyle(layer.feature, 'nuts1', layer.feature.properties.nuts118cd);
        layer.setStyle(style);
    });

// BUILD NUTS2 AREAS
    var nutsLayer2 = L.geoJSON(nuts2_boundaries, {
        onEachFeature: function(feature, layer) {
            var content = "<b>"+feature.properties.nuts218nm+"</b> - <b>"+feature.properties.nuts218cd+"</b>";
            layer.bindPopup(content+"<br>"+buildPopup(feature.properties.nuts218cd, 'nuts2'));
            layer.bindTooltip(content);
        }
    });

    nutsLayer2.eachLayer(function (layer) {
        style = getStyle(layer.feature, 'nuts2', layer.feature.properties.nuts218cd);
        layer.setStyle(style)
    });

// BUILD NUTS3 AREAS
    var nutsLayer3 = L.geoJSON(nuts3_boundaries, {
        onEachFeature: function(feature, layer) {
            var content = "<b>"+feature.properties.nuts318nm+"</b> - <b>"+feature.properties.nuts318cd+"</b>";
            layer.bindPopup(content+"<br>"+buildPopup(feature.properties.nuts318cd, 'nuts3'));
            layer.bindTooltip(content);
        }
    });

    nutsLayer3.eachLayer(function (layer) {
        style = getStyle(layer.feature, 'nuts3', layer.feature.properties.nuts318cd);
        layer.setStyle(style)
    });
    // determine the NUTS overlays
    var overlayMaps = {
        "NUTS 1": nutsLayer1,
        "NUTS 2": nutsLayer2,
        "NUTS 3": nutsLayer3
    };

    // add layer controls
    L.control.layers(overlayMaps).addTo(mymap);

    return overlayMaps;
}

// Declare map bounds
var bounds = [
    [49.587480, -12.515764], // Southwest coordinates
    [61.413896, 4.547485] // Northeast coordinates
];

// Add the light themed base layer
var baseLayerLight = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 12,
    minZoom: 6,
    maxBounds: bounds,
    id: 'mapbox/light-v9',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZGF3YWl4aW4iLCJhIjoiY2syNHFyMzU0MHpieTNtbXptOTdiampvZiJ9.94DQzgzJKnUTeDW4xJXAGw'
});


// Initialise the map
var mymap = L.map('interactive-map', {layers:[baseLayerLight]}).setView([55.3781, -3.4360], 6);
// set map binding box
mymap.setMaxBounds(bounds);

// build the overlay
overlayLayers = buildLayers(mymap);
nutsLayer1 = overlayLayers['NUTS 1'];
nutsLayer2 = overlayLayers['NUTS 2'];
nutsLayer3 = overlayLayers['NUTS 3'];
// set the default NUTS layer
mymap.addLayer(nutsLayer1);

var legend = L.control({position: 'bottomleft'});
function buildLegend(map, grades) {
    legend.onAdd = function () {

        var legendhues = capita ? hues_capita : hues;
        var div = L.DomUtil.create('div', 'info legend');
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<span style="display: inline-block; width: 20px; height: 1em; background:' + legendhues[i] + '; "></span><i style="background:' + legendhues[i] + ';"></i> ' +
                (grades[i-1] ? grades[i-1] + '&ndash;' + grades[i] + '<br>' : '0 &ndash;'+ grades[i] + '<br>');
        }

        return div;
    };
    legend.addTo(map);
}
//build the initial legend
buildLegend(mymap, intervals['nuts1']);

mymap.on('popupopen', function (e) {

    if (e.popup._source.feature.properties.hasOwnProperty('nuts118cd')) {
        var code = e.popup._source.feature.properties.nuts118cd;
        var nutslevel = 'nuts1';
    }

    else if (e.popup._source.feature.properties.hasOwnProperty('nuts218cd')) {
        var code = e.popup._source.feature.properties.nuts218cd;
        var nutslevel = 'nuts2';
    }

    else if (e.popup._source.feature.properties.hasOwnProperty('nuts318cd')) {
        var code = e.popup._source.feature.properties.nuts318cd;
        var nutslevel = 'nuts3';
    }

    var currentChart = buildChart(nutslevel, code);
    currentNutsLevel = nutslevel;
    updateCurrentSector(currentSector);
});


mymap.on('baselayerchange', function(e) {
    clearSector();
    switch (e.name) {
        case "NUTS 1":
            var layer = "nuts1";
            break;
        case "NUTS 2":
            var layer = "nuts2";
            break;
        case "NUTS 3":
            var layer = "nuts3";
            break;
    }
    //set the legend
    var grades = capita ? intervals_capita[layer] : intervals[layer];
    buildLegend(mymap, grades);
});
