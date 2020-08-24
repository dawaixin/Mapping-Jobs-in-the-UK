// Contains the lowest job count for an area and highest job count for an area for each of the 3 nuts region levels
var nuts1_min = 452;
var nuts1_max = 735615;

var nuts2_min = 0;
var nuts2_max = 455158;

var nuts3_min = 0;
var nuts3_max = 435358;

var intervals = {
    "nuts1":[10000, 50000, 100000, 200000, 300000, 450000, 600000, 800000],
    "nuts1v":[82136, 163820, 245504, 327188, 408872, 490556, 572240, 653924, 735615],
    "nuts2":[5000, 10000, 25000, 50000, 75000, 100000, 150000, 250000, 500000],
    "nuts2v":[50573, 101146, 151719, 202292, 252865, 303438, 354011, 404584, 455158],
    "nuts3":[1000, 5000, 10000, 25000, 50000, 75000, 100000, 150000, 500000],
    "nuts3v":[48373, 96746, 145119, 193492, 241865, 290238, 338611, 386984, 435358]};

var intervals_capita = {
    "nuts1":[5000, 10000, 25000, 50000, 75000, 100000, 150000, 500000],
    "nuts2":[5000, 10000, 25000, 50000, 75000, 100000, 150000, 500000],
    "nuts3":[5000, 10000, 25000, 50000, 75000, 100000, 150000, 500000],
};
var sector_intervals = {
    "nuts1":[1000, 2500, 5000, 10000, 15000, 25000, 50000, 75000],
    "nuts2":[500, 1000, 2500, 5000, 10000, 20000, 30000, 50000],
    "nuts3":[100, 500, 1000, 2500, 5000, 10000, 20000, 50000]
};

var sector_intervals_capita = {
    "nuts1":[50, 100, 250, 500, 1000,  2500, 6000, 12000],
    "nuts2":[100, 500, 1000, 2500, 5000, 10000, 15000, 20000],
    "nuts3":[100, 500, 1000, 2500, 5000, 10000, 15000, 20000]
};

var capita = false;

// Choropleth colors from http://colorbrewer2.org/
// You can choose your own range (or different number of colors)
// and the code will compensate.

var hues = ['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026'];
var hues_capita = ['#ffffd9','#edf8b1','#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494','#081d58'];

var LDA_20_labels = [
    "Temp Work",
    "Customer Service",
    "Personal Trainers",
    "Office Support Staff",
    "Law",
    "Teaching",
    "Technicians/Warehouse operatives",
    "Accountancy and Management",
    "Digital Marketing",
    "Social Care/Assistance",
    "Project Management",
    "Sales/Account manager",
    "Company Value Statement",
    "Service/Maintenance Engineering",
    "Technical Support",
    "Education (Tradewind Recruitment)",
    "Recruitment Consultant",
    "Software Engineering and Technology",
    "Teaching",
    "Care Assistance/Nursing"
];

var D2V_20_labels = [
    "Recruitment Consultant",
    "Service/Maintenance Engineering",
    "Teaching Assistance",
    "Communication",
    "Warehouse Operative",
    "Project Management",
    "Project Management",
    "Care Assistance/Nursing",
    "Recruitment",
    "Operations/Supply management",
    "Sales",
    "Social care",
    "Temp Work",
    "Marketing",
    "Sales Manager",
    "Equal opportunity",
    "Support Worker",
    "Technician",
    "Care Assistance (Adult)",
    "Social Care (Children/Youth)"
];

// variable to hold the current sector on display
var currentSector = "All";

// last clicked sector
var lastClicked = 'NA';

var currentNutsLevel = '';

var dispCapita = 0;
//current map data
var c_map_data = map_data;
var c_labels = LDA_20_labels;