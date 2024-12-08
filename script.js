// scheduler.js

let processes = [];

// Add process to the list
function addProcess() {
  const id = document.getElementById('processId').value.trim();
  const arrival = parseInt(document.getElementById('arrivalTime').value);
  const burst = parseInt(document.getElementById('burstTime').value);

  if (id && !isNaN(arrival) && !isNaN(burst)) {
    processes.push({ id, arrival, burst });
    document.getElementById('processId').value = '';
    document.getElementById('arrivalTime').value = '';
    document.getElementById('burstTime').value = '';
    updateProcessTable();
  } else {
    alert('Please enter valid inputs.');
  }
}

// Update process table
function updateProcessTable() {
  const tbody = document.querySelector('#processTable tbody');
  tbody.innerHTML = '';
  processes.forEach((process, index) => {
    const row = `<tr>
      <td>${process.id}</td>
      <td>${process.arrival}</td>
      <td>${process.burst}</td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

// FCFS Algorithm
function calculateFCFS() {
  if (processes.length === 0) {
    alert('No processes to schedule.');
    return;
  }

  processes.sort((a, b) => a.arrival - b.arrival);

  let time = 0;
  let waitingTime = 0;
  let turnaroundTime = 0;
  let resultsHTML = '<table><tr><th>Process ID</th><th>Start Time</th><th>End Time</th></tr>';
  let ganttHTML = '';

  processes.forEach((process) => {
    const start = Math.max(time, process.arrival);
    const end = start + process.burst;
    waitingTime += start - process.arrival;
    turnaroundTime += end - process.arrival;

    resultsHTML += `<tr>
      <td>${process.id}</td>
      <td>${start}</td>
      <td>${end}</td>
    </tr>`;

    ganttHTML += `<div class="gantt-bar" style="width: ${process.burst * 20}px; background-color: #${Math.floor(Math.random() * 16777215).toString(16)};">
      ${process.id}
    </div>`;

    time = end;
  });

  resultsHTML += '</table>';
  document.getElementById('results').innerHTML = `
    ${resultsHTML}
    <p>Average Waiting Time: ${(waitingTime / processes.length).toFixed(2)}</p>
    <p>Average Turnaround Time: ${(turnaroundTime / processes.length).toFixed(2)}</p>
  `;
  document.getElementById('ganttChart').innerHTML = ganttHTML;
}
// SJF Algorithm
function calculateSJF() {
  if (processes.length === 0) {
    alert('No processes to schedule.');
    return;
  }

  let time = 0;
  let completedProcesses = 0;
  let waitingTime = 0;
  let turnaroundTime = 0;
  const remainingProcesses = [...processes]; // Clone processes to manipulate

  let resultsHTML = '<table><tr><th>Process ID</th><th>Start Time</th><th>End Time</th></tr>';
  let ganttHTML = '';

  while (completedProcesses < processes.length) {
    // Filter processes that have arrived and are not yet completed
    const availableProcesses = remainingProcesses.filter((p) => p.arrival <= time);

    if (availableProcesses.length === 0) {
      time++; // Increment time if no process is available
      continue;
    }

    // Select process with the shortest burst time
    const shortestProcess = availableProcesses.reduce((prev, curr) =>
      prev.burst < curr.burst ? prev : curr
    );

    // Calculate timing
    const start = time;
    const end = start + shortestProcess.burst;
    waitingTime += start - shortestProcess.arrival;
    turnaroundTime += end - shortestProcess.arrival;

    resultsHTML += `<tr>
      <td>${shortestProcess.id}</td>
      <td>${start}</td>
      <td>${end}</td>
    </tr>`;

    ganttHTML += `<div class="gantt-bar" style="width: ${shortestProcess.burst * 20}px; background-color: #${Math.floor(
      Math.random() * 16777215
    ).toString(16)};">
      ${shortestProcess.id}
    </div>`;

    time = end;
    completedProcesses++;
    // Remove the completed process
    remainingProcesses.splice(remainingProcesses.indexOf(shortestProcess), 1);
  }

  resultsHTML += '</table>';
  document.getElementById('results').innerHTML = `
    ${resultsHTML}
    <p>Average Waiting Time: ${(waitingTime / processes.length).toFixed(2)}</p>
    <p>Average Turnaround Time: ${(turnaroundTime / processes.length).toFixed(2)}</p>
  `;
  document.getElementById('ganttChart').innerHTML = ganttHTML;
}
// Round Robin Algorithm
function calculateRR() {
  const quantum = parseInt(document.getElementById('timeQuantum').value);

  if (isNaN(quantum) || quantum <= 0) {
    alert('Please enter a valid time quantum.');
    return;
  }

  if (processes.length === 0) {
    alert('No processes to schedule.');
    return;
  }

  // Clone processes and initialize variables
  const queue = processes.map((p) => ({ ...p, remainingBurst: p.burst }));
  let time = 0;
  let waitingTime = 0;
  let turnaroundTime = 0;
  let completedProcesses = 0;

  let resultsHTML = '<table><tr><th>Process ID</th><th>Start Time</th><th>End Time</th></tr>';
  let ganttHTML = '';

  while (completedProcesses < processes.length) {
    let executed = false;

    for (let i = 0; i < queue.length; i++) {
      const process = queue[i];

      if (process.remainingBurst > 0 && process.arrival <= time) {
        executed = true;

        const start = time;
        const burst = Math.min(process.remainingBurst, quantum);
        time += burst;
        process.remainingBurst -= burst;

        if (process.remainingBurst === 0) {
          completedProcesses++;
          waitingTime += time - process.arrival - process.burst;
          turnaroundTime += time - process.arrival;
        }

        resultsHTML += `<tr>
          <td>${process.id}</td>
          <td>${start}</td>
          <td>${time}</td>
        </tr>`;

        ganttHTML += `<div class="gantt-bar" style="width: ${burst * 20}px; background-color: #${Math.floor(
          Math.random() * 16777215
        ).toString(16)};">
          ${process.id}
        </div>`;
      }
    }

    // If no process executed, increment time to next available process
    if (!executed) {
      time++;
    }
  }

  resultsHTML += '</table>';
  document.getElementById('results').innerHTML = `
    ${resultsHTML}
    <p>Average Waiting Time: ${(waitingTime / processes.length).toFixed(2)}</p>
    <p>Average Turnaround Time: ${(turnaroundTime / processes.length).toFixed(2)}</p>
  `;
  document.getElementById('ganttChart').innerHTML = ganttHTML;
}
// Priority Scheduling Algorithm (Non-Preemptive)
function calculatePriority() {
  if (processes.length === 0) {
    alert('No processes to schedule.');
    return;
  }

  // Add priority to the processes if not already done
  processes.forEach((p) => {
    if (p.priority === undefined) {
      p.priority = parseInt(prompt(`Enter priority for process ${p.id}:`, 1)) || 1;
    }
  });

  // Sort processes based on arrival time and priority
  processes.sort((a, b) => {
    if (a.arrival === b.arrival) {
      return a.priority - b.priority; // Lower priority value is higher priority
    }
    return a.arrival - b.arrival;
  });

  let time = 0;
  let waitingTime = 0;
  let turnaroundTime = 0;
  let resultsHTML = '<table><tr><th>Process ID</th><th>Start Time</th><th>End Time</th></tr>';
  let ganttHTML = '';

  processes.forEach((process) => {
    const start = Math.max(time, process.arrival);
    const end = start + process.burst;
    waitingTime += start - process.arrival;
    turnaroundTime += end - process.arrival;

    resultsHTML += `<tr>
      <td>${process.id}</td>
      <td>${start}</td>
      <td>${end}</td>
    </tr>`;

    ganttHTML += `<div class="gantt-bar" style="width: ${process.burst * 20}px; background-color: #${Math.floor(
      Math.random() * 16777215
    ).toString(16)};">
      ${process.id} (P${process.priority})
    </div>`;

    time = end;
  });

  resultsHTML += '</table>';
  document.getElementById('results').innerHTML = `
    ${resultsHTML}
    <p>Average Waiting Time: ${(waitingTime / processes.length).toFixed(2)}</p>
    <p>Average Turnaround Time: ${(turnaroundTime / processes.length).toFixed(2)}</p>
  `;
  document.getElementById('ganttChart').innerHTML = ganttHTML;
}




