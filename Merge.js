/*
    MERGE MODULE:
    Change the file structure from parts-based to score-based.
    Returns a quasi-score (staves piled-up without voice alignment).
*/
function cleanup(meiDoc) {
    const pb_elements = Array.from(meiDoc.getElementsByTagName('pb'));
    const sb_elements = Array.from(meiDoc.getElementsByTagName('sb'));
    var parent;
    for (var pageBegin of pb_elements) {
        parent = pageBegin.parentElement;
        parent.removeChild(pageBegin);
    }
    for (var systemBegin of sb_elements) {
        parent = systemBegin.parentElement;
        parent.removeChild(systemBegin);
    }
}

function clef_definition(staff, staffDef) {
    // Remove all <clef> elements of a voice (i.e., <staff>),
    // except if they encode a change in clef.
    const clefs = Array.from(staff.getElementsByTagName('clef'));
    const initialClef = clefs[0];
    const initialClef_line = initialClef.getAttribute('line');
    const initialClef_shape = initialClef.getAttribute('shape');
    var parent;
    for (var i = 0; i < clefs.length; i ++) {
        var clef = clefs[i];
        // If the i-th <clef> element encodes the same clef as
        // the one at the beginning of the voice, remove it.
        if (clef.getAttribute('line') == initialClef_line && clef.getAttribute('shape') == initialClef_shape) {
            parent = clef.parentElement;
            parent.removeChild(clef);
        }
    }
    // Encode the first clef of the voice (initialClef) within <staffDef>
    for (var attribute_name of initialClef.getAttributeNames()){
        if (attribute_name != 'xml:id') {
            var attribute_value = initialClef.getAttribute(attribute_name);
            staffDef.setAttribute('clef.'+attribute_name, attribute_value);
        }
    }
}

function get_set_of_repeated_notes(tenor_layer, startid, endid){
    const tenor_music_content = Array.from(tenor_layer.children);
    var start_index, end_index;
    var index = 0;
    // Find the indices representing the start and end of the repeated tenor
    for (var noterest of tenor_music_content) {
        if (noterest.getAttribute('xml:id') == startid) {
            start_index = index;
        } else if (noterest.getAttribute('xml:id') == endid) {
            end_index = index;
            break;
        } index += 1;
    }
    // Use these indices to get the sequence of repeated notes/rests in the tenor
    const repeated_notes = tenor_music_content.slice(start_index, end_index + 1);
    return repeated_notes;
}

function expand_repeating_tenor(meiDoc){
    // Find the <dir> element and use it to locate the tenor's <staff> and <layer> elements
    const dir = meiDoc.getElementsByTagName('dir')[0];
    const tenor_staff = dir.parentElement;
    const tenor_layer = tenor_staff.getElementsByTagName('layer')[0];

    // Retrieve <dir> attributes related to the repetition:
    // - IDs pointing to the beginning and end of the set of notes to be repeated (@plist)
    var plist_array = dir.getAttribute('plist').split(' ');
    var startid_ref = plist_array[0];
    var endid_ref = plist_array[1];
    // - And the number of times this sequence of is to be repeated (encoded at @n for now)
    var times = dir.getAttribute('n');

    // Retrieve the notes repeated in the tenor
    var repeating_tenor = get_set_of_repeated_notes(tenor_layer, startid_ref.slice(1,), endid_ref.slice(1,));

    // Expand the repeated tenor into individual notes with @copyof
    var xmlId, copied_element, copied_descendant;
    for (var i = 0; i < times; i++) {
        for (var element of repeating_tenor){
            // Create a clone of the element (this will keep attributes and descendants)
            copied_element = element.cloneNode(true);
            // Add the @copyof attribute and change its XML ID based on the original ID
            xmlId = element.getAttribute('xml:id');
            copied_element.setAttribute('copyof', '#'+xmlId);
            copied_element.setAttribute('xml:id', xmlId+'_'+(i+1));
            // Add the cloned element
            //(this will add it with the same attributes and descendants as the original)
            tenor_layer.appendChild(copied_element);
            // And change the XML ID of the descendants of these clones
            //(so that they don't have the same as the origianl descenadants)
            // and add the appropriate @copyof value.
            for (copied_descendant of copied_element.querySelectorAll('*')){
                xmlId = copied_descendant.getAttribute('xml:id');
                copied_descendant.setAttribute('copyof', '#'+xmlId);
                copied_descendant.setAttribute('xml:id', xmlId+'_'+(i+1));
            }
        }
    }
    // Finally, remove the <dir> element encoding the repetition
    tenor_staff.removeChild(dir);
}

const merge = meiDoc => {
    const mei = meiDoc.documentElement;

    // Get <mdiv> element and add to it the newly created <score> element
    const mdiv = mei.getElementsByTagName('mdiv')[0];
    const score = meiDoc.createElementNS('http://www.music-encoding.org/ns/mei', 'score');
    mdiv.appendChild(score);

    // Add everything related to the metadata of the score (<scoreDef> and descendants)
    // Add (new) <scoreDef>
    const scoreDef = meiDoc.createElementNS('http://www.music-encoding.org/ns/mei', 'scoreDef');
    score.appendChild(scoreDef);
    // Add (new) <staffGrp>
    const staffGrp = meiDoc.createElementNS('http://www.music-encoding.org/ns/mei', 'staffGrp');
    scoreDef.appendChild(staffGrp);
    // Add the pre-existing <staffDef> elements for each voice
    const stavesDef_list = mei.getElementsByTagName("staffDef");
    const stavesDef = Array.from(stavesDef_list);
    for (var staffDef of stavesDef){
        staffGrp.appendChild(staffDef);
    }
    // Add everything related to the music content
    // Add <section>
    const section = meiDoc.createElementNS('http://www.music-encoding.org/ns/mei', 'section');
    score.appendChild(section);
    // Add the pre-existing <staff> elements encoding each voice
    const staves_list = mei.getElementsByTagName("staff");
    const staves = Array.from(staves_list);
    for (var staff of staves){
        section.appendChild(staff);
    }

    // Clean Up:
    // Remove <parts>
    mdiv.removeChild(mei.getElementsByTagName('parts')[0]);
    // Remove extraneous elements: <pb> and <sb>
    cleanup(meiDoc);
    // Move attributes or modify their values (given the new <score>-based structure):
    // @n and clef-related attributes
    for (var i = 0; i < staves.length; i++){
        staff = staves[i];
        staffDef = stavesDef[i];
        // Change value of @n in each <staff> and <staffDef> elements
        staff.setAttribute('n', i+1+'');
        staffDef.setAttribute('n', i+1+'');
        // Remove unnecesary <clef> elements in the voice (i.e., <staff>) and
        // Encode inital clef within the voice's metadata (i.e., <staffDef> attributes)
        clef_definition(staff, staffDef);
    }
    // Expand repeating tenor if there is one
    if (meiDoc.getElementsByTagName('dir').length != 0){
        expand_repeating_tenor(meiDoc);
    }

    return meiDoc;
};

exports.merge = merge;
