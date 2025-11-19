
// text(text, x, y)
text("Book's have words", 10, 20)
//                            ^   ^
//                            |   |
//  pixels ------------------------


// PPI -> Pixels Per Inch
// UNITS
let inch = (v) => v * ppi
let em = (v) => inch(v) / 6
let pica = (v) => em(v)
let point = (v) => pica(v) / 12


text("Book's have words", inch(1 / 2), inch(1 / 4))
//                              ^          ^
//                              |          |
//  half inch -------------------          |
//                                         | 
//  quarter inch ---------------------------



//  Letter size page: 8.5 x 11 inches
createCanvas(inch(11), inch(8.5))


let grid = ({
	width,
	height,
	columnCount,
	hanglineCount,
	margins,
}) => ({
	// recto -> width / 2 + margins... etc
	recto         /* x position */,
	verso         /* x position */,
	rectoColumns  /* x positions */,
	versoColumns  /* x positions */,
	hanglines     /* y positions */,
})


let Grid = grid({
	width: inch(10),
	height: inch(8),
	...others
})

text("some other text",
	Grid.recto + inch(1),
	inch(.5))

//or
text("some other text",
	Grid.rectoColumns(2),
	inch(.5))


let spread = [
	['text',

		['text',
			"there's a circle on the spread!"],

		['x', ['rectoColumn', 2]],
		['y', ['inch', 1]]
	],

	['circle',
		['radius', ['inch', .5]]
		['x', ['rectoColumn', 2]],
		['y', ['inch', 1]]
	],
]




let drawSpread = (contents, grid) => {
	// clears screen
	// loops over content and draws each of them
}






let drawBook = (spreads, pg) =>
	drawSpread(spreads[pg])



let versoImage = spread => {
  // draw spread to a buffer
  // clip out the verso region using grid
  // return image
}

let rectoImage = spread => {/*same stuff*/}

let drawPair = (
	spreads,
	[rectoPage, versoPage]
) => {
  // get the recto and verso images using spreads
  let recto = rectoImage(spreads[rectoPage])
  let verso = versoImage(spreads[versoPage])

  // draw them on current canvas
  img(verso, 0, 0)
  img(recto, grid.recto, 0)
}
