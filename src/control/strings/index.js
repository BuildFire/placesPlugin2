import { stringsUI } from "./js/stringsUI";
import { stringsConfig } from "../../widget/js/shared/stringsConfig";

import "../../widget/js/shared/strings";

let strings;

function loadLanguage(lang) {
  stringsContainer.classList.add("hidden");
  strings = new buildfire.services.Strings(lang, stringsConfig);
  strings.init().then(() => {
    showNewLanguageState(strings.id);
    strings.inject();
  });
  stringsUI.init("stringsContainer", strings, stringsConfig);
}
loadLanguage("en-us");

function showNewLanguageState(show) {
  if (show) {
    saveButton.classList.remove("hidden");
    stringsContainer.classList.remove("hidden");
  } else {
    saveButton.classList.add("hidden");
    stringsContainer.classList.add("hidden");
  }
}

function createLanguage(language) {
  stringsContainer.disabled = true;
  strings.createLanguage(language, () => {
    stringsContainer.disabled = false;
  });
  showNewLanguageState(true);
  return false;
}

function save() {
  strings.save(() => {
    buildfire.messaging.sendMessageToWidget({ cmd: "refresh" });
  });
}

window.onload = () => {
  const saveButton = document.getElementById("saveButton");
  createLanguage("en-us");
  loadLanguage("en-us");

  saveButton.addEventListener("click", (e) => {
    save();
  });
};
