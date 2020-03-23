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

    return meiDoc;
};

exports.merge = merge;
