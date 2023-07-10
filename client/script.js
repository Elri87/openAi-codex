import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form"); //form is the id name but form in the html does not have a id so we use form as it't the only one we have
const chatContainer = document.querySelector("#chat_container"); //here we using the #id

let loadInterval;

//function to load the messages ... this will load 3 dots ... while it thinks
function loader(element) {
  element.textContent = ""; //empty string to make sure its empty at the start
  //function that accepts another callback function, every 300sec we want to add another dot
  loadInterval = setInterval(() => {
    element.textContent += ".";
    //if the loader has reached 3 dots we want to reset it
    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

//function so that the response is typed out for a better user experience
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index); //chartAt will get a specific character under index in the text that AI is going to return
      index++; //increment index
    } else {
      //if we have reached the end of the text
      clearInterval(interval);
    }
  }, 20);
}

//function to create a unique id for every AI response.
//Using current date and time is always unique so we will use this here
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16); //16 charactors

  return `id-${timestamp}-${hexadecimalString}`;
}

//function to add a stripe for each chat (the color stripe you see on scree)
//using template string so we can create spaces
function chatStripe(isAi, value, uniqueId) {
  return `
  <div class="wrapper ${isAi && "ai"}">
  <div class="chat">
  <div class="profile">
  <img src="${isAi ? bot : user}" alt="${isAi ? "bot" : "user"}" />
  </div>
  <div class="message" id=${uniqueId}>${value}
  </div>
  </div>
  </div>
  `;
}

//function for handlesubmit, this will trigger the ai for the response
const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form); //see line 4

  //user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt")); //false because it's the user not the AI
  //clear the input
  form.reset();

  //bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId); //empty string as it will fill it up from the function loader

  chatContainer.scrollTop = chatContainer.scrollHeight; //put new message in view

  const messageDiv = document.getElementById(uniqueId); //passing in the unique id
  loader(messageDiv);
  //fetch data from the server - get bot's response
  const response = await fetch("https://ai-chatbox-codex.onrender.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });
  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json(); //actual response from backend
    const parsedData = data.bot.trim();

    //console.log({ parsedData });

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
