
// text(text, x, y)
   text("Book's have words", 10, 20)
//                            ^   ^
//                            |   |
//  pixels ------------------------


// PPI -> Pixels Per Inch
// UNITS
let inch  = (v) => v * ppi 
let em    = (v) => inch(v) / 6
let pica  = (v) => em(v)
let point = (v) => pica(v) / 12


text("Book's have words", inch(1/2), inch(1/4))
//                              ^          ^
//                              |          |
//  half inch -------------------          |
//                                         | 
//  quarter inch ---------------------------



//  Letter size page: 8.5 x 11 inches
createCanvas(inch(11), inch(8.5))


