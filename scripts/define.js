/**
 * 
 */
 
var define = {
	"id": {
		id: "id",
		parent: "root",
		title: "Main Topic",
		pos: {
			x: 100,
			y: -100
		},
		children: ["onetwothree"],
		closed: false,
		style: {
			fontSize: 12,
			fontFamily: "Microsoft Yahei",
			fontStyle: "bold",
			decoration: "linethrow"
		}
	},
	"onetwothree": {
		id: "onetwothree",
		parent: "root",
		title: "Main Topic",
		pos: {
			x: 100,
			y: -100
		},
		children: [],
		closed: false,
		style: {
			fontSize: 12,
			fontFamily: "Microsoft Yahei",
			fontStyle: "bold",
			decoration: "linethrow"
		}
	}
};