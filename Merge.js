/*
    MERGE MODULE:
    Change the file structure from parts-based to score-based.
    Returns a quasi-score (staves piled-up without voice alignment).
*/

function cleanup(meiDoc) {
    // Remove <pb> and <sb> elements
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
    // Retrieving all <clef> elements of the given voice, and finding the initial clef
    const clefs = Array.from(staff.getElementsByTagName('clef'));
    const initialClef = clefs[0];
    // Encode the first clef of the voice (initialClef) within <staffDef>
    for (var attribute_name of initialClef.getAttributeNames()){
        if (attribute_name != 'xml:id') {
            var attribute_value = initialClef.getAttribute(attribute_name);
            staffDef.setAttribute('clef.'+attribute_name, attribute_value);
        }
    } // Remove the corresponding <clef> element
    var parent = initialClef.parentElement;
    parent.removeChild(initialClef);
    // Remove all remaining <clef> elements of the voice
    // except the ones encoding a change in clef.
    for (var i = 1; i < clefs.length; i ++) {
        var clef = clefs[i];
        var prev_clef = clefs[i-1];
        // If the i-th <clef> element encodes the same clef as
        // the previous <clef> element (i-1), remove it.
        if (clef.getAttribute('line') == prev_clef.getAttribute('line') && clef.getAttribute('shape') == prev_clef.getAttribute('shape')) {
            parent = clef.parentElement;
            parent.removeChild(clef);
        }
    }
}

/*
    REPEATING TENOR FUNCTIONS:
    The "main" function is the "expand_repeating_tenor" which calls both the
    "get_set_of_repeated_notes" to retrieve all the elements that should be
    repeated (e.g., notes, rests, ligatures) and then it adds each of them
    with the "add_cloned_elements" function.
*/
function get_set_of_repeated_notes(meiDoc, startid, endid){
    // Define repeated_elements array and add its starting element (based on the startid)
    var resolver = meiDoc.createNSResolver(meiDoc.ownerDocument == null ? meiDoc.documentElement : meiDoc.ownerDocument.documentElement);
    var startRptElement = meiDoc.evaluate("//*[@xml:id='" + startid + "']", meiDoc, resolver, window.XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    var repeated_elements = Array.from([startRptElement]);
    var nextRptElement = startRptElement.nextSibling;
    // Add all the following elements
    while (nextRptElement.getAttribute('xml:id') != endid) {
        if (nextRptElement.tagName != 'clef') {
            repeated_elements.push(nextRptElement);
        } nextRptElement = nextRptElement.nextSibling;
    }// Add last repeated element (corresponding to the endid)
    repeated_elements.push(nextRptElement);
    return repeated_elements;
}

function add_cloned_elements(tenor_layer, repeating_tenor, times){
    // Expand the repeated tenor into individual notes by cloning its elements
    // and adding them (with a @copyof attribute) in the right place
    var followElem, flagRepeatAtEnd, i, element, copied_element, xmlId, copied_descendant;
    var lastRptNote = repeating_tenor[repeating_tenor.length-1];

    // Determine the place to add the copied notes
    // (at the end of the layer or not)
    try {
        followElem = lastRptNote.nextSibling;
        flagRepeatAtEnd = false;
    } catch(err) {
        flagRepeatAtEnd = true;
    }

    // Based on the location, either: 
    if (flagRepeatAtEnd){
        // Add the notes at the end of the tenor_layer (appendChild)
        for (i = 0; i < times; i++) {
            for (element of repeating_tenor){
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
    } else {
        // Add the notes before the element following the last
        // element of the repeated tenor (insertBefore method)
        for (i = 0; i < times; i++) {
            for (element of repeating_tenor){
                // Create a clone of the element (this will keep attributes and descendants)
                copied_element = element.cloneNode(true);
                // Add the @copyof attribute and change its XML ID based on the original ID
                xmlId = element.getAttribute('xml:id');
                copied_element.setAttribute('copyof', '#'+xmlId);
                copied_element.setAttribute('xml:id', xmlId+'_'+(i+1));
                // Add the cloned element
                //(this will add it with the same attributes and descendants as the original)
                tenor_layer.insertBefore(copied_element, followElem);
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
    }
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
    var repeating_tenor = get_set_of_repeated_notes(meiDoc, startid_ref.slice(1,), endid_ref.slice(1,));

    // Expand the repeated tenor into individual notes with @copyof attribute.
    // This is done by adding the copied elements in the appropriate place of the
    // tenor_layer a given number of times
    add_cloned_elements(tenor_layer, repeating_tenor, times);

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
    // Add (new) <scoreDef> (include @midi.bpm = 600 for playback)
    const scoreDef = meiDoc.createElementNS('http://www.music-encoding.org/ns/mei', 'scoreDef');
    scoreDef.setAttribute('midi.bpm', '600');
    score.appendChild(scoreDef);
    // Add (new) <staffGrp> (include @symbol = bracket)
    const staffGrp = meiDoc.createElementNS('http://www.music-encoding.org/ns/mei', 'staffGrp');
    staffGrp.setAttribute('symbol', 'bracket');
    scoreDef.appendChild(staffGrp);
    // Add the pre-existing <staffDef> elements for each voice
    const stavesDef_list = mei.getElementsByTagName("staffDef");
    const stavesDef = Array.from(stavesDef_list);
    for (var staffDef of stavesDef){
        staffGrp.appendChild(staffDef);
        // Add <label> as a child of <staffDef> to include the voice type as text
        var label = meiDoc.createElementNS('http://www.music-encoding.org/ns/mei', 'label');
        label.textContent = staffDef.getAttribute('label');
        staffDef.insertBefore(label, staffDef.children[0]);
        // And remove the corresponding @label attribute from <staffDef>
        // (the value of @label does not get rendered in Verovio)
        staffDef.removeAttribute('label');

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
    // (this is, if there is a <dir> element encoding the repeating tenor)
    if (meiDoc.getElementsByTagName('dir').length != 0){
        expand_repeating_tenor(meiDoc);
    }

    return meiDoc;
};

exports.merge = merge;
