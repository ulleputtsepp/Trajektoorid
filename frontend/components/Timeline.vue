<template>
  <div class="timeline">
    <div ref="timeline"></div>
  </div>
</template>

<script>
  import TimelinesChart from 'timelines-chart';

  export default {
    props: {
      items: {}
    },
    data() {
      return {}
    },
    mounted() {
      const vm = this;
      const randomData = vm.getRandomData(true);

      this.$nextTick(() => {
        const myChart = TimelinesChart();
        myChart.data(this.items)(vm.$refs.timeline)
      });
    },
    methods: {
      getRandomData(ordinal = false) {
        const NGROUPS = 22, //horisontaal:diagnoosigrupid, kuvab ainult need, mille kohta andmed
          MAXLINES = 21, //alamgrupid
          MAXSEGMENTS = 20,
          MAXCATEGORIES = 20,
          MINTIME = new Date(2013, 2, 21);

        const nCategories = Math.ceil(Math.random() * MAXCATEGORIES),
          categoryLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

        return [...Array(NGROUPS).keys()].map(i => ({
          group: 'group' + (i + 1),
          data: getGroupData()
        }));

        //

        function getGroupData() {

          return [...Array(Math.ceil(Math.random() * MAXLINES)).keys()].map(i => ({
            label: 'label' + (i + 1),
            data: getSegmentsData()
          }));

          //

          function getSegmentsData() {
            const nSegments = Math.ceil(Math.random() * MAXSEGMENTS),
              segMaxLength = Math.round(((new Date()) - MINTIME) / nSegments);
            let runLength = MINTIME;

            return [...Array(nSegments).keys()].map(i => {
              const tDivide = [Math.random(), Math.random()].sort(),
                start = new Date(runLength.getTime() + tDivide[0] * segMaxLength),
                end = new Date(runLength.getTime() + tDivide[1] * segMaxLength);

              runLength = new Date(runLength.getTime() + segMaxLength);

              return {
                timeRange: [start, end],
                val: ordinal ? categoryLabels[Math.ceil(Math.random() * nCategories)] : Math.random()
                //labelVal: is optional - only displayed in the labels
              };
            });

          }
        }
      }
    }
  }
</script>