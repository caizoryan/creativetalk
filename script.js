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
let toggle = 0
let buttons = dom([
	'.controller.box',
	// btn('undo', () => history.undo()),
	// btn('redo', () => history.redo()),
	// btn('toggle', () => { toggle % 2 == 0 ? focus_design() : focus_coding(); toggle++ }),
	btn('next', nextslide),
	btn(slidenumber, () => console.log(slidenumber.value())  ),
	btn('prev', prevslide),
	btn('normal', normal_layout)
])

let root = [".root", codingcaption, codingdispaly, designdispaly, designcaption, buttons]

let cmd = {
	focus_coding,
	focus_design,
	normal_layout,

	d: {
		cc: (el) => () => ccdisplay.next(el),
		cd: (el) => () => cddisplay.next(el),
		dd: (el) => () => dddisplay.next(el),
		dc: (el) => () => dcdisplay.next(el),
	}
}

let empty = ['div']

let slides = [
	[],

	[cmd.d.dd(['h2', "I'm a graphic design student" ])],
	[cmd.d.cd(['h1', "I also code" ])],
	[
		// add gifs of the tool
		cmd.d.cd(empty),
		cmd.d.dd(empty),

		cmd.d.cc(['h1', 'Publication Tool']),
		cmd.d.dc(['h1', 'Publication Tool'])
	],



]

document.onkeydown = e => {
	if (e.key == 'ArrowLeft') prevslide()
	if (e.key == 'ArrowRight') nextslide()
}


document.body.appendChild(dom(root))
console.log('hello world')
