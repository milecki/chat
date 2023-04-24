"use client";
import Image from "next/image";
import useStateRef from "react-usestateref";
import { useState, useCallback } from "react";
import bg from "../public/1c.png";
import userPic from "../public/user.png";
import botPic from "../public/bot.png";

const MessageType = {
  Me: 0,
  Bot: 1,
};

function useInput(initialValue) {
  const [value, setValue] = useState(initialValue);

  const onChange = (e) => {
    setValue(e.target.value);
  };

  const clear = () => {
    setValue("");
  };

  return {
    value,
    onChange,
    clear,
  };
}

const ChatMessage = ({ text, from }) => {
  const isFromMe = from === MessageType.Me;
  const messageClass = isFromMe ? "bg-white" : "bg-purple-50";
  const imageSrc = isFromMe ? userPic : botPic;
  const imageAlt = isFromMe ? "User" : "Bot";

  return (
    <div
      className={`${messageClass} p-4 rounded-lg flex gap-4 items-center whitespace-pre-wrap`}
    >
      <Image src={imageSrc} alt={imageAlt} width={40} />
      <p className="text-gray-700">{text}</p>
    </div>
  );
};

const ChatInput = ({ onSend, disabled }) => {
  const input = useInput("");

  const sendInput = useCallback(() => {
    onSend(input.value);
    input.clear();
  }, [input, onSend]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.keyCode === 13) {
        sendInput();
      }
    },
    [sendInput]
  );

  return (
    <div className="bg-white rounded-lg flex justify-center border-2 border-blue-700">
      <input
        value={input.value}
        onChange={input.onChange}
        className="w-full py-2 px-3 text-gray-800 rounded-lg focus:outline-none"
        type="text"
        placeholder="Ask me anything"
        disabled={disabled}
        onKeyDown={(event) => handleKeyDown(event)}
      />
      {disabled && (
        <svg
          aria-hidden="true"
          className="mt-1 w-8 h-8 mr-2 text-gray-200 animate-spin fill-blue-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
      )}
      {!disabled && (
        <button
          onClick={() => sendInput()}
          className="p-2 rounded-md text-blue-700 bottom-1.5 right-1"
        >
          <svg
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-gray-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            ></path>
          </svg>
        </button>
      )}
    </div>
  );
};

export default function Home() {
  const [messages, setMessages, messagesRef] = useStateRef([]);

  const [loading, setLoading] = useState(false);

  const callApi = async (input) => {
    setLoading(true);

    const myMessage = {
      text: input,
      from: MessageType.Me,
      key: new Date().getTime(),
    };

    setMessages([...messagesRef.current, myMessage]);

    const conversationHistory = messagesRef.current
      .map((msg) => (msg.from === MessageType.Me ? "User:" : "Bot:") + msg.text)
      .join("\n");

    const response = await fetch("/api/generate-answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversationHistory,
        newMessage: `User: ${input}`,
      }),
    }).then((response) => response.json());
    setLoading(false);

    if (response.text) {
      const botResponse = response.text.replace(/^Bot:/, "").trim();
      const botMessage = {
        text: botResponse,
        from: MessageType.Bot,
        key: new Date().getTime(),
      };
      setMessages([...messagesRef.current, botMessage]);
    } else {
      // Show error
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <div className="bg-gradient-to-b from-blue-500 to-purple-500 h-300 flex items-center justify-center">
          <div className="container mx-auto px-4 lg:px-0 lg:max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
              <div className="p-4 flex flex-col justify-center">
                <h1 className="text-3xl font-bold mb-4">
                  Revolutionize Your Business Conversations with EngiChat!
                </h1>
                <p>
                  Empower your customers with EngiChat's cutting-edge AI
                  technology, simplifying product searches and providing
                  personalized recommendations for a seamless shopping
                  experience
                </p>
                <div>
                  <button
                    type="button"
                    className="mt-3 stext-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
                  >
                    Experience EngiChat Today
                  </button>
                </div>
              </div>
              <div className="px-4 flex justify-center items-center">
                <Image
                  src={bg}
                  alt="Your image"
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        

        <main className="relative max-w-2xl mx-auto">
          <div className="mt-10 px-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.key} text={msg.text} from={msg.from} />
            ))}
            {messages.length === 0 && (
              <p className="text-center text-gray-400">I am at your service</p>
            )}
          </div>
          <div className="sticky bottom-0 w-full pt-10 px-4 mb-3">
        <ChatInput onSend={(input) => callApi(input)} disabled={loading} />
      </div>
        </main>
      </div>
      
      <footer className="w-full bg-purple-600 text-white text-center py-4">
        <p>Copyright &copy; 2023 by EngiChat</p>
      </footer>
    </div>
  );
}
