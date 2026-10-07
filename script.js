const API_BASE = "https://inai-col1.fishrungames.com";
const ADS_URL = API_BASE + "/ads";

const adsList = document.getElementById("adsList");
const loader = document.getElementById("loader");
const errorBlock = document.getElementById("errorBlock");
const adForm = document.getElementById("adForm");
const formAlert = document.getElementById("formAlert");
const submitBtn = document.getElementById("submitBtn");
const refreshBtn = document.getElementById("refreshBtn");

// Загрузка объявлений (GET)

async function loadAds() {
    loader.classList.remove("d-none");
    errorBlock.classList.add("d-none");
    adsList.innerHTML = "";

    try {
        const response = await fetch(ADS_URL);
        if (!response.ok) {
            throw new Error("Ошибка сервера: " + response.status);
        }
        const data = await response.json();
        renderAds(data.items);
    } catch (err) {
        errorBlock.textContent = "Не удалось загрузить объявления: " + err.message;
        errorBlock.classList.remove("d-none");
    } finally {
        loader.classList.add("d-none");
    }
}

// Отрисовка карточек
function renderAds(items) {
    if (!items || items.length === 0) {
        adsList.innerHTML = '<p class="text-muted">Объявлений пока нет.</p>';
        return;
    }

    items.forEach(function (ad) {
        const col = document.createElement("div");
        col.className = "col-sm-6 col-md-6";

        let imageHTML;
        if (ad.image_url) {
            const imgSrc = API_BASE + ad.image_url;
            imageHTML = '<img src="' + imgSrc + '" class="card-img-top" alt="' + escapeHTML(ad.title) + '">';
        } else {
            imageHTML = '<div class="no-image-placeholder">Нет изображения</div>';
        }

        col.innerHTML =
            '<div class="card ad-card h-100">' +
            imageHTML +
            '<div class="card-body">' +
            '<h6 class="card-title">' + escapeHTML(ad.title) + '</h6>' +
            '<p class="card-text text-muted small">' + escapeHTML(ad.description) + '</p>' +
            '<p class="price mt-auto mb-0">' + formatPrice(ad.price) + ' сом</p>' +
            '</div>' +
            '</div>';

        adsList.appendChild(col);
    });
}


// Отправка объявления (POST)

adForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    formAlert.classList.add("d-none");

    const formData = new FormData(adForm);

    submitBtn.disabled = true;
    submitBtn.textContent = "Отправка...";

    try {
        const response = await fetch(ADS_URL, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Ошибка сервера: " + response.status);
        }

        const result = await response.json();

        showFormAlert("success", "Объявление «" + escapeHTML(result.title) + "» успешно добавлено!");
        adForm.reset();

        // Перезагружаем список
        loadAds();
    } catch (err) {
        showFormAlert("danger", "Не удалось отправить: " + err.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Отправить";
    }
});

// Кнопка обновления
refreshBtn.addEventListener("click", loadAds);


// Утилиты

function showFormAlert(type, message) {
    formAlert.className = "mt-3 alert alert-" + type;
    formAlert.textContent = message;
    formAlert.classList.remove("d-none");
}

function escapeHTML(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function formatPrice(price) {
    if (price == null) return "0";
    return Number(price).toLocaleString("ru-RU");
}

// Загружаем при открытии страницы
loadAds();