'use strict';
const path = require('path');
const { run } = require('co-engine/tools/smoke-runner');
run({ page: path.join(__dirname, '..', 'index.html'), handle: 'PARK_CO', userDataPrefix: 'park-co-debug', scenarios: [{ name: 'joris debug', body: require('./joris-debug.js') }] });
