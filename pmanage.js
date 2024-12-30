// scripts.js
document.getElementById('doctorRegistrationForm').addEventListener('submit', function(event) {
  event.preventDefault();
  // Doctor registration logic using the smart contract goes here
  alert('Doctor registered successfully!');
});

document.getElementById('patientRegistrationForm').addEventListener('submit', function(event) {
  event.preventDefault();
  // Patient registration logic using the smart contract goes here
  alert('Patient registered successfully!');
});

document.getElementById('updateForm').addEventListener('submit', function(event) {
  event.preventDefault();
  // Update logic using the smart contract goes here
  const patientId = document.getElementById('patientIdUpdate').value;
  const adminId = document.getElementById('adminIdUpdate').value;
  const vaccineStatus = document.getElementById('vaccineStatus').value;
  const isDeceased = document.getElementById('isDeceased').value;

  if (validateStatus(vaccineStatus, isDeceased)) {
    // Call smart contract function to update data
    document.getElementById('updateMessage').innerText = 'Patient information updated successfully!';
  } else {
    document.getElementById('updateMessage').innerText = 'Invalid values. Please try again.';
  }
});

document.getElementById('doctorAppointmentsForm').addEventListener('submit', function(event) {
  event.preventDefault();
  // Logic to fetch and display doctor appointments using the smart contract goes here
  const doctorId = document.getElementById('doctorIdAppointments').value;

  // Example logic for fetching appointments (replace with actual smart contract call)
  const appointments = getDoctorAppointments(doctorId);
  displayAppointments(appointments);
});

function validateStatus(vaccineStatus, isDeceased) {
  // Validate the vaccine status and isDeceased value according to the project's requirements
  const validVaccineStatuses = ['not vaccinated', 'one dose', 'two dose'];
  const validIsDeceasedStatuses = ['yes', 'no'];
  return validVaccineStatuses.includes(vaccineStatus) && validIsDeceasedStatuses.includes(isDeceased);
}

function getDoctorAppointments(doctorId) {
  // Mock function to simulate fetching appointments from the smart contract
  return [
    { patientId: 'P123', appointmentTime: '2023-01-01 10:00' },
    { patientId: 'P124', appointmentTime: '2023-01-02 11:00' },
  ];
}

function displayAppointments(appointments) {
  const appointmentsList = document.getElementById('appointmentsList');
  appointmentsList.innerHTML = '';
  if (appointments.length > 0) {
    const ul = document.createElement('ul');
    appointments.forEach(appointment => {
      const li = document.createElement('li');
      li.textContent = `Patient ID: ${appointment.patientId}, Appointment Time: ${appointment.appointmentTime}`;
      ul.appendChild(li);
    });
    appointmentsList.appendChild(ul);
  } else {
    appointmentsList.textContent = 'No appointments found for this doctor.';
  }
}

function showCovidTrend() {
  const patients = getPatients(); // Replace with actual smart contract call to get patient data
  const ageGroups = {
    children: 0,
    teenagers: 0,
    young: 0,
    elder: 0,
  };
  let totalAge = 0;
  const ages = [];

  patients.forEach(patient => {
    const age = patient.age;
    totalAge += age;
    ages.push(age);

    if (age < 13) {
      ageGroups.children++;
    } else if (age < 20) {
      ageGroups.teenagers++;
    } else if (age < 50) {
      ageGroups.young++;
    } else {
      ageGroups.elder++;
    }
  });

  const medianAge = calculateMedian(ages);
  const totalPatients = patients.length;
  const covidTrendTable = document.getElementById('covidTrendTable');
  covidTrendTable.innerHTML = `
    <p>Median Age: ${medianAge}</p>
    <p>Percentage of Children: ${(ageGroups.children / totalPatients) * 100}%</p>
    <p>Percentage of Teenagers: ${(ageGroups.teenagers / totalPatients) * 100}%</p>
    <p>Percentage of Young: ${(ageGroups.young / totalPatients) * 100}%</p>
    <p>Percentage of Elder: ${(ageGroups.elder / totalPatients) * 100}%</p>
  `;
}

function calculateMedian(ages) {
  ages.sort((a, b) => a - b);
  const mid = Math.floor(ages.length / 2);
  if (ages.length % 2 === 0) {
    return (ages[mid - 1] + ages[mid]) / 2;
  } else {
    return ages[mid];
  }
}

function getPatients() {
  // Mock function to simulate fetching patient data from the smart contract
  return [
    { age: 25 }, { age: 29 }, { age: 30 }, { age: 15 }, { age: 30 }
  ];
}
