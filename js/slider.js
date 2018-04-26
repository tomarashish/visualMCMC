//https://bl.ocks.org/linoba/ecfc96ae52d5f8b8a7435ee5ab49635a
//http://bl.ocks.org/cmdoptesc/fc0e318ce7992bed7ca8

sliderD3 = function module() {

  var margin = {
      right: 50,
      left: 50,
      top: 20,
      bottom: 50
    },
    slideWidth = 700,
    slideHeight = 50,
    sliderWidth = 600;

  var dispatcher = d3.dispatch("slide", "other_event");

  var yearFirst, yearLast;

  //x axis scale for first slider handle
  var xFirst = d3.scaleLinear()
    .range([0, sliderWidth])
    .clamp(true);

  //x axis scale for second slide
  var xLast = d3.scaleLinear()
    .range([0, sliderWidth])
    .clamp(true);
  //create a function to export and loop the data
  function exports(_selection) {
    _selection.each(function (_data) {

      xFirst.domain([_data[0], _data[1]])
      xLast.domain([_data[0], _data[1]])

      yearFirst = _data[0]
      yearLast = _data[1]

      var svgSlider = d3.select(this).append("svg")
        .attr("width", slideWidth)
        .attr("height", slideHeight)
        .attr("viewBox", "0 0 700 50")
        .attr("preserveAspectRatio", "xMidYMid");

      var sliderFirst = svgSlider.append("g")
        .attr("class", "slider")
        .attr("transform", "translate(" + margin.left + "," + slideHeight / 2 + ")");

      var sliderLast = svgSlider.append("g")
        .attr("class", "slider")
        .attr("transform", "translate(" + margin.left + "," + slideHeight / 2 + ")");

      sliderFirst.append("line")
        .attr("class", "track")
        .attr("id", "track1")
        .attr("x1", xFirst.range()[0])
        .attr("x2", xFirst.range()[1])
        .select(function () {
          return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-inset")
        .select(function () {
          return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-overlay");

      /*
        sliderLast.append("line")
          .attr("class", "track")
          .attr("id", "track2")
          .attr("x1", xLast.range()[0])
          .attr("x2", xLast.range()[1])
          .select(function () {
            return this.parentNode.appendChild(this.cloneNode(true));
          })
          .attr("class", "track-inset")
          .select(function () {
            return this.parentNode.appendChild(this.cloneNode(true));
          })
          .attr("class", "track-overlay");
        */

      sliderFirst.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(10," + 20 + ")")
        .selectAll("text")
        .data(xFirst.ticks(10))
        .enter().append("text")
        .attr("x", xFirst)
        .attr("text-anchor", "middle")
        .style("fill", "#000")
        .text(function (d) {
          return d;
        });


      //sliderLast //.insert("g", ".track-overlay")
      // .attr("transform", "translate(50," + 18 + ")")
      //.data(xLast.ticks(10));

      var handle1 = sliderFirst.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("cy", "-1px")
        .attr("cx", xFirst.range()[0])
        .attr("r", "5px")
        .style("cursor", "hand")
        .call(d3.drag()
          .on("start.interrupt", function () {
            sliderLast.interrupt();
          })
          .on("start drag", function () {
            moveSlideFirst(xFirst.invert(d3.event.x));

          })
          .on("end", function () {
            dispatcher.call("slide", this, [xFirst.invert(d3.event.x), yearLast]);
          })
        );

      /*
      var handle2 = sliderLast.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("cy", "-1px")
        .attr("cx", xLast.range()[1])
        .attr("r", "5px")
        .style("cursor", "hand")
        .call(d3.drag()
          .on("start.interrupt", function () {
            sliderFirst.interrupt();
          })
          .on("start drag", function () {
            moveSlideLast(xLast.invert(d3.event.x));
          })
          .on("end", function () {
            dispatcher.call("slide", this, [yearFirst, xLast.invert(d3.event.x)]);
          })
        );

    */
      function moveSlideFirst(d) {
        if (handle2.attr("cx") < (xFirst(d))) {
          handle1.attr("cx", handle2.attr("cx"));
        } else {
          handle1.attr("cx", xFirst(d));
        }
        yearFirst = d3.format(".0f")(d);
      }

      function moveSlideLast(d) {

        if (handle1.attr("cx") > xFirst(d)) {
          handle2.attr("cx", handle1.attr("cx"));
        } else {
          handle2.attr("cx", xFirst(d));
        }
        yearLast = d3.format(".0f")(d);
      }

    }) // end of selection
  } //end of exports


  //export function to modules
  exports.slideWidth = function (_) {
    if (!argument.length) return sliderWidth;
    slideWidth = _;
    return exports;
  }

  exports.slideHeight = function (_) {
    if (!argument.length) return slideHeight;
    slideHeight = _;
    return exports;
  }

  // The '.on' instance method that accepts event
  // listeners. Unlike d3 v4, this cannot be simply
  // achieved via d3.rebind, which no longer exists
  exports.on = function () {
    var value = dispatcher.on.apply(dispatcher, arguments);
    return value === dispatcher ? exports : value;
  }


  return exports;

} //end of module
