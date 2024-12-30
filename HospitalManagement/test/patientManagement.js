let PatientManagement = artifacts.require("./patientManagement.sol");

contract("PatientManagement", async function (accounts) {
    console.log("Your Available Ganache Accounts: " + accounts);

    it("initializes with one admin", async function () {
        // Fetch the deployed contract instance
        const deployedContract = await PatientManagement.deployed();

        // Check the first admin's address
        const adminAddress = await deployedContract.adminAddresses(1);

        // Validate the admin address matches the deployer
        assert.equal(adminAddress, accounts[0], "Admin address is correctly initialized to the deployer's address");
    });

    it("registers a new patient", async function () {
        const deployedContract = await PatientManagement.deployed();

        // Register a patient
        await deployedContract.registerPatients(
            1, 
            "John Doe", 
            30, 
            "Male", 
            "New York", 
            "Cough and Fever",
            { from: accounts[1] }
        );

        // Fetch the patient details
        const patient = await deployedContract.patients(1);
        const user = await deployedContract.users(accounts[1]);

        // Validate the patient data
        assert.equal(patient.id, 1, "Patient ID is correct");
        assert.equal(patient.userAddress, accounts[1], "Patient address is correct");
        assert.equal(patient.symptomsDetails, "Cough and Fever", "Symptoms details are correct");
        assert.equal(patient.isDead, false, "Patient is not marked as deceased");

        // Validate the user data
        assert.equal(user.name, "John Doe", "User name is correct");
        assert.equal(user.age, 30, "User age is correct");
        assert.equal(user.gender, "Male", "User gender is correct");
        assert.equal(user.district, "New York", "User district is correct");
    });

    it("registers a new doctor by admin", async function () {
        const deployedContract = await PatientManagement.deployed();

        // Register a doctor
        await deployedContract.registerDoctor(1, 2, { from: accounts[0] });

        // Check if the doctor is registered
        const isDoctor = await deployedContract.isDoctor(2);
        const doctorAddress = await deployedContract.doctorAddresses(2);

        assert.equal(isDoctor, true, "Doctor is registered successfully");
        assert.equal(doctorAddress, accounts[0], "Doctor address is correctly stored");
    });

    it("books an appointment", async function () {
        const deployedContract = await PatientManagement.deployed();

        // Book an appointment for a doctor
        await deployedContract.bookAppointment(2, 0, 1, 10, { from: accounts[1], value: 10 });

        // Fetch the appointment details
        const doctorAppointments = await deployedContract.getAppointments(2);
        assert.include(doctorAppointments, "PatientID: 1", "Appointment includes the correct patient ID");
        assert.include(doctorAppointments, "Charge: 10", "Appointment includes the correct charge");
    });

    it("updates patient vaccine status", async function () {
        const deployedContract = await PatientManagement.deployed();

        // Update vaccine status
        await deployedContract.updatePatientData(1, 1, 2, false, { from: accounts[0] }); // TwoDose

        // Check the updated status
        const patient = await deployedContract.patients(1);
        assert.equal(patient.vaccineStatus, 2, "Vaccine status updated to TwoDose");
    });
});
