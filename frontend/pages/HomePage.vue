<template>
  <div class="container-fluid">
    <h2>Doonori andmed</h2>
    <form @submit.prevent="searchPersonData">
      <div class="row mb-4">
        <div class="col-md-8">
          <input class="form-control" v-model="personCode" placeholder="Doonori identifikaator"/>
        </div>
        <div class="col-md-4">
          <button class="btn btn-block" style="background-color: #2484c6; color: white" type="submit">Otsi</button>
        </div>
      </div>
    </form>
    <div class="diagnosis">
      <h4>Diagnoosid</h4>
      <div class="diagnosis-data" v-if="showTimeline && diagnosis.length > 0">
        <timeline :items="diagnosisTimeline"></timeline>
        <div class="table-wrapper-scroll-y my-custom-scrollbar">
          <table class="table table-sm">
            <thead>
            <tr>
              <th>no</th>
              <th>donor id</th>
              <th>icd-10</th>
              <th>start</th>
              <th>end</th>
              <th>source</th>
            </tr>
            </thead>

            <tbody>
            <tr v-for="i in diagnosis">
              <td>{{i.row_no}}</td>
              <td>{{i.donor_id}}</td>
              <td>{{i.icd10_code}}</td>
              <td>{{i.start_date.slice(0,10)}}</td>
              <td>{{i.end_date.slice(0,10)}}</td>
              <td>{{i.source}}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="alert alert-secondary" v-if="diagnosis.length===0">Andmed puuduvad</div>
    </div>
    <div class="measurements">
      <h4>Mõõtmised</h4>
      <div class="measurements-data"
           v-if="showTimeline && Object.keys(measurements).length > 0">
        <line-chart :items="measurementsTimeline" :circleColor="circleColor"></line-chart>
        <div class="table-wrapper-scroll-y my-custom-scrollbar">
          <table class="table table-sm">
            <thead>
            <tr>
              <th>no</th>
              <th>donor id</th>
              <th>date</th>
              <th>type</th>
              <th>amount</th>
              <th>unit</th>
              <th>reference</th>
              <th>source</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="i in measurements">
              <!-- <td v-for="item in i">{{item}}</td>-->
              <td>{{i.row_no}}</td>
              <td>{{i.donor_id}}</td>
              <td>{{i.date.slice(0,10)}}</td>
              <td>{{i.type}}</td>
              <td>{{i.amount.slice(0,6)}}</td> <!--kuidas ümardada float?-->
              <td>{{i.unit}}</td>
              <td>{{i.reference}}</td>
              <td>{{i.source}}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="alert alert-secondary" v-if="measurements.length===0">Andmed puuduvad</div>
    </div>
  </div>
</template>

<script>
  import Timeline from "../components/Timeline";
  import LineChart from "../components/LineChart";

  const groupByCode = (array) => {
    console.log('seleta groupByCode', array);
    let someThing =
      array.reduce((labels, item) => {
        (labels[item.icd10_code] = labels[item.icd10_code] || []).push(item); //push method appends values to array
        return labels;
      }, {});
    console.log('someThing', someThing);

    let misseeon = Object.entries(someThing);
    console.log('misseeon?', misseeon);
    return misseeon
      .map(i => {
        console.groupCollapsed('groupByCode.map ' + i[0]);
        console.log('i1', i[1]);
        const data = i[1].map(j => {
          console.log('j', j); //kogub samad koodid erinevatel kuupäevadel
          return {
            timeRange: [new Date(j.start_date), new Date(j.end_date)],
            val: j.icd10_code,
          }
        });
        console.groupEnd();
        return {
          label: i[0],
          data: data,
        }
      })
  };

  const groupByFirstLetter = (array) => {
    console.log('otsi_array', array); // array=diagnoosid ajalises järjestuses, iga rida eraldi obj
    let xbegin = new Date();
    console.log('xbegin_sisu', xbegin); //aeg praegu
    let reducer = (groups, item) => {
      console.log('item', item);
      console.log('groups', JSON.parse(JSON.stringify(groups))); //grupid icd10 esitähe järgi
      const key = item.icd10_code[0];
      console.log('key', key); //esitäht J või K jne
      const currentDate = new Date(item.start_date);

      if (currentDate.getTime() < xbegin.getTime()) {
        xbegin = currentDate;
      }
      //xbegin = currentDate.getTime() > xbegin.getTime() ? xbegin : currentDate; //eelmise if-lause lühiversioon

      //(groups[key] = groups[key] || []).push(item); //järgmise if-lause lühiversioon
      if (groups[key]) {
        groups[key].push(item);
      } else {
        groups[key] = [];
        groups[key].push(item);
      }

      console.log('esimene return');
      return groups;
    };

    let diagnosisGroups = array.reduce(reducer, {});
    console.log('diagnosisGroups?', diagnosisGroups);

    let diagnoseGroupEntries = Object.entries(diagnosisGroups);
    console.groupCollapsed('diagnoseGroupEntries');
    console.log('diagnoseGroupEntries', diagnoseGroupEntries); //

    let grouped = diagnoseGroupEntries
      .map(i => {
        console.groupCollapsed('diagnoseGroupEntries.map ' + i[0]);
        console.log('i[0] väärtus', i[0]);
        console.log('i[1] väärtus', i[1]);
        let data = groupByCode(i[1]);
        console.log('data groupByCode', groupByCode(i[1]));
        console.groupEnd();
        return {
          group: i[0],
          data: data,
        };
      });
    console.groupEnd();
    return {
      xbegin,
      grouped
    }
  };

  export default {
    components: {LineChart, Timeline},
    data() {
      return {
        personCode: '',
        showTimeline: false,
        diagnosis: [],
        diagnosisTimeline: [],
        measurements: [],
        measurementsTimeline: []
      }
    },
    created() {
      if (this.personCode) {
        this.searchPersonData();
      }
    },
    methods: {
      searchPersonData() {
        this.showTimeline = false;
        Promise
          .all([
            this.findPersonDiagnosis(this.personCode),
            this.findPersonMeasurements(this.personCode)
          ])
          .then(res => {
            const [{diagnosis, diagnosisGrouped}, {measurements, measurementsGrouped}] = res;
            const xMin = Math.min(measurementsGrouped._meta.x.min.getTime(), diagnosisGrouped.xbegin.getTime());
            measurementsGrouped._meta.x.min = new Date(xMin);
            diagnosisGrouped.xbegin = new Date(xMin);
            this.measurementsTimeline = measurementsGrouped;
            this.measurements = measurements;
            this.diagnosisTimeline = diagnosisGrouped.grouped;
            this.diagnosis = diagnosis;
            this.showTimeline = true;
          })
      },
      findPersonDiagnosis(personCode) {
        console.log('joudsin kohale');
        return this.$axios.get('/api/person/' + personCode + '/diagnosis')
          .then(x => {
            console.log('esita_x', x);
            const data = groupByFirstLetter(x.data.data);//.groupBy(i => i.code[0]);
            console.log('diagnosisGrouped', data);
            return {
              diagnosis: x.data.data,
              diagnosisGrouped: data
            }
          })
      },
      findPersonMeasurements(personCode) {
        console.log('meetod PersonMeasurements välja kutsutud');
        return this.$axios.get('/api/person/' + personCode + '/measurements')
          .then(x => {
            console.log('andmed serverist tulnud', x.data.data);
            let initialData = {
              _meta: {
                x: {
                  min: new Date(),
                  max: new Date(),
                },
                y: {
                  min: Number.MAX_VALUE,
                  max: Number.MIN_VALUE,
                }
              }
            };
            const cb = (acc, i) => {
              acc[i.type] = (acc[i.type] || []);
              acc[i.type].push(i);
              const amount = parseFloat(i.amount);
              if (amount) {
                acc._meta.y.max = Math.max(+i.amount, acc._meta.y.max);
                acc._meta.y.min = Math.min(+i.amount, acc._meta.y.min);
              }
              const currentDate = new Date(i.date);
              acc._meta.x.min = currentDate.getTime() > acc._meta.x.min.getTime() ? acc._meta.x.min : currentDate;
              return acc;
            };
            const grouped = x.data.data.reduce(cb, initialData);
            return {
              measurements: x.data.data,
              measurementsGrouped: grouped
            }
          });
      },
      circleColor(measurementType) {
        let typeColor = {
          "last_hdl_cholesterol_level": "#3c92ba",
          "fS,fP-HDL-Chol": "#3C92BA",
          "HDL-Chol": "#3C92BA",
          "HDL": "#3C92BA",
          "S-HDL-Chol": "#3C92BA",
          "last_ldl_cholesterol_level": "#23556d",
          "fS,fP-LDL-Chol": "#23556d",
          "LDL": "#23556d",
          "LDL-Chol": "#23556d",
          "S-LDL-Chol": "#23556d",
          "last_cholesterol_level_measured": "#2484c6",
          "S,P-Chol": "#2484c6",
          "S-Chol": "#2484c6",
          "Kolesterool": "#2484c6",
          "last_empty_stomach_bloodsugar_level": "#c99c3c",
          "fS-Gluc": "#c99c3c",
          "blood_pressure_diastolic": "#a52732",
          "blood_pressure_diastolic2": "#a52732",
          "blood_pressure_diastolic3": "#a52732",
          "blood_pressure_systolic": "#a52732",
          "blood_pressure_systolic2": "#a52732",
          "blood_pressure_systolic3": "#a52732",
          "RBC": "#8a2889",
          "B-RBC": "#8a2889",
          "MCV": "#8a2889",
          "E-MCV": "#8a2889",
          "MCH": "#8a2889",
          "E-MCH": "#8a2889",
          "MCHC": "#8a2889",
          "MCHC (keskm.Hb kontsentratsioon erütr.-s)": "#8a2889",
          "RDW": "#8a2889",
          "RDW-CV": "#8a2889",
          "RDW-SD": "#8a2889",
          "Hct": "#8a2889",
          "HCT": "#8a2889",
          "B-Hct": "#8a2889",
          "Hb": "#8a2889",
          "HGB": "#8a2889",
          "HGB (hemoglobiin)": "#8a2889",
          "WBC": "#8a2889",
          "fB-WBC": "#8a2889",
          "PLT": "#8a2889",
          "PLT (trombotsüüdid)": "#8a2889",
          "B-Plt": "#8a2889",
          "P-APTT - Aktiveeritud osalise tromboplastiini aeg": "#8a2889",
          "P-PT-INR - Protrombiini aeg- rahvusvaheline normitud suhe": "#8a2889",
          "CBC, DIFF(5)": "#8a2889",
          "B-CBC-5Diff": "#8a2889",
          "BASO% (%)": "#8a2889",
          "B-BASO# (E9/L)": "#8a2889",
          "B-EO# (E9/L)": "#8a2889",
          "B-Hb (g/L)": "#8a2889",
          "B-Hct (%)": "#8a2889",
          "B-NEUT% (%)": "#8a2889",
          "B-NEUT# (E9/L)": "#8a2889",
          "B-PLT (E9/L)": "#8a2889",
          "B-RBC (E12/L)": "#8a2889",
          "E-MCH (pg)": "#8a2889",
          "E-MCV (fL)": "#8a2889",
          "EO% (%)": "#8a2889",
          "fB-LYMPH% (%)": "#8a2889",
          "fB-LYMPH# (E9/L)": "#8a2889",
          "fB-MONO% (%)": "#8a2889",
          "fB-MONO# (E9/L)": "#8a2889",
          "fB-WBC (E9/L)": "#8a2889",
          "fS-Fol (nmol/L)": "#8a2889",

          "bmi": "#e0078c",
          "height": "#e0078c",
          "hip": "#e0078c",
          "waist": "#e0078c",
          "weight": "#e0078c",
          "arm_circumference": "#e0078c",

          "pulse": "#e0078c",
          "pulse1": "#e0078c",
          "pulse2": "#e0078c",
          "pulse3": "#e0078c",
          "pulse_radial1": "#e0078c",

          "fS-Urea": "#928cdb",
          "S-Alb": "#928cdb",
          "S-CRP": "#928cdb",
          "S-K": "#928cdb",
          "S-Na": "#928cdb",
          "S-Prot": "#928cdb",
          "last_creatinine_level": "#66b76d",
          "fS-Crea": "#66b76d",
          "Kreatiniin": "#66b76d",
          "S,P-Crea": "#66b76d",

          "AFP alfafetoproteiin": "#9c9e22",
          "CA 125 kasvajamarker": "#9c9e22",
          "CEA kartsinoembrüonaalne antig": "#9c9e22",
          "hGH / Somatotropiin kasvuh": "#9c9e22",
          "ROMA indeks": "#9c9e22",
          "S-ALAT (alaniini aminotransferaas)": "#9c9e22",
          "S-Alb (albumiin)": "#9c9e22",
          "S-ASAT (aspartaadi aminotransferaas)": "#9c9e22",
          "S-Bil (bilirubiin)": "#9c9e22",
          "S-CRP (C-reaktiivne valk)": "#9c9e22",
          "S-HE4 epiteliaalse munasarjakasvaja marker HE4": "#9c9e22",
          "S-K (kaalium)": "#9c9e22",
          "S-LDH (laktaadi dehüdrogenaas)": "#9c9e22",
          "S-Na (naatrium)": "#9c9e22",
          "S-Prot (valk)": "#9c9e22"
        };
        if (typeColor[measurementType]) {
          return typeColor[measurementType];
        }
        return "black";
      }
    }
  }
</script>

<style>
  .my-custom-scrollbar {
    position: relative;
    height: 200px;
    overflow: auto;
  }

  .table-wrapper-scroll-y {
    display: block;
  }

  tr {
    font-size: small;
  }

  circle.last_ldl_cholesterol_level {
    fill: aquamarine;
  }


  /*Kolesterool: #3C92BA;
  last_cholesterol_level_measured: #3C92BA;
  S,P-Chol: #3C92BA;
  S-Chol: #3C92BA;

#f58233

fS,fP-HDL-Chol
HDL
HDL-Chol
last_hdl_cholesterol_level
S-HDL-Chol

fS,fP-LDL-Chol
LDL
LDL-Chol
last_ldl_cholesterol_level
S-LDL-Chol

#229e2d
last_creatinine_level
fS-Crea
Kreatiniin
S,P-Crea

#00b8ec
last_empty_stomach_bloodsugar_level
fS-Gluc

#a52732
blood_pressure_diastolic
blood_pressure_diastolic2
blood_pressure_diastolic3
blood_pressure_systolic
blood_pressure_systolic2
blood_pressure_systolic3

#2484c6
RBC
B-RBC
MCV
E-MCV
MCH
E-MCH
MCHC
MCHC (keskm.Hb kontsentratsioon erütr.-s)
RDW
RDW-CV
RDW-SD
Hct
HCT
B-Hct
Hb
HGB
HGB (hemoglobiin)
WBC
fB-WBC
PLT
PLT (trombotsüüdid)
B-Plt
P-APTT - Aktiveeritud osalise tromboplastiini aeg
P-PT-INR - Protrombiini aeg- rahvusvaheline normitud suhe
CBC, DIFF(5)
B-CBC-5Diff
B-CBC-5Diff
BASO% (%)
B-BASO# (E9/L)
B-EO# (E9/L)
B-Hb (g/L)
B-Hct (%)
B-NEUT% (%)
B-NEUT# (E9/L)
B-PLT (E9/L)
B-RBC (E12/L)
E-MCH (pg)
E-MCV (fL)
EO% (%)
fB-LYMPH% (%)
fB-LYMPH# (E9/L)
fB-MONO% (%)
fB-MONO# (E9/L)
fB-WBC (E9/L)
fS-Fol (nmol/L)

#e0078c
bmi
height
hip
waist
weight
arm_circumference

pulse
pulse1
pulse2
pulse3
pulse_radial1

#8a2889
fS-Urea
S-Alb
S-Alb
S-CRP
S-K
S-Na
S-Prot

#9c9e22
AFP alfafetoproteiin
CA 125 kasvajamarker
CEA kartsinoembrüonaalne antig
hGH / Somatotropiin kasvuh
ROMA indeks
S-ALAT (alaniini aminotransferaas)
S-Alb (albumiin)
S-ASAT (aspartaadi aminotransferaas)
S-Bil (bilirubiin)
S-CRP (C-reaktiivne valk)
S-CRP (C-reaktiivne valk)
S-HE4 epiteliaalse munasarjakasvaja marker HE4
S-K (kaalium)
S-LDH (laktaadi dehüdrogenaas)
S-Na (naatrium)
S-Prot (valk)

}
 */
</style>