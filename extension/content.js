function getText(selector) {
  const el = document.querySelector(selector);
  return el ? el.innerText.trim() : "";
}

function getExperiences() {
  const expSections = document.querySelectorAll('.experience__item');
  let experiences = [];
  for (let i = 0; i < Math.min(expSections.length, 3); i++) {
    const role = expSections[i].querySelector('span[aria-hidden]');
    experiences.push(role ? role.innerText.trim() : "");
  }
  return experiences;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getProfileData") {
    const headline = getText(".text-body-medium.break-words");
    const about = getText(".pv-shared-text-with-see-more > span");
    const experience = getExperiences();

    sendResponse({ headline, about, experience });
  }
});
