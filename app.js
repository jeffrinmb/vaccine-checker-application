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
  let listOfDistricts = "<option selected value='0'>Select</option>";
  districtDropdown.innerHTML = listOfDistricts;
  if (stateID !== '0') {
    fetch(covinAPI.districtListAPI + stateID)
      .then(response => response.json())
      .then(json => {
        for (const district of json.districts) {
          listOfDistricts =
            listOfDistricts +
            `<option value='${district.district_id}'>${district.district_name}</option>`;
        }
        districtDropdown.innerHTML = listOfDistricts;
      });
  }
  districtDropdown.innerHTML = listOfDistricts;
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

const getNextSevenDays = () => {
  let dateHead = [];
  for (let i = 0; i < 7; i++) {
    let dateSplit = selectedValuesBasedonDistrict.selectedDate.split('-');
    dateHead.push(
      new Date(dateSplit[2], +dateSplit[1] - 1, +dateSplit[0] + i)
        .toLocaleDateString('en-GB')
        .split('/')
        .join('-')
    );
  }
  return dateHead;
};

const createAvailabiltyColumn = (center, dateShown) => {
  const feeType = center.fee_type;
  let vaccineType = '';
  let vaccineFee = '';
  let minAgeLimit = '';
  let maxAgeLimit = '';
  let allowAllAge = '';
  let availableDose1 = '';
  let availableDose2 = '';
  let htmlColumn = '<td>';
  for (const session of center.sessions) {
    if (session.date === dateShown) {
      vaccineType = session.vaccine;
      allowAllAge = session.allow_all_age;
      availableDose1 = session.available_capacity_dose1;
      availableDose2 = session.available_capacity_dose2;
      if (!allowAllAge) {
        minAgeLimit = session.min_age_limit;
        maxAgeLimit = session?.max_age_limit ?? '';
      } else {
        minAgeLimit = session.min_age_limit;
      }
      if (feeType === 'Paid') {
        for (const fees of center.vaccine_fees) {
          if (fees.vaccine === vaccineType) {
            vaccineFee = fees.fee;
          }
        }
      } else {
        vaccineFee = 'Free';
      }
      htmlColumn =
        htmlColumn +
        `<div><div>${vaccineType} (${minAgeLimit}${
          maxAgeLimit !== '' ? ' - ' + maxAgeLimit : '+'
        })</div>
        <div>Dose 1: <span>${availableDose1}</span> Dose 2: <span>${availableDose2}</span></div>
        <div>Fees: <span>${vaccineFee}</span></div>
        </div>`;
    }
  }
  htmlColumn = htmlColumn + '</td>';
  return htmlColumn;
};

const displayCentersAsTable = responseObj => {
  let htmlContent = `<tr><th>Center</th>`;
  for (const dateShown of getNextSevenDays()) {
    htmlContent = htmlContent + `<th>${dateShown}</th>`;
  }
  htmlContent = htmlContent + '</tr>';
  for (const center of responseObj.centers) {
    htmlContent =
      htmlContent +
      `<tr><th><div>${center.name}</div>
      <div>${center.fee_type}</div></th>`;
    for (const dateShown of getNextSevenDays()) {
      htmlContent = htmlContent + createAvailabiltyColumn(center, dateShown);
    }
    htmlContent = htmlContent + `</tr>`;
  }
  tableDistrictWise.innerHTML = htmlContent;
};

stateDropdown.addEventListener('change', event => {
  selectedValuesBasedonDistrict.stateCode = event.target.value;
  listDistricts(selectedValuesBasedonDistrict.stateCode);
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
