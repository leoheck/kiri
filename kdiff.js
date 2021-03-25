
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

var panZoom_sch;
var panZoom_pcb;

var keysDown = {};

window.onkeydown = function(e)
{
	keysDown[e.key] = true;
	console.log(keysDown);

	// =======================================
	// Toggle Schematic/Layout View
	// =======================================

	if (keysDown["s"])
	{
		console.log("==========================")

		var view_mode = $('#view_mode input[name="view_mode"]:checked').val();

		var next_view_mode = ""

		if (view_mode == "show_sch") {
			next_view_mode = "show_pcb"

			show_pcb()

			document.getElementById("show_sch_lbl").classList.remove('active');
			document.getElementById("show_sch").checked = false;

			document.getElementById("show_pcb_lbl").classList.add('active');
			document.getElementById("show_pcb").checked = true;
		}
		else {
			next_view_mode = "show_sch"

			show_sch()

			document.getElementById("show_sch_lbl").classList.add('active');
			document.getElementById("show_sch").checked = true;

			document.getElementById("show_pcb_lbl").classList.remove('active');
			document.getElementById("show_pcb").checked = false;
		}

		console.log("current_view_mode:", next_view_mode)
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
	}

	// =======================================
	// Next Schematic Page / Layout
	// =======================================

	if (keysDown["l"] || keysDown["L"] || keysDown.ArrowRight)
	{
		if (document.getElementById("show_sch").checked)
		{
			var pages = $("#pages_list input:radio[name='pages']");
			var selected_layer = pages.index(pages.filter(':checked'));

			var new_index = selected_layer + 1;
			if (new_index >= pages.length) {
				new_index = 0;
			}

			pages[new_index].checked = true;

			change_page()
		}
		else
		{
			var layers = $("#layers_list input:radio[name='layers']");
			var selected_layer = layers.index(layers.filter(':checked'));

			var new_index = selected_layer + 1;
			if (new_index >= layers.length) {
				new_index = 0;
			}

			layers[new_index].checked = true;

			change_layer()
		}
	}

	// =======================================
	// Previews Schematic Page / Layer
	// =======================================

	if (keysDown["k"] || keysDown["K"] || keysDown.ArrowLeft)
	{
		if (document.getElementById("show_sch").checked)
		{
			var pages = $("#pages_list input:radio[name='pages']");
			var selected_page = pages.index(pages.filter(':checked'));

			var new_index = selected_page - 1;
			if (new_index < 0) {
				new_index = pages.length - 1;
			}

			pages[new_index].checked = true;

			change_page()
		}
		else
		{
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
	// Zoom Reset
	// =======================================

	if (keysDown["f"] || keysDown["F"])
	{
		console.log("Reset View")

		if (document.getElementById('diff-sch').style.display === "inline") {
			panZoom_sch.resetZoom()
			panZoom_sch.center();
			// panZoom_sch.fit() // cannot be used, bug?
		}
		else
		{
			panZoom_pcb.resetZoom()
			panZoom_pcb.center();
			// panZoom_pcb.fit() // cannot be used, bug?
		}

		keysDown = {};
	}

	keysDown = {};
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

	var commit1 = values[0].replace(/\s+/g, '')
	var commit2 = values[1].replace(/\s+/g, '')
	var timestamp = new Date().getTime();

	// =======================================
	// Update Layout

	var current_src1 = document.getElementById("diff-xlink-1-sch").href.baseVal;
	var board_name = "board"

	var layers = document.getElementsByName('layers');
	for (var layer of layers) {
		if (layer.checked) {
			selected_layer = layer.value
		}
	}

	console.log("==========================")
	console.log("layer:", selected_layer)

	if(! selected_layer) {
		selected_layer = "F_Cu"
	}

	var pcb_image_path_1 = "../" + commit1 + "/" + board_name + "-" + selected_layer + ".svg"
	var pcb_image_path_2 = "../" + commit2 + "/" + board_name + "-" + selected_layer + ".svg"

	console.log("pcb_1:", pcb_image_path_1)
	console.log("pcb_2:", pcb_image_path_2)

	document.getElementById("diff-xlink-1-pcb").href.baseVal = pcb_image_path_1 + "?t=" + timestamp
	document.getElementById("diff-xlink-2-pcb").href.baseVal = pcb_image_path_2 + "?t=" + timestamp

	// =======================================
	// Update Schematic

	var pages = $("#pages_list input:radio[name='pages']");
	var selected_page = pages.index(pages.filter(':checked'));

	var sch_image_path_1 = "../" + commit1 + "/" + "sch-" + pages[selected_page].value + ".svg"
	var sch_image_path_2 = "../" + commit2 + "/" + "sch-" + pages[selected_page].value + ".svg"

	console.log("sch_1:", sch_image_path_1)
	console.log("sch_2:", sch_image_path_2)

	document.getElementById("diff-xlink-1-sch").href.baseVal = sch_image_path_1 + "?t=" + timestamp
	document.getElementById("diff-xlink-2-sch").href.baseVal = sch_image_path_2 + "?t=" + timestamp

	// =======================================
	// Update Legend

	// # Update legend hash (where is the best place to put this?)
	document.getElementById("commit1_legend_hash").innerHTML = commit1.toUpperCase();
	document.getElementById("commit2_legend_hash").innerHTML = commit2.toUpperCase();
}

// NOT working yet
function change_page()
{
	var pages = $("#pages_list input:radio[name='pages']");
	var selected_page = pages.index(pages.filter(':checked'));

	var timestamp = new Date().getTime();

	var current_src1 = document.getElementById("diff-xlink-1-sch").href.baseVal;
	var current_src2 = document.getElementById("diff-xlink-2-sch").href.baseVal;

	console.log("selected_page:", pages[selected_page].value)

	commit1 = current_src1.split("/")[1]
	commit2 = current_src2.split("/")[1]

	// TODO: FIX THESE PATHS (HARD)
	var ref1 = "../" + commit1 + "/" + "sch-" + pages[selected_page].value + ".svg"
	var ref2 = "../" + commit2 + "/" + "sch-" + pages[selected_page].value + ".svg"

	console.log("page1:", ref1)
	console.log("page2:", ref2)

	document.getElementById("diff-xlink-1-pcb").href.baseVal = ref1 + "?t=" + timestamp;
	document.getElementById("diff-xlink-2-pcb").href.baseVal = ref2 + "?t=" + timestamp;
}

function change_layer()
{
	var layers = $("#layers_list input:radio[name='layers']");
	var selected_layer = layers.index(layers.filter(':checked'));
	console.log("selected_layer:", layers[selected_layer].value)

	var timestamp = new Date().getTime();

	var current_src1 = document.getElementById("diff-xlink-1-pcb").href.baseVal;
	var current_src2 = document.getElementById("diff-xlink-2-pcb").href.baseVal;

	commit1 = current_src1.split("/")[1]
	commit2 = current_src2.split("/")[1]

	var board_name = "board"

	var ref1 = "../" + commit1 + "/" + board_name + "-" + layers[selected_layer].value + ".svg"
	var ref2 = "../" + commit2 + "/" + board_name + "-" + layers[selected_layer].value + ".svg"

	document.getElementById("diff-xlink-1-pcb").href.baseVal = ref1 + "?t=" + timestamp;
	document.getElementById("diff-xlink-2-pcb").href.baseVal = ref2 + "?t=" + timestamp;

}

// =======================================
// SVG Controls
// =======================================

window.onload = function()
{
	panZoom_sch = svgPanZoom(
		'#svg-id-sch', {
			zoomEnabled: true,
			controlIconsEnabled: false,
			center: true,
			minZoom: 1,
			maxZoom: 20,
			fit: false, // cannot be used, bug? (this one must be here to change the default)
			viewportSelector: '.svg-pan-zoom_viewport-sch',
			eventsListenerElement: document.querySelector('#svg-id-sch .svg-pan-zoom_viewport-sch')
		}
	);

	panZoom_pcb = svgPanZoom(
		'#svg-id-pcb', {
			zoomEnabled: true,
			controlIconsEnabled: false,
			center: true,
			minZoom: 1,
			maxZoom: 20,
			fit: false, // cannot be used, bug? (this one must be here to change the default)
			viewportSelector: '.svg-pan-zoom_viewport-pcb',
			eventsListenerElement: document.querySelector('#svg-id-pcb .svg-pan-zoom_viewport-pcb')
		}
	);

	document.getElementById('zoom-in').addEventListener('click', function(ev)
	{
		ev.preventDefault()

		if (document.getElementById('diff-sch').style.display === "inline") {
			panZoom_sch.zoomIn()
		}
		else {
			panZoom_pcb.zoomIn()
		}
	});

	document.getElementById('zoom-out').addEventListener('click', function(ev)
	{
		ev.preventDefault()

		if (document.getElementById('diff-sch').style.display === "inline") {
			panZoom_sch.zoomOut()
		}
		else
		{
			panZoom_pcb.zoomOut()
		}
	});

	document.getElementById('reset').addEventListener('click', function(ev)
	{
		ev.preventDefault()

		if (document.getElementById('diff-sch').style.display === "inline") {
			panZoom_sch.resetZoom()
			panZoom_sch.center();
			// panZoom_sch.fit() // cannot be used, bug?
		}
		else
		{
			panZoom_pcb.resetZoom()
			panZoom_pcb.center();
			// panZoom_pcb.fit() // cannot be used, bug?
		}
	});
};

// =======================================
// Toggle Schematic/Layout
// =======================================

function reload(id)
{
	var container = document.getElementById(id);
	var content = container.innerHTML;
	// container.innerHTML= content;
	console.log(content);
	console.log(id, "refreshed");
}

function show_sch()
{
	// Show schematic image
	var sch_view = document.getElementById("diff-sch");
	sch_view.style.display = "inline";
	// reload("diff-sch")
	// reload("svg-id-sch")

	// Show pages list
	var layers_list = document.getElementById("pages_list");
	pages_list.style.display = "inline";

	// Hide layout image
	var pcb_view = document.getElementById("diff-pcb");
	pcb_view.style.display = "none";

	// Hide layers list
	var layers_list = document.getElementById("layers_list");
	layers_list.style.display = "none";
}

function show_pcb()
{
	// Hide layers list
	var sch_view = document.getElementById("diff-sch");
	sch_view.style.display = "none";

	// Hide pages list
	var layers_list = document.getElementById("pages_list");
	pages_list.style.display = "none";

	// Show layout image
	var pcb_view = document.getElementById("diff-pcb");
	pcb_view.style.display = "inline";
	// reload("diff-pcb")
	// reload("svg-id-pcb")

	// Show layers list
	var layers_list = document.getElementById("layers_list");
	layers_list.style.display = "inline";
}

// =======================================
// =======================================

function imgError(image)
{
	console.log(image)
	// image.onerror = "../blank.svg";
	// image.src = "../blank.svg";
	return true;
}
