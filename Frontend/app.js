const API_BASE = 'http://localhost:8082/api';

window.onload = function() {
  loadQuizList();
  addSearch();
  showLoginStatus();
};

let loggedInUsername = null;

// ---- UI Helpers ----
function showLoginStatus() {
  const header = document.querySelector('h1');
  if (loggedInUsername)
    header.innerHTML = `Quiz Platform <span style="font-size:medium;float:right">User: ${loggedInUsername} <button onclick="logout()">Logout</button></span>`;
  else
    header.innerHTML = `Quiz Platform <span style="font-size:medium;float:right"><button onclick="showLogin()">Login</button></span>`;
}

function logout() {
  loggedInUsername = null;
  loadQuizList();
  showLoginStatus();
}

function showLogin() {
  document.getElementById('main-content').innerHTML = `
    <form id="login-form">
      <input name="username" placeholder="Username" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  `;
  document.getElementById('login-form').onsubmit = function(e){
    e.preventDefault();
    loggedInUsername = new FormData(this).get('username');
    loadQuizList();
    showLoginStatus();
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

// ---- Quiz Detail and Attempt ----
function showQuizDetail(quizId) {
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
    })
    .catch(showError);
}

function loadQuizQuestions(quizId) {
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
      window.attemptQuizInfo = { quizId, questions };
      document.getElementById('quiz-form').onsubmit = submitQuizAttempt;
    }).catch(showError);
}

function submitQuizAttempt(event) {
  event.preventDefault();
  // Use username as demo user, or set userId=1 if not logged in
  const userId = loggedInUsername ? 1 : 1;
  const quizId = window.attemptQuizInfo.quizId;
  const questions = window.attemptQuizInfo.questions;

  fetch(`${API_BASE}/quiz-attempts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      quizId,
      startedAt: new Date().toISOString().slice(0,19)
    })
  })
    .then(res => res.json())
    .then(attempt => {
      let correct = 0;
      let promises = [];
      questions.forEach(q => {
        const chosen = document.querySelector(`input[name="q${q.id}"]:checked`);
        if (chosen) {
          const chosenOpt = chosen.value;
          if (chosenOpt === q.correctOption) correct++;
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
        showQuizResult(correct, questions.length);
      });
    })
    .catch(showError);
}

function showQuizResult(correct, total) {
  document.getElementById('quiz-detail').innerHTML =
    `<h2>Quiz Submitted!</h2>
     <p>Your Score: <strong>${correct}/${total}</strong></p>
     <button onclick="loadQuizList()">Back to Quizzes</button>`;
}

// ---- Admin Management ----
function showAdminPanel() {
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
  // Form HTML is the same
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
