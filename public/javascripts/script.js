var AddNewFilm = React.createClass({
	getInitialState: function(){
		return {
			 status: "",
			 format: "VHS",
		};
	},
	clickRadio: function(e){
		this.setState({format: e.target.value});
	},
	addNewFilm: function(){
		var refs = this.refs;
		if(!refs.nameFilm.value.trim() || !refs.yearFilm.value.trim() || !refs.actors.value.trim() ){
			this.setState({status: "Все поля обязателны к заполнению"});
		}else{
			this.setState({status: ""});
			var req = new XMLHttpRequest();
			req.open("PUT", './api/addnew', true);
			var body = {};
			for(var ref in refs){
				body[ref] = refs[ref].value;
			}
			body.format = this.state.format;
			req.setRequestHeader('Content-Type', 'application/json');
			req.send(JSON.stringify( {message: body} ));
			req.onreadystatechange = () => {
  				if (req.readyState == 4) {
  				   if(req.status == 200) {
  				     try{
  				     	var anser = JSON.parse(req.responseText);
  				     }catch(e){
  				     	console.log(e);
  				     	this.setState({status: "Произошла ошибка"});
  				     }
  				     if(anser){
  				     	if(anser.status === 'duplicate'){
  				     		this.setState({status: "Этот фильм уже есть"});
  				     	}else if(anser.status === 'ok'){
  				     		this.setState({status: "Фильм успешно добавлен"});
  				     	}else if(anser.status === 'error'){
  				     		this.setState({status: "Произошла ошибка"});
  				     	}
  				     }
  				   }else{
  				   		this.setState({status: "Произошла ошибка"});
  				   }
  				}
			};
		}
	},
	submit: function(e){
		e.preventDefault();
	},
	render : function(){
		return (
			<div>
				<h3> Добавить новый фильм </h3>
				<p>Введите название фильма</p>
				<form action=""  type="POST" onSubmit={this.submit}>
				<input required type="text" ref="nameFilm" name="nameFilm" />
				<p>Введите год выпуска</p>
				<input required type="number" ref="yearFilm" name="yearFilm" />
				<p>Выберете тип носителя</p>
				<label for="vhs"><input type="radio" onChange={this.clickRadio} name="format" id="vhs"  value="VHS" defaultChecked  />VHS</label>
				<label for="dvd"><input type="radio" onChange={this.clickRadio} name="format" id="dvd" value="DVD" />DVD</label>
				<label for="blue-ray"><input type="radio" onChange={this.clickRadio} name="format" id="blue-ray" value="Blue Ray" />Blue Ray</label>
				<p>Введите список актеров через запятую</p>
				<textarea required ref="actors" name="actors"></textarea>
				<button className="btn btn-success" onClick={this.addNewFilm}>Отправить</button>
				</form>
				<p>{this.state.status}</p>
			</div>
		)
	}
});
var SendFile = React.createClass({
	getInitialState: function(){
		return {
			 status: "",
		};
	},
	send: function(){
		this.setState({status: ""});
		var file = this.refs.file.files[0];
		if(file){
			var req = new XMLHttpRequest();
			var formData = new FormData();
			formData.append("myfile", file);
			req.open("PUT", './api/sendfile', true);
			req.send(formData);
			req.onreadystatechange = () => {
  				if (req.readyState == 4) {
  				   if(req.status == 200) {
  				     try{
  				     	var anser = JSON.parse(req.responseText);
  				     }catch(e){
  				     	this.setState({status: "Произошла ошибка"});
  				     }
  				     if(anser){
  				     	if(anser.status === 'ok'){
  				     		this.setState({status: "Файл успешно импортирован"});
  				     	}else if(anser.status === 'error'){
  				     		this.setState({status: "Во время импортирования произошла ошибка"});
  				     	}
  				     }
  				   }else{
  				   		this.setState({status: "Во время импортирования произошла ошибка"});
  				   }
  				}
			};
		}
	},
	render: function(){
		return (
			<div>
				<input type="file" ref="file" />
				<button className="btn btn-success" onClick={this.send}>Отправить</button>
				<p>{this.state.status}</p>
			</div>
		)
	}
});
var Film = React.createClass({
	getInitialState: function(){
		return {
			 year: "",
			 format: "",
			 actors: ""
		};
	},
	moreInfo: function(){
		var req = new XMLHttpRequest();
		req.open('GET', './api/moreinfo/'+this.props.id, true);
		req.onreadystatechange = () => {
  			if (req.readyState == 4) {
  			   if(req.status == 200) {
  			     try{
  			     	var moreInfo = JSON.parse(req.responseText);
  			     }catch(e){
  			     	console.log(e);
  			     }
  			     if(moreInfo){
  			     	this.setState({year: moreInfo['year film'], format: moreInfo.format, actors: moreInfo.actors.join(', ')});
  			     }
  			   }
  			}
		};
		req.send(null);
	},
	remove: function(){
		var req = new XMLHttpRequest();
		req.open('DELETE', './api/deletefilm/'+this.props.id, true);
		req.onreadystatechange = () => {
  			if (req.readyState == 4) {
  			   if(req.status == 200) {
  			     try{
  			     	var moreInfo = JSON.parse(req.responseText);
  			     }catch(e){
  			     	console.log(e);
  			     }
  			     this.props.remove(this.props.id);
  			   }
  			}
		};
		req.send(null);
		this.props.remove(this.props.id);
	},
	render: function(){
		return (
			<tr> 
				<td>{this.props.id}</td>
				<td>{this.props.name}</td>
				<td>{this.state.year}</td>
				<td>{this.state.format}</td>
				<td>{this.state.actors}</td>
				<td>
					<button className="btn btn-xs btn-success" onClick={this.moreInfo} >Подробнее</button>
					<button className="btn btn-xs btn-danger" onClick={this.remove}>Удалить</button>
				</td>
		 	</tr>
		)
	}
});
var SearchForm = React.createClass({
	getInitialState: function(){
		return {
			status: ""
		}
	},
	handleSearch: function(e){
		this.setState({status: ""});
		var searchInputValue = this.refs.searchInput.value;
		if(this.props.search == "film"){
			var url = './api/searchfilmname?searchtext='+encodeURIComponent(searchInputValue);
			alert(url);
		}else if(this.props.search == "actor"){
			var url = './api/searchactor?searchtext='+encodeURIComponent(searchInputValue);
		}
		var req = new XMLHttpRequest();
		req.open('GET', url, true);
		req.onreadystatechange = () => {
  			if (req.readyState == 4) {
  			   if(req.status == 200) {
  			     try{
  			     	var filmList = JSON.parse(req.responseText);
  			     }catch(e){
  			     	this.setState({status: "Произошла ошибка"});
  			     	console.log(e);
  			     }
  			     if(filmList.empty){
  			     	this.setState({status: "Поиск не дал результатов"});
  			     }else if(filmList.error){
  			     	this.setState({status: "Произошла ошибка"});
  			     }else{
  			     	this.props.onNewFilmsList(filmList.response);
  			     }
  			   }else{
  			   		this.setState({status: "Произошла ошибка"});
  			   }
  			}
		};
		req.send(null);
	},
	render: function(){
		return (
			<div>
				<input className="searchInput" ref="searchInput" type="text" /> <button className="btn btn-success" onClick={this.handleSearch}>Поиск</button>
				<p>{this.state.status}</p>
			</div>
		)
	}
});
var FilmsList = React.createClass({
	render: function(){
		var onFilmDelete = this.props.onFilmDelete;
		return (
			<div>
				<table className="filmsTable table table-hover">
					<thead>
						<tr>
							<td className="filmsTable__id">ID</td>
							<td className="filmsTable__name">Название</td>
							<td className="filmsTable__year">Год</td>
							<td className="filmsTable__format">Формат</td>
							<td className="filmsTable__actors">Актеры</td>
							<td className="filmsTable__do">Действие</td>
						</tr>
					</thead>
					{
						this.props.filmsList.map( (el) =>{
							return <Film key={el.film_id} id={el.film_id} name={el.name_film} remove={onFilmDelete} />
						})
					}
				</table>
			</div>
		)
	}
});
var ReactApp = React.createClass({
	getInitialState: function(){
		return {
			 displayFilmList: [],
			 status: ''
		};
	},
	setNewFilmsList: function(newFilmsList){
		this.setState({displayFilmList: newFilmsList});
	},
	showAllFilms: function(){
		this.setState({status: ""});
		var req = new XMLHttpRequest();
		req.open('GET', './api/getallfilms', true);
		req.onreadystatechange = () => {
  			if (req.readyState == 4) {
  			   if(req.status == 200) {
  			     try{
  			     	var allFilms = JSON.parse(req.responseText);
  			     }catch(e){
  			     	console.log(e);
  			     }
  			     if(allFilms.empty){
  			     	this.setState({status: allFilms.empty});
  			     }
  			     if(allFilms.message){
  			     	this.setState({displayFilmList: allFilms.message});
  			     } 
  			   }
  			}
		};
		req.send(null);
	},
	hendleFilmDelete: function(id){
		for(var i = 0; this.state.displayFilmList.length > 0; i++){
			if(this.state.displayFilmList[i].film_id === id){
				this.state.displayFilmList.splice(i, 1);
				this.setState({displayFilmList: this.state.displayFilmList});
			}
		}
	},
	render: function(){
		return (
			<div className="container">
				<div className="row">
					<div className="col-md-3">
						<AddNewFilm />
						<SendFile />
					</div>
					<div className="col-md-6">
						<FilmsList filmsList={this.state.displayFilmList} onFilmDelete={this.hendleFilmDelete} />
					</div>
					<div className="col-md-3">
						<p>Поиск фильма</p>
						<SearchForm onNewFilmsList={this.setNewFilmsList} search={'film'} />
						<p>Поиск фильмов по актеру</p>
						<SearchForm  onNewFilmsList={this.setNewFilmsList} search={'actor'} />
						<button className="btn btn-success" onClick={this.showAllFilms}>Показать все фильмы</button>
						<p>{this.state.status}</p>
					</div>
				</div>
			</div>
		)
	}
});
ReactDOM.render(
	<ReactApp />,
	document.getElementById('reactApp')
);