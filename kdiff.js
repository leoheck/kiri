
// Limit commits list with 2 checked at most
$(document).ready(function () {
	$("input[name='commit']").change(function () {
		var maxAllowed = 2;
		var cnt = $("input[name='commit']:checked").length;
		if (cnt > maxAllowed)
		{
			$(this).prop("checked", "");
		}
	});
});


// =======================================
// HANDLE KEY PRESSES
// =======================================

let keysDown = {};

window.onkeydown = function(e)
{
	keysDown[e.key] = true;
	// console.log(keysDown);

	// =======================================
	// Toggle Schematic/Layout View
	// =======================================

	if (keysDown["s"])
	{
		var elements = document.getElementsByName('view_mode');
		var checkedButton;

		console.log(elements);

		elements.forEach(e => {
		if (e.checked) {
			checkedButton = e.value;
		}
		});

		console.log(checkedButton);

		if (checkedButton == "schematic") {
			new_view = "layout"
			show_layout()
			// $("layout").set("checked", true)
		}
		else {
			new_view = "schematic"
			show_schematic()
			// $("schematic").set("checked", true)
		}

		// var view = $('input[name="view_mode"]:checked').val();
		// var new_view = ""

		// if (view == "schematic") {
		// 	new_view = "layout"
		// 	show_layout()
		// }
		// else {
		// 	view = "layout"
		// 	new_view = "schematic"
		// 	show_schematic()
		// }

		// console.log("view: ", view)
		// console.log("new_view: ", new_view)

		// $("input[name=view_mode][value=" + view + "]").checked = false
		// $("input[name=view_mode][value=" + new_view + "]").checked = true
	}

	// =======================================
	// Next Commit Pair
	// =======================================

	if (keysDown["]"])
	{
		var commits = $("#commits_form input:checkbox[name='commit']");

		var selected_commits = [];
		var next_selected_commits = [];

		for (var i=0; i <commits.length; i++) {
			if ($("#commits_form input:checkbox[name='commit']")[i].checked) {
				selected_commits.push(i);
				next_selected_commits.push(i+1);
			}
		}

		// Move only second item (restore first item)
		next_selected_commits[0] = selected_commits[0];

		if (selected_commits[1] < commits.length-1) {
			for (var i=0; i < selected_commits.length; i++) {
				commits[selected_commits[i]].checked = false;
			}
			for (var i=0; i < selected_commits.length; i++) {
				commits[next_selected_commits[i]].checked = true;
			}
		}

		update_commits()
		keysDown = {};
	}

	if (keysDown.ArrowDown)
	{
		var commits = $("#commits_form input:checkbox[name='commit']");

		var selected_commits = [];
		var next_selected_commits = [];

		for (var i=0; i <commits.length; i++) {
			if ($("#commits_form input:checkbox[name='commit']")[i].checked) {
				selected_commits.push(i);
				next_selected_commits.push(i+1);
			}
		}

		if (selected_commits[1] < commits.length-1) {
			for (var i=0; i < selected_commits.length; i++) {
				commits[selected_commits[i]].checked = false;
			}
			for (var i=0; i < selected_commits.length; i++) {
				commits[next_selected_commits[i]].checked = true;
			}
		}

		update_commits()
		keysDown = {};
	}

	// =======================================
	// Previows Commit Pair
	// =======================================

	if (keysDown["["])
	{
		var commits = $("#commits_form input:checkbox[name='commit']");

		var selected_commits = []
		var next_selected_commits = []

		for (var i=0; i <commits.length; i++) {
			if ($("#commits_form input:checkbox[name='commit']")[i].checked) {
				selected_commits.push(i);
				next_selected_commits.push(i-1);
			}
		}

		next_selected_commits[0] = selected_commits[0];

		if (next_selected_commits[1] > next_selected_commits[0]) {
			for (var i=0; i < selected_commits.length; i++) {
					commits[selected_commits[i]].checked = false;
			}
			for (var i=0; i < selected_commits.length; i++) {
					commits[next_selected_commits[i]].checked = true;
			}
		}

		update_commits()
		keysDown = {};
	}

	if (keysDown.ArrowUp)
	{

		var commits = $("#commits_form input:checkbox[name='commit']");

		var selected_commits = []
		var next_selected_commits = []

		for (var i=0; i <commits.length; i++) {
			if ($("#commits_form input:checkbox[name='commit']")[i].checked) {
				selected_commits.push(i);
				next_selected_commits.push(i-1);
			}
		}

		if (next_selected_commits[0] >= 0) {
			for (var i=0; i < selected_commits.length; i++) {
					commits[selected_commits[i]].checked = false;
			}
			for (var i=0; i < selected_commits.length; i++) {
					commits[next_selected_commits[i]].checked = true;
			}
		}

		update_commits()
		keysDown = {};
	}

	// =======================================
	// Next Layer
	// =======================================

	if (keysDown["l"] || keysDown["L"] || keysDown.ArrowRight)
	{
		keysDown = {};

		var layers = $("#layers_list input:radio[name='layers']");
		var selected_layer = layers.index(layers.filter(':checked'));

		var new_index = selected_layer + 1;
		if (new_index >= layers.length) {
			new_index = 0;
		}

		layers[new_index].checked = true;
		change_layer()
	}

	// =======================================
	// Previows Layer
	// =======================================

	if (keysDown["k"] || keysDown["K"] || keysDown.ArrowLeft)
	{
		keysDown = {};

		var layers = $("#layers_list input:radio[name='layers']");
		var selected_layer = layers.index(layers.filter(':checked'));

		var new_index = selected_layer - 1;
		if (new_index < 0) {
			new_index = layers.length - 1;
		}

		layers[new_index].checked = true;

		change_layer()
	}
}

// =======================================
// =======================================

function update_commits()
{
	var commits = $("#commits_form input:checkbox[name='commit']");
	var values = []

	for (var i=0; i <commits.length; i++) {
		if ($("#commits_form input:checkbox[name='commit']")[i].checked) {
			var value = $("#commits_form input:checkbox[name='commit']")[i].value
			values.push(value);
		}
	}

	var hash1 = values[0].replace(/\s+/g, '')
	var hash2 = values[1].replace(/\s+/g, '')
	var timestamp = new Date().getTime();

	// Update Layout

	current_src1 = document.getElementById("diff1_xlink").href.baseVal;

	var layers = document.getElementsByName('layers');
	for (var layer of layers) {
		if (layer.checked) {
			selected_layer = layer.value
		}
	}

	console.log("layer:", selected_layer)

	if(! selected_layer) {
		selected_layer = "F_Cu"
	}

	var layout_image_path_1 = "../" + hash1 + "/" + "board-" + selected_layer + ".svg"
	var layout_image_path_2 = "../" + hash2 + "/" + "board-" + selected_layer + ".svg"

	console.log("layout_1:", layout_image_path_1)
	console.log("layout_2:", layout_image_path_2)

	document.getElementById("diff1_xlink").href.baseVal = layout_image_path_1 + "?t=" + timestamp
	document.getElementById("diff2_xlink").href.baseVal = layout_image_path_2 + "?t=" + timestamp

	// =======================================
	// Update Schematic

	var sch_image_path_1 = "../" + hash1 + "/" + "sch" + ".svg"
	var sch_image_path_2 = "../" + hash2 + "/" + "sch" + ".svg"

	console.log("   sch_1:", sch_image_path_1)
	console.log("   sch_2:", sch_image_path_2)

	document.getElementById("diff1_xlink_sch").href.baseVal = sch_image_path_1 + "?t=" + timestamp
	document.getElementById("diff2_xlink_sch").href.baseVal = sch_image_path_2 + "?t=" + timestamp
}


function change_layer() {

	var layers = $("#layers_list input:radio[name='layers']");
	var selected_layer = layers.index(layers.filter(':checked'));

	var timestamp = new Date().getTime();

	current_src1 = document.getElementById("diff1_xlink").href.baseVal;
	current_src2 = document.getElementById("diff2_xlink").href.baseVal;

	commit1= current_src1.split("/")[1]
	commit2 = current_src2.split("/")[1]

	var ref1 = "../" + commit1+ "/" + "board-" + layers[selected_layer].value + ".svg"
	var ref2 = "../" + commit2 + "/" + "board-" + layers[selected_layer].value + ".svg"

	document.getElementById("diff1_xlink").href.baseVal = ref1 + "?t=" + timestamp;
	document.getElementById("diff2_xlink").href.baseVal = ref2 + "?t=" + timestamp;
}

// =======================================
// SVG Controls
// =======================================

window.onload = function()
{
	window.panZoomDiff = svgPanZoom('#svg-id1', {
		zoomEnabled: true,
		controlIconsEnabled: true,
		center: true,
		minZoom: 1,
		maxZoom: 20,
	});

	window.panZoomDiff = svgPanZoom('#svg-id2', {
		zoomEnabled: true,
		controlIconsEnabled: true,
		center: true,
		minZoom: 1,
		maxZoom: 20,
	});
};

// =======================================
// Schematic/Layout Toggle
// =======================================

// function myFunction() {
// 	if (document.getElementById("schematic").checked) {
// 		show_schematic()
// 	} else if (document.getElementById("layout").checked) {
// 		show_layout()
// 	}
// }

function blur_toolbar() {
	var view_mode = document.getElementById("view_mode");
	var view_type = document.getElementById("view_type");

	view_mode.blur();
	view_type.blur();
}

function show_schematic()
{
	console.log("show_schematic")

	// Hide layout image
	var layout_view = document.getElementById("compo-container1");
	layout_view.style.display = "none";

	// Hide layers list
	var layers_list = document.getElementById("layers_list");
	layers_list.style.display = "none";

	// Show schematic image
	var schematic_view = document.getElementById("compo-container2");
	schematic_view.style.display = "inline";

	blur_toolbar();
}

function show_layout()
{
	console.log("show_layout")

	// Show layout sch_image_path_2
	var layout_view = document.getElementById("compo-container1");
	layout_view.style.display = "inline";

	// Show layers list
	var layers_list = document.getElementById("layers_list");
	layers_list.style.display = "inline";

	// Hide layers list
	var schematic_view = document.getElementById("compo-container2");
	schematic_view.style.display = "none";

	blur_toolbar();
}
