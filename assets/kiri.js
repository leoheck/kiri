// jshint esversion:6

// Hashes for the two selected commits
var commit1;
var commit2;
// Commits objects list
var commits_form;
// How may commits
var num_commits;

var old_view;
var current_view = "show_sch";

current_diff_filter = "diff" // diff or normal

var panZoom_instance = null;
var lastEventListener = null;
var lastEmbed = null;

sch_current_zoom = null;
sch_old_zoom = null;
sch_current_pan = null;

pcb_current_zoom = null;
pcb_old_zoom = null;
pcb_current_pan = null;

// Variables updated by Kiri
var selected_view = "schematic";

var is_fullscreen = false;

// Schematic sheets for the commit1
var sheet_pages_commit1 = new Set();
// Schematic sheets for the commit1
var sheet_pages_commit2 = new Set();
// Displayed schematic sheets
var current_sheets_list = [];
// PCB layers for commit1
var layers_commit1 = new Set();
// PCB layers for commit2
var layers_commit2 = new Set();
// Displayed PCB layers
var current_layers_list = [];
// Icon to indicate the schematic was changed in a commit
const SCH_IMG = '<span class="icon-sch-modif"></span>';
// Icon to indicate the PCB was changed in a commit
const PCB_IMG = '<span class="icon-pcb-modif"></span>';
// Icon to indicate no change in a commit
const EMPTY_IMG = '<span class="icon-x-modif"></span>';
// Color for the commit1
var commit1_legend_color;
// Color for the commit2
var commit2_legend_color;
// Color when only one commit is displayed
var commit_standalone_color;

// Image 1 element
var diff_xlink_1;
// Image 2 element
var diff_xlink_2;

// List of pages (objects)
var pages;
// Which one is selected
var selected_page = -1;
// List of layers (objects)
var layers;
// Which one is selected
var selected_layer = -1;

// =======================================
// HANDLE SHORTCUTS
// =======================================

// Move 2nd commit downwards
function select_next_2_commits() {
    var commit2_order = order_of(commit2);
    if (commit2_order == num_commits) {
        console.log('Already at the bottom');
        return;
    }
    // Move the lower 1 place down
    commit2.checked = false;
    commit2 = commits_form[commit2_order];
    commit2.checked = true;
    update_commits();
}

function order_of(commit) {
    return parseInt(commit.getAttribute('order'));
}

// Move commits par downwards
function select_next_commit() {
    var commit1_order = order_of(commit1);
    var commit2_order = order_of(commit2);
    var changed = false;
    if (commit2_order < num_commits) {
        // Move the lower 1 place down
        commit2.checked = false;
        commit2 = commits_form[commit2_order];
        commit2.checked = true;
        changed = true;
        commit2_order = commit2_order + 1;
    }
    if ((commit1_order + 1) < commit2_order) {
        // Move the upper 1 place down
        commit1.checked = false;
        commit1 = commits_form[commit1_order];
        commit1.checked = true;
        changed = true;
    }
    if (! changed) {
        console.log('Already at the bottom');
        return;
    }
    update_commits();
}

// Move 2nd commit upwards
function select_previous_2_commits() {
    var commit1_order = order_of(commit1);
    var commit2_order = order_of(commit2);
    if ((commit2_order - 1) <= commit1_order) {
        console.log('Already next to the first');
        return;
    }
    // Move the lower 1 place up
    commit2.checked = false;
    commit2 = commits_form[commit2_order - 2];
    commit2.checked = true;
    update_commits();
}

// Move commits par upwards
function select_previous_commit()
{
    var commit1_order = order_of(commit1);
    var commit2_order = order_of(commit2);
    var changed = false;
    if (commit1_order > 1) {
        // Move the upper 1 place up
        commit1.checked = false;
        commit1 = commits_form[commit1_order - 2];
        commit1.checked = true;
        changed = true;
        commit1_order = commit1_order - 1;
    }
    if ((commit2_order - 1) > commit1_order) {
        // Move the lower 1 place up
        commit2.checked = false;
        commit2 = commits_form[commit2_order - 2];
        commit2.checked = true;
        changed = true;
    }
    if (! changed) {
        console.log('Already at the top');
        return;
    }
    update_commits();
}

function update_commit_legend_visibility(id, status)
{   // Make all elements of the commitN class visible/hidden
    for (const e of document.getElementsByClassName("commit"+id)) {
        e.style.visibility = status;
    }
}

function update_commit_legend_color(id, color)
{   // Adjust the color for all the elements of the commitN class
    if (! color) {
        color = (id == 1 ? commit1_legend_color : commit2_legend_color);
    }
    for (const e of document.getElementsByClassName("icon-commit"+id+"-color")) {
        e.style.color = color;
    }
}

function set_image_filters(img1=true, img2=true) {
    if (img1 && img2) {
        diff_xlink_1.style.filter = 'url(#filter-1)'; /// FILTER_DEFAULT
        diff_xlink_2.style.filter = 'url(#filter-2)'; /// FILTER_DEFAULT
    } else if (img1) {
        diff_xlink_1.style.filter = 'url(#filter-12)'; /// FILTER_WHITE
    } else if (img2) {
        diff_xlink_2.style.filter = 'url(#filter-22)'; /// FILTER_WHITE
    }
}

function reset_commits_selection()
{
    commit1.checked = false;
    commit2.checked = false;
    commit1 = commits_form[0];
    commit2 = commits_form[1];
    commit1.checked = true;
    commit2.checked = true;

    // reset visibility of the diff images
    update_commit_legend_visibility(1, 'visible');
    update_commit_legend_color(1);

    update_commit_legend_visibility(2, 'visible');
    update_commit_legend_color(2);

    update_commit_legend_visibility(3, 'visible');

    set_image_filters();

    update_commits();
}

function toggle_sch_pcb_view() {
    old_view = current_view;
    if (current_view == "show_sch") {
        show_pcb();
    } else {
        show_sch();
    }
    update_commits();
}

function toggle_old_commit_visibility()
{
    if (diff_xlink_1.style.visibility === "hidden")
    {
        current_diff_filter = "diff";
        set_image_filters();
        update_commit_legend_visibility(1, 'visible');
        update_commit_legend_visibility(3, 'visible');
        update_commit_legend_color(1);
        update_commit_legend_color(2);
    }
    else
    {
        current_diff_filter = "single";
        set_image_filters(false, true);
        update_commit_legend_visibility(1, 'hidden');
        update_commit_legend_visibility(2, 'visible');
        update_commit_legend_visibility(3, 'hidden');
        update_commit_legend_color(2, commit_standalone_color);
    }
}

function toggle_new_commit_visibility()
{
    if (diff_xlink_2.style.visibility === "hidden")
    {
        current_diff_filter = "diff";
        set_image_filters();
        update_commit_legend_visibility(2, 'visible');
        update_commit_legend_visibility(3, 'visible');
        update_commit_legend_color(1);
        update_commit_legend_color(2);
    }
    else
    {
        current_diff_filter = "single";
        set_image_filters(true, false);
        update_commit_legend_visibility(1, 'visible');
        update_commit_legend_visibility(2, 'hidden');
        update_commit_legend_visibility(3, 'hidden');
        update_commit_legend_color(1, commit_standalone_color);
    }
}

function select_next_sch_or_pcb(cycle = false) {
    if (current_view == "show_sch") {
        selected_page = selected_page + 1;
        if (selected_page >= pages.length) {
            selected_page = (cycle ? 0 : pages.length - 1);
        }
        pages[selected_page].checked = true;
        update_selected_page();
    }
    else
    {
        selected_layer = selected_layer + 1;
        if (selected_layer >= layers.length) {
            selected_layer = (cycle ? 0 : layers.length - 1);
        }
        layers[selected_layer].checked = true;
        update_selected_layer();
    }
}

function select_preview_sch_or_pcb(cycle = false) {
    if (current_view == "show_sch") {
        selected_page = selected_page - 1;
        if (selected_page < 0) {
            selected_page = (cycle ? pages.length - 1 : 0);
        }
        pages[selected_page].checked = true;
        update_selected_page();
    } else {
        selected_layer = selected_layer - 1;
        if (selected_layer < 0) {
            selected_layer = (cycle ? layers.length - 1 : 0);
        }
        layers[selected_layer].checked = true;
        update_selected_layer();
    }
}

function svg_fit_center()
{
    panZoom_instance.resetZoom();
    panZoom_instance.center();
}

function svg_zoom_in()
{
    panZoom_instance.zoomIn();
}

function svg_zoom_out()
{
    panZoom_instance.zoomOut();
}

function manual_pan(direction)
{
    const step = 50;

    switch(direction) {
       case "Up":
            panZoom_instance.panBy({x: 0, y: step});
            break;
       case "Down":
            panZoom_instance.panBy({x: 0, y: -step});
            break;
       case "Left":
            panZoom_instance.panBy({x: step, y: 0});
            break;
       case "Right":
            panZoom_instance.panBy({x: -step, y: 0});
            break;
    }
}

document.onkeydown = function (e) {
    /*console.log('e.key', e.key);
    console.log('e.altKey', e.altKey);
    console.log('e.code', e.code);*/
    if (e.altKey && ! (e.ctrlKey || e.metaKey)) {
        // ALT + xxx
        switch (e.code) {
            case "KeyR":
                reset_commits_selection();
                break;
            case "KeyQ":
                toggle_new_commit_visibility();
                break;
            case "KeyW":
                toggle_old_commit_visibility();
                break;
            // SVG PAN
            case "ArrowUp":
            case "ArrowDown":
            case "ArrowLeft":
            case "ArrowRight":
                manual_pan(e.key.substring(5));
                break;
        }
    } else if ((e.ctrlKey || e.metaKey) && ! e.altKey) {
        // CTRL/Command + xxxx
        switch (e.code) {
            case "ArrowUp":
            case "BracketLeft":
                select_previous_2_commits();
                break;
            case "ArrowDown":
            case "BracketRight":
                select_next_2_commits();
                break;
            case "ArrowLeft":
                select_preview_sch_or_pcb(true);
                break;
            case "ArrowRight":
                select_next_sch_or_pcb(true);
                break;
        }
    } else if (! (e.ctrlKey || e.metaKey || e.altKey)) {
        // Key alone
        switch (e.code) {
            case "ArrowUp":
            case "BracketLeft":
                select_previous_commit();
                break;
            case "ArrowDown":
            case "BracketRight":
                select_next_commit();
                break;
            // View
            case "KeyS":
                toggle_sch_pcb_view();
                break;
            case "ArrowLeft":
                select_preview_sch_or_pcb();
                break;
            case "ArrowRight":
                select_next_sch_or_pcb();
                break;
             // SVG ZOOM
             case "Digit0":
                 svg_fit_center();
                 break;
             // Misc
             case "KeyF":
                 toggle_fullscreen();
                 break;
             case "KeyI":
                 document.getElementById("info-btn").click();
                 break;
             default:
                 switch (e.key) {
                     case "+":
                          svg_zoom_in();
                          break;
                     case "-":
                          svg_zoom_out();
                          break;
                 }
        }
    }
}


// =======================================
// =======================================

// For images related with each commit, it is good to have the same image cached with the same specially when serving throug the internet
// For those images, it uses the commit hash as the timestamp
function url_timestamp(timestamp_id="") {
    if (timestamp_id) {
        return "?t=" + timestamp_id;
    }
    else {
        return "?t=" + new Date().getTime();
    }
}

function if_url_exists(url, callback) {
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.setRequestHeader('Accept', '*/*');
    request.onprogress = function(event) {
        let status = event.target.status;
        let statusFirstNumber = (status).toString()[0];
        switch (statusFirstNumber) {
            case '2':
                request.abort();
                return callback(true);
            default:
                request.abort();
                return callback(false);
        }
    };
    request.send('');
}

// Called on commit checkbox change
function update_selected_commits(commit, order) {
    console.log('Changing '+commit.value+' to '+commit.checked);
    if (! commit.checked) {
        // Keep 2 selected
        commit.checked = true;
        console.log('- Not allowed, we need 2 selected');
        return;
    }
    // A new selection, keep only 2 selected
    if (order < parseInt(commit1.getAttribute('order'))) {
        commit1.checked = false;
        commit1 = commit;
        console.log('- Moving commit1');
    } else {
        commit2.checked = false;
        commit2 = commit;
        console.log('- Moving commit2');
    }
    update_commits();
}

function update_commits() {

    // Remove tooltips so they dont get stuck
    //$('[data-toggle="tooltip"]').tooltip("hide");

    console.log("================================================================================");
    console.log("commit1:", commit1.value);
    console.log("commit2:", commit2.value);

    // 1. Update commit_legend_links
    // 2. Update commit_legend
    // 3. Update current_diff_view
    var commit1_hash = document.getElementById("commit1_hash");
    var commit2_hash = document.getElementById("commit2_hash");
    // Not yet synced, so this is the old
    var old_commit1 = commit1_hash.value;
    var old_commit2 = commit2_hash.value;

    // Update commit_legend_links
    var kicad_pro_path_1 = document.getElementById("commit1_kicad_pro_path").value;
    var kicad_pro_path_2 = document.getElementById("commit2_kicad_pro_path").value;
    document.getElementById("commit1_kicad_pro_path").value = kicad_pro_path_1.replace(old_commit1, commit1.value);
    document.getElementById("commit2_kicad_pro_path").value = kicad_pro_path_2.replace(old_commit2, commit2.value);

    // Update commit_legend
    commit1_hash.value = commit1.value;
    commit2_hash.value = commit2.value;
    document.getElementById("commit1_legend_hash").innerHTML = commit1.value;
    document.getElementById("commit2_legend_hash").innerHTML = commit2.value;

    // Update current_diff_view
    if (current_view == "show_sch") {
        update_page();
    } else {
        update_layer();
    }
}

function loadFile(filePath) {

    console.log("filePath:", filePath);

    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('GET', filePath, false);
    xmlhttp.send();
    if (xmlhttp.status==200) {
        result = xmlhttp.responseText;
    }
    return result.split("\n").filter((a) => a);
}

function change_selected_page(index) {
    selected_page = index;
    update_selected_page();
}

function update_selected_page()
{
    var page_filename = pages[selected_page].value.replace(".kicad_sch", "").replace(".sch", "");
    var image_path_1;
    var image_path_2;

    if (sheet_pages_commit1.has(page_filename)) {
        image_path_1 = commit1.value + "/_KIRI_/sch/" + page_filename + ".svg";
    } else {
        image_path_1 = "blank.svg";
    }

    if (sheet_pages_commit2.has(page_filename)) {
        image_path_2 = commit2.value + "/_KIRI_/sch/" + page_filename + ".svg";
    } else {
        image_path_2 = "blank.svg";
    }

    console.log("[SCH] page_filename =", page_filename);
    console.log("[SCH]  image_path_1 =", image_path_1);
    console.log("[SCH]  image_path_2 =", image_path_2);

    var image_path_timestamp_1 = image_path_1 + url_timestamp(commit1.value);
    var image_path_timestamp_2 = image_path_2 + url_timestamp(commit2.value);

    if (current_view != old_view)
    {
        old_view = current_view;
        removeEmbed();
        lastEmbed = createNewEmbed(image_path_timestamp_1, image_path_timestamp_2);
    }
    else
    {
        diff_xlink_1.href.baseVal = image_path_timestamp_1;
        diff_xlink_2.href.baseVal = image_path_timestamp_2;

        diff_xlink_1.setAttributeNS('http://www.w3.org/1999/xlink', 'href', image_path_timestamp_1);
        diff_xlink_2.setAttributeNS('http://www.w3.org/1999/xlink', 'href', image_path_timestamp_2);
    }

    update_fullscreen_label();
}

function update_page()
{
    console.log("-----------------------------------------");

    // Runs only when updating commits
    update_sheets_list();
    update_selected_page();
}

function update_sheets_list() {

    // File = [COMMIT]/_KIRI_/sch_sheets
    // Data format: Name_without_extension|Relative_file_name|UUID|Instance_name|Sheet_Path_Name

    data1 = loadFile(commit1.value + "/_KIRI_/sch_sheets" + url_timestamp(commit1));
    data2 = loadFile(commit2.value + "/_KIRI_/sch_sheets" + url_timestamp(commit2));

    var sheets = [];
    var new_sheets_list = [];

    sheet_pages_commit1 = new Set();
    for (const d of data1)
    {
        sheets.push(d);
        sheet = d.split("|")[4];
        sheet_pages_commit1.add(sheet);
        new_sheets_list.push(sheet);
    }

    sheet_pages_commit2 = new Set();
    for (const d of data2)
    {
        if (! sheets.includes(d))
        {
            sheets.push(d);
        }
        sheet = d.split("|")[4];
        sheet_pages_commit2.add(sheet);
        new_sheets_list.push(sheet);
    }

    sheets = Array.from(new Set(sheets));

    console.log("[SCH]  Sheets =", sheets.length);
    console.log("sheets", sheets);

    var form_inputs_html;
    var index = 0;

    for (const d of sheets)
    {
        var splitted = d.split("|");
        var visible_sheet = splitted[3];
        var sheet = splitted[4];
        var color_style;
        in_c1 = sheet_pages_commit1.has(sheet);
        in_c2 = sheet_pages_commit2.has(sheet);
        if (in_c1 && in_c2) {
            color_style = "normal_item";
        } else if (in_c2) {
            color_style = "removed_item";
        } else {
            color_style = "added_item";
        }

        var input_html = `
        <input id="${sheet}" data-toggle="tooltip" title="${sheet}" type="radio" value="${sheet}" name="pages" onchange="change_selected_page(${index})">
            <label for="${sheet}" data-toggle="tooltip" title="${sheet}" id="label-${sheet}" class="rounded text-sm-left list-group-item radio-box">
                <span data-toggle="tooltip" title="${sheet}" class="icon-sheet-page"></span>
                <span class="${color_style}">${visible_sheet}</span>
            </label>
        </label>
        `;

        form_inputs_html = form_inputs_html + input_html;
        index = index + 1;
    }

    // Return if the current list is equal to the new list
    console.log("current_sheets_list = ", current_sheets_list);
    console.log("new_sheets_list = ", new_sheets_list);
    if (current_sheets_list.toString() === new_sheets_list.toString()) {
        console.log("Keep the same list of sheets");
        return;
    }
    current_sheets_list = new_sheets_list;

    // ID for the previous selection (if any)
    var old_selected_page_id;
    if (selected_page >= 0) {
        old_selected_page_id = pages[selected_page].id;
    }

    // Update list of pages
    console.log('Updating the list of pages');
    document.getElementById("pages_list_form").innerHTML = form_inputs_html.replace("undefined", "");

    var new_sel;
    if (selected_page >= 0) {
        const optionLabels = Array.from(pages).map((opt) => opt.id);
        new_sel = optionLabels.indexOf(old_selected_page_id);
        // Choose the last if it no longer exist (removed/added?)
        new_sel = (new_sel >= 0 ? new_sel : optionLabels.length - 1);
    } else { // First run, nothings selected, select the first
        new_sel = 0;
    }
    pages[new_sel].checked = true;
    selected_page = new_sel;
}

function pad(num, size)
{
    num = num.toString();
    while (num.length < size) {
        num = "0" + num;
    }
    return num;
}

function load_commits()
{
    commit1 = commit2 = -1;
    commits = loadFile("commits");
    var i = 1;
    var all_commits_html = "";
    for (const line of commits)
    {
        // Data format: HASH|DATE|AUTHOR|DESCRIPTION|SCH_CHANGED|PCB_CHANGED
        splitted = line.split("|");
        var hash = splitted[0];
        var dt = splitted[1];
        var author = splitted[2];
        var desc = splitted[3];
        var tooltip = `Commit: ${hash}&#013;&#010;Date: ${dt}&#013;&#010;Author: ${author}&#013;&#010;Description:&#013;&#010;${desc}`;
        var sch_changed = splitted[4] == 'True';
        var pcb_changed = splitted[5] == 'True';
        var pcb_icon = (pcb_changed ? PCB_IMG : EMPTY_IMG);
        var sch_icon = (sch_changed ? SCH_IMG : EMPTY_IMG);
        var i02 = pad(i, 2);
        var cls = (hash == '_local_' ? 'text-warning' : 'text-info');
        var checked = (i <= 2 ? ' checked="checked"' : '');
        var commit_html = `
        <!-- Commit ${i} -->
        <input class="chkGroup" type="checkbox" id="${hash}" name="commit" value="${hash}" onchange="update_selected_commits(this, ${i})"${checked} order="${i}">
        <label class="text-sm-left list-group-item commit-label" for="${hash}">
            <table data-toggle="tooltip" title="${tooltip}">
                <tr>
                    <td rowspan=2 class="commit-icon-cell">
                        <span class="icon-commit"></span>
                    </td>
                    <td class="commit-info-cell">
                        <span class="text-muted"> ${i02} | </span> <span class="text-success font-weight-normal">${hash}</span> <span class="text-muted"> | </span> ${sch_icon} ${pcb_icon} <span class="text-muted font-weight-normal"> | ${dt} | ${author}</span>
                    </td>
                </tr>
                <tr>
                    <td>
                        <em class="${cls} commit-desc-cell">${desc}</em>
                    </td>
                </tr>
            </table>
        </label>
        `;
        all_commits_html = all_commits_html + commit_html;
        i = i + 1;
    }
    // Update commits list
    document.getElementById("commits_form").innerHTML = all_commits_html;
    commits_form = document.getElementsByClassName("chkGroup");
    num_commits = i - 1;
    // TODO What if just 1 or none?
    commit1 = commits_form[0];
    commit2 = commits_form[1];
}

function load_project_data()
{
    // Data format: TITLE
    //              SCH_TITLE|SCH_REVISION|SCH_DATE
    //              PCB_TITLE|PCB_REVISION|PCB_DATE
    data = loadFile("project");
    document.title = data[0];
    splitted = data[1].split("|");
    document.getElementById("sch_title_text").innerHTML = splitted[0];
    document.getElementById("sch_rev").innerHTML = `Rev. ${splitted[1]} (${splitted[2]})`;
    splitted = data[2].split("|");
    document.getElementById("pcb_title_text").innerHTML = splitted[0];
    document.getElementById("pcb_rev").innerHTML = `Rev. ${splitted[1]} (${splitted[2]})`;
}

function change_selected_layer(index) {
    selected_layer = index;
    update_selected_layer();
}

function update_layers_list()
{
    var id;
    var layer;
    var dict = {};

    var id_pad;
    var layer_name;

    var new_layers_list = [];
    var form_inputs_html;

    // File = [COMMIT]/_KIRI_/pcb_layers
    // Format = ID|LAYER

    var used_layers_1 = loadFile(commit1.value + "/_KIRI_/pcb_layers" + url_timestamp(commit1));
    var used_layers_2 = loadFile(commit2.value + "/_KIRI_/pcb_layers" + url_timestamp(commit2));

    layers_commit1 = new Set();
    for (const line of used_layers_1)
    {
        id = line.split("|")[0];
        layer = line.split("|")[1]; //.replace(".", "_");
        dict[id] = [layer];
        layers_commit1.add(pad(id, 2));
        new_layers_list.push(id);
    }

    layers_commit2 = new Set();
    for (const line of used_layers_2)
    {
        id = line.split("|")[0];
        layer = line.split("|")[1]; //.replace(".", "_");
        layers_commit2.add(pad(id, 2));
        new_layers_list.push(id);

        // Add new key
        if (! dict.hasOwnProperty(id)) {
            dict[id] = [layer];
        }
        else {
            // Append if id key exists
            if (dict[id] != layer) {
                dict[id].push(layer);
            }
        }
    }

    console.log("[PCB] Layers =", Object.keys(dict).length);

    var index = 0;
    for (const [layer_id, layer_names] of Object.entries(dict))
    {
        id = parseInt(layer_id);
        id_pad = pad(id, 2);
        layer_name = layer_names[0];

        var color_style;
        in_c1 = layers_commit1.has(id_pad);
        in_c2 = layers_commit2.has(id_pad);
        if (in_c1 && in_c2) {
            color_style = "normal_item";
        } else if (in_c2) {
            color_style = "removed_item";
        } else {
            color_style = "added_item";
        }

        var input_html = `
        <!-- Generated Layer ${id} -->
        <input  id="layer-${id_pad}" value="layer-${layer_names}" type="radio" name="layers" onchange="change_selected_layer(${index})">
        <label for="layer-${id_pad}" id="label-layer-${id_pad}" data-toggle="tooltip" title="${id}, ${layer_names}" class="rounded text-sm-left list-group-item radio-box">
            <span class="layer_color_margin layer_color_${id}"></span>
            <span class="${color_style}">${layer_names}</span>
        </label>
        `;

        form_inputs_html = form_inputs_html + input_html;
        index = index + 1;
    }

    // Return if the current list is equal to the new list
    console.log("current_layers_list = ", current_layers_list);
    console.log("new_layers_list = ", new_layers_list);
    if (current_layers_list.toString() === new_layers_list.toString()) {
        console.log("Keep the same list of layers");
        return;
    }
    current_layers_list = new_layers_list;

    // ID for the previous selection (if any)
    var old_selected_layer_id;
    if (selected_layer >= 0) {
        old_selected_layer_id = layers[selected_layer].id;
    }

    // Update list of layers
    console.log('Updating the list of layers');
    document.getElementById("layers_list_form").innerHTML = form_inputs_html.replace("undefined", "");

    var new_sel;
    if (selected_layer >= 0) {
        const optionLabels = Array.from(layers).map((opt) => opt.id);
        new_sel = optionLabels.indexOf(old_selected_layer_id);
        // Choose the last if it no longer exist (removed/added?)
        new_sel = (new_sel >= 0 ? new_sel : optionLabels.length - 1);
    } else { // First run, nothings selected, select the first
        new_sel = 0;
    }
    layers[new_sel].checked = true;
    selected_layer = new_sel;
}

function update_layer()
{
    console.log("-----------------------------------------");

    // Runs only when updating commits
    update_layers_list();
    update_selected_layer();
}

function update_selected_layer() {

    var layer_id = layers[selected_layer].id.split("-")[1];
    var image_path_1;
    var image_path_2;

    if (layers_commit1.has(layer_id)) {
        image_path_1 = commit1.value + "/_KIRI_/pcb/layer" + "-" + layer_id + ".svg";
    } else {
        image_path_1 = "blank.svg";
    }
    if (layers_commit2.has(layer_id)) {
        image_path_2 = commit2.value + "/_KIRI_/pcb/layer" + "-" + layer_id + ".svg";
    } else {
        image_path_2 = "blank.svg";
    }

    console.log("[PCB]      layer_id =", layer_id);
    console.log("[PCB]  image_path_1 =", image_path_1);
    console.log("[PCB]  image_path_2 =", image_path_2);

    var image_path_timestamp_1 = image_path_1 + url_timestamp(commit1.value);
    var image_path_timestamp_2 = image_path_2 + url_timestamp(commit2.value);

    if (current_view != old_view)
    {
        old_view = current_view;
        removeEmbed();
        lastEmbed = createNewEmbed(image_path_timestamp_1, image_path_timestamp_2);
    }
    else if (layer_id != "")
    {
        diff_xlink_1.href.baseVal = image_path_timestamp_1;
        diff_xlink_2.href.baseVal = image_path_timestamp_2;

        diff_xlink_1.setAttributeNS('http://www.w3.org/1999/xlink', 'href', image_path_timestamp_1);
        diff_xlink_2.setAttributeNS('http://www.w3.org/1999/xlink', 'href', image_path_timestamp_2);
    }

    update_fullscreen_label();
}

// =======================================
// SVG Controls
// =======================================

function ready()
{
    console.log('Starting JS');
    check_server_status();

    pages = document.getElementById("pages_list_form");
    layers = document.getElementById("layers_list_form");

    commit1_legend_color = window.getComputedStyle(document.querySelector(".icon-commit1")).color;
    commit2_legend_color = window.getComputedStyle(document.querySelector(".icon-commit2")).color;
    commit_standalone_color = window.getComputedStyle(document.querySelector(".commit-standalone-color")).color
    load_project_data();
    load_commits();

    current_view = (selected_view == "schematic" ? "show_sch" : "show_pcb");
    update_commits();
}

window.addEventListener('DOMContentLoaded', ready);

// =======================================
// Toggle Schematic/Layout
// =======================================

function show_sch()
{
    current_view = "show_sch";
    // Show schematic stuff
    document.getElementById("show_sch_lbl").classList.add('active');
    document.getElementById("show_sch").checked = true;
    // document.getElementById("diff-sch").style.display = "inline";
    diff_xlink_1.parentElement.style.display = "inline";
    diff_xlink_2.parentElement.style.display = "inline";
    document.getElementById("pages_list").style.display = "inline";
    document.getElementById("sch_title").style.display = "inline";

    // Hide layout stuff
    document.getElementById("show_pcb_lbl").classList.remove('active');
    document.getElementById("show_pcb").checked = false;
    // document.getElementById("diff-pcb").style.display = "none";
    // document.getElementById("diff-xlink-1-pcb").parentElement.style.display = "none";
    // document.getElementById("diff-xlink-2-pcb").parentElement.style.display = "none";
    document.getElementById("layers_list").style.display = "none";
    document.getElementById("pcb_title").style.display = "none";

    update_page();
}

function show_pcb()
{
    current_view = "show_pcb";
    // Show layout stuff
    document.getElementById("show_pcb_lbl").classList.add('active');
    document.getElementById("show_pcb").checked = true;
    // document.getElementById("diff-pcb").style.display = "inline";
    diff_xlink_1.parentElement.style.display = "inline";
    diff_xlink_2.parentElement.style.display = "inline";
    document.getElementById("layers_list").style.display = "inline";
    document.getElementById("pcb_title").style.display = "inline";

    // Hide schematic stuff
    document.getElementById("show_sch_lbl").classList.remove('active');
    document.getElementById("show_sch").checked = false;
    // document.getElementById("diff-sch").style.display = "none";
    // document.getElementById("diff-xlink-1-sch").parentElement.style.display = "none";
    // document.getElementById("diff-xlink-2-sch").parentElement.style.display = "none";
    document.getElementById("pages_list").style.display = "none";
    document.getElementById("sch_title").style.display = "none";

    update_layer();
}

// =======================================
// =======================================

// Hide fields with missing images
function imgError(image)
{
    // console.log("Image Error (missing or problematic) =", image.href.baseVal);
    image.onerror = null;
    parent = document.getElementById(image.id).parentElement;
    parent.style.display = "none";
    return true;
}


// #===========================

var server_status = 1;
var old_server_status = -1;

function check_server_status()
{
    var img;

    img = document.getElementById("server_status_img");

    if (! img) {
        img = document.body.appendChild(document.createElement("img"));
        img.setAttribute("id", "server_status_img");
        img.style.display = "none";
    }

    img.onload = function() {
        server_is_online();
    };

    img.onerror = function() {
        server_is_offline();
    };

    img.src = "blank.svg" + url_timestamp();

    setTimeout(check_server_status, 5000);
}

function server_is_online() {
    server_status = 1;
    document.getElementById("server_offline").style.display = "none";
    if (server_status != old_server_status) {
        old_server_status = server_status;
        console.log("Server is Online");
    }
}

function server_is_offline() {
    server_status = 0;
    document.getElementById("server_offline").style.display = "block";
    if (server_status != old_server_status) {
        old_server_status = server_status;
        console.log("Server is Offline");
    }
}

// ==================================================================

function createNewEmbed(src1, src2)
{
    console.log("createNewEmbed...");

    var embed = document.createElement('div');
    embed.setAttribute('id', "diff-container");
    embed.setAttribute('class', "position-relative");
    embed.setAttribute('style', "padding: 0px; height: 94%;");

    var filter_1 = (current_diff_filter === "diff" ? 'url(#filter-1)' : 'url(#filter-12)');
    var filter_2 = (current_diff_filter === "diff" ? 'url(#filter-2)' : 'url(#filter-22)');

    // WORKING WITH FILTERS..
    // https://fecolormatrix.com/

    var svg_element = `
    <svg id="svg-id" style="margin: 0px; width: 100%; height: 100%;"
             xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" >
      <g class="my_svg-pan-zoom_viewport">
          <svg id="img-1">
              <defs>
                  <filter id="filter-1">
                      <feColorMatrix in=SourceGraphic type="matrix"
                      values="1.0  0.0  0.0  0.0  0.0
                              0.0  1.0  0.0  1.0  0.0
                              0.0  0.0  1.0  0.0  0.0
                              0.0  0.0  0.0  0.5  0.0">
                  </filter>
                  <filter id="filter-12">
                      <feColorMatrix in=SourceGraphic type="matrix"
                      values="-1.0   0.0   0.0  0.0  1.0
                               0.0  -1.0   0.0  1.0  1.0
                               0.0   0.0  -1.0  0.0  1.0
                               0.0   0.0   0.0  0.6  0.0">
                  </filter>
              </defs>
              <image id="diff-xlink-1" height="100%" width="100%" filter="${filter_1}" class="commit1"
                  onerror="this.onerror=null; imgError(this);"
                  href="${src1}" xlink:href="${src1}"/>
          </svg>
          <svg id="img-2">
              <defs>
                  <filter id="filter-2">
                      <feColorMatrix in=SourceGraphic type="matrix"
                      values="1.0  0.0  0.0  1.0  0.0
                              0.0  1.0  0.0  0.0  0.0
                              0.0  0.0  1.0  0.0  0.0
                              0.0  0.0  0.0  0.5  0.0">
                  </filter>
                  <filter id="filter-22">
                      <feColorMatrix in=SourceGraphic type="matrix"
                      values="-1.0   0.0   0.0  1.0  1.0
                               0.0  -1.0   0.0  0.0  1.0
                               0.0   0.0  -1.0  0.0  1.0
                               0.0   0.0   0.0  0.6  0.0">
                  </filter>
              </defs>
              <image id="diff-xlink-2" height="100%" width="100%" filter="${filter_2}" class="commit2"
                  onerror="this.onerror=null; imgError(this);"
                  href="${src2}" xlink:href="${src2}"/>
          </svg>
      </g>
    </svg>
    `;

    document.getElementById('diff-container').replaceWith(embed);
    document.getElementById('diff-container').innerHTML = svg_element;
    document.getElementById('diff-container').onfullscreenchange = fullscreenchanged;
    console.log(">>> SVG: ", embed);

    svgpanzoom_selector = "#svg-id";


    panZoom_instance = svgPanZoom(
      svgpanzoom_selector, {
        zoomEnabled: true,
        controlIconsEnabled: false,
        center: true,
        minZoom: 1,
        maxZoom: 20,
        zoomScaleSensitivity: 0.22,
        contain: false,
        fit: false, // cannot be used, bug? (this one must be here to change the default)
        viewportSelector: '.my_svg-pan-zoom_viewport',
        eventsListenerElement: document.querySelector(svgpanzoom_selector),
        onUpdatedCTM: function() {
            if (current_view == "show_sch") {
                if (sch_current_zoom != sch_old_zoom) {
                    console.log(">> Restoring SCH pan and zoom");
                    panZoom_instance.zoom(sch_current_zoom);
                    panZoom_instance.pan(sch_current_pan);
                    sch_old_zoom = sch_current_zoom;
                }
            }
            else {
                if (pcb_current_zoom != pcb_old_zoom) {
                    console.log(">> Restoring PCB pan and zoom");
                    panZoom_instance.zoom(pcb_current_zoom);
                    panZoom_instance.pan(pcb_current_pan);
                    pcb_old_zoom = pcb_current_zoom;
                }
            }
        }
    });

    console.log("panZoom_instance:", panZoom_instance);

    embed.addEventListener('load', lastEventListener);

    document.getElementById('zoom-in').addEventListener('click', function(ev) {
        ev.preventDefault();
        panZoom_instance.zoomIn();
        panZoom_instance.center();
    });

    document.getElementById('zoom-out').addEventListener('click', function(ev) {
        ev.preventDefault();
        panZoom_instance.zoomOut();
        panZoom_instance.center();
    });

    document.getElementById('zoom-fit').addEventListener('click', function(ev) {
        ev.preventDefault();
        panZoom_instance.resetZoom();
        panZoom_instance.center();
    });

    diff_xlink_1 = document.getElementById("diff-xlink-1");
    diff_xlink_2 = document.getElementById("diff-xlink-2");

    return embed;
}

function removeEmbed()
{
    console.log(">=============================================<");
    console.log("removeEmbed...");
    console.log(">> lastEmbed: ", lastEmbed);
    console.log(">> panZoom_instance: ", panZoom_instance);

    // Destroy svgpanzoom
    if (panZoom_instance)
    {
        if (current_view == "show_pcb") {
            sch_current_zoom = panZoom_instance.getZoom();
            sch_current_pan = panZoom_instance.getPan();
            sch_old_zoom = null;
        } else {
            pcb_current_zoom = panZoom_instance.getZoom();
            pcb_current_pan = panZoom_instance.getPan();
            pcb_old_zoom = null;
        }

        panZoom_instance.destroy();

        // Remove event listener
        lastEmbed.removeEventListener('load', lastEventListener);

        // Null last event listener
        lastEventListener = null;

        // Remove embed element
        // document.getElementById('diff-container').removeChild(lastEmbed);

        // Null reference to embed
        lastEmbed = null;
    }
}

function update_fullscreen_label()
{
    fullscreen_label = document.getElementById("fullscreen_label");

    if (current_view == "show_sch")
    {
        page_name = document.getElementById("label-" + pages[selected_page].id).innerHTML;
        view_item = "Page " + page_name;
    }
    else
    {
        layer_name = document.getElementById("label-" + layers[selected_layer].id).innerHTML;
        view_item = "Layer " + layer_name;
    }

    if (is_fullscreen)
    {
        if (fullscreen_label)
        {
            document.getElementById("commit1_fs").innerHTML = `(<a id="commit1_legend_hash">${commit1.value}</a>)`;
            document.getElementById("commit2_fs").innerHTML = `(<a id="commit2_legend_hash">${commit2.value}</a>)`;
            document.getElementById("view_item_fs").innerHTML = view_item;
        }
        else
        {
            var vis1 = document.getElementById("commit1").style.visibility;
            var col1 = document.getElementById("commit1_legend").style.color;
            var vis2 = document.getElementById("commit2").style.visibility;
            var col2 = document.getElementById("commit2_legend").style.color;
            var vis3 = document.getElementById("commit3").style.visibility;
            label = `
                <div id="fullscreen_label" class="alert alert-dark border border-dark rounded-pill position-absolute top-10 start-50 translate-middle ui-fs-label" role="alert">
                    <div id="commit1_div_fs" class="commit1" style="visibility: ${vis1};">
                        <span id="commit1_legend_fs" class="icon-commit1-fs icon-commit1-color" style="color: ${col1};"></span>
                        <small id="commit1_legend_text_fs" class="text-sm text-light">
                            Newer
                            <span id="commit1_fs" class="text-monospace">(<a id="commit1_legend_hash">${commit1.value}</a>)</span>
                        </small>
                    </div>

                    <span class="ui-legend-sep1-fs"></span>

                    <div id="commit2_div_fs" class="commit2" style="visibility: ${vis2};">
                        <span id="commit2_legend_fs" class="icon-commit2-fs icon-commit2-color" style="color: ${col2};"></span>
                        <small id=commit2_legend_text_fs class="text-sm text-light">
                            Older
                            <span id="commit2_fs" class="text-monospace">(<a id="commit2_legend_hash">${commit2.value}</a>)</span>
                        </small>
                    </div>

                    <span class="ui-legend-sep1-fs"></span>

                    <div id="commit3_div_fs" class="commit3" style="visibility: ${vis3};">
                       <span id="commit3_legend_fs" class="icon-commit3-fs"></span>
                       <small id="commit3_legend_text_fs" class="text-sm text-light">
                           Unchanged
                       </small>
                    </div>

                    <small class="text-sm text-muted ui-legend-sep2-fs">
                        |
                    </small>
                    <span class="ui-legend-sep1-fs"></span>
                    <small id="view_item_fs" class="text-sm text-light ui-view-item-fs">
                        ${view_item}
                    </small>
                </div>
            `

            const element = document.getElementById("diff-container");
            element.insertAdjacentHTML("afterbegin", label);
        }
    }
}

function toggle_fullscreen()
{
  if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement)
  {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }

    is_fullscreen = false;
    const box = document.getElementById('fullscreen_label');
    box.remove();

  } else {
    element = document.getElementById("diff-container");
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }

    is_fullscreen = true;
    update_fullscreen_label()
  }
}

/********************************************************************
  Workaround for Chrome exiting full screen using ESC
  Note: If this works for any browser we could just do the API
  changes here.
********************************************************************/
function fullscreenchanged(event) {
  if (! document.fullscreenElement && is_fullscreen) {
    is_fullscreen = false;
    const box = document.getElementById('fullscreen_label');
    box.remove();
  }
}
