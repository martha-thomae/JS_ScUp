# Scoring-up Script
The scoring-up script converts a Mensural MEI file encoding the music in parts (by using the MEI `<parts>` element) into a Mensural MEI file that encodes the piece as a score (using the MEI `<score>` element) with the voices lined up. The alignment of the parts is a complex issue in mensural notation, since the same note-shape can have different durational values (_perfect_ / _imperfect_ / _altered_) depending on the context.

This scoring-up script consists of a **merge module** and a **set of duration-finder modules**. The **merge module** converts the `<parts>`-based MEI representation into a `<score>`-based MEI representation, moving the `<staffDef>` and `<staff>` elements into the right place within the `<score>` element. Even though the resulting file uses a `<score>` element, voices are not aligned yet. Because of this, we refer to the **merge module** output MEI file as a _quasiscore representation_. The set of **duration-finder modules** deal with the context-dependent nature of the notation to determine the durational value of the notes according to different styles of mensural notation (namely, _Ars antiqua_, _Ars nova_, and _white mensural notation_). Currently, there are two duration-finder modules:

- The **ArsNova_and_WhiteMensural module** deals with the context-dependent nature of the notation by implementing the _principles of imperfection and alteration_—outlined by Franco of Cologne (ca. 1280) and Willi Apel. It also includes functions for: distinguishing between dots of division and dots of augmentation, handling hemiola coloration, dealing with the simultaneous use of perfect mensurations at different note levels. A newly introduced feature is the capability of dealing with changes of mensuration within a voice.

- The **ArsAntiqua module** handles Franconian notation, interpreting groups of semibreves as pointed out by Franco's _Ars cantus mensurabilis_ (ca. 1280) for ternary and binary division of the breve. It also supports repeating tenors, expanding the set of notes of the repeated tenor in the score representation.

## Requirements
- [Node.js](https://nodejs.org/en/)

## Usage
The mensural scoring-up tool presented in this repository is meant to be used within the [Measuring Polyphony Editor (MP-Editor)](https://github.com/MeasuringPolyphony/mp_editor). The code contained in this repository is a re-implementation of the [Ptyon Scoring-up script](https://github.com/elvis-project/scoring-up) into JavaScript so that it could be easily integrated into a web app.

The MP-Editor is used to enter the notes in the systems of each of the parts/voices of a mensural piece, which can be exported into a Mensural MEI parts-based file (an MEI file encoding mensural notation in `<parts>`). One can also request the MP-Editor to line up the entered parts into a score, for which the MP-Editor will call this scoring-up script to provide the user with the score. The resulting score can be exported into a Mensural MEI score-based file (an MEI file encoding mensural notation in `<score>`). Moreover, this score can also be edited within the MP-Editor, allowing for editorial corrections of scribal errors. The scholar edition can also be exported as a Mensural MEI file, in both parts-based and score-based flavors.

You can check the [MP-Editor online](https://editor.measuringpolyphony.org/#/) and start transcribing mensural music. For tutorial videos, check [this publication](https://hcommons.org/deposits/objects/hc:31924/datastreams/CONTENT/content).

## Related Publications
For more details regarding the algorithm behind the scoring-up tool, especially regarding the implementation of the principles of imperfection and alteration, distinction of dot functionality, and performance, please consult [The Mensural Scoring-up Tool](https://dl.acm.org/doi/abs/10.1145/3358664.3358668?casa_token=mcZ4T3FeRFIAAAAA:MhdqjU8mBjq21ZMIvFBv4q1goZqIg5BGWXsdzbJOVGhaAvXqGDfCRv-hSAausLsUbXYa1vrDNQbpCw). Ars antiqua was a later addition to the scoring-up tool, and it is not mentioned in this publication.

You can also consult [Automatic Scoring Up of Mensural Music Using Perfect Mensurations, 1300–1550 (MA thesis)](http://digitool.Library.McGill.CA:80/R/-?func=dbin-jump-full&object_id=151045&silo_library=GEN01).

For details about the MP-Editor, please consult [Next Steps for Measuring Polyphony – A Prototype Editor for Encoding Mensural Music](https://hcommons.org/deposits/objects/hc:31924/datastreams/CONTENT/content).
