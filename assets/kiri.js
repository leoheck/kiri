
// Default variables
// These variables are updated by Kiri script
var default_view = "schematic";
var board_name = "board";
var port = 8080;

var server_status = 1;
var old_server_status = 1;

// This comes from data.js
const data = JSON.parse(data_json);

// Test data.js format
for (const [commit, commit_data] of Object.entries(data)) {
    console.log("commit", commit);
    for (const [layer_id, layer_name] of Object.entries(commit_data.layers)) {
        console.log("layer = id:", layer_id, "- name:", layer_name, "- img:", commit_data.layer_imgs[layer_id]);
    }
}

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
    let request = new XMLHttpRequest;
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
        };
    };
    request.send('');
};

function mergeArrays(...arrays) {
    let jointArray = []

    arrays.forEach(array => {
        jointArray = [...jointArray, ...array]
    })
    const uniqueArray = jointArray.reduce((newArray, item) =>{
        if (newArray.includes(item)){
            return newArray
        } else {
            return [...newArray, item]
        }
    }, [])
    return uniqueArray
}

function generate_layers_list(commit1, commit2) {
    var keys1 = Object.keys(data[commit1].layers);
    var keys2 = Object.keys(data[commit2].layers);
    var keys = mergeArrays(keys1, keys2);
    // console.log("keys1: ", keys1);
    // console.log("keys2: ", keys2);
    // console.log("keys : ", keys);
    var layers="";
    for (var i = 0; i < keys.length; i++) {
        console.log(keys[i], data[commit1].layers[keys[i]], data[commit2].layers[keys[i]]);
    }
    return layers;
}

function update_layers_list(layers) {
    console.log(layers);
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

    console.log("")
    console.log("=======================================");
    console.log("=======================================");
    console.log("  board_name =", board_name);
    console.log("     commit1 =", commit1);
    console.log("     commit2 =", commit2);

    document.getElementById("commit1_legend_hash").innerHTML = "(" + commit1 + ")";
    document.getElementById("commit2_legend_hash").innerHTML = "(" + commit2 + ")";

    change_page(commit1, commit2);
    change_layer(commit1, commit2);

    // ===================================
    // layers = generate_layers_list(commit1, commit2);
    // update_layers_list(layers);
}

function change_page(commit1="", commit2="") {
    var pages = $("#pages_list input:radio[name='pages']");
    var selected_page = pages.index(pages.filter(':checked'));
    var page_name = pages[selected_page].id;

    if (commit1 == ""){
        var commit1 = document.getElementById("diff-xlink-1-sch").href.baseVal.split("/")[1];
    }
    if (commit2 == ""){
        var commit2 = document.getElementById("diff-xlink-2-sch").href.baseVal.split("/")[1];
    }

    var image_path_1 = "../" + commit1 + "/" + "sch-" + page_name + ".svg";
    var image_path_2 = "../" + commit2 + "/" + "sch-" + page_name + ".svg";

    console.log("---------------------------");
    console.log("         page_name =", page_name);
    console.log("[SCH] image_path_1 =", image_path_1);
    console.log("[SCH] image_path_2 =", image_path_2);

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

function change_layer(commit1="", commit2="") {

    var layers = $("#layers_list input:radio[name='layers']");
    var selected_layer = layers.index(layers.filter(':checked'));
    var layer_id   = layers[selected_layer].id.split("-")[1];
    var layer_name = layers[selected_layer].value.split("-")[1];

    if (commit1 == ""){
        var commit1 = document.getElementById("diff-xlink-1-pcb").href.baseVal.split("/")[1];
    }
    if (commit2 == ""){
        var commit2 = document.getElementById("diff-xlink-2-pcb").href.baseVal.split("/")[1];
    }

    var image_path_1 = "../" + commit1 + "/" + board_name + "-" + layer_id + "-" + layer_name + ".svg";
    var image_path_2 = "../" + commit2 + "/" + board_name + "-" + layer_id + "-" + layer_name + ".svg";

    console.log("+++++++++++++++++++++++++++");
    console.log("          layer_id =", layer_id);
    console.log("        layer_name =", layer_name);
    console.log("[PCB] image_path_1 =", image_path_1);
    console.log("[PCB] image_path_2 =", image_path_2);

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

// #===========================

// Hide missing images
function imgError(image) {
    console.log("Image Error (missing or problematic) =", image.href.baseVal);
    image.onerror = null;
    parent = document.getElementById(image.id).parentElement
    parent.style.display = 'none';
    return true;
}

function check_server_status()
{
    var img = document.body.appendChild(document.createElement("img"));

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
