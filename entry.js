const MergeModule = require('./Merge.js');
const ArsAntiqua = require('./ArsAntiqua.js');
const PostProcessing = require('./postprocessing.js');
// const ArsNova_and_WhiteMensural = require('./ArsNova_and_WhiteMensural.js');

module.exports = {
  merge: MergeModule.merge,
  ArsAntiqua: ArsAntiqua,
  refineScore: PostProcessing.refine_score,
};
