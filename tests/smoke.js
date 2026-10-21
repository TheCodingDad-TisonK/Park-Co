// Park Co's smoke: `npm test`. Boots the page in a hidden Electron window and runs tests/park.smoke.js in it.
'use strict';
const path = require('path');
const { run } = require('co-engine/tools/smoke-runner');
run({ page: path.join(__dirname, '..', 'index.html'), handle: 'PARK_CO', userDataPrefix: 'park-co-test', scenarios: [{ name: 'the park', body: require('./park.smoke.js') }] });
