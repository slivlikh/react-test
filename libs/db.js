var mysql = require('mysql');
var config = require('../libs/config');

var db_config = {
    host     : config.get('mysql:host'),
    user     : config.get('mysql:db_user'),
    password : config.get('mysql:db_pass'),
    database : config.get('mysql:db_name'),
    port: config.get('mysql:port')
};



function handleDisconnect() {
  connection = mysql.createConnection(db_config);
  connection.connect(function(err) {
    if(err) { 
      setTimeout(handleDisconnect, 2000); 
    }
  });
  return connection;
}

module.exports = handleDisconnect;