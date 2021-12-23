
default_view = "schematic";

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
    // Previews Commit Pair
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
    // Previews Schematic Page / Layer
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

function update_commits() {
    var commits = $("#commits_form input:checkbox[name='commit']");
    var values = [];

    for (var i = 0; i < commits.length; i++) {
        if ($("#commits_form input:checkbox[name='commit']")[i].checked) {
            var value = $("#commits_form input:checkbox[name='commit']")[i].value;
            values.push(value);
        }
    }

    // It needs 2 items selected to continue
    if (values.length < 2) {
        return;
    }

    var commit1 = values[0].replace(/\s+/g, '');
    var commit2 = values[1].replace(/\s+/g, '');

    // =======================================
    // Update Schematic

    var pages = $("#pages_list input:radio[name='pages']");
    var selected_page = pages.index(pages.filter(':checked'));

    var page_name = pages[selected_page].id;

    var sch_image_path_1 = "../" + commit1 + "/" + "sch-" + page_name + ".svg" + img_timestamp();
    var sch_image_path_2 = "../" + commit2 + "/" + "sch-" + page_name + ".svg" + img_timestamp();

    document.getElementById("diff-xlink-1-sch").href.baseVal = sch_image_path_1;
    document.getElementById("diff-xlink-2-sch").href.baseVal = sch_image_path_2;

    document.getElementById("diff-xlink-1-sch").setAttributeNS('http://www.w3.org/1999/xlink', 'href', sch_image_path_1);
    document.getElementById("diff-xlink-2-sch").setAttributeNS('http://www.w3.org/1999/xlink', 'href', sch_image_path_2);

    // =======================================
    // Update Layout

    var selected_layer = "";
    var board_name = "board";

    var layers = document.getElementsByName('layers');
    for (var layer of layers) {
        if (layer.checked) {
            selected_layer = layer.value;
        }
    }

    if (!selected_layer) {
        selected_layer = "F_Cu";
    }

    var image_path_1 = "../" + commit1 + "/" + board_name + "-" + selected_layer + ".svg" + img_timestamp();
    var image_path_2 = "../" + commit2 + "/" + board_name + "-" + selected_layer + ".svg" + img_timestamp();

    document.getElementById("diff-xlink-1-pcb").href.baseVal = image_path_1;
    document.getElementById("diff-xlink-2-pcb").href.baseVal = image_path_2;

    document.getElementById("diff-xlink-1-pcb").setAttributeNS('http://www.w3.org/1999/xlink', 'href', image_path_1);
    document.getElementById("diff-xlink-2-pcb").setAttributeNS('http://www.w3.org/1999/xlink', 'href', image_path_2);

    // =======================================
    // Update Legend

    document.getElementById("commit1_legend_hash").innerHTML = "(" + commit1 + ")";
    document.getElementById("commit2_legend_hash").innerHTML = "(" + commit2 + ")";
}

function change_page() {
    var pages = $("#pages_list input:radio[name='pages']");
    var selected_page = pages.index(pages.filter(':checked'));
    var page_name = pages[selected_page].id;

    var current_href1 = document.getElementById("diff-xlink-1-sch").href.baseVal;
    var current_href2 = document.getElementById("diff-xlink-2-sch").href.baseVal;

    var commit1 = current_href1.split("/")[1];
    var commit2 = current_href2.split("/")[1];

    var image_path_1 = "../" + commit1 + "/" + "sch-" + page_name + ".svg" + img_timestamp();
    var image_path_2 = "../" + commit2 + "/" + "sch-" + page_name + ".svg" + img_timestamp();

    document.getElementById("diff-xlink-1-pcb").href.baseVal = image_path_1;
    document.getElementById("diff-xlink-2-pcb").href.baseVal = image_path_2;

    document.getElementById("diff-xlink-1-pcb").setAttributeNS('http://www.w3.org/1999/xlink', 'href', image_path_1);
    document.getElementById("diff-xlink-2-pcb").setAttributeNS('http://www.w3.org/1999/xlink', 'href', image_path_2);

    update_commits();
}

function change_layer() {
    var layers = $("#layers_list input:radio[name='layers']");
    var selected_layer = layers.index(layers.filter(':checked'));
    var layer_name = layers[selected_layer].value;

    var current_href1 = document.getElementById("diff-xlink-1-pcb").href.baseVal;
    var current_href2 = document.getElementById("diff-xlink-2-pcb").href.baseVal;

    var commit1 = current_href1.split("/")[1];
    var commit2 = current_href2.split("/")[1];

    var board_name = "board";

    var image_path_1 = "../" + commit1 + "/" + board_name + "-" + layer_name + ".svg" + img_timestamp();
    var image_path_2 = "../" + commit2 + "/" + board_name + "-" + layer_name + ".svg" + img_timestamp();

    document.getElementById("diff-xlink-1-pcb").href.baseVal = image_path_1;
    document.getElementById("diff-xlink-2-pcb").href.baseVal = image_path_2;

    document.getElementById("diff-xlink-1-pcb").setAttributeNS('http://www.w3.org/1999/xlink', 'href', image_path_1);
    document.getElementById("diff-xlink-2-pcb").setAttributeNS('http://www.w3.org/1999/xlink', 'href', image_path_2);

    update_commits();
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
