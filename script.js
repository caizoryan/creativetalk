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

let slidenumber = reactive(-1)
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
let h2 = t => ['h2', t]
let h3 = t => ['h3', t]
let h4 = t => ['h4', t]
let video = t => ['video', {src: t, muted: true, autoplay: true, loop: true }]
let img = t => ['img', {src: t}]

let slides = [
	[],

	[display.dd(h2("I'm a graphic design student"))],
	[display.cd(h1("I also code" ))],
	[
		// add gifs of the tool
		display.cd(empty),
		display.dd(empty),

		display.cc(h1('Publication Tool')),
		display.dc(h1('Publication Tool'))
	],

	// [
	// 	focus_design,
	// 	display.dd(h2("I was seeking an alternative to Adobe (boooo)")),
	// ],
	// [
	// 	focus_coding,
	// 	display.cd(h2("What would it take to bootleg something like InDesign")),
	// ],
	// [normal_layout]

	[display.clear],
	[focus_design, display.dc(h2('Presentation Focus on'))],

	[display.dd(h3('What the tool does'))],
	[display.dd(h3(['s', 'What the tool does']))],
	[display.dd(['div', 
		 h3(['s', 'What the tool does']),
		 h2("Process")])],

	[normal_layout],
	[display.cd(h2('+ Language & Syntax'))],

	[display.clear],
	[display.dd(h3("But I'm still going to show you the tool :)"))],

	[focus_coding, display.clear],

	// First box
	[display.cc(h3("Comes in many shapes and forms"))],

	[display.cc(h3("Is a wrapper over p5.js"))],

	[focus_design, display.dc(h4("p5.js + typographic vocabulary"))],

	[
		focus_coding,
		display.cc(h3("p5.js wrapper -- for books" )),
		display.dc(h2("Type")),
	],
	[
		display.cc(h3("And the data structure lives as nested Arrays")),
		display.cd(img('./images/nested_array.png'))
	],

	[
		display.cc(h3("You can put words on page")),
		display.cd(video('./images/words_on_page.mp4'))
	],
	[
		display.cc(h3("and more words")),
		display.cd(video('./images/more_words_on_page.mp4'))
	],
	[
		display.cc(h3("you can put images")),
		display.cd(video('./images/images_on_page.mp4'))
	],
	[
		display.cc(h3("shapes")),
		display.cd(video('./images/shapes.mp4'))
	],
	[
		display.cc(h3("and more shapes")),
		display.cd(video('./images/more_shapes.mp4'))
	],

	[
		display.cc(h3("and moreeeeee")),
		display.cd(video('./images/more_more_shapes.mp4'))
	],
	[
		display.cc(h3("change sheet sizes"))
	],
	[
		display.cc(h3("and sheet colors"))
	],
	[display.cc(h3("offset the sheets--"))],
	[display.cc(h3("vertically"))],
	[display.cc(h3("or horizontally"))],
	[display.cc(h3("see how this would look"))],
	[display.cc(h3("and with multiples"))],
	[display.cc(h3("and export as imposed print files"))],
	[
		focus_design,
		display.dc(h2("which can then be printed"))
	],

	[
		focus_design,
		display.dc(h2("and bound"))
	],
]

document.onkeydown = e => {
	if (e.key == 'ArrowLeft') prevslide()
	if (e.key == 'ArrowRight') nextslide()
}

let gotoslide = e => {
	if (e > slidenumber.value()) {
		for (let i = 0; i<e; i++) {
			setTimeout(() => nextslide(), 100*i)
		}
	}
}

document.body.appendChild(dom(root))

gotoslide(17)
