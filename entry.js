const MergeModule = require('./Merge.js');
const ArsAntiqua = require('./ArsAntiqua.js');
const ArsNova = require('./ArsNova_and_WhiteMensural.js');
const PostProcessing = require('./postprocessing.js');
// const ArsNova_and_WhiteMensural = require('./ArsNova_and_WhiteMensural.js');

module.exports = {
  merge: MergeModule.merge,
  ArsAntiqua: ArsAntiqua,
  ArsNova: ArsNova,
  refineScore: PostProcessing.refine_score, // Kept for backwards compatibility. Remove in next major version.
  PostProcessing: PostProcessing,
};
