<template>
  <div class="container-fluid">
    <h2>Failide üleslaadimine</h2>
    <div class="diagnosis-uploads mt-4">
      <h4>Laadi üles diagnoosid</h4>
      <input class="form-control-file" type="file" @change="diagnosisFile=$event.target.files"/>
      <button v-if="diagnosisFile" @click="uploadDiagnosis">Laadi üles</button>
    </div>

    <div class="diagnosis-uploads mt-4">
      <h4>Laadi üles mõõtmised</h4>
      <input class="form-control-file" type="file" @change="measurementsFile=$event.target.files"/>
      <button v-if="measurementsFile" @click="uploadMeasurements">Laadi üles</button>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        diagnosisFile: null,
        measurementsFile: null,
      }
    },
    methods: {
      uploadDiagnosis() {
        console.log(this.diagnosisFile);
        const formData = new FormData();
        formData.append('file', this.diagnosisFile[0], this.diagnosisFile[0].name);
        this.$axios.post('/api/uploads/diagnosis', formData).then(x => {
          console.log(x.data)
        })
      },
      uploadMeasurements() {
        console.log(this.measurementsFile);
        const formData = new FormData();
        formData.append('file', this.measurementsFile[0], this.measurementsFile[0].name);
        this.$axios.post('/api/uploads/measurements', formData).then(x => {
          console.log(x.data)
        })
      },
    }
  };
</script>