const moment = require('moment');

// function for format or wrapp the incoming text

function formatMessage(username, text) {
    return {
        username,  
        text,
        time: moment().format('h:mm a')
    }
}
module.exports = formatMessage;