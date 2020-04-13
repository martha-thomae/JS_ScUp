/*
    DURATION FINDER MODULE FOR ARS ANTIQUA
    Figure out the duration of the notes in the individual <staff> elements.

    Ars Antiqua is characterized by the following:
    1. Absence of 'minims'
    2. Absence of 'prolatio' and 'modusmaior'
    3. The 'breve' can't be identified as 'perfect' or 'imperfect'.
       It is just considered to be equal to 3 minor semibreves, or a pair of minor-major semibreves,
       or it is equal to 2 equal-duration semibreves.
    4. The fact that the 'breve' can't be catalogued as 'perfect' or 'imperfect', implies that the 'semibreve' can't be 'altered.
       It just can be 'maior' or 'minor'.
    5. There are no 'maximas' just 'duplex longas'
    6. There is no dot of augmentation (this was introduced in the Ars nova).
       Therefore, there is no issue regarding the distiction between dot's functionality (division vs. augmentation).
       In other words, in Ars antiqua, all dots are dots of division.
*/
const Fraction = require('fraction.js');

// Functions about preceeding and suceeding elements
function get_preceding_noterest(target_element) {
    var preceding_element = target_element.previousSibling;
    while (preceeding_element.tagName != 'note' && preceeding_element.tagName != 'rest'){
        preceding_element = preceeding_element.previousSibling;
    } return preceeding_element;
}

// Functions related to the counting of minims in a sequence of notes
function counting_semibreves(sequence_of_notes, note_durs, undotted_note_gain) {
    var sb_counter, note, dur, index, gain, ratio;
    sb_counter = 0;
    for (note of sequence_of_notes) {
        dur = note.getAttribute('dur');
        try {
            index = note_durs.indexOf(dur);
        }
        catch(err) {
            console.log("MISTAKE\nNote/Rest element not considered: " + note + ", with a duration @dur = " + dur);
        }
        gain = undotted_note_gain[index];
        if (note.hasAttribute('num') && note.hasAttribute('numbase')) {
            ratio = new Fraction([note.getAttribute('numbase'), note.getAttribute('num')]);
            gain = ratio.mul(gain);
        }
        sb_counter += gain;
        console.log(dur + ", " + gain + ", " + sb_counter);
    }
    return sb_counter;
}

function has_been_modified(note) {
    return (note.hasAttribute('num') && note.hasAttribute('numbase'));
}

// Given the total amount of "breves" in-between the "longs", see if they can be arranged in groups of 3
// According to how many breves remain ungrouped (1, 2 or 0), modifiy the duration of the appropriate note of the sequence ('imperfection', 'alteration', no-modification)
function modification(counter, start_note, middle_notes, end_note, following_note, short_note, long_note) {
    var last_middle_note, last_uncolored_note;

    switch(counter % 3){

        case 1: // 1 breve left out:

            if (start_note != null && start_note.tagName == 'note' && start_note.getAttribute('dur') == long_note && !(has_been_modified(start_note))){
            // Default Case
                // Imperfection a.p.p.
                start_note.setAttribute('dur.quality', 'imperfecta');
                start_note.setAttribute('num', '3');
                start_note.setAttribute('numbase', '2');
            }

            else if (end_note != null && end_note.tagName == 'note' && end_note.getAttribute('dur') == long_note && !(has_been_modified(end_note))){
            // Exception Case
                // Imperfection a.p.a.
                end_note.setAttribute('dur.quality', 'imperfecta');
                end_note.setAttribute('num', '3');
                end_note.setAttribute('numbase', '2');
                // Raise a warning when this imperfect note is followed by a perfect note (contradiction with the first rule)
                if (following_note != null && following_note.getAttribute('dur') == long_note){
                    console.log("WARNING 1! An imperfection a.p.a. is required, but this imperfect note is followed by a perfect note, this contradicts the fundamental rule: 'A note is perfect before another one of the same kind'.");
                    console.log("The imperfected note is " + end_note + " and is followed by the perfect note " + following_note + "\n");
                }
            }

            else {
            // Mistake Case
                console.log("MISTAKE 1 - Impossible to do Imperfection a.p.p. and also Imperfection a.p.a.");
                console.log(start_note);
                console.log(end_note);
                console.log("\n");
            } break;

        case 2: // 2 breves left out:
            // One of he possibilities when 2 breves are left out, is alteration.
            // One must alter the last (uncolored) note from the middle_notes of the sequence
            last_middle_note = middle_notes[middle_notes.length - 1];
            // If the last note is uncolored, it is a candidate for alteration (given that it is a note and not a rest and that it is a breve and not a smaller value)
            last_uncolored_note = last_middle_note;
            // But if it is colored, we need to find the last "uncolored" note, as this is the one that would be altered
            while (last_uncolored_note.hasAttribute('colored')){
                last_uncolored_note = get_preceding_noterest(last_uncolored_note);
            }

            if (counter == 2) {// 2 exact breves between the longs

                if (last_uncolored_note.tagName == 'note' && last_uncolored_note.getAttribute('dur') == short_note && !(has_been_modified(last_uncolored_note))){
                // Default case
                    // Alteration
                    last_uncolored_note.setAttribute('dur.quality', 'altera');
                    last_uncolored_note.setAttribute('num', '1');
                    last_uncolored_note.setAttribute('numbase', '2');
                }

                else if ((start_note != null && start_note.tagName == 'note' && start_note.getAttribute('dur') == long_note && !(has_been_modified(start_note))) && (end_note != null && end_note.tagName == 'note' && end_note.getAttribute('dur') == long_note && !(has_been_modified(end_note)))){
                // Exception Case
                    // Imperfection a.p.p.
                    start_note.setAttribute('dur.quality', 'imperfecta');
                    start_note.setAttribute('num', '3');
                    start_note.setAttribute('numbase', '2');
                    // Imperfection a.p.a.
                    end_note.setAttribute('dur.quality', 'imperfecta');
                    end_note.setAttribute('num', '3');
                    end_note.setAttribute('numbase', '2');
                    // Raise a warning when this imperfect note is followed by a perfect note (contradiction with the first rule)
                    if (following_note != null && following_note.getAttribute('dur') == long_note) {
                        console.log("WARNING 2! An imperfection a.p.a. is required, but this imperfect note is followed by a perfect note, this contradicts the fundamental rule: 'A note is perfect before another one of the same kind'.");
                        console.log("The imperfected note is " + end_note + " and is followed by the perfect note " + following_note);
                        console.log("\n");
                    }
                }

                else {
                // Mistake Case
                    console.log("MISTAKE 2 - Alteration is impossible - Imperfections a.p.p. and a.p.a. are also impossible");
                    console.log(start_note);
                    console.log(end_note);
                    console.log("\n");
                }

            } else {// 5, 8, 11, 14, 17, 20, ... breves between the longs
                console.log(last_uncolored_note);
                // Default Case: Check the conditions to apply the 'default interpretation', which implies imperfection a.p.a.

                if ((start_note != null && start_note.tagName == 'note' && start_note.getAttribute('dur') == long_note && !(has_been_modified(start_note))) && (end_note != null && end_note.tagName == 'note' && end_note.getAttribute('dur') == long_note && !(has_been_modified(end_note)))){
                    // Check if imperfection a.p.a. enters or not in conflict with rule # 1.
                    if (following_note != null && following_note.getAttribute('dur') == long_note) {
                        // If it does, imperfection a.p.a. is discarded, except if the "alterantive interpretation" (the 'Exception Case') is also forbidden
                        if (last_uncolored_note.tagName == 'note' && last_uncolored_note.getAttribute('dur') == short_note && !(has_been_modified(last_uncolored_note))){
                        // Exception Case
                            // Alteration
                            last_uncolored_note.setAttribute('dur.quality', 'altera');
                            last_uncolored_note.setAttribute('num', '1');
                            last_uncolored_note.setAttribute('numbase', '2');
                        }
                        else {
                        // Default + Warning Case
                            // If the "alternative interpretation" is forbidden, and imperfection imp. a.p.a. was discarded just because it entered in conflict with rule # 1
                            // (this is, impapa_against_rule1 flag is True), then we force imperfection a.p.a. as it is the only viable option. But we also raise a 'warning'
                            // Imperfection a.p.p.
                            start_note.setAttribute('dur.quality', 'imperfecta');
                            start_note.setAttribute('num', '3');
                            start_note.setAttribute('numbase', '2');
                            // Imperfection a.p.a.
                            end_note.setAttribute('dur.quality', 'imperfecta');
                            end_note.setAttribute('num', '3');
                            end_note.setAttribute('numbase', '2');
                            // Raise a warning when this imperfect note is followed by a perfect note (contradiction with the first rule)
                            console.log("WARNING 3n + 2! An imperfection a.p.a. is required, but this imperfect note is followed by a perfect note, this contradicts the fundamental rule: 'A note is perfect before another one of the same kind'.");
                            console.log("The imperfected note is " + end_note + " and is followed by the perfect note " + following_note);
                            console.log("\n");
                        }
                    // If it does not enter in conflict, we go with the "Default interpretation" of the notes
                    } else {
                    // Default Case
                        // Imperfection a.p.p.
                        start_note.setAttribute('dur.quality', 'imperfecta');
                        start_note.setAttribute('num', '3');
                        start_note.setAttribute('numbase', '2');
                        // Imperfection a.p.a.
                        end_note.setAttribute('dur.quality', 'imperfecta');
                        end_note.setAttribute('num', '3');
                        end_note.setAttribute('numbase', '2');
                    }
                }

                else if (last_uncolored_note.tagName == 'note' && last_uncolored_note.getAttribute('dur') == short_note && !(has_been_modified(last_uncolored_note))){
                // Exception Case
                    // Alteration
                    last_uncolored_note.setAttribute('dur.quality', 'altera');
                    last_uncolored_note.setAttribute('num', '1');
                    last_uncolored_note.setAttribute('numbase', '2');
                }

                else {// Mistake Case
                    console.log("MISTAKE 3n + 2 - Imperfections a.p.p. and a.p.a. are impossible - Alteration is also impossible");
                    console.log(start_note);
                    console.log(end_note);
                    console.log("\n");
                }

            } break;

        case 0: // 0 breves left out:

            if (counter <= 3) {
                // When 0 or 3 breves left out, no modifications to perform
            }

            else {
                // One of the possibilities when 6,9,12,etc. breves are left out, involves alteration
                // One must alter the last (uncolored) note from the middle_notes of the sequence
                // The last middle note is given by:
                last_middle_note = middle_notes[middle_notes.length - 1];
                // If this note is uncolored, it is a candidate for alteration (given that it is a note and not a rest and that it is a breve and not a smaller value)
                last_uncolored_note = last_middle_note;
                // But if it is colored, we need to find the last "uncolored" note, as this is the one that would be altered
                while (last_uncolored_note.hasAttribute('colored')) {
                    last_uncolored_note = get_preceding_noterest(last_uncolored_note);
                }

                if ((start_note != null && start_note.tagName == 'note' && start_note.getAttribute('dur') == long_note && !((has_been_modified(start_note)))) && (last_uncolored_note.tagName == 'note' && last_uncolored_note.getAttribute('dur') == short_note && !(has_been_modified(last_uncolored_note)))){
                // Default Case:
                    // Imperfection a.p.p.
                    start_note.setAttribute('dur.quality', 'imperfecta');
                    start_note.setAttribute('num', '3');
                    start_note.setAttribute('numbase', '2');
                    // Alteration
                    last_uncolored_note.setAttribute('dur.quality', 'altera');
                    last_uncolored_note.setAttribute('num', '1');
                    last_uncolored_note.setAttribute('numbase', '2');
                }

                else {// Exception Case:
                    // Start note remains perfect
                }

            } break;
    }
}

function modification_semibreve_level(middle_notes) {
    var note, note1, note2;

    switch(middle_notes.length){

        case 1: // If there is 1 semibreve:
            // Mistake: this shouldn't happen in Ars antiqua
            console.log("MISTAKE: 1 semibreve standing alone (this is not proper of Ars antiqua)");
            break;

        case 2: // If there are 2 semibreves:
            note1 = middle_notes[0];
            note2 = middle_notes[1];
            if (note1.hasAttribute('stem.dir') && note1.getAttribute('stem.dir') == 'down') {
            // If the first note has a downward stem, we have a major-minor pair of semibreves
                note1.setAttribute('dur.quality', 'maior');
                note1.setAttribute('num', '1');
                note1.setAttribute('numbase', '2');
                note2.setAttribute('dur.quality', 'minor');
            } else {
            // On the other hand, if there is no additional markings, we have a minor-major pair of semibreves (default case)
                note1.setAttribute('dur.quality', 'minor');
                note2.setAttribute('dur.quality', 'maior');
                note2.setAttribute('num', '1');
                note2.setAttribute('numbase', '2');
            } break;

        case 3: // If there are 3 semibreves:
            // All of them are minor (1/3 of breve)
            for (note of middle_notes) {
                note.setAttribute('dur.quality', 'minor');
            } break;

        default: // For more than three semibreves:
            for (note of middle_notes) {
                note.setAttribute('num', middle_notes.length);
                note.setAttribute('numbase', '3');
            }
    }
}

function breves_between_longas(start_note, middle_notes, end_note, following_note, tempus, note_durs, undotted_note_gain) {
    // Total of breves in the middle_notes
    // 1. Pre-processing: Filtering. Remove the 'dot' elements (and other group markings, such as 'Group_Begin' and 'Group_End')
    // from the middle_notes list, so that this list only contains notes and rests that lie between the longs.
    var sequence_of_middle_notes = [];
    for (var element of middle_notes){
        if (element.tagName!='dot' && element.tagName!='Group_Begin' && element.tagName!='Group_End'){
            sequence_of_middle_notes.push(element);
        }
    }
    // 2. Use the counter of semibreves to determine the total of breves in the middle_notes
    var sb_counter = counting_semibreves(sequence_of_middle_notes, note_durs, undotted_note_gain);
    console.log(sb_counter);
    var count_B = sb_counter / tempus;
    console.log(count_B);
    console.log();

    modification(count_B, start_note, sequence_of_middle_notes, end_note, following_note, 'brevis', 'longa');
}

function replace_ligatures_by_brackets(meiDoc){
    // Replace all ligatures by <bracketSpan> elements located at the end of the <section>
    const section = meiDoc.getElementsByTagName('section')[0];
    // First, retrieve all ligatures
    const ligatures = Array.from(meiDoc.getElementsByTagName('ligature'));
    // Then, for each ligature
    for (var ligature of ligatures) {
        // 1. Take the notes contained within that <ligature>
        // and incorporate them into the stream of notes of the <layer>
        var parent = ligature.parentElement;
        var ligated_notes = Array.from(ligature.children);
        for (var note of ligated_notes) {
            parent.insertBefore(note, ligature);
        }
        // 2. And create the <bracketSpan> element to replace the ligature
        var bracketSpan = meiDoc.createElementNS('http://www.music-encoding.org/ns/mei', 'bracketSpan');
        bracketSpan.setAttribute('xml:id', ligature.getAttribute('xml:id'));
        // With @startid and @endid pointing to the start and end of the ligature
        var start_note = ligated_notes[0];
        var end_note = ligated_notes[ligated_notes.length - 1];
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
}

function replace_maximas_by_duplexlongas(meiDoc){
    const notes = Array.from(meiDoc.getElementsByTagName('note'));
    for (var note of notes) {
        if (note.getAttribute('dur') == 'maxima') {
            note.setAttribute('dur', 'longa');
            note.setAttribute('dur.quality', 'duplex');
        }
    }
}

// Main function
const lining_up = quasiscore_mensural_doc => {
    // For each voice (staff element) in the "score"
    var staves = quasiscore_mensural_doc.getElementsByTagName('staff');
    var stavesDef = quasiscore_mensural_doc.getElementsByTagName('staffDef');
    for (var i = 0; i < stavesDef.length; i++){
        console.log('\nVoice # ' + (i + 1) + ' results:\n');
        var staffDef = stavesDef[i];
        var staff = staves[i];

        // Getting the mensuration information of the voice (prolatio is irrelevant in Ars antiqua)
        var tempus = staffDef.getAttribute('tempus');
        var modusminor = staffDef.getAttribute('modusminor');

        // If there is no @tempus attribute in the <staffDef>, give the variable tempus a default value of 3.
        // The missing @tempus attribute in a voice represents the lack of semibreves that voice.
        // Therefore, the default value of the variable tempus can be either 2 or 3 (here I decided on 3).
        if (tempus == null){tempus = 3;}

        // Individual note values and gains, according to the mensuration
        var note_durs = ['semibrevis', 'brevis', 'longa'];
        var undotted_note_gain = [1, 1*tempus, modusminor * tempus];
        console.log(note_durs);
        console.log(undotted_note_gain);
        console.log();

        // Getting all the relevant elements of a staff into an array (in order of appearance).
        // The relevant elements (for Ars antiqua) are notes, rests, dots, and other group markings (such as ligatures).
        // Dots and ligatures are useful for marking the division of groups of semibreves equivalent to a breve.
        // The array allows to retrieve the index, which is not possible with MEI lists.
        var voice_content = staff.getElementsByTagName('layer')[0].children;
        var voice_noterest_dots_content = [];
        for (var element of voice_content){
            var name = element.tagName;
            if (name == 'note' || name == 'rest') {
                voice_noterest_dots_content.push(element);
            } else if (name == 'dot') {
                voice_noterest_dots_content.push(element);
                // Also encode the dot's functionality (i.e., division)
                element.setAttribute('form', 'div');
            } else if (name == 'ligature') {
                console.log("Got a ligature!");
                // The Group_Begin and Group_End elements introduced here are just place holders, a way to indicate that the
                // set of notes between these two elements belong to the same grouping
                //(Maybe I can use just a new element <dot> for that? These elments are not getting exported to the output file, so it should be fine.)
                voice_noterest_dots_content.push(quasiscore_mensural_doc.createElementNS('http://www.music-encoding.org/ns/mei', 'Group_Begin'));
                for (var child of element.children){
                    if (child.tagName == 'note' || child.tagName == 'rest') {
                        voice_noterest_dots_content.push(child);
                    }
                    else {
                        console.log("This child of ligature is not a note/rest:");
                        console.log(child);
                        console.log("It is a " + child.tagName);
                    }
                }
                voice_noterest_dots_content.push(quasiscore_mensural_doc.createElementNS('http://www.music-encoding.org/ns/mei', 'Group_End'));
            } else if (name == 'choice'){
                // The relevant <note>, <rest>, and <dot> elements can be contained
                // within a <corr> element due to editorial corrections
                var corr = element.getElementsByTagName('corr')[0];
                for (var child of corr.children) {
                    if (child.tagName == 'note' || child.tagName == 'rest') {
                        voice_noterest_dots_content.push(child);
                    } else if (child.tagName == 'dot') {
                        voice_noterest_dots_content.push(child);
                        // Also encode the dot's functionality (i.e., division)
                        child.setAttribute('form', 'div');
                    } else {
                        console.log("This child of corr is not a note/rest/dot:");
                        console.log(child);
                        console.log("It is a " + child.tagName);
                    }
                }
            } else {
                console.log("Unexpected tagnme : " + name + "\n(not a note, rest, dot, or ligature)\n");
            }
        }
        /*for (var member of voice_noterest_dots_content) {
            var member_attrib = member.getAttribute('dur') + "_" + member.getAttribute('pname') + member.getAttribute('oct');
            if (member_attrib == 'null_nullnull') {
                member_attrib = '';
            } else if (member_attrib.slice(member_attrib.length-9, member_attrib.length) == '_nullnull') {
                member_attrib = member_attrib.slice(0, member_attrib.length-9);
            } console.log(member.tagName + ' ' + member_attrib);
        }console.log();*/

        // Find indices for starting and ending points of each sequence of notes to be analyzed.
        var list_of_indices_geq_B_and_dots = []; // list of indices of notes greater or equal to the Breve and the indices of group markings (these are, dots of division and beginning and ending of ligatures)
        var list_of_indices_geq_L = []; // list of indices of notes greater or equal to the long (in Ars antiqua, these are just longs---there are no maximas)
        // Get the indices
        for (var noterest of voice_noterest_dots_content) {
            if (noterest.tagName == 'dot' || noterest.tagName == 'Group_Begin' || noterest.tagName == 'Group_End' || noterest.getAttribute('dur') == 'brevis'){
                list_of_indices_geq_B_and_dots.push(voice_noterest_dots_content.indexOf(noterest));
            } else if (noterest.getAttribute('dur') == 'longa' || noterest.getAttribute('dur') == 'maxima') {
                list_of_indices_geq_B_and_dots.push(voice_noterest_dots_content.indexOf(noterest));
                list_of_indices_geq_L.push(voice_noterest_dots_content.indexOf(noterest));
            }
        }

        var o, f, start_note, end_note, middle_notes, following_note;

        // Semibreves in between breves (or higher note values)
        if (tempus == 3) {
            //console.log("\nBREVE GEQ");
            //console.log(list_of_indices_geq_B_and_dots + "\n");
            if (!(list_of_indices_geq_B_and_dots.includes(0)) && list_of_indices_geq_B_and_dots.length != 0) {
                f = list_of_indices_geq_B_and_dots[0];
                middle_notes = voice_noterest_dots_content.slice(0,f);
                /*//DEBUG:
                var m = "";
                for (var midnote of middle_notes){
                    m += midnote.getAttribute('pname') + midnote.getAttribute('oct') + " " + midnote.getAttribute('dur') + ", ";
                }
                console.log("null, " + m + "null");
                */
                modification_semibreve_level(middle_notes);
            }

            for (var j = 0; j < list_of_indices_geq_B_and_dots.length-1; j++) {
                // Define the sequence of notes
                o = list_of_indices_geq_B_and_dots[j];
                f = list_of_indices_geq_B_and_dots[j+1];
                middle_notes = voice_noterest_dots_content.slice(o+1,f);
                /*//DEBUG:
                var m = "";
                for (var midnote of middle_notes){
                    m += midnote.getAttribute('pname') + midnote.getAttribute('oct') + " " + midnote.getAttribute('dur') + ", ";
                }
                console.log("null, " + m + "null");
                */
                modification_semibreve_level(middle_notes);
            }
        } else {
            // tempus = 2
        }

        // Breves in between longas (or higher note values)
        if (modusminor == 3) {
            //console.log("\nLONGA GEQ");
            //console.log(list_of_indices_geq_L + "\n");
            if (!(list_of_indices_geq_L.includes(0)) && list_of_indices_geq_L.lenght != 0) {
                start_note = null;
                f = list_of_indices_geq_L[0];
                end_note = voice_noterest_dots_content[f];
                try {
                    following_note = voice_noterest_dots_content[f+1];
                } catch(err) {
                    following_note = null;
                }
                middle_notes = voice_noterest_dots_content.slice(0,f);
                //DEBUG:
                var s = null;
                var e = end_note.getAttribute('pname') + end_note.getAttribute('oct') + " " + end_note.getAttribute('dur');
                var m = "";
                for (var midnote of middle_notes){
                    var attribs = midnote.getAttribute('pname') + midnote.getAttribute('oct') + " " + midnote.getAttribute('dur');
                    if (attribs == '0 null'){
                        m += midnote.tagName + ", ";
                    } else {
                        m += attribs + ", ";
                    }
                } console.log(s + ", " + m + e);

                breves_between_longas(start_note, middle_notes, end_note, following_note, tempus, note_durs, undotted_note_gain);
            }

            for (var j = 0; j < list_of_indices_geq_L.length-1; j++) {
                // Define the sequence of notes
                o = list_of_indices_geq_L[j];
                start_note = voice_noterest_dots_content[o];
                f = list_of_indices_geq_L[j+1];
                end_note = voice_noterest_dots_content[f];
                try {
                    following_note = voice_noterest_dots_content[f+1];
                } catch(err) {
                    following_note = null;
                }
                middle_notes = voice_noterest_dots_content.slice(o+1,f);
                //DEBUG:
                var s = start_note.getAttribute('pname') + start_note.getAttribute('oct') + " " + start_note.getAttribute('dur');
                var e = end_note.getAttribute('pname') + end_note.getAttribute('oct') + " " + end_note.getAttribute('dur');
                var m = "";
                for (var midnote of middle_notes){
                    var attribs = midnote.getAttribute('pname') + midnote.getAttribute('oct') + " " + midnote.getAttribute('dur');
                    if (attribs == '0 null'){
                        m += midnote.tagName + ", ";
                    } else {
                        m += attribs + ", ";
                    }
                } console.log(s + ", " + m + e);

                breves_between_longas(start_note, middle_notes, end_note, following_note, tempus, note_durs, undotted_note_gain);
            }

            // If the last note on the voice_noterest_dots_content isn't a longa (or maxima):
            var index_last_noterest = voice_noterest_dots_content.length - 1;
            if (!(list_of_indices_geq_L.includes(index_last_noterest))) {
                o = list_of_indices_geq_L[list_of_indices_geq_L.length - 1];
                start_note = voice_noterest_dots_content[o];
                end_note = null;
                following_note = null;
                middle_notes = voice_noterest_dots_content.slice(o+1,index_last_noterest+1);
                //DEBUG:
                var s = start_note.getAttribute('pname') + start_note.getAttribute('oct') + " " + start_note.getAttribute('dur');
                var e = null;
                var m = "";
                for (var midnote of middle_notes){
                    var attribs = midnote.getAttribute('pname') + midnote.getAttribute('oct') + " " + midnote.getAttribute('dur');
                    if (attribs == '0 null'){
                        m += midnote.tagName + ", ";
                    } else {
                        m += attribs + ", ";
                    }
                } console.log(s + ", " + m + e);

                breves_between_longas(start_note, middle_notes, end_note, following_note, tempus, note_durs, undotted_note_gain);
            }

        } else {
            // modusminor = 2
        }
    }

    replace_ligatures_by_brackets(quasiscore_mensural_doc);
    replace_maximas_by_duplexlongas(quasiscore_mensural_doc);

    return quasiscore_mensural_doc;
};

exports.lining_up = lining_up;
