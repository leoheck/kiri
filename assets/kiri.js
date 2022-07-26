
// jshint esversion:6

// Default variables
// These variables are updated by Kiri script
var default_view = "schematic";
var board_name = "board";
var port = 8080;

var server_status = 1;
var old_server_status = -1;

//
// Attempt to fix the:
// [Violation] Added non-passive event listener to a scroll-blocking

jQuery.event.special.touchstart = {
    setup: function(_, ns, handle) {
        if (ns.includes("noPreventDefault")) {
            this.addEventListener("touchstart", handle, {
                passive: false
            });
        } else {
            this.addEventListener("touchstart", handle, {
                passive: true
            });
        }
    }
};

jQuery.event.special.touchmove = {
    setup: function(_, ns, handle) {
        if (ns.includes("noPreventDefault")) {
            this.addEventListener("touchmove", handle, {
                passive: false
            });
        } else {
            this.addEventListener("touchmove", handle, {
                passive: true
            });
        }
    }
};

jQuery.event.special.mousewheel = {
    setup: function(_, ns, handle) {
        if (ns.includes("noPreventDefault")) {
            this.addEventListener("mousewheel", handle, {
                passive: false
            });
        } else {
            this.addEventListener("mousewheel", handle, {
                passive: true
            });
        }
    }
};

// =======================================

// Limit commits list with 2 checked at most
$(document).ready(function() {
    $("input[name='commit']").change(function() {
        var maxAllowed = 2;
        var cnt = $("input[name='commit']:checked").length;
        if (cnt > maxAllowed) {
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

window.onkeydown = function(e) {
    keysDown[e.key] = true;

    var commits = "";
    var selected_commits = [];
    var next_selected_commits = [];

    var pages = "";
    var layers = "";

    var selected_layer = "";
    var selected_page = "";

    var i = 0;
    var new_index = 0;

    // =======================================
    // Toggle View Mode (Schematic/Layout)
    // =======================================

    if (keysDown.s || keysDown.S) {

        var view_mode = $('#view_mode input[name="view_mode"]:checked').val();
        var next_view_mode = "";

        if (view_mode == "show_sch") {
            next_view_mode = "show_pcb";
            show_pcb();
        } else {
            next_view_mode = "show_sch";
            show_sch();
        }

        keysDown = {};
    }

    // =======================================
    // Toggle View Type (Onion/Swipe)
    // =======================================

    if (keysDown.d || keysDown.D) {

        var view_type = $('#view_type input[name="view_type"]:checked').val();
        var next_view_type = "";

        if (view_type == "show_onion") {
            next_view_type = "show_slide";

            show_slide();

            document.getElementById("show_onion_lbl").classList.remove('active');
            document.getElementById("show_onion").checked = false;

            document.getElementById("show_slide_lbl").classList.add('active');
            document.getElementById("show_slide").checked = true;
        } else {
            next_view_type = "show_onion";

            show_onion();

            document.getElementById("show_onion_lbl").classList.add('active');
            document.getElementById("show_onion").checked = true;

            document.getElementById("show_slide_lbl").classList.remove('active');
            document.getElementById("show_slide").checked = false;
        }

        keysDown = {};
    }

    // =======================================
    // Next Commit Pair
    // =======================================

    if (keysDown["]"] || (event.ctrlKey && keysDown.ArrowDown)) {

        commits = $("#commits_form input:checkbox[name='commit']");

        selected_commits = [];
        next_selected_commits = [];

        for (i = 0; i < commits.length; i++) {
            if ($("#commits_form input:checkbox[name='commit']")[i].checked) {
                selected_commits.push(i);
                next_selected_commits.push(i + 1);
            }
        }

        // When second commit reaches the end, moves the first commit forward (if possible)
        if (next_selected_commits[1] >= commits.length) {
            next_selected_commits[1] = commits.length - 1;
            if (next_selected_commits[0] <= commits.length - 2) {
                next_selected_commits[0] = selected_commits[0] + 1;
            }
        }
        else {
            // By default does not change the first commit
            next_selected_commits[0] = selected_commits[0];
        }

        // Fix bottom boundary
        if (next_selected_commits[0] >= next_selected_commits[1]) {
            next_selected_commits[0] = next_selected_commits[1] - 1;
        }

        // Fix bottom boundary
        if (next_selected_commits[0] >= commits.length - 2) {
            next_selected_commits[0] = commits.length - 2;
        }

        // Update selected commits
        for (i = 0; i < selected_commits.length; i++) {
            commits[selected_commits[i]].checked = false;
        }
        for (i = 0; i < selected_commits.length; i++) {
            commits[next_selected_commits[i]].checked = true;
        }

        update_commits();
        keysDown = {};
    }

    // =======================================
    // =======================================

    if (keysDown.ArrowDown) {

        commits = $("#commits_form input:checkbox[name='commit']");

        selected_commits = [];
        next_selected_commits = [];

        for (i = 0; i < commits.length; i++) {
            if ($("#commits_form input:checkbox[name='commit']")[i].checked) {
                selected_commits.push(i);
                next_selected_commits.push(i + 1);
            }
        }

        // Fix bottom boundary
        if (next_selected_commits[1] >= commits.length - 1) {
            next_selected_commits[1] = commits.length - 1;
        }

        // Fix bottom boundary
        if (next_selected_commits[0] >= commits.length - 2) {
            next_selected_commits[0] = commits.length - 2;
        }

        for (i = 0; i < selected_commits.length; i++) {
            commits[selected_commits[i]].checked = false;
        }
        for (i = 0; i < selected_commits.length; i++) {
            commits[next_selected_commits[i]].checked = true;
        }

        update_commits();
        keysDown = {};
    }

    // =======================================
    // Previous Commit Pair
    // =======================================

    if (keysDown["["] || (event.ctrlKey && keysDown.ArrowUp )) {

        commits = $("#commits_form input:checkbox[name='commit']");

        selected_commits = [];
        next_selected_commits = [];

        for (i = 0; i < commits.length; i++) {
            if ($("#commits_form input:checkbox[name='commit']")[i].checked) {
                selected_commits.push(i);
                next_selected_commits.push(i - 1);
            }
        }

        // By default does not change the first commit
        next_selected_commits[0] = selected_commits[0];

        // When commits are touching, move first backwards (if possible)
        if (next_selected_commits[1] == next_selected_commits[0]) {
            if (next_selected_commits[0] > 0) {
                next_selected_commits[0] = next_selected_commits[0] -1;
            }
        }

        // Fix top boundary
        if (next_selected_commits[0] < 0) {
            next_selected_commits[0] = 0;
        }

        // Fix top boundary
        if (next_selected_commits[1] <= 1) {
            next_selected_commits[1] = 1;
        }

        // Update selected commits
        for (i = 0; i < selected_commits.length; i++) {
            commits[selected_commits[i]].checked = false;
        }
        for (i = 0; i < selected_commits.length; i++) {
            commits[next_selected_commits[i]].checked = true;
        }

        update_commits();
        keysDown = {};
    }

    // =======================================
    // =======================================

    if (keysDown.ArrowUp) {

        commits = $("#commits_form input:checkbox[name='commit']");

        selected_commits = [];
        next_selected_commits = [];

        for (i = 0; i < commits.length; i++) {
            if ($("#commits_form input:checkbox[name='commit']")[i].checked) {
                selected_commits.push(i);
                next_selected_commits.push(i - 1);
            }
        }

        // Fix top boundary
        if (next_selected_commits[0] <= 0) {
            next_selected_commits[0] = 0;
        }

        // Fix top boundary
        if (next_selected_commits[1] <= 1) {
            next_selected_commits[1] = 1;
        }

        // Update selected commits
        for (i = 0; i < selected_commits.length; i++) {
            commits[selected_commits[i]].checked = false;
        }
        for (i = 0; i < selected_commits.length; i++) {
            commits[next_selected_commits[i]].checked = true;
        }

        update_commits();
        keysDown = {};
    }

    // =======================================
    // Reset commit selection (select the ones on top)
    // =======================================

    if (keysDown.r || keysDown.R) {

        commits = $("#commits_form input:checkbox[name='commit']");
        selected_commits = [];
        for (i = 0; i < commits.length; i++) {
            $("#commits_form input:checkbox[name='commit']")[i].checked = false;
        }
        for (i = 0; i < 2; i++) {
            $("#commits_form input:checkbox[name='commit']")[i].checked = true;
        }

        update_commits();
        keysDown = {};
    }

    // =======================================
    // Next Schematic Page / Layout
    // =======================================

    if (keysDown.l || keysDown.L || keysDown.ArrowRight) {
        if (document.getElementById("show_sch").checked) {
            pages = $("#pages_list input:radio[name='pages']");
            selected_page = pages.index(pages.filter(':checked'));

            new_index = selected_page + 1;
            if (new_index >= pages.length) {
                new_index = 0;
            }

            pages[new_index].checked = true;

            change_page();
        } else {
            layers = $("#layers_list input:radio[name='layers']");
            selected_layer = layers.index(layers.filter(':checked'));

            new_index = selected_layer + 1;
            if (new_index >= layers.length) {
                new_index = 0;
            }

            layers[new_index].checked = true;

            change_layer();
        }

        keysDown = {};
    }

    // =======================================
    // Previous Schematic Page / Layer
    // =======================================

    if (keysDown.k || keysDown.K || keysDown.ArrowLeft) {
        if (document.getElementById("show_sch").checked) {
            pages = $("#pages_list input:radio[name='pages']");
            selected_page = pages.index(pages.filter(':checked'));

            new_index = selected_page - 1;
            if (new_index < 0) {
                new_index = pages.length - 1;
            }

            pages[new_index].checked = true;

            change_page();
        } else {
            layers = $("#layers_list input:radio[name='layers']");
            selected_layer = layers.index(layers.filter(':checked'));

            new_index = selected_layer - 1;
            if (new_index < 0) {
                new_index = layers.length - 1;
            }

            layers[new_index].checked = true;

            change_layer();
        }

        keysDown = {};
    }

    // =======================================
    // Zoom Reset
    // =======================================

    if (keysDown.f || keysDown.F) {

        if (document.getElementById('diff-sch').style.display === "inline") {
            panZoom_sch.resetZoom();
            panZoom_sch.center();
            // panZoom_sch.fit() // cannot be used, bug?
        }
        if (document.getElementById('diff-pcb').style.display === "inline") {
            panZoom_pcb.resetZoom();
            panZoom_pcb.center();
            // panZoom_pcb.fit() // cannot be used, bug?
        }

        keysDown = {};
    }

    // keysDown = {};
};

// =======================================
// =======================================

function img_timestamp() {
    return "?t=" + new Date().getTime();
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

function update_commits() {
    var commits = $("#commits_form input:checkbox[name='commit']");
    var hashes = [];

    for (var i = 0; i < commits.length; i++) {
        if ($("#commits_form input:checkbox[name='commit']")[i].checked) {
            var value = $("#commits_form input:checkbox[name='commit']")[i].value;
            hashes.push(value);
        }
    }

    // It needs 2 items selected to do something
    if (hashes.length < 2) {
        return;
    }

    var commit1 = hashes[0].replace(/\s+/g, '');
    var commit2 = hashes[1].replace(/\s+/g, '');

    console.log("");
    console.log("[Cmt]    board_name =", board_name);
    console.log("[Cmt]       commit1 =", commit1);
    console.log("[Cmt]       commit2 =", commit2);

    old_commit1 = document.getElementById("commit1_hash").value;
    old_commit2 = document.getElementById("commit2_hash").value;

    kicad_pro_path_1 = document.getElementById("commit1_kicad_pro_path").value;
    kicad_pro_path_2 = document.getElementById("commit2_kicad_pro_path").value;

    kicad_pro_path_1 = kicad_pro_path_1.replace(old_commit1, commit1);
    kicad_pro_path_2 = kicad_pro_path_2.replace(old_commit2, commit2);

    document.getElementById("commit1_kicad_pro_path").value = kicad_pro_path_1;
    document.getElementById("commit2_kicad_pro_path").value = kicad_pro_path_2;

    document.getElementById("commit1_hash").value = commit1;
    document.getElementById("commit2_hash").value = commit2;

    document.getElementById("commit1_legend_hash").innerHTML = commit1;
    document.getElementById("commit2_legend_hash").innerHTML = commit2;

    // Update the active view enabled view
    var view_mode = $('#view_mode input[name="view_mode"]:checked').val();
    if (view_mode == "show_sch") {
        change_page(commit1, commit2);
    } else {
        change_layer(commit1, commit2);
    }
}

function loadFile(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('GET', filePath, false);
    xmlhttp.send();
    if (xmlhttp.status==200) {
        result = xmlhttp.responseText;
    }
    return result;
}


function change_page(commit1="", commit2="") {
    var pages = $("#pages_list input:radio[name='pages']");
    var selected_page = pages.index(pages.filter(':checked'));

    var page_name = pages[selected_page].id;
    var page_filename = pages[selected_page].value.replace(".kicad_sch", "").replace(".sch", "");

    if ((commit1 != "") && (commit2 != "")) {
        update_sheets_list(commit1, commit2, page_name);
    }

    if (commit1 == ""){
        commit1 = document.getElementById("diff-xlink-1-sch").href.baseVal.split("/")[1];
    }
    if (commit2 == ""){
        commit2 = document.getElementById("diff-xlink-2-sch").href.baseVal.split("/")[1];
    }

    var image_path_1 = "../" + commit1 + "/" + "kiri/sch/" + page_filename + ".svg";
    var image_path_2 = "../" + commit2 + "/" + "kiri/sch/" + page_filename + ".svg";

    console.log("[SCH] page_filename =", page_filename);
    console.log("[SCH]  image_path_1 =", image_path_1);
    console.log("[SCH]  image_path_2 =", image_path_2);

    var image_path_timestamp_1 = image_path_1 + img_timestamp();
    var image_path_timestamp_2 = image_path_2 + img_timestamp();

    document.getElementById("diff-xlink-1-sch").href.baseVal = image_path_timestamp_1;
    document.getElementById("diff-xlink-2-sch").href.baseVal = image_path_timestamp_2;

    document.getElementById("diff-xlink-1-sch").setAttributeNS('http://www.w3.org/1999/xlink', 'href', image_path_timestamp_1);
    document.getElementById("diff-xlink-2-sch").setAttributeNS('http://www.w3.org/1999/xlink', 'href', image_path_timestamp_2);

    if_url_exists(image_path_timestamp_1, function(exists) {
        if (exists == true) {
            document.getElementById("diff-xlink-1-sch").parentElement.style.display = 'inline';
        }
        else {
            document.getElementById("diff-xlink-1-sch").parentElement.style.display = 'none';
        }
    });

    if_url_exists(image_path_timestamp_2, function(exists) {
        if (exists == true) {
            document.getElementById("diff-xlink-2-sch").parentElement.style.display = 'inline';
        }
        else {
            document.getElementById("diff-xlink-2-sch").parentElement.style.display = 'none';
        }
    });
}

function update_sheets_list(commit1, commit2, selected_sheet) {

    // Data format: ID|LAYER

    console.log("==== UPDATING_SHEETS_LIST ====");
    console.log("Selected sheet:", selected_sheet);

    data1 = loadFile("../" + commit1 + "/kiri/sch_sheets" + img_timestamp()).split("\n").filter((a) => a);
    data2 = loadFile("../" + commit2 + "/kiri/sch_sheets" + img_timestamp()).split("\n").filter((a) => a);

    var sheets = [];

    for (const d of data1)
    {
        sheet = d.split("|")[0];
        sheets.push(sheet);
    }

    for (const d of data2)
    {
        sheet = d.split("|")[0];
        if (! sheets.includes(sheet))
        {
            sheets.push(sheet);
        }
    }

    // sheets.sort();
    sheets = Array.from(new Set(sheets.sort()));

    console.log("[SCH]  Sheets =", sheets.length);
    console.log("sheets", sheets);

    var form_inputs_html;

    for (const sheet of sheets)
    {
        if (sheet == selected_sheet) {
            checked="checked='checked'";
        }
        else {
            checked = "";
        }

        // Original
        //
        // <!-- Page 1 -->
        // <input id="board" data-toggle="tooltip" title="board.kicad_sch" type="radio" value="board.kicad_sch" name="pages" checked="checked" onchange="change_page()"/>
        // <label for="board" data-toggle="tooltip" title="board.kicad_sch" id="label-board" class="rounded text-sm-left list-group-item radio-box" onclick="change_page_onclick()" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
        //     <span data-toggle="tooltip" title="board" style="margin-left:0.5em; margin-right:0.1em;" class="iconify" data-icon="gridicons:pages" data-inline="false"></span>
        //     board
        // </label>

        var input_html = `
        <input id="${sheet}" data-toggle="tooltip" title="${sheet}.kicad_sch" type="radio" value="${sheet}.kicad_sch" name="pages" ${checked} onchange="change_page()">
            <label for="${sheet}" data-toggle="tooltip" title="${sheet}.kicad_sch" id="label-${sheet}" class="rounded text-sm-left list-group-item radio-box" onclick="change_page_onclick()" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                <span data-toggle="tooltip" title="${sheet}" style="margin-left:0.5em; margin-right:0.1em;" class="iconify" data-icon="gridicons:pages" data-inline="false"></span>
                ${sheet}
            </label>
        </label>
        `;

        form_inputs_html = form_inputs_html + input_html;
    }

    sheets_element = document.getElementById("pages_list_form");

    sheets_element.style.display = "none";
    sheets_element.innerHTML = form_inputs_html.replace("undefined", "");
    sheets_element.style.display = "block";
}

function layer_color(layer_id) {

    var color;

    console.log(">>> layer_id", layer_id);

    const F_Cu      = 0;
    const In1_Cu    = 1;
    const In2_Cu    = 2;
    const In3_Cu    = 3;
    const In4_Cu    = 4;
    const B_Cu      = 31;
    const B_Adhes   = 32;
    const F_Adhes   = 33;
    const B_Paste   = 34;
    const F_Paste   = 35;
    const B_SilkS   = 36;
    const F_SilkS   = 37;
    const B_Mask    = 38;
    const F_Mask    = 39;
    const Dwgs_User = 40;
    const Cmts_User = 41;
    const Eco1_User = 42;
    const Eco2_User = 43;
    const Edge_Cuts = 44;
    const Margin    = 45;
    const B_CrtYd   = 46;
    const F_CrtYd   = 47;
    const B_Fab     = 48;
    const F_Fab     = 49;

    switch(layer_id) {
        case B_Adhes:   color="#3545A8"; break;
        case B_CrtYd:   color="#D3D04B"; break;
        case B_Cu:      color="#359632"; break;
        case B_Fab:     color="#858585"; break;
        case B_Mask:    color="#943197"; break;
        case B_Paste:   color="#969696"; break;
        case B_SilkS:   color="#481649"; break;
        case Cmts_User: color="#7AC0F4"; break;
        case Dwgs_User: color="#0364D3"; break;
        case Eco1_User: color="#008500"; break;
        case Eco2_User: color="#008500"; break;
        case Edge_Cuts: color="#C9C83B"; break;
        case F_Adhes:   color="#A74AA8"; break;
        case F_CrtYd:   color="#A7A7A7"; break;
        case F_Cu:      color="#952927"; break;
        case F_Fab:     color="#C2C200"; break;
        case F_Mask:    color="#943197"; break;
        case F_Paste:   color="#3DC9C9"; break;
        case F_SilkS:   color="#339697"; break;
        case In1_Cu:    color="#C2C200"; break;
        case In2_Cu:    color="#C200C2"; break;
        case In3_Cu:    color="#C20000"; break;
        case In4_Cu:    color="#0000C2"; break;
        case Margin:    color="#D357D2"; break;
        default:        color="#000000";
    }

    return color;
}

function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}

function update_layers_list(commit1, commit2, selected_id) {

    // Data format: ID|LAYER

    console.log("==== UPDATING_LAYERS_LIST ====");
    console.log("Selected ID:", selected_id);

    data1 = loadFile("../" + commit1 + "/kiri/pcb_layers" + img_timestamp()).split("\n").filter((a) => a);
    data2 = loadFile("../" + commit2 + "/kiri/pcb_layers" + img_timestamp()).split("\n").filter((a) => a);

    var dict = {};
    var id;
    var id_pad;
    var layer;
    var layer_name;
    var color;
    var checked;

    for (const d of data1)
    {
        id = d.split("|")[0];
        layer = d.split("|")[1].replace(".", "_");
        dict[id] = [layer];
        // dict[id] = layer;
    }

    for (const d of data2)
    {
        id = d.split("|")[0];
        layer = d.split("|")[1].replace(".", "_");

        if (! dict.hasOwnProperty(id)) {
            console.log("Adding new key");
            dict[id] = [layer];
            // dict[id] = layer;
        }
        else {
            if (dict[id] != layer) {
                console.log("Updating existing key");
                dict[id].push(layer);
                // dict[id] = layer;
            }
        }
    }

    console.log("[PCB]  Layers =", Object.keys(dict).length);
    // console.log("dict", dict);

    var form_inputs_html;

    for (const [key, value] of Object.entries(dict))
    {
        id = parseInt(key);
        id_pad = pad(id, 2);
        layer = value[0];
        layer_name = value;
        color = layer_color(id);
        checked = "";

        if (id_pad == selected_id) {
            checked="checked='checked'";
        }
        else {
            checked = "";
        }

        // <!-- Layer ${i} -->
        // <input  id="layer-${layer_id_padding}" value="layer-${layer_name}" type="radio" name="layers" onchange="change_layer()" ${checked}>
        // <label for="layer-${layer_id_padding}" id="label-${layer_id_padding}" data-toggle="tooltip" title="Layer ID: ${layer_id}" class="rounded text-sm-left list-group-item radio-box" onclick="change_layer_onclick()">
        //     <span style="margin-left:0.5em; margin-right:0.1em; color: ${layer_color}" class="iconify" data-icon="teenyicons-square-solid" data-inline="false"></span>
        //     ${layer_name}
        // </label>

        var input_html = `
        <!-- Generated Layer ${id} -->
        <input  id="layer-${id_pad}" value="layer-${layer}" type="radio" name="layers" onchange="change_layer()" ${checked}>
        <label for="layer-${id_pad}" id="label-${id_pad}" data-toggle="tooltip" title="Layer ID: ${id}" class="rounded text-sm-left list-group-item radio-box" onclick="change_layer_onclick()">
            <span style="margin-left:0.5em; margin-right:0.1em; color:${color}" class="iconify" data-icon="teenyicons-square-solid" data-inline="false"></span>
            </svg>
            ${layer_name}
        </label>
        `;

        form_inputs_html = form_inputs_html + input_html;
    }

    layers_element = document.getElementById("layers_list_form");
    layers_element.style.display = "none";
    layers_element.innerHTML = form_inputs_html.replace("undefined", "");
    layers_element.style.display = "block";
}

function change_layer(commit1="", commit2="") {

    // try {

        var layers = $("#layers_list input:radio[name='layers']");
        var selected_layer = layers.index(layers.filter(':checked'));

        var layer_id = layers[selected_layer].id.split("-")[1];
        if (! layer_id)
        {
            layer_id = "00";
        }

        if ((commit1 != "") && (commit2 != "")) {
            update_layers_list(commit1, commit2, layer_id);
        }

        if (commit1 == "") {
            commit1 = document.getElementById("diff-xlink-1-pcb").href.baseVal.split("/")[1];
        }
        if (commit2 == "") {
            commit2 = document.getElementById("diff-xlink-2-pcb").href.baseVal.split("/")[1];
        }

        var image_path_1 = "../" + commit1 + "/kiri/pcb/layer" + "-" + layer_id + ".svg";
        var image_path_2 = "../" + commit2 + "/kiri/pcb/layer" + "-" + layer_id + ".svg";

        console.log("[PCB]      layer_id =", layer_id);
        console.log("[PCB]  image_path_1 =", image_path_1);
        console.log("[PCB]  image_path_2 =", image_path_2);

        var image_path_timestamp_1 = image_path_1 + img_timestamp();
        var image_path_timestamp_2 = image_path_2 + img_timestamp();

        document.getElementById("diff-xlink-1-pcb").href.baseVal = image_path_timestamp_1;
        document.getElementById("diff-xlink-2-pcb").href.baseVal = image_path_timestamp_2;

        document.getElementById("diff-xlink-1-pcb").setAttributeNS('http://www.w3.org/1999/xlink', 'href', image_path_timestamp_1);
        document.getElementById("diff-xlink-2-pcb").setAttributeNS('http://www.w3.org/1999/xlink', 'href', image_path_timestamp_2);

        if_url_exists(image_path_timestamp_1, function(exists) {
            if (exists == true) {
                document.getElementById("diff-xlink-1-pcb").parentElement.style.display = 'inline';
            }
            else {
                document.getElementById("diff-xlink-1-pcb").parentElement.style.display = 'none';
            }
        });

        if_url_exists(image_path_timestamp_2, function(exists) {
            if (exists == true) {
                document.getElementById("diff-xlink-2-pcb").parentElement.style.display = 'inline';
            }
            else {
                document.getElementById("diff-xlink-2-pcb").parentElement.style.display = 'none';
            }
        });
    // }
    // catch(err) {
    //     console.log("[PCB] Image may not exist");
    // }
}

// =======================================
// SVG Controls
// =======================================

window.onload = function() {

    panZoom_sch = svgPanZoom(
        '#svg-id-sch', {
            zoomEnabled: true,
            controlIconsEnabled: false,
            center: true,
            minZoom: 1,
            maxZoom: 20,
            zoomScaleSensitivity: 0.1,
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
            zoomScaleSensitivity: 0.1,
            fit: false, // cannot be used, bug? (this one must be here to change the default)
            viewportSelector: '.svg-pan-zoom_viewport-pcb',
            eventsListenerElement: document.querySelector('#svg-id-pcb .svg-pan-zoom_viewport-pcb')
        }
    );

    document.getElementById('zoom-in').addEventListener('click', function(ev) {
        ev.preventDefault();

        if (document.getElementById('diff-sch').style.display === "inline") {
            panZoom_sch.zoomIn();
        }
        if (document.getElementById('diff-pcb').style.display === "inline") {
            panZoom_pcb.zoomIn();
        }
    });

    document.getElementById('zoom-out').addEventListener('click', function(ev) {
        ev.preventDefault();

        if (document.getElementById('diff-sch').style.display === "inline") {
            panZoom_sch.zoomOut();
        }
        if (document.getElementById('diff-pcb').style.display === "inline") {
            panZoom_pcb.zoomOut();
        }
    });

    document.getElementById('reset').addEventListener('click', function(ev) {
        ev.preventDefault();

        if (document.getElementById('diff-sch').style.display === "inline") {
            panZoom_sch.resetZoom();
            panZoom_sch.center();
            // panZoom_sch.fit(); // cannot be used, bug?
        }
        if (document.getElementById('diff-pcb').style.display === "inline") {
            panZoom_pcb.resetZoom();
            panZoom_pcb.center();
            // panZoom_pcb.fit(); // cannot be used, bug?
        }
    });

    if (default_view == "schematic")
        show_sch();
    else
        show_pcb();

    check_server_status();

    console.log("Update initial view");
    update_commits();
};

// =======================================
// Toggle Schematic/Layout
// =======================================

function show_sch() {

    var sch_view;
    var pcb_view;
    var pages_list;
    var layers_list;

    document.getElementById("show_sch_lbl").classList.add('active');
    document.getElementById("show_sch").checked = true;

    document.getElementById("show_pcb_lbl").classList.remove('active');
    document.getElementById("show_pcb").checked = false;

    // Show schematic image
    sch_view = document.getElementById("diff-sch");
    sch_view.style.display = "inline";

    // Show pages list
    pages_list = document.getElementById("pages_list");
    pages_list.style.display = "inline";
    // pages_list.style.display = "none";

    // Hide layout image
    pcb_view = document.getElementById("diff-pcb");
    pcb_view.style.display = "none";

    // Hide layers list
    layers_list = document.getElementById("layers_list");
    layers_list.style.display = "none";

    // Hide pcb title
    sch_view = document.getElementById("pcb_title");
    sch_view.style.display = "none";

    // Show sch title
    pages_list = document.getElementById("sch_title");
    pages_list.style.display = "inline";
}

function show_pcb() {

    var sch_view;
    var pcb_view;
    var pages_list;
    var layers_list;

    document.getElementById("show_sch_lbl").classList.remove('active');
    document.getElementById("show_sch").checked = false;

    document.getElementById("show_pcb_lbl").classList.add('active');
    document.getElementById("show_pcb").checked = true;

    // Hide layers list
    sch_view = document.getElementById("diff-sch");
    sch_view.style.display = "none";

    // Hide pages list
    pages_list = document.getElementById("pages_list");
    pages_list.style.display = "none";

    // Show layout image
    pcb_view = document.getElementById("diff-pcb");
    pcb_view.style.display = "inline";

    // Show layers list
    layers_list = document.getElementById("layers_list");
    layers_list.style.display = "inline";
    //layers_list.style.display = "none";

    // Show PCB Title
    sch_view = document.getElementById("pcb_title");
    sch_view.style.display = "inline";

    // Hide SCH Title
    pages_list = document.getElementById("sch_title");
    pages_list.style.display = "none";
}

// =======================================
// Toggle Onion/Slide
// =======================================

function show_onion() {
    // console.log("Function:", "show_onion");
}

function show_slide() {
    // console.log("Function:", "show_slide");
}

// =======================================
// =======================================

function change_page_onclick(obj) {
    change_page();
}

function change_layer_onclick(obj) {
    change_layer();
}

// Hide missing images
function imgError(image) {
    console.log("Image Error (missing or problematic) =", image.href.baseVal);
    image.onerror = null;
    parent = document.getElementById(image.id).parentElement;
    parent.style.display = 'none';
    return true;
}

// #===========================

function check_server_status()
{
    var img;

    img = document.getElementById("server_status_img");

    if (! img) {
        img = document.body.appendChild(document.createElement("img"));
        img.setAttribute("id", "server_status_img");
    }

    img.onload = function()
    {
        server_online();
    };

    img.onerror = function()
    {
        server_offline();
    };

    img.src = "http://127.0.0.1:" + port + "/web/favicon.ico?" + Date.now();
    img.style.display = "none";

    setTimeout(check_server_status, 5000);
}

function server_online() {
    server_status = 1;
    document.getElementById("server_offline").style.display = "none";
    if (server_status != old_server_status) {
        old_server_status = server_status;
        console.log("Server is Online");
    }
}

function server_offline() {
    server_status = 0;
    document.getElementById("server_offline").style.display = "block";
    if (server_status != old_server_status) {
        old_server_status = server_status;
        console.log("Server is Offline");
    }
}

// #===========================

$(function () {
  $('[data-toggle="tooltip"]').tooltip({html:true});
});
