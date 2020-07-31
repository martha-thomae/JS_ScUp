/*
    DURATION FINDER MODULE FOR ARS ANTIQUA
    Figure out the duration of the notes in the individual <staff> elements.
*/
const Fraction = require('fraction.js');

// Functions about preceeding and suceeding elements
function get_next_element(target_element) {
    return target_element.nextSibling;
}

function get_preceding_noterest(target_element) {
    var preceding_element = target_element.previousSibling;
    while (preceeding_element.tagName != 'note' && preceeding_element.tagName != 'rest'){
        preceding_element = preceeding_element.previousSibling;
    } return preceeding_element;
}

// Functions related to dots
function followed_by_dot(target_element) {
    var next_element = get_next_element(target_element);
    if (next_element != null && next_element.tagName == 'dot') {
        return true;
    } else {
        return false;
    }
}

function find_first_dotted_note(sequence_of_notes) {
    //Return the index of the first dotted note in a sequence of notes
    var note_counter = -1;
    var first_dotted_note_index = -1;
    for (var noterest of sequence_of_notes) {
        note_counter += 1;
        if (noterest != null && followed_by_dot(noterest)) {
            first_dotted_note_index = note_counter;
            break;
        }
    }
    return first_dotted_note_index;
}

// Functions related to the counting of minims in a sequence of notes
function counting_minims_in_an_undotted_sequence(sequence_of_notes, note_durs, undotted_note_gain) {
    var minim_counter, note, dur, index, gain, ratio;
    minim_counter = 0;
    console.log('@dur\t\tCounter (m)\tAccumulator (m)');
    for (note of sequence_of_notes) {
        dur = note.getAttribute('dur');
        try {
            index = note_durs.indexOf(dur);
        } catch(err) {
            console.log("MISTAKE\nNote/Rest element not considered: " + note + ", with a duration @dur = " + dur);
        }
        gain = undotted_note_gain[index];
        if (note.hasAttribute('num') && note.hasAttribute('numbase')) {
            ratio = new Fraction([note.getAttribute('numbase'), note.getAttribute('num')]);
            gain = ratio.mul(gain);
        }
        minim_counter += gain;
        console.log(dur + Array(10-dur.length).join(' ') + "\t" + gain + "\t\t" + minim_counter);
    }
    return minim_counter;
}

function counting_minims(sequence_of_notes, note_durs, undotted_note_gain, dotted_note_gain, prolatio = null, tempus = null, modusminor = null, modusmaior = null) {
    var minim_counter, note, dur, index, gain, ratio;
    minim_counter = 0;
    console.log('@dur\t\tCounter (m)\tAccumulator (m)');
    for (note of sequence_of_notes) {
        dur = note.getAttribute('dur');
        try {
            index = note_durs.indexOf(dur);
        } catch(err) {
            console.log("MISTAKE\nNote/Rest element not considered: " + note + ", with a duration @dur = " + dur);
        }
        // Defining the gain in case of dotted or undotted notes:
        if (followed_by_dot(note)) {
            gain = dotted_note_gain[index];
            // This dot could be either of perfection or of augmentation.
            // In the case of a dot of perfection there is no need to do anything, as the note value is kept perfect.
            // In the case of a dot of augmentation, the note value should be changed from imperfect to perfect.
            if ((index == 4 && prolatio == 2) || (index == 5 && tempus == 2) || (index == 6 && modusminor == 2) || (index == 7 && modusmaior == 2) || (index < 4)) {
            //// NOTE TO SELF: ////
            //////// Right now index == 1, is the index of prolatio. ////////
            //////// If later I put prolatio in a higher index like n, ////////
            //////// the information in this if should change accordingly. ////////
                // Case: Dot of Augmentation
                // Encode the augmentation dot
                dot_element = get_next_element(note);
                dot_element.setAttribute('form', 'aug');
                // Perform the augmentation, multiply the note value by 1.5
                note.setAttribute('num', '2');
                note.setAttribute('numbase', '3');
                // Thus the default "imperfect" note, becomes a perfect note
                note.setAttribute('dur.quality', 'perfecta');
            }
        } else {
            gain = undotted_note_gain[index];
            if (note.hasAttribute('num') && note.hasAttribute('numbase')) {
                ratio = new Fraction([note.getAttribute('numbase'), note.getAttribute('num')]);
                gain = ratio.mul(gain);
            }
        }
        minim_counter += gain;
        console.log(dur + Array(10-dur.length).join(' ') + "\t" + gain + "\t\t" + minim_counter);
    }
    return minim_counter;
}

function has_been_modified(note) {
    return (note.hasAttribute('num') && note.hasAttribute('numbase'));
}

// Given the total amount of "breves" in-between the "longs", see if they can be arranged in groups of 3
// According to how many breves remain ungrouped (1, 2 or 0), modifiy the duration of the appropriate note of the sequence ('imperfection', 'alteration', no-modification)
function modification(counter, start_note, middle_notes, end_note, following_note, short_note, long_note) {
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
                // Default case
                    // Alteration
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
                        // If it does, imperfection a.p.a. is discarded, except if the "alterantive interpretation" (the 'Exception Case') is also forbidden
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

            if (counter <= 3) {
                // When 0 or 3 breves left out, no modifications to perform
                console.log("Default Case:\tNo modifications\n");
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

function minims_between_semibreves(start_note, middle_notes, end_note, following_note, note_durs, undotted_note_gain, dotted_note_gain) {
    var no_division_dot_flag = true;    // Default value
    var sequence = [start_note].concat(middle_notes);
    var first_dotted_note_index = find_first_dotted_note(sequence);
    var minim_counter, dot_element, first_dotted_note, part1_middle_notes, part2_middle_notes, minim_counter1, minim_counter2, dur, first_dotted_note_default_gain;

    // If first_dotted_note_index == -1, then there is no dot in the sequence at all
    if (first_dotted_note_index == -1) {
        // Getting the total of minims in the middle_notes
        minim_counter = counting_minims_in_an_undotted_sequence(middle_notes, note_durs, undotted_note_gain);
        console.log('No-dot\n');
    }

    // If first_dotted_note_index == 0, we have a dot at the start_note, which will make this note 'perfect' --> DOT OF PERFECTION. The other dots must be of augmentation (or perfection dots).
    else if (first_dotted_note_index == 0) {
        // DOT OF PERFECTION
        dot_element = get_next_element(start_note);
        dot_element.setAttribute('form', 'perf');
        // console.log('Perfection\n');
        // Getting the total of minims in the middle_notes
        minim_counter = counting_minims(middle_notes, note_durs, undotted_note_gain, dotted_note_gain);
    }

    //Otherwise, if the dot is in any middle note:
    else {
        first_dotted_note = sequence[first_dotted_note_index];////////////////////////////////////////
        dot_element = get_next_element(first_dotted_note);
        if (dot_element.hasAttribute('form') && dot_element.getAttribute('form') == 'aug') {
            // If the first dot is an already known dot of augmentation
            minim_counter = counting_minims(middle_notes, note_durs, undotted_note_gain, dotted_note_gain);
        } else {
            // We have to divide the sequence of middle_notes in 2 parts: before the dot, and after the dot.
            // Then count the number of minims in each of the two parts to discover if this 'dot' is a
            // 'dot of division' or a 'dot of addition'
            part1_middle_notes = sequence.slice(1, first_dotted_note_index + 1);
            part2_middle_notes = sequence.slice(first_dotted_note_index + 1, sequence.length);

            // Minims BEFORE the first dot
            minim_counter1 = counting_minims_in_an_undotted_sequence(part1_middle_notes, note_durs, undotted_note_gain);

            // The individual value of the first dotted note (the last note in the sequence preceding the dot)
            dur = first_dotted_note.getAttribute('dur');
            first_dotted_note_default_gain = undotted_note_gain[note_durs.indexOf(dur)];
            // console.log("Notes in the Sequence preceeding this dot " + part1_middle_notes);
            // console.log("FIRST DOTTED NOTE: " + first_dotted_note + ", with duration of: " + dur + ", which gain is: " + first_dotted_note_default_gain);

            // Taking the second part of the sequence of the middle notes (part2_middle_notes) into account
            // Count the number of minims in the second part of the sequence of middle_notes
            minim_counter2 = counting_minims(part2_middle_notes, note_durs, undotted_note_gain, dotted_note_gain);


            // If there is just one minim before the first dot
            if( minim_counter1 == 1) {
                // Two possibilities: dot of division / dot of augmentation
                // We have to use the results of the second part of the middle notes (part2_middle_notes) to figure this out

                // If the number of minims after the dot is an integer number
                if (minim_counter2 == Math.floor(minim_counter2)) {
                    // DOT OF DIVISION
                    no_division_dot_flag = false;
                    // console.log('Imperfection app\n');
                    dot_element.setAttribute('form', 'div');
                    minim_counter = minim_counter1 + minim_counter2;
                    // Total of minims in the middle_notes
                    modification(minim_counter1, start_note, part1_middle_notes, null, null, 'minima', 'semibrevis');
                    modification(minim_counter2, null, part2_middle_notes, end_note, following_note, 'minima', 'semibrevis');
                }
                else {
                    // DOT OF AUGMENTATION
                    // console.log('Augmentation_typeI\n');
                    dot_element.setAttribute('form', 'aug');
                    first_dotted_note.setAttribute('dur.quality', 'perfecta');
                    first_dotted_note.setAttribute('num', '2');
                    first_dotted_note.setAttribute('numbase', '3');
                    minim_counter = minim_counter1 + (0.5 * first_dotted_note_default_gain) + minim_counter2;
                }
            }

            // If there is more than one minim before the first dot, it is impossible for that dot to be a 'dot of division'
            else {
                // DOT OF AUGMENTATION (or a dot of perfection at smaller note level)
                if (dot_element.hasAttribute('form') && dot_element.getAttribute('form') == 'perf') {
                    minim_counter = counting_minims(middle_notes, note_durs, undotted_note_gain, dotted_note_gain);
                } else {
                    // console.log('Augmentation_def\n');
                    dot_element.setAttribute('form', 'aug');
                    first_dotted_note.setAttribute('dur.quality', 'perfecta');
                    first_dotted_note.setAttribute('num', '2');
                    first_dotted_note.setAttribute('numbase', '3');
                    minim_counter = minim_counter1 + (0.5 * first_dotted_note_default_gain) + minim_counter2;
                }
            }
        }
    }

    if (no_division_dot_flag) {
        // Checking that the sequence of notes is fine, and then calling the modification function
        if(minim_counter == Math.floor(minim_counter)) {
            // console.log("GOOD");
        } else {
            console.log("BAD! Not an integer number of Minimas!");
            console.log(([start_note].concat(middle_notes)).concat(end_note));
            console.log("Minimas: " + minim_counter);
        }
        // Given the total amount of minims in-between the "semibreves", see if they can be arranged in groups of 3
        // According to how many minims remain ungrouped (1, 2 or 0), modifiy the duration of the appropriate note of the sequence ('imperfection', 'alteration', no-modification)
        modification(minim_counter, start_note, middle_notes, end_note, following_note, 'minima', 'semibrevis');
    }
}

function sb_between_breves(start_note, middle_notes, end_note, following_note, prolatio, note_durs, undotted_note_gain, dotted_note_gain) {
    var no_division_dot_flag = true;    // Default value
    var sequence = [start_note].concat(middle_notes);
    var first_dotted_note_index = find_first_dotted_note(sequence);
    var dur, minim_counter, count_Sb, dot_element, part1_middle_notes, part2_middle_notes, minim_counter1, minim_counter2, part1_count_Sb, part2_count_Sb;
    var first_dotted_note, first_dotted_note_default_gain;

    // I have already taken into account that the minim could be dotted (and smaller values?),
    // the new note that could be dotted is the semibrevis. SO:

    // If first_dotted_note_index == -1, then there is no dot in the sequence at all
    if (first_dotted_note_index == -1) {
        // Getting the total of semibreves in the middle_notes
        minim_counter = counting_minims_in_an_undotted_sequence(middle_notes, note_durs, undotted_note_gain);
        count_Sb = minim_counter / (prolatio);
        // console.log('No-dot\n');
    }

    // If first_dotted_note_index == 0, we have a dot at the start_note, which will make this note 'perfect' --> DOT OF PERFECTION. The other dots must be of augmentation (or perfection dots).
    else if (first_dotted_note_index == 0) {
        // DOT OF PERFECTION
        dot_element = get_next_element(start_note);
        dot_element.setAttribute('form', 'perf');
        // console.log('Perfection\n');
        // Getting the total of semibreves in the middle_notes
        minim_counter = counting_minims(middle_notes, note_durs, undotted_note_gain, dotted_note_gain, prolatio);
        count_Sb = minim_counter / (prolatio);
    }

    // Otherwise, if the dot is in any middle note:
    else {
        first_dotted_note = sequence[first_dotted_note_index];////////////////////////////////////////
        dot_element = get_next_element(first_dotted_note);
        if (dot_element.hasAttribute('form') && dot_element.getAttribute('form') == 'aug') {
            // If the first dot is an already known dot of augmentation
            minim_counter = counting_minims(middle_notes, note_durs, undotted_note_gain, dotted_note_gain, prolatio);
            count_Sb = minim_counter / (prolatio);
        } else {
            // We have to divide the sequence of middle_notes in 2 parts: before the dot, and after the dot.
            // Then count the number of semibreves in each of the two parts to discover if this 'dot' is a
            // 'dot of division' or a 'dot of addition'
            part1_middle_notes = sequence.slice(1, first_dotted_note_index + 1);
            part2_middle_notes = sequence.slice(first_dotted_note_index + 1, sequence.length);

            // Semibreves BEFORE the first dot
            minim_counter1 = counting_minims_in_an_undotted_sequence(part1_middle_notes, note_durs, undotted_note_gain);
            part1_count_Sb = minim_counter1 / prolatio;

            // The individual value of the first dotted note (the last note in the sequence preceding the dot)
            dur = first_dotted_note.getAttribute('dur');
            first_dotted_note_default_gain = undotted_note_gain[note_durs.indexOf(dur)];
            // console.log("Notes in the Sequence preceeding this dot " + part1_middle_notes);
            // console.log("FIRST DOTTED NOTE: " + str(first_dotted_note) + ", with duration of: " + dur + ", which gain is: " + str(first_dotted_note_default_gain));

            // Taking the second part of the sequence of the middle notes (part2_middle_notes) into account
            // Count the number of semibreves in the second part of the sequence of middle_notes
            minim_counter2 = counting_minims(part2_middle_notes, note_durs, undotted_note_gain, dotted_note_gain, prolatio);
            part2_count_Sb = minim_counter2 / prolatio;


            // If there is just one semibreve before the first dot
            if (part1_count_Sb == 1) {
                // Two possibilities: dot of division / dot of augmentation
                // We have to use the results of the second part of the middle notes (part2_middle_notes) to figure this out

                // If the number of semibreves after the dot is an integer number
                if (part2_count_Sb == Math.floor(part2_count_Sb)) {
                    // DOT OF DIVISION
                    no_division_dot_flag = false;
                    // console.log('Imperfection app\n');
                    dot_element.setAttribute('form', 'div');
                    minim_counter = minim_counter1 + minim_counter2;
                    // Total of semibreves in the middle_notes
                    modification(part1_count_Sb, start_note, part1_middle_notes, null, null, 'semibrevis', 'brevis');
                    modification(part2_count_Sb, null, part2_middle_notes, end_note, following_note, 'semibrevis', 'brevis');
                } else {
                    // DOT OF AUGMENTATION
                    // console.log('Augmentation_typeI\n');
                    dot_element.setAttribute('form', 'aug');
                    first_dotted_note.setAttribute('dur.quality', 'perfecta');
                    first_dotted_note.setAttribute('num', '2');
                    first_dotted_note.setAttribute('numbase', '3');
                    minim_counter = minim_counter1 + (0.5 * first_dotted_note_default_gain) + minim_counter2;
                }
            }

            // If there is more than one semibreve before the first dot, it is impossible for that dot to be a 'dot of division'
            else {
                // DOT OF AUGMENTATION (or a dot of perfection at smaller note level)
                if (dot_element.hasAttribute('form') && dot_element.getAttribute('form') == 'perf') {
                    minim_counter = counting_minims(middle_notes, note_durs, undotted_note_gain, dotted_note_gain, prolatio);
                }
                else {
                    // console.log('Augmentation_def\n');
                    dot_element.setAttribute('form', 'aug');
                    first_dotted_note.setAttribute('dur.quality', 'perfecta');
                    first_dotted_note.setAttribute('num', '2');
                    first_dotted_note.setAttribute('numbase', '3');
                    minim_counter = minim_counter1 + (0.5 * first_dotted_note_default_gain) + minim_counter2;
                }
            }

            // Total of semibreves in the middle_notes
            count_Sb = minim_counter / prolatio;
        }
    }

    if (no_division_dot_flag) {
        // Checking that the sequence of notes is fine, and then calling the modification function
        if (minim_counter % prolatio == 0) {
            // console.log("GOOD");
        } else {
            console.log("BAD! THE DIVISION IS NOT AN INTEGER NUMBER - not an integer number of Semibreves!");
            console.log(([start_note].concat(middle_notes)).concat(end_note));
            console.log("Semibreves: " + (minim_counter / prolatio));
        }
        // Given the total amount of semibreves in-between the "breves", see if they can be arranged in groups of 3
        // According to how many semibreves remain ungrouped (1, 2 or 0), modifiy the duration of the appropriate note of the sequence ('imperfection', 'alteration', no-modification)
        modification(count_Sb, start_note, middle_notes, end_note, following_note, 'semibrevis', 'brevis');
    }
}

function breves_between_longas(start_note, middle_notes, end_note, following_note, prolatio, tempus, note_durs, undotted_note_gain, dotted_note_gain) {
    no_division_dot_flag = true;    // Default value
    var sequence = [start_note].concat(middle_notes);
    var first_dotted_note_index = find_first_dotted_note(sequence);
    var dur, minim_counter, count_B, dot_element, part1_middle_notes, part2_middle_notes, minim_counter1, minim_counter2, part1_count_B, part2_count_B;
    var first_dotted_note, first_dotted_note_default_gain;

    // If first_dotted_note_index == -1, then there is no dot in the sequence at all
    if (first_dotted_note_index == -1) {
        // Total of breves in the middle_notes
        minim_counter = counting_minims_in_an_undotted_sequence(middle_notes, note_durs, undotted_note_gain);
        count_B = minim_counter / (tempus * prolatio);
        // console.log('No-dot\n');
    }

    // If first_dotted_note_index == 0, we have a dot at the start_note, which will make this note 'perfect' --> DOT OF PERFECTION. The other dots must be of augmentation (or perfection dots).
    else if (first_dotted_note_index == 0) {
        // DOT OF PERFECTION
        dot_element = get_next_element(start_note);
        dot_element.setAttribute('form', 'perf');
        // console.log('Perfection\n');
        // Total of breves in the middle_notes
        minim_counter = counting_minims(middle_notes, note_durs, undotted_note_gain, dotted_note_gain, prolatio, tempus);
        count_B = minim_counter / (tempus * prolatio);
    }

    // Otherwise, if the dot is in any middle note:
    else {
        first_dotted_note = sequence[first_dotted_note_index];////////////////////////////////////////
        dot_element = get_next_element(first_dotted_note);
        if (dot_element.hasAttribute('form') && dot_element.getAttribute('form') == 'aug'){
            //If the first dot is an already known dot of augmentation
            minim_counter = counting_minims(middle_notes, note_durs, undotted_note_gain, dotted_note_gain, prolatio, tempus);
            count_B = minim_counter / (tempus * prolatio);
        } else {
            // We have to divide the sequence of middle_notes in 2 parts: before the dot, and after the dot.
            // Then count the number of breves in each of the two parts to discover if this 'dot' is a
            // 'dot of division' or a 'dot of addition'
            part1_middle_notes = sequence.slice(1, first_dotted_note_index + 1);
            part2_middle_notes = sequence.slice(first_dotted_note_index + 1, sequence.length);

            // Breves BEFORE the first dot
            minim_counter1 = counting_minims_in_an_undotted_sequence(part1_middle_notes, note_durs, undotted_note_gain);
            part1_count_B = minim_counter1 / (tempus*prolatio);
            
            // The individual value of the first dotted note (the last note in the sequence preceding the dot)
            first_dotted_note = part1_middle_notes[-1];
            dur = first_dotted_note.getAttribute('dur');
            first_dotted_note_default_gain = undotted_note_gain[note_durs.indexOf(dur)];

            // Taking the second part of the sequence of the middle notes (part2_middle_notes) into account
            // Count the number of breves in the second part of the sequence of middle_notes
            minim_counter2 = counting_minims(part2_middle_notes, note_durs, undotted_note_gain, dotted_note_gain, prolatio, tempus);
            part2_count_B = minim_counter2 / (tempus*prolatio);

            // If there is just one breve before the first dot
            if (part1_count_B == 1) {
                // Two possibilities: dot of division / dot of augmentation
                // We have to take a look at the second part of the middle notes (part2_middle_notes) to figure this out

                // If the number of breves after the dot is an integer number
                if (part2_count_B == Math.floor(part2_count_B)) {
                    // DOT OF DIVISION
                    no_division_dot_flag = false;
                    // console.log('Imperfection app\n');
                    dot_element.setAttribute('form', 'div');
                    minim_counter = minim_counter1 + minim_counter2;
                    // Total of breves in the middle_notes
                    modification(part1_count_B, start_note, part1_middle_notes, null, null, 'brevis', 'longa');
                    modification(part2_count_B, null, part2_middle_notes, end_note, following_note, 'brevis', 'longa');
                } else {
                    // DOT OF AUGMENTATION
                    // console.log('Augmentation_typeI\n');
                    dot_element.setAttribute('form', 'aug');
                    first_dotted_note.setAttribute('dur.quality', 'perfecta');
                    first_dotted_note.setAttribute('num', '2');
                    first_dotted_note.setAttribute('numbase', '3');
                    minim_counter = minim_counter1 + (0.5 * first_dotted_note_default_gain) + minim_counter2;
                }
            }

            // If there is more than one breve before the first dot, it is impossible for that dot to be a 'dot of division'
            else {
                // DOT OF AUGMENTATION (or a dot of perfection at smaller note level)
                if (dot_element.hasAttribute('form') && dot_element.getAttribute('form') == 'perf') {
                    minim_counter = counting_minims(middle_notes, note_durs, undotted_note_gain, dotted_note_gain, prolatio, tempus);
                } else {
                    // console.log('Augmentation_def\n');
                    dot_element.setAttribute('form', 'aug');
                    first_dotted_note.setAttribute('dur.quality', 'perfecta');
                    first_dotted_note.setAttribute('num', '2');
                    first_dotted_note.setAttribute('numbase', '3');
                    minim_counter = minim_counter1 + (0.5 * first_dotted_note_default_gain) + minim_counter2;
                }
            }

            // Total of breves in the middle_notes
            count_B = minim_counter / (tempus * prolatio);
        }
    }
        
    if (no_division_dot_flag) {
        // Checking that the sequence of notes is fine, and then calling the modification function
        if (minim_counter % (tempus * prolatio) == 0){
            // console.log("GOOD");
        } else {
            console.log("BAD! THE DIVISION IS NOT AN INTEGER NUMBER - not an integer number of Breves!");
            console.log(([start_note].concat(middle_notes)).concat(end_note));
            console.log("Breves: " + (minim_counter / (tempus * prolatio)));
        }
        // Given the total amount of breves in-between the "longas", see if they can be arranged in groups of 3
        // According to how many breves remain ungrouped (1, 2 or 0), modifiy the duration of the appropriate note of the sequence ('imperfection', 'alteration', no-modification)
        modification(count_B, start_note, middle_notes, end_note, following_note, 'brevis', 'longa');
    }
}

function find_note_level_of_coloration(modusmaior, modusminor, tempus, prolatio, colored_figures) {
    // Determine the note-level at which coloration is working (i.e., the perfect note it is meant to imperfect)
    var coloration_level;
    // If a maxima is colored, and the default value of the maxima is 3 (modusmaior = 3), then the coloration is working at the level of the maxima
    if (modusmaior == 3 && colored_figures.includes("maxima")) {
        coloration_level = "Max";
    }
    // If a longa is colored, and the default value of the longa is 3 (modusminor = 3), then the coloration is working at the level of the longa
    else if (modusminor == 3 && (colored_figures.includes("longa") || colored_figures.includes("maxima"))) {
        coloration_level = "L";
    }
    // If a breve is colored, and the default value of the breve is 3 (tempus = 3), then the coloration is working at the level of the breve
    else if (tempus == 3 && (colored_figures.includes("brevis") || colored_figures.includes("longa") || colored_figures.includes("maxima"))) {
        coloration_level = "B";
    }
    // If a semibreve is colored, and the default value of the semibreve is 3 (prolatio = 3), then the coloration is working at the level of the semibreve
    else if (prolatio == 3 && (colored_figures.includes("semibrevis") || colored_figures.includes("brevis") || colored_figures.includes("longa") || colored_figures.includes("maxima"))) {
        coloration_level = "Sb";
    }
    // Coloration can only work at these 4 levels, as only these four notes (i.e., maxima, longa, breve, and semibreve) can be perfect (i.e., have triple values)
    else {
        coloration_level = null;
    }
    return coloration_level;
}

function get_colored_notes_and_rests(noterest_sequence) {
    // List to store all the <note> and <rest> elements that have coloration
    var colored_notes_and_rests = [];
    // List to store the value (@dur) of these colored <note> and <rest> elements
    var colored_durs = [];
    for (var noterest of noterest_sequence) {
        // Find out if the note or rest is colored
        if (noterest.hasAttribute('colored')) {
            colored_notes_and_rests.push(noterest);
            // Fill the colroed_durs list with the duration (@dur) of these colored <note> and <rest> elements
            var dur = noterest.getAttribute('dur');
            if(!(colored_durs.includes(dur))) {
                colored_durs.push(dur);
                console.log(dur);
            }
        }
    }
    // Return both the list of all the colored notes and rests, and the list of the figuras (i.e., note shapes or @dur values) of these colored notes and rests
    return [colored_notes_and_rests, colored_durs];
}

function coloration_effect(notes_and_rests_per_voice, modusmaior, modusminor, tempus, prolatio) {
    // Apply the effect of coloration once found the note-level that coloration is working at.
    
    // This is done basically by multiplying by 2/3 the duration of all notes equal or larger than the coloration's note-level,
    // and keeping the values of the smaller colored notes the same as their original (uncolored) note values.
    
    // Get the list of colored <note> and <rest> elements
    var colored_notes, durs_of_colored_notes = get_colored_notes_and_rests(notes_and_rests_per_voice);
    // Get the note-level at which the coloration is working (i.e., the perect note it is meant to imperfect)
    var coloration_level = find_note_level_of_coloration(modusmaior, modusminor, tempus, prolatio, durs_of_colored_notes);
    console.log("Coloration level: " + str(coloration_level));

    // Given the note-level of the coloration (e.g., the breve), this note must be imperfect when colored.
    // For example: The colored breve is 2/3 the value of the uncolored breve, thus the former will have a @num = 3 and @numbase = 2.

    // Colored notes shorter than the note-level of the coloration will keep their original (uncolored) value.
    // Example continuation: Colored semibreves = uncolored semibreves, thus the former won't have any extra @num and @numbase attributes.

    // Colored notes larger than the note-level of the coloration, will remain perfect or imperfect as their uncolored versions,
    // but their total value will change since now they will be made up of imperfect (colored) units instead of perfect.
    // Example continuation: An uncolored long that is imperfect, normally consists of 2 PERFECT breves; the colored long, while still
    // imperfect, now consists of 2 IMPERFECT (COLORED) breves, thus its total duration changes:
    // colored_long = 2 x colored_breve = 2 x (2/3 x uncolored_breve)= 2/3 x (2 x uncolored_breve) = 2/3 x uncolored_long
    // The same happens with the maxima. Thus, the longa and the maxima will have @num = 2 and @numbase = 2.

    if (coloration_level == "Max") {
        for (var note of colored_notes) {
            // Multiplying the duration of the coloration's note-level and larger levels by 2/3
            if (note.getAttribute('dur') == "maxima") {
                note.setAttribute('num', '3');
                note.setAttribute('numbase', '2');
            } // For smaller notes, do nothing
        }
    } else if (coloration_level == "L") {
        for (var note of colored_notes) {
            // Multiplying the duration of the coloration's note-level and larger levels by 2/3
            if (note.getAttribute('dur') == "longa" || note.getAttribute('dur') == "maxima") {
                note.setAttribute('num', '3');
                note.setAttribute('numbase', '2');
            } // For smaller notes, do nothing
        }
    }
    else if (coloration_level == "B") {
        for (var note of colored_notes) {
            // Multiplying the duration of the coloration's note-level and larger levels by 2/3
            if (note.getAttribute('dur') == "brevis" || note.getAttribute('dur') == "longa" || note.getAttribute('dur') == "maxima") {
                note.setAttribute('num', '3');
                note.setAttribute('numbase', '2');
            } // For smaller notes, do nothing
        }
    }
    else if (coloration_level == "Sb") {
        for (var note of colored_notes) {
            // Multiplying the duration of the coloration's note-level and larger levels by 2/3
            if (note.getAttribute('dur') == "semibrevis" || note.getAttribute('dur') == "brevis" || note.getAttribute('dur') == "longa" || note.getAttribute('dur') == "maxima") {
                note.setAttribute('num', '3');
                note.setAttribute('numbase', '2');
            } // For smaller notes, do nothing
        }
    }
    else {
        for (var note of colored_notes) {
            note.setAttribute('num', '3');
            note.setAttribute('numbase', '2');
        }
    }
}

// Main function
const lining_up = quasiscore_mensural_doc => {
    // For each voice (staff element) in the "score"
    var staves = quasiscore_mensural_doc.getElementsByTagName('staff');
    var stavesDef = quasiscore_mensural_doc.getElementsByTagName('staffDef');
    for (var i = 0; i < stavesDef.length; i++) {
        console.log('\nVoice # ' + (i + 1) + ' results:\n');
        var staffDef = stavesDef[i];
        var staff = staves[i];

        // Getting the mensuration information of the voice
        var prolatio = staffDef.getAttribute('prolatio');
        var tempus = staffDef.getAttribute('tempus');
        var modusminor = staffDef.getAttribute('modusminor');
        var modusmaior = staffDef.getAttribute('modusmaior');

        // Individual note values and gains, according to the mensuration
        var note_durs = ['semifusa', 'fusa', 'semiminima', 'minima', 'semibrevis', 'brevis', 'longa', 'maxima'];
        var undotted_note_gain = [new Fraction(1,8), new Fraction(1,4), new Fraction(1,2), 1, prolatio, tempus * prolatio, modusminor * tempus * prolatio, modusmaior * modusminor * tempus * prolatio];
        var dotted_note_gain = [new Fraction(3,16), new Fraction(3,8), new Fraction(3,4), new Fraction(3,2), 3, 3 * prolatio, 3 * tempus * prolatio, 3 * modusminor * tempus * prolatio];
        console.log(note_durs);
        console.log(undotted_note_gain);
        console.log();

        // Getting all the notes and rests of one voice into an array (in order of appearance).
        // The array allows to retrieve the index, which is not possible with MEI lists.
        var voice_content = staff.getElementsByTagName('layer')[0].children;
        var voice_noterest_content = [];
        for (var element of voice_content) {
            var name = element.tagName;
            if (name == 'note' || name == 'rest') {
                voice_noterest_content.push(element);
            } else if (name == 'ligature') {
                //console.log("Got a ligature!");
                for (var child of element.children){
                    if (child.tagName == 'note' || child.tagName == 'rest') {
                        voice_noterest_content.push(child);
                    }
                    else {
                        console.log("This child of ligature is not a note/rest:");
                        console.log(child);
                        console.log("It is a " + child.tagName);
                    }
                }
            } else if (name == 'choice'){
                // The relevant <note> and <rest> elements can be contained
                // within a <corr> element due to editorial corrections
                var corr = element.getElementsByTagName('corr')[0];
                for (var child of corr.children) {
                    if (child.tagName == 'note' || child.tagName == 'rest') {
                        voice_noterest_content.push(child);
                    } else {
                        console.log("This child of corr is not a note/rest/dot:");
                        console.log(child);
                        console.log("It is a " + child.tagName);
                    }
                }
            } else {
                console.log("Unexpected tagnme : " + name + "\n(not a note, rest, or ligature)\n");
            }
        }//console(voice_noterest_content);

        // Encoding the effect of coloration in the durational values of the colored notes/rests
        coloration_effect(voice_noterest_content, modusmaior, modusminor, tempus, prolatio);

        // Find indices for starting and ending points of each sequence of notes to be analyzed.
        // Each of the following is a list of indices of notes greater or equal than: a Semibreve, a Breve, a Long and a Maxima, respectively.
        var list_of_indices_geq_Sb = [];
        var list_of_indices_geq_B = [];
        var list_of_indices_geq_L = [];
        var list_of_indices_geq_Max = [];
        // Get the indices
        for (var noterest of voice_noterest_content) {
            var dur = noterest.getAttribute('dur');
            if (dur == 'semibrevis' || noterest.hasAttribute('colored')) {
                list_of_indices_geq_Sb.push(voice_noterest_content.indexOf(noterest));
            }
            if (dur == 'brevis' || noterest.hasAttribute('colored')) {
                list_of_indices_geq_Sb.push(voice_noterest_content.indexOf(noterest));
                list_of_indices_geq_B.push(voice_noterest_content.indexOf(noterest));
            }
            if (dur == 'longa' || noterest.hasAttribute('colored')) {
                list_of_indices_geq_Sb.push(voice_noterest_content.indexOf(noterest));
                list_of_indices_geq_B.push(voice_noterest_content.indexOf(noterest));
                list_of_indices_geq_L.push(voice_noterest_content.indexOf(noterest));
            }
            if (dur == 'maxima' || noterest.hasAttribute('colored')) {
                list_of_indices_geq_Sb.push(voice_noterest_content.indexOf(noterest));
                list_of_indices_geq_B.push(voice_noterest_content.indexOf(noterest));
                list_of_indices_geq_L.push(voice_noterest_content.indexOf(noterest));
                list_of_indices_geq_Max.push(voice_noterest_content.indexOf(noterest));
            }
        }


        var o, f, start_note, end_note, middle_notes, following_note;

        // PROCESSING OF MINIMS AND SEMIBREVES (DEPENDING ON THE VALUE OF @PROLATIO)
        // SEQUENCES OF MINIMS DELIMITED BY SEMIBREVES (OR HIGHER NOTE VALUES)

        //console("\nSEMIBREVE GEQ");
        //console(list_of_indices_geq_Sb + "\n");

        if (prolatio == 3) {

            if (!(list_of_indices_geq_Sb.includes(0)) && list_of_indices_geq_Sb.length != 0) {
                start_note = null;
                f = list_of_indices_geq_Sb[0];
                end_note = voice_noterest_content[f];
                try {
                    following_note = voice_noterest_content[f+1];
                } catch(err) {
                    following_note = null;
                }
                middle_notes = voice_noterest_content.slice(0, f);
                /*
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
                */
                minims_between_semibreves(start_note, middle_notes, end_note, following_note, note_durs, undotted_note_gain, dotted_note_gain);
            }

            for (var j = 0; j < list_of_indices_geq_Sb.length-1; j++) {
                // Define the sequence of notes
                o = list_of_indices_geq_Sb[j];
                start_note = voice_noterest_content[o];
                f = list_of_indices_geq_Sb[j+1];
                end_note = voice_noterest_content[f];
                try {
                    following_note = voice_noterest_content[f+1];
                } catch(err) {
                    following_note = null;
                }
                middle_notes = voice_noterest_content.slice(o+1, f);
                /*
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
                } console.log("Delimited Sequence of Breves: " + s + ", " + m + e);*/
                minims_between_semibreves(start_note, middle_notes, end_note, following_note, note_durs, undotted_note_gain, dotted_note_gain);
            }

        }

        else {
            // prolatio = 2
        }


        // PROCESSING OF SEMIBREVES AND BREVES (DEPENDING ON THE VALUE OF @TEMPUS)
        // SEQUENCES OF SEMIBREVES DELIMITED BY BREVES (OR HIGHER NOTE VALUES)

        //console("\nBREVE GEQ");
        //console(list_of_indices_geq_B + "\n");

        if (tempus == 3) {

            if (!(list_of_indices_geq_B.includes(0)) && list_of_indices_geq_B.length != 0) {
                start_note = null;
                f = list_of_indices_geq_B[0];
                end_note = voice_noterest_content[f];
                try {
                    following_note = voice_noterest_content[f+1];
                } catch(err) {
                    following_note = null;
                }
                middle_notes = voice_noterest_content.slice(0, f);
                /*
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
                */
                sb_between_breves(start_note, middle_notes, end_note, following_note, prolatio, note_durs, undotted_note_gain, dotted_note_gain);
            }

            for (var j = 0; j < list_of_indices_geq_B.length-1; j++) {
                // Define the sequence of notes
                o = list_of_indices_geq_B[j];
                start_note = voice_noterest_content[o];
                f = list_of_indices_geq_B[j+1];
                end_note = voice_noterest_content[f];
                try {
                    following_note = voice_noterest_content[f+1];
                } catch(err) {
                    following_note = null;
                }
                middle_notes = voice_noterest_content.slice(o+1, f);
                /*
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
                } console.log("Delimited Sequence of Breves: " + s + ", " + m + e);*/
                sb_between_breves(start_note, middle_notes, end_note, following_note, prolatio, note_durs, undotted_note_gain, dotted_note_gain);
            }
        }

        else {
            // tempus = 2
        }


        // PROCESSING OF BREVES AND LONGAS (DEPENDING ON THE VALUE OF @MODUSMINOR)
        // SEQUENCES OF BREVES DELIMITED BY LONGAS (OR HIGHER NOTE VALUES)

        //console("\nLONGA GEQ");
        //console(list_of_indices_geq_L + "\n");

        if (modusminor == 3) {

            if (!(list_of_indices_geq_L.includes(0)) && list_of_indices_geq_L.length != 0) {
                start_note = null;
                f = list_of_indices_geq_L[0];
                end_note = voice_noterest_content[f];
                try {
                    following_note = voice_noterest_content[f+1];
                } catch(err) {
                    following_note = null;
                }
                middle_notes = voice_noterest_content.slice(0, f);

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

                breves_between_longas(start_note, middle_notes, end_note, following_note, prolatio, tempus, note_durs, undotted_note_gain, dotted_note_gain);
            }

            for (var j = 0; j < llist_of_indices_geq_L.length-1; j++) {
                // Define the sequence of notes
                o = list_of_indices_geq_L[j];
                start_note = voice_noterest_content[o];
                f = list_of_indices_geq_L[j+1];
                end_note = voice_noterest_content[f];
                try {
                    following_note = voice_noterest_content[f+1];
                } catch(err) {
                    following_note = null;
                }
                middle_notes = voice_noterest_content.slice(o+1, f);

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

                breves_between_longas(start_note, middle_notes, end_note, following_note, prolatio, tempus, note_durs, undotted_note_gain, dotted_note_gain);
            }

            // If the last note on the voice_noterest_content isn't a longa (or maxima):
            var index_last_noterest = voice_noterest_content.length - 1;
            if (!(list_of_indices_geq_L.includes(index_last_noterest))) {
                o = list_of_indices_geq_L[list_of_indices_geq_L.length - 1];
                start_note = voice_noterest_content[o];
                end_note = null;
                following_note = null;
                middle_notes = voice_noterest_content.slice(o+1,index_last_noterest+1);

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

        else {
            // modusminor = 2
        }


        // There are notes that, when dotted, the dot used must be a dot of augmentation
        // Only imperfect notes can be augmented by a dot, but not all dots in them are augmentation dots
        // These imperfect notes can be followed by a division dot, as they can form a perfection with a larger note.
        // If a note is perfect, by the functions above all the dotted notes with smaller values are examined to determine if the dot is a 'division dot' or an 'augmentation dot'
        // But in case of larger values, this is not evaluated.
        // The following code performs that action. It goes from 'maxima' to 'semibrevis', until if finds a perfect mensuration.
        // All the notes larger than that perfect note are considered to be augmented by any dot following them.

        var note_level = ['maxima', 'longa', 'brevis', 'semibrevis'];
        var mensuration = [modusmaior, modusminor, tempus, prolatio];
        var notes_NoDivisionDot_possibility = [];
        var k = 0;
        var acum_boolean =  mensuration[0];
        while (acum_boolean % 2 == 0) {
            notes_NoDivisionDot_possibility.push(note_level[k]);
            k += 1;
            try {
                acum_boolean += mensuration[k];
            } catch(err) {
                break;
            }
        }
        //console(acum_boolean);
        //console(notes_NoDivisionDot_possibility);

        var dots, dot, dotted_note, dur_dotted_note;
        if (notes_NoDivisionDot_possibility.length != 0) {
            dots = staff.getElementsByTagName('dot');
            if (notes_NoDivisionDot_possibility.length == 4) {
                for (dot of dots) {
                    dot.setAttribute('form', 'aug');
                    dotted_note = get_preceding_noterest(dot);
                    dotted_note.setAttribute('dur.quality', 'perfecta');
                    dotted_note.setAttribute('num', '2');
                    dotted_note.setAttribute('numbase', '3');
                }
            } else {
                for (dot of dots) {
                    dotted_note = get_preceding_noterest(dot);
                    // The preceding element of a dot should be either a <note> or a <rest>, so the following variable (dur_dotted_note) should be well defined
                    dur_dotted_note = dotted_note.getAttribute('dur');
                    if (notes_NoDivisionDot_possibility.includes(dur_dotted_note)) {
                        // Augmentation dot
                        dot.setAttribute('form', 'aug');
                        dotted_note.setAttribute('dur.quality', 'perfecta');
                        dotted_note.setAttribute('num', '2');
                        dotted_note.setAttribute('numbase', '3');
                    }
                }
            }
        }
    }

    return quasiscore_mensural_doc;
};

exports.lining_up = lining_up;
