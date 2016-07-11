var fs = require('fs');
var db = require('./db');
var connection = db();
dbError();
function dbError(){
	connection.on('error', function(err) {
		console.log('db error', err);
		if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
		  	connection = db();
			dbError(); 
		} else {
		  throw err; 
		}
	});
}




var action = {
	getAllFilms: function(callback){
		connection.query('SELECT `name_film`, `film_id` FROM `films` ORDER BY `name_film`', function(err, rows, fields) {
			if (err){ callback(err); return; }
			callback(undefined, rows);
		});
	},
	moreInfo: function(id, callback){
		var allData = {};
		connection.query('SELECT * FROM `films` WHERE `film_id`=?', [id], function(err, rows, fields) {
			if(err) { callback(err); return; }
			if(rows.length == 0){
				callback(undefined, rows);
			}else{
				allData = rows[0];
				connection.query("SELECT `actor_name` FROM  `actors` INNER JOIN  `relation_actor_film` ON actors.actor_id = relation_actor_film.actor_id INNER JOIN  `films` ON films.film_id = relation_actor_film.film_id  WHERE films.film_id=?", [id], function(err, rows, fields) {
					if(err) { callback(err); return; }
					allData.actors = [];
					for(var i = 0; rows.length > i; i++){
						allData.actors.push(rows[i].actor_name);
					}
					callback(undefined, allData);
				});
			}
		});
	},
	searchFilmName: function(searchText, callback){
		connection.query("SELECT `name_film`, `film_id` FROM `films` WHERE `name_film`=?", [searchText], function(err, rows, fields) {
			if(err) { callback(err); return }
			callback(undefined, rows);
		});
	},
	searchActor: function(searchText, callback){
		connection.query("SELECT `name_film`, films.film_id FROM  `films` INNER JOIN  `relation_actor_film` ON films.film_id = relation_actor_film.film_id INNER JOIN  `actors` ON actors.actor_id = relation_actor_film.actor_id  WHERE actors.actor_name=?", [searchText], function(err, rows, fields) {
			if(err) { callback(err); return; }
			console.log(rows);
			callback(undefined, rows);
		});
	},
	deleteFilm: function(id, callback){
		connection.query('DELETE  FROM `films` WHERE `film_id`='+id, function(err, rows, fields) {
			if(err) { callback(err); return; }
			callback(undefined, rows);
		});
	},
	addNew: function(nameFilm, yearFilm, format, actors, callback){
		connection.query("SELECT film_id FROM `films` WHERE `name_film`= ? && `year film`= ?", [nameFilm, yearFilm], function(err, rows, fields) {
			if(err) { callback(err); return; }
			if(rows.length !== 0){
				callback(undefined, 'duplicate');
			}else{
				connection.query("INSERT INTO `films`(`name_film`, `year film`, `format`) VALUES (?,?,?)", [nameFilm, yearFilm, format], function(err, rows, fields){
					if(err) { callback(err); return; }
					var filmId = rows.insertId;
					actors = actors.split(',');
					for(var i = 0; actors.length > i; i++){
						(function(i){
							var actor = actors[i].trim();
							connection.query("SELECT actor_id FROM `actors` WHERE `actor_name`= ?", [actor], function(err, rows, fields) {
								if(err) { callback(err); return; }
								if(rows.length !== 0){
									var actorID = rows[0].actor_id;
									connection.query("INSERT INTO `relation_actor_film`(`film_id`, `actor_id`) VALUES (?,?)", [filmId, actorID], function(err, rows, fields){
										if(err) { callback(err); return; }
										if(i === actors.length-1){
											callback(err, 'ok');
										}
									});
								}else{
									connection.query("INSERT INTO `actors`(`actor_name`) VALUES (?)", [actor], function(err, rows, fields){
										if(err) { callback(err); return; }
										var actorID = rows.insertId;
										connection.query("INSERT INTO `relation_actor_film`(`film_id`, `actor_id`) VALUES (?,?)", [filmId, actorID], function(err, rows, fields){
											if(err) { callback(err); return; }
											if(i === actors.length-1){
												callback(err, 'ok');
											}
										});
									});
								}
							});
						}(i));
					}
				});
			}
		});
	},
	sendfile: function(req, callback){
		var AllFilms = [];
		fs.rename(req.file.path, req.file.destination+req.file.originalname, function(err){
    		if(err) throw err;
    		fs.readFile(req.file.destination+req.file.originalname, 'utf8', function(err, contents) {
    			if(err) throw err;
    			var contentsArr = contents.split('\n\n');
    			for(var i = 0; contentsArr.length > i; i++){
    				var oneFilmArr = contentsArr[i].split('\n');
    					var filmObj = {};
    					for(var j = 0; oneFilmArr.length > j; j++){
    						var key = oneFilmArr[j].slice(0, oneFilmArr[j].indexOf(':'));
    						var value = oneFilmArr[j].slice(oneFilmArr[j].indexOf(':')+1, oneFilmArr[j].length);
    						filmObj[key] = String(value).trim();
    					}
    					if("Title" in filmObj && "Release Year" in filmObj && "Format" in filmObj && "Stars" in filmObj){
    						AllFilms.push(filmObj);
    					}
    			}
    			for(var i = 0; AllFilms.length > i; i++){
    				(function(i){
    						action.addNew(AllFilms[i].Title, AllFilms[i]['Release Year'], AllFilms[i].Format, AllFilms[i].Stars, function(err, status){
    							if(err) { callback(err); return; }
    							if(i === AllFilms.length-1){
    								callback(undefined, "ok");
    							}
    						});
    				}(i));
    			}
			});
    	});
	}
};

module.exports = action;