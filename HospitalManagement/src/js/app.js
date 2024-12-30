App = {
  webProvider: null,
  contracts: {},
  account: '0x0',

  initWeb: async function () {
    if (window.ethereum) {
      App.webProvider = new Web3(window.ethereum);
      try {
        // Request account access if needed
        await window.ethereum.request({ method: 'eth_requestAccounts' });
  
        // Fetch and set accounts
        const accounts = await App.webProvider.eth.getAccounts();
        if (accounts.length === 0) {
          alert('No accounts found. Please connect your MetaMask account.');
          return;
        }
        App.account = accounts[0];
        $("#accountAddress").html(`Connected Account: ${App.account}`);
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
        alert('Please allow MetaMask to connect to this site.');
        return;
      }
    } else {
      alert('MetaMask is not detected. Please install MetaMask and try again.');
      return;
    }
    return App.initContract();
  },
  

  listenForEvents: async function () {
    const contractInstance = await App.contracts.patientManagement.deployed();
    contractInstance.allEvents({}, { fromBlock: 0, toBlock: "latest" }).on("data", function (event) {
      console.log("Event triggered:", event);
      App.render(); // Reload the app UI whenever an event is triggered
    });
  },

  render: async function () {
    const loader = $("#loader");
    const content = $("#content");
    loader.show();
    content.hide();

    // Connect MetaMask wallet
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        App.account = accounts[0];
        $("#accountAddress").html(`Connected Account: ${App.account}`);
      } catch (error) {
        console.error("User denied account access:", error);
        $("#accountAddress").html("Account not connected.");
        return;
      }
    }

    // Load contract instance
    const contractInstance = await App.contracts.patientManagement.deployed();

    // Fetch user count and display it
    const userCount = await contractInstance.userCount();
    $("#userCount").html(`Total Registered Users: ${userCount.toString()}`);

    // Display all patients
    const patientResults = $("#patientResults");
    patientResults.empty();
    for (let i = 1; i <= userCount; i++) {
      const patient = await contractInstance.patients(i);
      const user = await contractInstance.users(patient.userAddress);
      const vaccineStatus = await contractInstance.getVaccineStatusString(patient.vaccineStatus);

      const patientRow = `<tr>
        <td>${patient.id}</td>
        <td>${user.name}</td>
        <td>${user.age}</td>
        <td>${user.gender}</td>
        <td>${user.district}</td>
        <td>${vaccineStatus}</td>
        <td>${patient.isDead ? "Yes" : "No"}</td>
      </tr>`;
      patientResults.append(patientRow);
    }

    loader.hide();
    content.show();
  },

  registerPatient: async function () {
    const contractInstance = await App.contracts.patientManagement.deployed();

    // Get patient details from form inputs
    const patientId = $("#patientId").val();
    const name = $("#name").val();
    const age = $("#age").val();
    const gender = $("#gender").val();
    const district = $("#district").val();
    const symptomsDetails = $("#symptomsDetails").val();

    // Call registerPatients function in the smart contract
    try {
      await contractInstance.registerPatients(patientId, name, age, gender, district, symptomsDetails, { from: App.account });
      alert("Patient registered successfully!");
      App.render();
    } catch (error) {
      console.error("Error registering patient:", error);
    }
  },

  bookAppointment: async function () {
    const contractInstance = await App.contracts.patientManagement.deployed();

    // Get appointment details from form inputs
    const doctorId = $("#doctorId").val();
    const slotIndex = $("#slotIndex").val();
    const patientId = $("#patientId").val();
    const charge = $("#charge").val();

    // Call bookAppointment function in the smart contract
    try {
      await contractInstance.bookAppointment(doctorId, slotIndex, patientId, charge, { from: App.account, value: charge });
      alert("Appointment booked successfully!");
      App.render();
    } catch (error) {
      console.error("Error booking appointment:", error);
    }
  },
};

$(function () {
  $(window).load(function () {
    App.initWeb();
  });
});
