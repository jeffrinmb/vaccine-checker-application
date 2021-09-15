'use strict';

const stateDropdown = document.querySelector('#states-name');
const districtDropdown = document.querySelector('#district-name');

const stateAPIURL = 'https://cdn-api.co-vin.in/api/v2/admin/location/states';
const districtAPIURL =
  'https://cdn-api.co-vin.in/api/v2/admin/location/districts/';

const listStates = () => {
  fetch(stateAPIURL)
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
  fetch(districtAPIURL + stateID)
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

stateDropdown.addEventListener('change', event => {
  const stateID = event.target.value;
  if (stateID !== '0') {
    listDistricts(stateID);
  }
});

districtDropdown.addEventListener('change', event => {
  console.log(event.target.value);
});

listStates();
