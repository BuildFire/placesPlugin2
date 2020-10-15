const stringsUI = {
	container: null
	,strings:null
	,stringsConfig:null
	, _debouncers: {}
	, debounce(key, fn) {
		if (this._debouncers[key]) clearTimeout(this._debouncers[key]);
		this._debouncers[key] = setTimeout(fn, 10);
	}

	, init(containerId,strings,stringsConfig) {
		this.strings=strings;
		this.stringsConfig=stringsConfig;
		this.container = document.getElementById(containerId);
		this.container.innerHTML="";
		for (let key in this.stringsConfig) {
			this.buildSection(this.container, key, this.stringsConfig[key]);
		}

		stringsUI._setupTinyMCE();


	}
	,_setupTinyMCE(){
		if(!tinymce)return;
		tinymce.remove();
		tinymce.baseURL = "../../../../scripts/tinymce";
		tinymce.init({
			selector: '.bfwysiwyg',
			min_height: 100,
			menubar: "edit | insert | format | table | tools",
			plugins: [
				'advlist autolink lists link image charmap print preview anchor textcolor',
				'searchreplace visualblocks code fullscreen',
				'insertdatetime media table paste code colorpicker'
			],
			toolbar: 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | image | code',
			content_css: [
				'https://fonts.googleapis.com/css?family=Lato:300,300i,400,400i',
				'https://www.tiny.cloud/css/codepen.min.css'
			],
			setup:function(ed) {
				ed.on('change', function(e) {
					stringsUI.debounce(e.target.id, ()=>{
						if(!ed.targetElm)return;	
						stringsUI.onSave(e.target.id,ed.getContent());	
					});
				});
			}
		});
	}
	,onSave(prop,value){
		this.strings.set(prop,value);
	}

	, createAndAppend(elementType, innerHTML, classArray, parent, tooltipValue, tooltipPosition) {
    let e = null;
    if (elementType === 'label' && tooltipValue) {
      let toolTip = document.createElement('span');
      toolTip.style.display = 'inline-block';
      toolTip.style.position = 'relative';
      let tooltipBox = document.createElement('div');
      tooltipBox.classList.add('btn-primary');
      let tooltipText = document.createElement('span');
      tooltipText.innerHTML = tooltipValue;
      let label = document.createElement('label');
      label.innerHTML = innerHTML;
      classArray.forEach(c => label.classList.add(c));
      if (tooltipPosition === 'top') {
        tooltipBox.classList.add('customTooltipBoxTop');
        tooltipText.classList.add('customTooltipTextTop');
      } else {
        tooltipBox.classList.add('customTooltipBox');
        tooltipText.classList.add('customTooltipText');
      }
      tooltipBox.append(tooltipText);
      toolTip.append(tooltipBox);
      label.append(toolTip);
      e = label;
    } else {
      e = document.createElement(elementType);
      e.innerHTML = innerHTML;
      classArray.forEach(c => e.classList.add(c));
    }
		parent.appendChild(e);
		return e;
	}
	, createIfNotEmpty(elementType, innerHTML, classArray, parent) {
		if (innerHTML)
			return this.createAndAppend(elementType, innerHTML, classArray, parent);
	}

	, buildSection(container, sectionProp, sectionObj) {
		let sec = this.createAndAppend("section", "", [], container);

		this.createIfNotEmpty("h3", sectionObj.title, [], sec);
		this.createIfNotEmpty("div", sectionObj.subtitle, ["subTitle"], sec);
		for (let key in sectionObj.labels) this.buildLabel(sec, sectionProp + "." + key, sectionObj.labels[key]);
		container.appendChild(sec);
	}
	, buildLabel(container, prop, labelObj) {

    let div = this.createAndAppend('div', '', ["form-group"], container);
    let tooltipValue = null;
    let tooltipPosition = 'right';
    switch (prop) {
      case 'pushNotifications.pushNotificationTitleOnSubmission':
        tooltipValue = 'Sent to all Reviewers (users that have the reviewers tag) when a new submission is created';
        tooltipPosition = 'top';
        break;
      case 'entityDetails.pushNotificationTitleOnReview': 
        tooltipValue = 'Sent to Submitters when their submissions are reviewed';
        break;
      case 'pushNotifications.pushNotificationTitleOnReview': 
        tooltipValue = 'Sent to Submitters when their submissions are reviewed';
        tooltipPosition = 'top';
        break;
      case 'entityDetails.reviewer':
        tooltipValue = 'The title of users who review submissions';
        break;
      case 'entityDetails.proccessed':
        tooltipValue = 'The status of an entity after it\'s been submitted, reviewed, and needs to be archived';
        break;
    }
		this.createAndAppend('label', labelObj.title, [], div, tooltipValue, tooltipPosition);
		let inputElement;
		let id= prop ;
		let inputType= labelObj.inputType?labelObj.inputType.toLowerCase():"";

		if (
			labelObj.inputType &&
			["textarea","wysiwyg"].indexOf(inputType)>=0
		)
			inputElement = this.createAndAppend('textarea', '', ["form-control","bf" + inputType], div);
		else {
			inputElement = this.createAndAppend('input', '', ["form-control"], div);
			inputElement.type = labelObj.inputType || "text";
		}

		inputElement.id = id;

		inputElement.autocomplete=false;
		inputElement.placeholder = labelObj.placeholder || "";


		if(labelObj.maxLength>0)
			inputElement.maxLength = labelObj.maxLength;

		inputElement.required = labelObj.required;

		inputElement.setAttribute("bfString", prop);


		if(inputType=="wysiwyg"){
			//handled outside by tinyMCE
		}
		else {

			inputElement.onkeyup = (e) => {
				stringsUI.debounce(prop, ()=>{
					if (inputElement.checkValidity()) {
						inputElement.classList.remove("bg-danger");
						stringsUI.onSave(prop, inputElement.value || inputElement.innerHTML);
					}
					else
						inputElement.classList.add("bg-danger");
				});
				e.stopPropagation();
			};
		}

		return inputElement;
	}

	, scrape() {
		let obj = {};

		this.container.querySelectorAll("*[bfString]").forEach(e => {
			let s = e.getAttribute("bfString").split(".");

			if (!obj[s[0]]) obj[s[0]] = {};

			if (e.type == "TEXTAREA")
				obj[s[0]][s[1]] = e.innerHTML;
			else
				obj[s[0]][s[1]] = e.value;
		});
		return obj;
	}
};
