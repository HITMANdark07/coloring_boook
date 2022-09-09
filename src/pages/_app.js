import "../styles/globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../firebase/config";

export const app = initializeApp(firebaseConfig);
function MyApp({ Component, pageProps }) {
  return (
    <>
      <ToastContainer />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
