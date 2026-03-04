
function sendMessage() {
    const input = document.getElementById("userInput");
    const messageText = input.value.trim();
    const chatMessages = document.getElementById("chatMessages");

    if (messageText === "") return;

    // Mensaje usuario
    const userMessage = document.createElement("div");
    userMessage.classList.add("message", "user");
    userMessage.textContent = messageText;
    chatMessages.appendChild(userMessage);

    input.value = "";

    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Simular respuesta automática
    setTimeout(() => {
        const botMessage = document.createElement("div");
        botMessage.classList.add("message", "bot");
        botMessage.textContent = getAutoResponse(messageText);
        chatMessages.appendChild(botMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 800);
}

function getAutoResponse(text) {
    text = text.toLowerCase();

    if (text.includes("hola")) {
        return "¡Hola! 👋 Soy Smart IA. ¿En qué puedo ayudarte hoy?";
    } 
    else if (text.includes("precio")) {
        return "Nuestros precios dependen del servicio que necesites. ¿Podrías darme más detalles?";
    }
    else if (text.includes("servicio")) {
        return "Ofrecemos soluciones en tecnología, automatización y desarrollo web.";
    }
    else if (text.includes("gracias")) {
        return "¡Siempre es un placer ayudarte! 😊";
    }
    else {
        return "Estoy analizando tu mensaje 🤖... pronto tendré más funcionalidades inteligentes.";
    }
}
