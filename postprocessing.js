/*
    OPTIONAL POST-PROCESSING

    Post-processing functions (to be selected by the user), including:
    A) Change to modern clefs
    B) Barring of the piece with dotted barlines using a user-selected note value
*/


// A) Clef-related functions: mensural_to_modern_clefs

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
                staffDef.setAttribute('clef.shape', 'F');
                staffDef.setAttribute('clef.line', '4');
                break;
            case 'F5':
                staffDef.setAttribute('clef.shape', 'F');
                staffDef.setAttribute('clef.line', '4');
                break;
        }
    }
    // Remove all <clef> elements
    //(they represent a change in clef in the original source)
    const cleves = Array.from(meiDoc.getElementsByTagName('clef'));
    for (var clef of cleves) {
        var parent = clef.parentElement;
        parent.removeChild(clef);
    }
}


// B) Barring-related functions: add_sb_value & add_barlines (and its auxiliary function 'insert_after')

function add_sb_value(meiDoc) {
    // Retrieve all the voices (<staff> elements) and their metadata (<staffDef>)
    var staves = meiDoc.getElementsByTagName('staff');
    var stavesDef = meiDoc.getElementsByTagName('staffDef');

    // For each voice in the "score"
    for (var i = 0; i < stavesDef.length; i++){
        var staffDef_mensur = stavesDef[i].getElementsByTagName('mensur')[0];
        var staff = staves[i];

        // 1. Get the mensuration of the voice (prolatio is irrelevant in Ars antiqua)
        var modusminor = staffDef_mensur.getAttribute('modusminor');
        var tempus = staffDef_mensur.getAttribute('tempus');
        var prolatio = staffDef_mensur.getAttribute('prolatio');
        // If there is no @tempus attribute in the <staffDef>, give the variable tempus a default value of 3.
        // The missing @tempus attribute in a voice represents the lack of semibreves that voice.
        // Therefore, the default value of the variable tempus can be either 2 or 3 (here I decided on 3).
        if (tempus == null){tempus = 3;}
        // Same with @prolatio
        if (prolatio == null){prolatio = 3;}

        // 2. Determine the value (in minims) of each note/rest in the voice. This
        // value is based on the mensuration and the @dur and @dur.quality attributes
        // of the note/rest. The value is encoded temporary as an attribute (@sb_value).
        var staffNoteRests = Array.from(staff.getElementsByTagName('note')).concat(Array.from(staff.getElementsByTagName('rest')));
        var noteValue;
        for (var noterest of staffNoteRests) {
            switch(noterest.getAttribute('dur')) {

                case 'longa':
                    noteValue = modusminor * tempus * prolatio;
                    if (noterest.hasAttribute('dur.quality')) {
                        switch (noterest.getAttribute('dur.quality')){
                            // regular values
                            case 'perfecta':
                                noteValue = 3 * tempus * prolatio;
                                break;
                            case 'imperfecta':
                                noteValue = 2 * tempus * prolatio;
                                break;
                            // twice as long
                            case 'duplex':
                                noteValue = 2 * noteValue;
                        }
                    } else if (noterest.hasAttribute('num') && noterest.hasAttribute('numbase')) {
                        // special case of partial imperfection
                        noteValue = noteValue * noterest.getAttribute('numbase') / noterest.getAttribute('num');
                    }break;

                case 'brevis':
                    noteValue = tempus * prolatio;
                    if (noterest.hasAttribute('dur.quality')) {
                        switch (noterest.getAttribute('dur.quality')){
                            // regular values
                            case 'perfecta':
                                noteValue = 3 * prolatio;
                                break;
                            case 'imperfecta':
                                noteValue = 2 * prolatio;
                                break;
                            // twice as long
                            case 'altera':
                                noteValue = 2 * noteValue;
                        }
                    } else if (noterest.hasAttribute('num') && noterest.hasAttribute('numbase')) {
                        // special case of partial imperfection
                        noteValue = noteValue * noterest.getAttribute('numbase') / noterest.getAttribute('num');
                    }break;

                case 'semibrevis':
                    noteValue =  prolatio;
                    if (noterest.hasAttribute('dur.quality')) {
                        switch (noterest.getAttribute('dur.quality')){
                            // regular
                            case 'minor': // Ars antiqua
                                noteValue = prolatio;
                                break;
                            case 'perfecta': // Ars nova & white mensural
                                noteValue = 3;
                                break;
                            case 'imperfecta': // Ars nova & white mensural
                                noteValue = 2;
                                break;
                            // twice as long
                            case 'maior': // Ars antiqua
                                noteValue = 2 * noteValue;
                                break;
                            case 'altera': // Ars nova & white mensural
                                noteValue = 2 * noteValue;
                                break;
                        }
                    } else if (noterest.hasAttribute('num') && noterest.hasAttribute('numbase')) {
                        // special cases of Ars antiqua semibreves (more than 2 or 3 per breve)
                        noteValue = noteValue * noterest.getAttribute('numbase') / noterest.getAttribute('num');
                    }break;

                case 'minima':
                    noteValue = 1;
                    if (noterest.hasAttribute('dur.quality')) {
                        switch (noterest.getAttribute('dur.quality')){
                            // regular values
                            case 'perfecta':
                                noteValue = 1.5;
                                break;
                            case 'imperfecta':
                                noteValue = 1;
                                break;
                            // twice as long
                            case 'altera':
                                noteValue = 2 * noteValue;
                                break;
                        }
                    } else if (noterest.hasAttribute('num') && noterest.hasAttribute('numbase')) {
                        // in case num & numbase is used as an alternative to the 'perfecta' / 'imperfecta' quality
                        noteValue = noteValue * noterest.getAttribute('numbase') / noterest.getAttribute('num');
                    }break;

                case 'semiminima':
                    noteValue = 0.5;
                    if (noterest.hasAttribute('dur.quality')) {
                        switch (noterest.getAttribute('dur.quality')){
                            // regular values
                            case 'perfecta':
                                noteValue = 0.75;
                                break;
                            case 'imperfecta':
                                noteValue = 0.5;
                                break;
                        }
                    } else if (noterest.hasAttribute('num') && noterest.hasAttribute('numbase')) {
                        // in case num & numbase is used as an alternative to the 'perfecta' / 'imperfecta' quality
                        noteValue = noteValue * noterest.getAttribute('numbase') / noterest.getAttribute('num');
                    }break;

                case 'fusa':
                    noteValue = 0.25;
                    if (noterest.hasAttribute('dur.quality')) {
                        switch (noterest.getAttribute('dur.quality')){
                            // regular values
                            case 'perfecta':
                                noteValue = 0.375;
                                break;
                            case 'imperfecta':
                                noteValue = 0.25;
                                break;
                        }
                    } else if (noterest.hasAttribute('num') && noterest.hasAttribute('numbase')) {
                        // in case num & numbase is used as an alternative to the 'perfecta' / 'imperfecta' quality
                        noteValue = noteValue * noterest.getAttribute('numbase') / noterest.getAttribute('num');
                    }break;

                case 'semifusa':
                    noteValue = 0.125;
                    if (noterest.hasAttribute('dur.quality')) {
                        switch (noterest.getAttribute('dur.quality')){
                            // regular values
                            case 'imperfecta':
                                noteValue = 0.125;
                                break;
                        }
                    } else if (noterest.hasAttribute('num') && noterest.hasAttribute('numbase')) {
                        // in case num & numbase is used as an alternative to the 'perfecta' / 'imperfecta' quality
                        noteValue = noteValue * noterest.getAttribute('numbase') / noterest.getAttribute('num');
                    }break;

            }noterest.setAttribute('sb_value', ''+(noteValue/prolatio));
        }
    }
}

function insert_after(new_element, some_element) {
    // Inserts the new_element after the some_element
    // A) either as its next sibling by using parent.insertBefore(next_element, nextsibling)
    // or parent.appendChild(new_element), depending on the position of the some_element
    // B) or the next sibling of its parent in case we are at the end of a 'corr' element
    var nextsibling = some_element.nextElementSibling;
    var parent = some_element.parentElement;
    var choice_element;
    if (nextsibling == null) {
        // If there is no following sibling, then we are at the last child
        // Therefore, we append the new_element at the end (see 'else')
        // except if we are inside a 'corr' element, then we insert it after its 'choice' parent
        if (parent.tagName == "corr") {
            choice_element = parent.parentElement;
            insert_after(new_element, choice_element);
        } else {
            parent.appendChild(new_element);
        }
    } else {
        // If there is a following sibling, we insert the new_element before it (see 'else')
        // except if there is a dot, then we insert the new_element after the dot
        if (nextsibling.tagName == "dot") {
            insert_after(new_element, nextsibling);
        } else {
            parent.insertBefore(new_element, nextsibling);
        }
    }
}

function add_barlines(meiDoc, bar_by_note){
    var corr, child, grandchild, greatgrandchild;
    // Retrieve all the voices (<staff> elements) and their metadata (<staffDef>)
    var staves = meiDoc.getElementsByTagName('staff');
    var stavesDef = meiDoc.getElementsByTagName('staffDef');
    // For each voice in the "score"
    for (var i = 0; i < stavesDef.length; i++){
        // Get the corresponding <staff> and <staffDef> elements
        // (or, more precisely, the <mensur> element within <staffDef>)
        var staffDef_mensur = stavesDef[i].getElementsByTagName('mensur')[0];
        var staff = staves[i];
        // Obtain the ORDERED sequence of notes and rests within that voice
        var staff_layer = staff.children[0];
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
                    for (child of element.children) {
                        switch(child.tagName) {
                            case 'note':
                                seqNotesAndRests.push(child);
                                break;
                            case 'rest':
                                seqNotesAndRests.push(child);
                                break;
                            case 'choice':
                                corr = child.getElementsByTagName('corr')[0];
                                for (greatgrandchild of corr.children) {
                                    switch(greatgrandchild.tagName) {
                                        case 'note':
                                            seqNotesAndRests.push(greatgrandchild);
                                            break;
                                        case 'rest':
                                            seqNotesAndRests.push(greatgrandchild);
                                            break;
                                    }
                                    
                                }
                        }
                    }break;
                case 'choice':
                    corr = element.getElementsByTagName('corr')[0];
                    for (grandchild of corr.children) {
                        switch(grandchild.tagName) {
                            case 'note':
                                seqNotesAndRests.push(grandchild);
                                break;
                            case 'rest':
                                seqNotesAndRests.push(grandchild);
                                break;
                        }
                    }break;

            }
        }
        // Determine the locations were barlines can be added
        // This is, where the note offset coincides with the bar-length
        // 1. Define the bar-length to be the length of a longa (in semibreves)
        var barLength_Sb;
        var modusminor = staffDef_mensur.getAttribute('modusminor');
        var tempus = staffDef_mensur.getAttribute('tempus');
        var prolatio = staffDef_mensur.getAttribute('prolatio');
        if (tempus == null){tempus = 3;}
        if (prolatio == null){prolatio = 3;}
        switch(bar_by_note) {
            case "semibrevis":
                barLength_Sb = 1;
                break;
            case "brevis":
                barLength_Sb = tempus;
                break;
            case "longa":
                barLength_Sb = modusminor * tempus;
                break;
        }console.log('\nVoice # ' + (i + 1) + ': bar-length = ' + barLength_Sb + ' Sb');
        // 2. Add the barlines where the accumulated value of the notes (in semibreves,
        // as can be found using the @sb_value added in the 'add_sb_value' function) is
        // equal to the bar-length.
        var accum = 0;
        for (var noterest of seqNotesAndRests) {
            accum += parseFloat(noterest.getAttribute('sb_value'));
            console.log(noterest.tagName + ' ' + noterest.getAttribute('dur') + ' ' + noterest.getAttribute('sb_value'));
            console.log(accum);
            // The condition should be accum % barLength_Sb == 0,
            // but because JavaScript doesn't sum periodic decimals correctly
            // we are substitutin the original condition by checking that
            // the division by the barlength provides a number close to an integer
            if (Math.abs((accum / barLength_Sb) - Math.round(accum / barLength_Sb)) < 0.00001){
                // Create dotted <barLine> element
                var barline = meiDoc.createElementNS('http://www.music-encoding.org/ns/mei', 'barLine');
                barline.setAttribute('form', 'dashed');
                // Insert the new <barLine> element after the noterest
                insert_after(barline, noterest);
                console.log('---- barline ----');
            }
        }
    }
}

/*
    Refine Score: User selection of the post-processing methods
    (switch to modern clefs and barring of the piece)
    to improve readibility for modern musicians
*/
const refine_score = (scoreDoc, switch_to_modern_clefs_flag, bar_by_note_value) => {
    if (switch_to_modern_clefs_flag) {
        mensural_to_modern_clefs(scoreDoc);
    }// else, we stay with the original (mensural) clefs of the parts MEI file
    switch(bar_by_note_value) {
        case "None":
            break;
        default:
            // Calculate the values of all notes in semibreves (add_sb_value)
            // to determine the place where barlines should be added (add_barlines)
            add_sb_value(scoreDoc);
            add_barlines(scoreDoc, bar_by_note_value);
            // Remove the 'sb_value' attribute for producing a valid file
            for (var note of scoreDoc.getElementsByTagName('note')) {
                note.removeAttribute('sb_value');
            }
            for (var rest of scoreDoc.getElementsByTagName('rest')) {
                rest.removeAttribute('sb_value');
            }
    }
    return scoreDoc;
};

exports.refine_score = refine_score;


/*
    REQUIRED POST-PROCESSING:

    - Replace ligatures by brackets (otherwise, vertical alignment is not visible within ligatures)
    - Remove @num and @numbase attributes when @dur.quality is used (to make it MEI-compliant)
*/

const replace_ligatures_by_brackets = (meiDoc) => {
    // Replace all ligatures by <bracketSpan> elements located at the end of the <section>
    const section = meiDoc.getElementsByTagName('section')[0];
    // First, retrieve all ligatures
    const ligatures = Array.from(meiDoc.getElementsByTagName('ligature'));
    // Then, for each ligature
    for (var ligature of ligatures) {
        // 1. Take the elements contained within that <ligature>
        // and incorporate them into the stream of notes of the <layer>
        var parent = ligature.parentElement;
        var ligated_notes = Array.from(ligature.children);
        for (var element of ligated_notes) {
            parent.insertBefore(element, ligature);
        }
        // 2. And create the <bracketSpan> element to replace the ligature
        var bracketSpan = meiDoc.createElementNS('http://www.music-encoding.org/ns/mei', 'bracketSpan');
        bracketSpan.setAttribute('xml:id', ligature.getAttribute('xml:id'));
        // With @startid and @endid pointing to the start and end of the ligature
        var start_note = ligated_notes[0];
        if (start_note.tagName == 'choice') {
            start_note = start_note.getElementsByTagName('corr')[0].children[0];
        }
        var end_note = ligated_notes[ligated_notes.length - 1];
        if (end_note.tagName == 'choice') {
            var corr_children = end_note.getElementsByTagName('corr')[0].children;
            end_note = corr_children[corr_children.length - 1];
        }
        bracketSpan.setAttribute('startid', '#' + start_note.getAttribute('xml:id'));
        bracketSpan.setAttribute('endid', '#' + end_note.getAttribute('xml:id'));
        // And with attributes corresponding to a mensural ligature
        bracketSpan.setAttribute('func', 'ligature');
        bracketSpan.setAttribute('lform', 'solid');
        // 3. Remove the ligature
        parent.removeChild(ligature);
        // 4. Add the <bracketSpan> to the end of <section>
        section.appendChild(bracketSpan);
    }
};

const remove_num_and_numbase = (meiDoc) => {
    // Remove the attributes @num and @numbase when a @dur.quality attribute is presesnt
    const notes = meiDoc.getElementsByTagName('note');
    for (var note of notes) {
        if (note.hasAttribute('dur.quality')) {
            note.removeAttribute('num');
            note.removeAttribute('numbase');
        }
    }
};

exports.replace_ligatures_by_brackets = replace_ligatures_by_brackets;
exports.remove_num_and_numbase = remove_num_and_numbase;
