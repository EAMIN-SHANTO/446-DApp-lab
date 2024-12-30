App = {
  webProvider: null,
  contracts: {},
  account: '0x0',

  initWeb: async function () {
    if (window.ethereum) {
      // Modern dapp browsers with MetaMask
      App.webProvider = new Web3(window.ethereum);
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (error) {
        console.error("User denied account access");
        $("#loader-msg").html('User denied account access to Ethereum provider');
        return;
      }
    } else if (window.web3) {
      // Legacy dapp browsers
      App.webProvider = new Web3(window.web3.currentProvider);
    } else {
      // Non-dapp browsers
      $("#loader-msg").html('No Ethereum provider found. Install MetaMask.');
      App.webProvider = new Web3(new Web3.providers.HttpProvider('http://localhost:8586'));
    }
    return App.initContract();
  },

  initContract: async function () {
    try {
      const response = await $.getJSON("PatientManagement.json");
      App.contracts.PatientManagement = TruffleContract(response);
      App.contracts.PatientManagement.setProvider(App.webProvider.currentProvider);
      App.contractInstance = await App.contracts.PatientManagement.deployed();
      return App.render();
    } catch (error) {
      console.error("Error loading contract:", error);
      $("#loader-msg").html('Failed to load contract.');
    }
  },

  render: async function () {
    const loader = $("#loader");
    const content = $("#content");
    loader.show();
    content.hide();

    try {
      const accounts = await App.webProvider.eth.getAccounts();
      App.account = accounts[0];
      $("#accountAddress").html(`Your Account: ${App.account}`);

      const userCount = await App.contractInstance.userCount();
      const patientList = $("#patientList");
      patientList.empty();

      for (let i = 1; i <= userCount; i++) {
        const patientDetails = await App.contractInstance.getPatientDetails(i);
        const detailsArray = patientDetails.split(",");
        const template = `
          <tr>
            <td>${detailsArray[0]}</td>
            <td>${detailsArray[1]}</td>
            <td>${detailsArray[2]}</td>
            <td>${detailsArray[3]}</td>
            <td>${detailsArray[4]}</td>
          </tr>`;
        patientList.append(template);
      }
      loader.hide();
      content.show();
    } catch (error) {
      console.error("Error rendering page:", error);
      $("#loader-msg").html('Error loading data.');
    }
  },

  bookAppointment: async function () {
    const doctorId = $("#doctorId").val();
    const slotIndex = $("#slotIndex").val();
    const charge = $("#charge").val();

    try {
      await App.contractInstance.bookAppointment(doctorId, slotIndex, charge, {
        from: App.account,
        value: Web3.utils.toWei(charge, "ether"),
      });
      alert("Appointment booked successfully!");
      App.render();
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("Failed to book appointment.");
    }
  },

  registerDoctor: async function () {
    const doctorId = $("#doctorIdInput").val();

    try {
      await App.contractInstance.registerDoctor(1, doctorId, { from: App.account }); // Assuming `1` is the admin ID.
      alert("Doctor registered successfully!");
      App.render();
    } catch (error) {
      console.error("Error registering doctor:", error);
      alert("Failed to register doctor.");
    }
  },

  updatePatientData: async function () {
    const patientId = $("#patientId").val();
    const vaccineStatus = parseInt($("#vaccineStatus").val());
    const isDead = $("#isDead").is(":checked");

    try {
      await App.contractInstance.updatePatientData(1, patientId, vaccineStatus, isDead, { from: App.account }); // Assuming `1` is the admin ID.
      alert("Patient data updated successfully!");
      App.render();
    } catch (error) {
      console.error("Error updating patient data:", error);
      alert("Failed to update patient data.");
    }
  },
};

$(function () {
  $(window).load(function () {
    App.initWeb();
  });
});
