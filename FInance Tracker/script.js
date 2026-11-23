let allTransactions = [];



async function login() {

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {

        alert("Please enter email and password.");
        return;

    }

    const res = await fetch("http://127.0.0.1:8000/login", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            email,
            password
        })

    });

    const data = await res.json();

    if (data.user_id) {

        localStorage.setItem("user_id", data.user_id);

        alert("Login Successful");

        window.location.href = "home.html";

    } else {

        alert(data.detail || "Login Failed");

    }

}

async function register() {

    const email = document.getElementById("regEmail").value.trim();

    const password = document.getElementById("regPassword").value.trim();

    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    if (!email || !password || !confirmPassword) {

        alert("Please fill all fields.");

        return;

    }

    if (password !== confirmPassword) {

        alert("Passwords do not match.");

        return;

    }

    const res = await fetch("http://127.0.0.1:8000/register", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            email,
            password

        })

    });

    const data = await res.json();

    alert(data.message || data.detail);

    if (res.ok) {

        window.location.href = "login.html";

    }

}

function showSection(section) {

    const pages = [
        "dashboard",
        "expense",
        "income",
        "budget",
        "history"
    ];

    pages.forEach(page => {
        document.getElementById(page).classList.add("hidden");
    });

    document.getElementById(section).classList.remove("hidden");

    if (section === "expense") {
        loadExpenses();
    }

    if (section === "income") {
        loadIncome();
    }

    if (section === "budget") {
        loadBudget();
    }

    if (section === "history") {
        loadHistory();
    }

}



async function loadDashboard() {

    const id = localStorage.getItem("user_id");

    if (!id) return;

    const month = new Date().getMonth() + 1;

    const res = await fetch(
        `http://127.0.0.1:8000/dashboard/${id}/${month}`
    );

    const data = await res.json();

    document.getElementById("totalIncome").innerText = data.income;
    document.getElementById("totalExpense").innerText = data.expense;
    document.getElementById("savings").innerText = data.savings;

}



async function saveExpense() {

    const amount = document.getElementById("expAmount").value.trim();

    const category = document.getElementById("expCategory").value.trim();

    const date = document.getElementById("expDate").value;

    const description = document.getElementById("expDesc").value.trim();

    if (!amount || !category || !date) {

        alert("Please fill all fields.");
        return;

    }

    const res = await fetch(
        "http://127.0.0.1:8000/add-expense",
        {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                user_id: localStorage.getItem("user_id"),

                amount,

                category,

                date,

                description

            })

        }
    );

    const data = await res.json();

    alert(data.message);

    document.getElementById("expAmount").value = "";
    document.getElementById("expCategory").value = "";
    document.getElementById("expDate").value = "";
    document.getElementById("expDesc").value = "";

    loadExpenses();
    loadDashboard();
    loadBudget();

}



async function loadExpenses() {

    const id = localStorage.getItem("user_id");

    const res = await fetch(
        `http://127.0.0.1:8000/transactions/${id}`
    );

    const data = await res.json();

    let html = "";

    data.expenses.forEach(expense => {

        html += `

        <tr>

            <td>${expense.description || "-"}</td>

            <td>₹${expense.amount}</td>

            <td>${expense.category}</td>

            <td>${expense.date}</td>

        </tr>

        `;

    });

    document.getElementById("expenseTable").innerHTML = html;

}

async function saveIncome() {

    const amount = document.getElementById("incAmount").value.trim();

    const source = document.getElementById("incSource").value.trim();

    const date = document.getElementById("incDate").value;

    const description = document.getElementById("incDesc").value.trim();

    if (!amount || !source || !date) {

        alert("Please fill all fields.");

        return;

    }

    const res = await fetch(

        "http://127.0.0.1:8000/add-income",

        {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                user_id: localStorage.getItem("user_id"),

                amount,

                source,

                frequency: "Monthly",

                date,

                description

            })

        }

    );

    const data = await res.json();

    alert(data.message);

    document.getElementById("incAmount").value = "";

    document.getElementById("incSource").value = "";

    document.getElementById("incDate").value = "";

    document.getElementById("incDesc").value = "";

    loadIncome();

    loadDashboard();

}



async function loadIncome() {

    const id = localStorage.getItem("user_id");

    const res = await fetch(`http://127.0.0.1:8000/transactions/${id}`);

    const data = await res.json();

    let html = "";

    data.income.forEach(income => {

        html += `

        <tr>

            <td>${income.description || "-"}</td>

            <td>₹${income.amount}</td>

            <td>${income.source}</td>

            <td>${income.date}</td>

        </tr>

        `;

    });

    document.getElementById("incomeTable").innerHTML = html;

}



async function saveBudget() {

    const category = document.getElementById("budgetCategory").value.trim();

    const amount = document.getElementById("budgetAmount").value.trim();

    const month = new Date().getMonth() + 1;

    if (!category || !amount) {

        alert("Please fill all fields.");

        return;

    }

    const res = await fetch(

        "http://127.0.0.1:8000/set-budget",

        {

            method: "POST",

            headers: {

                "Content-Type":"application/json"

            },

            body: JSON.stringify({

                user_id: localStorage.getItem("user_id"),

                category,

                month,

                amount

            })

        }

    );

    const data = await res.json();

    alert(data.message);

    document.getElementById("budgetCategory").value = "";

    document.getElementById("budgetAmount").value = "";

    loadBudget();

}



async function loadBudget() {

    const id = localStorage.getItem("user_id");

    if (!id) return;

    const res = await fetch(`http://127.0.0.1:8000/budget/${id}`);

    const data = await res.json();

    let cards = "";

    let rows = "";

    data.forEach(item => {

        let percent = item.percent;

        if (percent > 100) {

            percent = 100;

        }

        if (item.percent >= 100) {

            alert(`Budget exceeded for ${item.category}`);

        }

        cards += `

        <div style="margin-bottom:18px">

            <b>${item.category}</b><br>

            Budget : ₹${item.amount}<br>

            Spent : ₹${item.spent}<br>

            Remaining : ₹${item.remaining}

            <div style="height:10px;background:#ddd;border-radius:8px;margin-top:8px">

                <div style="height:10px;width:${percent}%;background:#1f3c88;border-radius:8px"></div>

            </div>

        </div>

        `;

        rows += `

        <tr>

            <td>${item.category}</td>

            <td>₹${item.amount}</td>

        </tr>

        `;

    });

    document.getElementById("budgetList").innerHTML = cards;

    if(document.getElementById("budgetTable")){

        document.getElementById("budgetTable").innerHTML = rows;

    }

}

async function loadHistory() {

    filterHistory("all");

}

async function filterHistory(type) {

    const id = localStorage.getItem("user_id");

    if (!id) return;

    const res = await fetch(`http://127.0.0.1:8000/transactions/${id}`);

    const data = await res.json();

    allTransactions = [];

    if (type === "all" || type === "expense") {

        data.expenses.forEach(e => {

            allTransactions.push({

                id: e.id,
                date: e.date,
                type: "Expense",
                category: e.category,
                amount: -Number(e.amount)

            });

        });

    }

    if (type === "all" || type === "income") {

        data.income.forEach(i => {

            allTransactions.push({

                id: i.id,
                date: i.date,
                type: "Income",
                category: i.source,
                amount: Number(i.amount)

            });

        });

    }

    displayHistory(allTransactions);

}



function displayHistory(list) {

    let html = "";

    list.forEach(item => {

        html += `

        <tr>

            <td>${item.date}</td>

            <td>${item.type}</td>

            <td>${item.category}</td>

            <td>₹${item.amount}</td>

            <td>

                <button onclick="deleteTransaction('${item.type}',${item.id})">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

    document.getElementById("historyTable").innerHTML = html;

}



function searchHistory() {

    const value = document.getElementById("searchInput").value.toLowerCase();

    const filtered = allTransactions.filter(item =>

        item.category.toLowerCase().includes(value)

    );

    displayHistory(filtered);

}



function sortHistory(order) {

    let sorted = [...allTransactions];

    sorted.sort((a, b) => {

        if (order === "latest") {

            return new Date(b.date) - new Date(a.date);

        }

        return new Date(a.date) - new Date(b.date);

    });

    displayHistory(sorted);

}




async function deleteTransaction(type, id) {

    if (!confirm("Delete this transaction?")) return;

    await fetch(

        `http://127.0.0.1:8000/delete/${type}/${id}`,

        {

            method: "DELETE"

        }

    );

    alert("Deleted Successfully");

    loadHistory();

    loadExpenses();

    loadIncome();

    loadBudget();

    loadDashboard();

}




async function calculateDashboard() {

    const id = localStorage.getItem("user_id");

    if (!id) return;

    const res = await fetch(

        `http://127.0.0.1:8000/transactions/${id}`

    );

    const data = await res.json();

    let totalIncome = 0;

    let totalExpense = 0;

    data.income.forEach(item => {

        totalIncome += Number(item.amount);

    });

    data.expenses.forEach(item => {

        totalExpense += Number(item.amount);

    });

    document.getElementById("totalIncome").innerText = totalIncome;

    document.getElementById("totalExpense").innerText = totalExpense;

    document.getElementById("savings").innerText = totalIncome - totalExpense;

}




function logout() {

    localStorage.removeItem("user_id");

    window.location.href = "login.html";

}


window.onload = function () {

    if (document.getElementById("totalIncome")) {

      window.onload=function(){

    if(document.getElementById("totalIncome")){

        loadDashboard();

    }

}

    }

};