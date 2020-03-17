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

function clef_definition(staff) {
    // Remove <clef> elements of a voice (i.e., <staff>) other than the first one (initialClef)
    // Except if these following <clef> elements encode a change in clef.
    const clefs = Array.from(staff.getElementsByTagName('clef'));
    const initialClef = clefs[0];
    const initialClef_line = initialClef.getAttribute('line');
    const initialClef_shape = initialClef.getAttribute('shape');
    var parent;
    for (var i = 1; i < clefs.length; i ++) {
        var clef = clefs[i];
        // If the i-th <clef> element encodes the same clef as
        // the one at the beginning of the voice, remove it.
        if (clef.getAttribute('line') == initialClef_line && clef.getAttribute('shape') == initialClef_shape) {
            parent = clef.parentElement;
            parent.removeChild(clef);
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

    // Change value of @n in each <staff> and <staffDef> elements
    for (var i = 1; i < (staves.length + 1); i++){
        staves[i-1].setAttribute('n', ''+i);
        stavesDef[i-1].setAttribute('n', ''+i);
    }

    // Clean Up:
    // Remove <parts>
    mdiv.removeChild(mei.getElementsByTagName('parts')[0]);
    // Remove extraneous elements: <pb> and <sb>
    cleanup(meiDoc);
    // Remove extra <clef> elements for each voice (i.e., <staff>)
    for (staff of staves){clef_definition(staff);}

    return meiDoc;
};

exports.merge = merge;
