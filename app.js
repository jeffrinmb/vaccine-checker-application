'use strict';

const stateDropdown = document.querySelector('#states-name');
const districtDropdown = document.querySelector('#district-name');
const chooseDate = document.querySelector('#choose-date');
const btnCheckBasedOnDistrict = document.querySelector('#btn-check-district');
const outputMessage = document.querySelector('#output');
const tableDistrictWise = document.querySelector('#tbl-response');

const covinAPI = {
  stateListAPI: 'https://cdn-api.co-vin.in/api/v2/admin/location/states',
  districtListAPI: 'https://cdn-api.co-vin.in/api/v2/admin/location/districts/',
  calenderByDistrict:
    'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict',
};

const selectedValuesBasedonDistrict = {
  stateCode: '',
  districtCode: '',
  selectedDate: '',
};

const listStates = () => {
  fetch(covinAPI.stateListAPI)
    .then(response => response.json())
    .then(json => {
      let listOfStates = "<option selected value='0'>Select</option>";
      for (const state of json.states) {
        listOfStates =
          listOfStates +
          `<option value='${state.state_id}'>${state.state_name}</option>`;
      }
      stateDropdown.innerHTML = listOfStates;
      districtDropdown.innerHTML = "<option selected value='0'>Select</option>";
    });
};

const listDistricts = stateID => {
  fetch(covinAPI.districtListAPI + stateID)
    .then(response => response.json())
    .then(json => {
      let listOfDistricts = "<option selected value='0'>Select</option>";
      for (const district of json.districts) {
        listOfDistricts =
          listOfDistricts +
          `<option value='${district.district_id}'>${district.district_name}</option>`;
      }
      districtDropdown.innerHTML = listOfDistricts;
    });
};

const displayMessage = message => {
  outputMessage.innerText = message;
};

const validateFields = () => {
  if (
    selectedValuesBasedonDistrict.stateCode === '' ||
    selectedValuesBasedonDistrict.stateCode === '0'
  ) {
    displayMessage('Choose the State');
    return false;
  }
  if (
    selectedValuesBasedonDistrict.districtCode === '' ||
    selectedValuesBasedonDistrict.districtCode === '0'
  ) {
    displayMessage('Choose the District');
    return false;
  }
  return true;
};

const listSlotsByDistrict = () => {
  fetch(
    covinAPI.calenderByDistrict +
      '?district_id=' +
      selectedValuesBasedonDistrict.districtCode +
      '&date=' +
      selectedValuesBasedonDistrict.selectedDate
  )
    .then(response => response.json())
    .then(json => displayCentersAsTable(json));
};

const displayCentersAsTable = responseObj => {
  let htmlContent = `<tr><th>Center</th>`;
  let dateHead;
  for (let i = 0; i < 7; i++) {
    let dateSplit = selectedValuesBasedonDistrict.selectedDate.split('-');
    dateHead = new Date(dateSplit[2], +dateSplit[1] - 1, +dateSplit[0] + i);
    htmlContent =
      htmlContent +
      `<th>${dateHead.toLocaleDateString('en-GB').split('/').join('-')}</th>`;
  }
  htmlContent = htmlContent + '</tr>';
  for (const center of responseObj.centers) {
    htmlContent = htmlContent + `<tr><th>${center.name}</th>`;
    for (let i = 0; i < 7; i++) {
      let dateSplit = selectedValuesBasedonDistrict.selectedDate.split('-');
      dateHead = new Date(dateSplit[2], +dateSplit[1] - 1, +dateSplit[0] + i)
        .toLocaleDateString('en-GB')
        .split('/')
        .join('-');
      let count = 0;
      for (const session of center.sessions) {
        if (session.date === dateHead) {
          count = count + session.available_capacity;
        }
      }
      htmlContent = htmlContent + `<td>${count}</td>`;
    }
    htmlContent = htmlContent + `</tr>`;
  }
  tableDistrictWise.innerHTML = htmlContent;
};

stateDropdown.addEventListener('change', event => {
  selectedValuesBasedonDistrict.stateCode = event.target.value;
  if (selectedValuesBasedonDistrict.stateCode !== '0') {
    listDistricts(selectedValuesBasedonDistrict.stateCode);
  }
});

districtDropdown.addEventListener('change', event => {
  selectedValuesBasedonDistrict.districtCode = event.target.value;
});

btnCheckBasedOnDistrict.addEventListener('click', () => {
  displayMessage('');
  let dateVal;
  if (chooseDate.value === '') {
    dateVal = new Date();
  } else {
    dateVal = new Date(chooseDate.value);
  }
  selectedValuesBasedonDistrict.selectedDate = dateVal
    .toLocaleDateString('en-GB')
    .split('/')
    .join('-');
  if (validateFields()) {
    listSlotsByDistrict();
  }
});

listStates();
