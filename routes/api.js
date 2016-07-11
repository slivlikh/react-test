var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: process.cwd()+'/uploads/' });
var action = require('../libs/action');
router
	.get('/getallfilms', function(req, res){
		action.getAllFilms(function(err, rows){
			if(err || typeof rows === undefined){
				console.log(123);
				 res.send(JSON.stringify({error: "Произошла ошибка"}));
				 return;
			}
			if(rows.length == 0){  
				res.send(JSON.stringify({empty: "Фильмов нет"})); 
				return; 
			}
			res.status(200).json({message: rows});
		});
	})
	.get('/moreinfo/:id', function(req, res){
		action.moreInfo(req.params.id, function(err, rows){
			if(err || typeof rows === undefined){
				 res.send(JSON.stringify({error: "Произошла ошибка"}));
				 return;
			}
			if(rows.length === 0){
				res.send(JSON.stringify({empty: "Фильма нет"}));
			}else{
				res.status(200).send(rows);
			}
		});
		
	})
	.get('/searchfilmname/', function(req, res){
		var searchText  = decodeURIComponent(req.param('searchtext'));
		action.searchFilmName(searchText, function(err, rows){
			if(err) { res.send(JSON.stringify({error: "ok"})); return; } 
			if(rows.length == 0){
				res.send(JSON.stringify({empty: "Поиск не дал результатов"}));
			}else{
				res.status(200).json({response:rows});
			}
		});
	})
	.get('/searchactor/', function(req, res){
		var searchText  = decodeURIComponent(req.param('searchtext'));
		action.searchActor(searchText, function(err, rows){
			if(err) { res.send(JSON.stringify({error: "ok"})); return; }
			if(rows.length == 0){
				res.send(JSON.stringify({empty: "Поиск не дал результатов"}));
			}else{
				res.status(200).json({response:rows});
			}
		});
		
	})
	.delete('/deletefilm/:id', function(req, res){
		action.deleteFilm(req.params.id, function(err, rows){
			if(err){ res.send(JSON.stringify({error: "Произошла ошибка"})); return; }
			if(rows.affectedRows == 0){
				res.send(JSON.stringify({empty: "Фильм для удаления не найден"}));	
			}else{
				res.send(JSON.stringify({success: "Фильм успешно удален"}));
			}
		});
	})
	.put('/addnew', function(req, res){
		var newFilm = req.body.message;
		action.addNew(newFilm.nameFilm, newFilm.yearFilm, newFilm.format, newFilm.actors, function(err, status){
			if(err) { res.status(200).json({status: 'error'}); return; }
			if(status === "duplicate"){
				res.status(200).json({status: 'duplicate'});
			}else if(status === "ok"){
				res.status(200).json({status: 'ok'});
			}
		});
	})
	.put('/sendfile', upload.single('myfile'), function(req, res){
  		action.sendfile(req, function(err, status){
  			if(err){ 
  				res.status(200).json({status: 'error'}); return; 
  			}else{
  				if(status === "ok"){
					res.status(200).json({status: 'ok'}) ;
				}
  			}
  		});
	})

module.exports = router;
