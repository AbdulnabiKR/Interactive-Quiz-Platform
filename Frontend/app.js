const API_BASE = 'http://localhost:8082/api';
let quizTimerId = null;
let loggedInUsername = null;

window.onload = function() {
   showLogin(); 
  showLoginStatus();
};


// ---- UI Helpers ----
function showLoginStatus() {
  const header = document.querySelector('h1');
  if (loggedInUsername) {
    header.innerHTML = `
      Quiz Platform
      <span style="font-size:medium; float:right">
        User: ${loggedInUsername}
        <button onclick="logout()">Logout</button>
      </span>`;
  } else {
    header.innerHTML = `
      Quiz Platform
      <span style="font-size:medium; float:right">
        <button onclick="showLogin()">Login</button>
      </span>`;
  }

  // Show/hide Admin button
  const adminBtn = document.querySelector('button[onclick="showAdminPanel()"]');
  if (adminBtn) {
    adminBtn.style.display = (loggedInUsername === 'admin') ? 'inline-block' : 'none';
  }
}



function logout() {
  loggedInUsername = null;

  // Hide admin button and panel
  const adminBtn = document.querySelector('button[onclick="showAdminPanel()"]');
  if (adminBtn) adminBtn.style.display = 'none';

  const adminPanel = document.getElementById('admin-panel');
  if (adminPanel) adminPanel.style.display = 'none';

  // Restore main quiz view (optional)
  document.getElementById('main-content').innerHTML = `
    <div id="quiz-list" class="section"></div>
    <div id="quiz-detail" class="section"></div>
  `;

  showLoginStatus();
 
}


function showLogin() {
 
    document.getElementById('main-content').innerHTML = `
    <form id="login-form">
      <input name="username" placeholder="Username" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <p style="margin-top:10px; font-size:14px;">
      Demo credentials – Admin: admin / admin123 | User: jane_smith/ jane123
    </p>
  `;
  document.getElementById('login-form').onsubmit = function(e){
    e.preventDefault();
    const fd = new FormData(this);
    const username = fd.get('username');
    const password = fd.get('password');

    fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Invalid username or password');
        }
        return res.json();
      })
      .then(user => {
        loggedInUsername = user.username;

        // restore quiz layout after login
        document.getElementById('main-content').innerHTML = `
          <div id="quiz-list" class="section"></div>
          <div id="quiz-detail" class="section"></div>
        `;

        showLoginStatus();
        loadQuizList();  // now this will find #quiz-list correctly
      })
      .catch(err => {
        showError(err);
      });
  };
}




// ---- Quiz List/Search ----
function loadQuizList() {
  clearError();
  fetch(`${API_BASE}/quizzes`)
    .then(res => res.json())
    .then(data => {
      let listDiv = document.getElementById('quiz-list');
      listDiv.innerHTML = '<input id="quiz-search" placeholder="Find quiz..." oninput="filterQuizzes()" style="margin-bottom:10px"/>';
      listDiv.innerHTML += '<h2>All Quizzes</h2>';
      if (!data || data.length === 0) {
        listDiv.innerHTML += '<p>No quizzes available.</p>';
        return;
      }
      data.forEach(q => {
        let div = document.createElement('div');
        div.className = 'quiz-card';
        div.innerHTML = `
          <h2>${q.title}</h2>
          <p>${q.description}</p>
          <button onclick="showQuizDetail(${q.id})">Show Details</button>
        `;
        listDiv.appendChild(div);
      });
      document.getElementById('quiz-detail').innerHTML = '';
    })
    .catch(showError);
}

function filterQuizzes() {
  const value = document.getElementById('quiz-search').value.trim().toLowerCase();
  document.querySelectorAll('.quiz-card').forEach(div =>
    div.style.display = div.textContent.toLowerCase().includes(value) ? "" : "none"
  );
}

function showQuizDetail(quizId) {
  if (!loggedInUsername) {
    alert("Please login first to attempt quizzes.");
    showLogin();
    return;
  }

  clearError();
  fetch(`${API_BASE}/quizzes/${quizId}`)
    .then(res => res.json())
    .then(q => {
      let detailDiv = document.getElementById('quiz-detail');
      detailDiv.innerHTML = `
        <h2>Quiz Details</h2>
        <p><strong>Title:</strong> ${q.title}</p>
        <p><strong>Description:</strong> ${q.description}</p>
        <p><strong>Status:</strong> ${q.status}</p>
        <button onclick="loadQuizQuestions(${q.id})">Show Questions</button>
        <button onclick="loadQuizList()">Back to Quizzes</button>
      `;
      fetch(`${API_BASE}/quiz-attempts/summary?userId=1&quizId=${quizId}`)
        .then(res => res.json())
        .then(summary => {
          if (!summary) return;
          const infoP = document.createElement('p');
          let text = `You have attempted this quiz ${summary.attemptsCount} time(s).`;
          if (summary.lastScore != null) {
            text += ` Last score: ${summary.lastScore}%.`;
          }
          infoP.textContent = text;
          detailDiv.appendChild(infoP);
        })
        .catch(() => {});
    })
    .catch(showError);
}


function loadQuizQuestions(quizId) {
    if (!loggedInUsername) {
    alert("Please login first to attempt quizzes.");
    showLogin();
    return;
  }
  clearError();
  fetch(`${API_BASE}/questions?quizId=${quizId}`)
    .then(res => res.json())
    .then(questions => {
      let detailDiv = document.getElementById('quiz-detail');
      if (!questions || questions.length === 0) {
        detailDiv.innerHTML = '<p>No questions for this quiz.</p>';
        return;
      }
      let formHtml = `<h3>Attempt Quiz</h3>
      <form id="quiz-form">`;
      questions.forEach((q, idx) => {
        formHtml += `
        <div class="quiz-question">
          <p><strong>Q${idx + 1}. ${q.questionText}</strong></p>
          <label><input type="radio" name="q${q.id}" value="A" required> ${q.optionA}</label><br>
          <label><input type="radio" name="q${q.id}" value="B"> ${q.optionB}</label><br>
          <label><input type="radio" name="q${q.id}" value="C"> ${q.optionC}</label><br>
          <label><input type="radio" name="q${q.id}" value="D"> ${q.optionD}</label>
        </div>`;
      });
      formHtml += `<button type="submit">Submit Answers</button>
                   <button type="button" onclick="loadQuizList()">Cancel</button>
      </form>`;
      detailDiv.innerHTML = formHtml;
      startQuizTimer(180); 
      window.attemptQuizInfo = { quizId, questions };
      document.getElementById('quiz-form').onsubmit = submitQuizAttempt;
    }).catch(showError);
}

function submitQuizAttempt(event) {
  if (quizTimerId) {
    clearInterval(quizTimerId);
    quizTimerId = null;
  }
  event.preventDefault();

  const userId = loggedInUsername ? 1 : 1;
  const quizId = window.attemptQuizInfo.quizId;
  const questions = window.attemptQuizInfo.questions;

  // 1) Calculate correct answers
  let correct = 0;
  let promises = [];
  questions.forEach(q => {
    const chosen = document.querySelector(`input[name="q${q.id}"]:checked`);
    if (chosen) {
      const chosenOpt = chosen.value;
      if (chosenOpt === q.correctOption) correct++;
    }
  });

  const total = questions.length;
  const percent = Math.round((correct / total) * 100);

  // 2) Save attempt with score
  fetch(`${API_BASE}/quiz-attempts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      quizId,
      startedAt: new Date().toISOString().slice(0,19),
      score: percent
    })
  })
    .then(res => res.json())
    .then(attempt => {
      // 3) Save each attempted question
      questions.forEach(q => {
        const chosen = document.querySelector(`input[name="q${q.id}"]:checked`);
        if (chosen) {
          const chosenOpt = chosen.value;
          promises.push(
            fetch(`${API_BASE}/attempted-questions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                attemptId: attempt.id,
                questionId: q.id,
                chosenOption: chosenOpt,
                isCorrect: chosenOpt === q.correctOption
              })
            })
          );  
        }
      });

      return Promise.all(promises).then(() => {
        showQuizResult(correct, total);
      });
    })
    .catch(showError);
}


function showQuizResult(correct, total) {
  const percent = Math.round((correct / total) * 100);
  let message;
  if (percent === 100) message = 'Excellent!';
  else if (percent >= 70) message = 'Great job!';
  else if (percent >= 40) message = 'Keep practicing!';
  else message = 'Try again and improve.';

  document.getElementById('quiz-detail').innerHTML =
    `<h2>Quiz Submitted!</h2>
     <p>Your Score: <strong>${correct}/${total} (${percent}%)</strong></p>
     <p>${message}</p>
     <button onclick="loadQuizList()">Back to Quizzes</button>`;
}



// ---- Admin Management ----
function showAdminPanel() {
    if (loggedInUsername !== 'admin') {
    alert('Only admin can access this section.');
    return;
  }
  document.getElementById('admin-panel').style.display = 'block';
  showAdminQuizzes();
  showAdminQuestions();
}

function showAdminQuizzes() {
  fetch(`${API_BASE}/quizzes`)
    .then(res => res.json())
    .then(data => {
      let html = '<h3>Manage Quizzes</h3><table border="1"><tr><th>Title</th><th>Actions</th></tr>';
      data.forEach(q => {
        html += `<tr><td>${q.title}</td>
        <td>
          <button onclick="editQuiz(${q.id},'${q.title.replace(/'/g,"\\'")}','${q.description?.replace(/'/g,"\\'") || ""}')">Edit</button>
          <button onclick="deleteQuiz(${q.id})">Delete</button>
        </td></tr>`;
      });
      html += '</table><button onclick="showAddQuizForm()">Add Quiz</button>';
      document.getElementById('admin-quizzes').innerHTML = html;
    });
}

function showAddQuizForm() {
  document.getElementById('admin-quizzes').innerHTML +=
    `<h4>Add Quiz</h4>
     <form id="add-quiz-form">
      <input name="title" placeholder="Quiz Title" required />
      <input name="description" placeholder="Description"/>
      <button type="submit">Create</button>
     </form>`;
  document.getElementById('add-quiz-form').onsubmit = function(e){
    e.preventDefault();
    const fd = new FormData(this);
    const newTitle = fd.get('title').trim().toLowerCase();

    // Frontend: check for duplicate title
    fetch(`${API_BASE}/quizzes`)
      .then(res => res.json())
      .then(data => {
        let exists = data.some(q => q.title.trim().toLowerCase() === newTitle);
        if (exists) {
          alert("A quiz with this title already exists.");
          return;
        }
        // If no duplicate, proceed to add
        fetch(`${API_BASE}/quizzes`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({title: fd.get('title'), description: fd.get('description') || '', status: "active"})
        }).then(()=>showAdminQuizzes());
      });
  };
}


function editQuiz(id, title, description) {
  document.getElementById('admin-quizzes').innerHTML +=
    `<h4>Edit Quiz</h4>
     <form id="edit-quiz-form">
      <input name="title" value="${title}" required />
      <input name="description" value="${description || ""}"/>
      <button type="submit">Update</button>
     </form>`;
  document.getElementById('edit-quiz-form').onsubmit = function(e){
    e.preventDefault();
    const fd = new FormData(this);
    fetch(`${API_BASE}/quizzes/${id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({title: fd.get('title'), description: fd.get('description'), status: "active"})
    }).then(()=>showAdminQuizzes());
  };
}

function deleteQuiz(id) {
  if (confirm("Are you sure?")) {
    fetch(`${API_BASE}/quizzes/${id}`, {method: 'DELETE'}).then(()=>showAdminQuizzes());
  }
}

// --- Admin Question CRUD ---
function showAdminQuestions() {
  fetch(`${API_BASE}/questions`)
    .then(res => res.json())
    .then(data => {
      let html = '<h3>Manage Questions</h3><table border="1"><tr><th>Text</th><th>QuizId</th><th>Actions</th></tr>';
      data.forEach(q => {
        html += `<tr>
          <td>${q.questionText}</td><td>${q.quizId || ''}</td>
          <td>
            <button onclick="editQuestion(${q.id},'${q.questionText.replace(/'/g,"\\'")}','${q.optionA}','${q.optionB}','${q.optionC}','${q.optionD}','${q.correctOption}')">Edit</button>
            <button onclick="deleteQuestion(${q.id})">Delete</button>
          </td></tr>`;
      });
      html += '</table><button onclick="showAddQuestionForm()">Add Question</button>';
      document.getElementById('admin-questions').innerHTML = html;
    });
}

function showAddQuestionForm() {
  document.getElementById('admin-questions').innerHTML +=
    `<form id="add-qf">
      <input name="questionText" placeholder="Question" required />
      <input name="optionA" placeholder="A" required />
      <input name="optionB" placeholder="B" required />
      <input name="optionC" placeholder="C" required />
      <input name="optionD" placeholder="D" required />
      <input name="correctOption" placeholder="Correct (A/B/C/D)" required />
      <input name="quizId" placeholder="Quiz ID (Number)" required />
      <button type="submit">Add Question</button>
    </form>`;
  document.getElementById('add-qf').onsubmit = function(e){
    e.preventDefault();
    const fd = new FormData(this);
    fetch(`${API_BASE}/questions`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        questionText: fd.get('questionText'),
        optionA: fd.get('optionA'),
        optionB: fd.get('optionB'),
        optionC: fd.get('optionC'),
        optionD: fd.get('optionD'),
        correctOption: fd.get('correctOption'),
        quizId: parseInt(fd.get('quizId')),
        createdAt: new Date().toISOString().slice(0,19)
      })
    }).then(()=>showAdminQuestions());
  };
}

function editQuestion(id, questionText, optionA, optionB, optionC, optionD, correctOption) {
  document.getElementById('admin-questions').innerHTML +=
    `<form id="edit-qf">
      <input name="questionText" value="${questionText}" required />
      <input name="optionA" value="${optionA}" required />
      <input name="optionB" value="${optionB}" required />
      <input name="optionC" value="${optionC}" required />
      <input name="optionD" value="${optionD}" required />
      <input name="correctOption" value="${correctOption}" required />
      <button type="submit">Update Question</button>
    </form>`;
  document.getElementById('edit-qf').onsubmit = function(e){
    e.preventDefault();
    const fd = new FormData(this);
    fetch(`${API_BASE}/questions/${id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        questionText: fd.get('questionText'),
        optionA: fd.get('optionA'),
        optionB: fd.get('optionB'),
        optionC: fd.get('optionC'),
        optionD: fd.get('optionD'),
        correctOption: fd.get('correctOption')
      })
    }).then(()=>showAdminQuestions());
  };
}

function deleteQuestion(id) {
  if (confirm("Are you sure?")) {
    fetch(`${API_BASE}/questions/${id}`, {method: 'DELETE'}).then(()=>showAdminQuestions());
  }
}

// ---- Utility functions ----
function showError(error) {
  document.getElementById('error').textContent = error.message || error;
}
function clearError() {
  document.getElementById('error').textContent = '';
}


function startQuizTimer(seconds) {
  const detailDiv = document.getElementById('quiz-detail');
  let remaining = seconds;

  const timerSpan = document.createElement('p');
  timerSpan.id = 'quiz-timer';
  detailDiv.prepend(timerSpan);

  if (quizTimerId) clearInterval(quizTimerId);

  function updateTimerText() {
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    const formatted = `${mins}:${secs.toString().padStart(2, '0')}`;
    timerSpan.textContent = `Time left: ${formatted}`;
  }

  updateTimerText();

  quizTimerId = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      clearInterval(quizTimerId);
      quizTimerId = null;
      timerSpan.textContent = 'Time up!';
      const form = document.getElementById('quiz-form');
      if (form) submitQuizAttempt(new Event('submit'));
    } else {
      updateTimerText();
    }
  }, 1000);
}
