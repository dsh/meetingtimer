const mapValues = require('lodash/object/mapValues');
const trim = require('lodash/string/trim');

const normalizeMeeting = meeting => mapValues(meeting, trim);
export default normalizeMeeting
