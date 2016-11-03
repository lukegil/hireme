var s,
    Homepage = {

        settings: {
            colorArray: [
                      "#44C16B",
                      "#223D67",
                      "#36A152",
                      "#2E0F24",
                      "#A16236",
                      "#4D192F",
                      "#448AC1",
                      "#184946",
                      "#1D1339"
                      ],
            curPath: window.location.pathname,
            homeRows: ".row",
            blogRows: ".main-header",
            usedColors : []
        },

        init: function () {
	    s = this.settings
            Homepage.pageSwitch(s.curPath);
	},

        pageSwitch: function (path) {
            if (path == "/blog/") {
                Homepage.distributeColors(s.colorArray, s.blogRows);
            }

            if (path == "/") {
                Homepage.distributeColors(s.colorArray, s.homeRows);
            }
        },

        distributeColors: function (colorArray, className) {
            var arrLength = s.colorArray.length;
            var els = document.querySelectorAll(className);
            var lastColor = ""
            for (var i = 0; i < els.length; i++) {
                var colorReturn = Homepage.getRandomEl(colorArray, lastColor);
                els[i].style.backgroundColor = colorReturn["el"];
                lastColor = colorReturn["el"];
                Homepage.moveColors(colorReturn["index"]);

            }

        },

        moveColors: function (elementIndex) {
            var c = s.colorArray[elementIndex];
            s.colorArray.splice(elementIndex, 1);
            s.usedColors.push(c);

            if (!s.colorArray.length) s.colorArray = s.usedColors.splice(0, s.usedColors.length);


        },

        getRandomEl: function (list, lastColor) {
            var elIndex = Math.floor(
                Math.random() * list.length
            )
            if (lastColor == list[elIndex]) elIndex = (elIndex + 1) % list.length;
            return {
                "el": list[elIndex],
                "index": elIndex
            }
        }


    };



(function() {
    Homepage.init();
})();
