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

function QAndA() {
    /** nodes **/
    this.qa_node = document.querySelector("#q-and-a");
    this.qa_content = this.qa_node.querySelector(".content");
    this.close_btns = this.qa_node.querySelectorAll(".js-close");

    /** page attributes **/
    this.max_depth = 0;
    this.page_height = document.querySelector(".container").clientHeight;
    this.scroll_limit = this.page_height / 5;
    this.cur_scroll = window.scrollY;

    /** requests **/
    this.req;
    this.url = "/hireme/q-and-a/";

    /** html **/
    this.question_fail = "<p class='u-txt-center'>Couldn't get another question at this time</p>";
    this.answer_fail = "<p class='u-txt-center'>Whoops, I done screwed up</p>";

    this.displaying(this);
    this.answering(this);
}

QAndA.prototype.displaying = function(p) {

    function add_listeners() {
        for (var i = 0; i < p.close_btns.length; i++)
            p.close_btns[i].addEventListener("click", tear_down);

        p.bound_scroll_listener = scroll_listener.bind(p);
        window.addEventListener("scroll", p.bound_scroll_listener);
    };

    function tear_down() {
        p.qa_node.style.bottom = "-1000px";
    };

    function scroll_listener() {
        p.cur_scroll = window.scrollY;

        if (p.cur_scroll > p.max_depth)
            p.max_depth = p.cur_scroll;

        if ((p.max_depth - p.cur_scroll) >= p.scroll_limit) {
            p.qa_node.style.bottom = "0px";
            window.removeEventListener("scroll", p.bound_scroll_listener);
        }
    };

    add_listeners();

}

QAndA.prototype.answering = function(p) {


    function get(url, success_callback, fail_callback) {
        http_request("GET", url, success_callback, fail_callback);
    }

    function post(url, data, success_callback, fail_callback) {
        http_request("POST", url, success_callback, fail_callback, data);
    };

    function http_request(method, url, success_callback, fail_callback, data) {
        p.req = new XMLHttpRequest();

        p.req.onreadystatechange = function() {
            if (p.req.readyState == XMLHttpRequest.DONE)
                (p.req.status === 200) ? success_callback() : fail_callback();
        }

        p.req.open(method, url, true);
        if (method == "POST") {
            p.req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            p.req.send(data);
        } else {
            p.req.send();
        }
    };

    function submit_answer() {
        var data = "";
        var inputs = p.qa_content.querySelectorAll("input, textarea");
        for (var i = 0; i < inputs.length; i++) {
            var ip = inputs[i];
            if (ip.type != "radio" || (ip.type === "radio" && ip.checked))
                data += ip.name + "=" + ip.value + "&";
        }
        data = encodeURI(data);
        post(p.url, data, submit_answer__success, submit_answer__fail);
    };

    function submit_answer__success() {
        p.qa_content.innerHTML = p.req.responseText;
        listen__get_question();
    };

    function submit_answer__fail() {
        p.qa_content.innerHTML = p.answer_fail;
    }

    function get_question(q_num) {
        var url = "/hireme/q-and-a/?q-num=" + q_num;
        get(url, get_question__success, get_question__fail);
    }

    function get_question__success() {
        p.qa_content.innerHTML = p.req.responseText;
        listen__activate_button();
    }

    function get_question__fail() {
        p.qa_content.innerHTML = p.question_fail;
    }

    function listen__get_question() {
        var el = p.qa_content.querySelector(".request");
        el.addEventListener("click", function(e) {
            var q = e.target.getAttribute("last-q") || 1;
            get_question(q);
        });
    };

    function listen__submit_answer() {
        var el = p.qa_content.querySelector(".answer");
        el.addEventListener("click", submit_answer);
    };

    function listen__activate_button() {
        var inputs = p.qa_content.querySelectorAll(".choices input");
        console.log(inputs);
        for (var i = 0; i < inputs.length; i++)
            inputs[i].addEventListener("click", function() {
                var el = p.qa_content.querySelector(".submission .button");
                el.classList.remove("inactive");
                el.classList.add("answer");
                listen__submit_answer();
            });

    };

    listen__get_question();

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
//w.q_and_a.add_listeners();

var qa = new QAndA();

var p = new page();
p.parallax.add_listeners();
