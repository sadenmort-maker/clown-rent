// --- ЛОГИКА КОРЗИНЫ ---
let cart = [];

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartList = document.getElementById('cart-items-list');
    const cartTotal = document.getElementById('cart-total');

    if (!cartCount) return; // Если мы не на главной

    cartCount.innerText = cart.length;
    
    if (cartList) {
        cartList.innerHTML = '';
        let total = 0;
        cart.forEach((item, index) => {
            total += item.price;
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                ${item.title} 
                <span>${item.price} руб. 
                <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeFromCart(${index})">×</button></span>
            `;
            cartList.appendChild(li);
        });
        cartTotal.innerText = total;
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

// Слушатель кнопок "В корзину"
document.querySelectorAll('.btn-add-cart').forEach(button => {
    button.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        const title = card.querySelector('.product-title').innerText;
        const price = parseInt(card.querySelector('.product-price').innerText);
        
        cart.push({ title, price });
        
        // Анимация кнопки
        const originalText = e.target.innerText;
        e.target.innerText = '✅ Добавлено!';
        e.target.classList.replace('btn-success', 'btn-warning');
        setTimeout(() => {
            e.target.innerText = originalText;
            e.target.classList.replace('btn-warning', 'btn-success');
        }, 1000);

        updateCartUI();
    });
});

// --- ВАЛИДАЦИЯ ФОРМЫ ОБРАТНОЙ СВЯЗИ ---
const feedbackForm = document.getElementById('feedback-form');
if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const status = document.getElementById('form-status');
        status.innerHTML = '<div class="alert alert-success">🤡 Спасибо! Мы скоро свяжемся с вами.</div>';
        feedbackForm.reset();
    });
}

// --- ЛОГИКА АДМИН-ПАНЕЛИ (CRUD) ---
const btnAdminAdd = document.getElementById('btn-admin-add');
const adminTable = document.querySelector('#admin-product-table tbody');

if (btnAdminAdd && adminTable) {
    // Удаление
    adminTable.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-admin-delete')) {
            if(confirm('Вы уверены, что хотите списать этот костюм?')) {
                e.target.closest('tr').remove();
            }
        }
    });

    // Добавление
    btnAdminAdd.addEventListener('click', () => {
        const nameInput = document.getElementById('admin-new-name');
        const priceInput = document.getElementById('admin-new-price');

        if (nameInput.value && priceInput.value) {
            const newId = adminTable.rows.length + 1;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${newId}</td>
                <td>${nameInput.value}</td>
                <td>${priceInput.value}.0 руб.</td>
                <td class="text-end px-4">
                    <button class="btn btn-outline-danger btn-sm btn-admin-delete">Удалить</button>
                </td>
            `;
            adminTable.appendChild(row);
            nameInput.value = '';
            priceInput.value = '';
        } else {
            alert('Заполните все поля!');
        }
    });
}

// Плавная прокрутка для навигации
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// --- ЛОГИКА АВТОРИЗАЦИИ ---
const loginBtn = document.getElementById('login-btn');
const authForm = document.getElementById('auth-form');

// Функция для изменения интерфейса после успешного входа
function updateLoginUI(email) {
    if (loginBtn) {
        // Меняем текст кнопки и цвет
        loginBtn.innerHTML = `👤 ${email.split('@')[0]} (Выйти)`;
        loginBtn.classList.replace('btn-outline-danger', 'btn-danger');
        
        // Отключаем открытие модального окна
        loginBtn.removeAttribute('data-bs-toggle'); 
        loginBtn.removeAttribute('data-bs-target');
        
        // Вешаем на кнопку функцию выхода (Logout)
        loginBtn.onclick = function(e) {
            e.preventDefault();
            if (confirm('Выйти из аккаунта?')) {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userName');
                location.reload(); // Обновляем страницу, чтобы вернуть кнопку "Вход"
            }
        };
    }
}

// 1. При загрузке страницы проверяем, залогинен ли пользователь
window.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userName = localStorage.getItem('userName');
    if (isLoggedIn === 'true' && userName) {
        updateLoginUI(userName);
    }
});

// 2. Обработка отправки формы входа
if (authForm) {
    authForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;

        if (email && pass.length >= 4) {
            // Сохраняем данные сессии в localStorage
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', email);

            // Скрываем модальное окно Bootstrap
            const modalEl = document.getElementById('loginModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            modalInstance.hide();

            // Обновляем кнопку в шапке
            updateLoginUI(email);
            
            // Очищаем форму
            authForm.reset();
            alert(`Успешный вход! Добро пожаловать, ${email}`);
        }
    });
}