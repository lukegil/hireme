function widgets() {
    //constructor
}

widgets.prototype.distance_widget = {
    add_listeners : function() {
        var parent_scope = this;

        parent_scope.bound_load = parent_scope.load_listener.bind(parent_scope)
        document.addEventListener("readystatechange", parent_scope.bound_load);

        this.inner_height = window.innerHeight * 0.75;
        this.wdgt_el = document.querySelector(".distance-wdgt");
        this.el_dist = this.wdgt_el.getBoundingClientRect().top;
        this.ticking = false;

        parent_scope.bound_scroll = parent_scope.scroll_listener.bind(parent_scope)
        window.addEventListener("scroll", parent_scope.bound_scroll);
    },

    load_listener : function() {
        var parent_scope = this;
        if (document.readyState !== "loading") {
            parent_scope.retrieve_data();
            document.removeEventListener("readystatechange", parent_scope.bound_load);
        }
    },

    scroll_listener : function() {
        var parent_scope = this;
        parent_scope.el_dist = parent_scope.wdgt_el.getBoundingClientRect().top;

        if (!parent_scope.ticking && parent_scope.el_dist <= parent_scope.inner_height) {
            window.requestAnimationFrame(function() {
                parent_scope.build();
                window.removeEventListener("scroll", parent_scope.bound_scroll)
            })
        }
    },

    retrieve_data : function() {
        var data = window.distance_data;

        var f = 0;
        for (var i = 0; i < data.length; i++) {
            var num = data[i][1];
            data[i][2] = (num == 0) ? 0 : Math.log10(num);
            f = (data[i][2] > f) ? data[i][2] : f;
        }
        this.distance_data = data;
        this.farthest_distance = f;

    },

    add_axes : function() {
        var el = document.querySelector(".distance-wdgt");
        for (var i = 2; i < 8; i+=2) {
            var di = (i/this.farthest_distance) * 100;
            var nl = document.createElement("div");
            nl.classList.add("wdgt-axis");
            nl.style.height = nl.style.width = di + "%";
            el.appendChild(nl);
        }

    },

    build : function() {

        this.interval_obj = {
            list : this.distance_data,
            longest : this.farthest_distance,
            ll : this.distance_data.length,
            rotate : 0,
            r_inc : (2 * Math.PI)/this.distance_data.length,
            cur_el : 0,
        }
        var parent_scope = this;
        this.interval_obj.interval_id = window.setInterval(this.add_lines, 10, parent_scope)


    },

    add_lines : function(parent_scope) {
        var ps = parent_scope;
        var ps_io = ps.interval_obj;
        var rotate = ps_io.rotate;
        var cur_el = ps_io.list[ps_io.cur_el];
        ps_io.rotate += ps_io.r_inc;
        if (ps_io.cur_el >= ps_io.ll) {
            clearInterval(ps_io.interval_id);
            return;
        }
        /* len as percent of farthest, which is half width of container */
        var line_len = (cur_el[2]/ps_io.longest) * 50; //


        var el = document.createElement("div");
        el.setAttribute("data-date", cur_el[0]);
        el.setAttribute("data-distance", parseFloat(cur_el[1]/1000).toFixed(2) + "km");
        el.classList.add("wdgt-line");
        el.style.transform = "rotate(" + rotate + "rad)";
        document.querySelector(".distance-wdgt").appendChild(el);
        window.setTimeout(function(el, line_len) {el.style.width = line_len + "%";},10, el, line_len);
        el.addEventListener("mouseenter", ps.line_hover);
        ps_io.cur_el++;

    },

    line_hover : function(e) {
        var date = e.target.getAttribute("data-date");
        var dist = e.target.getAttribute("data-distance");
        var el = document.querySelector(".distance-wdgt .key")
        el.querySelector(".date").textContent = date;
        el.querySelector(".distance").textContent = dist;
    },
}


function page() {
    //constructor
}

page.prototype.parallax = {
    add_listeners : function() {
        var els = document.querySelectorAll(".interstitial");
        var parent_scope = this;
        this.parallaxes = [];
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            this.parallaxes[i] = {
                prev : el.previousElementSibling,
                next : el.nextElementSibling,
                upper : function(el) { return el.previousElementSibling.getBoundingClientRect().bottom },
                lower : function(el) { return (el.nextElementSibling) ? el.nextElementSibling.getBoundingClientRect().top : document.body.scrollHeight},
                el_height : el.getBoundingClientRect().height,
            }

            var hits_top_bound = this.hits_top.bind(parent_scope, els[i], i)
            window.addEventListener("scroll", hits_top_bound);
        }
    },

    hits_top : function(el, i) {
        var obj = this.parallaxes[i];

        if (obj.upper(el) <= 0 && obj.lower(el) <= obj.el_height) {
            if (!el.classList.contains("para")) {
                el.classList.add("para");
                obj.next.style.marginTop = "150px";
            }
        }
        else if (el.classList.contains("para")) {
            el.classList.remove("para");
            obj.next.style.marginTop = "0";
        }
    }
}

var w = new widgets();
w.distance_widget.add_listeners();

var p = new page();
p.parallax.add_listeners();
