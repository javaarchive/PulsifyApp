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
import SettingsIcon from "@material-ui/icons/Settings";

// Ui Widgets

import Paper from "@material-ui/core/Paper";
import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
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
import Snackbar from "@material-ui/core/Snackbar";
import ButtonBase from "@material-ui/core/ButtonBase";
import TouchRipple from "@material-ui/core/ButtonBase/TouchRipple";
import MuiAlert from "@material-ui/lab/Alert";
import Popover from "@material-ui/core/Popover";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
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
import Select from "@material-ui/core/Select";

// Utilities
import clsx from "clsx";
const { is } = require("electron-util");
const {ipcRenderer} = require("electron");
const EventEmitter = require("events");

// Reusable Player Componoent
import { PlayerComponent } from "./player";

const Store = require("electron-store");
// Settings Loading
if (!Store) {
	console.warn("NO STORE found");
}
import prefdefaults from "./prefdefaults.json";
const settings = new Store({
	defaults: prefdefaults,
});
// Constants
const songViewHeaders = ["Song Name", "Artist", "Duration"];

//import {$} from "jquery";
const $ = require("jquery");
const regeneratorRuntime = require("regenerator-runtime");
console.log("bundle :D");
import { localizedFuncs } from "./utils.js";
import { TextFieldsOutlined } from "@material-ui/icons";

// Constants

const documentID = Math.floor(Math.random() * 100000).toString();
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
function placeholder(item, key) {
	return <Skeleton animation="wave" key={key} />;
}
class ResultView extends React.PureComponent {
	constructor(props) {
		super(props); // Deprecated but needed anyway
		this.state = {
			pageIndex: 0,
			type: props.type,
			pageData: [],
			connectionFailedSnackbarOpen: false,
			columns: 3,
		};
		if (props.columns) {
			this.state.columns = props.columns;
		}
		if (props.columnHeaders) {
			this.state.colHeaders = props.columnHeaders.map((unlocalizedName) =>
				i18n.__(unlocalizedName)
			);
		} else {
			this.state.colHeaders = new Array(this.state.columns).map((something) =>
				i18n.__("Unknown Header")
			);
		}
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
	hideConnectionFailureSnackbar() {
		this.setState(function (state, props) {
			return {
				connectionFailedSnackbarOpen: false,
			};
		});
	}
	showConnectionFailureSnackbar() {
		this.setState(function (state, props) {
			return {
				connectionFailedSnackbarOpen: true,
			};
		});
	}
	handleConnectionFailureSnackbarClose(event, reason) {
		if (reason == "clickaway") {
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
			console.log("Connection failed: showing connection failure snackbar", ex);
			this.showConnectionFailureSnackbar();
			return;
		}
	}
	onRowClickActivator(index) {
		this.props.onRowClick(this.state.pageData[index], index);
	}
	render() {
		let outerThis = this;
		function colgenerator(item, index) {
			let cols = [];
			for (let i = 0; i < this.state.columns; i++) {
				let elem = (
					<TableCell align="left" key={i}>
						{outerThis.props.renderCols(item, i)}
					</TableCell>
				);
				cols.push(elem);
			}
			return (
				<TableRow
					key={index}
					onClick={this.onRowClickActivator.bind(this, index)}
				>
					{cols}
				</TableRow>
			);
		}
		let comps = this.state.pageData.map(colgenerator.bind(this));
		let tableHead = [];
		for (let i = 0; i < this.state.columns; i++) {
			tableHead.push(
				<TableCell key={i} align="left">
					{this.state.colHeaders[i]}
				</TableCell>
			);
		}
		return (
			<>
				<div className="results-wrapper">
					<TableContainer component={Paper}>
						<Table>
							<TableHead>
								<TableRow>{tableHead}</TableRow>
							</TableHead>
							<TableBody>{comps}</TableBody>
						</Table>
					</TableContainer>
					<p>
						{i18n.__("Showing ")}
						{this.state.pageData.length} {i18n.__(" items")};
					</p>
				</div>

				<Snackbar
					open={this.state.connectionFailedSnackbarOpen}
					autoHideDuration={settings.get("snackbarAutoHideDuration")}
					onClose={this.handleConnectionFailureSnackbarClose.bind(this)}
				>
					<Alert
						onClose={this.handleConnectionFailureSnackbarClose.bind(this)}
						severity="error"
					>
						{i18n.__("Unable to establish connection to media provider")}
					</Alert>
				</Snackbar>
			</>
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
	createSongNameCol(item, key) {
		// TODO: NOT USE INLINE STYLES
		return (
			<div key={key}>
				<IconButton>
					<MusicNoteIcon />
				</IconButton>
				{item.name}
			</div>
		);
	}
	createSongArtistCol(item, key) {
		return <div>{item.artist}</div>;
	}
	createDurationCol(item, key) {
		return (
			<div>
				{localizedFuncs[i18n.getLocale()].formatDuration(item.duration)}
			</div>
		);
	}
	renderCols(item, index, classes) {
		let colGenerators = [
			this.createSongNameCol.bind(this),
			this.createSongArtistCol.bind(this),
			this.createDurationCol.bind(this),
		]; // TODO: Not hardcode this here
		return colGenerators[index](item, index); // Execute column generator function with the index
	}
	handleRowClick(rowData, index) {
		console.log(rowData);
		this.props.controller.emit("queueSong", rowData);
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
					type="songs"
					query={this.state.searchBoxValue}
					renderCols={this.renderCols.bind(this)}
					columnHeaders={songViewHeaders}
					onRowClick={this.handleRowClick.bind(this)}
				></ResultView>
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

// Settings
const settingsStyles = makeStyles((theme) => ({
	popover: {
		pointerEvents: "none",
	},
	paper: {
		padding: theme.spacing(1),
	},
	buttonrow: {
		"& > *": {
			margin: theme.spacing(1),
		},
	},
	settingsGrid: {
		padding: theme.spacing(2),
	},
}));

function SettingsView() {
	const classes = settingsStyles();

	let [curDisplayConfig, setDisplayConfig] = React.useState(() => {
		let copyOfSettings = {};
		for (let settingsPair of settings) {
			copyOfSettings[settingsPair[0]] = settingsPair[1];
		}
		return copyOfSettings;
	});
	let [applying, setApplying] = React.useState(false);
	let [internalServerOnline, setInternalServerOnline] = React.useState(false);
	let [applyFinishSnackbarOpen, setApplyFinishedSnackbarOpen] = React.useState(
		false
	);
	function showApplyFinishSnackbar(ev) {
		setApplyFinishedSnackbarOpen(true);
	}
	function hideApplyFinishSnackbar(ev) {
		setApplyFinishedSnackbarOpen(false);
	}
	function saveConfig(ev) {
		setApplying(true);
		console.log("Saving Configuration from display");
		let keys = Object.keys(curDisplayConfig);
		for (let i = 0; i < keys.length; i++) {
			let key = keys[i];
			if (settings.has(key)) {
				if (settings.get(key) != curDisplayConfig[key]) {
					settings.set(key, curDisplayConfig[key]); // Update!
				}
			}
		}
		setTimeout(() => {
			setApplying(false);
			setApplyFinishedSnackbarOpen(true);
		}, 200); // Allow brief animation
	}
	// A joke
	const [jokeAnchorEl, setJokeAnchorEl] = React.useState(null);
	const handleJokePopoverOpen = (event) => {
		setJokeAnchorEl(event.currentTarget);
	};
	const handleJokePopoverClose = () => {
		setJokeAnchorEl(null);
	};
	const jokePopoverOpen = Boolean(jokeAnchorEl);
	function toggleTelemetryJokeSwitch(ev) {
		newConfig["telemetryJoke"] = ev.target.checked;
		updateDisplayConfig();
	}
	// Render!!!
	let newConfig = {};
	function updateDisplayConfig() {
		setDisplayConfig({ ...curDisplayConfig, ...newConfig });
	}
	function createSwitchFunction(toggleKey) {
		let outputFunc = (ev) => {
			newConfig[toggleKey] = ev.target.checked;
			updateDisplayConfig();
		};
		return outputFunc;
	}
	function updateSnackbarHideDuration(ev) {
		let newDuration = ev.target.value * 1000; // back to ms
		newConfig["snackbarAutoHideDuration"] = newDuration;
		updateDisplayConfig();
	}

	function handleThemeChange(ev){
		newConfig["useDarkMode"] = ev.target.value;
		updateDisplayConfig();
	}
	// Internal Server
	function updateInternalServerState(ev,data){
		console.log("Internal Server State Update recieved");
		setInternalServerOnline(data.online);
	}
	React.useEffect(() => {
		ipcRenderer.on("internalServerUpdates",updateInternalServerState);
		return () => {
			ipcRenderer.removeListener("internalServerUpdates",updateInternalServerState);
		};
	});
	function startInternalServer(){
		ipcRenderer.send("internalServer","start");
	}

	function stopInternalServer(){
		ipcRenderer.send("internalServer","stop");
	}
	// Temporary stuffz
	const optionSpacing = 3; // Config option?
	const explainationXS = 11;
	const optionFormXS = 1;
	return (
		<div className="settings">
			<Backdrop className={classes.backdrop} open={applying}>
				<CircularProgress color="inherit" />
			</Backdrop>
			<Typography variant="h3">{i18n.__("Telemetry")}</Typography>
			<Popover
				className={classes.popover}
				classes={{
					paper: classes.paper,
				}}
				open={jokePopoverOpen}
				anchorEl={jokeAnchorEl}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "left",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "left",
				}}
				disableRestoreFocus
			>
				{i18n.__("This is a joke")}
			</Popover>
			<Grid container spacing={optionSpacing}>
				<Grid item xs={explainationXS}>
					<Typography variant="body1">
						{i18n.__("Enable complete data collection:")}
					</Typography>
				</Grid>

				<Grid item xs={optionFormXS}>
					<Switch
						checked={curDisplayConfig["telemetryJoke"]}
						onChange={toggleTelemetryJokeSwitch}
						onMouseEnter={handleJokePopoverOpen}
						onMouseLeave={handleJokePopoverClose}
					></Switch>
				</Grid>
			</Grid>
			<Typography variant="h3">{i18n.__("User Interface")}</Typography>
			<Grid container spacing={optionSpacing}>
				<Grid item xs={explainationXS}>
					<Typography variant="body1">
						Snackbar Auto Hide Duration in seconds
					</Typography>
				</Grid>
				<Grid item xs={optionFormXS}>
					<TextField
						type="number"
						variant="standard"
						defaultValue={curDisplayConfig["snackbarAutoHideDuration"] / 1000}
						onChange={updateSnackbarHideDuration}
					></TextField>
				</Grid>
				<Grid item xs={explainationXS}>
					<Typography variant="body1">Theme</Typography>
				</Grid>
				<Grid item xs={optionFormXS}>
					<Select
						onChange={handleThemeChange}
						value={curDisplayConfig["useDarkMode"]}
					>
						<MenuItem value={false}>Light</MenuItem>
						<MenuItem value={true}>Dark</MenuItem>
						<MenuItem value={"system"}>System Theme</MenuItem>
					</Select>
				</Grid>
			</Grid>
			<Typography variant="h3">{i18n.__("Ad Blocking")}</Typography>

			<Typography variant="h3">{i18n.__("Internal Server")}</Typography>
			<div className={classes.buttonrow}>
				<Button variant="contained" color="primary" onClick={startInternalServer} disabled={internalServerOnline}>
					{i18n.__("Start Internal Server")}
				</Button>

				<Button variant="contained" color="primary" onClick={stopInternalServer} disabled={!internalServerOnline}>
					{i18n.__("Stop Internal Server")}
				</Button>

				<Button variant="contained" color="secondary" onClick={() => ipcRenderer.send("internalServer","getUpdate")}>
					{i18n.__("Force Internal Server Ui Update")}
				</Button>
			</div>
			<Typography variant="h3">{i18n.__("Save Settings")}</Typography>
			<Typography variant="body1">
				{i18n.__(
					"Some settings require you to restart Pulsify entirely as they are queried only during the startup. "
				)}
			</Typography>
			<div className={classes.buttonrow}>
				<Button variant="contained" color="primary" onClick={saveConfig}>
					{i18n.__("Save")}
				</Button>
				<Button
					variant="contained"
					color="secondary"
					onClick={(ev) => {
						window.location.reload();
					}}
				>
					{i18n.__("Reload")}
				</Button>
				<Snackbar
					open={applyFinishSnackbarOpen}
					autoHideDuration={settings.get("snackbarAutoHideDuration")}
					onClose={hideApplyFinishSnackbar}
				>
					<Alert onClose={hideApplyFinishSnackbar} severity="success">
						{i18n.__("Settings have been saved succesfully")}
					</Alert>
				</Snackbar>
			</div>
			
		</div>
	);
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
					<ListItem button onClick={this.triggerView("settings")}>
						<ListItemIcon>
							<SettingsIcon />
						</ListItemIcon>
						<ListItemText primary={i18n.__("Settings")}></ListItemText>
					</ListItem>
				</List>
			</div>
		);
	}
}

// Main Comp
function MainComponent() {
	// Theme Logic
	let useDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
	if (settings.get("useDarkMode") != "system") {
		useDarkMode = settings.get("useDarkMode");
	}
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
	const [controller, changeController] = React.useState(new EventEmitter());

	// Legacy Views System
	let views = {};
	views.playlists = <PlaylistView />;
	views.songs = <SongView controller={controller} />;
	views.homeview = <HomeComponent />;
	views.settings = <SettingsView></SettingsView>;
	window.debug = {};
	window.debug.views = views;
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

					<PlayerComponent settings={settings} controller={controller} />
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
	if (settings.get("customWindowbar")) {
		const customTitlebar = require("custom-electron-titlebar");

		new customTitlebar.Titlebar({
			backgroundColor: customTitlebar.Color.fromHex("#444"),
		});
		if (is.development) {
			$("#menufix").remove();
			$('.hide-for-dev').remove();
		} else {
			$('.hide-for-prod').remove();
			$("div[role=menubar]").remove();
		}
	}
	ReactDOM.render(<MainComponent />, document.getElementById("root"));
});

console.log("Player Comp", PlayerComponent);
