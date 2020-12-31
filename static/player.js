import React from "react";
import ReactDOM from "react-dom";
// Fonts (broken currently)
// import "fontsource-roboto";
// Styles

import styles from "./player.module.css";
// Text Stuff
import Typography from "@material-ui/core/Typography";
// Grid Utils
import Grid from "@material-ui/core/Grid";
// Widgets
import Slider from "@material-ui/core/Slider";
// Get localized functions
import { localizedFuncs } from "./utils.js";

// React Player to be imported
// Meant to be reusable in other contexts
const hasArtist = ["Song"];
const hasMultipleArtists = ["Album"]; // Playlists are usually user created so they will have a variety of artists
if (!i18n) {
	try {
		var i18n = require("i18n");
	} catch (ex) {
		var i18n = null; // Allow custom instances to be added later.
	}
} // Might already be init
class PlayerComponent extends React.Component {
	constructor(props) {
		super(props); // Deprecated but needed
		let preparedState = {
			itemName: i18n.__("Nothing Playing"),
			position: 0,
			itemLength: 0,
			length: 1200,
			enabled: false,
			userDragging: false, // Do not update while user is dragging
		};
		if (props.name) {
			preparedState["name"] = props.name;
			preparedState["enabled"] = true;
		}
		this.state = preparedState;
	}
	componentDidMount() {
		// Code to run when component is destoryed -> constructor
	}

	componentWillUnmount() {
		// Componoent dies -> deconstructor
	}
	updateItem(type, params) {
		let properties = {};

		if ("name" in params) {
			properties.itemName = params.name;
		}
		if (hasArtist.includes(type)) {
			if ("artist" in params) {
				properties.itemMadeBy = params.artist;
			}
		}
		if ("duration" in params) {
			properties.duration = params.duration;
		} else {
			properties.duration = null; // Not provided
		}

		this.setState(function (state, props) {
			return properties;
		});
	}
	changePos(ev, newVal) {
		console.log("Position changed to", newVal);
		this.setState(function (state, props) {
			return { position: newVal };
		});
	}
	updateDuration(time) {
		// Sometimes duration can be found afterwards
		this.setState(function (state, props) {
			return { itemDuration: time };
		});
	}
	// User Drag Handlers
	// TODO: Account for multi touch displays???
	userDragStart(ev){
		this.setState(function (state, props) {
			return { userDragging: true};
		});
	}
	userDragEnd(ev){
		this.setState(function (state, props) {
			return { userDragging: false };
		});
	}
	// ! Main Rendering Code
	render() {
		return (
			<>
				<div className="player">
					<Grid container spacing={2}>
						<Grid item xs={2}>
							
							<Typography variant="caption">{this.state.enabled
								? (localizedFuncs[i18n.getLocale()].formatDuration(
										this.state.position
								  ))
								: i18n.__("Idle Duration")}</Typography>
							
						</Grid>
						<Grid item xs={8}>
							<div className="playback-progress" onPointerDown={this.userDragStart.bind(this)} onPointerUp={this.userDragEnd.bind(this)}>
								<Slider
									value={this.state.position}
									onChange={this.changePos.bind(this)}
									aria-labelledby="continuous-slider"
									min={0}
									max={this.state.length}
									disabled={!this.state.enabled}
								/>
							</div>
						</Grid>
						<Grid item xs={2}>
							<Typography variant="caption">{this.state.enabled
								? ("-" + localizedFuncs[i18n.getLocale()].formatDuration(
										this.state.itemLength - this.state.position
								  ))
								: i18n.__("Idle Duration")}</Typography>
							
						</Grid>
					</Grid>
					<span className={styles.playerTitle}>
						<Typography variant="h5">{this.state.itemName}</Typography>
					</span>
					<span className={styles.playerItemMadeBy}>
						<Typography variant="h6">{this.state.itemMadeBy}</Typography>
					</span>
				</div>
			</>
		);
	}
}
console.log("Imported styles", styles);
export { PlayerComponent };