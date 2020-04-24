/*
    POST-PROCESSING
    
    Post-processing methods (to be selected by the user), including:
    - Change to modern clefs
    - Barring of the piece by the long by adding dotted barlines
*/

function mensural_to_modern_clefs(meiDoc) {
    const stavesDef = Array.from(meiDoc.getElementsByTagName('staffDef'));
    // Change clefs on each <staffDef> element
    for (var staffDef of stavesDef){
        // Retrieve the mensural clef
        var mens_clef = staffDef.getAttribute('clef.shape') + staffDef.getAttribute('clef.line');
        var cmn_clefShape, cmn_clefLine, cmn_clefDis, cmn_clefDisPlace;
        // Based on the values of the mensural clef,
        // determine and encode the attributes for the CMN clef
        switch(mens_clef) {
            case 'C1':
                staffDef.setAttribute('clef.shape', 'G');
                staffDef.setAttribute('clef.line', '2');
                break;
            case 'C2':
                staffDef.setAttribute('clef.shape', 'G');
                staffDef.setAttribute('clef.line', '2');
                break;
            case 'C3':
                staffDef.setAttribute('clef.shape', 'G');
                staffDef.setAttribute('clef.line', '2');
                staffDef.setAttribute('clef.dis', '8');
                staffDef.setAttribute('clef.dis.place', 'below');
                break;
            case 'C4':
                staffDef.setAttribute('clef.shape', 'G');
                staffDef.setAttribute('clef.line', '2');
                staffDef.setAttribute('clef.dis', '8');
                staffDef.setAttribute('clef.dis.place', 'below');
                break;
            case 'C5':
                staffDef.setAttribute('clef.shape', 'G');
                staffDef.setAttribute('clef.line', '2');
                staffDef.setAttribute('clef.dis', '8');
                staffDef.setAttribute('clef.dis.place', 'below');
                break;
            case 'F1':
                staffDef.setAttribute('clef.shape', 'G');
                staffDef.setAttribute('clef.line', '2');
                staffDef.setAttribute('clef.dis', '8');
                staffDef.setAttribute('clef.dis.place', 'below');
                break;
            case 'F2':
                staffDef.setAttribute('clef.shape', 'G');
                staffDef.setAttribute('clef.line', '2');
                staffDef.setAttribute('clef.dis', '8');
                staffDef.setAttribute('clef.dis.place', 'below');
                break;
            case 'F3':
                staffDef.setAttribute('clef.shape', 'G');
                staffDef.setAttribute('clef.line', '2');
                staffDef.setAttribute('clef.dis', '8');
                staffDef.setAttribute('clef.dis.place', 'below');
                break;
            case 'F4':
                staffDef.setAttribute('clef.shape', 'G');
                staffDef.setAttribute('clef.line', '2');
                staffDef.setAttribute('clef.dis', '8');
                staffDef.setAttribute('clef.dis.place', 'below');
                break;
            case 'F5':
                staffDef.setAttribute('clef.shape', 'G');
                staffDef.setAttribute('clef.line', '2');
                staffDef.setAttribute('clef.dis', '8');
                staffDef.setAttribute('clef.dis.place', 'below');
                break;
        }
    }
}

function add_sb_value(meiDoc) {
    // Retrieve all the voices (<staff> elements) and their metadata (<staffDef>)
    var staves = meiDoc.getElementsByTagName('staff');
    var stavesDef = meiDoc.getElementsByTagName('staffDef');
    // For each voice in the "score"
    for (var i = 0; i < stavesDef.length; i++){
        var staffDef = stavesDef[i];
        var staff = staves[i];
        // 1. Get the mensuration of the voice (prolatio is irrelevant in Ars antiqua)
        var modusminor = staffDef.getAttribute('modusminor');
        var tempus = staffDef.getAttribute('tempus');
        // If there is no @tempus attribute in the <staffDef>, give the variable tempus a default value of 3.
        // The missing @tempus attribute in a voice represents the lack of semibreves that voice.
        // Therefore, the default value of the variable tempus can be either 2 or 3 (here I decided on 3).
        if (tempus == null){tempus = 3;}
        // 2. Determine the value (in semibreves) of each note/rest in the voice. This
        // value is based on the mensuration and the @dur and @dur.quality attributes
        // of the note/rest. The value is encoded temporary as an attribute (@sb_value).
        var staffNoteRests = Array.from(staff.getElementsByTagName('note')).concat(Array.from(staff.getElementsByTagName('rest')));
        var noteValue;
        for (var noterest of staffNoteRests) {
            switch(noterest.getAttribute('dur')) {
                case 'longa':
                    noteValue = modusminor * tempus;
                    if (noterest.hasAttribute('dur.quality')) {
                        switch (noterest.getAttribute('dur.quality')){
                            // regular values
                            case 'perfecta':
                                noteValue = 3 * tempus;
                                break;
                            case 'imperfecta':
                                noteValue = 2 * tempus;
                                break;
                            // twice as long
                            case 'duplex':
                                noteValue = 2 * modusminor * tempus;
                        }
                    }break;
                case 'brevis':
                    noteValue = tempus;
                    if (noterest.hasAttribute('dur.quality')) {
                        switch (noterest.getAttribute('dur.quality')){
                            // regular values
                            case 'perfecta':
                                noteValue = 3;
                                break;
                            case 'imperfecta':
                                noteValue = 2;
                                break;
                            // twice as long
                            case 'altera':
                                noteValue = 2 * tempus;
                        }
                    }break;
                case 'semibrevis':
                    noteValue = 1;
                    if (noterest.hasAttribute('dur.quality')) {
                        switch (noterest.getAttribute('dur.quality')){
                            // regular
                            case 'minor':
                                noteValue = 1;
                                break;
                            // twice as long
                            case 'maior':
                                noteValue = 2;
                                break;
                        }
                    } else if (noterest.hasAttribute('num') && noterest.hasAttribute('numbase')) {
                        // special cases of semibreves (more than 2 or 3 per breve)
                        noteValue = noterest.getAttribute('numbase') / noterest.getAttribute('num');
                    }break;
            }noterest.setAttribute('sb_value', ''+noteValue);
        }
    }
}

function add_barlines(meiDoc){
    // Retrieve all the voices (<staff> elements) and their metadata (<staffDef>)
    var staves = meiDoc.getElementsByTagName('staff');
    var stavesDef = meiDoc.getElementsByTagName('staffDef');
    // For each voice in the "score"
    for (var i = 0; i < stavesDef.length; i++){
        // Get the corresponding <staff> and <staffDef> elements
        var staffDef = stavesDef[i];
        var staff = staves[i];
        // Obtain the ORDERED sequence of notes and rests within that voice
        staff_layer = staff.children[0];
        var seqNotesAndRests = Array.from([]);
        for (var element of staff_layer.children) {
            switch(element.tagName) {
                case 'note':
                    seqNotesAndRests.push(element);
                    break;
                case 'rest':
                    seqNotesAndRests.push(element);
                    break;
                case 'ligature':
                    for (var child of ligature.children) {
                        switch(child.tagName) {
                            case 'note':
                                seqNotesAndRests.push(child);
                                break;
                            case 'rest':
                                seqNotesAndRests.push(child);
                                break;
                        }
                    }
            }
        }
        // Determine the locations were barlines can be added
        // This is, where the note offset coincides with the bar-length
        // 1. Define the bar-length to be the length of a longa (in semibreves)
        var modusminor = staffDef.getAttribute('modusminor');
        var tempus = staffDef.getAttribute('tempus');
        if (tempus == null){tempus = 3;}
        var barLength = modusminor * tempus;
        console.log('\nVoice # ' + (i + 1) + ': bar-length = ' + barLength + ' Sb');
        // 2. Add the barlines where the accumulated value of the notes (in semibreves,
        // as can be found using the @sb_value added in the 'add_sb_value' function) is
        // equal to the bar-length.
        var accum = 0; 
        for (var noterest of seqNotesAndRests) {
            accum += parseFloat(noterest.getAttribute('sb_value'));
            console.log(noterest.tagName + ' ' + noterest.getAttribute('dur') + ' ' + noterest.getAttribute('sb_value'));
            console.log(accum);
            if (accum % barLength == 0){
                barline = meiDoc.createElementNS('http://www.music-encoding.org/ns/mei', 'barLine');
                barline.setAttribute('form', 'dashed');
                staff_layer.insertBefore(barline, noterest.nextSibling);
            }
        }
    }
}

/*
    Refine score by improving readability by modern musicians
    (switching the clefs into CMN and barring the piece) as indicated by the user

*/
const refine_score = (scoreDoc, switch_to_modern_clefs_flag, add_bars_flag) => {
    // 
    if (switch_to_modern_clefs_flag) {
        mensural_to_modern_clefs(scoreDoc);
    }
    if (add_bars_flag) {
        add_sb_value(scoreDoc);
        add_barlines(scoreDoc);
    }
    return scoreDoc;
};

exports.refine_score = refine_score;