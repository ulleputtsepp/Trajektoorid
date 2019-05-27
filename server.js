const express = require('express');
const Path = require('path');

const isDev = process.env.NODE_ENV !== 'production';
const host = 'localhost';
const port = 3000;
const app = express();

process.on('unhandledRejection', e => {
  console.error(e);
  throw e;
});

process.on('uncaughtException', e => {
  console.error(e);
  process.exit(1);
});

app.use("/api", (req, res, next) => require('./api')(req, res, next));

if (isDev) {
  console.log('Setup autorefresh');
  const path = require('path');
  const chokidar = require('chokidar');
  const cwd = process.cwd();
  const serverDir = path.join(cwd, 'api');
  const watcher = chokidar.watch(serverDir);
  const {execSync, exec} = require('child_process');
  const findTab = new RegExp(`.+${host}:${port}.+`, 'g');
  const findTabId = /(\[\d+:|\[)(\d+)/;
  const hasChromeCli = require('command-exists').sync('chrome-cli');

  watcher.on('ready', function () {
    watcher.on('all', function (p, s) {
      if (!s.endsWith('.js')) {
        return;
      }
      console.log('Clearing /api/ module cache from server');
      Object.keys(require.cache).forEach(function (id) {
        if (id.startsWith(serverDir) && !id.endsWith('db.js')) {
          console.log('deleting', id);
          delete require.cache[id];
        }
      });
      if (hasChromeCli) {
        const tabs = execSync('chrome-cli list links').toString();
        console.log('ALL TABs\n', tabs);
        const matches = tabs.match(findTab) || [];
        console.log('APP TABs\n', matches);
        const ids = matches.map(m => findTabId.exec(m)[2]);
        console.log('APP TAB IDs\n', ids);
        ids.forEach(id => {
          exec(`chrome-cli reload -t ${id}`);
        });
      }
    });
  });
}

if (isDev) {
  const Bundler = require('parcel-bundler');

  const file = Path.join(__dirname, './index.html'); // Pass an absolute path to the entrypoint here
  const options = {
    watch: isDev,
    publicURL: '/'
  };

  // Initialize a new bundler using a file and options
  const bundler = new Bundler(file, options);

  // Let express use the bundler middleware, this will let Parcel handle every request over your express server
  app.use(bundler.middleware());
} else {
  app.use('/', express.static('dist'));
  app.get('*', (req, res) => res.sendFile(__dirname + '/dist/index.html'));
}

app.listen(port, () => console.log("App started!"));