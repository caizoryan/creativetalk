import { reactive, memo } from './hok.js'
import { dom } from './dom.js'

let globalhistory = () => {
	let undo = []
	let undobuffer = []
	let redo = []
	let doundo = () => {
		if (undo.length == 0) return undefined
		let re = undo.pop()()
		redo.push(re)
	}

	let doredo = () => {
		if (redo.length == 0) return undefined
		let un = redo.pop()()
		undo.push(un)
	}

	let raffer = () => {
		if (undobuffer.length == 1) undo.push(undobuffer.pop())
		else if (undobuffer.length > 1) {
			let undos = undobuffer.reduce((acc, e) => (acc.push(e), acc), [])
			// a fn that will do all fns, collect and return a <-
			let group_dos = dos => () => {
				let redos = dos.map(e => e())
				return group_dos(redos)
			}

			undo.push(group_dos(undos))
			undobuffer = []
		}
		requestAnimationFrame(raffer)
	}

	requestAnimationFrame(raffer)

	return {
		canUndo: () => (undo.length > 0),
		canRedo: () => (redo.length > 0),
		listUndo: () => undo,
		listRedo: () => undo,
		undo: doundo,
		redo: doredo,
		make: (reactive) => {
			return {
				isReactive: true,
				value: reactive.value,
				subscribe: reactive.subscribe,
				next: (v) => {
					undobuffer.push(createundo(reactive))
					redo = []
					reactive.next(v)
				},
				undo: doundo,
				redo: doredo,
			}
		}
	}
}
let createundo = (reactive) => {
	let v = reactive.value();
	return () => {
		let u = createundo(reactive);
		reactive.next(v)
		return u
	}
}
let history = globalhistory()

// ------- ------- -------
// DISPLAY
// ------- ------- -------

let widthify = (v) => memo(() => 'width: ' + v.value(), [v])

let ccwidth = history.make(reactive('40vw'))
let cdwidth = history.make(reactive('50vw'))
let dcwidth = history.make(reactive('40vw'))
let ddwidth = history.make(reactive('50vw'))

let ccdisplay = history.make(reactive(['div']))
let cddisplay = history.make(reactive(['div']))
let dcdisplay = history.make(reactive(['div']))
let dddisplay = history.make(reactive(['div']))

let normal_coding = () => { cdwidth.next('50vw'); ccwidth.next('40vw'); }
let normal_design = () => { ddwidth.next('50vw'); dcwidth.next('40vw'); }
let normal_layout = () => { normal_design(); normal_coding() }

let squeeze_coding = () => { cdwidth.next('23vw'); ccwidth.next('15vw'); }
let squeeze_design = () => { dcwidth.next('15vw'); ddwidth.next('23vw') }

let focus_coding = () => {
	cdwidth.next('75vw');
	ccwidth.next('40vw');
	squeeze_design()
}

let focus_design = () => {
	ddwidth.next('75vw');
	dcwidth.next('40vw');
	squeeze_coding()
}

let codingcaption = dom(['.box#coding-caption', { style: widthify(ccwidth) }, ccdisplay])
let codingdispaly = dom(['.box#coding-display', { style: widthify(cdwidth) }, cddisplay])

let designcaption = dom(['.box#design-caption', { style: widthify(dcwidth) }, dcdisplay])
let designdispaly = dom(['.box#design-display', { style: widthify(ddwidth) }, dddisplay])


let interval

let slidenumber = reactive(-1)
let seconds = reactive(0)
slidenumber.subscribe(e => {
	if (slidenumber.value() == 0){
		if (interval) clearInterval(interval)
		seconds.next(0)
		interval=setInterval(() => {seconds.next(e => e+.5)}, 500)
	}
})
let time = memo(()=> {
	const minutes = Math.floor(seconds.value() / 60);
	const second = seconds.value() - minutes * 60;

	return minutes + ':' + second

}, [seconds])
let minusc = e => e == 0 ? e : e-1
let nextslide = () => {
	let old = slidenumber.value()
	slidenumber.next(e => e == slides.length-1 ? e : e+1)

	if (old != slidenumber.value()) doo(slides[slidenumber.value()])
}
let prevslide = () => {
	slidenumber.next(minusc)
	history.undo()
	// doo(slides[slidenumber.value()])
}

let doo = (cmds) => cmds.forEach(e => e()) 
let btn = (t, fn) => dom(['button', t, { onclick: fn }])
let buttons = dom([
	'.controller.box',
	btn('next', nextslide),
	btn(slidenumber, () => console.log(slidenumber.value())  ),
	btn('prev', prevslide),
	btn(time, () => {})
])

let root = [".root", codingcaption, codingdispaly, designdispaly, designcaption, buttons]


let display= {
	cc: (el) => () => ccdisplay.next(el),
	cd: (el) => () => cddisplay.next(el),
	dd: (el) => () => dddisplay.next(el),
	dc: (el) => () => dcdisplay.next(el),
	clear : () => {
		display.cd(empty)()
		display.dd(empty)()
		display.cc(empty)()
		display.dc(empty)()
	}
}

let empty = ['div']
let h1 = t => ['h1', t]
let flash = t => ['h1.flash', t]
let h2 = t => ['h2', t]
let h3 = t => ['h3', t]
let h4 = t => ['h4', t]
let video = t => ['video', {src: t, muted: true, autoplay: true, loop: true }]
let videof = t => ['video', {src: "./images/" +t+".mp4", muted: true, autoplay: true, loop: true }]
let img = t => ['img', {src: t}]
let imgf = t => ['img', {src:"./images/" +t+".png"}]
let imgfj = t => ['img', {src:"./images/" +t+".jpeg"}]
let giff = t => ['img', {src:"./images/" +t+".gif"}]
let light = t => ['span.light', t]

let intro = [
	[display.cd(flash("HELLO WORLD"))],
	[display.cd(flash("aaryan"))],
	[display.dd(h2("I'm a graphic design student"))],
	[display.cd(h1("And a self-taught programmer" ))],
	[
		// add gifs of the tool
		display.cd(empty),
		display.dd(empty),

		display.cc(h1('Publication Tool')),
		display.dc(h1('Publication Tool'))
	],

	[
		display.dd(h1("PARTS")),
		display.cd(imgf("parts"))
	],
	[display.dd(['div', h1("PARTS &"), h1("PROCESS"),]),
	display.cd(imgf("slides"))
	],

	[display.clear],
	[focus_design, display.dc(h2('The tool...'))],

	[display.dd(['div', ['p',"isn't really a ", ['s', 'concrete'], " thing" ]])],
	[focus_coding],
	[display.cd(['div', ['p', "but rather several mutations of the same codebase"]])],

	[normal_layout, display.clear],

	[display.cc(h4("The thing that"))],
	[display.dc(h4("Binds them all together is"))],
	[display.cd(h1("A shared"))],
	[display.dd(h1("Vocabulary"))],

	[display.clear],
	[display.dd(h1("Which is a Typographic Vocabulary"))],
	[display.cd(h1("Written down as code"))],
	[display.dd(
		['div', 
		 h1("Which is a Typographic Vocabulary"),
		 ['p',"*Typography is to do with the technique of arranging type",
			light(" (letters, words, sentences and symbols) ") ,"in order to",
			light(" (usually but not limited) "),
			"to shape page layouts and design books"]
		])],
]

let build = (items, fn /*(total)*/) => items.reduce((acc, item) => {
			acc.total.push(item)
			acc.slides.push(fn(acc.total))
			return acc
		}, {
			total: [],
			slides:[],
		}).slides

let demo = [
	[display.clear, focus_coding],
// So before I dive into the process and the parts of the tool, let me give you a quick demo. 
	[display.cd(flash("THE TOOL"))],
	[display.cc(h1("THE TOOL"))],

	...build(['0', '01','1', '2', '3', '4',],
					 (total) => [
						 display.cd(videof('tool/' + total[total.length-1])),
					 ]),

	...build(['1', '2', '3', '4', '5', '6', '7', '8'],
					 (total) => [
						 display.cd(imgf('tool/out' + total[total.length-1])),
					 ])
]


let process = [
	[display.clear],
	[display.cd(flash('Bits and Pieces'))],
	[normal_layout],
	[display.cd(h1("A shared"))],
	[display.dd(h1("Vocabulary"))],
	[display.cd(h2("Typographic")), display.dd(h2("Vocabulary"))],

	[display.clear, focus_coding],
	[display.dc(h2("Words"))],
	...build(['Page', 'Spread', 'Grid', 'Signature', 'Sheets', 'Points', 'Picas',],
					 (total) => [display.dd(['div', ...total.map(e => ['p', e])])]),


	[display.cc(h2("Programming as -> {TOol}"))],

	...build(['page', 'spread', 'grid', 'signature', 'sheets', 'points', 'picas',], (total) =>
		[display.cd(['div', ...total.map(e => ['p.mono', light('function '), e,light("() {...}")])])]),

	[display.clear, focus_coding],
	[display.cc(h1("First intentions")),
	 // TODO: add indesign video display.cd(video("First intentions"))
	],

	[display.cd(imgf('indesign'))],		

	[display.clear, focus_design],
	[display.dc(h1("words..."))],

	...build(['Page', 'Spread', 'Recto', 'Verso', 'Grid', 'Signature', 'Sheets'], 
					 total => [display.dd(['div', ...total.map(e => ['p', e])])]),

	[display.dc(h4("bits and pieces that"))],
	[display.dc(h2("constitute a BOOK"))],

	[focus_coding],
	[display.cc(h1("OK"))],
	[display.cc(h1("WORDS"))],

	...build([
			h4("Break down this vocabulary"),
			h4("|"),
			h4("|"),
			h4("v"),
			h2("how to constitute in a programming context")],
					 total => [display.cd(['div', ...total])]),
	
	[display.cd(h1("USE WORDS to reconstitute P5 CANVAS as a BOOK"))],
]

let text = [
	[display.clear],
	[display.cc(h4("Whats the first thing we need?"))],
	[display.cc(h1("text"))],
	[display.cd(imgf("text"))],
	[display.cd(imgf("first_text"))],
	[display.dc(h2("EASY"))],
]
let units = [
	[display.dc(h4("...wait a min"))],
	[
		display.cd(imgf("text_pixels")),
		display.dc(h4("these are pixels")),
	],
	[
		focus_design,
		display.dc(h4("but I want units of a physical page"))
	],
	...build([
		h2("Ems"),
		h2("Picas"),
		h2("Inches"),
		h2("Points"),
	], total => [display.dd(['div', ...total])]),

	[focus_coding],
	[
	 display.cc(h4("so back to the drawing board")),
	 display.dc(h4("Physical Units"))
	],

	[
		display.cc(h4("cook up some units")),
		display.cd(imgf('units'))
	],

	[display.cc(h4("And then I can"))],
	[display.cd(imgf("text_units"))],

	[display.cc(h4("And create a sheet"))],
	[display.cd(imgf("letter_page"))],

	[display.cd(imgf("text_on_page"))],


	[display.cc(h4("And see this text on the sheet"))],

	[normal_layout, display.cc(empty)],
	[
		display.cd(imgf("text_on_page")),
		display.dd(imgf("text_on_printed")),
		display.dc(h4("PRINT"))
	],
	[display.dc(h3("Units give this p5 canvas the validity of a letter size sheet"))],


]

let spread = [
	[display.dc(h3("So we have a sheet!"))],
	[display.dc(h3("But we're making books...")),
		display.cd(empty),
		display.dd(empty)
	],

	[display.dc(h3("So we dont really want a 'sheet'"))],
	[display.dc(h3("we want a..."))],
	[display.dc(h3("SPREAD")), focus_design],
	[display.dc(h3("What's a SPREAD?")),],
	[
		display.dc(h3("When we look at an open book")),
		display.dd(giff('open_book')),
	],

	[
		display.dc(h3("We're looking at two separate pages")),
		display.dd(giff('two_pages')),
	],

	[
		display.dc(h3("SPREAD -> The surface they make up together")),
		display.dd(giff('spread')),
	],

	[
		display.dc(h3("recto -> right page, verso the other one")),
		display.dd(giff('recto_verso')),
	],

]

let grid = [
	[focus_coding],
	[display.cc(h4('Constitute canvas as two pages'))],
	[display.cc(h4('Verso and Recto'))],
	[display.cc(h4('Validate canvas as a Spread'))],

	[display.cd(h1('GRID'))],
	[display.cd(videof('grids'))],
	[display.cd(
		imgf('simple_grid')
	)],
	[display.cd(
		['div', 
		 imgf('simple_grid'),
		 h4('So the grid is a structure that helps us locate points on a page.')
		])],

	[display.cd(imgf('grid'))],
	[display.cd(imgf('grid_diagram'))],
	[display.cd(imgf('grid_use'))],
	[display.cc(h4('Validate canvas as a Spread ✅'))],
]

let sequencing = [
	[display.clear],
	[display.cc(h4('this one is easy'))],
	[display.cc(h4("So up until now we've been doing a single spread"))],
	[
		display.cc(h4("But a book has multiple")),
		display.cd(videof("multiple_spreads")),
	],

	[display.cc(h4("Store a spread as data")),],
	[display.cd(imgf("spread_drawable_item")),],
	[display.cd(['div',
							 imgf("spread_drawable_item"), (h4("Drawables use grid to find positions"))
							]),],

	[display.cd(imgf("spread_data")),],
	[display.cd(imgf("draw_spread")),],
	[display.cd(imgf("draw_book")),],
	[display.cd(imgf("spreads_example")),],
	[display.cd(videof("spread_sequence")),],

	[display.cc(h4("So we're done right?")),],
	[display.cc(h4("We can print this out and we're good?")),],
	[display.cc(h4("Right?")),],
]

let imposition = [
	[focus_design],
	[display.dc(h4("Except there's one critical thing."))],
	[display.dc(h4("What we percieve as spreads are separate physical sheets")),
	 display.dd(videof("spread_sheets")),
	 display.cd(videof("spread_sequence")),
	],
	[normal_layout],
	[display.cc(h3('reconcile!'))],
	[display.cc(h3('Design it in this format'))],
	...build(['1', '2', '3', '4', '5'],
					 (total) => [
						 display.cd(imgf('impose/digital/' + total[total.length-1])),
						 display.dd(img('./images/impose/physical/'
														+ total[total.length-1] + '.jpeg')),
					 ]),


	[display.cc(h3('Print it as reconfigured')),
	 display.dc(h3('For binding'))],
	...build(['1', '2', '3', '4'],
					 (total) => [
						 display.cd(imgf('impose/digital/s' + total[total.length-1])),
						 display.dd(imgf('impose/physical/s' + total[total.length-1]))
					 ]),
	[display.clear],
	[display.cc(h4('Ok so how do we figure out this configuration?'))],

	[
		display.dc(h4('This is the algorithm for it')),
		display.dd(videof('shuffle_sped_up'))
	],
	[
		display.cc(h4('This is also the algorithm for it')),
		display.cd(imgfj('sketchbook'))
	],

	[
		display.cc(h4("It's just a nuanced switcheroo")),
		display.cd(imgfj('switcheroo'))
	],

	[focus_coding],

	[display.cc(h4("Implementation")), display.cd(imgf('imposition'))],
	[display.cc(h4("Render Pairs")), display.cd(imgf('render_imposed'))],

]
let parts = [
	[focus_coding, display.clear],
	[display.cd(flash('THE PARTS'))],
	...text,
	...units,
	...spread,
	...grid,
	...sequencing,
	...imposition
]

let conclusions = [
	[normal_layout, display.clear],
	[display.cd(flash('THATS ABOUT')), display.dd(flash('ALL THE PARTS'))],
	[display.cc(h3('to think of the p5 canvas'))],
	[display.dc(h3('as a book'))],
	[display.cc(h3('and to print it out'))],
	[display.dc(h3('and make a book'))],

	[display.clear],
	[display.cd(flash('CLosing thoughts'))],
	[display.cc(h1('Play around with'))],
	[display.dc(h1('Term definitions'))],
	[
		display.cc(h2('Nested Books')),
		display.cd(videof('multi_book'))
	],
	[
		display.cc(h2('Continous Page Numbers')),
		display.cd(videof('page_numbers'))
	],

	[
		display.cc(h2('New words: Offsets')),
		display.cd(videof('offsets'))
	],

	[display.clear],
	[display.cd(flash('OK THATS IT'))],
	[display.dd(flash('THANKS'))],
	// [display.cc(imgf('indesign'))],		
]

let slides = [
	[],
	...intro,
	...demo,
	...process,
	...parts,
	...conclusions
]


document.onkeydown = e => {
	if (e.key == 'ArrowLeft') prevslide()
	if (e.key == 'ArrowRight') nextslide()
	if (e.key == 'd') {
		if (e.repeat) { return }
		document.body.appendChild(dom('.big.right-arrow', '☞'))
	}

	if(e.key == 's') {
		if (e.repeat) { return }
		document.body.appendChild(dom('.big.center-arrow', '⟷'))
	}

	if (e.key == 'a') {
		if (e.repeat) { return }
		document.body.appendChild(dom('.big.left-arrow', '☜'))
	}
}

document.onkeyup = e => {
	if (e.key == 'd') {document.querySelectorAll('.right-arrow').forEach(e => e.remove())}
	if (e.key == 's' )
	{document.querySelectorAll('.center-arrow').forEach(e => e.remove())}
	if (e.key == 'a') {document.querySelectorAll('.left-arrow').forEach(e => e.remove())}
}

let gotoslide = e => {
	if (e > slidenumber.value()) {
		for (let i = 0; i<e; i++) {
			setTimeout(() => nextslide(), 50*i)
		}
	}
}

document.body.appendChild(dom(root))

gotoslide(64)


