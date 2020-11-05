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

// Functions about preceding and following note/rest elements
function get_preceding_noterest(target_element) {
    var preceding_element = target_element.previousSibling;
    while (preceding_element.tagName != 'note' && preceding_element.tagName != 'rest'){
        preceding_element = preceding_element.previousSibling;
    } return preceding_element;
}

function get_following_noterest(target_element) {
    var following_element = target_element.nextSibling;
    while (following_element.tagName != 'note' && following_element.tagName != 'rest'){
        following_element = following_element.nextSibling;
    } return following_element;
}

// Functions related to dots
function followed_by_dot(target_element) {
    // Boolean function evaluating the condition 'followed by dot'
    var next_element = target_element.nextSibling;
    if (next_element != null && next_element.tagName == 'dot') {
        return true;
    } else {
        return false;
    }
}

function find_first_dotted_note(sequence) {
    // Returns the first note element in a sequence which is followed by a dot
    var first_dotted_note;
    for (var note of sequence) {
        if (followed_by_dot(note)){
            first_dotted_note = note;
            break;
        }
    } return first_dotted_note;
}

function dot_of_imperfection(sequence, note_durs, undotted_note_gain, tempus, count_B) {
    var first_dotted_note = find_first_dotted_note(sequence);
    if (first_dotted_note == null) {return false;}

    // We have to divide the sequence of middle_notes in 2 parts: before the dot, and after the dot.
    // Then count the number of breves in each of the two parts to discover if this 'dot' is a
    // 'dot of division' or a 'dot of addition'
    var part1_middle_notes = sequence.slice(0, sequence.indexOf(first_dotted_note) + 1);

    // Breves BEFORE the first dot
    console.log("Part 1 - preceding the dot:");
    var sb_counter1 = counting_semibreves(part1_middle_notes, note_durs, undotted_note_gain);
    var part1_count_B = sb_counter1 / tempus;
    var status = false;

    // If there is just one breve before the first dot
    // And two/three breves between the longs (only case where a dot
    // of imperfection is used to change the default interpretation)
    if (part1_count_B == 1 && (count_B == 2 || count_B == 3)) {
        var dur_before_dot = first_dotted_note.getAttribute('dur');
        var dur_after_dot = get_following_noterest(first_dotted_note).getAttribute('dur');
        // Muris: But if the dot is placed between two semibreves,
        // it is attributed with division of tempus.
        // Checking that this is not the case, then this would be a dot of imperfection
        if (dur_before_dot != 'semibrevis' || dur_after_dot != 'semibrevis') {
            status = true;
            console.log("\nDot of Imperfection");
        }
    } return status;
}

// Auxiliary function
function has_been_modified(note) {
    return (note.hasAttribute('num') && note.hasAttribute('numbase'));
}

// Functions related to the counting of semibreves in a sequence of notes
function counting_semibreves(sequence_of_notes, note_durs, undotted_note_gain) {
    var sb_counter, note, dur, index, gain, ratio;
    sb_counter = 0;
    console.log('@dur\t\tCounter (Sb)\tAccumulator (Sb)');
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
        console.log(dur + Array(10-dur.length).join(' ') + "\t" + gain + "\t\t" + sb_counter);
    }
    return sb_counter;
}

// Modification function at the long-breve level:
function breves_between_longas(start_note, middle_notes, end_note, following_note, tempus, note_durs, undotted_note_gain, modusminor) {
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
    console.log("TOTAL (Sb): " + sb_counter);
    var count_B = sb_counter / tempus;
    console.log("TOTAL (B):  " + count_B);
    console.log();

    if (modusminor == 3){
        modification(count_B, start_note, sequence_of_middle_notes, end_note, following_note, 'brevis', 'longa', note_durs, undotted_note_gain, tempus);
    } // Else (@modusminor = 2), no modification on the long-breve level is needed
}

function modification(counter, start_note, middle_notes, end_note, following_note, short_note, long_note, note_durs, undotted_note_gain, tempus) {
    // Given the total amount of "breves" in-between the "longs", see if they can be arranged in groups of 3
    // According to how many breves remain ungrouped (1, 2 or 0), modify the duration of the appropriate note of the sequence ('imperfection', 'alteration', no-modification)
    var last_middle_note, last_uncolored_note;

    switch(counter % 3) {

        case 1: // 1 breve left out:

            if (start_note != null && start_note.tagName == 'note' && start_note.getAttribute('dur') == long_note && !(has_been_modified(start_note)) && !(followed_by_dot(start_note))) {
            // Default Case
                // Imperfection a.p.p.
                console.log("Default Case:\tImperfection a.p.p.\n");
                start_note.setAttribute('dur.quality', 'imperfecta');
                start_note.setAttribute('num', '3');
                start_note.setAttribute('numbase', '2');
            }

            else if (end_note != null && end_note.tagName == 'note' && end_note.getAttribute('dur') == long_note && !(has_been_modified(end_note)) && !(followed_by_dot(end_note))) {
            // Exception Case
                // Imperfection a.p.a.
                console.log("Alternative Case:  Imperfection a.p.a.\n");
                end_note.setAttribute('dur.quality', 'imperfecta');
                end_note.setAttribute('num', '3');
                end_note.setAttribute('numbase', '2');
                // Raise a warning when this imperfect note is followed by a perfect note (contradiction with the first rule)
                if (following_note != null && following_note.getAttribute('dur') == long_note) {
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
            // One of he possibilities when 2 breves are left out, is alteration
            // One must alter the last (uncolored) note from the middle_notes of the sequence
            last_middle_note = middle_notes[middle_notes.length - 1];
            // If the last note is uncolored, it is a candidate for alteration (given that it is a note and not a rest, and that it is a breve and not a smaller value)
            last_uncolored_note = last_middle_note;
            // But if it is colored, we need to find the last "uncolored" note, as this is the one that would be altered
            while (last_uncolored_note.hasAttribute('colored')){
                last_uncolored_note = get_preceding_noterest(last_uncolored_note);
            }

            if (counter == 2) { // 2 exact breves between the longs

                if (last_uncolored_note.tagName == 'note' && last_uncolored_note.getAttribute('dur') == short_note && !(has_been_modified(last_uncolored_note))) {
                    // Exception (dot of imperfection)
                    if (dot_of_imperfection(middle_notes, note_durs, undotted_note_gain, tempus, counter)) {
                        console.log("Alternative Case:  Imperfection a.p.p. & Imperfection a.p.a.\n");
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
                    // Default case: Alteration
                    console.log("Default Case:\tAlteration\n");
                    last_uncolored_note.setAttribute('dur.quality', 'altera');
                    last_uncolored_note.setAttribute('num', '1');
                    last_uncolored_note.setAttribute('numbase', '2');
                }

                else if ((start_note != null && start_note.tagName == 'note' && start_note.getAttribute('dur') == long_note && !(has_been_modified(start_note)) && !(followed_by_dot(start_note))) && (end_note != null && end_note.tagName == 'note' && end_note.getAttribute('dur') == long_note && !(has_been_modified(end_note)) && !(followed_by_dot(end_note)))) {
                // Exception Case
                    console.log("Alternative Case:  Imperfection a.p.p. & Imperfection a.p.a.\n");
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

            } else { // 5, 8, 11, 14, 17, 20, ... breves between the longs
                console.log(last_uncolored_note);
                // Default Case: Check the conditions to apply the 'default interpretation', which implies imperfection a.p.a.

                if ((start_note != null && start_note.tagName == 'note' && start_note.getAttribute('dur') == long_note && !(has_been_modified(start_note)) && !(followed_by_dot(start_note))) && (end_note != null && end_note.tagName == 'note' && end_note.getAttribute('dur') == long_note && !(has_been_modified(end_note)) && !(followed_by_dot(end_note)))) {
                    // Check if imperfection a.p.a. enters or not in conflict with rule # 1.
                    if (following_note != null && following_note.getAttribute('dur') == long_note) {
                        // If it does, imperfection a.p.a. is discarded, except if the "alternative interpretation" (the 'Exception Case') is also forbidden
                        if (last_uncolored_note.tagName == 'note' && last_uncolored_note.getAttribute('dur') == short_note && !(has_been_modified(last_uncolored_note))) {
                        // Exception Case
                            // Alteration
                            console.log("Alternative Case:  Alteration\n");
                            last_uncolored_note.setAttribute('dur.quality', 'altera');
                            last_uncolored_note.setAttribute('num', '1');
                            last_uncolored_note.setAttribute('numbase', '2');
                        }
                        else {
                        // Default + Warning Case
                            console.log("Default Case:\tImperfection a.p.p. & Imperfection a.p.a.\n");
                            // If the "alternative interpretation" is forbidden, and imperfection a.p.a. was discarded just because it entered in conflict with rule # 1
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
                        console.log("Default Case:\tImperfection a.p.p. & Imperfection a.p.a.\n");
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

                else if (last_uncolored_note.tagName == 'note' && last_uncolored_note.getAttribute('dur') == short_note && !(has_been_modified(last_uncolored_note))) {
                // Exception Case
                    // Alteration
                    console.log("Alternative Case:  Alteration\n");
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

            if (counter == 0) {
                // When 0 breves left out, no modifications to perform
                console.log("Default Case:\tNo modifications\n");
            }

            else if (counter == 3) {
                // One of the possibilities when 3 breves are left out, involves alteration
                // One must alter the last (uncolored) note from the middle_notes of the sequence
                last_middle_note = middle_notes[middle_notes.length - 1];
                // If the last note is uncolored, it is a candidate for alteration (given that it is a note and not a rest, and that it is a breve and not a smaller value)
                last_uncolored_note = last_middle_note;
                // But if it is colored, we need to find the last "uncolored" note, as this is the one that would be altered
                while (last_uncolored_note.hasAttribute('colored')) {
                    last_uncolored_note = get_preceding_noterest(last_uncolored_note);
                }

                // When 3 breves left out, no modifications to perform,
                // Except in the presence of a dot of imperfection
                if (dot_of_imperfection(middle_notes, note_durs, undotted_note_gain, tempus, counter)) {
                // Exception: dot of imperfection
                    console.log("Alternative Case:\tImperfection a.p.p. & Alteration\n");
                    // Imperfection a.p.p.
                    start_note.setAttribute('dur.quality', 'imperfecta');
                    start_note.setAttribute('num', '3');
                    start_note.setAttribute('numbase', '2');
                    // Alteration
                    last_uncolored_note.setAttribute('dur.quality', 'altera');
                    last_uncolored_note.setAttribute('num', '1');
                    last_uncolored_note.setAttribute('numbase', '2');
                } else {
                // Default Case
                    // When 3 breves left out, no modifications to perform
                    console.log("Default Case:\tNo modifications\n");
                }
            }

            else {
                // One of the possibilities when 6,9,12,etc. breves are left out, involves alteration
                // One must alter the last (uncolored) note from the middle_notes of the sequence
                last_middle_note = middle_notes[middle_notes.length - 1];
                // If the last note is uncolored, it is a candidate for alteration (given that it is a note and not a rest, and that it is a breve and not a smaller value)
                last_uncolored_note = last_middle_note;
                // But if it is colored, we need to find the last "uncolored" note, as this is the one that would be altered
                while (last_uncolored_note.hasAttribute('colored')) {
                    last_uncolored_note = get_preceding_noterest(last_uncolored_note);
                }

                if ((start_note != null && start_note.tagName == 'note' && start_note.getAttribute('dur') == long_note && !(has_been_modified(start_note)) && !(followed_by_dot(start_note))) && (last_uncolored_note.tagName == 'note' && last_uncolored_note.getAttribute('dur') == short_note && !(has_been_modified(last_uncolored_note)))) {
                // Default Case:
                    console.log("Default Case:\tImperfection a.p.p. & Alteration\n");
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
                    console.log("Alternative Case:  No modifications\n");
                    // Start note remains perfect
                }
            } break;
    }
}

// Modification functions at the breve-semibreve level:
function modification_semibreve_level(middle_notes, tempus) {
    if (tempus == 2) {
        two_semibreves_per_breve(middle_notes);
    } else if (tempus == 3) {
        three_semibreves_per_breve(middle_notes);
    }
}

function two_semibreves_per_breve(middle_notes) {
    var note;

    switch(middle_notes.length) {

        case 1: // If there is 1 semibreve:
            // Mistake: this shouldn't happen in Ars antiqua
            console.log("MISTAKE: 1 semibreve standing alone (this is not proper of Ars antiqua)");
            break;

        case 2: // If there are 2 semibreves:
            //console.log("Semibreve interpretation: two equal semibreves");
            break;

        default: // For more than two semibreves:
            for (note of middle_notes) {
                note.setAttribute('num', middle_notes.length);
                note.setAttribute('numbase', '2');
            } //console.log("Semibreve interpretation: " + middle_notes.length + " in the place of 2");
    }
}

function three_semibreves_per_breve(middle_notes) {
    var note, note1, note2;

    switch(middle_notes.length) {

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
                //console.log("Semibreve interpretation: major-minor pair");
            } else {
            // On the other hand, if there is no additional markings, we have a minor-major pair of semibreves (default case)
                note1.setAttribute('dur.quality', 'minor');
                note2.setAttribute('dur.quality', 'maior');
                note2.setAttribute('num', '1');
                note2.setAttribute('numbase', '2');
                //console.log("Semibreve interpretation: minor-major pair");
            } break;

        case 3: // If there are 3 semibreves:
            // All of them are minor (1/3 of breve)
            for (note of middle_notes) {
                note.setAttribute('dur.quality', 'minor');
            } //console.log("Semibreve interpretation: three minor semibreves");
            break;

        default: // For more than three semibreves:
            for (note of middle_notes) {
                note.setAttribute('num', middle_notes.length);
                note.setAttribute('numbase', '3');
            } //console.log("Semibreve interpretation: " + middle_notes.length + " in the place of 3");
    }
}

// Post-processing functions
function replace_maximas_by_duplexlongas(meiDoc){
    const notes = Array.from(meiDoc.getElementsByTagName('note'));
    for (var note of notes) {
        if (note.getAttribute('dur') == 'maxima') {
            // Turn maximas into duplex longas
            note.setAttribute('dur', 'longa');
            note.setAttribute('dur.quality', 'duplex');
            // Use (for now) the num and numbase attributes to make the longa 'duplex'
            note.setAttribute('num', '1');
            note.setAttribute('numbase', '2');
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
        var staffDef_mensur = stavesDef[i].getElementsByTagName('mensur')[0];
        var staff = staves[i];

        // Getting the mensuration information of the voice (prolatio is irrelevant in Ars antiqua)
        var tempus = staffDef_mensur.getAttribute('tempus');
        var modusminor = staffDef_mensur.getAttribute('modusminor');

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
                //console.log("Got a ligature!");
                // The Group_Begin and Group_End elements introduced here are just place holders, a way to indicate that the
                // set of notes between these two elements belong to the same grouping
                //(Maybe I can use just a new element <dot> for that? These elments are not getting exported to the output file, so it should be fine.)
                voice_noterest_dots_content.push(quasiscore_mensural_doc.createElementNS('http://www.music-encoding.org/ns/mei', 'Group_Begin'));
                for (var child of element.children){
                    if (child.tagName == 'note' || child.tagName == 'rest') {
                        voice_noterest_dots_content.push(child);
                    } else if (child.tagName == 'choice') {
                        // the relevant <note> and <rest> elements can be contained
                        // within a <corr> element within a <ligature> due to editorial
                        // corrections of parts of the ligature
                        var corr = child.getElementsByTagName('corr')[0];
                        for (var greatgrandchild of corr.children) {
                            if (greatgrandchild.tagName == 'note' || greatgrandchild.tagName == 'rest') {
                                voice_noterest_dots_content.push(greatgrandchild);
                            } else {
                                console.log("This child of corr (within the choice tag in a ligature) is not a note/rest:");
                                console.log(greatgrandchild);
                                console.log("It is a " + greatgrandchild.tagName);
                            }
                        }
                    } else {
                        console.log("This child of ligature is not a note/rest/choice:");
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
                console.log("Unexpected tagnme : " + name + "\n(not a note, rest, dot, ligature, or choice)\n");
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

        // PROCESSING OF SEMIBREVES (REGARDLESS OF THE @TEMPUS)
        // SEQUENCES OF SEMIBREVES DELIMITED BY BREVES (OR HIGHER NOTE VALUES)

        //console.log("\nBREVE GEQ");
        //console.log(list_of_indices_geq_B_and_dots + "\n");
        if (!(list_of_indices_geq_B_and_dots.includes(0)) && list_of_indices_geq_B_and_dots.length != 0) {
            f = list_of_indices_geq_B_and_dots[0];
            middle_notes = voice_noterest_dots_content.slice(0,f);
            /*//DEBUG:
            var m = "";
            for (var midnote of middle_notes){
                m += midnote.getAttribute('pname') + midnote.getAttribute('oct') + " " + midnote.getAttribute('dur') + ", ";
            } console.log("\nDelimited Sequence of Semibreves: null, " + m + "null");*/
            modification_semibreve_level(middle_notes, tempus);
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
            } console.log("\nDelimited Sequence of Semibreves: null, " + m + "null");*/
            modification_semibreve_level(middle_notes, tempus);
        }


        // PROCESSING OF BREVES AND LONGS (REGARDLESS OF THE @MODUSMINOR)
        // SEQUENCES OF BREVES DELIMITED BY LONGS (OR HIGHER NOTE VALUES)

        //console.log("\nLONGA GEQ");
        //console.log(list_of_indices_geq_L + "\n");

        // Empty list (no 'longas' or 'maximas' at all in the voice)
        if(list_of_indices_geq_L.length == 0) {
            // Define the sequence of notes
            start_note = null;
            end_note = null;
            middle_notes = voice_noterest_dots_content.slice(0, voice_noterest_dots_content.length);

            //DEBUG:
            var s = null;
            var e = null;
            var m = "";
            for (var midnote of middle_notes){
                var attribs = midnote.getAttribute('pname') + midnote.getAttribute('oct') + " " + midnote.getAttribute('dur');
                if (attribs == '0 null'){
                    m += midnote.tagName + ", ";
                } else {
                    m += attribs + ", ";
                }
            } console.log("Delimited Sequence of Breves: " + s + ", " + m + e);
            
            breves_between_longas(start_note, middle_notes, end_note, following_note, tempus, note_durs, undotted_note_gain, modusminor);
        }

        // At least one long or maxima:
        else {

            if (!(list_of_indices_geq_L.includes(0))) {
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
                } console.log("Delimited Sequence of Breves: " + s + ", " + m + e);
                breves_between_longas(start_note, middle_notes, end_note, following_note, tempus, note_durs, undotted_note_gain, modusminor);
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
                } console.log("Delimited Sequence of Breves: " + s + ", " + m + e);
                breves_between_longas(start_note, middle_notes, end_note, following_note, tempus, note_durs, undotted_note_gain, modusminor);
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
                } console.log("Delimited Sequence of Breves: " + s + ", " + m + e);
                breves_between_longas(start_note, middle_notes, end_note, following_note, tempus, note_durs, undotted_note_gain, modusminor);
            }
        }

    }

    replace_maximas_by_duplexlongas(quasiscore_mensural_doc);

    return quasiscore_mensural_doc;
};

exports.lining_up = lining_up;
