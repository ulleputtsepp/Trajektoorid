<template>
  <div class="line-chart">
  </div>
</template>

<script>
  import * as d3 from 'd3';

  export default {
    props: {
      items: {},
      circleColor: {},
      height: {
        default: 350,
      }
    },
    name: "LineChart",
    data() {
      return {
        margin: {
          top: 20, right: 20, bottom: 30, left: 50
        },
        position: {
          top: 0,
          left: 0,
          width: 0,
          height: 0,
        }
      };
    },
    mounted() {
      const vm = this;
      this.$nextTick(() => {
        vm.position = vm.$el.getBoundingClientRect();
        vm.redraw();
      });
    },
    methods: {
      redraw: function () {

        /*
        * värvide skaala
        * iga analüüs nime järgi eraldi joontele
        * iga punkti juurde ühiku silt algusest peale
        * punktil 'hoverimine' näitab väärtust
        */

        const vm = this;
        let {position, margin} = vm;
        position.height = vm.height;

        const parent = d3.select(vm.$el);
        //Object.keys(vm.items)
        const {_meta, ...items} = vm.items;
        const keys = Object.keys(items);
        console.log("keys", keys); //array personi analüüsitüüpidest
        //vm.items.sort((a, b) => new Date(a.date) - new Date(b.date))

        const svg = parent.append('svg')
            .attr('height', position.height)
            .attr('width', position.width),
          width = position.width - margin.left - margin.right,
          height = position.height - margin.top - margin.bottom;

        const parseTime = d3.timeParse("%d/%m/%y");
        const x = d3.scaleTime()
          .range([0, width - (margin.left + margin.right)])
          .domain([_meta.x.min, _meta.x.max]);
          // .domain(d3.extent(vm.items, function (d) {
          //   // console.log(d.date.split('T')[0])
          //   return new Date(d.date);
          // }));
        const y = d3.scaleLinear()
          .range([height - (margin.top * 2), 0])
          .domain([_meta.y.min, _meta.y.max]);
          // .domain([(Math.floor(d3.min(vm.items, function (d) {
          //   return d.value;
          // }) / 10) * 10),
          //   (Math.ceil(d3.max(vm.items, function (d) {
          //     return d.value;
          //   }) / 10) * 10)]);

        /*
        items = [group1: [{date, value, label}, {}], group2: [{}, {}]]
         */

        const line = d3.line()
          .x(function (d) {
            return x(new Date(d.date));
          })
          .y(function (d) {
            return y(d.amount);
          });

        const g = svg.append("g")
          .attr("transform", `translate(${margin.left},${margin.right})`);

        // add the Y gridlines
        g.append("g")
          .attr("class", "grid")
          .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat("")
            .ticks(6)
          );

        g.append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(" + ((margin.left + margin.right) / 2) + "," + (height - margin.top) + ")")
          .call(d3.axisBottom(x));

        g.append("g")
          .attr("class", "axis axis--y")
          .call(d3.axisLeft(y));

        Object.entries(items).forEach(([key, line], lineIdx) => {
          drawLines(key, lineIdx);
        });

        var focus = g.append("g")
          .attr("class", "focus")
          .style("display", "none");

        // focus.append("line")
        //   .attr("class", "x-hover-line hover-line")
        //   .attr("y1", 0)
        //   .attr("y2", height);

        // focus.append("line")
        //   .attr("class", "y-hover-line hover-line")
        //   .attr("x1", width)
        //   .attr("x2", width);

        // focus.append("circle")
        //   .attr("r", 7.5);

        focus.append("text")
          .attr("x", 50)
          .attr("dy", ".31em");

        var bisectDate = d3.bisector(function(d) { return d.date; }).left;

        function drawLines(key, index) {

          // Data line and dots group
          const lineAndDots = g.append("g")
            .attr("class", "line-and-dots " + index + " " + key)
            .attr("transform", "translate(" + ((margin.left + margin.right) / 2) + "," + 0 + ")")

          const lineData = items[key];
          console.log('lineData', key, lineData);
          // Data line
          // lineAndDots.append("path")
          //   .datum(lineData)
          //   .attr("class", "data-line " + index + " " + key)
          //   .attr("d", line);

          function mousemove() {
            let d = null;
            if (lineData.length > 1) {
              var x0 = x.invert(d3.mouse(this)[0]),
                i = bisectDate(lineData, x0, 1),
                d0 = lineData[i - 1],
                d1 = lineData[i];
              console.log('d', d0, d1, i);
              d = x0 - d0.date > d1.date - x0 ? d1 : d0; //'date' 'year' asemel
            } else {
              d = lineData[0]
            }

            console.log('d', d, d0, d1, i, x(new Date(d.date)));
            focus.attr("transform", "translate(" + x(new Date(d.date)) + 30 + "," + y(d.amount) + ")");//amount d.value asemel
            focus.select("text").text(function() { return d.type + ': '+ d.amount + ' ' + d.unit});
            // focus.select(".x-hover-line").attr("y2", height - y(d.amount));
            // focus.select(".y-hover-line").attr("x2", width + width);
          }

          // Data dots
          lineAndDots.selectAll("line-circle")
            .data(lineData)
            .enter()
            .append("circle")
            .on("mouseover", function() { focus.style("display", null); })
            .on("mouseout", function() { focus.style("display", "none"); })
            .on("mousemove", mousemove)
            .attr("class", "data-circle " + index + " " + key)
            .attr("r", 5)
            //.style('fill', '#ffcc06') //kõik punktid kollased
            .style("fill", function(d,i) {
              console.log('d-fill', d);
              return vm.circleColor(d.type) })
            .attr("cx", function (d) {
              return x(new Date(d.date));
            })
            .attr("cy", function (d) {
              return y(d.amount);
            });
        };
//hover algus
       // x.domain(d3.extent(items, function(d) { return d.date; }));
       // y.domain([d3.min(items, function(d) { return d.amount; }) / 1.005, d3.max(items, function(d) { return d.amount; }) * 1.005]);

        // svg.append("rect")
        //   .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        //   .attr("class", "overlay")
        //   .attr("width", width)
        //   .attr("height", height)
//hover lõpp

  }
    }
  }
</script>

<style>
  svg g .grid g.tick line {
    fill: #333132;
  }

  svg g .data-line {
    fill: none;
    stroke: #333132;
    stroke-width: 2px;
    shape-rendering: crispEdges;
  }

  svg g .grid line {
    stroke: #e2e7ea;
    stroke-opacity: 0.5;
  }
/*
  svg g data-circle {
    fill: #3C92BA;
  }
*/
/**hover
 svg g .focus circle {
    fill: #F1F3F3;
    stroke: #6F257F;
    stroke-width: 5px;
  }

svg g  .hover-line {
    stroke: #6F257F;
    stroke-width: 2px;
    stroke-dasharray: 3,3;
  }
hover */
</style>