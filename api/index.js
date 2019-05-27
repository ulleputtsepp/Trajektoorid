const app = require('express').Router();
const multer = require('multer');
const fs = require('fs');
const csv = require('fast-csv');
const {Transform, Writable} = require('stream');
const db = require('./db');

const upload = multer({
  dest: './uploads'
});

class ConvertDiagnose extends Transform {
  constructor() {
    super({objectMode: true});
    this.rowNo = 0;
  }

  _transform(item, _, next) {
    //console.log('item', item);
    /**  andmebaasi vajalik
     * {
     *     date: 'YYYY-MM-DD',
     *     code: 'lkjlk',
     *     donor_id: 'lkjlkjkl',
     * }
     */

    /**
     * {date: '2019-03-13', code: 'I11', donor_id: '1'}
     * {start_date: '2019-03-13', code: 'lkjlkj', donor_id: '1'}
     * {'AssembledDiagnosis_startDate': '2019-03-13', code: 'lkjlkj', donor_id: '1'}
     */
    this.rowNo += 1;

    const newItem = {
      donor_id: item['donor_id'] || item['Person ukood'] || item['ukood'],
      start_date: item['date'] || item['start_date'] || item['AssembledDiagnosis startDate'],
      end_date: item['date'] || item['end_date'] || item['AssembledDiagnosis endDate'],
      icd10_code: item['code'] || item['AssembledDiagnosis icd10'],
      source: item['AssembledDiagnosis source'],
      row_no: this.rowNo,
    };
    /**
     * {date: '2019-03-13', code: 'I11', donor_id:'1'}
     * {date: '2019-03-13', code: 'I11', donor_id:'1'}
     */
    this.push(newItem);
    next();
  }
}

class ConvertMeasurement extends Transform {
  constructor() {
    super({objectMode: true});
    this.rowNo = 0;
  }

  _transform(item, _, next) {
    console.log('item', item);
    this.rowNo += 1;
    /**  andmebaasi vajalik
     * {
     *     date: 'YYYY-MM-DD',
     *     code: 'lkjlk',
     *     donor_id: 'lkjlkjkl',
     * }
     */

    /**
     * {date: '2019-03-13', code: 'I11', donor_id: '1'}
     * {start_date: '2019-03-13', code: 'lkjlkj', donor_id: '1'}
     * {'AssembledDiagnosis_startDate': '2019-03-13', code: 'lkjlkj', donor_id: '1'}
     */
    const newItem = {
      donor_id: item['Person ukood'] || item['donor_id'] || item['ukood'],
      date: item['AssembledMeasurements measurementDate'] || item['date'],
      type: item['AssembledMeasurements measurementType'],
      amount: item['AssembledMeasurements measurementAmount'],
      unit: item['AssembledMeasurements measurementUnit'],
      reference: item['AssembledMeasurements measurementReference'],
      source: item['AssembledMeasurements measurementSource'],
      row_no: this.rowNo,
    };
    /**
     * {date: '2019-03-13', code: 'I11', donor_id:'1'}
     * {date: '2019-03-13', code: 'I11', donor_id:'1'}
     */
    this.push(newItem);
    next();
  }
}

class Batch extends Transform {
  constructor(batchSize) {
    super({objectMode: true});
    this.batch = [];
    this.batchSize = batchSize;
  }

  _transform(item, _, next) {
    if (this.batch.length < this.batchSize) {
      //console.log('insert to Batch', item);
      this.batch.push(item);
    } else {
      console.log('push batch', item);
      this.push(this.batch);
      this.batch = [item];
    }
    next();
  }

  _flush(next) {
    if (this.batch.length > 0) {
      console.log('flush batch');
      this.push(this.batch);
    }
    next();
  }
}

class InsertDiagnosisToDatabase extends Writable {
  constructor(insertCommand) {
    super({objectMode: true});
    this.insertCommand = insertCommand;
  }

  _write(item, _, next) {
    console.log('insert to database');
    this.insertCommand('diagnosis').insert(item).then(() => {
      next();
    })
  }
}

const insertDiagnosis = (file) => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(file, {encoding: 'utf-8'})
      .pipe(csv({
        objectMode: true,
        headers: true,
        delimiter: ',',
        strictColumnHandling: true,
      }))
      .on('data-invalid', (e) => {
        console.error('kus viga1?', e);
        reject(e);
      })
      .on('error', (e) => {
        console.error('kus viga2?', e);
        reject(e);
      })
      .pipe(new ConvertDiagnose())
      .pipe(new Batch(500))
      .pipe(new InsertDiagnosisToDatabase(db))
      .on('error', (e) => {
        console.error('kus viga3?', e);
        reject(e);
      })
      .on('finish', () => {
        resolve();
      })
  });
};

class InsertMeasurementsToDatabase extends Writable {
  constructor(insertCommand) {
    super({objectMode: true});
    this.insertCommand = insertCommand;
  }

  _write(item, _, next) {
    console.log('insert to database', item);
    this.insertCommand('measurements').insert(item).then(() => {
      next();
    })
  }
}

const insertMeasurements = (file) => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(file, {encoding: 'utf-8'})
      .pipe(csv({
        objectMode: true,
        headers: true,
        delimiter: ',',
        strictColumnHandling: true,
      }))
      .on('data-invalid', (e) => {
        console.error(e);
        reject(e);
      })
      .on('error', (e) => {
        console.error(e);
        reject(e);
      })
      .pipe(new ConvertMeasurement())
      .pipe(new Batch(500))
      .pipe(new InsertMeasurementsToDatabase(db))
      .on('error', (e) => {
        console.error(e);
        reject(e);
      })
      .on('finish', () => {
        resolve();
      })
  });
};

app.get('/diagnosis', async (req, res) => {
  console.log('ask diagnosis');
  const data = await db.select('*').from('diagnosis').limit(10);
  console.log('ask diagnosis');
  res.json({ok: true, content: data})
});

app.get('/measurements', async (req, res) => {
  const data = await db.select('*').from('measurements');
  console.log('ask measurements');
  res.json({ok: true, content: data})
});

app.get('/person/:id/diagnosis', async (req, res) => {
  console.log('ask person diagnosis');
  const data = await db.select('*').from('diagnosis').where('donor_id', req.params.id);
  res.json({
    data: data,
    ok: true
  })
});

app.get('/person/:id/measurements', async (req, res) => {
  const data = await db.select('*').from('measurements').where('donor_id', req.params.id);
  res.json({
    data: data,
    ok: true
  })
});

app.post('/uploads/measurements', upload.single('file'), async (req, res) => {
  console.log(req.file);
  await db('measurements').delete();
  await insertMeasurements(req.file.path);
  res.json({
    ok: true
  })
});

app.post('/uploads/diagnosis', upload.single('file'), async (req, res) => {
  console.log(req.file);
  await db('diagnosis').delete();
  insertDiagnosis(req.file.path).then(() => {
    res.json({
      ok: true
    })
  });
});

module.exports = app;