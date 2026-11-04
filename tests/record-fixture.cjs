// Existing sync scenarios need an explicitly entered exercise; unmarked target
// numbers are intentionally never saved by the application.
function prepareRecording(window) {
  window.eval(`{
    const x=focusItem(), t=x&&findTrack(x.id);
    if(t&&!sessionHasDraft(x)){
      drafts[t.id]=x.goals.map(String);
      for(let i=0;i<x.goals.length;i++)captureAdvancedDraft(t,i);
    }
  }`);
}
function record(window) {
  prepareRecording(window);
  window.document.querySelector('[data-act="save"]').click();
}
module.exports = { prepareRecording, record };
