import React from "react";
import ReactDOM from "react-dom";
// Fonts

// broken?
// Roboto font for material
//import 'fontsource-roboto'; // Workaround parcel issue?

// Core components
import { Skeleton } from "@material-ui/lab";
import { Container } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
// import FormGroup from "@material-ui/core/FormGroup";
// import FormControlLabel from "@material-ui/core/FormControlLabel";

// Utilites
import { makeStyles } from "@material-ui/core/styles";

// Ui icons
import MenuIcon from "@material-ui/icons/Menu"; // Also called a hamburger
import StorageIcon from "@material-ui/icons/Storage";
import MusicNoteIcon from "@material-ui/icons/MusicNote";
import HomeRoundedIcon from "@material-ui/icons/HomeRounded";

// Ui Widgets

import Paper from "@material-ui/core/Paper";
import AppBar from "@material-ui/core/AppBar";
import Drawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import Switch from "@material-ui/core/Switch";
import Toolbar from "@material-ui/core/Toolbar";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import TextField from "@material-ui/core/TextField";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
// List
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
// Tables
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

// Utilities
import clsx from "clsx";

// Reusable Player Componoent
import { PlayerComponent } from "./player";
// Styles
import {colStyleGenerator} from "./sharedStyles";

const Store = require("electron-store");
// Settings Loading
if (!Store) {
	console.warn("NO STORE found");
}
const settings = new Store({
	defaults: {
		pageSize: 25,
		snackbarAutoHideDuration: 5000,
	},
});

//import {$} from "jquery";
const $ = require("jquery");
const regeneratorRuntime = require("regenerator-runtime");
console.log("bundle :D");
import { localizedFuncs } from "./utils.js";

// Constants

let musicServer = "http://localhost:3000"; // NO SLASH!
function capitlizeFirst(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}
// https://stackoverflow.com/questions/7045065/how-do-i-turn-a-javascript-dictionary-into-an-encoded-url-string
function serialize(obj) {
	var str = [];
	for (var p in obj)
		str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
	return str.join("&");
}
function calcColClass(cols) {
	return "s" + 12 / cols;
}
// https://material-ui.com/components/snackbars/
function Alert(props) {
	return <MuiAlert elevation={6} variant="filled" {...props} />;
  }
class ResultView extends React.PureComponent {
	constructor(props) {
		super(props); // Deprecated but needed anyway
		this.state = {
			pageIndex: 0,
			type: props.type,
			col1: i18n.__(props.colNames[0]),
			col2: i18n.__(props.colNames[1]),
			col3: i18n.__(props.colNames[2]),
			pageData: [],
			connectionFailedSnackbarOpen: false
		};
		this.search.bind(this)();
	}
	
	componentDidUpdate(prevProps) {
		if (this.props.query !== prevProps.query) {
			this.search();
		}
	}
	componentDidMount() {
		// Code to run when component starts
		console.info("Result View Mounted");
		this.search();
		let componentThis = this;
		this.updateSearchInterval = setInterval(function () {
			if (componentThis.query) {
				componentThis.search.bind(componentThis)();
			}
		}, 2500);
	}

	componentWillUnmount() {
		// Componoent dies -> deconstructor
		clearInterval(this.updateSearchInterval);
	}
	hideConnectionFailureSnackbar(){
		this.setState(function (state, props) {
			return {
				connectionFailedSnackbarOpen: false,
			};
		});
	}
	showConnectionFailureSnackbar(){
		this.setState(function (state, props) {
			return {
				connectionFailedSnackbarOpen: true,
			};
		});
	}
	handleConnectionFailureSnackbarClose(event,reason){
		if(reason == "clickaway"){
			return;
		}
		this.hideConnectionFailureSnackbar();
	}
	async search() {
		console.log("Running Search Request");
		let pageSize = settings.get("pageSize");
		try {
			let resp = await (
				await fetch(
					musicServer +
						"/api/fetch_" +
						this.state.type +
						"?" +
						serialize({
							limit: pageSize,
							offset: pageSize * this.state.pageIndex,
							name: this.props.query + "%",
						})
				)
			).json();
			if (resp.status == "ok") {
				let data = resp.data;
				console.log("Updating data for " + this.state.query);
				this.setState(function (state, props) {
					return { pageData: data };
				});
			}
		} catch (ex) {
			console.log("Connection failed: showing connection failure snackbar",ex);
			this.showConnectionFailureSnackbar();
			return;
		}
	}
	render() {
		let	outerThis = this;
		let classes = colStyleGenerator(this.props);
		function colgenerator(item, index) {
			return (
				<TableRow key={index}>
					outerThis.props.renderCols(item, index, classes);
				</TableRow>
			);
		}
		let comps = this.state.pageData.map(colgenerator.bind(this));

		return (
			<>
			<div className="results-wrapper">
				<TableContainer component={Paper}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>{this.state.col1}</TableCell>
								<TableCell>{this.state.col2}</TableCell>
								<TableCell>{this.state.col3}</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>{comps}</TableBody>
					</Table>
				</TableContainer>
				<p>
					{i18n.__("Showing ")}
					{this.state.pageData.length} {i18n.__(" items")};
				</p>
			</div>
			
			 <Snackbar open={this.state.connectionFailedSnackbarOpen} autoHideDuration={settings.get("snackbarAutoHideDuration")} onClose={this.handleConnectionFailureSnackbarClose.bind(this)}>
			 <Alert onClose={this.handleConnectionFailureSnackbarClose.bind(this)} severity="error">
			   {i18n.__("Unable to establish connection to media provider")}
			 </Alert>
		   </Snackbar></>
		);
	}
}
class PlaylistView extends React.Component {
	constructor(props) {
		super();
		//super(props);
		this.state = { searchBoxValue: "" };
		//this.fetchSearch = this.fetchSearch.bind(this);
	}
	componentDidMount() {
		// Code to run when component is destoryed -> constructor
	}

	componentWillUnmount() {
		// Componoent dies -> deconstructor
	}
	fetchSearch(event) {
		//console.log(event);
		//console.log("Updating Search");
		let searchValue = event.target.value;
		//console.log("New search value "+searchValue);
		if (event.target.value) {
			this.setState(function (state, props) {
				return {
					searchBoxValue: searchValue,
				};
			});
		}
	}
	onItemClick(e) {
		console.log("Item Click", e, this);
	}
	render() {
		return (
			<>
				<TextField
					type="text"
					className="searchbox"
					onChange={this.fetchSearch.bind(this)}
					label={i18n.__("Type to search")}
					fullWidth={true}
				/>
				<ResultView
					type="playlists"
					query={this.state.searchBoxValue}
					onItemClick={this.onItemClick.bind(this)}
				></ResultView>
				<p>
					{i18n.__("Current querying ")} {settings.get("pageSize")}{" "}
					{i18n.__(" playlists matching the query ")}{" "}
					{this.state.searchBoxValue}
				</p>
				<div></div>
			</>
		);
	}
}
class SongView extends React.Component {
	constructor(props) {
		super();
		//super(props);
		this.state = { searchBoxValue: "" };
		//this.fetchSearch = this.fetchSearch.bind(this);
	}
	componentDidMount() {
		// Code to run when component is destoryed -> constructor
	}

	componentWillUnmount() {
		// Componoent dies -> deconstructor
	}
	fetchSearch(event) {
		//console.log(event);
		//console.log("Updating Search");
		let searchValue = event.target.value;
		//console.log("New search value "+searchValue);
		if (event.target.value) {
			this.setState(function (state, props) {
				return {
					searchBoxValue: searchValue,
				};
			});
		}
	}
	createSongNameCol(item,classes){
		return <TableCell>
			<img src={item.AlbumPicture} className={classes.previewImage}></img>
		</TableCell>;
	}
	renderCols(item, index, classes){
		let colGenerators = [this.createSongNameCol.bind(this)]; // TODO: Not hardcode this here
		return colGenerators[index](item,classes); // Execute column generator function with the index
	}

	render() {
		return (
			<>
				<TextField
					type="text"
					className="searchbox"
					onChange={this.fetchSearch.bind(this)}
					label={i18n.__("Type to search")}
					fullWidth={true}
					renderCols={this.renderCols.bind(this)}
				/>
				<ResultView type="songs" query={this.state.searchBoxValue}></ResultView>
				<p>
					{i18n.__("Current querying ")} {settings.get("pageSize")}{" "}
					{i18n.__(" songs matching the query ")} {this.state.searchBoxValue}
				</p>
				<div></div>
			</>
		);
	}
}
// Home View
// TODO: Populate with intresting things
class HomeComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	componentDidMount() {
		// Code to run when component is destoryed -> constructor
	}

	componentWillUnmount() {
		// Componoent dies -> deconstructor
	}
	stateChange() {
		this.setState(function (state, props) {
			return {};
		});
	}
	render() {
		return (
			<>
				<Typography variant="h3">
					{i18n.__("Hello! This is the default homescreen for now. ")}
				</Typography>
			</>
		);
	}
}
// Drawer
class MainDrawerComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	triggerView(viewName) {
		return ((event) => this.props.setCurView(viewName)).bind(this);
	}
	render() {
		return (
			<div onClick={this.props.drawerToggle}>
				<List>
					<ListItem>
						<Typography variant="h3">{i18n.__("App Name")}</Typography>
					</ListItem>
					<ListItem button onClick={this.triggerView("homeview")}>
						<ListItemIcon>
							<HomeRoundedIcon />
						</ListItemIcon>
						<ListItemText primary={"Home"}></ListItemText>
					</ListItem>
					<Divider />
					<ListItem button onClick={this.triggerView("songs")}>
						<ListItemIcon>
							<MusicNoteIcon />
						</ListItemIcon>
						<ListItemText primary={i18n.__("Songs")}></ListItemText>
					</ListItem>
				</List>
			</div>
		);
	}
}

// Legacy Views System

let views = {};
views.playlists = <PlaylistView />;
views.songs = <SongView />;
views.homeview = <HomeComponent />;
window.debug = {};
window.debug.views = views;

// Main Comp
function MainComponent() {
	// Theme Logic
	const useDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

	const theme = React.useMemo(
		() =>
			createMuiTheme({
				palette: {
					type: useDarkMode ? "dark" : "light",
				},
			}),
		[useDarkMode]
	);

	// Handle Menu Logic
	let [serversAnchorEl, setServersAnchorEl] = React.useState(null);
	let [drawerOpen, setDrawerOpen] = React.useState(false);
	function toggleDrawer(event) {
		setDrawerOpen(!drawerOpen);
	}
	function handleMenu(event) {
		console.log(this);
		setServersAnchorEl(event.target);
	}
	function handleClose(event) {
		console.log(this);
		setServersAnchorEl(null);
	}

	//let [open] = React.useState(true);
	// Current View
	let [curView, setCurView] = React.useState("homeview");
	const serversOpen = Boolean(serversAnchorEl);
	const stylesSet = makeStyles((theme) => ({
		root: {
			flexGrow: 1,
		},
		title: {
			flexGrow: 1,
		},
		menuButton: {
			marginRight: theme.spacing(2),
		},
	}));
	const classes = stylesSet();
	return (
		<>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<div className={classes.root}>
					<Drawer anchor="left" open={drawerOpen} onClick={toggleDrawer}>
						<MainDrawerComponent
							drawerToggle={toggleDrawer}
							setCurView={setCurView}
						></MainDrawerComponent>
					</Drawer>
					<AppBar position="static">
						<Toolbar>
							<IconButton
								edge="start"
								className={classes.menuButton}
								color="inherit"
								aria-label="menu"
								onClick={toggleDrawer}
							>
								<MenuIcon />
							</IconButton>
							<Typography variant="h6" className={classes.title}>
								{i18n.__("App Name")}
							</Typography>
							<div>
								<IconButton
									color="inherit"
									aria-label="Switch Media Server"
									aria-controls="menu-appbar"
									aria-haspopup="true"
									onClick={handleMenu}
								>
									<StorageIcon />
								</IconButton>
								<Menu
									id="menu-appbar"
									anchorEl={serversAnchorEl}
									anchorOrigin={{ vertical: "top", horizontal: "right" }}
									keepMounted
									transformOrigin={{ vertical: "top", horizontal: "right" }}
									onClose={handleClose}
									open={serversOpen}
								>
									<MenuItem onClick={setServer}>Local</MenuItem>
									<MenuItem onClick={setServer}>Add new server</MenuItem>
								</Menu>
							</div>
						</Toolbar>
					</AppBar>
					<Container maxWidth="md">{views[curView]}</Container>

					<PlayerComponent />
				</div>
			</ThemeProvider>
		</>
	);
}
// Bootstrap code
// really odd part i'm learning

function setServer(comp) {}

$(function () {
	// TODO: Replace with Vanilla JS to make script size smaller

	ReactDOM.render(<MainComponent />, document.getElementById("root"));
});

console.log("Player Comp", PlayerComponent);
