App = {
  webProvider: null,
  contracts: {},
  account: '0x0',
  patientCount: 0,
  
  initWeb: function() {
    // Check if an ethereum provider instance is available (MetaMask)
    const provider = window.ethereum;
    if (provider) {
      App.webProvider = provider;
    } else {
      $("#loader-msg").html('No metamask ethereum provider found');
      App.webProvider = new Web3(new Web3.providers.HttpProvider('http://localhost:8586'));
    }

    return App.initContract();
  },

  initContract: function() {
    // Load the contract artifacts and create a contract instance
    $.getJSON("patientManagement.json", function(patientManagement) {
      // Instantiate a new Truffle contract from the artifact
      App.contracts.patientManagement = TruffleContract(patientManagement);
      App.contracts.patientManagement.setProvider(App.webProvider);

      // Call the render function
      App.render();
    });
  },

  render: async function() {
    const loader = $("#loader");
    const content = $("#content");

    loader.show();
    content.hide();

    // Request the connected Ethereum accounts
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        App.account = accounts;
        $("#accountAddress").html(`You have ${ App.account.length } account connected from metamask: ${ App.account } <br/> Current account in use: ${App.account[0]}`);
      } catch (error) {
        if (error.code === 4001) {
          console.warn('User rejected request');
        }
        $("#accountAddress").html("Your Account: Not Connected");
        console.error(error);
      }
    }

    // Load contract instance and get patient count
    const contractInstance = await App.contracts.patientManagement.deployed();
    App.patientCount = await contractInstance.userCount();

    const patientResults = $("#patientResults");
    patientResults.empty();

    for (let i = 1; i <= App.patientCount; i++) {
      const patient = await contractInstance.patients(i);
      const patientDetails = await contractInstance.getPatientDetails(i);
      const patientTemplate = `<tr><th>${patient.id}</th><td>${patientDetails}</td></tr>`;
      patientResults.append(patientTemplate);
    }

    loader.hide();
    content.show();
  },

  // Function to register a new patient
  registerPatient: async function() {
    const contractInstance = await App.contracts.patientManagement.deployed();
    const name = $("#patientName").val();
    const age = $("#patientAge").val();
    const gender = $("#patientGender").val();
    const district = $("#patientDistrict").val();
    const symptomsDetails = $("#symptomsDetails").val();
    const patientId = App.patientCount + 1;

    // Call the smart contract to register the patient
    await contractInstance.registerPatients(patientId, name, age, gender, district, symptomsDetails, { from: App.account[0] });

    // Re-render the page after registering the patient
    App.render();
  },

  // Function to update a patient's data (e.g., vaccine status)
  updatePatientData: async function() {
    const contractInstance = await App.contracts.patientManagement.deployed();
    const adminId = $("#adminId").val();
    const patientId = $("#patientId").val();
    const vaccineStatus = parseInt($("#vaccineStatus").val());
    const isDead = $("#isDead").is(":checked");
  
    try {
      await contractInstance.updatePatientData(adminId, patientId, vaccineStatus, isDead, { from: App.account[0] });
      App.render();
    } catch (error) {
      console.error("Error updating patient data:", error);
      alert("Error updating patient data: " + error.message);
    }
  },
  

  // Function to register a doctor
  registerDoctor: async function() {
    const contractInstance = await App.contracts.patientManagement.deployed();
    const adminId = $("#adminId").val();
    const doctorId = $("#doctorId").val();

    // Call the smart contract to register the doctor
    await contractInstance.registerDoctor(adminId, doctorId, { from: App.account[0] });

    // Re-render the page after registering the doctor
    App.render();
  },

  // Function to register an admin
  registerAdmin: async function() {
    const masterAdminId = $("#masterAdminId").val();
    const adminId = $("#adminId").val();
    
    const contractInstance = await App.contracts.patientManagement.deployed();

    // Call the smart contract to register the admin
    try {
      await contractInstance.registerAdmin(masterAdminId, adminId, { from: App.account[0] });
      alert("Admin Registered Successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to register admin");
    }

    // Re-render the page after registering the admin
    App.render();
  },

  // Function to book an appointment
  // bookAppointment: async function() {
  //   const contractInstance = await App.contracts.patientManagement.deployed();
  //   const doctorId = $("#doctorId").val();
  //   const slotIndex = $("#slotIndex").val();
  //   const patientId = $("#patientId").val();
  //   const charge = $("#charge").val();

  //   // Call the smart contract to book the appointment
  //   await contractInstance.bookAppointment(doctorId, slotIndex, patientId, charge, { from: App.account[0], value: Web3.utils.toWei(charge, "ether") });

  //   // Re-render the page after booking the appointment
  //   App.render();
  // },

  bookAppointment: async function() {
    const contractInstance = await App.contracts.patientManagement.deployed();
    const doctorId = $("#doctorId").val();
    const slotIndex = $("#slotIndex").val();
    const patientId = $("#patientId").val();
    const charge = $("#charge").val();
  
    try {
      // Ensure charge is converted to ether (or an appropriate unit)
      await contractInstance.bookAppointment(
        doctorId, 
        slotIndex, 
        patientId, 
        charge, 
        { 
          from: App.account[0], 
          value: Web3.utils.toWei(charge, "ether") 
        }
      );
  
      // Re-render the page after booking the appointment
      App.render();
    } catch (error) {
      console.error("Error booking appointment:", error.message);
      alert("Error booking appointment: " + error.message);
    }
  },
  

  // Function to view patient details
//   viewPatientDetails: async function() {
//     const patientId = $("#detailsPatientId").val();
//     if (!patientId) {
//         alert("Please enter a valid Patient ID.");
//         return;
//     }

//     const contractInstance = await App.contracts.patientManagement.deployed();
//     try {
//         const patient = await contractInstance.patients(patientId);
//         const patientDetails = await contractInstance.getPatientDetails(patientId);

//         // Ensure proper formatting of data (handle any undefined or null cases)
//         const name = patient.name || "N/A";
//         const age = patient.age || "N/A";
//         const gender = patient.gender || "N/A";
//         const district = patient.district || "N/A";
//         const vaccineStatus = patientDetails.vaccineStatus || "N/A";
//         const status = patientDetails.isDead ? "Deceased" : "Alive";

//         // Update the UI with patient details
//         $("#patientName").html(name);
//         $("#patientAge").html(age);
//         $("#patientGender").html(gender);
//         $("#patientDistrict").html(district);
//         $("#patientVaccineStatus").html(vaccineStatus);
//         $("#patientStatus").html(status);

//         // Show the patient details section
//         $("#patientDetails").show();
//     } catch (error) {
//         alert("Patient not found or an error occurred.");
//         console.error(error);
//     }
// },
    viewPatientDetails: async function() {
      const patientId = $("#detailsPatientId").val();
      if (!patientId || isNaN(patientId)) {
          alert("Please enter a valid Patient ID.");
          return;
      }

      const contractInstance = await App.contracts.patientManagement.deployed();
      try {
          // Fetch the patient details using the getPatientDetails method
          const patientDetails = await contractInstance.getPatientDetails(patientId);
          
          // Ensure patientDetails is a string as expected
          if (patientDetails) {
              // Update the UI with patient details
              $("#patientDetails").html(patientDetails);
              $("#patientDetails").show();  // Display the patient details section
          } else {
              alert("Patient not found.");
          }
      } catch (error) {
          alert("An error occurred while fetching patient details.");
          console.error(error);
      }
    },


  // Function to listen for events (like appointment booking)
  listenForEvents: async function() {
    const contractInstance = await App.contracts.patientManagement.deployed();

    contractInstance.AppointmentBooked({}, {
      fromBlock: 0,
      toBlock: "latest"
    }).watch(function(err, event) {
      console.log("Triggered", event);

      // Reload the page after the event is triggered
      App.render();
    });
  }
};

$(function() {
  $(window).load(function() {
    App.initWeb();
  });
});
